# FILETREEFORGE - Project Overview

## What is FILETREEFORGE?

FILETREEFORGE is a **production-ready VS Code extension** that allows developers to view, edit, and apply project folder structures using editable Markdown or JSON representations.

Think of it as "Infrastructure as Code" but for your project file structure.

## Key Features

✅ **Bidirectional Editing**: Edit tree → Apply to filesystem
✅ **Two Modes**: Markdown and JSON representations
✅ **Smart Diff Engine**: Detects renames (not delete+create)
✅ **Safe Operations**: Confirmations, preview mode, path validation
✅ **Workspace Scoped**: All operations confined to workspace
✅ **Professional Quality**: Clean architecture, error handling, documentation

## Why FILETREEFORGE?

### Problem
- Manually creating project structures is tedious
- Refactoring folder hierarchies is error-prone
- Documenting project structure gets out of sync
- No easy way to template or share structures

### Solution
- Edit structure as text (Markdown or JSON)
- Apply changes automatically
- Preview before executing
- Safe, validated operations

## File Structure

```
filetreeforge/
│
├── 📄 Core Configuration
│   ├── package.json              # Extension manifest & dependencies
│   ├── tsconfig.json             # TypeScript configuration
│   ├── .eslintrc.json            # ESLint rules
│   ├── .gitignore                # Git ignore patterns
│   └── .vscodeignore             # Package ignore patterns
│
├── 📁 src/                       # Source Code (TypeScript)
│   │
│   ├── extension.ts              # Entry point, command registration
│   ├── types.ts                  # Core interfaces (TreeNode, TreeDiff, etc.)
│   │
│   ├── 📁 commands/              # Command Implementations
│   │   ├── generateTree.ts      # Generate tree from filesystem
│   │   ├── applyChanges.ts      # Apply tree to filesystem
│   │   ├── previewChanges.ts    # Preview diff without applying
│   │   ├── toggleMode.ts        # Convert MD ↔ JSON
│   │   └── stateManager.ts      # Track last applied tree
│   │
│   ├── 📁 parser/                # Tree Parsers & Serializers
│   │   ├── markdownParser.ts    # Parse Markdown → TreeNode
│   │   ├── jsonParser.ts        # Parse JSON → TreeNode
│   │   └── treeSerializer.ts    # TreeNode → Markdown/JSON
│   │
│   ├── 📁 diff/                  # Diff Engine
│   │   └── diffTrees.ts         # Compare trees, detect renames
│   │
│   ├── 📁 fs/                    # Filesystem Operations
│   │   └── applyDiff.ts         # Apply diff to real filesystem
│   │
│   └── 📁 utils/                 # Utilities
│       ├── pathUtils.ts         # Path validation & safety
│       └── validation.ts        # Tree structure validation
│
├── 📁 out/                       # Compiled JavaScript (generated)
│
├── 📁 .vscode/                   # VS Code Configuration
│   ├── launch.json              # Debug configuration
│   └── tasks.json               # Build tasks
│
├── 📁 examples/                  # Example Files
│   ├── example-tree.md          # Example Markdown tree
│   ├── example-tree.json        # Example JSON tree
│   └── USAGE_EXAMPLES.md        # Detailed usage examples
│
└── 📁 Documentation
    ├── README.md                # User guide
    ├── QUICKSTART.md            # 5-minute quick start
    ├── INSTALLATION.md          # Setup guide
    ├── DEVELOPER_GUIDE.md       # Architecture & internals
    └── CHANGELOG.md             # Version history
```

## Core Components

### 1. Data Model (`src/types.ts`)

```typescript
interface TreeNode {
  id: string;              // Stable UUID
  name: string;            // Node name
  type: "file" | "folder";
  children?: TreeNode[];
}
```

The TreeNode is the **single source of truth**.

### 2. Parsers (`src/parser/`)

- **markdownParser.ts**: Markdown → TreeNode
- **jsonParser.ts**: JSON → TreeNode
- **treeSerializer.ts**: TreeNode → Markdown/JSON

Bidirectional conversion with validation.

### 3. Diff Engine (`src/diff/diffTrees.ts`)

Compares trees by **ID** to detect:
- Creates (new nodes)
- Deletes (missing nodes)
- Renames (same ID, different path)

### 4. Apply Engine (`src/fs/applyDiff.ts`)

Applies operations in safe order:
1. Create folders
2. Create files
3. Rename files/folders
4. Delete files
5. Delete folders

### 5. Commands (`src/commands/`)

Five main commands:
1. Generate Markdown Tree
2. Generate JSON Tree
3. Preview Changes
4. Apply Changes
5. Toggle Mode

## Technology Stack

- **Language**: TypeScript 5.3+
- **Runtime**: Node.js 18+
- **Platform**: VS Code Extension API 1.85+
- **Dependencies**: uuid (for ID generation)
- **Dev Dependencies**: ESLint, TypeScript ESLint

## Design Principles

1. **Safety First**: All paths validated, confirmations for destructive ops
2. **Clean Architecture**: Separation of concerns, modular design
3. **User Experience**: Clear errors, helpful messages, preview mode
4. **Deterministic**: Same input → same output, always
5. **No Magic**: Explicit, predictable behavior

## Workflow

```
┌─────────────────┐
│   Filesystem    │
└────────┬────────┘
         │
         ↓ Generate
┌─────────────────┐
│  Tree Document  │ (Markdown or JSON)
│  (Editable)     │
└────────┬────────┘
         │
         ↓ Edit
┌─────────────────┐
│  Modified Tree  │
└────────┬────────┘
         │
         ↓ Parse
┌─────────────────┐
│    TreeNode     │
└────────┬────────┘
         │
         ↓ Diff
┌─────────────────┐
│    TreeDiff     │
└────────┬────────┘
         │
         ↓ Apply
┌─────────────────┐
│   Filesystem    │ (Updated)
└─────────────────┘
```

## Testing Strategy

- **Unit Tests**: Parsers, validators, diff logic
- **Integration Tests**: Full workflow end-to-end
- **Manual Tests**: Real-world projects, edge cases

## Security & Safety

✅ Path validation (no .., no absolute paths)
✅ Workspace scoped (no operations outside workspace)
✅ Confirmation dialogs for destructive operations
✅ Preview mode (dry run)
✅ Error handling with detailed messages

## Documentation Structure

1. **README.md**: User-facing documentation
2. **QUICKSTART.md**: Get started in 5 minutes
3. **INSTALLATION.md**: Detailed setup instructions
4. **DEVELOPER_GUIDE.md**: Architecture and internals
5. **USAGE_EXAMPLES.md**: Real-world examples
6. **CHANGELOG.md**: Version history

## Use Cases

- **Project Setup**: Template new projects instantly
- **Refactoring**: Reorganize large codebases safely
- **Documentation**: Always up-to-date structure docs
- **Onboarding**: Visual project overview for new developers
- **Standardization**: Enforce consistent project structures

## Limitations

- Structure only (no file contents)
- Single workspace (no cross-project operations)
- No undo (use version control)
- No merge conflict resolution

## Future Enhancements

- Undo/redo functionality
- Git integration
- File content preview
- Templates library
- WebView UI
- Bulk refactoring tools

## Contributing

This is a reference implementation demonstrating best practices for VS Code extension development. Contributions welcome!

## License

MIT

## Credits

Built as a production-ready example of:
- VS Code extension development
- TypeScript best practices
- Clean architecture patterns
- Safe filesystem operations
- Bidirectional data transformation

---

**FILETREEFORGE** - Edit your project structure as code 🚀

For questions or issues, please refer to the documentation or open a GitHub issue.
