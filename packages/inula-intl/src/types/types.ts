/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import {
  Content,
  MissingMessageEvent,
  Octothorpe,
  PlainArg,
  Select,
  FunctionArg,
  I18nContextProps,
  configProps,
  InjectedIntl,
  InulaPortal,
} from './interfaces';
import { InulaElement } from 'openinula';

export type Error = string | ((message: any, id: any, context: any) => string);

export type Locale = string;

export type Locales = Locale | Locale[];

export type LocaleConfig = { plurals?: (...args: any[]) => any };

export type AllLocaleConfig = Record<Locale, LocaleConfig>;

type CompiledMessagePart = string | Array<string | Array<string | (string | undefined)> | Record<string, unknown>>;

export type CompiledMessage = string | CompiledMessagePart[];

export type Messages = Record<string, string> | Record<string, CompiledMessage>;

export type AllMessages = Record<string, string> | Record<Locale, Messages>;

export type EventCallback = (...args: any[]) => any;

// 资源事件
export type Events = {
  change: () => void;
  missing: (event: MissingMessageEvent) => void;
};

// 默认复数规则
export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

export type Token = Content | PlainArg | FunctionArg | Select | Octothorpe;

export type DatePool = Date | string;

export type SelectPool = string | number;

export type RawToken = {
  type: string;
  value: string;
  text: string;
  toString: () => string;
  offset: number;
  lineBreaks: number;
  line: number;
  col: number;
};

export type I18nProviderProps = I18nContextProps & configProps;

export type IntlType = I18nContextProps & {
  defaultLocale?: string | undefined;
  onError?: Error | undefined;
  messages?:
    | string
    | Record<string, string>
    | Record<string, string | CompiledMessagePart[]>
    | Record<string, Record<string, string> | Record<string, string | CompiledMessagePart[]>>;
  locale?: string;
  formatMessage: (...args: any[]) => any;
  formatNumber: (...args: any[]) => any;
  formatDate: (...args: any[]) => any;
  $t?: (...args: any[]) => any;
};

export type InjectedIntlProps = {
  intl: InjectedIntl;
};

export type InulaNode = InulaElement | string | number | Iterable<InulaNode> | InulaPortal | boolean | null | undefined;
