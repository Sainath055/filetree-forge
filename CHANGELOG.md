# Change Log

All notable changes to the "FILETREEFORGE" extension will be documented in this file.

## [2.1.0] - 2024-02-08 - CRITICAL BUG FIX

### 🔴 CRITICAL FIX: Parser Bug

**FIXED: Parser creating files from headers/footers/comments**

**The Bug:**

- Parser was incorrectly creating files named "ROOT FOLDER", "GENERATED", "IMPORTANT RULES", etc.
- Headers and documentation were being parsed as filesystem nodes
- Made v2.0 unusable for real projects

**The Fix:**

- Parser now **strictly ignores** all lines starting with `#`
- Parser now **strictly ignores** HTML comments (`<!-- -->`)
- Parser now **only parses** lines with tree symbols (`├─` `└─`) or valid paths
- Headers, footers, and documentation are completely skipped

**Impact:** Extension is now production-ready ✅

### Added

#### Format Version Comment

- Added `<!-- FILETREEFORGE FORMAT v1 -->` at top of generated trees
- Enables forward compatibility with future format changes

#### Updated Shortcuts in Footer

- Footer now shows keyboard shortcuts explicitly
- Updated from:
  ```markdown
  # IMPORTANT RULES

  # - Renames are detected by structure, not filenames
  ```
- To:

  ```markdown
  # Shortcuts

  # Ctrl + Shift + Enter → Preview

  # Ctrl + Enter → Apply Changes

  # IMPORTANT RULES

  # - For renames: change the file name and KEEP the <!-- id: xxxxxxxx -->

  # - Changing a file name WITHOUT an id = delete old + create new
  ```

#### Apply from Preview Document

- `Ctrl+Enter` now works from **preview document** in addition to tree document
- Extension finds the original Markdown tree automatically
- Applies changes and closes both tree and preview

#### UUID Missing Warnings

- Extension now warns when potential renames detected without UUID preservation
- Shows:
  ```
  ⚠️ "OldButton.tsx" → "Button.tsx" has different UUID.
     This will be treated as DELETE + CREATE.
     To rename: keep the same UUID (<!-- id: e5f6g7h8 -->)
  ```
- Helps prevent accidental delete+create

### Changed

- Keybinding for Apply now includes plaintext (preview documents)
- Parser logic completely rewritten for safety

### Fixed

- ✅ Parser no longer creates files from headers
- ✅ Parser no longer creates files from comments
- ✅ Parser no longer creates files from documentation
- ✅ Parser only processes actual tree structure

### Files Modified

- `src/parser/markdownParser.ts` - Complete parser rewrite
- `src/parser/treeSerializer.ts` - Added format version and updated footer
- `src/commands/previewChanges.ts` - Added UUID warnings
- `src/commands/applyChanges.ts` - Support apply from preview
- `package.json` - Updated keybindings, v2.1.0
- `examples/example-tree-v2.md` - Updated to exact format

### Acceptance Criteria (All Met)

- ✅ No header/footer text creates files
- ✅ Format version comment included
- ✅ Shortcuts shown in footer
- ✅ Apply works from preview
- ✅ UUID warnings shown
- ✅ Renames behave deterministically
- ✅ Ctrl+S never mutates filesystem
- ✅ Preview always reflects real filesystem
- ✅ Tree + Preview close after apply

---

## [2.0.0] - 2024-02-08 - MAJOR UPDATE

### 🎯 Major Changes

#### Markdown-Only

- **REMOVED**: JSON mode completely
- **REMOVED**: Toggle mode command
- **REMOVED**: All JSON-related parsers and commands
- Extension now focuses exclusively on Markdown representation

#### New Tree Format

- **ADDED**: Tree symbols in generated Markdown (`├─ │ └─`)
- **ADDED**: UUID tracking via hidden HTML comments
- **ADDED**: Metadata headers (root folder, generated time, root path)
- Format example:

  ```markdown
  # ROOT FOLDER : Login

  # GENERATED : 2/8/2026, 10:45:51 PM

  # ROOT PATH : C:\project\src

  login/
  ├─ Login.css <!-- id: 6c2d8f4b -->
  └─ Login.jsx <!-- id: 4f9e2a7d -->
  ```

#### Filesystem Drift Detection

- **ADDED**: Automatic drift detection before preview/apply
- **ADDED**: Warning dialog when filesystem changes detected
- **ADDED**: Options: Refresh Baseline, Continue Anyway, Cancel
- **ADDED**: `DriftDetector` utility in `src/fs/driftDetector.ts`
- Extension always re-scans filesystem before operations
- No more stale diffs or surprises

#### Keyboard Shortcuts

- **ADDED**: `Ctrl+Shift+Enter` (Cmd+Shift+Enter on Mac) → Preview Changes
- **ADDED**: `Ctrl+Enter` (Cmd+Enter on Mac) → Apply Changes
- **REMOVED**: Auto-apply on `Ctrl+S` (now only saves file)
- Keybindings only active when Markdown file is focused

#### Auto-Close Temporary Documents

- **ADDED**: Automatic closing of tree and preview tabs after successful apply
- **ADDED**: `TreeStateManager.registerTemporaryDocument()`
- **ADDED**: `TreeStateManager.closeTemporaryDocuments()`
- Source files remain open, only temp docs close

#### Enhanced Preview

- **ADDED**: Preview header with instructions:
  ```
  PREVIEW MODE
  ────────────
  ✔ Ctrl + Enter → Apply Changes
  ✖ Esc → Cancel
  ```

### 🔧 Technical Improvements

#### Parser Updates

- `markdownParser.ts`: Now parses tree symbols and UUID comments
- `treeSerializer.ts`: Generates new format with symbols and metadata
- Better error messages with line numbers

#### State Management

- `stateManager.ts`: Tracks temporary documents
- `stateManager.ts`: Stores last generated root path
- More robust baseline tracking

#### Safety Enhancements

- Always re-scan filesystem before operations
- Drift detection prevents stale operations
- UUID-based rename detection more reliable

### 📦 Files Added

- `src/fs/driftDetector.ts` - Filesystem drift detection
- `BUGFIXES.md` - Bug fix documentation

### 📦 Files Removed

- `src/parser/jsonParser.ts`
- `src/commands/toggleMode.ts`

### 📦 Files Modified

- `src/types.ts` - Removed `TreeMode`, added `FilesystemDriftResult`
- `src/parser/markdownParser.ts` - UUID and tree symbol support
- `src/parser/treeSerializer.ts` - New format generation
- `src/commands/generateTree.ts` - New format, root path tracking
- `src/commands/previewChanges.ts` - Drift detection
- `src/commands/applyChanges.ts` - Drift detection, auto-close
- `src/commands/stateManager.ts` - Temp document tracking
- `src/extension.ts` - Removed JSON commands
- `package.json` - Keybindings, removed JSON commands, v2.0.0

### ⚙️ Configuration Changes

- **REMOVED**: `filetreeforge.autoApplyOnSave` (no longer needed)
- **KEPT**: `filetreeforge.confirmBeforeApply` (default: true)
- **KEPT**: `filetreeforge.ignorePatterns`

### 🎯 User Experience Improvements

1. **Predictable**: Never applies stale diffs
2. **Professional**: Tree symbols look polished
3. **Safe**: Drift detection prevents mistakes
4. **Efficient**: Auto-close keeps workspace clean
5. **Intuitive**: Keybindings match user expectations

### 📚 Documentation

- Complete README rewrite for v2.0
- New examples with tree symbols
- Drift detection explained
- Keybindings documented

### ⚠️ Breaking Changes

- **JSON mode removed**: Users must use Markdown
- **Toggle mode removed**: No conversion between formats
- **Format change**: Old Markdown trees incompatible (need regeneration)
- **Keybindings**: New shortcuts may conflict with user settings

### 🔄 Migration Guide

If upgrading from v1.x:

1. Regenerate all tree files (old format incompatible)
2. Remove JSON tree files
3. Update any workflows that used JSON mode
4. Learn new keybindings (Ctrl+Shift+Enter, Ctrl+Enter)

---

## [1.0.1] - 2024-02-08

### Fixed

- **Baseline Tree Tracking**: Generate Tree command now properly sets baseline tree
- **Diff Engine**: Now correctly detects changes instead of showing all as create+delete
- **Code Duplication**: Extracted shared `scanDirectory` to `src/fs/scanTree.ts`
- **Context Menu**: Added right-click support for folders in Explorer

### Changed

- `GenerateTreeCommand.execute()` accepts optional `resource?: vscode.Uri`
- Both `generateTree.ts` and `applyChanges.ts` use shared `scanTree.ts`
- Package.json includes explorer context menu entries

---

## [1.0.0] - 2024-02-07

### Added

- Initial release of FILETREEFORGE
- Markdown tree mode with strict syntax parsing
- JSON tree mode with schema validation
- Bidirectional editing support
- Smart diff engine with rename detection
- Safe filesystem operations with confirmations
- Preview changes before applying
- Toggle between Markdown and JSON modes
- Configurable ignore patterns
- Workspace-scoped operations
- Comprehensive error handling
- Path validation and security checks

### Features

- Generate tree from filesystem
- Edit tree structure as Markdown or JSON
- Apply changes to real filesystem
- Preview diff operations
- Convert between Markdown and JSON formats
- Smart operation ordering
- Confirmation dialogs for destructive operations
- Baseline tree tracking

### Safety

- No operations outside workspace
- No absolute paths allowed
- No parent directory references (..)
- No symlink following
- Proper rename detection
- Operations applied in safe order

---

**v2.0.0 is a major rewrite focused on stability, predictability, and professional UX.**
