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

import * as React from 'react';
import { injectIntl, IntlProvider } from '../../../index';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

const mountWithProvider = (el: JSX.Element) => render(<IntlProvider locale="en">{el}</IntlProvider>);

describe('InjectIntl', () => {
  let Wrapped;

  beforeEach(() => {
    Wrapped = ({ i18n }: { i18n }) => <div data-testid="test">{JSON.stringify(i18n)}</div>;
    Wrapped.someStatic = {
      type: true,
    };
  });

  it('allows introspection access to the wrapped component', () => {
    expect((injectIntl(Wrapped) as any).WrappedComponent).toBe(Wrapped);
  });

  it(' should copy statics', () => {
    expect((injectIntl(Wrapped) as any).someStatic.type).toBe(true);
  });

  it('throws when InjectI18n is missing from ancestry', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const Injected = injectIntl(Wrapped);

    expect(() => render(<Injected />)).toThrow("Cannot read properties of null (reading 'i18n')");
  });

  it('should contain all props in WrappedComponent when use InjectI18n', () => {
    const Injected = injectIntl(Wrapped) as any;
    const props = {
      foo: 'bar',
    };

    const { getByTestId } = mountWithProvider(<Injected {...props} />);
    expect(JSON.stringify(getByTestId('test'))).toEqual(
      '{"_events":{},"locale":"en","locales":["en"],"allMessages":{},"_localeData":{}}'
    );
  });
});
