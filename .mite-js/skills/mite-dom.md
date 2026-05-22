---
name: mite-dom
description: Use the MiteJS DOM helper (mite.dom.js) for selecting elements, handling events, manipulating form values, and form validation. When asked to work with DOM elements, forms, event listeners, or CSS classes.
---

# Mite.Dom

A minimalist fluent DOM helper for selecting elements, handling events, and working with forms.

```js
import { dom } from './mite.dom.js';
```

---

## API

### `dom(selector, context?)`

Select element(s) and return a helper instance.

```js
const form = dom('#myForm');
const buttons = dom('.button');
```

**Parameters:**

| Param      | Type              | Default     | Description                    |
|------------|-------------------|-------------|--------------------------------|
| `selector` | string \| Element \| Element[] | — | CSS selector, DOM element, or array |
| `context`  | Document \| Element | `document` | Search context                 |

**Returns:** Helper object with chainable methods.

---

### `.el` — Raw Elements

Returns the array of DOM elements.

```js
dom('input').el; // [HTMLInputElement, ...]
```

---

### `.on(event, handler, opts?)` — Add Event Listener

Adds an event listener to all selected elements.

```js
dom('#submit').on('click', handleSubmit);
dom('.item').on('mouseenter', highlight);
```

**Returns:** The helper instance (chainable).

---

### `.off(event, handler, opts?)` — Remove Event Listener

Removes an event listener from all selected elements.

```js
dom('#submit').off('click', handleSubmit);
```

**Returns:** The helper instance (chainable).

---

### `.val([newValue])` — Get/Set Value

Gets the value of the first element, or sets values on all elements.

```js
// Get
const name = dom('#name').val();

// Set (chainable)
dom('#name').val('Alice');
```

---

### `.toggle(cls)` — Toggle CSS Class

Toggles a class on all selected elements.

```js
dom('#menu').toggle('open');
```

**Returns:** The helper instance (chainable).

---

### `.data()` — Extract Form Data

Extracts form field values as a plain object. Only works on `<form>` elements.

```js
const formData = dom('#contactForm').data();
// { name: "Alice", email: "alice@example.com" }
```

**Returns:** Object with field names as keys, or `{}` if not a form.

---

### `.validate(onInvalid?)` — Form Validation

Validates a form using the browser's built-in validation API. Only works on `<form>` elements.

```js
const isValid = dom('#contactForm').validate((fields) => {
    fields.forEach(el => el.classList.add('invalid'));
});
```

**Parameters:**

| Param        | Type     | Description                           |
|--------------|----------|---------------------------------------|
| `onInvalid`  | Function | Optional callback receiving invalid fields |

**Returns:** `true` if valid, `false` if invalid.

---

## Examples

### Event handling

```js
dom('.delete-btn').on('click', (e) => {
    e.currentTarget.closest('li').remove();
});
```

### Form submission

```js
dom('#loginForm').on('submit', (e) => {
    e.preventDefault();
    const data = dom('#loginForm').data();
    // send data to API
});
```

### Toggle visibility

```js
dom('#sidebar').toggle('collapsed');
```

### Set multiple values

```js
dom('input[required]').val('');
```

### Validate on submit

```js
const valid = dom('#signupForm').validate((fields) => {
    fields.forEach(el => 
        el.parentElement.querySelector('small').textContent = 'Required'
    );
});
```

---

## Notes

- Chainable: all methods return the helper instance except `.val()` (getter) and `.data()` / `.validate()`.
- String selectors use `querySelectorAll` — always returns multiple elements.
- Passing an Element wraps it in an array.
- `.data()` and `.validate()` only work on `<form>` elements; returns `{}` / `true` otherwise.
- `.validate()` uses `checkValidity()` — respects HTML5 validation attributes (`required`, `pattern`, etc.).
