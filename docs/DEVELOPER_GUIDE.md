# FileTree Forge - Developer Guide

Welcome to FileTree Forge development! This guide will help you contribute to the project.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Contributing](#contributing)
- [Release Process](#release-process)

## Development Setup

### Prerequisites

- **Node.js**: v18+ ([download](https://nodejs.org/))
- **npm**: v8+ (comes with Node.js)
- **VS Code**: v1.85.0+ ([download](https://code.visualstudio.com/))
- **Git**: Latest version

### Initial Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/yourusername/filetree-forge.git
   cd filetree-forge
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Build**

   ```bash
   npm run compile
   ```

4. **Open in VS Code**
   ```bash
   code .
   ```

### Development Environment

Press **F5** in VS Code to launch the Extension Development Host with your changes loaded.

## Project Structure

```
filetree-forge/
├── src/
│   ├── commands/          # Command implementations
│   │   ├── applyChanges.ts
│   │   ├── generateTree.ts
│   │   ├── previewChanges.ts
│   │   └── stateManager.ts
│   ├── fs/                # Filesystem operations
│   │   ├── operationExecutor.ts
│   │   ├── operationExtractor.ts
│   │   ├── scanTree.ts
│   │   └── structureValidator.ts
│   ├── parser/            # Markdown parsing
│   │   ├── markdownParser.ts
│   │   └── treeSerializer.ts
│   ├── utils/             # Utilities
│   │   ├── pathUtils.ts
│   │   └── validation.ts
│   ├── types.ts           # TypeScript types
│   └── extension.ts       # Extension entry point
├── docs/                  # Documentation
├── examples/              # Example trees
├── out/                   # Compiled JavaScript
├── package.json           # Extension manifest
├── tsconfig.json          # TypeScript config
└── README.md              # User documentation
```

### Key Files

- **`extension.ts`**: Entry point, registers commands
- **`types.ts`**: Core data models
- **`commands/`**: User-facing commands
- **`parser/markdownParser.ts`**: Parses operation markers
- **`fs/operationExecutor.ts`**: Executes filesystem operations

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Changes

Edit TypeScript files in `src/`.

### 3. Compile

```bash
npm run compile
```

Or use watch mode:

```bash
npm run watch
```

### 4. Test

Press **F5** to launch Extension Development Host.

In the new window:

1. Right-click a folder → Generate Markdown Tree
2. Add operation markers
3. Test preview and apply

### 5. Debug

- Set breakpoints in `.ts` files
- Press **F5** to start debugging
- Breakpoints hit in Extension Development Host

### 6. Commit

```bash
git add .
git commit -m "feat: add new feature"
# or
git commit -m "fix: resolve bug"
```

Follow [Conventional Commits](https://www.conventionalcommits.org/).

### 7. Push and PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Coding Standards

### TypeScript

- **Strict mode**: Enabled (`strict: true` in tsconfig.json)
- **Type safety**: No `any` types without comment explaining why
- **Null safety**: Use optional chaining (`?.`) and nullish coalescing (`??`)

### Code Style

```typescript
// ✅ Good
function parseMarker(line: string): Operation | undefined {
  if (line.endsWith("[+]")) {
    return "create";
  }
  return undefined;
}

// ❌ Bad
function parseMarker(line: string): any {
  if (line.endsWith("[+]")) return "create";
  return undefined;
}
```

### Naming Conventions

- **Classes**: PascalCase (`MarkdownParser`)
- **Functions**: camelCase (`extractOperations`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_DEPTH`)
- **Interfaces**: PascalCase (`TreeNode`)
- **Files**: camelCase (`markdownParser.ts`)

### Comments

```typescript
/**
 * Parses operation marker from line
 * @param line - Line to parse
 * @returns Operation type or undefined
 */
function parseMarker(line: string): Operation | undefined {
  // Check for create marker
  if (line.endsWith("[+]")) {
    return "create";
  }
  return undefined;
}
```

### Error Handling

```typescript
// ✅ Good - Specific error messages
try {
  await executeOperation(op);
} catch (error) {
  throw new Error(
    `Failed to execute ${op.type} on ${op.path}: ${error.message}`,
  );
}

// ❌ Bad - Generic errors
try {
  await executeOperation(op);
} catch (error) {
  throw new Error("Operation failed");
}
```

## Testing

### Manual Testing Checklist

Before submitting PR, test:

- [ ] Generate tree from folder
- [ ] Add `[+]` marker and apply
- [ ] Add `[-]` marker and apply
- [ ] Add `[~ name]` marker and apply
- [ ] Structure validation error
- [ ] Preview shows correct operations
- [ ] Apply closes temp documents
- [ ] Keyboard shortcuts work
- [ ] Confirmation dialog appears (if enabled)

### Test Scenarios

#### Test 1: Create Operation

```markdown
src/
└─ newfile.js [+]
```

**Expected**: File created

#### Test 2: Delete Operation

```markdown
src/
└─ oldfile.js [-]
```

**Expected**: File deleted (with confirmation)

#### Test 3: Rename Operation

```markdown
src/
└─ old.js [~ new.js]
```

**Expected**: File renamed

#### Test 4: Structure Mismatch

```markdown
# Filesystem has: file1.js

# Tree shows: file2.js

src/
└─ file2.js
```

**Expected**: Error message about mismatch

#### Test 5: Invalid Marker

```markdown
src/
└─ file.js [*]
```

**Expected**: Parse error

### Edge Cases

- Empty trees
- Very deep nesting (20+ levels)
- Large trees (1000+ files)
- Special characters in names
- Folders with same names as files

## Contributing

### Before You Start

1. Check existing issues
2. Open an issue to discuss major changes
3. Read this guide completely

### Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Commit** with conventional commits
6. **Push** to your fork
7. **Create** pull request

### PR Guidelines

**Title**: Clear, concise, follows conventional commits

```
feat: add support for glob patterns
fix: resolve structure validation bug
docs: update architecture guide
```

**Description**: Include:

- What changed
- Why it changed
- How to test
- Screenshots (if UI changes)

**Checklist**:

- [ ] Code compiles without errors
- [ ] Manually tested all changes
- [ ] Updated documentation
- [ ] Follows coding standards
- [ ] No breaking changes (or documented)

### Code Review

Expect feedback on:

- Code quality and style
- Error handling
- Edge cases
- Performance
- Documentation

Be responsive and iterate on feedback.

## Release Process

### Version Numbers

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes (2.0.0)
- **MINOR**: New features, backward compatible (1.1.0)
- **PATCH**: Bug fixes (1.0.1)

### Release Steps

1. **Update Version**

   ```bash
   npm version patch  # or minor, major
   ```

2. **Update CHANGELOG.md**

   ```markdown
   ## [1.0.1] - 2024-02-10

   ### Fixed

   - Bug description
   ```

3. **Commit**

   ```bash
   git add .
   git commit -m "chore: release v1.0.1"
   ```

4. **Tag**

   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

5. **Build**

   ```bash
   npm run compile
   vsce package
   ```

6. **Publish**
   ```bash
   vsce publish
   ```

## Common Tasks

### Adding a New Command

1. **Create command file** in `src/commands/`
2. **Implement** `static async execute()` method
3. **Register** in `extension.ts`
4. **Add** to `package.json` commands
5. **Add** keyboard shortcut (optional)
6. **Document** in README

### Adding a New Operation Marker

1. **Update** `types.ts` Operation type
2. **Update** `markdownParser.ts` to parse marker
3. **Update** `operationExecutor.ts` to execute
4. **Test** thoroughly
5. **Document** in README

### Adding Configuration

1. **Add** to `package.json` configuration
2. **Read** in command with `vscode.workspace.getConfiguration()`
3. **Document** in README
4. **Provide** default value

## Debugging Tips

### Console Logging

```typescript
console.log("[FileTree Forge] Operation:", op);
```

View in **Developer Tools Console** (`Help → Toggle Developer Tools`)

### Breakpoint Debugging

1. Set breakpoint in `.ts` file
2. Press **F5**
3. Trigger operation in Extension Development Host
4. Execution pauses at breakpoint

### VS Code API Debugging

```typescript
// Log workspace folders
console.log("Workspaces:", vscode.workspace.workspaceFolders);

// Log active editor
console.log(
  "Active editor:",
  vscode.window.activeTextEditor?.document.fileName,
);
```

## Resources

### Documentation

- [VS Code Extension API](https://code.visualstudio.com/api)
- [VS Code Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tools

- [vsce](https://github.com/microsoft/vscode-vsce) - VS Code extension packager
- [ESLint](https://eslint.org/) - Code linting
- [Prettier](https://prettier.io/) - Code formatting

## Getting Help

- **Issues**: Check [GitHub Issues](https://github.com/yourusername/filetree-forge/issues)
- **Discussions**: Use GitHub Discussions
- **Questions**: Open an issue with `question` label

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to FileTree Forge!** 🚀

Your contributions help make filesystem refactoring safer and more predictable for everyone.
