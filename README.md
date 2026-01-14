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

- **Minimalist Core**: ~3KB minified.
- **Hyperscript Syntax**: Fast, readable component building.
- **Reactive State**: Built-in global signal with a simple `.update()` API.
- **Smart Patching VDOM**: Key-aware diffing and robust Fragment support.
- **Parametric Hash Router**: Support for dynamic routes (e.g., `/user/:id`).
- **Build Variation**: From core-to-full featured your choice.


## Getting Started

Just import `Mite JS` in your project

```js
import { h, mount } from './mite.min.js';
```
You REALLY only need TWO functions

*That seriously reduces congnitive load!*

### Pick You Flavor

Depending on your needs, there are a few variations, see below

| Build                            | Size* | Features                                 |
| -------------------------------- | ----- | ---------------------------------------- |
| [Core](/dist/mite.min.js)        | ~3KB  | minimal `h`, `mount`, `signal`           |
| [Full](/dist/mite.full.min.js)   | ~4KB  | adds [http]() and [dom($)]() utilities   |


> \* Minified Size, `gzip` is event SMALLER!


## Usage Examples

### 1. The Classic Counter

The simplest way to see reactivity in action using `mount`.

```js
import { h, mount } from '../dist/mite.min.js';

const Counter = ({state, update}) =>  {
    return h('div', { class: 'container' }, [
        h('h2', {}, `Count: ${state.count}`),
        h('div', { class: 'grid' }, [
            h('button', { onclick: () => update({ count: state.count + 1 }) }, '+1'),
            h('button', {
                class: 'secondary',
                onclick: () => update({ count: state.count - 1 })
            }, '-1')
        ])
    ]);
}

mount('#app', Counter, state: { count: 0 });
```

### 2. Todo List (Keys & Forms)

This example demonstrates list rendering with `key` for performance and how to handle form inputs.

```js
import { h, mount } from '../dist/mite.min.js';

const TodoApp = ({state, update}) => {
    const addTodo = (e) => {
        e.preventDefault();
        const input = e.target.querySelector('input');
        if (!input.value) return;

        update({
            todos: [...state.todos, { id: Date.now(), text: input.value }]
        });
        input.value = '';
    };

    return h('article', [
        h('header', [h('h3', {}, 'My Tasks')]),
        h('form', { onsubmit: addTodo }, [
            h('fieldset', { class: 'grid' }, [
                h('input', { placeholder: 'What needs doing?' }),
                h('button', { type: 'submit' }, 'Add')
            ])
        ]),
        h('ul', [
            state.todos.map(todo => h('li', { key: todo.id }, todo.text))
        ])
    ]);
};

mount('#app', TodoApp, state: { todos: [] });
```

### 3. SPA Router (Master/Detail)

Mite shines when building multi-page interfaces. The `route` passes `params` (like `:id`) directly to your views

```js
import { h, mount } from '../dist/mite.min.js';

// Master View
const Home = ({state}) => h('div', [
    h('h1', 'Project Dashboard'),
    h('ul', [
        state.projects.map(p => h('li', [
            h('a', { href: `#/project/${p.id}` }, `View ${p.name}`)
        ]))
    ])
]);

// Detail View
const Detail = ({state, update, params}) => {
    const project = state.projects.find(p => p.id == params.id);

    return h('article', [
        h('header', {}, h('h2', {}, project?.name || 'Not Found')),
        h('p', {}, 'Detailed project metrics would go here.'),
        h('footer', [h('a', { href: '#/' }, '← Back Home')])
    ]);
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

mount('#app', null, state, {routes});
```

## Why Hyperscript

It provides the smallest foot-print, requires no build step, still quite readable.


## API Reference

| **Function** | **Description**           |
| -------------| ------------------        |
| `h(tag, props, ...children)`             | Hyperscript style UI component. Returns DOM. |
| `mount(selector, view, state = {}, opts = {})` | Mounts component to DOM. Returns a signal.   |
| `signal(initial, log = false)`    | Creates reactive signal store                       |

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

## Notes

Currently dogfooding [Mite.js](src/mite.js) against various apps, small and big and adjusting to what feels right for all scenarios. 

Official `v1.0.0` release coming soon!
