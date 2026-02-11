/**
 * Validation utilities for tree structures
 */

import { TreeNode, ValidationResult, ParseError } from '../types';
import { PathUtils } from './pathUtils';

export class ValidationUtils {
  /**
   * Validates a tree structure
   */
  static validateTree(tree: TreeNode, path: string[] = []): ValidationResult {
    const errors: ParseError[] = [];

    // Validate name
    if (!PathUtils.isValidNodeName(tree.name)) {
      errors.push({
        message: `Invalid node name: "${tree.name}" at path: ${path.join('/')}`
      });
    }

    // Validate type
    if (tree.type !== 'file' && tree.type !== 'folder') {
      errors.push({
        message: `Invalid node type: "${tree.type}" for "${tree.name}"`
      });
    }

    // Validate children
    if (tree.type === 'file' && tree.children && tree.children.length > 0) {
      errors.push({
        message: `File "${tree.name}" cannot have children`
      });
    }

    if (tree.type === 'folder' && tree.children) {
      // Check for duplicate names
      const names = new Set<string>();
      for (const child of tree.children) {
        if (names.has(child.name)) {
          errors.push({
            message: `Duplicate name "${child.name}" in folder "${tree.name}"`
          });
        }
        names.add(child.name);

        // Recursively validate children
        const childPath = [...path, tree.name];
        const childResult = this.validateTree(child, childPath);
        errors.push(...childResult.errors);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates JSON structure before parsing
   */
  static validateJSON(jsonString: string): ValidationResult {
    const errors: ParseError[] = [];

    try {
      const parsed = JSON.parse(jsonString);
      
      if (!parsed || typeof parsed !== 'object') {
        errors.push({
          message: 'Root must be an object'
        });
        return { valid: false, errors };
      }

      if (!parsed.name || typeof parsed.name !== 'string') {
        errors.push({
          message: 'Root must have a "name" property'
        });
      }

      if (!parsed.type || (parsed.type !== 'file' && parsed.type !== 'folder')) {
        errors.push({
          message: 'Root must have a valid "type" property (file or folder)'
        });
      }

      if (parsed.children && !Array.isArray(parsed.children)) {
        errors.push({
          message: 'Children must be an array'
        });
      }

    } catch (e) {
      errors.push({
        message: `JSON parse error: ${e instanceof Error ? e.message : String(e)}`
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Checks if a tree node has an ID
   */
  static hasValidId(node: TreeNode): boolean {
    return Boolean(node.id && node.id.trim() !== '');
  }

  /**
   * Ensures all nodes in tree have IDs
   */
  static ensureIds(node: TreeNode, generateId: () => string): void {
    if (!this.hasValidId(node)) {
      node.id = generateId();
    }

    if (node.children) {
      for (const child of node.children) {
        this.ensureIds(child, generateId);
      }
    }
  }
}
