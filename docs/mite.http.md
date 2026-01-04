# Mite.Http

## Overview

**Mite.Http** is a minimalist fetch wrapper that provides a clean, intuitive API for making HTTP requests. It simplifies common HTTP operations while handling JSON parsing and error responses automatically.

## Module Information

- **Module**: `Mite.Http`
- **Author**: Geoff Doty
- **Version**: 1.0
- **License**: MIT
- **Source**: [GitHub Repository](http://github.com/n2geoff/mite)

## API Reference

### `http.get(url, options)`

Fetch data using the GET method.

**Parameters:**

- `url` (string) - The URL to fetch
- `options` (object, optional) - Additional fetch options

**Returns:**

- Promise resolving to the parsed JSON response

**Example:**

javascript

```javascript
const data = await http.get('/api/users');
```

### `http.post(url, body, options)`

Send data using the POST method.

**Parameters:**

- `url` (string) - The URL to POST to
- `body` (object) - The data to send
- `options` (object, optional) - Additional fetch options

**Returns:**

- Promise resolving to the parsed JSON response

**Example:**

javascript

```javascript
const newUser = await http.post('/api/users', { name: 'John', email: 'john@example.com' });
```

### `http.put(url, body, options)`

Update data using the PUT method.

**Parameters:**

- `url` (string) - The URL to PUT to
- `body` (object) - The data to send
- `options` (object, optional) - Additional fetch options

**Returns:**

- Promise resolving to the parsed JSON response

**Example:**

javascript

```javascript
const updatedUser = await http.put('/api/users/123', { name: 'Jane' });
```

### `http.del(url, options)`

Delete data using the DELETE method.

**Parameters:**

- `url` (string) - The URL to delete
- `options` (object, optional) - Additional fetch options

**Returns:**

- Promise resolving to the parsed JSON response (or null for 204 No Content)

**Example:**

javascript

```javascript
await http.del('/api/users/123');
```

## Features

### Automatic JSON Handling

- Automatically parses JSON responses
- Safely handles empty responses (204 No Content)
- Converts request bodies to JSON automatically

### Error Handling

- Throws descriptive errors with message details
- Falls back to `response.statusText` when no message is provided
- Maintains standard HTTP status code behavior

### Request Configuration

- Extends fetch options with default headers
- Preserves user-provided headers
- Supports all standard fetch options

## Default Headers

All requests automatically include:

javascript

```javascript
{
    'Content-Type': 'application/json'
}
```

## Usage Examples

### Basic GET Request

javascript

```javascript
try {
    const users = await http.get('/api/users');
    console.log(users);
} catch (error) {
    console.error('Failed to fetch users:', error.message);
}
```

### POST Request with Custom Headers

javascript

```javascript
const response = await http.post('/api/users', {
    name: 'Alice',
    email: 'alice@example.com'
}, {
    headers: {
        'Authorization': 'Bearer token123'
    }
});
```

### DELETE Request

javascript

```javascript
await http.del('/api/users/456');
console.log('User deleted successfully');
```

## Error Handling

The library throws `Error` objects with either:

- `data.message` if present in the response
- `response.statusText` as fallback

All HTTP error status codes (4xx, 5xx) will result in thrown errors.

## Browser Compatibility

Requires modern browser support for:

- `fetch` API
- `async/await`
- ES6 destructuring and spread operators

## Dependencies

- None (relies on built-in `fetch` API)

## Notes

- The `del` method is an alias for `delete` (which is a reserved keyword in JavaScript)
- All methods return promises that resolve to parsed JSON data
- Response status code 204 (No Content) returns `null` instead of parsed JSON