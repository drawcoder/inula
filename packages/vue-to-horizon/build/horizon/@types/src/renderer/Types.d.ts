export { VNode } from './vnode/VNode';
declare type Trigger<A> = (A: any) => void;
export declare type UseStateHookType = {
    useState<S>(initialState: (() => S) | S): [S, Trigger<((S: any) => S) | S>];
};
export declare type UseReducerHookType = {
    useReducer<S, P, A>(reducer: (S: any, A: any) => S, initArg: P, init?: (P: any) => S): [S, Trigger<A>];
};
export declare type UseContextHookType = {
    useContext<T>(context: ContextType<T>): T;
};
export declare type JSXElement = {
    vtype: any;
    src: any;
    type: any;
    key: any;
    ref: any;
    props: any;
    belongClassVNode: any;
};
export declare type ProviderType<T> = {
    vtype: number;
    _context: ContextType<T>;
};
export declare type ContextType<T> = {
    vtype: number;
    Consumer: ContextType<T> | null;
    Provider: ProviderType<T> | null;
    value: T;
};
export declare type PortalType = {
    vtype: number;
    key: null | string;
    realNode: any;
    children: any;
};
export declare type RefType = {
    current: any;
};
export interface PromiseType<R> {
    then<U>(onFulfill: (value: R) => void | PromiseType<U> | U, onReject: (error: any) => void | PromiseType<U> | U): void | PromiseType<U>;
}
export interface SuspenseState {
    promiseSet: Set<PromiseType<any>> | null;
    childStatus: string;
    oldChildStatus: string;
    didCapture: boolean;
    promiseResolved: boolean;
}
export declare type Source = {
    fileName: string;
    lineNumber: number;
};
export declare type Callback = () => void;
