/**
 * Core data model for FILETREEFORGE
 * The TreeNode is the single source of truth for all representations
 */

export interface TreeNode {
  /** Stable UUID that persists between parses - used for rename detection */
  id: string;
  /** Node name (no slashes, no paths) */
  name: string;
  /** Node type */
  type: "file" | "folder";
  /** Children nodes (only valid for folders) */
  children?: TreeNode[];
}

export interface TreeDiff {
  /** Nodes to be created */
  created: TreeNode[];
  /** Nodes to be deleted */
  deleted: TreeNode[];
  /** Nodes to be renamed */
  renamed: {
    from: TreeNode;
    to: TreeNode;
  }[];
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

export interface FilesystemDriftResult {
  hasDrift: boolean;
  addedFiles: string[];
  deletedFiles: string[];
  modifiedFiles: string[];
}
