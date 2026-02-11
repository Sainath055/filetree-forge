/**
 * Apply changes command
 * Applies parsed tree to filesystem with safety checks
 * Can be called from Markdown tree or Preview document
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

export class ApplyChangesCommand {
  /**
   * Apply changes from current document or most recent preview
   */
  static async execute(): Promise<void> {
    try {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage("No active editor");
        return;
      }

      // Check if we're in a preview document
      if (
        editor.document.languageId === "plaintext" &&
        editor.document.getText().startsWith("PREVIEW MODE")
      ) {
        // We're in preview - need to find the original markdown document
        // Get the most recent tree from state
        await this.applyFromState();
        return;
      }

      // We're in markdown document - parse and apply
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

      await this.executeWithTree(editor, newTree);
    } catch (error) {
      vscode.window.showErrorMessage(
        `Apply failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Apply from state (when called from preview)
   */
  private static async applyFromState(): Promise<void> {
    // Find the markdown document with tree
    const editors = vscode.window.visibleTextEditors;
    let treeEditor: vscode.TextEditor | undefined;

    for (const ed of editors) {
      if (
        ed.document.languageId === "markdown" &&
        ed.document.getText().includes("<!-- FILETREEFORGE FORMAT")
      ) {
        treeEditor = ed;
        break;
      }
    }

    if (!treeEditor) {
      vscode.window.showErrorMessage(
        "Cannot find the tree document. Please switch to the Markdown tree and try again.",
      );
      return;
    }

    // Parse the tree document
    const content = treeEditor.document.getText();
    const parseResult = MarkdownParser.parse(content);

    if (!parseResult.tree) {
      vscode.window.showErrorMessage("Failed to parse tree document");
      return;
    }

    await this.executeWithTree(treeEditor, parseResult.tree);
  }

  /**
   * Apply changes with a provided tree
   */
  static async executeWithTree(
    editor: vscode.TextEditor,
    newTree: TreeNode,
  ): Promise<void> {
    try {
      const config = vscode.workspace.getConfiguration("filetreeforge");
      const ignorePatterns = config.get<string[]>("ignorePatterns") || [];
      const confirmBeforeApply = config.get<boolean>(
        "confirmBeforeApply",
        true,
      );

      // Get last applied tree
      let oldTree = TreeStateManager.getLastAppliedTree();

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
          vscode.window.showInformationMessage(
            "Please regenerate the tree from the filesystem to get a fresh baseline.",
          );
          return;
        }

        // If "Continue Anyway", update baseline to current filesystem
        oldTree = currentFilesystemTree;
      }

      // Generate diff
      const diff = DiffEngine.diff(oldTree, newTree);

      if (DiffEngine.isEmpty(diff)) {
        vscode.window.showInformationMessage("No changes detected");
        return;
      }

      // Preview operations
      const operations = await ApplyEngine.applyDiff(
        diff,
        oldTree,
        newTree,
        workspaceRoot,
        true,
      );

      // Show confirmation if enabled
      if (confirmBeforeApply) {
        const hasDeletes = operations.some((op) => op.type === "delete");
        const message = hasDeletes
          ? `⚠️ This will DELETE ${operations.filter((op) => op.type === "delete").length} item(s) and perform ${operations.length} total operations. Continue?`
          : `Apply ${operations.length} operation(s) to filesystem?`;

        const answer = await vscode.window.showWarningMessage(
          message,
          { modal: true },
          "Apply",
          "Cancel",
        );

        if (answer === "Cancel" || !answer) {
          return;
        }
      }

      // Apply changes
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Applying changes to filesystem...",
          cancellable: false,
        },
        async () => {
          await ApplyEngine.applyDiff(
            diff,
            oldTree!,
            newTree,
            workspaceRoot,
            false,
          );
        },
      );

      // Update last applied tree
      TreeStateManager.setLastAppliedTree(newTree);

      // Close temporary documents
      await TreeStateManager.closeTemporaryDocuments();

      vscode.window.showInformationMessage(
        `✅ Applied ${operations.length} operation(s) successfully`,
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        `Apply failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
