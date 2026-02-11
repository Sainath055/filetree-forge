/**
 * State manager
 * Tracks the last applied tree and temporary documents
 */

import * as vscode from "vscode";
import { TreeNode } from "../types";

export class TreeStateManager {
  private static lastAppliedTree: TreeNode | null = null;
  private static temporaryDocuments: Set<vscode.Uri> = new Set();
  private static lastGeneratedRootPath: string | null = null;

  /**
   * Store the last applied tree
   */
  static setLastAppliedTree(tree: TreeNode): void {
    // Deep clone to prevent mutations
    this.lastAppliedTree = JSON.parse(JSON.stringify(tree));
  }

  /**
   * Get the last applied tree
   */
  static getLastAppliedTree(): TreeNode | null {
    if (!this.lastAppliedTree) {
      return null;
    }
    // Return deep clone
    return JSON.parse(JSON.stringify(this.lastAppliedTree));
  }

  /**
   * Clear the last applied tree
   */
  static clear(): void {
    this.lastAppliedTree = null;
    this.temporaryDocuments.clear();
    this.lastGeneratedRootPath = null;
  }

  /**
   * Check if there's a stored tree
   */
  static hasStoredTree(): boolean {
    return this.lastAppliedTree !== null;
  }

  /**
   * Register a temporary document (tree or preview)
   */
  static registerTemporaryDocument(uri: vscode.Uri): void {
    this.temporaryDocuments.add(uri);
  }

  /**
   * Close all temporary documents
   */
  static async closeTemporaryDocuments(): Promise<void> {
    for (const uri of this.temporaryDocuments) {
      const tabs = vscode.window.tabGroups.all
        .flatMap((group) => group.tabs)
        .filter(
          (tab) =>
            tab.input instanceof vscode.TabInputText &&
            tab.input.uri.toString() === uri.toString(),
        );

      for (const tab of tabs) {
        await vscode.window.tabGroups.close(tab);
      }
    }

    this.temporaryDocuments.clear();
  }

  /**
   * Set the last generated root path
   */
  static setLastGeneratedRootPath(path: string): void {
    this.lastGeneratedRootPath = path;
  }

  /**
   * Get the last generated root path
   */
  static getLastGeneratedRootPath(): string | null {
    return this.lastGeneratedRootPath;
  }
}
