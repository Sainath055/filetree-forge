# Change Log

## [1.0.0] - 2026-02-15 - Initial Public Release

### 🚀 FILETREEFORGE v1

First official release of FILETREEFORGE.

A declarative filesystem refactoring tool using Markdown inside VS Code.

---

## ✨ Core Features

### 📝 Markdown-Only Structure Editing

- Clean ASCII tree format
- No JSON mode
- No hidden metadata
- Human-readable and editable

---

### 🔥 Explicit Operation Markers

Operations are fully declarative:

- `[+]` → Create file or folder
- `[-]` → Delete file or folder
- `[~ newName]` → Rename file or folder

No automatic diff guessing.  
No implicit rename detection.  
No background magic.

---

### 🧠 Deterministic Behavior

- Structural edits require operation markers
- No silent delete + recreate
- No heuristic renames
- Clear validation before execution

---

### 👁 Preview Mode

- `Ctrl + Shift + Enter` → Preview changes
- `Ctrl + Enter` → Apply changes
- Clear grouped operations (Create / Rename / Delete)
- Destructive changes require confirmation

---

### 🔍 Filesystem Drift Detection

Before preview or apply:

- Filesystem is re-scanned
- Detects external modifications
- Blocks stale operations
- Offers refresh option

---

### 🛡 Safety Guarantees

- Workspace-scoped only
- No absolute paths
- No `..` parent traversal
- Safe execution order:
  1. Create folders
  2. Create files
  3. Rename
  4. Delete files
  5. Delete folders

---

### 🧹 Smart UX

- Right-click folder → Generate Markdown Tree
- Tree and preview tabs auto-close after apply
- `Ctrl + S` never mutates filesystem

---

## 🧭 Philosophy

> “A declarative filesystem refactoring language inside Markdown.”

FILETREEFORGE v1 focuses on:

- Clarity
- Explicit intent
- Predictability
- Safety
- Clean user experience
