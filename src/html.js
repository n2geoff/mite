import {h} from "./mite.js";

/**
 * Parses a tagged template literal into a VNode tree.
 * Supports event binding, keyed lists, and style objects.
 *
 * @param {TemplateStringsArray} strings - The static parts of the template.
 * @param {...any} values - The dynamic expressions in the template.
 * @returns {Object} A single VNode or a fragment.
 */
export const html = (strings,...values) => {
    const raw = strings.reduce((acc,str,i) => {
        const val = values[i];
        // We MUST use a string marker for the browser's innerHTML to work
        const mark = (val != null && (typeof val === 'object' || typeof val === 'function'))
            ? `__HV_${i}__`
            : (val ?? "");
        return acc + str + mark;
    },"");

    const tmpl = document.createElement('template');
    tmpl.innerHTML = raw.trim();

    const walk = (node) => {
        // text logic
        if (node.nodeType === 3) {
            const txt = node.textContent;

            // kill whitespace
            if (!txt.trim()) return null;

            const parts = txt.split(/(__HV_\d+__)/g)
                .filter(Boolean)
                .map(part => {
                    const match = part.match(/__HV_(\d+)__/);
                    return match ? values[parseInt(match[1])] : part;
                });

            // returns single value or array
            return parts.length === 1 ? parts[0] : parts;
        }

        // element logic
        if (node.nodeType === 1) {
            const props = {};
            for (let attr of node.attributes) {
                const match = attr.value.match(/__HV_(\d+)__/);
                props[attr.name === 'class' ? 'class' : attr.name] = match
                    ? values[match[1]]
                    : attr.value;
            }

            // strip out empty/whitespace
            const children = Array.from(node.childNodes)
                .map(walk)
                .filter(c => c && (typeof c !== 'string' || c.trim()));

            return h(node.tagName.toLowerCase(),props,...children);
        }
    };

    const frag = tmpl.content;
    return frag.childNodes.length === 1
        ? walk(frag.firstChild)
        : h('fragment',null,...Array.from(frag.childNodes).map(walk));
};
