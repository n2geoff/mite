# Mite JS

```
     /___\        ___ _
     )O.o(  |\/| o | |_   BE small
     \_^_/  |  | | | |_   be STRONG
      " "
```

Brain space is limited, time is limited, ideas are abundant, so enter: **Mite JS**

We have all been there...

Its midnight. You need sleep. With morning comes work and it has demands, but you have an idea that you cannot shake.  You need to just get it out of your head and into some code.  You could grab one of the heavy-weight champions, but you don't have time for all the boilerplate fluff. You could also reach for AI, but that is prompt-after-prompt until the sun comes up -- no time for that.

Build your idea NOW, no distractions, minimal **Mite** work!

Give it a try


## Features

- **Minimalist Core**: ~2KB minified.
- **Hyperscript Syntax**: Fast, readable component building.
- **Reactive State**: Built-in global store with a simple `.update()` API.
- **Smart Patching VDOM**: Key-aware diffing and robust Fragment support.
- **Parametric Hash Router**: Support for dynamic routes (e.g., `/user/:id`).
- **Build Variation**: From core-to-full featured your choice.


## Getting Started

Just import `Mite JS` in your project

```js
import { h, mount } from './mite.standard.min.js';
```
You REALLY only need TWO functions

1. Build components with either `h` or `html`
2. Render app with either `mount` or `route`

**Both** render options return a `store` that you can use, if needed, to integrate your data into a database or share with other libraries

*That seriously reduces congnitive load!*

### Pick You Flavor

Depending on your needs, there are a few variations, see below

| Build                                  | Size* | Features                            |
| -------------------------------------- | ----- | ----------------------------------- |
| [Core](/dist/mite.core.min.js)         | ~2KB  | minimal `h`, `mount`, `store` |
| [Standard](/dist/mite.standard.min.js) | ~3KB  | adds `route`, `navigate`, `Link`   |
| [Full](/dist/mite.full.min.js)         | ~4KB  | adds `html` tagged templates for UI |

> \* Minified Size


## Usage Examples

### 1. The Classic Counter

The simplest way to see reactivity in action using `mount`.

```js
import { h, mount } from '../dist/mite.core.min.js';

const Counter = (state, update) => h('div', { class: 'container' },
  h('h2', {}, `Count: ${state.count}`),
  h('div', { class: 'grid' },
    h('button', { onclick: () => update({ count: state.count + 1 }) }, '+1'),
    h('button', {
      class: 'secondary',
      onclick: () => update({ count: state.count - 1 })
    }, '-1')
  )
);

mount('#app', Counter, { count: 0 });
```

### 2. Todo List (Keys & Forms)

This example demonstrates list rendering with `key` for performance and how to handle form inputs.

```js
import { h, mount } from '../dist/mite.core.min.js';

const TodoApp = (state, update) => {
  const addTodo = (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    if (!input.value) return;

    update({
      todos: [...state.todos, { id: Date.now(), text: input.value }]
    });
    input.value = '';
  };

  return h('article', {},
    h('header', {}, h('h3', {}, 'My Tasks')),
    h('form', { onsubmit: addTodo },
      h('fieldset', { class: 'grid' },
        h('input', { placeholder: 'What needs doing?' }),
        h('button', { type: 'submit' }, 'Add')
      )
    ),
    h('ul', {},
      state.todos.map(todo => h('li', { key: todo.id }, todo.text))
    )
  );
};

mount('#app', TodoApp, { todos: [] });
```

### 3. SPA Router (Master/Detail)

Mite shines when building multi-page interfaces. The `route` passes `params` (like `:id`) directly to your views

```js
import { h, route, Link } from '../dist/mite.standard.min.js';

// Master View
const Home = (state) => h('div', {},
  h('h1', {}, 'Project Dashboard'),
  h('ul', {},
    state.projects.map(p => h('li', {},
      Link({ href: `/project/${p.id}` }, `View ${p.name}`)
    ))
  )
);

// Detail View
const Detail = (state, update, params) => {
  const project = state.projects.find(p => p.id == params.id);

  return h('article', {},
    h('header', {}, h('h2', {}, project?.name || 'Not Found')),
    h('p', {}, 'Detailed project metrics would go here.'),
    h('footer', {}, Link({ href: '/' }, '← Back Home'))
  );
};

const routes = {
  '/': Home,
  '/project/:id': Detail,
  '404': () => h('h1', {}, '404: Lost in space')
};

const state = {
  projects: [
    { id: 1, name: 'Alpha Station' },
    { id: 2, name: 'Deep Space 9' }
  ]
};

route('#app', routes, state);
```

## Why Hyperscript

It provides the smallest foot-print, requires no build step, still quite readable, and can easily be extend to support `html` via string literials.

> SEE:  `dist/mite.full.min.js` for an `html` alternative to `h`


## API Reference

| **Function** | **Description**    |
| -------------| ------------------ |
| `h(tag, props, ...children)`      | Hyperscript style UI component. Returns DOM. |
| `mount(selector, view, state)`    | Mounts a component to a DOM element. Returns a store.       |
| `route(selector, routes, state)` | Mounts & Initializes hash-based routing. Returns a store.   |
| `store(initial, logger)`    | Creates a standalone reactive store.                        |
| `Link(props, ...children)`        | Helper for `<a>` tags. Auto-adds `#` and `active` class.    |
| `navigate(path)`                  | Programmatically changes the route.                         |
| `html` | Write UI using Tagged-Template-Literal alternate to `h`  |

## Test

```sh
bun test
```

## Build

```sh
bun run build
```

## Support

Please open [an issue](https://github.com/n2geoff/mite/issues/new) for support.

## Contributing

Anyone is welcome to contribute, however, if you decide to get involved, please take a moment to review the [guidelines](CONTRIBUTING.md), they're minimalistic;)

## LICENSE

- [MIT](LICENSE)
