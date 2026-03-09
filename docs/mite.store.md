# Store

A unified, minimalist storage abstraction for `localStorage`, `sessionStorage`, and cookies.

- Auto-serializes/deserializes  
- Silent failures (`null` return)  
- Consistent API across backends   

---

## Installation

No dependencies. Just import:

```js
import { Store } from './mite.store.js';
```

## Usage

Get a storage instance

```js
const local   = Store('local');    // window.localStorage
const session = Store('session');  // window.sessionStorage
const cookie  = Store('cookie');   // document.cookie (best-effort)
```

> 🚫 Throws error for unsupported types or non-browser environments (e.g., Node.js with cookies).

### Core API

#### `set(key, value, opts?)`

Stores a value and returns it. Returns `null` on failure.

```js
const user = local.set('user', { name: 'Geoff', age: 50 });
// user === { name: 'Geoff', age: 50 }

// Cookie-specific options (ignored by local/session)
cookie.set('theme', 'dark', { expires: 30, path: '/app' });
```

#### `get(key)`

Retrieves and deserializes a value. Returns `null` if missing or invalid.

```js
const user = session.get('user'); // { name: "Geoff", age: 50 }
const missing = local.get('nothing'); // null
```

#### `remove(key)`

Deletes the value and returns what was stored. Returns `null` if absent.

```js
const removed = local.remove('user');
// removed === { name: "Geoff", age: 50 }
```

#### `clear()`

Removes all items in the store (no return value).

- **local/session**: Native `.clear()`
- **cookie**: Best-effort — deletes *all* cookies accessible via `document.cookie` (same-domain only)

```js
session.clear(); // empties session storage
```

#### `update(key, data)`

Shallow merges existing value with `data`, stores it, and returns the merged result.

```js
local.set('config', { theme: 'dark', lang: 'en' });
const updated = local.update('config', { lang: 'fr' });
// updated === { theme: "dark", lang: "fr" }
```

> ⚠️ If no value exists, creates a new object from `data`.

------

## Options

- **`opts.expires`** (only for cookies)
   Expiry time in minutes. Default: `60`.
   Example: `{ expires: 1440 }` → 24 hours.
- **`opts.path`, `opts.domain`**
   Cookie scoping (ignored by local/session storage).

> All `.set()` methods accept `opts = {}` as third parameter — but only cookies use it. This keeps the API consistent.

------

## Error Handling

- All operations return `null` on failure (no thrown errors).
- Invalid keys/values are handled gracefully via serialization safety.
- Cookies throw in non-browser environments.

```js
const result = Store('cookie').set('x', 123);
// result === null if document.cookie is unavailable
```

------

## Examples

### Persist user preferences

```js
const local = Store('local');
let prefs = local.get('prefs') || { theme: 'light' };
prefs = local.update('prefs', { darkMode: true });
```

### Session-scoped auth token

```js
session.set('token', 'abc123');
// auto-removed on tab close
```

### Short-lived cookie for A/B test flag

```js
cookie.set('abVariant', 'B', { expires: 5 }); // 5 minutes
```

------

## Notes

- Uses `JSON.stringify`/`parse` for objects, arrays, and non-strings.
- Cookies store only strings → values are converted to JSON before saving.
- Shallow merge in `.update()` prevents circular reference errors.
