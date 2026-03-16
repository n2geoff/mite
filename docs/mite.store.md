# Store

A unified storage abstraction for `localStorage` & `sessionStorage`.

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

Get a storage reference

```js
import {local} from "./mite.store.js";    // window.localStorage
import {session} from "./mite.store.js";  // window.sessionStorage
```

> 🚫 Throws error for unsupported types or non-browser environments.

### Core API

#### `set(key, value, opts?)`

Stores a value and returns it. Returns `null` on failure.

```js
const user = local.set('user', { name: 'Conan', age: 44 });
// user === { name: 'Conan', age: 44 }
```

#### `get(key)`

Retrieves and deserializes a value. Returns `null` if missing or invalid.

```js
const user    = session.get('user');   // { name: "Conan", age: 44 }
const missing = local.get('nothing');  // null
```

#### `remove(key)`

Deletes the value and returns what was stored. Returns `null` if absent.

```js
const removed = local.remove('user');
// removed === { name: "Conan", age: 44 }
```

#### `clear()`

Removes all items in the store (no return value).

- **local/session**: Native `.clear()`

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

## Error Handling

- All operations return `null` on failure (no thrown errors).
- Invalid keys/values are handled gracefully via serialization safety.

------

## Examples

### Persist user preferences

```js
import {local} from "./mite.store.js";

let prefs = local.get('prefs') || { theme: 'light' };
    prefs = local.update('prefs', { darkMode: true });
```

### Session-scoped auth token

```js
session.set('token', 'abc123');
// auto-removed on tab close
```

------

## Notes

- Uses `JSON.stringify`/`parse` for objects, arrays, and non-strings.
- Shallow merge in `.update()` prevents circular reference errors.
