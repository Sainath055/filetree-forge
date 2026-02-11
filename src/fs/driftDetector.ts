/**
 * Filesystem drift detection
 * Detects when filesystem has changed outside of the extension
 */

import { TreeNode, FilesystemDriftResult } from "../types";
import { DiffEngine } from "../diff/diffTrees";

export class DriftDetector {
  /**
   * Detect if filesystem has drifted from last applied tree
   */
  static detectDrift(
    lastAppliedTree: TreeNode,
    currentFilesystemTree: TreeNode,
  ): FilesystemDriftResult {
    const diff = DiffEngine.diff(lastAppliedTree, currentFilesystemTree);

    const hasDrift = !DiffEngine.isEmpty(diff);

    const addedFiles: string[] = [];
    const deletedFiles: string[] = [];
    const modifiedFiles: string[] = [];

    // Files created outside the extension
    for (const node of diff.created) {
      const path = this.getNodePath(currentFilesystemTree, node.id);
      if (path) {
        addedFiles.push(path.join("/"));
      }
    }

    // Files deleted outside the extension
    for (const node of diff.deleted) {
      const path = this.getNodePath(lastAppliedTree, node.id);
      if (path) {
        deletedFiles.push(path.join("/"));
      }
    }

    // Files renamed/moved outside the extension
    for (const { from, to } of diff.renamed) {
      const oldPath = this.getNodePath(lastAppliedTree, from.id);
      const newPath = this.getNodePath(currentFilesystemTree, to.id);
      if (oldPath && newPath) {
        modifiedFiles.push(`${oldPath.join("/")} → ${newPath.join("/")}`);
      }
    }

    return {
      hasDrift,
      addedFiles,
      deletedFiles,
      modifiedFiles,
    };
  }

  /**
   * Get path of a node by ID
   */
  private static getNodePath(
    tree: TreeNode,
    targetId: string,
  ): string[] | null {
    return this.findNodePath(tree, targetId, []);
  }

  private static findNodePath(
    node: TreeNode,
    targetId: string,
    currentPath: string[],
  ): string[] | null {
    if (node.id === targetId) {
      return currentPath;
    }

    if (node.children) {
      for (const child of node.children) {
        const found = this.findNodePath(child, targetId, [
          ...currentPath,
          child.name,
        ]);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  /**
   * Format drift report for display
   */
  static formatDriftReport(drift: FilesystemDriftResult): string {
    let report = "⚠️ FILESYSTEM DRIFT DETECTED\n\n";
    report += "The filesystem has changed since last apply:\n\n";

    if (drift.addedFiles.length > 0) {
      report += `ADDED (${drift.addedFiles.length}):\n`;
      for (const file of drift.addedFiles) {
        report += `  + ${file}\n`;
      }
      report += "\n";
    }

    if (drift.deletedFiles.length > 0) {
      report += `DELETED (${drift.deletedFiles.length}):\n`;
      for (const file of drift.deletedFiles) {
        report += `  - ${file}\n`;
      }
      report += "\n";
    }

    if (drift.modifiedFiles.length > 0) {
      report += `MODIFIED (${drift.modifiedFiles.length}):\n`;
      for (const file of drift.modifiedFiles) {
        report += `  ~ ${file}\n`;
      }
      report += "\n";
    }

    report += "Please choose how to proceed.";

    return report;
  }
}
