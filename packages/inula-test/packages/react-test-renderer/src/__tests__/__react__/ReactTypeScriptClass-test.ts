/// <reference path="./testDefinitions/PropTypes.d.ts" />
/// <reference path="./testDefinitions/React.d.ts" />
/// <reference path="./testDefinitions/ReactDOM.d.ts" />

/*!
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// import React = require('horizon-external');
// import ReactDOM = require('horizon');
// import PropTypes = require('prop-types');
import * as React from 'horizon-external';
import * as ReactDOM from 'horizon';
import * as PropTypes from 'prop-types';

// Before Each

let container;
let attachedListener = null;
let renderedName = null;

class Inner extends React.Component {
  getName() {
    return this.props.name;
  }
  render() {
    attachedListener = this.props.onClick;
    renderedName = this.props.name;
    return React.createElement('div', {className: this.props.name});
  }
}

function test(element, expectedTag, expectedClassName) {
  const instance = ReactDOM.render(element, container);
  expect(container.firstChild).not.toBeNull();
  expect(container.firstChild.tagName).toBe(expectedTag);
  expect(container.firstChild.className).toBe(expectedClassName);
  return instance;
}

// Classes need to be declared at the top level scope, so we declare all the
// classes that will be used by the tests below, instead of inlining them.
// TODO: Consider redesigning this using modules so that we can use non-unique
// names of classes and bundle them with the test code.

// it preserves the name of the class for use in error messages
// it throws if no render function is defined
class Empty extends React.Component {}

// it renders a simple stateless component with prop
class SimpleStateless extends React.Component {
  props: any;
  render() {
    return React.createElement(Inner, {name: this.props.bar});
  }
}

// it renders based on state using initial values in this.props
class InitialState extends React.Component {
  state = {
    bar: this.props.initialValue,
  };
  render() {
    return React.createElement('span', {className: this.state.bar});
  }
}

// it renders based on state using props in the constructor
class StateBasedOnProps extends React.Component {
  constructor(props) {
    super(props);
    this.state = {bar: props.initialValue};
  }
  changeState() {
    this.setState({bar: 'bar'});
  }
  render() {
    if (this.state.bar === 'foo') {
      return React.createElement('div', {className: 'foo'});
    }
    return React.createElement('span', {className: this.state.bar});
  }
}

// it renders based on context in the constructor
class StateBasedOnContext extends React.Component {
  static contextTypes = {
    tag: PropTypes.string,
    className: PropTypes.string,
  };
  constructor(props, context) {
    super(props, context);
    this.state = {tag: context.tag, className: context.className};
  }
  render() {
    const Tag = this.state.tag;
    return React.createElement(Tag, {className: this.state.className});
  }
}

class ProvideChildContextTypes extends React.Component {
  static childContextTypes = {
    tag: PropTypes.string,
    className: PropTypes.string,
  };
  getChildContext() {
    return {tag: 'span', className: 'foo'};
  }
  render() {
    return React.createElement(StateBasedOnContext);
  }
}

// it renders only once when setting state in componentWillMount
let renderCount = 0;
class RenderOnce extends React.Component {
  state = {
    bar: this.props.initialValue,
  };
  UNSAFE_componentWillMount() {
    this.setState({bar: 'bar'});
  }
  render() {
    renderCount++;
    return React.createElement('span', {className: this.state.bar});
  }
}

// it should render with null in the initial state property
class NullState extends React.Component {
  state = null;
  render() {
    return React.createElement('span');
  }
}

// it setState through an event handler
class BoundEventHandler extends React.Component {
  state = {
    bar: this.props.initialValue,
  };
  handleClick = () => {
    this.setState({bar: 'bar'});
  };
  render() {
    return React.createElement(Inner, {
      name: this.state.bar,
      onClick: this.handleClick,
    });
  }
}

// it should not implicitly bind event handlers
class UnboundEventHandler extends React.Component {
  state = {
    bar: this.props.initialValue,
  };
  handleClick() {
    this.setState({bar: 'bar'});
  }
  render() {
    return React.createElement(Inner, {
      name: this.state.bar,
      onClick: this.handleClick,
    });
  }
}

// it renders using forceUpdate even when there is no state
class ForceUpdateWithNoState extends React.Component {
  mutativeValue: string = this.props.initialValue;
  handleClick() {
    this.mutativeValue = 'bar';
    this.forceUpdate();
  }
  render() {
    return React.createElement(Inner, {
      name: this.mutativeValue,
      onClick: this.handleClick.bind(this),
    });
  }
}

// it will call all the normal life cycle methods
let lifeCycles = [];
class NormalLifeCycles extends React.Component {
  props: any;
  state = {};
  UNSAFE_componentWillMount() {
    lifeCycles.push('will-mount');
  }
  componentDidMount() {
    lifeCycles.push('did-mount');
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    lifeCycles.push('receive-props', nextProps);
  }
  shouldComponentUpdate(nextProps, nextState) {
    lifeCycles.push('should-update', nextProps, nextState);
    return true;
  }
  UNSAFE_componentWillUpdate(nextProps, nextState) {
    lifeCycles.push('will-update', nextProps, nextState);
  }
  componentDidUpdate(prevProps, prevState) {
    lifeCycles.push('did-update', prevProps, prevState);
  }
  componentWillUnmount() {
    lifeCycles.push('will-unmount');
  }
  render() {
    return React.createElement('span', {className: this.props.value});
  }
}

// it supports this.context passed via getChildContext
class ReadContext extends React.Component {
  static contextTypes = {bar: PropTypes.string};
  render() {
    return React.createElement('div', {className: this.context.bar});
  }
}
class ProvideContext extends React.Component {
  static childContextTypes = {bar: PropTypes.string};
  getChildContext() {
    return {bar: 'bar-through-context'};
  }
  render() {
    return React.createElement(ReadContext);
  }
}

// it supports classic refs
class ClassicRefs extends React.Component {
  render() {
    return React.createElement(Inner, {name: 'foo', ref: 'inner'});
  }
}

// Describe the actual test cases.

describe('ReactTypeScriptClass', function() {
  beforeEach(function() {
    container = document.createElement('div');
    attachedListener = null;
    renderedName = null;
  });

  it('preserves the name of the class for use in error messages', function() {
    expect(Empty.name).toBe('Empty');
  });

  it('renders a simple stateless component with prop', function() {
    test(React.createElement(SimpleStateless, {bar: 'foo'}), 'DIV', 'foo');
    test(React.createElement(SimpleStateless, {bar: 'bar'}), 'DIV', 'bar');
  });

  it('renders based on state using initial values in this.props', function() {
    test(
      React.createElement(InitialState, {initialValue: 'foo'}),
      'SPAN',
      'foo'
    );
  });

  it('renders based on state using props in the constructor', function() {
    const instance = test(
      React.createElement(StateBasedOnProps, {initialValue: 'foo'}),
      'DIV',
      'foo'
    );
    instance.changeState();
    test(React.createElement(StateBasedOnProps), 'SPAN', 'bar');
  });

  it('sets initial state with value returned by static getDerivedStateFromProps', function() {
    class Foo extends React.Component {
      state = {
        foo: null,
        bar: null,
      };
      static getDerivedStateFromProps(nextProps, prevState) {
        return {
          foo: nextProps.foo,
          bar: 'bar',
        };
      }
      render() {
        return React.createElement('div', {
          className: `${this.state.foo} ${this.state.bar}`,
        });
      }
    }
    test(React.createElement(Foo, {foo: 'foo'}), 'DIV', 'foo bar');
  });

  it('updates initial state with values returned by static getDerivedStateFromProps', function() {
    class Foo extends React.Component {
      state = {
        foo: 'foo',
        bar: 'bar',
      };
      static getDerivedStateFromProps(nextProps, prevState) {
        return {
          foo: `not-${prevState.foo}`,
        };
      }
      render() {
        return React.createElement('div', {
          className: `${this.state.foo} ${this.state.bar}`,
        });
      }
    }
    test(React.createElement(Foo), 'DIV', 'not-foo bar');
  });

  it('renders updated state with values returned by static getDerivedStateFromProps', function() {
    class Foo extends React.Component {
      state = {
        value: 'initial',
      };
      static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.update) {
          return {
            value: 'updated',
          };
        }
        return null;
      }
      render() {
        return React.createElement('div', {className: this.state.value});
      }
    }
    test(React.createElement(Foo, {update: false}), 'DIV', 'initial');
    test(React.createElement(Foo, {update: true}), 'DIV', 'updated');
  });

  // @gate enableLegacyContext
  it('renders based on context in the constructor', function() {
    test(React.createElement(ProvideChildContextTypes), 'SPAN', 'foo');
  });

  it('renders only once when setting state in componentWillMount', function() {
    renderCount = 0;
    test(React.createElement(RenderOnce, {initialValue: 'foo'}), 'SPAN', 'bar');
    expect(renderCount).toBe(1);
  });

  it('should render with null in the initial state property', function() {
    test(React.createElement(NullState), 'SPAN', '');
  });

  it('setState through an event handler', function() {
    test(
      React.createElement(BoundEventHandler, {initialValue: 'foo'}),
      'DIV',
      'foo'
    );
    attachedListener();
    expect(renderedName).toBe('bar');
  });

  it('should not implicitly bind event handlers', function() {
    test(
      React.createElement(UnboundEventHandler, {initialValue: 'foo'}),
      'DIV',
      'foo'
    );
    expect(attachedListener).toThrow();
  });

  it('renders using forceUpdate even when there is no state', function() {
    test(
      React.createElement(ForceUpdateWithNoState, {initialValue: 'foo'}),
      'DIV',
      'foo'
    );
    attachedListener();
    expect(renderedName).toBe('bar');
  });

  it('will call all the normal life cycle methods', function() {
    lifeCycles = [];
    test(React.createElement(NormalLifeCycles, {value: 'foo'}), 'SPAN', 'foo');
    expect(lifeCycles).toEqual(['will-mount', 'did-mount']);
    lifeCycles = []; // reset
    test(React.createElement(NormalLifeCycles, {value: 'bar'}), 'SPAN', 'bar');
    expect(lifeCycles).toEqual([
      'receive-props',
      {value: 'bar'},
      'should-update',
      {value: 'bar'},
      {},
      'will-update',
      {value: 'bar'},
      {},
      'did-update',
      {value: 'foo'},
      {},
    ]);
    lifeCycles = []; // reset
    ReactDOM.unmountComponentAtNode(container);
    expect(lifeCycles).toEqual(['will-unmount']);
  });

  it(
    'does not warn about getInitialState() on class components ' +
      'if state is also defined.',
    () => {
      class Example extends React.Component {
        state = {};
        getInitialState() {
          return {};
        }
        render() {
          return React.createElement('span', {className: 'foo'});
        }
      }

      test(React.createElement(Example), 'SPAN', 'foo');
    }
  );

  // @gate enableLegacyContext
  it('supports this.context passed via getChildContext', function() {
    test(React.createElement(ProvideContext), 'DIV', 'bar-through-context');
  });

  it('supports classic refs', function() {
    const instance = test(React.createElement(ClassicRefs), 'DIV', 'foo');
    expect(instance.refs.inner.getName()).toBe('foo');
  });

  it('supports drilling through to the DOM using findDOMNode', function() {
    const instance = test(
      React.createElement(Inner, {name: 'foo'}),
      'DIV',
      'foo'
    );
    const node = ReactDOM.findDOMNode(instance);
    expect(node).toBe(container.firstChild);
  });
});
