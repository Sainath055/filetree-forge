/**
 * State manager - tracks baseline tree and temp documents
 */

import * as vscode from "vscode";
import { TreeNode } from "../types";

export class TreeStateManager {
  private static lastAppliedTree: TreeNode | null = null;
  private static temporaryDocuments: Set<vscode.Uri> = new Set();
  private static lastGeneratedRootPath: string | null = null;

  static setLastAppliedTree(tree: TreeNode): void {
    this.lastAppliedTree = JSON.parse(JSON.stringify(tree));
  }

  static getLastAppliedTree(): TreeNode | null {
    if (!this.lastAppliedTree) {
      return null;
    }
    return JSON.parse(JSON.stringify(this.lastAppliedTree));
  }

  static clear(): void {
    this.lastAppliedTree = null;
    this.temporaryDocuments.clear();
    this.lastGeneratedRootPath = null;
  }

  static registerTemporaryDocument(uri: vscode.Uri): void {
    this.temporaryDocuments.add(uri);
  }

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

  static setLastGeneratedRootPath(path: string): void {
    this.lastGeneratedRootPath = path;
  }

  static getLastGeneratedRootPath(): string | null {
    return this.lastGeneratedRootPath;
  }
}
