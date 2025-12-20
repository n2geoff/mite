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

export type UpdateFn<S> = (next: Partial<S>) => void;
export type ViewFn<S> = (state: S, update: UpdateFn<S>, params?: Record<string, string>) => VNode;

export interface Store<S> {
    getState: () => S;
    update: UpdateFn<S>;
    subscribe: (fn: (state: S) => void) => number;
}

/** Creates a virtual node (VNode) is overloaded function */
export function h(tag: string,props: Record<string, any> | null,...children: any[]): VNode;
export function h(tag: string,...children: any[]): VNode;
export function h(tag: string): VNode;

/** Parses a tagged template literal into a VNode tree */
export function html(strings: TemplateStringsArray, ...values: any[]): VNode;

/** Synchronizes DOM attributes, styles, and event listeners */
export function patchProps(el: HTMLElement, newProps: object, oldProps?: object): void;

/** Transforms a VNode into a real DOM element or Text node */
export function createElement(vnode: VNodeChild, ns?: string): Node;

/** The core reconciliation engine. Diffs two VNodes and patches the real DOM */
export function patch(parent: HTMLElement | DocumentFragment, newNode: VNodeChild, oldNode?: VNodeChild, index?: number): void;

/** Creates a reactive state container */
export function store<S>(initState: S, logger?: boolean): Store<S>;

/** Mounts a reactive view to a DOM selector */
export function mount<S>(selector: string, view: ViewFn<S>, state?: S | Store<S>): Store<S>;

/** Initializes a parametric hash-based router */
export function route<S>(selector: string, routes: Record<string, ViewFn<S>>, state?: S | Store<S>): Store<S>;

/** Updates browser's hash location for navigation */
export function navigate(path: string): void;

/** A functional component for router-supported navigation links */
export function Link(props: { href: string; class?: string;[key: string]: any }, ...children: VNodeChild[]): VNode;