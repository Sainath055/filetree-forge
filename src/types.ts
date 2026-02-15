/**
 * Core data model for FILETREEFORGE
 * The TreeNode is the single source of truth for all representations with explicit operation markers
 */

export interface TreeNode {
  /** Node name (no slashes, no paths) */
  name: string;
  /** Node type */
  type: "file" | "folder";
  /** Children nodes (only valid for folders) */
  children?: TreeNode[];
  /** Explicit operation marker */
  operation?: Operation;
  /** New name for rename operation */
  renameTo?: string;
}

export type Operation = "create" | "delete" | "rename";

export interface OperationNode {
  node: TreeNode;
  path: string[];
  operation: Operation;
  newPath?: string[]; // For rename
}

export interface FileOperation {
  type: "create" | "delete" | "rename";
  path: string;
  newPath?: string; // Only for rename
  nodeType: "file" | "folder";
}

export interface ParseError {
  line?: number;
  column?: number;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ParseError[];
}

export interface StructuralMismatch {
  expected: string[];
  actual: string[];
  added: string[];
  removed: string[];
  modified: string[];
}
