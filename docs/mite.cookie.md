# Cookie

A minimalist cookie helper with a fluent API for reading, writing, and removing cookies.

- URL-encodes values automatically  
- Expiry in minutes (not days)  
- Silent failures (`null` return)  
- JSON-aware: stores strings, but designed for serialized objects  

---

## Installation

No dependencies. Just import:

```js
import { cookie } from './mite.cookie.js';
```

---

## API Reference

### `cookie.get(key)`

Retrieves a cookie value by name. Returns `null` if missing or invalid.

```js
const token = cookie.get('sessionId');
// token === "abc123"
```

### `cookie.set(key, value, opts?)`

Sets a cookie and returns the stored string. Returns `null` on failure.

```js
const stored = cookie.set('theme', 'dark');
// stored === "dark"
```

**Options:**

| Option      | Type     | Default | Description                    |
|-------------|----------|---------|--------------------------------|
| `expires`   | number   | `60`    | Expiry in minutes              |
| `path`      | string   | `"/"`   | Cookie path                    |
| `domain`    | string   | —       | Cookie domain (optional)       |

Example with custom options:

```js
cookie.set('abVariant', 'B', { expires: 5, domain: 'example.com' });
```

### `cookie.remove(key)`

Deletes a cookie and returns the value that was stored. Returns `null` if absent.

```js
const removed = cookie.remove('sessionId');
// removed === "abc123"
```

### `cookie.clear()`

Removes all cookies (no return value).

```js
cookie.clear();
```

### `cookie.update(key, data)`

Serializes `data` to JSON, stores it as a cookie, and returns the stored value.

> ⚠️ Cookies store only strings. For objects/arrays, use `JSON.stringify`/`JSON.parse` manually:

```js
// Storing an object
const prefs = { theme: 'dark', lang: 'en' };
cookie.set('prefs', JSON.stringify(prefs));

// Retrieving it back
const restored = JSON.parse(cookie.get('prefs'));
// restored === { theme: "dark", lang: "en" }
```

---

## Error Handling

- All operations return `null` on failure (no thrown errors).
- Invalid keys are coerced to strings via `String(key)`.
- Cookie values are URL-encoded on write and decoded on read.

---

## Usage Examples

### Short-lived cookie for A/B test flag

```js
cookie.set('abVariant', 'B', { expires: 5 }); // expires in 5 minutes
```

### Persistent user preference

```js
cookie.set('theme', 'dark', { expires: 43200 }); // 30 days
```

### Session-scoped token

```js
cookie.set('token', 'abc123'); // expires in 60 minutes by default
```

---

## Notes

- Expiry is specified in **minutes**, not days or timestamps — this is a deliberate design choice for readability.
- Cookies are URL-encoded on write and decoded on read via `encodeURIComponent` / `decodeURIComponent`.
- `clear()` iterates all existing cookie names and removes them one by one.
- Throws in non-browser environments (no `document.cookie` support).
