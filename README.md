# FILETREEFORGE v1.0

**A declarative filesystem refactoring language inside Markdown.**

Complete architectural rewrite with explicit operation markers. No more UUID-based diffing or implicit changes.

## 🎯 What Changed in v1.0

### REMOVED ❌

- UUID system (`<!-- id: xxx -->`)
- Implicit diff-based operations
- Rename guessing
- Structural auto-diff
- JSON support

### ADDED ✅

- **Explicit operation markers**: `[+]`, `[-]`, `[~ newName]`
- **Structure validation**: Tree must match filesystem before operations
- **Declarative approach**: You explicitly mark what you want

## 📝 How It Works

### 1. Generate Clean Tree

Right-click folder → **Generate Markdown Tree**

```markdown
app/
├─ api/
│ ├─ functions/
│ │ └─ route.js
│ └─ pill-guide/
│ └─ getNews/
│ └─ route.js
├─ layout.js
└─ page.js
```

**No markers, no UUIDs, just clean structure.**

### 2. Mark Your Operations

Add explicit markers to declare what you want:

#### Create: `[+]`

```markdown
app/
├─ api/
│ ├─ functions/
│ │ └─ route.js
│ │ └─ helpers.js [+]
```

#### Delete: `[-]`

```markdown
app/
├─ api/
│ ├─ functions/
│ │ └─ route.js [-]
```

#### Rename: `[~ newName]`

```markdown
app/
├─ api/
│ ├─ functions/ [~ handlers]
```

### 3. Preview - `Ctrl+Shift+Enter`

```
PREVIEW MODE
────────────

CREATE:
  + api/functions/helpers.js

RENAME:
  api/functions → api/handlers
```

### 4. Apply - `Ctrl+Enter`

Changes applied! Tree and preview tabs close automatically.

## 📋 Operation Markers

### `[+]` - Create

Creates a new file or folder.

- Must appear at end of line
- One space before marker

### `[-]` - Delete

Deletes a file or folder.

- Cannot delete root
- Confirmation required

### `[~ newName]` - Rename

Renames a file or folder.

- Format: `[~ newName]`
- Cannot rename root

## 🔒 Structure Validation

**CRITICAL:** The tree structure (minus markers) must exactly match the filesystem.

### ✅ Valid

```markdown
# Filesystem has: app/page.js, app/layout.js

app/
├─ page.js
└─ layout.js [~ main.js]
```

### ❌ Invalid

```markdown
# Filesystem has: app/page.js, app/layout.js

# Tree shows: app/page.js, app/main.js

ERROR: Structure mismatch
```

**Solution:** Regenerate tree to get fresh baseline.

## ⚠️ Validation Rules

1. **Cannot combine markers**

   ```markdown
   ❌ src/file.js [+] [-]
   ```

2. **Must use markers for changes**

   ```markdown
   ❌ Adding newfile.js without [+] marker
   ✅ newfile.js [+]
   ```

3. **Marker format strict**
   - Exactly one space before marker
   - Only `[+]`, `[-]`, `[~ name]` allowed

## ⌨️ Keyboard Shortcuts

| Action      | Shortcut            |
| ----------- | ------------------- |
| **Preview** | `Ctrl+Shift+Enter`  |
| **Apply**   | `Ctrl+Enter`        |
| **Save**    | `Ctrl+S` (no apply) |

## 🔄 Complete Workflow

```
1. Right-click folder → Generate Tree
2. Edit tree, add markers
3. Ctrl+Shift+Enter → Preview
4. Ctrl+Enter → Apply
```

## 📊 Operation Order

1. Create folders (parent first)
2. Create files
3. Rename files/folders
4. Delete files
5. Delete folders (deepest first)

## 🛡️ Safety Features

- ✅ Structure validation before operations
- ✅ Workspace scoped
- ✅ No absolute paths, no `..`
- ✅ Confirmation for deletes
- ✅ Safe execution order

## 📝 Example

```markdown
# Generate

src/
├─ components/
│ └─ Button.tsx

# Add marker

src/
├─ components/
│ ├─ Button.tsx
│ └─ Input.tsx [+]

# Preview → Apply

# Result: Input.tsx created
```

## 🆚 v2.x vs v1.0

| Feature              | v2.x  | v1.0        |
| -------------------- | ----- | ----------- |
| UUIDs                | ✅    | ❌ Removed  |
| Diff engine          | ✅    | ❌ Removed  |
| Operation markers    | ❌    | ✅ Explicit |
| Structure validation | Drift | ✅ Strict   |

## 🎯 Philosophy

> "A declarative filesystem refactoring language inside Markdown."

**v1.0 is:**

- **Explicit**: You mark what you want
- **Predictable**: No hidden magic
- **Safe**: Structure validated before operations

---

**FILETREEFORGE v1.0 - Declarative filesystem refactoring.** 🚀
