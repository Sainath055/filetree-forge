/**
 * Apply changes command - validates and executes operations
 */

import * as vscode from "vscode";
import { MarkdownParser } from "../parser/markdownParser";
import { OperationExtractor } from "../fs/operationExtractor";
import { OperationExecutor } from "../fs/operationExecutor";
import { StructureValidator } from "../fs/structureValidator";
import { PathUtils } from "../utils/pathUtils";
import { TreeStateManager } from "./stateManager";

export class ApplyChangesCommand {
  static async execute(): Promise<void> {
    try {
      const editor = vscode.window.activeTextEditor;

      // Handle apply from preview
      if (
        editor &&
        editor.document.languageId === "plaintext" &&
        editor.document.getText().startsWith("PREVIEW MODE")
      ) {
        await this.applyFromPreview();
        return;
      }

      if (!editor) {
        vscode.window.showWarningMessage("No active editor");
        return;
      }

      const content = editor.document.getText();

      // Parse tree
      const parseResult = MarkdownParser.parse(content);
      if (!parseResult.tree) {
        const errorMsg = parseResult.errors
          .map((e) => (e.line ? `Line ${e.line}: ${e.message}` : e.message))
          .join("\n");
        vscode.window.showErrorMessage(`Parse errors:\n${errorMsg}`);
        return;
      }

      const tree = parseResult.tree;
      const workspaceRoot =
        TreeStateManager.getLastGeneratedRootPath() ||
        PathUtils.getWorkspaceRoot();
      const config = vscode.workspace.getConfiguration("filetreeforge");
      const ignorePatterns = config.get<string[]>("ignorePatterns") || [];

      // CRITICAL: Validate structure matches filesystem
      const validation = await StructureValidator.validate(
        tree,
        workspaceRoot,
        ignorePatterns,
      );

      if (!validation.valid && validation.mismatch) {
        const mismatchMsg = StructureValidator.formatMismatch(
          validation.mismatch,
        );

        const choice = await vscode.window.showErrorMessage(
          "Structure mismatch detected",
          { modal: true, detail: mismatchMsg },
          "Regenerate Tree",
          "Cancel",
        );

        if (choice === "Regenerate Tree") {
          await vscode.commands.executeCommand(
            "filetreeforge.generateMarkdown",
          );
        }
        return;
      }

      // Extract operations
      const operations = OperationExtractor.extract(tree);

      // Validate operations
      const validationErrors = OperationExtractor.validate(operations, tree);
      if (validationErrors.length > 0) {
        vscode.window.showErrorMessage(
          `Operation errors:\n${validationErrors.join("\n")}`,
        );
        return;
      }

      if (operations.length === 0) {
        vscode.window.showInformationMessage("No operations to apply");
        return;
      }

      // Prepare file operations
      const fileOps = OperationExecutor.prepareOperations(
        operations,
        workspaceRoot,
      );

      // Confirm if needed
      const confirmBeforeApply = config.get<boolean>(
        "confirmBeforeApply",
        true,
      );
      if (confirmBeforeApply) {
        const hasDeletes = fileOps.some((op) => op.type === "delete");
        const message = hasDeletes
          ? `⚠️ This will DELETE ${fileOps.filter((op) => op.type === "delete").length} item(s). Continue?`
          : `Apply ${fileOps.length} operation(s)?`;

        const answer = await vscode.window.showWarningMessage(
          message,
          { modal: true },
          "Apply",
          "Cancel",
        );

        if (answer !== "Apply") {
          return;
        }
      }

      // Execute operations
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Applying changes...",
          cancellable: false,
        },
        async () => {
          await OperationExecutor.execute(fileOps, false);
        },
      );

      // Update baseline (regenerate tree without markers)
      const { scanDirectory } = await import("../fs/scanTree");
      const newTree = await scanDirectory(
        workspaceRoot,
        workspaceRoot,
        ignorePatterns,
      );
      TreeStateManager.setLastAppliedTree(newTree);

      // Close temp documents
      await TreeStateManager.closeTemporaryDocuments();

      vscode.window.showInformationMessage(
        `✅ Applied ${fileOps.length} operation(s) successfully`,
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        `Apply failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private static async applyFromPreview(): Promise<void> {
    const editors = vscode.window.visibleTextEditors;
    let treeEditor: vscode.TextEditor | undefined;

    for (const ed of editors) {
      if (ed.document.languageId === "markdown") {
        treeEditor = ed;
        break;
      }
    }

    if (!treeEditor) {
      vscode.window.showErrorMessage("Cannot find tree document");
      return;
    }

    // Switch to tree editor and apply
    await vscode.window.showTextDocument(treeEditor.document);
    await this.execute();
  }
}
