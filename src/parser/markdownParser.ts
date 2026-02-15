/**
 * Markdown parser with explicit operation markers
 * Parses [+], [-], [~ newName] markers
 */

import { TreeNode, ParseError, Operation } from "../types";
import { PathUtils } from "../utils/pathUtils";

interface ParsedLine {
  indent: number;
  name: string;
  isFolder: boolean;
  lineNumber: number;
  operation?: Operation;
  renameTo?: string;
}

export class MarkdownParser {
  /**
   * Parse markdown content with operation markers
   */
  static parse(content: string): {
    tree: TreeNode | null;
    errors: ParseError[];
  } {
    const errors: ParseError[] = [];
    const lines = content.split("\n");

    const parsedLines: ParsedLine[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      const trimmed = line.trim();

      // Skip empty lines
      if (trimmed === "") {
        continue;
      }

      // Skip all lines starting with # (headers, comments)
      if (trimmed.startsWith("#")) {
        continue;
      }

      // Skip HTML comments
      if (trimmed.startsWith("<!--")) {
        continue;
      }

      // Only parse tree structure lines
      const hasTreeSymbol =
        line.includes("├─") || line.includes("└─") || line.includes("│");
      const looksLikePath =
        trimmed.endsWith("/") || trimmed.match(/\.\w+\s*(\[|$)/);

      if (!hasTreeSymbol && !looksLikePath) {
        continue;
      }

      // Parse the line
      const parsed = this.parseLine(line, lineNumber);
      if (parsed.error) {
        errors.push(parsed.error);
        continue;
      }

      if (parsed.line) {
        parsedLines.push(parsed.line);
      }
    }

    if (errors.length > 0) {
      return { tree: null, errors };
    }

    if (parsedLines.length === 0) {
      return {
        tree: null,
        errors: [{ message: "No valid tree structure found" }],
      };
    }

    // Build tree from parsed lines
    try {
      const tree = this.buildTree(parsedLines);
      return { tree, errors: [] };
    } catch (e) {
      return {
        tree: null,
        errors: [{ message: e instanceof Error ? e.message : String(e) }],
      };
    }
  }

  /**
   * Parse a single line with operation markers
   */
  private static parseLine(
    line: string,
    lineNumber: number,
  ): { line?: ParsedLine; error?: ParseError } {
    // Remove tree symbols for parsing
    let cleanLine = line.replace(/[├└│]─?\s*/g, "");
    cleanLine = cleanLine.trim();

    // Calculate indent
    const leadingSpaces = line.match(/^(\s*)/)?.[1].length || 0;
    const pipeCount = (line.split(/[├└]/)[0].match(/│/g) || []).length;
    const indentLevel = pipeCount * 2;

    // Extract operation marker and name
    let operation: Operation | undefined;
    let renameTo: string | undefined;
    let name = cleanLine;

    // Check for operation markers at end of line
    // [+] for create
    if (cleanLine.endsWith("[+]")) {
      operation = "create";
      name = cleanLine.replace(/\s*\[\+\]\s*$/, "").trim();
    }
    // [-] for delete
    else if (cleanLine.endsWith("[-]")) {
      operation = "delete";
      name = cleanLine.replace(/\s*\[-\]\s*$/, "").trim();
    }
    // [~ newName] for rename
    else if (cleanLine.match(/\[~\s+.+\]$/)) {
      operation = "rename";
      const match = cleanLine.match(/^(.+?)\s+\[~\s+(.+?)\]$/);
      if (match) {
        name = match[1].trim();
        renameTo = match[2].trim();
      } else {
        return {
          error: {
            line: lineNumber,
            message: `Invalid rename marker format at line ${lineNumber}`,
          },
        };
      }
    }

    // Check for multiple markers (invalid)
    const markerCount = (cleanLine.match(/\[\+\]|\[-\]|\[~\s+.+?\]/g) || [])
      .length;
    if (markerCount > 1) {
      return {
        error: {
          line: lineNumber,
          message: "Cannot combine multiple operation markers on one line",
        },
      };
    }

    // Determine if folder
    const isFolder = name.endsWith("/");
    const cleanName = isFolder ? name.slice(0, -1) : name;

    // Validate name
    if (!cleanName || cleanName === "") {
      return {
        error: {
          line: lineNumber,
          message: `Empty node name at line ${lineNumber}`,
        },
      };
    }

    if (!PathUtils.isValidNodeName(cleanName)) {
      return {
        error: {
          line: lineNumber,
          message: `Invalid node name: "${cleanName}"`,
        },
      };
    }

    // Validate rename target
    if (renameTo && !PathUtils.isValidNodeName(renameTo)) {
      return {
        error: {
          line: lineNumber,
          message: `Invalid rename target: "${renameTo}"`,
        },
      };
    }

    return {
      line: {
        indent: indentLevel,
        name: cleanName,
        isFolder,
        lineNumber,
        operation,
        renameTo,
      },
    };
  }

  /**
   * Build tree structure from parsed lines
   */
  private static buildTree(lines: ParsedLine[]): TreeNode {
    const root: TreeNode = {
      name: "root",
      type: "folder",
      children: [],
    };

    const stack: { node: TreeNode; indent: number }[] = [
      { node: root, indent: -2 },
    ];

    for (const line of lines) {
      const node: TreeNode = {
        name: line.name,
        type: line.isFolder ? "folder" : "file",
        children: line.isFolder ? [] : undefined,
        operation: line.operation,
        renameTo: line.renameTo,
      };

      // Find parent
      while (
        stack.length > 0 &&
        stack[stack.length - 1].indent >= line.indent
      ) {
        stack.pop();
      }

      if (stack.length === 0) {
        throw new Error(`Invalid indentation at line ${line.lineNumber}`);
      }

      const parent = stack[stack.length - 1].node;

      if (parent.type !== "folder") {
        throw new Error(`Cannot add child to file at line ${line.lineNumber}`);
      }

      if (!parent.children) {
        parent.children = [];
      }

      parent.children.push(node);

      if (node.type === "folder") {
        stack.push({ node, indent: line.indent });
      }
    }

    return root;
  }
}
