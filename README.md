# FileTree Forge

**A declarative filesystem refactoring language inside Markdown.**

FileTree Forge lets you visualize, edit, and refactor your project structure using explicit operation markers in Markdown. No hidden magic, no automatic diffing—just clean, predictable filesystem operations.

## 🎯 Features

- **Explicit Operation Markers**: Mark exactly what you want with `[+]`, `[-]`, `[~ newName]`
- **Clean Tree Generation**: Generate readable folder structures without clutter
- **Structure Validation**: Ensures tree matches filesystem before operations
- **Safe Execution**: Operations execute in the correct order to prevent errors
- **Keyboard Shortcuts**: `Ctrl+Shift+Enter` to preview, `Ctrl+Enter` to apply
- **Auto-Close**: Temporary documents close automatically after applying changes

## 🚀 Quick Start

### 1. Generate a Tree

Right-click any folder in the Explorer → **"FileTree Forge: Generate Markdown Tree"**

This creates a clean representation of your folder structure:

```markdown
app/
├─ api/
│ └─ route.js
├─ components/
│ └─ Button.tsx
└─ page.js
```

### 2. Mark Your Operations

Add operation markers to declare what you want to do:

```markdown
app/
├─ api/
│ ├─ route.js
│ └─ helpers.js [+]
├─ components/
│ ├─ Button.tsx
│ └─ Input.tsx [+]
└─ page.js [~ main.js]
```

### 3. Preview Changes

Press **`Ctrl+Shift+Enter`** (or **`Cmd+Shift+Enter`** on Mac)

```
PREVIEW MODE
────────────
✔ Ctrl + Enter → Apply Changes
✖ Esc → Cancel

═══════════════════════════════════════

CREATE:
  + api/helpers.js
  + components/Input.tsx

RENAME:
  page.js → main.js
```

### 4. Apply Changes

Press **`Ctrl+Enter`** (or **`Cmd+Enter`** on Mac)

Operations execute, filesystem updates, and temporary documents close automatically!

## 📋 Operation Markers

### `[+]` Create

Creates a new file or folder.

```markdown
src/
├─ utils/
│ └─ logger.ts [+]
```

**Rules:**

- Must appear at end of line
- Exactly one space before marker
- Creates file/folder at that location

### `[-]` Delete

Deletes an existing file or folder.

```markdown
src/
├─ old-utils/
│ └─ deprecated.ts [-]
```

**Rules:**

- Must appear at end of line
- Exactly one space before marker
- Requires confirmation
- Cannot delete root

### `[~ newName]` Rename

Renames a file or folder.

```markdown
src/
├─ utils/ [~ helpers]
```

**Rules:**

- Format: `[~ newName]`
- Must appear at end of line
- Exactly one space before marker
- Cannot rename root
- New name must be valid

## 🔒 Structure Validation

**Critical Feature:** Before executing any operations, FileTree Forge validates that the tree structure (excluding markers) exactly matches your filesystem.

### Why This Matters

This prevents you from accidentally applying operations to an outdated tree, ensuring you always know what will happen.

### What Happens on Mismatch

If the tree doesn't match the filesystem:

```
⚠ STRUCTURE MISMATCH

The tree structure does not match the filesystem.
Please regenerate the tree to continue.

FILES ADDED (not in tree):
  + config.json
  + .env.local

FILES REMOVED (not in filesystem):
  - old-file.js
```

**Solution:** Simply regenerate the tree to get a fresh baseline.

## ⌨️ Keyboard Shortcuts

| Action      | Windows/Linux      | Mac               | Description               |
| ----------- | ------------------ | ----------------- | ------------------------- |
| **Preview** | `Ctrl+Shift+Enter` | `Cmd+Shift+Enter` | Show what will change     |
| **Apply**   | `Ctrl+Enter`       | `Cmd+Enter`       | Execute operations        |
| **Save**    | `Ctrl+S`           | `Cmd+S`           | Save file only (no apply) |

## 🔄 Complete Workflow

```
1. Right-click folder → "Generate Markdown Tree"
   ↓
2. Edit tree, add operation markers:
   - [+] for new files/folders
   - [-] for deletions
   - [~ name] for renames
   ↓
3. Ctrl+Shift+Enter → Preview operations
   ↓
4. Review grouped operations
   ↓
5. Ctrl+Enter → Apply changes
   ↓
6. Done! Tree & preview docs close automatically
```

## 📊 Operation Execution Order

Operations execute in this safe order:

1. **Create folders** (parent before child)
2. **Create files**
3. **Rename** files/folders
4. **Delete files**
5. **Delete folders** (deepest first)

This order prevents errors like deleting a folder before its contents.

## 🛡️ Safety Features

- ✅ **Structure Validation**: Tree must match filesystem exactly
- ✅ **Workspace Scoped**: No operations outside workspace
- ✅ **Path Validation**: No absolute paths, no `..` references
- ✅ **Confirmation Dialogs**: Deletes require confirmation
- ✅ **Safe Execution Order**: Operations in correct sequence
- ✅ **Auto-Close**: Temporary documents close after apply

## ⚙️ Configuration

```json
{
  "filetree-forge.confirmBeforeApply": true,
  "filetree-forge.ignorePatterns": [
    "node_modules",
    ".git",
    ".vscode",
    "dist",
    "out",
    "build"
  ]
}
```

### Settings

- **`confirmBeforeApply`** (default: `true`): Show confirmation before applying operations
- **`ignorePatterns`** (default: `["node_modules", ".git", ...]`): Patterns to ignore when generating trees

## 📝 Examples

### Example 1: Add New Files

```markdown
# Generate tree

src/
├─ components/
│ └─ Button.tsx

# Add new component

src/
├─ components/
│ ├─ Button.tsx
│ └─ Input.tsx [+]

# Preview → Apply

# Result: Input.tsx created
```

### Example 2: Reorganize Structure

```markdown
# Before

src/
├─ Button.tsx
├─ Input.tsx

# After - create folder and mark for creation

src/
├─ components/ [+]
│ ├─ Button.tsx [+]
│ └─ Input.tsx [+]

# Note: Original files would need [-] markers
```

### Example 3: Clean Up Old Files

```markdown
src/
├─ old-utils/ [-]
├─ deprecated.ts [-]
├─ current.ts
└─ utils/
```

## ❓ FAQ

### Why does it show "Structure mismatch"?

The tree structure (without markers) must exactly match your filesystem. If files have been added, removed, or renamed outside of FileTree Forge, regenerate the tree.

### Can I move files between folders?

Not directly with a single operation. You would delete from the old location `[-]` and create in the new location `[+]`.

### What if I make a mistake?

Use version control (git) before applying major changes. FileTree Forge doesn't have undo, but you can revert using git.

### Can I use this on multiple folders at once?

Each tree is scoped to the folder you right-clicked. Generate separate trees for different folders.

## 🆚 Why FileTree Forge?

**Unlike other file tree extensions:**

- ✅ **Explicit**: You mark exactly what you want—no guessing
- ✅ **Validated**: Structure must match filesystem—no surprises
- ✅ **Safe**: Operations in correct order—no errors
- ✅ **Clean**: No UUIDs or metadata cluttering your trees
- ✅ **Predictable**: What you see is what you get

## 📚 Documentation

- [Quick Start Guide](docs/QUICKSTART.md)
- [Installation](docs/INSTALLATION.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Developer Guide](docs/DEVELOPER_GUIDE.md)

## 🐛 Known Limitations

- No undo functionality (use version control)
- Cannot move files in a single operation (delete + create)
- No file content editing (structure only)
- Trees are scoped to a single folder

## 🤝 Contributing

Issues and pull requests are welcome! Please read the [Developer Guide](docs/DEVELOPER_GUIDE.md) before contributing.

## 📄 License

MIT - see [LICENSE](LICENSE) file for details.

## 🎯 Philosophy

> "A declarative filesystem refactoring language inside Markdown."

FileTree Forge is built on the principle of **explicit over implicit**. You mark what you want, review it, and apply it. No hidden magic, no automatic diffing, no surprises.

---

**Made with ❤️ for developers who value clarity and control.**
