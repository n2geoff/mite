# MiteJS API Reference

Use this reference when you need the main runtime semantics quickly.

## `h(tag, props, ...children)` - Virtual Node Factory

Creates a virtual DOM node (VNode). Used to declaratively describe UI structure.

```javascript
// Basic usage with tag and children array
h('div', { class: 'container' }, [
  h('h1', {}, 'Hello'),
  h('p', {}, 'World')
])

// Props optional - can omit if no attributes needed
h('br')

// Nested h() calls (alternative to arrays)
h('div', null, [
  h('span', {}, 'Text'),
  h('button', { onclick: handler }, 'Click')
])

// Function components receive ctx object with state, update, params, content
const Button = ({state, update, children}) => 
  h('button', {onclick: () => update({clicked: true})}, children)
```

**Parameters:**
- `tag` (string|function): HTML tag name ('div', 'span') or function component. Use 'fragment' for grouping without creating element.
- `props` (object|null, optional): Attributes like `{class: 'foo', onclick: fn}`. Also supports `{html: '<strong>raw</strong>'}` for innerHTML.
- `...children`: Text strings, VNodes, arrays of VNodes `[h('div'), h('span')]`, or nested lists

**Returns:** VNode object with properties `{tag, props, children}`

---

## `signal(initState, logger)` - Reactive State Container

Creates a reactive state container that notifies subscribers on updates.

```javascript
const { val, update, subscribe } = signal({ count: 0 })

// Read current state
const currentState = val()

// Update state immutably (always spread existing state)
update({ count: currentState.count + 1 })

// Subscribe to changes - called whenever update() is invoked
subscribe(() => {
  const newState = val()
  console.log('State changed:', newState)
})
```

**Parameters:**
- `initState` (object): Initial state object with any data structure
- `logger` (boolean, optional): If true, logs updates to console

**Returns:** Object containing:
- `val()` → Current state snapshot
- `update(next)` → Immutable update function accepting partial state object
- `subscribe(fn)` → Register callback for reactivity

---

## `mount(selector, view, state, opts)` - Application Mounting

Mounts a reactive view or router to a DOM element.

```javascript
// Simple counter app
const Counter = ({state, update}) => 
  h('div', {}, `Count: ${state.count}`)

mount('#app', Counter, { count: 0 })

// With routing (hash-based SPA)
const routes = {
  '/': HomeView,
  '/user/:id': UserView,
  '404': NotFoundView
}

mount('#app', null, state, { routes })
```

**Parameters:**
- `selector` (string): CSS selector for root DOM element ('#app', '.container')
- `view` (function|null): View function receiving `{state, update, params, content}` context. Use `null` when using routing only.
- `state` (object|signal instance, optional): Initial state object or existing signal instance
- `opts` (object, optional): Configuration options:
  - `routes` (Object.<string, function>): Hash map of paths to view functions. Supports params like `/user/:id`.

**Returns:** Signal instance used by the application

---

## `$()` - DOM Helper Utility

Fluent API for DOM manipulation, event handling, and form operations.

```javascript
// Select element(s)
const form = $('#myForm')  // Returns first matching element or array

// Chainable methods:
form.on('submit', handleSubmit).off('focus').toggle('hidden')

// Form helpers
const value = $('input[name="email"]').val()      // Get value
$('input[name="name"]').val('John Doe')           // Set value (chainable)

const data = $('#contactForm').data()             // FormData to object
$('#form').validate(onInvalidFields)              // Validate form fields

// Raw elements access
const elements = $('button').el                   // Array of DOM elements
```

**Parameters:**
- `selector` (string|Element|Element[]): CSS selector, single element, or array
- `context` (Document|Element, optional): Search context (defaults to document)

**Returns:** Helper object with chainable methods:
- `el` → Raw DOM elements array
- `on(event, handler, opts)` → Add event listener, returns this
- `off(event, handler, opts)` → Remove event listener, returns this
- `val([value])` → Get/set element value (chainable when setting)
- `toggle(cls)` → Toggle CSS class, returns this
- `data()` → Extract FormData as object (form only)
- `validate(onInvalid)` → Validate form fields, calls callback if invalid

---

## Routing Context Object

When using routes, view functions receive a context (`ctx`) with:

```javascript
const UserView = ({state, update, params, content}) => {
  // state - current application state
  // update - signal update function
  // params - route parameters (e.g., {id: '123'} from /user/:id)
  // content - router-provided content for nested routing
}
```

---

## Raw HTML Rendering

Use `{html: "..."}` prop to render raw HTML strings. **Treat as UNSAFE** - only basic XSS sanitization provided (removes `<script>` tags and event handlers).

```javascript
h('p', {html: '<strong>Bold</strong> text'})
```

---

## Best Practices

1. Always spread state when updating: `update({...state, count: newState})`
2. Use `key` prop on list items for optimal reconciliation performance
3. Keep view functions pure - no side effects in render path
4. Sanitize user input before passing to `{html: ...}`
5. Use function components for reusable UI patterns
