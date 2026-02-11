# FILETREEFORGE - Installation & Setup Guide

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v8 or higher
- **VS Code**: v1.85.0 or higher
- **TypeScript**: v5.3.0 (installed as dev dependency)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd filetreeforge
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- TypeScript compiler
- VS Code extension types
- ESLint and TypeScript ESLint
- UUID library for node ID generation

### 3. Compile the Extension

```bash
npm run compile
```

This compiles TypeScript to JavaScript in the `out/` directory.

### 4. Open in VS Code

```bash
code .
```

### 5. Run the Extension

**Method 1: Debug Launch**
1. Press `F5` or go to Run → Start Debugging
2. This opens a new VS Code window (Extension Development Host)
3. The extension is active in this window

**Method 2: Manual Build + Install**
```bash
npm run compile
# Then manually install .vsix package
```

## Development Workflow

### Watch Mode

For active development, use watch mode to automatically recompile on changes:

```bash
npm run watch
```

Then in VS Code:
1. Press `F5` to launch Extension Development Host
2. Edit source files
3. Press `Ctrl+R` (or `Cmd+R` on Mac) in Extension Development Host to reload
4. Changes are reflected immediately

### Debugging

1. Set breakpoints in `.ts` files
2. Launch extension with `F5`
3. Trigger commands in Extension Development Host
4. Debug panel shows variable values, call stack, etc.

**Debug Console:**
- View console logs
- Inspect variables
- Execute code snippets

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

Fix auto-fixable issues:

```bash
npm run lint -- --fix
```

## Project Structure

```
filetreeforge/
├── src/                    # Source TypeScript files
│   ├── extension.ts        # Entry point
│   ├── types.ts           # Core interfaces
│   ├── commands/          # Command implementations
│   ├── parser/            # MD/JSON parsers
│   ├── diff/              # Diff engine
│   ├── fs/                # Filesystem operations
│   └── utils/             # Utilities
├── out/                   # Compiled JavaScript (generated)
├── examples/              # Example tree files
├── package.json           # Extension manifest
├── tsconfig.json          # TypeScript config
├── .eslintrc.json         # ESLint config
├── README.md              # User documentation
├── DEVELOPER_GUIDE.md     # Developer documentation
└── CHANGELOG.md           # Version history
```

## Configuration

### Extension Settings

Settings are defined in `package.json` under `contributes.configuration`.

To modify settings as a user:
1. Open Settings (Ctrl+,)
2. Search for "filetreeforge"
3. Adjust settings

Default settings:
```json
{
  "filetreeforge.autoApplyOnSave": false,
  "filetreeforge.confirmBeforeApply": true,
  "filetreeforge.ignorePatterns": [
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
  "filetreeforge.ignorePatterns": [
    "node_modules",
    "dist",
    "coverage"
  ]
}
```

## Testing the Extension

### Manual Testing Checklist

**1. Generate Tree (Markdown)**
- [ ] Command appears in palette
- [ ] Generates correct tree structure
- [ ] Respects ignore patterns
- [ ] Opens in new document

**2. Generate Tree (JSON)**
- [ ] Generates valid JSON
- [ ] Includes all nodes
- [ ] Proper nesting

**3. Apply Changes**
- [ ] Creates new files/folders
- [ ] Renames correctly (not delete+create)
- [ ] Deletes safely with confirmation
- [ ] Shows errors for invalid syntax

**4. Preview Changes**
- [ ] Shows operations without applying
- [ ] Format is readable
- [ ] Counts are accurate

**5. Toggle Mode**
- [ ] MD → JSON conversion works
- [ ] JSON → MD conversion works
- [ ] IDs preserved

### Test Cases

#### Test 1: Basic Create

1. Open empty workspace
2. Generate Markdown tree
3. Add lines:
   ```markdown
   - src/
     - index.ts
   ```
4. Apply changes
5. Verify `src/index.ts` created

#### Test 2: Rename Detection

1. Generate tree from existing project
2. Change filename: `OldName.ts` → `NewName.ts`
3. Preview changes
4. Verify operation is "RENAME" not "DELETE + CREATE"
5. Apply and verify file renamed

#### Test 3: Complex Restructure

1. Create structure:
   ```markdown
   - a/
     - file1.txt
   - b/
     - file2.txt
   ```
2. Apply
3. Modify to:
   ```markdown
   - a/
     - b/
       - file1.txt
       - file2.txt
   ```
4. Apply
5. Verify `b` moved into `a` and files moved

#### Test 4: Error Handling

1. Create invalid Markdown:
   ```markdown
   - src/
    - index.ts    # Only 1 space (should be 2)
   ```
2. Try to apply
3. Verify error shows line number and clear message

#### Test 5: Safety Checks

1. Try path traversal:
   ```markdown
   - ../../../etc/passwd
   ```
2. Verify rejected with error

## Packaging for Distribution

### Create VSIX Package

```bash
npm install -g @vscode/vsce
vsce package
```

This creates `filetreeforge-1.0.0.vsix`.

### Install VSIX Locally

```bash
code --install-extension filetreeforge-1.0.0.vsix
```

### Publish to Marketplace

```bash
vsce publish
```

(Requires publisher account and personal access token)

## Troubleshooting

### Issue: "Cannot find module 'uuid'"

**Solution:**
```bash
npm install
```

### Issue: Extension not loading

**Symptoms:** Commands don't appear in palette

**Solutions:**
1. Check `out/` folder exists
2. Run `npm run compile`
3. Reload Extension Development Host (`Ctrl+R`)
4. Check Debug Console for errors

### Issue: Compilation errors

**Solution:**
```bash
# Clean build
rm -rf out/
npm run compile
```

### Issue: Extension crashes

**Debug:**
1. Check Debug Console for stack traces
2. Add `console.log()` statements
3. Set breakpoints
4. Use VS Code debugger

## Environment Setup

### Recommended VS Code Extensions for Development

- **ESLint**: Real-time linting
- **TypeScript**: Enhanced TS support
- **GitLens**: Git integration

### VS Code Settings for Development

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run compile
      - run: npm run lint
```

## Next Steps

After installation:
1. Read `README.md` for user guide
2. Read `DEVELOPER_GUIDE.md` for architecture details
3. Check `examples/` for sample trees
4. Try the extension on a test project
5. Report issues or contribute improvements

## Support

- **Issues**: Open GitHub issue
- **Questions**: Check documentation
- **Contributions**: See DEVELOPER_GUIDE.md

---

**Happy Developing! 🚀**
