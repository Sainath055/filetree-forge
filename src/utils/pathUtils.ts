/**
 * Path utilities with security and validation
 */

import * as path from "path";
import * as vscode from "vscode";

export class PathUtils {
  /**
   * Validates that a path is safe and within workspace
   */
  static isPathSafe(targetPath: string, workspaceRoot: string): boolean {
    // Disallow absolute paths
    if (path.isAbsolute(targetPath)) {
      return false;
    }

    // // Disallow parent directory references
    // if (targetPath.includes("..")) {
    //   return false;
    // }

    // Resolve to absolute path and ensure it's within workspace
    const resolved = path.resolve(workspaceRoot, targetPath);
    const normalized = path.normalize(resolved);

    const relative = path.relative(workspaceRoot, resolved);

    // If path escapes workspace, relative will start with ".."
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      return false;
    }

    return normalized.startsWith(workspaceRoot);
  }

  /**
   * Validates a node name (no slashes, no special characters)
   */
  static isValidNodeName(name: string): boolean {
    if (!name || name.trim() === "") {
      return false;
    }

    // Disallow slashes
    if (name.includes("/") || name.includes("\\")) {
      return false;
    }

    // Disallow parent references
    if (name === ".." || name === ".") {
      return false;
    }

    // Disallow certain special characters
    const invalidChars = /[<>:"|?*\x00-\x1F]/;
    if (invalidChars.test(name)) {
      return false;
    }

    return true;
  }

  /**
   * Builds a full path from workspace root and relative segments
   */
  static buildPath(workspaceRoot: string, segments: string[]): string {
    return path.join(workspaceRoot, ...segments);
  }

  /**
   * Gets relative path from workspace root
   */
  static getRelativePath(fullPath: string, workspaceRoot: string): string {
    return path.relative(workspaceRoot, fullPath);
  }

  /**
   * Gets workspace root or throws error
   */
  static getWorkspaceRoot(): string {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      throw new Error("No workspace folder is open");
    }
    return workspaceFolders[0].uri.fsPath;
  }

  /**
   * Normalizes path separators to forward slashes
   */
  static normalizeSeparators(p: string): string {
    return p.replace(/\\/g, "/");
  }

  /**
   * Checks if a path matches ignore patterns
   */
  static shouldIgnore(relativePath: string, ignorePatterns: string[]): boolean {
    const segments = relativePath.split(/[/\\]/);

    for (const pattern of ignorePatterns) {
      if (segments.some((segment) => segment === pattern)) {
        return true;
      }

      // Simple glob pattern matching
      if (pattern.includes("*")) {
        const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
        if (segments.some((segment) => regex.test(segment))) {
          return true;
        }
      }
    }

    return false;
  }
}
