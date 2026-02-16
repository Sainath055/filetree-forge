# FileTree Forge – Example

This example demonstrates how to use operation markers.

---

# 🧱 Original Generated Tree

app/
├─ api/
│ └─ route.js
├─ components/
│ └─ Button.tsx
└─ page.js

---

# ✏️ Example With Operations

app/
├─ api/
│ ├─ route.js
│ └─ helpers.js [+]
├─ components/
│ ├─ Button.tsx
│ └─ Input.tsx [+]
├─ old-utils/ [-]
└─ page.js [~ main.js]

---

# 🔍 What This Does

CREATE:

- api/helpers.js
- components/Input.tsx

DELETE:

- old-utils/

RENAME:
page.js → main.js

---

# 📋 Marker Reference

[+] → Create file or folder  
[-] → Delete file or folder  
[~ newName] → Rename file or folder

Rules:

- Marker must appear at end of line
- Exactly one space before marker
- Cannot rename or delete root folder
- Structure (without markers) must match filesystem
