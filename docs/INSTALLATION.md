# FileTree Forge - Installation Guide

## For End Users

### From VS Code Marketplace

1. Open Visual Studio Code
2. Click the Extensions icon in the Activity Bar (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Search for **"FileTree Forge"**
4. Click **Install**
5. Reload VS Code if prompted

### From VSIX File

If you have a `.vsix` file:

1. Open VS Code
2. Go to Extensions
3. Click the `...` menu → **Install from VSIX...**
4. Select the `.vsix` file
5. Reload VS Code

### Verify Installation

1. Right-click any folder in Explorer
2. You should see **"FileTree Forge: Generate Markdown Tree"** in the context menu

## For Developers

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: v8 or higher
- **VS Code**: v1.85.0 or higher
- **Git**: For cloning the repository

### Clone Repository

```bash
git clone https://github.com/yourusername/filetree-forge.git
cd filetree-forge
```

### Install Dependencies

```bash
npm install
```

This installs:

- TypeScript compiler
- VS Code extension types
- ESLint and type checking tools

### Compile Extension

```bash
npm run compile
```

This compiles TypeScript files from `src/` to JavaScript in `out/`.

### Run in Development Mode

1. Open the project in VS Code:

   ```bash
   code .
   ```

2. Press **`F5`** or go to **Run → Start Debugging**

3. This opens a new VS Code window (Extension Development Host) with the extension loaded

4. Test the extension in this window

### Watch Mode (Development)

For active development with automatic recompilation:

```bash
npm run watch
```

Then:

1. Press `F5` to launch Extension Development Host
2. Make changes to `.ts` files
3. Press `Ctrl+R` (or `Cmd+R`) in the Extension Development Host to reload
4. Changes are reflected immediately

### Build for Production

```bash
npm run compile
```

### Package for Distribution

Install the packaging tool:

```bash
npm install -g @vscode/vsce
```

Create `.vsix` package:

```bash
vsce package
```

This creates `filetree-forge-1.0.0.vsix`.

### Install Locally

```bash
code --install-extension filetree-forge-1.0.0.vsix
```

## Configuration

### User Settings

Open VS Code settings (`Ctrl+,` or `Cmd+,`) and search for "FileTree Forge".

Or edit `settings.json`:

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

### Workspace Settings

Create `.vscode/settings.json` in your project:

```json
{
  "filetree-forge.ignorePatterns": ["node_modules", "coverage", "*.log"]
}
```

## Keyboard Shortcuts

Default shortcuts are:

- **Preview**: `Ctrl+Shift+Enter` (Mac: `Cmd+Shift+Enter`)
- **Apply**: `Ctrl+Enter` (Mac: `Cmd+Enter`)

### Customize Shortcuts

1. Open **File → Preferences → Keyboard Shortcuts**
2. Search for "FileTree Forge"
3. Click the pencil icon to edit
4. Enter your preferred shortcut

Or edit `keybindings.json`:

```json
[
  {
    "key": "ctrl+shift+enter",
    "command": "filetreeforge.previewChanges",
    "when": "editorTextFocus && editorLangId == markdown"
  },
  {
    "key": "ctrl+enter",
    "command": "filetreeforge.applyChanges",
    "when": "editorTextFocus && (editorLangId == markdown || editorLangId == plaintext)"
  }
]
```

## Troubleshooting

### Extension Not Appearing

1. Check Extensions view for any error messages
2. Try reloading VS Code: **Developer: Reload Window**
3. Check VS Code version is 1.85.0 or higher

### Commands Not Working

1. Verify you're in a workspace (not just an open file)
2. Check that you right-clicked a **folder**, not a file
3. Reload VS Code window

### Compilation Errors (Developers)

```bash
# Clean build
rm -rf out/
npm run compile
```

### Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Uninstallation

### From VS Code

1. Go to Extensions
2. Find "FileTree Forge"
3. Click **Uninstall**
4. Reload VS Code

### Complete Removal

Also remove settings:

1. Open Settings
2. Search for "FileTree Forge"
3. Click **Reset** on each setting

Or manually edit `settings.json` to remove `filetree-forge.*` entries.

## Updating

### Automatic Updates

VS Code automatically updates extensions by default.

### Manual Update

1. Go to Extensions
2. Find "FileTree Forge"
3. Click **Update** if available

### Development Build

```bash
git pull
npm install
npm run compile
```

## System Requirements

### Minimum Requirements

- **OS**: Windows 10, macOS 10.15, or Linux (Ubuntu 18.04+)
- **VS Code**: 1.85.0 or higher
- **RAM**: 4GB (VS Code requirement)
- **Disk**: 50MB for extension

### Recommended

- **RAM**: 8GB or more
- **SSD**: For faster file operations

## Platform-Specific Notes

### Windows

- Use PowerShell or Command Prompt for npm commands
- Path separators are handled automatically

### macOS

- May need to grant file access permissions
- Use Terminal for npm commands

### Linux

- Ensure Node.js is in PATH
- May need to install build tools: `sudo apt-get install build-essential`

## Next Steps

- Read the [Quick Start Guide](QUICKSTART.md)
- Review the [Architecture](ARCHITECTURE.md)
- Check out the [Developer Guide](DEVELOPER_GUIDE.md)

---

**Need help?** Open an issue on GitHub or check the [README FAQ](../README.md#faq).
