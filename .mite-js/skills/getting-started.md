# MiteJS Getting Started



## Single-Page-Apps

This pattern is for smaller prototypes or tiny apps

### Structure

just a single `index.html` file

### Entry Code Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MiteJS App</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
</head>
<body>
    <div id="app"></div>
    <script type="module">
        import {h, signal, mount, $} from "./mite.full.js";

        const Counter = ({state, update}) =>  {
            return h('div', { class: 'container' }, [
                h('h2', {}, `Count: ${state.count}`),
                h('div', { }, [
                    h('button', { onclick: () => update({ count: state.count + 1 }) }, '+1'),
                    h('button', {
                        class: 'secondary',
                        onclick: () => update({ count: state.count - 1 })
                    }, '-1')
                ])
            ]);
        }

        mount('#app', Counter, { count: 0 });
    </script>
</body>
</html>

```

## Multi-Page-Apps

For larger apps that grow beyond

### Structure

```
src/
    assets/
        js/
            app.js
        css/
            styles.css
        images/
        vendor/
    views/
        components/
        pages/
    index.html
```
