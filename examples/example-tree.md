# FILETREEFORGE

<!-- This is an example Markdown tree representation -->
<!-- Edit this structure and use "Apply Changes" to modify your filesystem -->

- src/
  - components/
    - Button.tsx
    - Input.tsx
    - Card.tsx
  - features/
    - auth/
      - Login.tsx
      - Signup.tsx
      - ForgotPassword.tsx
    - dashboard/
      - Dashboard.tsx
      - widgets/
        - StatsWidget.tsx
        - ChartWidget.tsx
  - utils/
    - helpers.ts
    - constants.ts
  - types/
    - index.ts
  - App.tsx
  - main.tsx
- public/
  - assets/
    - logo.svg
    - favicon.ico
  - index.html
- tests/
  - unit/
    - Button.test.tsx
  - e2e/
    - auth.test.ts
- .gitignore
- package.json
- tsconfig.json
- vite.config.ts
- README.md

<!-- 
  Syntax Guide:
  - name/     → folder (note the trailing slash)
  - name.ext  → file
  - Indent with 2 spaces per level
  - Comments are ignored
  
  Example Edits:
  1. Add new file: Add a line like "  - NewComponent.tsx"
  2. Rename: Change "Button.tsx" to "PrimaryButton.tsx"
  3. Move: Change indentation to nest under different folder
  4. Delete: Remove the entire line
-->
