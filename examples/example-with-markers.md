# Example tree with operation markers

app/
├─ api/
│ ├─ auth/
│ │ ├─ login/
│ │ │ └─ route.js
│ │ └─ signup/
│ │ └─ route.js
│ ├─ functions/
│ │ ├─ route.js
│ │ └─ helpers.js [+]
│ └─ Guide/
│ └─ getNews/
│ └─ route.js
├─ components/
│ ├─ Button.tsx
│ ├─ Input.tsx
│ └─ Select.tsx [+]
├─ utils/
│ ├─ logger.ts
│ └─ deprecated.ts [-]
├─ old-config/ [-]
├─ layout.js
└─ page.js

# Operations marked:

# [+] Create: helpers.js, Select.tsx

# [-] Delete: deprecated.ts, old-config/

# No renames in this example

# Preview will show:

# CREATE (2):

# + api/functions/helpers.js

# + components/Select.tsx

#

# DELETE (2):

# - utils/deprecated.ts

# - old-config/
