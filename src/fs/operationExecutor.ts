/**
 * Operation executor
 * Executes explicit operations in safe order
 */

import * as vscode from "vscode";
import * as path from "path";
import { OperationNode, FileOperation } from "../types";
import { PathUtils } from "../utils/pathUtils";

export class OperationExecutor {
  /**
   * Convert operations to file operations and sort them
   */
  static prepareOperations(
    operations: OperationNode[],
    workspaceRoot: string,
  ): FileOperation[] {
    const fileOps: FileOperation[] = [];

    for (const op of operations) {
      const fullPath = PathUtils.buildPath(workspaceRoot, op.path);

      // Validate path safety
      if (!PathUtils.isPathSafe(op.path.join("/"), workspaceRoot)) {
        throw new Error(`Unsafe path: ${op.path.join("/")}`);
      }

      if (op.operation === "create") {
        fileOps.push({
          type: "create",
          path: fullPath,
          nodeType: op.node.type,
        });
      } else if (op.operation === "delete") {
        fileOps.push({
          type: "delete",
          path: fullPath,
          nodeType: op.node.type,
        });
      } else if (op.operation === "rename" && op.newPath) {
        const newFullPath = PathUtils.buildPath(workspaceRoot, op.newPath);

        if (!PathUtils.isPathSafe(op.newPath.join("/"), workspaceRoot)) {
          throw new Error(`Unsafe path: ${op.newPath.join("/")}`);
        }

        fileOps.push({
          type: "rename",
          path: fullPath,
          newPath: newFullPath,
          nodeType: op.node.type,
        });
      }
    }

    return this.sortOperations(fileOps);
  }

  /**
   * Sort operations in safe execution order
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

    // Sort creates by depth (shallowest first)
    createFolders.sort((a, b) => {
      const depthA = a.path.split(path.sep).length;
      const depthB = b.path.split(path.sep).length;
      return depthA - depthB;
    });

    // Sort deletes by depth (deepest first)
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
   * Execute operations
   */
  static async execute(
    operations: FileOperation[],
    dryRun: boolean = false,
  ): Promise<void> {
    for (const op of operations) {
      if (!dryRun) {
        await this.executeOperation(op);
      }
    }
  }

  /**
   * Execute single operation
   */
  private static async executeOperation(op: FileOperation): Promise<void> {
    const uri = vscode.Uri.file(op.path);

    switch (op.type) {
      case "create":
        if (op.nodeType === "folder") {
          await vscode.workspace.fs.createDirectory(uri);
        } else {
          await vscode.workspace.fs.writeFile(uri, new Uint8Array());
        }
        break;

      case "rename":
        if (!op.newPath) {
          throw new Error("Rename operation missing newPath");
        }
        const newUri = vscode.Uri.file(op.newPath);
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
   * Format operations for display
   */
  static formatOperations(
    operations: FileOperation[],
    workspaceRoot: string,
  ): string {
    if (operations.length === 0) {
      return "No operations to apply.";
    }

    let output = "";

    const creates = operations.filter((op) => op.type === "create");
    const renames = operations.filter((op) => op.type === "rename");
    const deletes = operations.filter((op) => op.type === "delete");

    if (creates.length > 0) {
      output += `CREATE:\n`;
      for (const op of creates) {
        const rel = PathUtils.getRelativePath(op.path, workspaceRoot);
        output += `  + ${rel}\n`;
      }
      output += "\n";
    }

    if (renames.length > 0) {
      output += `RENAME:\n`;
      for (const op of renames) {
        const relOld = PathUtils.getRelativePath(op.path, workspaceRoot);
        const relNew = op.newPath
          ? PathUtils.getRelativePath(op.newPath, workspaceRoot)
          : "";
        output += `  ${relOld} → ${relNew}\n`;
      }
      output += "\n";
    }

    if (deletes.length > 0) {
      output += `DELETE:\n`;
      for (const op of deletes) {
        const rel = PathUtils.getRelativePath(op.path, workspaceRoot);
        output += `  - ${rel}\n`;
      }
      output += "\n";
    }

    return output;
  }
}
