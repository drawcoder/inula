/// <reference types="chai" />
/// <reference types="chai-subset" />
import { HorizonSelect, Props } from '../utils/Interface';
export declare function getSelectPropsWithoutValue(dom: HorizonSelect, properties: Object): {
    value: any;
    constructor: Function;
    toString(): string;
    toLocaleString(): string;
    valueOf(): Object;
    hasOwnProperty(v: PropertyKey): boolean;
    isPrototypeOf(v: Object): boolean;
    propertyIsEnumerable(v: PropertyKey): boolean;
    should: Chai.Assertion;
};
export declare function updateSelectValue(dom: HorizonSelect, props: Props, isInit?: boolean): void;
