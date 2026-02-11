/**
 * Tree diff engine
 * Compares two trees and generates diff operations
 * CRITICAL: Properly detects renames (same ID, different name/path)
 */

import { TreeNode, TreeDiff } from '../types';

interface TreeNodeWithPath {
  node: TreeNode;
  path: string[];
}

export class DiffEngine {
  /**
   * Generate diff between old and new tree
   */
  static diff(oldTree: TreeNode, newTree: TreeNode): TreeDiff {
    // Flatten both trees with paths
    const oldNodes = this.flattenTree(oldTree);
    const newNodes = this.flattenTree(newTree);

    // Build ID maps
    const oldById = new Map<string, TreeNodeWithPath>();
    const newById = new Map<string, TreeNodeWithPath>();

    for (const item of oldNodes) {
      oldById.set(item.node.id, item);
    }

    for (const item of newNodes) {
      newById.set(item.node.id, item);
    }

    const created: TreeNode[] = [];
    const deleted: TreeNode[] = [];
    const renamed: { from: TreeNode; to: TreeNode }[] = [];

    // Find created and renamed
    for (const [id, newItem] of newById) {
      const oldItem = oldById.get(id);

      if (!oldItem) {
        // New node - created
        created.push(newItem.node);
      } else {
        // Exists in both - check if renamed or moved
        const oldPath = oldItem.path.join('/');
        const newPath = newItem.path.join('/');

        if (oldPath !== newPath) {
          // Path changed - renamed or moved
          renamed.push({
            from: oldItem.node,
            to: newItem.node
          });
        }
        // Note: We store the old node with old path info for the "from"
        // and new node with new path info for the "to"
      }
    }

    // Find deleted
    for (const [id, oldItem] of oldById) {
      if (!newById.has(id)) {
        // Node existed in old but not in new - deleted
        deleted.push(oldItem.node);
      }
    }

    return { created, deleted, renamed };
  }

  /**
   * Flatten tree into array with paths
   */
  private static flattenTree(
    tree: TreeNode,
    parentPath: string[] = []
  ): TreeNodeWithPath[] {
    const result: TreeNodeWithPath[] = [];

    if (tree.children) {
      for (const child of tree.children) {
        const childPath = [...parentPath, child.name];
        result.push({
          node: child,
          path: childPath
        });

        if (child.children) {
          result.push(...this.flattenTree(child, childPath));
        }
      }
    }

    return result;
  }

  /**
   * Get full path for a node in a tree
   */
  static getNodePath(tree: TreeNode, targetId: string): string[] | null {
    return this.findNodePath(tree, targetId, []);
  }

  private static findNodePath(
    node: TreeNode,
    targetId: string,
    currentPath: string[]
  ): string[] | null {
    if (node.id === targetId) {
      return currentPath;
    }

    if (node.children) {
      for (const child of node.children) {
        const found = this.findNodePath(child, targetId, [...currentPath, child.name]);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  /**
   * Check if diff is empty (no changes)
   */
  static isEmpty(diff: TreeDiff): boolean {
    return (
      diff.created.length === 0 &&
      diff.deleted.length === 0 &&
      diff.renamed.length === 0
    );
  }
}
