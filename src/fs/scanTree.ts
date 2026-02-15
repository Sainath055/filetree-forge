/**
 * Filesystem scanner - no UUIDs
 */

import * as vscode from "vscode";
import * as path from "path";
import { TreeNode } from "../types";
import { PathUtils } from "../utils/pathUtils";

export async function scanDirectory(
  dirPath: string,
  workspaceRoot: string,
  ignorePatterns: string[],
): Promise<TreeNode> {
  const relativePath = PathUtils.getRelativePath(dirPath, workspaceRoot);
  const dirName = path.basename(dirPath);

  const node: TreeNode = {
    name: relativePath === "" ? "root" : dirName,
    type: "folder",
    children: [],
  };

  try {
    const uri = vscode.Uri.file(dirPath);
    const entries = await vscode.workspace.fs.readDirectory(uri);

    entries.sort((a, b) => {
      const [nameA, typeA] = a;
      const [nameB, typeB] = b;
      if (
        typeA === vscode.FileType.Directory &&
        typeB !== vscode.FileType.Directory
      )
        return -1;
      if (
        typeA !== vscode.FileType.Directory &&
        typeB === vscode.FileType.Directory
      )
        return 1;
      return nameA.localeCompare(nameB);
    });

    for (const [name, fileType] of entries) {
      const childPath = path.join(dirPath, name);
      const childRelative = PathUtils.getRelativePath(childPath, workspaceRoot);

      if (PathUtils.shouldIgnore(childRelative, ignorePatterns)) {
        continue;
      }

      if (fileType === vscode.FileType.Directory) {
        node.children!.push(
          await scanDirectory(childPath, workspaceRoot, ignorePatterns),
        );
      } else if (fileType === vscode.FileType.File) {
        node.children!.push({
          name,
          type: "file",
        });
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dirPath}:`, error);
  }

  return node;
}
