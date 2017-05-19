# alt-reform [![Code Climate](https://codeclimate.com/github/snags88/alt-reform/badges/gpa.svg)](https://codeclimate.com/github/snags88/alt-reform) [![Build Status](https://travis-ci.org/snags88/alt-reform.svg?branch=master)](https://travis-ci.org/snags88/alt-reform)
`alt-reform` is a form building helper for the flux implementation of [Alt.js](http://alt.js.org/). Forms built with `alt-reform` is backed by Alt stores and uses the Alt dispatcher to dispatch events.

## Introduction
### Why was `alt-reform` created?
Our engineering team at the [Flatiron School](flatironschool.com) was building a lot of forms in React and there are many ways to accomplish that. I created `alt-reform` to address 2 issues:

1. Provide a more opinionated framework for building forms using Alt + React.
2. Spin up our engineers much more quickly by abstracting away the boilerplate setup for building forms with Alt + React.

When I looked at flux implementations like _Redux_, they had their own library called [Redux Form](http://redux-form.com/6.5.0/) for building forms. Hence, I decided to build a similar library that allows developers to build forms quickly with the basic functionality you would expect from web forms.

> Note: this is different than the [`alt-form`](https://github.com/altjs/form) library implemented by the creator of Alt.js. That library is no longer maintained and `alt-reform` is a more updated version of working with forms using an Alt Store to track the form state.

### How do I use Alt Reform?
`alt-reform`constructs forms using 3 different parts:

1. **Form object**: a javascript object that is used to configure logic underlying the form such as validations, initial values, submission behavior, etc. This object uses an Alt Store in the implementation to store the state of the form. The creation of this object is provided by the library. See example for more details.
2. **Form component**: a React component that represents the UI of the form such as how each input field should look, how field errors should be displayed, etc. This is just a React component so the library does not provide any components you must use. 
3. **Form connector**: a high order React component that connects the Form Object and the Form Component. It will take attributes of the Form Object and pass them in as props to the Form Component.

#### Example
This is a basic example of using `alt-reform` using ES6 syntax. Although we have a validation, we are not handling the error on the component:

```js
// Import required libraries
import React from 'react';
import {render} from 'react-dom';
import Alt from 'alt';

import AltReform, {FormConnector} from 'alt-reform'; // Import the Form object creator and the connector

// Create a new Alt dispatcher
const alt = new Alt

// Create the Form Object giving the form a name, the dispatcher, and options
const ExampleFormObj = AltReform('Example Form', alt, {
  fields: {
    name: (value) { if(!value.length) {throw Error('Required field.')} } // field name and validation function
  },
  initialState: {
    name: 'Seiji' // starting state of the form field (if needed)
  },
  onSubmit(state): {
    console.log(`The value of "name" is ${state.name}`); // On submit callback function
  }
});

// Create form component to render the input field.
const FormComponent = (fields, submit) {
  return (
    <form onSubmit={submit}>
      <input {...fields.name} type='text' placeholder='Enter name...'/>
    </form>
  );
}

// Use the FormConnector and render onto the dom (assuming there is a `root` dom element)
document.addEventListener("DOMContentLoaded", function () {
  const WrappedForm = FormConnector(ExampleFormObj)(FormComponent);
  render(<WrappedForm/>, document.getElementById('root'));
});
```

## API
### Form Object
The Form Object creator function is the default import from the `alt-reform` library. It is a function that will return a Form Object when passed the proper arguments.

#### `AltReform(namespace, dispatcher, options)`
- _namespace_ (string, REQUIRED): The namespace for the particular form. This will be used when dispatching events so that different form stores do not get updated unintentionally.
- _dispatcher_ (Alt instance, REQUIRED): The Alt instance that will be used as the dispatcher for the form store. If a single global Alt instance is used, passed that in as the dispatcher. If this is an isolated form, then you may choose to instantiate a new instance of Alt and pass that in as the dispatcher.
- _options_ (object, REQUIRED): The options object will configure the logic and behavior of the form. There are specific keys to be used to configure the options as listed below.
  - `fields` (object, REQUIRED): The _fields_ object should contain the field names as the keys and a validation function as the value. **Any field that is on the form must be added as a key on this object.** If validation is not required, then pass in an no-op function (i.e. `() => {}`). If validation is required, throw an `Error` if validation fails with the error message. _Note that the argument of the validation function will be the current value of the field_.
  ```js
  fields: {
    validationField: (value) => {
      if(value.length < 1) { throw Error('Required field.') }
    },
    noValidationField: () => {}
  }
  ```
  - `initialState` (object, optional): The _initialState_ object should contain the field name as key and the initial value of the field as the value. The initial state is optional __unless__ you are using a multi-select list or a multi-checkbox input field. Since the values of those fields will be an array containing the currently selected values, it must be instantiated with an empty array or an array containing the initially selected values.
  ```js
  initialState: {
    myFormField: 'initial value',
    myMultiCheckbox: ['firstOption']
  }
  ```
  - `normalizers` (object, optional): The _normalizers_ object are functions that will normalize the form values to a format. For instance, if you have a phone number field, you could define a normalizer function to strip any non-numerical characters before submission.
  ```js
  normalizers: {
    myPhoneField: (value) => {
      return String(value).replace(/\D/g, '');
    }
  }
  ```
  - `onSubmit` (func(formState), optional): The _onSubmit_ function is a callback that will be run after `submit` is called on the form object and all normalizers and validation have run successfully. If validation fails or `submit` encounters an error, this function will not run. This is where you will receive the form's current state as the argument and can make a request to the server if needed.
  ```js
  onSubmit(state) => {
    return post(`/form`, {data: state});
  }
  ```
  - `onSubmitSuccess` (func(response), optional): The _onSubmitSuccess_ function is a callback that will be run after the `onSubmit` function is run successfully. If the `onSubmit` function does not return a promise, then this callback will never run.
  ```js
  onSubmitSuccess(response) => {
    // You could trigger an action here to change the state of the application
    return response;
  }
  ```
  - `onSubmitFail` (func(response), optional): The _onSubmitFail_ function is a callback that will be run after the `onSubmit` function runs and rejects the `onSubmit` promise. If `onSubmit` is not a promise, this callback will never run.
  ```js
  onSubmitFail(response) => {
    // You could not do anything here to have the user fix the issue
    return response;
  }
  ```

#### Form instance properties:
After the From Object has been instantiated, it has the following public properties:
- `store`: returns the Alt Store that contains the form states.
- `submit`: returns the function that when called, will `normalize`, `validate`, and call any configured callback such as `onSubmit`, `onSubmitSuccess`, and `onSubmitFail`.
- `cancel`: returns the function to dispatch the current state to the form store.
- `validate`: returns the function to trigger validation on all fields.
- `normalize`: return the function to trigger normalization on all fields.
- `change`: returns the function to directly set the state that is provided as the argument.
- `fields`: returns the function, when invoked, will return a fields object that has all of the fields as keys and an object containing the current value and callback functions.

It's very rare that you will need to access the form instance properties directly as they will be made available to you as props in the Form Component in a more digestable manner with the `FormConnector`.

### Form Component
The Form Component should be built using React Components. The `alt-reform` library does not provide any special components that need to be used to create the form UI. However, with the usage of the Form Connector, your Form Component will have access to special props that should be used on your components.

With the `FormConnector` high order component, your Form Component will have access to the following props:
- `submit`, `cancel`, `validate`, `normalize`, `change` are instance properties from the Form Object. See the section on [Form Object](#form-instance-properties) for details on each of these functions.
- `fields` (obj): An object that contains all of the configured fields and their current values. This should be used to create controlled inputs on the form.
- `errors` (obj): An object that contains any fields that failed validation and the corresponding error message. This should be used to display errors on the form.
- `touched` (array): An array that contains the field names of inputs that have been touched by the user.
- `loading` (boolean): A boolean that reflects the submission state of the form. On submit this will be set to true. Upon any resolution (cancel, success, fail) this state will be set to false again.

Any additional props passed into the wrapped form component will be available in the form component.

### Form Connector
`FormConnector` is a high order component that connects an `alt-reform` object with a React Component. It uses the currying pattern to eventually return a react component that will render the original component. It is a named export in the `alt-reform` library and can be imported with:

```js
import { FormConnector } from 'alt-reform';
```

This high order component has 2 functions:
1. The wrapper component will listen to changes on the form store and update its internal state accordingly.
2. It injects the form object as props to the original component (with some modifications to the form object attributes). 

#### `FormConnector(altReformObject)(formComponent)`
Returns a React Component that can be rendered in your app.

> Note that this should only be used to connect your `alt-reform` object to a React component that will act as the form. 

## Advanced Usages
### What if I need to listen to a form action from another store?
Since the form actions are dispatched from the provided Alt instance, you can listen to the form action by binding a listener in the following format: "_FormNamespace_/_actionName_".

Action names are as follows: `saved`, `canceled`, `changed`, `validationStarted`, `validationFailed`, `focused`, `blurred`, `normalized`, `submitSuccess`, `submitFailed`.

Example:
```js
const Form = AltReform('ExampleForm', {
  // options here
})

// Some store that needs to listen to a change on the form
class ExampleStore {
  constructor() {
    this.bindListeners({
      onExampleFormChanged: 'ExampleForm/changed'
    })
  },
  
  onExampleFormChanged() {
    //do stuff here
  }
}
