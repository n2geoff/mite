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

#### Raw HTML

Rendering raw `html` can be achived with the property key of `html`, and the value of the html you would like to render.  Treat as UNSAFE, only VERY basic sanitation provided

```js
h("p", {html: "I'm your <strong>Huckleberry</strong>"})
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

## Dom & Forms

`$()` provides a 

### Submit a Form

```js
export const SettingsPage = ({ update }) => {

    function onsubmit(e) {
        e.preventDefault();

        const form = $("#settings");

        const data = form.data();

        // localStorage helper
        local.set("money-simple", data);

        alert("Settings Saved");
    }

    const config = JSON.parse(localStorage.getItem("money-simple" || {}));

    return h("div", [
        h("article", [
            h("form", {id: "settings", onsubmit}, [
                h("h3", "Settings"),
                h("div", [
                    h("label", {for: "account"}, "Account Name or Title"),
                    h("input", {name: "account", value: config?.account, placeholder: "My Finances"})
                ]),
                h("div", [
                    h("label", {for: "budget"}, "Monthly Budget"),
                    h("input", {name: "budget", value: config?.budget, placeholder: "1000"})
                ]),
                h("br"),
                h("p", [
                    h("input", {type: "submit", value: "Save"})
                ])
            ])
        ]),
        DoUpdateStuff({update})
    ])

};
```


## Components & Pages

Are just exported functions that get passed a `ctx` object and return `h()`
