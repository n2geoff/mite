---
name: mite-http
description: Use the MiteJS HTTP helper (mite.http.js) for making fetch-based HTTP requests with automatic JSON handling. When asked to make API calls, GET/POST/PUT/DELETE requests, or handle JSON responses.
---

# Mite.Http

A minimalist fetch wrapper with automatic JSON serialization and error handling.

```js
import { http } from './mite.http.js';
```

---

## API

### `http.get(url, opts?)`

Fetch data via GET. Returns parsed JSON or `null` for 204 responses.

```js
const users = await http.get('/api/users');
```

### `http.post(url, body, opts?)`

Send a POST request with a JSON body.

```js
const user = await http.post('/api/users', { name: 'Alice' });
```

### `http.put(url, body, opts?)`

Send a PUT request with a JSON body.

```js
const updated = await http.put('/api/users/1', { name: 'Alice Smith' });
```

### `http.del(url, opts?)`

Send a DELETE request.

```js
await http.del('/api/users/1');
```

**Parameters:**

| Param    | Type   | Description                              |
|----------|--------|------------------------------------------|
| `url`    | string | Request URL                              |
| `body`   | object | Request body (POST/PUT only, auto-JSON)  |
| `opts`   | object | Additional fetch options (headers, etc.) |

**Returns:** `Promise<any>` — parsed JSON or `null` (204 No Content).

**Throws:** `Error` with `data.message` from response body, or `response.statusText` as fallback.

---

## Features

### Automatic JSON

- Request bodies are `JSON.stringify`'d automatically
- Responses are parsed with `JSON.parse`
- `Content-Type: application/json` set on all requests

### Error Handling

- 4xx/5xx responses throw `Error`
- Error message prioritizes `data.message` from response body
- Falls back to `response.statusText`

### 204 No Content

Returns `null` instead of parsing (avoids JSON parse errors).

---

## Examples

### Basic GET

```js
const users = await http.get('/api/users');
```

### POST with error handling

```js
try {
    const user = await http.post('/api/users', {
        name: 'Alice',
        email: 'alice@example.com'
    });
} catch (err) {
    console.error('Failed:', err.message);
}
```

### Custom headers

```js
const data = await http.get('/api/protected', {
    headers: { 'Authorization': 'Bearer token123' }
});
```

### PUT update

```js
await http.put('/api/users/1', { name: 'Updated Name' });
```

### DELETE

```js
await http.del('/api/users/1');
// returns null (204 No Content)
```

### Override Content-Type

```js
const data = await http.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
```

---

## Notes

- `del` is used instead of `delete` (reserved keyword).
- Body objects are always JSON-stringified; pass raw strings/blobs directly if needed.
- User headers extend (not replace) the default `Content-Type`.
- Requires modern browser `fetch` API.
