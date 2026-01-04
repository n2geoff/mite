/**
 * Mite.js Type Definitions
 */

export type VNodeChild = any; // Permissive for testing

export interface VNode {
    tag: string;
    props: Record<string, any>;
    children: any[]; // Allows access to .tag on children without guards
    // This allows the object to be treated like a dictionary
    [key: string]: any;
}

/**
 * The Context object passed to every view function.
 */
export interface MiteContext<S> {
    state: S;
    update: (next: Partial<S>) => void;
    params: Record<string, string>;
    content: VNode | null;
}

export interface MountOptions<S> {
    view?: ViewFn<S>;
    routes?: Record<string, ViewFn<S>>;
    state?: S | Signal<S>;
}

export type UpdateFn<S> = (next: Partial<S>) => void;
export type ViewFn<S> = (ctx: MiteContext<S>) => VNode;

export interface Signal<S> {
    getState: () => S;
    update: UpdateFn<S>;
    subscribe: (fn: (state: S) => void) => number;
}

/** Creates a virtual node (VNode) is overloaded function */
export function h(tag: string,props: Record<string, any> | null,...children: any[]): VNode;
export function h(tag: string,...children: any[]): VNode;
export function h(tag: string): VNode;

/** Synchronizes DOM attributes, styles, and event listeners */
export function patchProps(el: HTMLElement, newProps: object, oldProps?: object): void;

/** Transforms a VNode into a real DOM element or Text node */
export function createElement(vnode: VNodeChild, ns?: string): Node;

/** The core reconciliation engine. Diffs two VNodes and patches the real DOM */
export function patch(parent: HTMLElement | DocumentFragment, newNode: VNodeChild, oldNode?: VNodeChild, index?: number): void;

/** Creates a reactive state container */
export function signal<S>(initState: S, logger?: boolean): Signal<S>;

/** Mounts a reactive view to a DOM selector */
export function mount<S>(selector: string, options: MountOptions<S>): Signal<S>;
