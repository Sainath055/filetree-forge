# FileTree Forge - Architecture

This document explains the technical architecture of FileTree Forge.

## Overview

FileTree Forge is a VS Code extension that enables declarative filesystem refactoring through explicit operation markers in Markdown. The architecture is designed around three core principles:

1. **Explicit over Implicit**: All operations must be explicitly marked
2. **Validation First**: Structure must match filesystem before operations
3. **Safe Execution**: Operations execute in a safe, predictable order

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                       │
│  (Context Menu, Commands, Keyboard Shortcuts, Notifications) │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Command Layer                           │
│   • GenerateTreeCommand                                      │
│   • PreviewChangesCommand                                    │
│   • ApplyChangesCommand                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Parser Layer                             │
│   • MarkdownParser (parse tree with markers)                 │
│   • TreeSerializer (generate clean trees)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Validation Layer                           │
│   • StructureValidator (validate tree vs filesystem)         │
│   • ValidationUtils (validate tree structure)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Operation Layer                            │
│   • OperationExtractor (extract marked operations)           │
│   • OperationExecutor (execute operations safely)            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Filesystem Layer                            │
│   • scanTree (scan filesystem)                               │
│   • VS Code Workspace API (create/delete/rename)             │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Command Layer (`src/commands/`)

#### GenerateTreeCommand

- **Purpose**: Generate clean Markdown tree from filesystem
- **Input**: Folder URI (from context menu or command palette)
- **Output**: Markdown document with tree structure
- **Process**:
  1. Scan filesystem using `scanTree()`
  2. Build `TreeNode` structure (no operations)
  3. Serialize to Markdown using `TreeSerializer`
  4. Store as baseline in `TreeStateManager`
  5. Open document and register as temporary

#### PreviewChangesCommand

- **Purpose**: Show what operations will be executed
- **Input**: Active Markdown editor with marked tree
- **Output**: Preview document with grouped operations
- **Process**:
  1. Parse Markdown to `TreeNode` with `MarkdownParser`
  2. Validate structure matches filesystem with `StructureValidator`
  3. Extract operations with `OperationExtractor`
  4. Prepare file operations with `OperationExecutor`
  5. Format and display grouped preview

#### ApplyChangesCommand

- **Purpose**: Execute marked operations on filesystem
- **Input**: Active Markdown editor or preview document
- **Output**: Updated filesystem, closed temp documents
- **Process**:
  1. Parse Markdown to `TreeNode`
  2. Validate structure matches filesystem
  3. Extract and validate operations
  4. Show confirmation if configured
  5. Execute operations with `OperationExecutor`
  6. Regenerate baseline
  7. Close temporary documents

#### TreeStateManager

- **Purpose**: Manage extension state
- **State**:
  - `lastAppliedTree`: Baseline tree for validation
  - `temporaryDocuments`: Set of temp document URIs
  - `lastGeneratedRootPath`: Last generated folder path
- **Methods**:
  - `setLastAppliedTree()`: Store baseline
  - `getLastAppliedTree()`: Retrieve baseline
  - `registerTemporaryDocument()`: Track temp docs
  - `closeTemporaryDocuments()`: Close all temp docs

### 2. Parser Layer (`src/parser/`)

#### MarkdownParser

- **Purpose**: Parse Markdown with operation markers
- **Input**: Markdown string
- **Output**: `TreeNode` structure with operations
- **Algorithm**:
  1. Split into lines
  2. Skip headers, comments, empty lines
  3. Parse each tree line:
     - Extract tree symbols (`├─`, `└─`, `│`)
     - Calculate indentation
     - Extract operation markers (`[+]`, `[-]`, `[~ name]`)
     - Validate marker format
  4. Build tree structure from parsed lines
  5. Return tree and errors

**Marker Parsing:**

```typescript
// [+] - Create
if (line.endsWith("[+]")) {
  operation = "create";
  name = line.replace(/\s*\[\+\]\s*$/, "");
}

// [-] - Delete
if (line.endsWith("[-]")) {
  operation = "delete";
  name = line.replace(/\s*\[-\]\s*$/, "");
}

// [~ newName] - Rename
if (line.match(/\[~\s+.+\]$/)) {
  operation = "rename";
  const match = line.match(/^(.+?)\s+\[~\s+(.+?)\]$/);
  name = match[1];
  renameTo = match[2];
}
```

#### TreeSerializer

- **Purpose**: Generate clean Markdown from tree
- **Input**: `TreeNode` structure
- **Output**: Markdown string (no markers)
- **Algorithm**:
  1. Recursively traverse tree
  2. Generate tree symbols based on position
  3. Add trailing `/` for folders
  4. Format with proper indentation

### 3. Validation Layer

#### StructureValidator

- **Purpose**: Validate tree matches filesystem
- **Input**: `TreeNode`, workspace root, ignore patterns
- **Output**: Validation result with mismatch details
- **Algorithm**:
  1. Extract expected paths from tree (excluding `[+]` nodes)
  2. Scan actual filesystem paths
  3. Compare: `added = actual - expected`, `removed = expected - actual`
  4. If mismatch, return detailed report

**Why This Matters:**

- Prevents operations on stale trees
- Ensures user knows exact filesystem state
- Avoids surprises from external changes

#### ValidationUtils

- **Purpose**: Validate tree structure rules
- **Validations**:
  - Valid node names (no slashes, special chars)
  - Files cannot have children
  - No duplicate names in same folder
  - Operation markers valid
  - Rename has target name

### 4. Operation Layer (`src/fs/`)

#### OperationExtractor

- **Purpose**: Extract marked operations from tree
- **Input**: `TreeNode` with operations
- **Output**: Array of `OperationNode`
- **Algorithm**:
  1. Recursively traverse tree
  2. For each node with operation:
     - Build path array
     - Create `OperationNode` with path and operation
     - For renames, build new path
  3. Validate operations (no root operations)

#### OperationExecutor

- **Purpose**: Execute operations safely
- **Input**: Array of `OperationNode`, workspace root
- **Output**: Executed file operations
- **Algorithm**:
  1. Convert to `FileOperation` with full paths
  2. Validate path safety (no absolute, no `..`)
  3. Sort in safe order:
     - Create folders (by depth ascending)
     - Create files
     - Rename operations
     - Delete files
     - Delete folders (by depth descending)
  4. Execute operations sequentially

**Safe Order Example:**

```
Operations: Create folder, Create file in folder, Delete file

Sorted:
1. Create folder (parent first)
2. Create file (after parent exists)
3. Delete file (before parent deleted)
```

### 5. Filesystem Layer (`src/fs/`)

#### scanTree

- **Purpose**: Scan filesystem into `TreeNode`
- **Input**: Directory path, workspace root, ignore patterns
- **Output**: `TreeNode` structure
- **Algorithm**:
  1. Read directory with `vscode.workspace.fs.readDirectory()`
  2. Sort entries (folders first, then alphabetically)
  3. Filter ignored patterns
  4. Recursively scan subdirectories
  5. Build tree structure

## Data Models

### TreeNode

```typescript
interface TreeNode {
  name: string; // Node name (no path)
  type: "file" | "folder"; // Node type
  children?: TreeNode[]; // Children (folders only)
  operation?: Operation; // Marked operation
  renameTo?: string; // Rename target
}
```

### OperationNode

```typescript
interface OperationNode {
  node: TreeNode; // The tree node
  path: string[]; // Path as array
  operation: Operation; // Operation type
  newPath?: string[]; // New path (rename only)
}
```

### FileOperation

```typescript
interface FileOperation {
  type: "create" | "delete" | "rename";
  path: string; // Full filesystem path
  newPath?: string; // New path (rename only)
  nodeType: "file" | "folder";
}
```

## Execution Flow

### Generate Flow

```
User right-clicks folder
  ↓
GenerateTreeCommand.execute()
  ↓
scanTree(folderPath)
  ↓
TreeSerializer.toMarkdown(tree)
  ↓
Create Markdown document
  ↓
TreeStateManager.setLastAppliedTree(tree)
  ↓
Register as temporary document
  ↓
Show document to user
```

### Preview Flow

```
User presses Ctrl+Shift+Enter
  ↓
PreviewChangesCommand.execute()
  ↓
MarkdownParser.parse(content)
  ↓
StructureValidator.validate(tree, filesystem)
  ↓
If mismatch → Show error, return
  ↓
OperationExtractor.extract(tree)
  ↓
OperationExecutor.prepareOperations()
  ↓
Format operations by type
  ↓
Show preview document
```

### Apply Flow

```
User presses Ctrl+Enter
  ↓
ApplyChangesCommand.execute()
  ↓
MarkdownParser.parse(content)
  ↓
StructureValidator.validate(tree, filesystem)
  ↓
If mismatch → Show error, return
  ↓
OperationExtractor.extract(tree)
  ↓
OperationExtractor.validate(operations)
  ↓
Show confirmation dialog
  ↓
OperationExecutor.execute(operations)
  ↓
Regenerate baseline: scanTree()
  ↓
TreeStateManager.setLastAppliedTree(newTree)
  ↓
TreeStateManager.closeTemporaryDocuments()
  ↓
Show success message
```

## Design Decisions

### Why Explicit Markers?

**Decision**: Require explicit operation markers instead of automatic diffing.

**Rationale**:

- **Predictability**: User knows exactly what will happen
- **Clarity**: No hidden rename detection logic
- **Simplicity**: Easier to understand and debug
- **Safety**: Less chance of unexpected operations

**Trade-off**: More verbose, but much safer and clearer.

### Why Structure Validation?

**Decision**: Validate tree matches filesystem before operations.

**Rationale**:

- **Prevents stale operations**: No operations on outdated trees
- **User awareness**: User knows exact state before changes
- **Safety**: Avoids surprises from external changes
- **Explicit baseline**: Clear what the "before" state is

**Trade-off**: Extra validation step, but prevents errors.

### Why No Move Operation?

**Decision**: No single "move" operation; use delete + create.

**Rationale**:

- **Simplicity**: Fewer operation types
- **Explicit**: User sees both delete and create
- **Atomic**: Can be implemented with existing operations
- **Clear intent**: No ambiguity about what happens

**Trade-off**: More verbose for moves, but clearer semantics.

### Why Auto-Close Temp Documents?

**Decision**: Close tree and preview documents after apply.

**Rationale**:

- **Clean workspace**: Removes clutter
- **Clear workflow**: Operation is complete
- **User expectation**: Temp documents not needed after apply

**Trade-off**: User can't review tree after apply, but can regenerate.

## Security & Safety

### Path Validation

```typescript
PathUtils.isPathSafe(path, workspaceRoot)
- Rejects absolute paths
- Rejects parent references (..)
- Ensures within workspace
- Validates node names
```

### Operation Order

```typescript
1. Create folders (parent → child)
2. Create files
3. Rename
4. Delete files
5. Delete folders (child → parent)
```

This order prevents:

- Creating files in non-existent folders
- Deleting folders before their contents
- Renaming into non-existent paths

### Workspace Scoping

- All operations confined to workspace root
- No access to files outside workspace
- Paths validated against workspace

## Performance Considerations

### Tree Scanning

- **Optimization**: Use `vscode.workspace.fs` (async)
- **Ignore patterns**: Skip large folders (node_modules)
- **Lazy loading**: Only scan when requested

### Operation Execution

- **Sequential**: Operations execute one at a time
- **Batching**: Could batch creates/deletes (future)
- **Progress**: Show progress for large operations

### Memory

- **Tree size**: Held in memory during operations
- **Deep clones**: Used to prevent mutations
- **Cleanup**: Temp documents closed after apply

## Extension Points

Future enhancements could include:

1. **Custom validators**: User-defined validation rules
2. **Operation plugins**: Custom operation types
3. **Templates**: Predefined tree structures
4. **Batch mode**: Multiple folders at once
5. **Undo stack**: Operation history

## Testing Strategy

### Unit Tests

- Parser: Validate marker parsing
- Validator: Check structure validation
- Executor: Test operation ordering

### Integration Tests

- Full workflow: Generate → Mark → Preview → Apply
- Error cases: Invalid markers, structure mismatch
- Edge cases: Empty trees, deep nesting

### Manual Tests

- Real project refactoring
- Large trees (1000+ files)
- Error recovery

---

**This architecture prioritizes safety, predictability, and user control over convenience and automation.**
