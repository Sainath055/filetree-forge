/**
 * Validation utilities for tree structures
 */

import { TreeNode, ValidationResult, ParseError } from "../types";
import { PathUtils } from "./pathUtils";

export class ValidationUtils {
  /**
   * Validates a tree structure
   */
  static validateTree(tree: TreeNode, path: string[] = []): ValidationResult {
    const errors: ParseError[] = [];

    // Validate name
    if (!PathUtils.isValidNodeName(tree.name)) {
      errors.push({
        message: `Invalid node name: "${tree.name}" at path: ${path.join("/")}`,
      });
    }

    // Validate type
    if (tree.type !== "file" && tree.type !== "folder") {
      errors.push({
        message: `Invalid node type: "${tree.type}" for "${tree.name}"`,
      });
    }

    // Validate children
    if (tree.type === "file" && tree.children && tree.children.length > 0) {
      errors.push({
        message: `File "${tree.name}" cannot have children`,
      });
    }

    if (tree.type === "folder" && tree.children) {
      // Check for duplicate names
      const names = new Set<string>();
      for (const child of tree.children) {
        if (names.has(child.name)) {
          errors.push({
            message: `Duplicate name "${child.name}" in folder "${tree.name}"`,
          });
        }
        names.add(child.name);

        // Recursively validate children
        const childPath = [...path, tree.name];
        const childResult = this.validateTree(child, childPath);
        errors.push(...childResult.errors);
      }
    }

    // Validate operation markers
    if (tree.operation) {
      if (tree.operation === "rename" && !tree.renameTo) {
        errors.push({
          message: `Rename operation missing target for "${tree.name}"`,
        });
      }

      if (tree.operation === "rename" && tree.renameTo) {
        if (!PathUtils.isValidNodeName(tree.renameTo)) {
          errors.push({
            message: `Invalid rename target: "${tree.renameTo}" for "${tree.name}"`,
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
