/*
 * FormConnector:
 *
 * FormConnector is a high order component that connects an AltForm object
 * with a React Component. It uses the currying pattern to eventually return
 * a react component that will render the original component. This high order
 * component has 2 functions:
 *
 * 1. The wrapper component will listen to changes on the form store and update its
 *    internal state accordingly.
 * 2. It injects the form object as props to the original component (with some modifications
 *    to the form object attributes). Injected props are as follows:
 *      store (AltStore), save (func), cancel (func), validate (func), normalize(func),
 *      change (func(k,v)), fields (obj), errors (obj), touched (arr)
 *
 * Note that this should only be used to connect our AltForm object found in `lib/AltForm.js`
 * to a React component that will act as the form.
 *
 */

import React from 'react'

const FormConnector = form => Component => {
  return React.createClass({
    // set the form store's state as wrapper component state
    getInitialState() { return form.store.getState(); },
    // un/listen to emitted changes on store to update component state
    componentDidMount() {
      this.unlisten = form.store.listen(state => {
        this.setState(state)
        this.forceUpdate()
      })
    },
    componentWillUnmount() { this.unlisten() },

    render() {
      let { fields, ..._form } = form;

      return <Component
          {..._form}
          fields={fields()}
          errors={this.state.errors}
          touched={this.state.touched}
          loading={this.state.loading}
          {...this.props}
        />
    }
  })
}

export default FormConnector;

