---
name: mite-js
description: mite.js is a minimalist SPA framework using a virtual DOM (VNode) and a "hyperscript" (h) pattern for building reactive UIs. Use when building, modifying, or debugging mite.js applications (h/mount/signal/route/$/storage/http).
---

## 📦 Builds

Each build is a standalone file with a different set of exports — import only from the flavor that includes what you need:

| Build | Exports |
|---|---|
| `mite.min.js` | `h`, `mount`, `signal` — the core framework only |
| `mite.core.min.js` | min + `route` (SPA router) |
| `mite.full.min.js` | core + `http`, `$` (DOM helper), `local`, `session`, `cookie` |
| `mite.html.min.js` | `mount`, `signal` + an `` html `` tagged template that replaces `h` (note: raw `h` is **not** exported) |

## API Reference

### 1. `h(tag, props, ...children)`

The building block for all UI elements. It creates a Virtual Node (VNode).

- **`tag`**: (String|Function) The HTML tag (e.g., `'div'`, `'span'`, `'button'`). If a function is passed, it is treated as a sub-view and executed immediately.
- **`props`**: (Object|Any) Attributes for the element (e.g., `{ class: 'btn', onclick: () => {} }`). If the second argument is not an object, it is treated as the first child.
- **`...children`**: (String|VNode|Array) The content inside the element. Can be plain text or other `h()` calls.
- **Special Props**:
  - `key`: A stable, unique identifier for items in lists rendered via `.map()`. Lets the reconciler track item identity across re-renders instead of relying on position — avoids unnecessary DOM replacement and preserves per-item state (focus, input values).
  - `html`: Used to inject raw HTML (includes basic sanitization).
  - `oncreate`: A lifecycle hook that runs after the element is added to the DOM.
  - `style`: Can be a string or an object (e.g., `{ color: 'red', fontSize: '12px' }`).

### 2. `mount(selector, view, state)`

The entry point that connects the logic to the DOM.

- **`selector`**: CSS selector for the root element (e.g., `'#app'`).
- **`view`**: A **View Function** that returns a VNode.
- **`state`**: (Object|Signal) The initial state. If a plain object is passed, `mount` automatically converts it into a reactive `signal`.

### 3. `signal(initState, logger)`

Creates a reactive state container. Usually handled internally by `mount`, but used for standalone state management.

- **`.val()`**: Returns the current state object.
- **`.update(next)`**: Merges `next` into the current state and triggers a re-render of all subscribed views.
- **`.subscribe(fn)`**: Adds a listener that triggers when state changes.

> NOTE: `mount` and `route` auto-create a signal from plain objects, so this export is rarely needed. You only create one explicitly when you want to own the instance — e.g., sharing a single reactive store across multiple mounted views (pass the same signal to each), or standalone reactive logic with no view.

---

## 🏗 Architecture: The View Function

All UI logic in mite.js is encapsulated in **View Functions**.

### The Context (`ctx`) Object

Every view function receives a `ctx` object as its only argument. You must use this object to access state and trigger updates:

- `ctx.state`: The current snapshot of the reactive state.
- `ctx.update`: The function used to modify state (e.g., `ctx.update({ count: ctx.state.count + 1 })`).
- `ctx.params`: Used for passing parameters (primarily used in routing extensions).
- `ctx.content`: Used as a placeholder for nested content (primarily used in layout extensions).

> TIP: destruct required options in signature: `function MyView({state, update}) {...}`

**Standard View Pattern:**

```js
const MyComponent = ({state, update}) => h('div', { class: 'container' }, [ 
  h('h1', {}, `Count is: ${state.count}`), 
  h('button', { onclick: () => update({ count: state.count + 1 }) }, 'Increment') 
]);
```

---

## 📋 Coding Guidelines & Best Practices

1. **Immutability**: Always use `ctx.update()` to change state. Never mutate `ctx.state` directly.
2. **Children Handling**: When passing multiple children to `h()`, wrap them in an array if they are dynamic or complex.
3. **Event Handling**: Use the `on[event]` naming convention in props (e.g., `onclick`, `oninput`, `onchange`).
4. **Conditional Rendering**: Use JavaScript ternary operators or `&&` inside `h()` calls to handle conditional UI.
5. **Fragment Usage**: To return multiple top-level elements without a wrapper `div`, use the tag `'fragment'`.
6. **List Rendering**: When mapping arrays to children, always set a unique `key` prop on each item (e.g., `h('li', { key: todo.id }, ...)`). Never use the array index as the key if items can be reordered or removed.
7. **Form Inputs**: Keep inputs **uncontrolled** — don't bind `value` from state. Read values in event handlers via `e.target.value` (or `$(e.target).data()` for a whole form), and clear fields yourself after processing (`input.value = ''`). Use `onsubmit` with `e.preventDefault()` to handle forms in JS.

---

## 🚀 Example Implementation (Counter App)


```js
import { h, mount } from './mite.js'; 
// View Function 
const CounterApp = ({state, update}) => { 
  return h('div', { class: 'app-wrapper' }, [ 
    h('h2', {}, 'Mite.js Counter'), 
    h('p', {}, `Current Value: ${state.count}`), 
    h('div', { class: 'controls' }, [ 
      h('button', { onclick: () => update({ count: state.count - 1 }) }, '-'), 
      h('button', { onclick: () => update({ count: state.count + 1 }) }, '+') 
    ]) 
  ]); }; 
  
  // Mount to DOM w/ initial state
  mount('#app', CounterApp, { count: 0 });
```
---

## 🧩 Additional Functionality (depending on build)

### `route(selector, routes, state?, opts?)` — SPA Router (replaces `mount`)

Hash-based router that replaces `mount()` as the entry point for Single Page Applications. It internally delegates rendering to `mount`, so everything documented above (views, signals, `ctx`) still applies.

- **`selector`**: CSS selector for the root element (e.g., `'#app'`).
- **`routes`**: Object mapping path strings to View Functions. Keys starting with `/` are exact matches; keys containing `:param` segments define dynamic params (e.g., `'/user/:id'`).
- **`state`** (optional): Initial state object or an existing signal instance. If omitted, an empty signal is created.
- **`opts`** (optional):
  - `layout`: A View Function that wraps routed content. Inside it, use `ctx.content` as the placeholder for the matched route's output.
- **Returns**: The signal instance used by the application.

**Behavior:**
- Navigation is hash-based: `#/user/1` resolves to path `/user/1` (an empty hash means `/`). On every `hashchange`, the router re-renders through the normal `mount` cycle.
- Unmatched paths fall back to the route registered under the key `404`; if none is defined, nothing renders.
- Hashes that do not start with `#/` (plain anchor links) are bypassed — no re-render, current content preserved.
- Dynamic params from a matched route are available as `ctx.params` inside the routed view.

**Standard Route Pattern:**

```js
import { h, route } from './mite.core.min.js';

const Home = ({state}) => h('h1', {}, 'Home');
const User = ({params}) => h('h1', {}, `User: ${params.id}`);
const NotFound = () => h('h1', {}, '404');

route('#app', {
  '/': Home,
  '/user/:id': User,
  '404': NotFound
}, { user: null }, {
  layout: ({content}) => h('div', { class: 'layout' }, [
    h('nav', {}, [h('a', { href: '#/' }, 'Home')]),
    content
  ])
});
```

### `$` — DOM & Form Helper (full build)

A fluent, jQuery-lite helper for working directly with the real DOM — mostly useful outside the render cycle (imperative code, event handlers, form handling). Imported from the *full* build as `$`. It wraps one or more elements; every method operates on **all** matched elements unless noted.

- **`$(selector, context = document)`**: Create a helper instance.
  - `selector`: CSS selector string (matched via `querySelectorAll`), a single DOM element, or an array of elements.
  - `context`: Scope for selection (defaults to `document`).
- **`.el`**: The raw array of matched elements (escape hatch for native DOM APIs).
- **`.on(event, handler, opts)`** / **`.off(event, handler, opts)`**: Add/remove event listeners on all matched elements. Chainable.
- **`.val(newValue?)`**: Without an argument, returns the `value` of the first element; with an argument, sets `value` on all matched elements (chainable).
- **`.toggle(cls)`**: Toggle a CSS class on all matched elements. Chainable.
- **`.data()`**: Form only — extracts form fields as a plain object via `FormData` (`{ name: value }`). Returns `{}` if the first element is not a `<form>`.
- **`.validate(onInvalid?)`**: Form only — runs the browser's native `checkValidity()`. If invalid and `onInvalid` is a function, it is called with the array of invalid field elements. Returns `true` for valid forms (and non-forms).

> TIP: to act on a single element, reach into `.el`: `$('input[name="date"]').el[0]?.focus();`

**Typical Usage:**

```js
import { h, $ } from './mite.full.min.js';

// Form handling with validation
const onSubmit = (e) => {
  e.preventDefault();
  const form = $(e.target);
  if (!form.validate(badFields => badFields.forEach(f => f.classList.add('invalid')))) return;
  console.log(form.data()); // { name: 'Mite', email: 'mite@js.dev' }
};

// Imperative DOM work outside the render cycle
$('.menu').on('click', () => $('.menu-item').toggle('open'));
$('#search').val('');
```

### `local`, `session` & `cookie` — Storage (full build)

Three unified storage abstractions sharing one API: **`local`** (`window.localStorage`, persists across browser restarts), **`session`** (`window.sessionStorage`, cleared when the tab closes), and **`cookie`** (browser cookies, sent with server requests). All operations fail silently — they return `null` on failure rather than throwing.

**Shared API:**

- **`.get(key)`**: Returns the stored value, or `null` if missing.
- **`.set(key, value, opts?)`**: Stores the value and returns it (`null` on failure).
- **`.remove(key)`**: Deletes the key and returns what was stored (`null` if absent).
- **`.clear()`**: Removes all items from the store.
- **`.update(key, data)`**: Writes `data` under `key` and returns the stored value.

**Serialization:**
- `local` / `session`: auto JSON round-trip — objects and arrays are `JSON.stringify`/`parse`'d, strings stored as-is. `.update()` shallow-merges `data` into the existing object (creates one if missing), ideal for evolving settings.
- `cookie`: values are coerced to **strings** (`String(value)`) — no JSON, and `.update()` overwrites rather than merges. The extra `opts` argument supports `{ expires = 60 /* minutes */, path = '/', domain }`. Note: an expiry is always written (default 60 minutes), so there are no session-lifetime cookies — pass a large `expires` for long-lived ones.

**Typical Usage:**

```js
import { local, session, cookie } from './mite.full.min.js';

// Persist user preferences across visits (auto JSON, merged)
let prefs = local.get('prefs') || { theme: 'light' };
prefs = local.update('prefs', { darkMode: true }); // merged & saved

// Session-scoped data (e.g., auth token, draft state)
session.set('token', 'abc123');
const removed = session.remove('token'); // 'abc123' — returns what was stored

// Cookie visible to the server, expiring in 1 hour
cookie.set('theme', 'dark', { expires: 60 });
```

### `http` — Fetch Client (full build)

A minimal fetch wrapper with automatic JSON handling. All methods return a **Promise** that resolves to the parsed JSON body (`null` for `204 No Content`). Requests default to `Content-Type: application/json` (overridable via `opts.headers`). On any non-OK response, the Promise **rejects** with an `Error` whose message is the server's `message` field if present, otherwise the status text.

- **`http.get(url, opts?)`**: GET request; `opts` are passed through to `fetch`.
- **`http.post(url, body, opts?)`**: POST with `body` auto `JSON.stringify`'d.
- **`http.put(url, body, opts?)`**: PUT with `body` auto `JSON.stringify`'d.
- **`http.del(url, opts?)`**: DELETE request.

**Typical Usage:**

```js
import { http } from './mite.full.min.js';

// Load data into reactive state
const load = async () => {
  try {
    const todos = await http.get('/api/todos');
    update({ todos: todos || [] });
  } catch (err) {
    update({ error: err.message });
  }
};

// Mutations — body is serialized for you
await http.post('/api/todos', { text: 'New task' });
await http.del(`/api/todos/${id}`);
```
