/**
 * vNode结构的变化标志
 */
import type { VNode } from './VNode';
export declare const InitFlag = /**     */ 0;
export declare const DirectAddition: number;
export declare const Addition: number;
export declare const Update: number;
export declare const Deletion: number;
export declare const ResetText: number;
export declare const Callback: number;
export declare const DidCapture: number;
export declare const Ref: number;
export declare const Snapshot: number;
export declare const Interrupted: number;
export declare const ShouldCapture: number;
export declare const ForceUpdate: number;
export declare const Clear: number;
export declare class FlagUtils {
    static removeFlag(node: VNode, flag: number): void;
    static removeLifecycleEffectFlags(node: any): void;
    static hasAnyFlag(node: VNode): boolean;
    static setNoFlags(node: VNode): void;
    static markAddition(node: VNode): void;
    static setAddition(node: VNode): void;
    static markDirectAddition(node: VNode): void;
    static markUpdate(node: VNode): void;
    static setDeletion(node: VNode): void;
    static markContentReset(node: VNode): void;
    static markCallback(node: VNode): void;
    static markDidCapture(node: VNode): void;
    static markShouldCapture(node: VNode): void;
    static markRef(node: VNode): void;
    static markSnapshot(node: VNode): void;
    static markInterrupted(node: VNode): void;
    static markForceUpdate(node: VNode): void;
    static markClear(node: VNode): void;
}
