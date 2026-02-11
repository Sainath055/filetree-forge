# FILETREEFORGE Usage Examples

This document provides real-world examples and use cases for FILETREEFORGE.

## Example 1: Creating a New React Project Structure

### Step 1: Generate Initial Tree

Command: `FILETREEFORGE: Generate Markdown Tree`

Result:
```markdown
# FILETREEFORGE

- package.json
- README.md
```

### Step 2: Edit to Add Structure

```markdown
# FILETREEFORGE

- src/
  - components/
    - common/
      - Button.tsx
      - Input.tsx
    - layout/
      - Header.tsx
      - Footer.tsx
      - Sidebar.tsx
  - pages/
    - Home.tsx
    - About.tsx
    - Contact.tsx
  - hooks/
    - useAuth.ts
    - useFetch.ts
  - styles/
    - global.css
    - variables.css
  - App.tsx
  - main.tsx
- public/
  - assets/
    - images/
    - fonts/
  - index.html
- tests/
  - unit/
  - integration/
- .gitignore
- package.json
- tsconfig.json
- vite.config.ts
- README.md
```

### Step 3: Apply Changes

Command: `FILETREEFORGE: Apply Changes to Filesystem`

Result: Entire project structure created instantly!

---

## Example 2: Refactoring - Reorganizing Components

### Before:

```markdown
# FILETREEFORGE

- src/
  - Button.tsx
  - Input.tsx
  - Card.tsx
  - Header.tsx
  - Footer.tsx
  - Login.tsx
  - Signup.tsx
```

### After (Organized by Feature):

```markdown
# FILETREEFORGE

- src/
  - components/
    - ui/
      - Button.tsx
      - Input.tsx
      - Card.tsx
    - layout/
      - Header.tsx
      - Footer.tsx
  - features/
    - auth/
      - Login.tsx
      - Signup.tsx
```

### Result:
- Files moved to appropriate folders
- Old flat structure → organized hierarchy
- All files renamed/moved correctly

---

## Example 3: Renaming Files (Bulk)

### Before:

```markdown
- components/
  - button.tsx
  - input.tsx
  - card.tsx
```

### After (PascalCase):

```markdown
- components/
  - Button.tsx
  - Input.tsx
  - Card.tsx
```

### Result:
- All files renamed (not deleted and recreated)
- Git history preserved (if using git mv)

---

## Example 4: Adding a New Feature

### Current Structure:

```markdown
# FILETREEFORGE

- src/
  - features/
    - auth/
      - Login.tsx
      - Signup.tsx
```

### Add "Profile" Feature:

```markdown
# FILETREEFORGE

- src/
  - features/
    - auth/
      - Login.tsx
      - Signup.tsx
    - profile/            # NEW
      - Profile.tsx       # NEW
      - EditProfile.tsx   # NEW
      - Avatar.tsx        # NEW
      - settings/         # NEW
        - Settings.tsx    # NEW
        - Privacy.tsx     # NEW
```

### Result:
- New `profile/` folder created
- All new files created
- Existing files untouched

---

## Example 5: Cleaning Up Old Files

### Before:

```markdown
- src/
  - OldComponent.tsx
  - DeprecatedUtils.ts
  - TempTest.tsx
  - components/
    - Button.tsx
```

### After:

```markdown
- src/
  - components/
    - Button.tsx
```

### Result:
- Old files deleted
- Clean project structure
- Confirmation dialog shown before deletion

---

## Example 6: Converting Between Formats

### Markdown → JSON:

1. Open Markdown tree
2. Command: `FILETREEFORGE: Toggle MD ↔ JSON`
3. Result: JSON representation opened

### Use Case:
- Share structure with tools that expect JSON
- Programmatic manipulation
- Version control (JSON diffs are cleaner)

---

## Example 7: Previewing Large Changes

### Scenario:
Refactoring 50+ files

### Workflow:

1. Edit tree structure
2. Command: `FILETREEFORGE: Preview Changes`
3. Review operations:
   ```
   50 operation(s) to apply:
   
   CREATE (20):
     📁 src/features/dashboard
     📁 src/features/analytics
     📄 src/features/dashboard/Dashboard.tsx
     ...
   
   RENAME (15):
     src/Button.tsx → src/components/Button.tsx
     src/Input.tsx → src/components/Input.tsx
     ...
   
   DELETE (15):
     📁 src/old-components
     📄 src/deprecated.ts
     ...
   ```
4. Verify changes are correct
5. Click "Apply" or cancel

---

## Example 8: Template for New Projects

### Save as Template:

```markdown
# FILETREEFORGE - React TypeScript Template

- src/
  - components/
    - common/
    - layout/
  - pages/
  - hooks/
  - services/
  - utils/
  - types/
  - styles/
  - App.tsx
  - main.tsx
- public/
  - assets/
  - index.html
- tests/
- .env.example
- .gitignore
- package.json
- tsconfig.json
- vite.config.ts
- README.md
```

### Reuse:
1. Copy template
2. Customize for new project
3. Apply to empty workspace
4. Instant project structure!

---

## Example 9: Documenting Project Structure

### Generate Tree:

Command: `FILETREEFORGE: Generate Markdown Tree`

### Save to README:

Copy tree to `README.md`:

```markdown
# My Project

## Project Structure

- src/
  - components/
  - features/
  - utils/
- public/
- tests/

## Installation
...
```

### Benefits:
- Always up-to-date documentation
- Visual project overview
- Easy onboarding for new developers

---

## Example 10: Complex Reorganization

### Scenario:
Migrating from feature-based to domain-driven structure

### Before (Feature-Based):

```markdown
- src/
  - components/
    - UserCard.tsx
    - ProductCard.tsx
    - OrderCard.tsx
  - services/
    - userService.ts
    - productService.ts
    - orderService.ts
```

### After (Domain-Driven):

```markdown
- src/
  - domains/
    - user/
      - UserCard.tsx
      - userService.ts
      - types.ts
    - product/
      - ProductCard.tsx
      - productService.ts
      - types.ts
    - order/
      - OrderCard.tsx
      - orderService.ts
      - types.ts
```

### Result:
- Files reorganized by domain
- All renames detected correctly
- No files lost or duplicated

---

## Tips & Tricks

### 1. Use Comments for Planning

```markdown
# FILETREEFORGE

- src/
  - features/
    <!-- TODO: Add payment feature -->
    <!-- TODO: Refactor auth to use new API -->
```

### 2. Ignore Patterns for Generated Files

Config:
```json
{
  "filetreeforge.ignorePatterns": [
    "node_modules",
    "dist",
    "*.min.js",
    "*.map"
  ]
}
```

### 3. Preview Before Applying

Always preview large changes to catch mistakes.

### 4. Use Version Control

Commit before applying changes - easy rollback if needed.

### 5. Start Small

Test on small project before using on production code.

---

## Common Patterns

### Feature Folder Pattern

```markdown
- src/
  - features/
    - auth/
      - components/
      - hooks/
      - services/
      - types/
      - index.ts
```

### Atomic Design Pattern

```markdown
- src/
  - components/
    - atoms/
      - Button.tsx
      - Input.tsx
    - molecules/
      - FormField.tsx
      - SearchBar.tsx
    - organisms/
      - LoginForm.tsx
      - Header.tsx
    - templates/
      - PageTemplate.tsx
```

### Layered Architecture

```markdown
- src/
  - presentation/
    - components/
    - pages/
  - application/
    - useCases/
    - services/
  - domain/
    - entities/
    - repositories/
  - infrastructure/
    - api/
    - storage/
```

---

## Troubleshooting Examples

### Issue: "No baseline tree found"

**Solution:**
```
1. Command: Generate Markdown Tree
2. This becomes your baseline
3. Now edits can be compared and applied
```

### Issue: Files showing as created instead of renamed

**Cause:** IDs didn't match between old and new tree

**Solution:**
- Regenerate tree from filesystem
- Make incremental changes
- Don't manually edit JSON IDs

### Issue: Permission denied errors

**Cause:** Trying to modify read-only files

**Solution:**
- Check file permissions
- Close files in other programs
- Run VS Code with appropriate permissions

---

These examples demonstrate the power and flexibility of FILETREEFORGE for managing project structures efficiently!
