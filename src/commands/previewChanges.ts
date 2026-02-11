/**
 * Preview changes command
 * Shows diff with filesystem drift detection and UUID warnings
 */

import * as vscode from "vscode";
import { TreeNode } from "../types";
import { MarkdownParser } from "../parser/markdownParser";
import { DiffEngine } from "../diff/diffTrees";
import { ApplyEngine } from "../fs/applyDiff";
import { PathUtils } from "../utils/pathUtils";
import { TreeStateManager } from "./stateManager";
import { scanDirectory } from "../fs/scanTree";
import { DriftDetector } from "../fs/driftDetector";

export class PreviewChangesCommand {
  /**
   * Preview changes from current document with drift detection
   */
  static async execute(): Promise<void> {
    try {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage("No active editor");
        return;
      }

      const content = editor.document.getText();

      // Parse current content
      const parseResult = MarkdownParser.parse(content);

      if (!parseResult.tree) {
        const errorMsg = parseResult.errors
          .map((e) => (e.line ? `Line ${e.line}: ${e.message}` : e.message))
          .join("\n");
        vscode.window.showErrorMessage(`Parse errors:\n${errorMsg}`);
        return;
      }

      const newTree = parseResult.tree;

      // Get last applied tree
      const oldTree = TreeStateManager.getLastAppliedTree();
      if (!oldTree) {
        vscode.window.showWarningMessage(
          "No baseline tree found. Generate a tree first.",
        );
        return;
      }

      // CRITICAL: Re-scan filesystem to detect drift
      const workspaceRoot =
        TreeStateManager.getLastGeneratedRootPath() ||
        PathUtils.getWorkspaceRoot();
      const config = vscode.workspace.getConfiguration("filetreeforge");
      const ignorePatterns = config.get<string[]>("ignorePatterns") || [];

      const currentFilesystemTree = await scanDirectory(
        workspaceRoot,
        workspaceRoot,
        ignorePatterns,
      );

      // Check for filesystem drift
      const drift = DriftDetector.detectDrift(oldTree, currentFilesystemTree);

      if (drift.hasDrift) {
        // Show drift warning
        const driftReport = DriftDetector.formatDriftReport(drift);

        const choice = await vscode.window.showWarningMessage(
          "Filesystem has changed since last apply.",
          { modal: true, detail: driftReport },
          "Refresh Baseline",
          "Continue Anyway",
          "Cancel",
        );

        if (choice === "Cancel" || !choice) {
          return;
        }

        if (choice === "Refresh Baseline") {
          // Regenerate tree from current filesystem
          vscode.window.showInformationMessage(
            "Please regenerate the tree from the filesystem to get a fresh baseline.",
          );
          return;
        }

        // If "Continue Anyway", proceed with drift warning acknowledged
      }

      // Check for potential UUID issues (nodes with same name but different/missing IDs)
      const uuidWarnings = this.checkForUUIDIssues(oldTree, newTree);
      if (uuidWarnings.length > 0) {
        const warningMsg = uuidWarnings.join("\n");
        const proceed = await vscode.window.showWarningMessage(
          "⚠️ UUID Issues Detected",
          { modal: true, detail: warningMsg },
          "Continue",
          "Cancel",
        );

        if (proceed !== "Continue") {
          return;
        }
      }

      // Generate diff
      const diff = DiffEngine.diff(oldTree, newTree);

      if (DiffEngine.isEmpty(diff)) {
        vscode.window.showInformationMessage("No changes detected");
        return;
      }

      // Generate preview operations
      const operations = await ApplyEngine.applyDiff(
        diff,
        oldTree,
        newTree,
        workspaceRoot,
        true,
      );

      // Show preview in new document with header
      const preview = this.formatPreview(operations, workspaceRoot);
      const doc = await vscode.workspace.openTextDocument({
        content: preview,
        language: "plaintext",
      });

      // Register as temporary document
      TreeStateManager.registerTemporaryDocument(doc.uri);

      await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
    } catch (error) {
      vscode.window.showErrorMessage(
        `Preview failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Check for UUID issues (same name but different/missing IDs)
   */
  private static checkForUUIDIssues(
    oldTree: TreeNode,
    newTree: TreeNode,
  ): string[] {
    const warnings: string[] = [];
    const oldNodesByName = new Map<string, TreeNode>();
    const newNodesByName = new Map<string, TreeNode>();

    // Flatten both trees
    this.flattenByName(oldTree, oldNodesByName);
    this.flattenByName(newTree, newNodesByName);

    // Check for potential renames without UUID preservation
    for (const [name, newNode] of newNodesByName) {
      // Find old nodes with similar names
      for (const [oldName, oldNode] of oldNodesByName) {
        // If names are similar but IDs are different
        if (oldName !== name && oldNode.type === newNode.type) {
          // Check if it looks like a rename
          const similarity = this.calculateSimilarity(oldName, name);
          if (similarity > 0.6 && oldNode.id !== newNode.id) {
            warnings.push(
              `⚠️ "${oldName}" → "${name}" has different UUID.\n` +
                `   This will be treated as DELETE + CREATE.\n` +
                `   To rename: keep the same UUID (<!-- id: ${oldNode.id.substring(0, 8)} -->)`,
            );
          }
        }
      }
    }

    return warnings;
  }

  /**
   * Flatten tree by name for comparison
   */
  private static flattenByName(
    node: TreeNode,
    map: Map<string, TreeNode>,
  ): void {
    map.set(node.name, node);
    if (node.children) {
      for (const child of node.children) {
        this.flattenByName(child, map);
      }
    }
  }

  /**
   * Calculate string similarity (0-1)
   */
  private static calculateSimilarity(a: string, b: string): number {
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;

    if (longer.length === 0) {
      return 1.0;
    }

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   */
  private static levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Format preview with header
   */
  private static formatPreview(
    operations: any[],
    workspaceRoot: string,
  ): string {
    let preview = "PREVIEW MODE\n";
    preview += "────────────\n";
    preview += "✔ Ctrl + Enter → Apply Changes\n";
    preview += "✖ Esc → Cancel\n\n";
    preview += "═══════════════════════════════════════\n\n";

    preview += ApplyEngine.formatOperationsForDisplay(
      operations,
      workspaceRoot,
    );

    return preview;
  }
}
