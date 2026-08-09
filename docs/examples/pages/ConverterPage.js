import {h} from "../../../src/mite.js";
import { htmlToH, htmlToH2 } from "../components/converter.js";

export function ConverterPage({ state, update }) {

    const convert = () => {
        const input = document.getElementById("input").value || "";
        const output = document.getElementById("output");

        output.textContent = htmlToH(input);
    }

    function reset() {
        document.getElementById("input").value = "";
        const output = document.getElementById("output");

        output.textContent = "";
    }

    return h("article", [
        h("h1","HTML Converter"),
        h("p", [
            h("em", "Take html and convert it into valid h syntax"),
        ]),
        h("textarea", {id: "input", placeholder: "Paste HTML Here...", rows: 10}),
        h("div", {class: "grid"}, [
            h("button", {onclick: convert}, "Convert"),
            h("button", {onclick: reset}, "Reset"),
        ]),
        h("pre", {id: "output"})
    ]);
}

export const ConverterView = (state,update) => {

    const handleConvert = () => {
        const input = document.getElementById('html-input').value;
        const result = htmlToH2(input);
        update({ convertedCode: result });
    };

    const copyToClipboard = () => {
        const code = state.convertedCode;
        if (!code) return;

        navigator.clipboard.writeText(code).then(() => {
            alert("Copied to clipboard!");
        }).catch(err => {
            console.error('Failed to copy: ',err);
        });
    };

    return h('div',{ class: 'container' },[
        h('article',{},[
            h('header',{},[h('h3',{},'HTML to h() Transpiler')]),

            h('label',{ for: 'html-input' },'Paste your HTML here:'),
            h('textarea',{
                id: 'html-input',
                rows: '10',
                placeholder: '<table>\n  <thead>...'
            },[]),

            h('footer',{ class: 'grid' },[
                h('button',{ onclick: handleConvert },'Generate h() Syntax'),
                h('button',{
                    class: 'secondary',
                    onclick: copyToClipboard,
                    disabled: !state.convertedCode
                },'Copy to Clipboard')
            ])
        ]),

        // Preview Output
        state.convertedCode ? h('article',{},[
            h('pre',{ style: 'font-size: 0.8rem; overflow-x: auto;' },[
                h('code',{},state.convertedCode)
            ])
        ]) : null
    ]);
};


export const TranspilerTool = ({ state, update }) => {

    const handleConvert = () => {
        const input = document.getElementById('html-input').value;
        const code = htmlToH(input);
        update({
            rawHtml: input,
            convertedCode: code
        });
    };

    const handleReset = () => {
        update({ rawHtml: '',convertedCode: '' });
        document.getElementById('html-input').value = '';
    };

    const copyToClipboard = () => {
        if (!state.convertedCode) return;
        navigator.clipboard.writeText(state.convertedCode).then(() => {
            alert("Code copied!");
        });
    };

    // Prepare Live Preview VNode
    let previewContent = h('p',{ style: 'color: var(--pico-muted-color); text-align: center;' },'Renders will appear here after conversion.');

    if (state.convertedCode) {
        try {
            // Execute the string to get a real VNode object
            const generatedVNode = new Function('h',`return ${state.convertedCode}`)(h);
            previewContent = generatedVNode;
        } catch (e) {
            previewContent = h('p',{ style: 'color: var(--pico-error-color)' },'Execution Error: Check for unclosed tags or invalid HTML.');
        }
    }

    return h('div', { class: 'grid' }, [
        h('div', {}, [
            h('article', {}, [
                h('header', {}, [h('strong', {}, 'HTML Source')]),
                h('textarea', {
                    id: 'html-input',
                    placeholder: '<section>...</section>',
                    rows: '10',
                    style: 'font-family: monospace;'
                }, []),
                h('footer', {}, [
                    h('div', { role: 'group' }, [
                        h('button', { onclick: handleConvert }, 'Convert'),
                        h('button', { class: 'secondary', onclick: copyToClipboard, disabled: !state.convertedCode }, 'Copy'),
                        h('button', { class: 'outline contrast', onclick: handleReset }, 'Reset')
                    ])
                ])
            ]),

            state.convertedCode ? h('article', {}, [
                h('header', {}, [h('strong', {}, 'Mite.js Syntax')]),
                h('pre', { style: 'font-size: 0.75rem; background: #1e2227;' }, [
                    h('code', {}, state.convertedCode)
                ])
            ]) : null
        ]),

        // Right Column: Live Render
        h('div', {}, [
            h('article', { style: 'min-height: 500px;' }, [
                h('header', {}, [h('strong', {}, 'Live Visual Preview')]),
                // This is the fix: previewContent is now a direct child.
                // Mite.js will patch this div whenever handleConvert updates state.
                h('div', { id: 'preview-sandbox' }, [
                    previewContent
                ])
            ])
        ])
    ]);
};
