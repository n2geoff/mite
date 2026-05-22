---
name: mite-cookie
description: Use the MiteJS cookie helper (mite.cookie.js) for reading, writing, and removing cookies. When asked to manage cookies, A/B test flags, session tokens, or user preferences stored in cookies.
---

# Cookie Helper

A minimalist cookie module for reading, writing, and removing cookies.

```js
import { cookie } from './mite.cookie.js';
```

---

## API

### `cookie.get(key)`

Read a cookie value. Returns `null` if missing.

```js
const token = cookie.get('sessionId');
```

### `cookie.set(key, value, opts?)`

Write a cookie. Returns the stored string, or `null` on failure.

```js
cookie.set('theme', 'dark', { expires: 1440 }); // 24 hours
```

**Options:**

| Option     | Type   | Default | Description          |
|------------|--------|---------|----------------------|
| `expires`  | number | `60`    | Expiry in minutes    |
| `path`     | string | `"/"`   | Cookie path          |
| `domain`   | string | —       | Cookie domain        |

### `cookie.remove(key)`

Delete a cookie. Returns the value that was stored, or `null`.

```js
const old = cookie.remove('sessionId');
```

### `cookie.clear()`

Remove all cookies.

```js
cookie.clear();
```

### `cookie.update(key, data)`

Serialize `data` and store it. Returns the stored value, or `null`.

> Cookies store only strings. For objects, use `JSON.stringify`/`JSON.parse`:

```js
// Storing
const prefs = { theme: 'dark', lang: 'en' };
cookie.set('prefs', JSON.stringify(prefs));

// Reading
const restored = JSON.parse(cookie.get('prefs'));
```

---

## Examples

### A/B test flag (short-lived)

```js
cookie.set('abVariant', 'B', { expires: 5 });
```

### Persistent preference

```js
cookie.set('theme', 'dark', { expires: 43200 }); // 30 days
```

### Session token

```js
cookie.set('token', 'abc123'); // expires in 60 min by default
```

### Clear on logout

```js
cookie.clear();
```

---

## Notes

- Expiry is in **minutes**, not days.
- Values are URL-encoded on write, decoded on read.
- Returns `null` on all failures (no thrown errors).
- Non-browser environments will fail silently — guard with `typeof document !== 'undefined'` if needed.
