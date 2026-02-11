/**
 * Generate tree command
 * Scans filesystem and generates Markdown tree representation
 */

import * as vscode from "vscode";
import * as path from "path";
import { TreeNode } from "../types";
import { PathUtils } from "../utils/pathUtils";
import { TreeSerializer } from "../parser/treeSerializer";
import { scanDirectory } from "../fs/scanTree";
import { TreeStateManager } from "./stateManager";

export class GenerateTreeCommand {
  /**
   * Generate tree from filesystem
   */
  static async execute(resource?: vscode.Uri): Promise<void> {
    try {
      const config = vscode.workspace.getConfiguration("filetreeforge");
      const ignorePatterns = config.get<string[]>("ignorePatterns") || [];

      // Determine root:
      // - Right-click → use selected folder
      // - Command Palette → use workspace root
      let workspaceRoot: string;
      let folderName: string;

      if (resource) {
        workspaceRoot = resource.fsPath;
        folderName = path.basename(workspaceRoot);
      } else {
        workspaceRoot = PathUtils.getWorkspaceRoot();
        folderName = path.basename(workspaceRoot);
      }

      // Scan filesystem
      const tree = await scanDirectory(
        workspaceRoot,
        workspaceRoot,
        ignorePatterns,
      );

      // Store this as the baseline (current filesystem state)
      TreeStateManager.setLastAppliedTree(tree);
      TreeStateManager.setLastGeneratedRootPath(workspaceRoot);

      // Serialize to Markdown with new format
      const content = TreeSerializer.toMarkdown(
        tree,
        workspaceRoot,
        folderName,
      );

      // Create new document
      const doc = await vscode.workspace.openTextDocument({
        content,
        language: "markdown",
      });

      // Register as temporary document
      TreeStateManager.registerTemporaryDocument(doc.uri);

      // Show document
      await vscode.window.showTextDocument(doc);

      vscode.window.showInformationMessage(
        `Generated Markdown tree with ${this.countNodes(tree)} items`,
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to generate tree: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Count total nodes in tree
   */
  private static countNodes(tree: TreeNode): number {
    let count = 1; // Count self

    if (tree.children) {
      for (const child of tree.children) {
        count += this.countNodes(child);
      }
    }

    return count;
  }
}
