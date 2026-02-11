/**
 * Markdown tree parser with tree symbols and UUID support
 * Parses markdown representation into TreeNode structure
 */

import { TreeNode, ParseError, ValidationResult } from "../types";
import { PathUtils } from "../utils/pathUtils";
import { v4 as uuidv4 } from "uuid";

interface ParsedLine {
  indent: number;
  name: string;
  isFolder: boolean;
  lineNumber: number;
  id?: string;
}

export class MarkdownParser {
  /**
   * Parse markdown content into tree structure
   */
  static parse(content: string): {
    tree: TreeNode | null;
    errors: ParseError[];
  } {
    const errors: ParseError[] = [];
    const lines = content.split("\n");

    // Find the start of the tree (after headers and comments)
    let startIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (
        trimmed.startsWith("#") ||
        trimmed === "" ||
        trimmed.startsWith("<!--")
      ) {
        startIndex = i + 1;
      } else {
        break;
      }
    }

    const parsedLines: ParsedLine[] = [];

    // Parse each line
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Skip empty lines and comments
      if (line.trim() === "" || line.trim().startsWith("<!--")) {
        continue;
      }

      // Parse line
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
   * Parse a single line with tree symbols
   */
  private static parseLine(
    line: string,
    lineNumber: number,
  ): { line?: ParsedLine; error?: ParseError } {
    // Remove tree symbols (├─ │ └─) for parsing
    const cleanLine = line.replace(/[├└│]─\s*/g, "");

    // Calculate indent based on spaces/tree symbols
    const indentMatch = line.match(/^(\s*[├└│]?\s*)/);
    const indentLevel = indentMatch
      ? Math.floor(indentMatch[1].length / 3) * 2
      : 0;

    // Extract name and optional UUID
    const nameMatch = cleanLine
      .trim()
      .match(/^(.+?)(?:\s*<!--\s*id:\s*([a-f0-9-]+)\s*-->)?$/);
    if (!nameMatch) {
      return {
        error: {
          line: lineNumber,
          message: `Invalid line format: "${line.trim()}"`,
        },
      };
    }

    const name = nameMatch[1].trim();
    const id = nameMatch[2] || uuidv4();

    // Determine if folder (ends with /)
    const isFolder = name.endsWith("/");
    const cleanName = isFolder ? name.slice(0, -1) : name;

    // Validate name
    if (!PathUtils.isValidNodeName(cleanName)) {
      return {
        error: {
          line: lineNumber,
          message: `Invalid node name: "${cleanName}"`,
        },
      };
    }

    return {
      line: {
        indent: indentLevel,
        name: cleanName,
        isFolder,
        lineNumber,
        id,
      },
    };
  }

  /**
   * Build tree structure from parsed lines
   */
  private static buildTree(lines: ParsedLine[]): TreeNode {
    const root: TreeNode = {
      id: uuidv4(),
      name: "root",
      type: "folder",
      children: [],
    };

    const stack: { node: TreeNode; indent: number }[] = [
      { node: root, indent: -2 },
    ];

    for (const line of lines) {
      const node: TreeNode = {
        id: line.id || uuidv4(),
        name: line.name,
        type: line.isFolder ? "folder" : "file",
        children: line.isFolder ? [] : undefined,
      };

      // Find parent (pop stack until we find appropriate parent)
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

  /**
   * Validate markdown content
   */
  static validate(content: string): ValidationResult {
    const { errors } = this.parse(content);
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
