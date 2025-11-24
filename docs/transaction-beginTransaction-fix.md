**Transaction: `beginTransaction` pool vs connection — diagnosis & fix**

Summary
-
This document explains a runtime error encountered in the project:

  TypeError: "db.beginTransaction is not a function"

It shows why the error happened, the problematic code patterns, the fix applied in the repository, and how to test and avoid similar issues in future.

Root cause
-
- The application initializes MySQL using a connection pool (`mysql2.createPool(...)`) and assigns it to `db` in `server/server.js`.
- Connection pools do not expose per-connection transaction methods (such as `beginTransaction`) directly. Those methods are provided by a Connection object obtained from the pool.
- Some route code incorrectly called `beginTransaction()` on the pool (or assumed `db.promise()` returned a Connection with `beginTransaction`), which caused the TypeError at runtime.

Problematic code examples (before fix)
-
1) `server/profileRoutes.js` — original transaction pattern that failed with a Pool:

```js
// (excerpt - original)
// Start transaction to ensure data consistency
db.beginTransaction((err) => {
  if (err) return res.status(500).json({ error: err.message });

  // ... multiple db.query(...) calls ...

  db.commit((err) => {
    if (err) {
      return db.rollback(() => {
        res.status(500).json({ error: err.message });
      });
    }
    res.json({ success: true });
  });
});
```

2) `server/admincounselorRoutes.js` — assumed `db` was a Connection and used the promise wrapper directly:

```js
// (excerpt - original)
const conn = db.promise();
try {
  await conn.beginTransaction();

  // ... queries using await conn.query(...)

  await conn.commit();
} catch (err) {
  try { await conn.rollback(); } catch (e) { /* ... */ }
}
```

Why that failed
-
- `db` is a Pool object (from `mysql2.createPool`). A Pool's `promise()` returns a PoolPromise, not a ConnectionPromise — calling `beginTransaction()` on the pool or on a PoolPromise does not work because the method is provided by a Connection instance.
- Attempting `db.beginTransaction(...)` or `db.promise().beginTransaction()` therefore produced `TypeError: beginTransaction is not a function`.

Fix applied in repository
-
I updated the affected route handlers to obtain a Connection from the pool, run the transaction on that Connection, and always release the Connection when done (commit, rollback, or error path). The two main patterns used are:

- Callback style (used in `server/profileRoutes.js`):

```js
db.getConnection((err, conn) => {
  if (err) return res.status(500).json({ error: err.message });

  conn.beginTransaction((err) => {
    if (err) { conn.release(); return res.status(500).json({ error: err.message }); }

    conn.query('UPDATE ...', [...], (err, result) => {
      if (err) return conn.rollback(() => { conn.release(); res.status(500).json({ error: err.message }); });

      // ... other conn.query(...) calls ...

      conn.commit((err) => {
        if (err) return conn.rollback(() => { conn.release(); res.status(500).json({ error: err.message }); });
        conn.release();
        res.json({ success: true });
      });
    });
  });
});
```

- Async/await (used in `server/admincounselorRoutes.js`):

```js
let conn;
try {
  conn = await db.promise().getConnection();
  await conn.beginTransaction();

  // queries using await conn.query(...)

  await conn.commit();
} catch (err) {
  try { if (conn) await conn.rollback(); } catch (e) { /* log rollback error */ }
  throw err; // or handle and respond
} finally {
  try { if (conn) conn.release(); } catch (e) { /* ignore release errors */ }
}
```

Files changed
-
- `server/profileRoutes.js` — replaced the failing `db.beginTransaction(...)` usage with `db.getConnection(...)` and used `conn.beginTransaction` and `conn.query` internally. Ensured `conn.release()` is called for commit, rollback and error paths.
- `server/admincounselorRoutes.js` — replaced `const conn = db.promise(); await conn.beginTransaction()` with `conn = await db.promise().getConnection(); await conn.beginTransaction();` and added `finally` to `conn.release()`.

Why this is correct
-
- Transactions must run on a Connection. When using a Pool, you obtain a Connection from the pool and start the transaction on that Connection. The pool itself coordinates connections but does not provide per-connection transactional methods.
- Using `db.promise().getConnection()` returns a promise-resolving Connection wrapper that correctly implements `beginTransaction`, `query`, `commit`, and `rollback` for async/await code.
- Releasing the Connection (`conn.release()`) in the `finally` block ensures the pool doesn't leak connections after errors, preventing connection exhaustion.

Testing instructions
-
1) Start the node server only (PowerShell):

```powershell
npm run dev:node
```

2) Perform the operations that previously failed (examples):
- Save a student profile from the UI that triggers `PUT /api/student-profile/:id`.
- Edit or delete a counselor from the admin UI (routes: `PUT /api/counselor/:id`, `POST /api/counselor/delete`).

3) Observe server logs — there should be no TypeError stack traces. The endpoints should return success (or an appropriate handled error).

Recommendations & follow-ups
-
- Standardize on a single transaction pattern across the codebase (I recommend async/await using `db.promise().getConnection()`) for readability and consistency.
- Always use `conn.release()` in `finally` for any `getConnection()` usage.
- If you perform many transactions in different files, consider extracting a small helper that wraps `getConnection()` and handles begin/commit/rollback/release to avoid repetitive boilerplate.

Example helper (optional)
-
```js
async function withTransaction(db, handler) {
  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();
    const result = await handler(conn);
    await conn.commit();
    return result;
  } catch (err) {
    try { await conn.rollback(); } catch (_) {}
    throw err;
  } finally {
    conn.release();
  }
}

// Usage:
// await withTransaction(db, async (conn) => { await conn.query(...); return something; });
```

Document status
-
- This document was added after applying fixes to `server/profileRoutes.js` and `server/admincounselorRoutes.js` to resolve `beginTransaction is not a function` errors and to ensure proper release of pooled connections.

If you want, I can also:
- Refactor `server/profileRoutes.js` to use the async/await + `db.promise().getConnection()` pattern to match `admincounselorRoutes.js` for consistency.
- Add the optional `withTransaction` helper and refactor transactional routes to use it.

-- End of document
