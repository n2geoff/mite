/**
 * A functional component for router-supported navigation links.
 * Automatically manages active classes based on the current hash.
 *
 * @param {Object} props - Properties including 'href' and 'class'.
 * @param {...any} children - Link content.
 * @returns {Object} An 'a' tag VNode.
 */
export const Link = (props,...children) => {
    const { href,...rest } = props;
    const currentPath = window.location.hash.slice(1) || '/';
    const targetPath = href.startsWith('#') ? href.slice(1) : href;
    const isActive = currentPath === targetPath;

    return h('a',{
        ...rest,
        href: `#${targetPath}`,
        class: `${props.class || ''} ${isActive ? 'active' : ''}`.trim()
    },...children);
};