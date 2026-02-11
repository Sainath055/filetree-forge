# FILETREEFORGE Developer Guide

This document provides in-depth technical details for developers who want to understand, extend, or contribute to FILETREEFORGE.

## Architecture Overview

### Core Principles

1. **Single Source of Truth**: The `TreeNode` model is the canonical representation
2. **Immutable Diffs**: Diffs are pure data structures, never mutate the original trees
3. **ID-Based Comparison**: Node IDs persist across parses for accurate rename detection
4. **Safety First**: All paths validated, all operations confirmed
5. **Deterministic Ordering**: Operations always applied in the same, safe order

### Data Flow

```
┌─────────────┐
│ Filesystem  │
└──────┬──────┘
       │ scan
       ↓
┌─────────────────┐
│ TreeNode (AST)  │ ← Single source of truth
└────┬───────┬────┘
     │       │
     ↓       ↓
┌─────────┐ ┌─────────┐
│ Markdown│ │  JSON   │
└────┬────┘ └────┬────┘
     │           │
     └─────┬─────┘
           ↓
    ┌─────────────┐
    │  User Edit  │
    └──────┬──────┘
           │ parse
           ↓
    ┌─────────────┐
    │  New Tree   │
    └──────┬──────┘
           │ diff
           ↓
    ┌─────────────┐
    │  TreeDiff   │
    └──────┬──────┘
           │ apply
           ↓
    ┌─────────────┐
    │ Filesystem  │
    └─────────────┘
```

## Core Modules

### 1. Types (`src/types.ts`)

Defines all core interfaces:

```typescript
interface TreeNode {
  id: string;              // UUID - persists across parses
  name: string;            // Node name only (no paths)
  type: "file" | "folder";
  children?: TreeNode[];
}

interface TreeDiff {
  created: TreeNode[];     // Nodes to create
  deleted: TreeNode[];     // Nodes to delete
  renamed: {               // Nodes to rename
    from: TreeNode;
    to: TreeNode;
  }[];
}
```

**Design Decision**: IDs are the stable identifier. Names and paths can change, but the ID stays the same. This is crucial for rename detection.

### 2. Parsers (`src/parser/`)

#### Markdown Parser

**Syntax Rules:**
- Lines start with `- `
- Indentation must be multiples of 2 spaces
- Folders end with `/`
- Files have extensions or no trailing `/`

**Algorithm:**
1. Skip header and comments
2. Parse each line into `{indent, name, isFolder}`
3. Build tree using stack-based approach
4. Generate UUIDs for each node

**Error Handling:**
- Line-specific errors with line numbers
- Indentation validation
- Name validation (no slashes, no parent refs)

#### JSON Parser

**Validation:**
1. JSON syntax check
2. Schema validation (`name`, `type`, `children`)
3. Tree structure validation (no children on files, etc.)

**ID Handling:**
- If IDs present in JSON, preserve them
- If missing, generate new UUIDs
- This allows hand-crafted JSON or imported structures

### 3. Diff Engine (`src/diff/diffTrees.ts`)

**Algorithm:**

```typescript
function diff(oldTree, newTree):
  oldNodes = flattenTree(oldTree)  // [{node, path}]
  newNodes = flattenTree(newTree)
  
  oldById = Map(id → {node, path})
  newById = Map(id → {node, path})
  
  for each (id, newItem) in newById:
    if id not in oldById:
      → CREATED
    else:
      oldItem = oldById[id]
      if oldItem.path ≠ newItem.path:
        → RENAMED
  
  for each (id, oldItem) in oldById:
    if id not in newById:
      → DELETED
  
  return {created, deleted, renamed}
```

**Key Insight**: We compare by ID, not by path or name. This is how we detect renames correctly.

**Example:**

```
Old Tree:
  - src/
    - OldButton.tsx  (id: abc123)

New Tree:
  - src/
    - Button.tsx     (id: abc123)

Diff Result:
  renamed: [{ from: {name: "OldButton.tsx"}, to: {name: "Button.tsx"} }]
  
NOT:
  deleted: [OldButton.tsx]
  created: [Button.tsx]
```

### 4. Apply Engine (`src/fs/applyDiff.ts`)

**Operation Ordering:**

The order matters to avoid conflicts:

1. **Create folders** (parent → child)
   - Must create parent before child
   - Sorted by path depth (ascending)

2. **Create files**
   - Parent folders already exist

3. **Rename files/folders**
   - Source exists, destination parent exists

4. **Delete files**
   - Files deleted before their parent folders

5. **Delete folders** (child → parent)
   - Must delete children before parent
   - Sorted by path depth (descending)

**Safety Checks:**

```typescript
// Before ANY operation
if (!PathUtils.isPathSafe(path, workspaceRoot)) {
  throw new Error("Unsafe path");
}
```

**Rollback Strategy:**

Currently: Fail fast on first error

Future improvement: Transaction-based rollback
- Track all operations
- On failure, reverse operations
- Restore filesystem to pre-apply state

### 5. Path Utilities (`src/utils/pathUtils.ts`)

**Security Validations:**

```typescript
isPathSafe(targetPath, workspaceRoot):
  ❌ if isAbsolute(targetPath)
  ❌ if contains ".."
  ✅ resolve(workspaceRoot, targetPath) starts with workspaceRoot
  ✅ return true
```

**Node Name Validation:**

```typescript
isValidNodeName(name):
  ❌ if empty or whitespace only
  ❌ if contains "/" or "\"
  ❌ if is "." or ".."
  ❌ if contains <, >, :, ", |, ?, *, or control chars
  ✅ return true
```

### 6. State Manager (`src/commands/stateManager.ts`)

**Purpose:** Track the last successfully applied tree for diff comparison

**Storage:** In-memory (resets on extension reload)

**Future Improvement:** Persist to workspace state or file

```typescript
// Usage
TreeStateManager.setLastAppliedTree(tree);  // After successful apply
const baseline = TreeStateManager.getLastAppliedTree();  // For diff
```

## Command Implementation

### Generate Tree Command

1. Get workspace root
2. Scan filesystem recursively
3. Apply ignore patterns
4. Build TreeNode structure
5. Serialize to MD or JSON
6. Open in new document

**Ignore Pattern Matching:**
- Exact match on folder/file names
- Simple glob with `*` wildcard
- Applied to each path segment

### Apply Changes Command

1. Parse current editor content
2. Get baseline tree (or prompt to generate)
3. Diff old vs new tree
4. Generate operations list
5. Show confirmation (if enabled)
6. Apply operations in order
7. Update baseline tree

**Error Handling:**
- Parse errors → show with line numbers
- Path safety violations → abort
- Filesystem errors → show detailed message
- Partial failure → report what succeeded

### Preview Changes Command

Same as Apply, but:
- `dryRun: true` flag
- Show operations in new document
- Offer to apply after preview

### Toggle Mode Command

1. Parse current content
2. Convert to TreeNode
3. Serialize to opposite format
4. Open in new document

## Extension Points

### Adding New Tree Formats

To add support for YAML, TOML, etc.:

1. Create parser in `src/parser/yamlParser.ts`
2. Implement `parse()` method returning `{tree, errors}`
3. Create serializer in `TreeSerializer`
4. Update `ToggleModeCommand` to include new format
5. Register language ID detection

### Adding New Operations

To support operations beyond create/rename/delete:

1. Extend `FileOperation` type
2. Add operation generation in `ApplyEngine`
3. Implement execution in `executeOperation()`
4. Update operation ordering if needed

### Adding Undo Support

Implementation plan:

1. Track operation history in `StateManager`
2. Implement reverse operations
3. Add `undo` command
4. Store multiple historical states

## Testing Strategy

### Unit Tests

- Path validation functions
- Tree parsing (MD and JSON)
- Diff generation
- Operation sorting

### Integration Tests

- Full workflow: generate → edit → apply
- Rename detection accuracy
- Error handling
- Edge cases (empty trees, deep nesting)

### Manual Tests

- Large projects (1000+ files)
- Concurrent edits
- Invalid inputs
- Confirmation dialogs

## Performance Considerations

### Current Performance

- Tree scanning: O(n) where n = file count
- Diff generation: O(n + m) where n,m = node counts
- Operation application: O(k) where k = operation count

### Optimization Opportunities

1. **Lazy Loading**: Don't load entire tree for large projects
2. **Incremental Diff**: Only re-parse changed portions
3. **Parallel Operations**: Apply independent operations concurrently
4. **Caching**: Cache parsed trees, reuse on minor edits

## Security Considerations

### Threat Model

**Malicious Input:**
- Absolute paths → Rejected by `isPathSafe`
- Parent refs (`..`) → Rejected by `isPathSafe`
- Symlinks → Not followed (VS Code API default)
- Path traversal → Prevented by path resolution check

**Accidental Damage:**
- Confirmation dialogs
- Preview mode
- Ignore patterns for critical folders

### Future Hardening

- Whitelist allowed file extensions
- Size limits on operations
- Rate limiting for auto-apply
- Backup before destructive operations

## Best Practices for Contributors

### Code Style

- TypeScript strict mode
- ESLint rules enforced
- Descriptive variable names
- JSDoc comments on public methods

### Error Messages

- User-friendly language
- Specific, actionable guidance
- Include context (line numbers, paths)
- Suggest solutions

### Git Workflow

- Feature branches
- Descriptive commit messages
- PR with description and testing notes
- Update CHANGELOG.md

## Future Roadmap

### Planned Features

1. **Undo/Redo**: Full operation history
2. **Git Integration**: Awareness of git status
3. **File Content**: Preview/edit file contents inline
4. **Templates**: Save/load tree templates
5. **Bulk Operations**: Multi-file refactoring
6. **Search/Filter**: Find nodes, filter by type
7. **WebView UI**: Visual tree editor
8. **Import/Export**: From/to other tools

### Non-Goals

- File content editing (use VS Code's editor)
- Version control (use git)
- Build system integration
- Language-specific features

## Troubleshooting Development

### Extension Not Loading

- Check `out/` folder exists
- Run `npm run compile`
- Reload Extension Host (Ctrl+R)
- Check Developer Tools console

### Commands Not Registered

- Verify `package.json` → `contributes.commands`
- Check `extension.ts` → `registerCommand` calls
- Ensure activation events include your command

### Parse Errors

- Add logging to parser
- Check line-by-line parsing
- Validate against expected format
- Test with minimal examples

### Diff Issues

- Log `oldById` and `newById` maps
- Verify ID preservation across parses
- Check path building logic
- Test with known rename scenarios

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [VS Code FileSystem API](https://code.visualstudio.com/api/references/vscode-api#FileSystem)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Contact

For questions, issues, or contributions, please open a GitHub issue.

---

**Happy Coding! 🚀**
