/**
 * Shared filesystem scanning utility
 */

import * as vscode from "vscode";
import * as path from "path";
import { TreeNode } from "../types";
import { PathUtils } from "../utils/pathUtils";
import { v4 as uuidv4 } from "uuid";

/**
 * Scan directory recursively and build TreeNode structure
 */
export async function scanDirectory(
  dirPath: string,
  workspaceRoot: string,
  ignorePatterns: string[],
): Promise<TreeNode> {
  const relativePath = PathUtils.getRelativePath(dirPath, workspaceRoot);
  const dirName = path.basename(dirPath);

  const node: TreeNode = {
    id: uuidv4(),
    name: relativePath === "" ? "root" : dirName,
    type: "folder",
    children: [],
  };

  try {
    const uri = vscode.Uri.file(dirPath);
    const entries = await vscode.workspace.fs.readDirectory(uri);

    // Sort entries (folders first, then alphabetically)
    entries.sort((a, b) => {
      const [nameA, typeA] = a;
      const [nameB, typeB] = b;

      // Folders before files
      if (
        typeA === vscode.FileType.Directory &&
        typeB !== vscode.FileType.Directory
      ) {
        return -1;
      }
      if (
        typeA !== vscode.FileType.Directory &&
        typeB === vscode.FileType.Directory
      ) {
        return 1;
      }

      // Alphabetically
      return nameA.localeCompare(nameB);
    });

    for (const [name, fileType] of entries) {
      const childPath = path.join(dirPath, name);
      const childRelative = PathUtils.getRelativePath(childPath, workspaceRoot);

      // Skip ignored patterns
      if (PathUtils.shouldIgnore(childRelative, ignorePatterns)) {
        continue;
      }

      if (fileType === vscode.FileType.Directory) {
        // Recursively scan subdirectory
        const childNode = await scanDirectory(
          childPath,
          workspaceRoot,
          ignorePatterns,
        );
        node.children!.push(childNode);
      } else if (fileType === vscode.FileType.File) {
        // Add file node
        node.children!.push({
          id: uuidv4(),
          name,
          type: "file",
        });
      }
      // Skip symlinks and other types
    }
  } catch (error) {
    console.error(`Error scanning ${dirPath}:`, error);
  }

  return node;
}
