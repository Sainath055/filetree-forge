# FILETREEFORGE v1.0

**Declarative filesystem refactoring inside Markdown.**

FILETREEFORGE lets you edit your project structure as a clean Markdown tree and explicitly declare filesystem operations — safely, predictably, and visually.

No hidden diff engines.  
No UUIDs.  
No implicit rename guessing.

You decide what happens.

---

# 🚀 Features

- 📁 Generate real folder structure as Markdown
- ✏ Edit structure visually
- ➕ Create files and folders
- ➖ Delete files and folders
- 🔁 Rename files and folders
- 👁 Safe Preview before apply
- 🛡 Strict validation & workspace safety
- 🧹 Auto-close preview & tree tabs after apply

---

# 🧭 How It Works

## 1️⃣ Generate Tree

Right-click any folder in Explorer  
→ **FILETREEFORGE: Generate Markdown Tree**

Example output:

```md
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

Clean structure. No markers. No metadata.

---

## 2️⃣ Declare Operations

You explicitly mark what you want to change.

### ➕ Create

Add `[+]` at end of line:

```md
helpers.js [+]
```

---

### ➖ Delete

Add `[-]` at end of line:

```md
route.js [-]
```

---

### 🔁 Rename

Use `[~ newName]`:

```md
functions/ [~ handlers]
```

---

## 3️⃣ Preview Changes

Press:

```
Ctrl + Shift + Enter
```

Preview shows a dry run:

```
PREVIEW MODE
═══════════════════════════════

This is a dry run. No changes have been applied yet.

CREATE:
  + api/helpers.js

RENAME:
  api/functions → api/handlers
```

Nothing is modified yet.

---

## 4️⃣ Apply Changes

Press:

```
Ctrl + Enter
```

Changes are applied safely.

Tree and preview tabs close automatically.

---

# 📋 Operation Markers

| Marker        | Meaning               |
| ------------- | --------------------- |
| `[+]`         | Create file or folder |
| `[-]`         | Delete file or folder |
| `[~ newName]` | Rename file or folder |

---

# ⚠ Structure Validation (Important)

The tree structure — excluding markers — must match the real filesystem.

If it does not match, the extension will block execution.

This prevents:

- Accidental mass deletes
- Stale diffs
- Applying changes to outdated structure

If you see a mismatch error:

→ Regenerate the tree to refresh baseline.

---

# ⌨ Keyboard Shortcuts

| Action  | Shortcut                    |
| ------- | --------------------------- |
| Preview | `Ctrl + Shift + Enter`      |
| Apply   | `Ctrl + Enter`              |
| Save    | `Ctrl + S` (does NOT apply) |

---

# 🔄 Complete Workflow

```
1. Right-click folder → Generate Tree
2. Edit structure & add markers
3. Ctrl+Shift+Enter → Preview
4. Ctrl+Enter → Apply
```

---

# 🔐 Safety Guarantees

- Workspace scoped only
- No absolute paths
- No `..` traversal
- Safe execution order:
  1. Create folders
  2. Create files
  3. Rename
  4. Delete files
  5. Delete folders

- Confirmation required for deletes

---

# 🧠 Philosophy

> "A declarative filesystem refactoring language inside Markdown."

FILETREEFORGE v1 is:

- Explicit
- Predictable
- Safe
- Clean
- Developer-focused

---

# 📦 Version

**v1.0.0 — Initial public release**

---
