# FileTree Forge - Quick Start Guide

Get up and running with FileTree Forge in 5 minutes!

## Installation

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Search for "FileTree Forge"
4. Click Install

Or install from the [VS Code Marketplace](https://marketplace.visualstudio.com/).

## Your First Refactoring

### Step 1: Generate a Tree (30 seconds)

1. Open a project in VS Code
2. In the Explorer, **right-click any folder**
3. Select **"FileTree Forge: Generate Markdown Tree"**

You'll see a document like this:

```markdown
app/
├─ api/
│ └─ route.js
├─ components/
│ └─ Button.tsx
└─ page.js
```

### Step 2: Mark Your Operations (1 minute)

Let's add a new file and rename an existing one:

```markdown
app/
├─ api/
│ ├─ route.js
│ └─ helpers.js [+]
├─ components/
│ └─ Button.tsx
└─ page.js [~ main.js]
```

**What we did:**

- Added `[+]` after `helpers.js` to create it
- Added `[~ main.js]` after `page.js` to rename it

### Step 3: Preview (30 seconds)

Press **`Ctrl+Shift+Enter`** (or **`Cmd+Shift+Enter`** on Mac)

You'll see:

```
PREVIEW MODE
────────────
✔ Ctrl + Enter → Apply Changes
✖ Esc → Cancel

═══════════════════════════════════════

CREATE:
  + api/helpers.js

RENAME:
  page.js → main.js
```

### Step 4: Apply (10 seconds)

Press **`Ctrl+Enter`** (or **`Cmd+Enter`** on Mac)

✅ Done! The files are created/renamed, and the tree document closes automatically.

## The Three Operation Markers

### `[+]` Create

```markdown
src/
└─ newfile.js [+]
```

Creates a new file or folder.

### `[-]` Delete

```markdown
src/
└─ oldfile.js [-]
```

Deletes a file or folder (with confirmation).

### `[~ newName]` Rename

```markdown
src/
└─ oldname.js [~ newname.js]
```

Renames a file or folder.

## Essential Rules

1. **One space before marker**: `file.js [+]` ✅ not `file.js[+]` ❌
2. **End of line only**: Markers must be at the end
3. **One marker per line**: Can't combine `[+]` and `[-]`
4. **Structure must match**: Tree must match your filesystem

## Common Tasks

### Create a New Folder with Files

```markdown
src/
├─ components/
└─ utils/ [+]
├─ logger.ts [+]
└─ helpers.ts [+]
```

### Delete Multiple Files

```markdown
src/
├─ old-utils/ [-]
├─ deprecated.ts [-]
└─ current.ts
```

### Rename a Folder

```markdown
src/
└─ old-components/ [~ components]
```

## Keyboard Shortcuts

| Action  | Windows/Linux      | Mac               |
| ------- | ------------------ | ----------------- |
| Preview | `Ctrl+Shift+Enter` | `Cmd+Shift+Enter` |
| Apply   | `Ctrl+Enter`       | `Cmd+Enter`       |
| Save    | `Ctrl+S`           | `Cmd+S`           |

## What If Something Goes Wrong?

### "Structure mismatch" Error

**Cause:** Someone modified files outside FileTree Forge, so the tree doesn't match the filesystem.

**Solution:** Regenerate the tree:

1. Right-click the folder again
2. Select "Generate Markdown Tree"
3. Start fresh

### Accidentally Applied Wrong Changes

**Solution:** Use git to revert:

```bash
git checkout -- .
```

**Prevention:** Always preview before applying!

### Marker Not Working

**Check:**

- ✅ Exactly one space before marker
- ✅ Marker at end of line
- ✅ Valid marker: `[+]`, `[-]`, or `[~ newName]`
- ✅ No typos in marker

## Tips & Best Practices

1. **Always Preview First**: Use `Ctrl+Shift+Enter` before applying
2. **Use Version Control**: Commit before major refactoring
3. **Start Small**: Try with a small folder first
4. **One Operation Type**: Don't mix too many operations at once
5. **Regenerate Often**: If unsure, regenerate the tree

## Example Workflow

Let's reorganize a project:

```markdown
# Initial structure

src/
├─ Button.tsx
├─ Input.tsx
├─ utils.ts

# Goal: Organize into folders

# Step 1: Add folders

src/
├─ components/ [+]
│ ├─ Button.tsx [+]
│ └─ Input.tsx [+]
├─ utils/ [+]
│ └─ utils.ts [+]
├─ Button.tsx [-]
├─ Input.tsx [-]
└─ utils.ts [-]

# Step 2: Preview

# Step 3: Apply

# Step 4: Done!
```

**Note:** In this case, we're essentially copying to new locations and deleting the old ones (no direct "move" operation).

## Next Steps

- Read the full [README](../README.md) for all features
- Check out [examples](../examples/) for more complex scenarios
- Review [Architecture](ARCHITECTURE.md) to understand how it works
- See [Developer Guide](DEVELOPER_GUIDE.md) to contribute

## Need Help?

- Check the [README FAQ](../README.md#faq)
- Report issues on GitHub
- Read the [Architecture docs](ARCHITECTURE.md)

---

**You're ready to use FileTree Forge!** 🚀

Remember: Explicit is better than implicit. Mark what you want, preview it, apply it.
