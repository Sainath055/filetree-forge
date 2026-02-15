/**
 * Operation extractor
 * Extracts explicit operations from marked tree
 */

import { TreeNode, OperationNode } from "../types";

export class OperationExtractor {
  /**
   * Extract all operations from tree
   */
  static extract(tree: TreeNode): OperationNode[] {
    const operations: OperationNode[] = [];
    this.extractRecursive(tree, [], operations);
    return operations;
  }

  /**
   * Recursively extract operations
   */
  private static extractRecursive(
    node: TreeNode,
    currentPath: string[],
    operations: OperationNode[],
  ): void {
    if (node.operation) {
      const opNode: OperationNode = {
        node,
        path: currentPath,
        operation: node.operation,
      };

      if (node.operation === "rename" && node.renameTo) {
        opNode.newPath = [...currentPath.slice(0, -1), node.renameTo];
      }

      operations.push(opNode);
    }

    if (node.children) {
      for (const child of node.children) {
        this.extractRecursive(child, [...currentPath, child.name], operations);
      }
    }
  }

  /**
   * Validate operations
   */
  static validate(operations: OperationNode[], tree: TreeNode): string[] {
    const errors: string[] = [];

    for (const op of operations) {
      // Cannot operate on root
      if (op.path.length === 0) {
        errors.push(`Cannot ${op.operation} root node`);
        continue;
      }

      // Validate rename
      if (op.operation === "rename") {
        if (!op.node.renameTo) {
          errors.push(
            `Rename operation missing target name: ${op.path.join("/")}`,
          );
        }
      }

      // Cannot combine operations with structural changes
      // (This would be detected in parser, but double-check here)
    }

    return errors;
  }
}
