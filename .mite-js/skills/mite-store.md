---
name: mite-store
description: Use the MiteJS storage helper (mite.store.js) for reading, writing, and removing items in localStorage or sessionStorage. When asked to persist data, manage user preferences, store session tokens, or work with structured data in the browser.
---

# Store

A unified storage abstraction over `localStorage` and `sessionStorage` with auto-serialization.

```js
import { local, session } from './mite.store.js';
```

---

## API

### `local.set(key, value)` / `session.set(key, value)`

Store a value. Returns the original value, or `null` on failure.

```js
local.set('user', { name: 'Alice', age: 30 });
session.set('token', 'abc123');
```

### `local.get(key)` / `session.get(key)`

Retrieve a value. Auto-deserializes JSON. Returns `null` if missing or invalid.

```js
const user = local.get('user');
// { name: "Alice", age: 30 }

const missing = local.get('nothing');
// null
```

### `local.remove(key)` / `session.remove(key)`

Delete a value. Returns the deserialized value that was stored, or `null` if absent.

```js
const removed = local.remove('user');
// { name: "Alice", age: 30 }
```

### `local.clear()` / `session.clear()`

Remove all items in the store.

```js
session.clear();
```

### `local.update(key, data)` / `session.update(key, data)`

Shallow-merge `data` into the existing value, store it, and return the merged result.

```js
local.set('prefs', { theme: 'dark', lang: 'en' });
const updated = local.update('prefs', { lang: 'fr' });
// { theme: "dark", lang: "fr" }
```

> If no value exists, creates a new object from `data`.

---

## Differences

|          | `local` (localStorage) | `session` (sessionStorage) |
|----------|------------------------|----------------------------|
| Lifetime | Persistent (no expiry) | Cleared on tab close       |
| Scope    | Same origin, all tabs  | Single tab only            |
| Use for  | User preferences       | Auth tokens, temp state    |

---

## Examples

### Persist user preferences

```js
let prefs = local.get('prefs') || { theme: 'light' };
prefs = local.update('prefs', { darkMode: true });
```

### Session-scoped auth token

```js
session.set('token', 'abc123');
// auto-removed on tab close
```

### Store complex data

```js
local.set('cart', [
    { id: 1, name: 'Widget', qty: 2 },
    { id: 2, name: 'Gadget', qty: 1 }
]);

const cart = local.get('cart');
// [{ id: 1, name: "Widget", qty: 2 }, ...]
```

### Clear on logout

```js
session.clear();
local.remove('user');
```

---

## Notes

- Auto-serializes/deserializes via `JSON.stringify`/`JSON.parse`.
- Strings are stored and returned as-is (no double-serialization).
- Returns `null` on any failure (no thrown errors).
- `update()` does a shallow merge (`{ ...existing, ...data }`) to avoid circular reference errors.
- Non-browser environments will fail silently — guard with `typeof window !== 'undefined'` if needed.
