/**
 * Structure validator
 * Validates that tree structure matches filesystem before operations
 */

import { TreeNode, StructuralMismatch } from "../types";
import * as vscode from "vscode";
import * as path from "path";
import { PathUtils } from "../utils/pathUtils";

export class StructureValidator {
  /**
   * Compare tree structure with actual filesystem
   * Ignores operations, only checks base structure
   */
  static async validate(
    tree: TreeNode,
    workspaceRoot: string,
    ignorePatterns: string[],
  ): Promise<{ valid: boolean; mismatch?: StructuralMismatch }> {
    const expectedPaths = this.getExpectedPaths(tree);
    const actualPaths = await this.scanFilesystem(
      workspaceRoot,
      workspaceRoot,
      ignorePatterns,
    );

    const added = actualPaths.filter((p) => !expectedPaths.includes(p));
    const removed = expectedPaths.filter((p) => !actualPaths.includes(p));

    const valid = added.length === 0 && removed.length === 0;

    if (!valid) {
      return {
        valid: false,
        mismatch: {
          expected: expectedPaths,
          actual: actualPaths,
          added,
          removed,
          modified: [],
        },
      };
    }

    return { valid: true };
  }

  /**
   * Get expected paths from tree (ignoring operation markers)
   */
  private static getExpectedPaths(
    tree: TreeNode,
    prefix: string = "",
  ): string[] {
    const paths: string[] = [];

    if (tree.children) {
      for (const child of tree.children) {
        // Skip nodes marked for creation (they don't exist yet)
        if (child.operation === "create") {
          continue;
        }

        const childPath = prefix ? `${prefix}/${child.name}` : child.name;
        paths.push(childPath);

        if (child.children) {
          paths.push(...this.getExpectedPaths(child, childPath));
        }
      }
    }

    return paths.sort();
  }

  /**
   * Scan actual filesystem
   */
  private static async scanFilesystem(
    dirPath: string,
    workspaceRoot: string,
    ignorePatterns: string[],
  ): Promise<string[]> {
    const paths: string[] = [];

    try {
      const uri = vscode.Uri.file(dirPath);
      const entries = await vscode.workspace.fs.readDirectory(uri);

      for (const [name, fileType] of entries) {
        const childPath = path.join(dirPath, name);
        const relativePath = PathUtils.getRelativePath(
          childPath,
          workspaceRoot,
        );

        if (PathUtils.shouldIgnore(relativePath, ignorePatterns)) {
          continue;
        }

        paths.push(relativePath.replace(/\\/g, "/"));

        if (fileType === vscode.FileType.Directory) {
          const subPaths = await this.scanFilesystem(
            childPath,
            workspaceRoot,
            ignorePatterns,
          );
          paths.push(...subPaths);
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return paths.sort();
  }

  /**
   * Format mismatch message
   */
  static formatMismatch(mismatch: StructuralMismatch): string {
    let msg = "⚠ STRUCTURE MISMATCH\n\n";
    msg += "The tree structure does not match the filesystem.\n";
    msg += "Please regenerate the tree to continue.\n\n";

    if (mismatch.added.length > 0) {
      msg += `FILES ADDED (not in tree):\n`;
      for (const p of mismatch.added.slice(0, 10)) {
        msg += `  + ${p}\n`;
      }
      if (mismatch.added.length > 10) {
        msg += `  ... and ${mismatch.added.length - 10} more\n`;
      }
      msg += "\n";
    }

    if (mismatch.removed.length > 0) {
      msg += `FILES REMOVED (not in filesystem):\n`;
      for (const p of mismatch.removed.slice(0, 10)) {
        msg += `  - ${p}\n`;
      }
      if (mismatch.removed.length > 10) {
        msg += `  ... and ${mismatch.removed.length - 10} more\n`;
      }
      msg += "\n";
    }

    return msg;
  }
}
