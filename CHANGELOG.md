# Changelog

All notable changes to FileTree Forge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-02-09

### 🎉 Initial Release

FileTree Forge is a declarative filesystem refactoring extension for VS Code that uses explicit operation markers in Markdown.

### Features

#### Core Functionality

- **Generate Clean Trees**: Right-click any folder to generate a clean Markdown representation
- **Operation Markers**: Three explicit markers for filesystem operations:
  - `[+]` - Create files and folders
  - `[-]` - Delete files and folders
  - `[~ newName]` - Rename files and folders
- **Structure Validation**: Validates tree matches filesystem before executing operations
- **Preview Mode**: Review all operations grouped by type before applying
- **Safe Execution**: Operations execute in safe order to prevent errors

#### User Experience

- **Keyboard Shortcuts**:
  - `Ctrl+Shift+Enter` / `Cmd+Shift+Enter` - Preview changes
  - `Ctrl+Enter` / `Cmd+Enter` - Apply changes
  - `Ctrl+S` / `Cmd+S` - Save file only (no operations)
- **Auto-Close**: Tree and preview documents close automatically after successful apply
- **Context Menu**: Right-click integration in Explorer for easy tree generation

#### Safety & Validation

- Workspace-scoped operations (no access outside workspace)
- Path validation (no absolute paths, no `..` references)
- Structure validation before operations (prevents stale operations)
- Confirmation dialogs for destructive operations
- Safe operation ordering:
  1. Create folders (parent first)
  2. Create files
  3. Rename operations
  4. Delete files
  5. Delete folders (deepest first)

#### Configuration

- `filetree-forge.confirmBeforeApply` - Show confirmation before applying (default: true)
- `filetree-forge.ignorePatterns` - Patterns to ignore when generating trees (default: node_modules, .git, etc.)

### Architecture

#### Design Principles

- **Explicit over Implicit**: All operations must be explicitly marked
- **Validation First**: Structure must match filesystem before operations
- **No Hidden Magic**: No automatic diffing, no rename guessing
- **Clean Output**: No UUIDs, metadata, or clutter in generated trees

#### Components

- **Operation Extractor**: Extracts marked operations from tree
- **Operation Executor**: Executes operations in safe order
- **Structure Validator**: Validates tree structure matches filesystem
- **Markdown Parser**: Parses tree with operation markers
- **Tree Serializer**: Generates clean tree output

### Known Limitations

- No undo functionality (use version control)
- Cannot move files in single operation (requires delete + create)
- File contents are not editable (structure only)
- Each tree is scoped to a single folder
- No visual diff view (operations shown as text)

### Requirements

- Visual Studio Code 1.85.0 or higher
- Node.js and npm (for development)

### Documentation

- README.md - Complete user guide
- docs/QUICKSTART.md - 5-minute getting started guide
- docs/INSTALLATION.md - Installation and setup
- docs/ARCHITECTURE.md - Technical architecture
- docs/DEVELOPER_GUIDE.md - Contributing guide

---

## Future Considerations

Items being considered for future releases:

- Visual diff view for preview
- Batch operations on multiple folders
- Template system for common structures
- Export/import tree definitions
- Integration with version control systems
- Move operation (as alternative to delete + create)

---

**Note**: This changelog follows semantic versioning. Breaking changes will be clearly marked in future releases.
