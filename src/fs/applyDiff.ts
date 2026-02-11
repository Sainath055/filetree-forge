/**
 * Filesystem diff application engine
 * Applies tree diffs to the real filesystem safely
 */

import * as vscode from "vscode";
import * as path from "path";
import { TreeDiff, TreeNode, FileOperation } from "../types";
import { PathUtils } from "../utils/pathUtils";
import { DiffEngine } from "../diff/diffTrees";

export class ApplyEngine {
  /**
   * Apply diff to filesystem
   * Operations are applied in specific order to avoid conflicts
   */
  static async applyDiff(
    diff: TreeDiff,
    oldTree: TreeNode,
    newTree: TreeNode,
    workspaceRoot: string,
    dryRun: boolean = false,
  ): Promise<FileOperation[]> {
    const operations: FileOperation[] = [];

    // Generate all operations
    const createOps = this.generateCreateOps(
      diff.created,
      newTree,
      workspaceRoot,
    );
    const renameOps = this.generateRenameOps(
      diff.renamed,
      oldTree,
      newTree,
      workspaceRoot,
    );
    const deleteOps = this.generateDeleteOps(
      diff.deleted,
      oldTree,
      workspaceRoot,
    );

    // Sort operations in correct order
    const sortedOps = this.sortOperations([
      ...createOps,
      ...renameOps,
      ...deleteOps,
    ]);

    // Apply or collect operations
    for (const op of sortedOps) {
      if (!dryRun) {
        await this.executeOperation(op);
      }
      operations.push(op);
    }

    return operations;
  }

  /**
   * Generate create operations
   */
  private static generateCreateOps(
    created: TreeNode[],
    newTree: TreeNode,
    workspaceRoot: string,
  ): FileOperation[] {
    const ops: FileOperation[] = [];

    for (const node of created) {
      const nodePath = DiffEngine.getNodePath(newTree, node.id);
      if (!nodePath) {
        continue;
      }

      const fullPath = PathUtils.buildPath(workspaceRoot, nodePath);

      // Validate path safety
      const relPath = nodePath.join("/");

      if (!PathUtils.isPathSafe(relPath, workspaceRoot)) {
        throw new Error(`Unsafe create path detected: ${relPath}`);
      }

      ops.push({
        type: "create",
        path: fullPath,
        nodeType: node.type,
      });
    }

    return ops;
  }

  /**
   * Generate rename operations
   */
  private static generateRenameOps(
    renamed: { from: TreeNode; to: TreeNode }[],
    oldTree: TreeNode,
    newTree: TreeNode,
    workspaceRoot: string,
  ): FileOperation[] {
    const ops: FileOperation[] = [];

    for (const { from, to } of renamed) {
      const oldPath = DiffEngine.getNodePath(oldTree, from.id);
      const newPath = DiffEngine.getNodePath(newTree, to.id);

      if (!oldPath || !newPath) {
        continue;
      }

      const fullOldPath = PathUtils.buildPath(workspaceRoot, oldPath);
      const fullNewPath = PathUtils.buildPath(workspaceRoot, newPath);

      // Validate both paths
      if (
        !PathUtils.isPathSafe(oldPath.join("/"), workspaceRoot) ||
        !PathUtils.isPathSafe(newPath.join("/"), workspaceRoot)
      ) {
        throw new Error(`Unsafe path detected in rename`);
      }

      ops.push({
        type: "rename",
        path: fullOldPath,
        newPath: fullNewPath,
        nodeType: to.type,
      });
    }

    return ops;
  }

  /**
   * Generate delete operations
   */
  private static generateDeleteOps(
    deleted: TreeNode[],
    oldTree: TreeNode,
    workspaceRoot: string,
  ): FileOperation[] {
    const ops: FileOperation[] = [];

    for (const node of deleted) {
      const nodePath = DiffEngine.getNodePath(oldTree, node.id);
      if (!nodePath) {
        continue;
      }

      const fullPath = PathUtils.buildPath(workspaceRoot, nodePath);

      const relPath = nodePath.join("/");

      if (!PathUtils.isPathSafe(relPath, workspaceRoot)) {
        throw new Error(`Unsafe delete path detected: ${relPath}`);
      }

      ops.push({
        type: "delete",
        path: fullPath,
        nodeType: node.type,
      });
    }

    return ops;
  }

  /**
   * Sort operations in correct execution order:
   * 1. Create folders (parent first)
   * 2. Create files
   * 3. Rename files/folders
   * 4. Delete files
   * 5. Delete folders (deepest first)
   */
  private static sortOperations(ops: FileOperation[]): FileOperation[] {
    const createFolders = ops.filter(
      (op) => op.type === "create" && op.nodeType === "folder",
    );
    const createFiles = ops.filter(
      (op) => op.type === "create" && op.nodeType === "file",
    );
    const renames = ops.filter((op) => op.type === "rename");
    const deleteFiles = ops.filter(
      (op) => op.type === "delete" && op.nodeType === "file",
    );
    const deleteFolders = ops.filter(
      (op) => op.type === "delete" && op.nodeType === "folder",
    );

    // Sort create folders by depth (shallowest first)
    createFolders.sort((a, b) => {
      const depthA = a.path.split(path.sep).length;
      const depthB = b.path.split(path.sep).length;
      return depthA - depthB;
    });

    // Sort delete folders by depth (deepest first)
    deleteFolders.sort((a, b) => {
      const depthA = a.path.split(path.sep).length;
      const depthB = b.path.split(path.sep).length;
      return depthB - depthA;
    });

    return [
      ...createFolders,
      ...createFiles,
      ...renames,
      ...deleteFiles,
      ...deleteFolders,
    ];
  }

  /**
   * Execute a single operation
   */
  private static async executeOperation(op: FileOperation): Promise<void> {
    const uri = vscode.Uri.file(op.path);

    switch (op.type) {
      case "create":
        if (op.nodeType === "folder") {
          await vscode.workspace.fs.createDirectory(uri);
        } else {
          // Create empty file
          // await vscode.workspace.fs.writeFile(uri, new Uint8Array());

          // Prevent overwriting existing files
          try {
            await vscode.workspace.fs.stat(uri);
            throw new Error(`File already exists: ${op.path}`);
          } catch {
            // File does not exist — safe to create
            await vscode.workspace.fs.writeFile(uri, new Uint8Array());
          }
        }
        break;

      case "rename":
        if (!op.newPath) {
          throw new Error("Rename operation missing newPath");
        }
        const newUri = vscode.Uri.file(op.newPath);

        // Ensure parent directory exists
        const parentDir = path.dirname(op.newPath);
        await vscode.workspace.fs.createDirectory(vscode.Uri.file(parentDir));

        await vscode.workspace.fs.rename(uri, newUri, { overwrite: false });
        break;

      case "delete":
        await vscode.workspace.fs.delete(uri, { recursive: true });
        break;
    }
  }

  /**
   * Format operations for preview display
   */
  static formatOperationsForDisplay(
    ops: FileOperation[],
    workspaceRoot: string,
  ): string {
    if (ops.length === 0) {
      return "No changes detected.";
    }

    let output = `${ops.length} operation(s) to apply:\n\n`;

    const groups = {
      create: ops.filter((op) => op.type === "create"),
      rename: ops.filter((op) => op.type === "rename"),
      delete: ops.filter((op) => op.type === "delete"),
    };

    if (groups.create.length > 0) {
      output += `CREATE (${groups.create.length}):\n`;
      for (const op of groups.create) {
        const rel = PathUtils.getRelativePath(op.path, workspaceRoot);
        const icon = op.nodeType === "folder" ? "📁" : "📄";
        output += `  ${icon} ${rel}\n`;
      }
      output += "\n";
    }

    if (groups.rename.length > 0) {
      output += `RENAME (${groups.rename.length}):\n`;
      for (const op of groups.rename) {
        const relOld = PathUtils.getRelativePath(op.path, workspaceRoot);
        const relNew = op.newPath
          ? PathUtils.getRelativePath(op.newPath, workspaceRoot)
          : "";
        output += `  ${relOld} → ${relNew}\n`;
      }
      output += "\n";
    }

    if (groups.delete.length > 0) {
      output += `DELETE (${groups.delete.length}):\n`;
      for (const op of groups.delete) {
        const rel = PathUtils.getRelativePath(op.path, workspaceRoot);
        const icon = op.nodeType === "folder" ? "📁" : "📄";
        output += `  ${icon} ${rel}\n`;
      }
      output += "\n";
    }

    return output;
  }
}
