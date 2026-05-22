# Mite.js - Agent Guidelines

## Project Overview
Mite.js is a minimalist SPA framework designed to rapidly prototype single-page applications. It provides virtual DOM rendering, reactive state management (signals), and hash-based routing. The codebase breaks UI components and pages into reusable functions while offering a DOM utility for form handling. Pure ES modules with no dependencies or build system.

## Commands
- **No build system** - Code runs directly as ES modules in browsers
- **Testing**: No automated tests configured; test manually by importing `mite.full.js` via `<script type="module">` or browser-based testing
- **Linting**: ESLint via `bun run lint`

## Exports (Public API)
The framework exports only four core functions from `mite.full.js`:
- **`h(tag, props, ...children)`** - Creates virtual nodes; tag can be string or function component
- **`mount(selector, view, state, opts)`** - Mounts reactive views with optional routing
- **`signal(initState, logger)`** - Reactive state container with subscribe/update API
- **`$(selector, context)`** - DOM helper with fluent API for forms and events

## Code Style Guidelines

### CSS / Stylesheets
- Use semantic HTML 
- Expect PicoCSS or similar Classless CSS framework as style foundation

### Imports & Exports
- Use named exports exclusively (`export const foo = ...`)
- ES module syntax only; no CommonJS or require()
- Single file structure in `mite.full.js`; internal helpers prefixed as needed
- Only export public APIs (h, mount, signal, $) - keep internals private

### Naming Conventions
- **Functions**: camelCase (`createElement`, `patchProps`, `signal`)
- **Constants**: lowercase where appropriate
- **Parameters**: descriptive names; use `vnode`, `el`, `props`, `state` consistently
- **Internal helpers**: Keep as regular functions (not exported) for internal use only

### Type System & JSDoc
- Use JSDoc type annotations in comments (`@param {string}`, `@returns {Object}`)
- No TypeScript; rely on runtime checks and developer discipline
- Document all public APIs with clear parameter descriptions
- Reference `skill/api.md` for API semantics when implementing new features

### Formatting
- Consistent spacing after commas in function calls
- Object spread syntax: no spaces (`...props`)
- Chain method calls concisely
- Keep functions small and focused (single responsibility)

### Error Handling
- Minimal error handling for brevity; assume valid inputs in production
- Sanitize HTML via regex before `innerHTML` assignment (XSS prevention)
- Graceful degradation: filter null/false/empty strings from children

### Virtual DOM API
- **h(tag, props, ...children)** - tag can be 'fragment' or function component
- Props is optional; children can be array `[...]` or nested list of h() calls
- Use `key` prop on list items for performance optimization
- Raw HTML via `{html: "..."}` (treat as UNSAFE, basic sanitization only)

### Reactive State (Signals)
```javascript
const { val, update, subscribe } = signal(initialState);
update({ count: state.count + 1 }); // Immutable updates via spread
subscribe(renderFn);                 // Subscribe to re-renders
```

### DOM Helper `$()`
- Fluent API: `$('form').on('submit', handler).val('new value')`
- Methods: `el`, `on()`, `off()`, `val()`, `toggle(cls)`, `data()`, `validate()`
- Returns helper object with chainable methods

### Routing (Hash-based)
```javascript
route('#app', { routes: { '/user/:id': UserView }, state });
// Access params via ctx.params.id in route handlers
```

## Best Practices for Agents
1. **Preserve size**: Keep changes minimal; this is a minimalist framework (~300 lines)
2. **Maintain compatibility**: Only export public APIs (h, mount, signal, $); keep internals private
3. **Test manually**: Verify DOM updates work correctly after changes in browser
4. **Add JSDoc**: Document any new functions with type annotations
5. **Sanitize input**: Always validate user data before DOM insertion
6. **Reference docs**: Check `skill/examples.md` for usage patterns and `skill/api.md` for API semantics

## File Structure
```
mite.full.js      - Core framework (h, mount, signal, $) with internal helpers
skill/examples.md - Usage examples (counter, todos, router, forms)
skill/api.md      - API reference notes for agents
AGENTS.md         - This file
```
