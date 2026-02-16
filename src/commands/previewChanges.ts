/**
 * Preview changes command - validates structure and shows operations
 */

import * as vscode from "vscode";
import { MarkdownParser } from "../parser/markdownParser";
import { OperationExtractor } from "../fs/operationExtractor";
import { OperationExecutor } from "../fs/operationExecutor";
import { StructureValidator } from "../fs/structureValidator";
import { PathUtils } from "../utils/pathUtils";
import { TreeStateManager } from "./stateManager";

export class PreviewChangesCommand {
  static async execute(): Promise<void> {
    try {
      const editor = vscode.window.activeTextEditor;
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

        await vscode.window.showErrorMessage(mismatchMsg, { modal: true });

        // if (choice === "Regenerate Tree") {
        //   await vscode.commands.executeCommand(
        //     "filetreeforge.generateMarkdown",
        //   );
        // }
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
        vscode.window.showInformationMessage("No operations marked");
        return;
      }

      // Prepare file operations
      const fileOps = OperationExecutor.prepareOperations(
        operations,
        workspaceRoot,
      );

      // Format preview
      const preview = this.formatPreview(fileOps, workspaceRoot);
      const doc = await vscode.workspace.openTextDocument({
        content: preview,
        language: "plaintext",
      });

      TreeStateManager.registerTemporaryDocument(doc.uri);
      await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
    } catch (error) {
      vscode.window.showErrorMessage(
        `Preview failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private static formatPreview(
    operations: any[],
    workspaceRoot: string,
  ): string {
    let preview = "PREVIEW MODE\n";
    preview += "═══════════════════════════════════════\n\n";

    preview += "This is a dry run. No changes have been applied yet.\n\n";

    preview += "✔ Ctrl + Enter → Apply Changes\n";
    preview += "✖ Close this tab to cancel\n\n";

    preview += "───────────────────────────────────────\n\n";

    preview += OperationExecutor.formatOperations(operations, workspaceRoot);
    return preview;
  }
}
