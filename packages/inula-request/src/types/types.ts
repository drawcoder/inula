import IrHeaders from '../core/IrHeaders';
import { IrRequestConfig, IrResponse } from './interfaces';

export type Method =
  | 'get'
  | 'GET'
  | 'delete'
  | 'DELETE'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH';

export type ResponseType = 'text' | 'json' | 'blob' | 'arraybuffer';

// 请求和响应数据转换器
export type IrTransformer = (data: any, headers?: IrHeaders) => any;

// Headers
export type HeaderMap = Record<string, string | string[]>;
export type HeaderMatcher = boolean | RegExp | Function;

// Promise 成功和拒绝类型
export type FulfilledFn<T> = (value: T) => T | Promise<T>; // 泛型确保了拦截器链中各个环节之间的一致性，避免数据类型不匹配引发的错误
export type RejectedFn = (error: any) => any;

// 过滤器
export type FilterFunc = (obj: Record<string, any>, destObj: Record<string, any>) => boolean;
export type PropFilterFunc = (prop: string | symbol, obj: Record<string, any>, destObj: Record<string, any>) => boolean;

export type ObjectDescriptor = PropertyDescriptorMap & ThisType<any>;

// Cancel
export type CancelFunction = (message?: string) => void;
export type CancelExecutor = (cancel: CancelFunction) => void;

export type Callback<T> = (...args: any[]) => T;

export type Strategy = {
  (data: any, headers: IrHeaders, ...args: any[]): any;
};
