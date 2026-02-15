/**
 * Generate tree command - creates clean tree without markers
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
   * Generate clean tree from filesystem
   */
  static async execute(resource?: vscode.Uri): Promise<void> {
    try {
      const config = vscode.workspace.getConfiguration("filetreeforge");
      const ignorePatterns = config.get<string[]>("ignorePatterns") || [];

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

      // Store baseline
      TreeStateManager.setLastAppliedTree(tree);
      TreeStateManager.setLastGeneratedRootPath(workspaceRoot);

      // Serialize to clean Markdown (no markers)
      const content = TreeSerializer.toMarkdown(
        tree,
        workspaceRoot,
        folderName,
      );

      // Create document
      const doc = await vscode.workspace.openTextDocument({
        content,
        language: "markdown",
      });

      TreeStateManager.registerTemporaryDocument(doc.uri);
      await vscode.window.showTextDocument(doc);

      vscode.window.showInformationMessage(
        `Generated tree with ${this.countNodes(tree)} items`,
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to generate tree: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private static countNodes(tree: TreeNode): number {
    let count = tree.children ? tree.children.length : 0;
    if (tree.children) {
      for (const child of tree.children) {
        count += this.countNodes(child);
      }
    }
    return count;
  }
}
