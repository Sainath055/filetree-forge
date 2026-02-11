/**
 * FILETREEFORGE Extension Entry Point
 * Markdown-only project folder structure editor
 */

import * as vscode from "vscode";
import { GenerateTreeCommand } from "./commands/generateTree";
import { ApplyChangesCommand } from "./commands/applyChanges";
import { PreviewChangesCommand } from "./commands/previewChanges";
import { TreeStateManager } from "./commands/stateManager";

/**
 * Extension activation
 */
export function activate(context: vscode.ExtensionContext) {
  console.log("FILETREEFORGE extension activated");

  // Register commands
  const commands = [
    vscode.commands.registerCommand(
      "filetreeforge.generateMarkdown",
      (resource?: vscode.Uri) => {
        GenerateTreeCommand.execute(resource);
      },
    ),

    vscode.commands.registerCommand("filetreeforge.applyChanges", () => {
      ApplyChangesCommand.execute();
    }),

    vscode.commands.registerCommand("filetreeforge.previewChanges", () => {
      PreviewChangesCommand.execute();
    }),
  ];

  // Add all disposables to context
  commands.forEach((cmd) => context.subscriptions.push(cmd));

  // Show welcome message on first activation
  const hasShownWelcome = context.globalState.get(
    "filetreeforge.hasShownWelcome",
    false,
  );
  if (!hasShownWelcome) {
    vscode.window.showInformationMessage(
      'FILETREEFORGE is ready! Right-click a folder and select "Generate Markdown Tree"',
      "Got it",
    );
    context.globalState.update("filetreeforge.hasShownWelcome", true);
  }
}

/**
 * Extension deactivation
 */
export function deactivate() {
  TreeStateManager.clear();
  console.log("FILETREEFORGE extension deactivated");
}
