# Barangay Pulo — Getting Started

Commands your partner needs to run to get the system working.

## Prerequisites

- **Node.js** (v18+)
- **PHP** (8.x) with extensions: `pdo_sqlite`, `json`, `mbstring`, `fileinfo`

## 1. Install dependencies

```bash
npm install
```

## 2. Set up the database (first time only)

From the project root:

```bash
php api/init_db.php
```

Then create the admin user (login: **pulo** / **pulo**):

```bash
php api/create_admin.php
```

## 3. Run the app (two terminals)

**Terminal 1 — PHP API** (must run from project root):

```bash
npm run api
```

Or:

```bash
php -S localhost:8000
```

**Terminal 2 — Frontend:**

```bash
npm run dev
```

## 4. Open the app

- **Main site:** http://localhost:5173  
- **Admin login:** http://localhost:5173/admin/login  
  - Username: `pulo`  
  - Password: `pulo`

---

**Summary:** Run `npm run api` in one terminal and `npm run dev` in another. Use the site at **http://localhost:5173**.
