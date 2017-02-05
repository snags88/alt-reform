# alt-reform [![Code Climate](https://codeclimate.com/github/snags88/alt-reform/badges/gpa.svg)](https://codeclimate.com/github/snags88/alt-reform) [![Build Status](https://travis-ci.org/snags88/alt-reform.svg?branch=master)](https://travis-ci.org/snags88/alt-reform)
`alt-reform` is a form building helper for the flux implementation of [Alt.js](http://alt.js.org/). Forms built with `alt-reform` is backed by Alt stores and uses the Alt dispatcher to dispatch events.

#### Why was `alt-reform` created?
Our engineering team at the [Flatiron School](flatironschool.com) was building a lot of forms in React and there are many ways to accomplish that. I created `alt-reform` to address 2 issues:

1. Provide a more opinionated framework for building forms using Alt + React.
2. Spin up our engineers much more quickly by abstracting away the boilerplate setup for building forms with Alt + React.

When I looked at flux implementations like _Redux_, they had their own library called [Redux Form](http://redux-form.com/6.5.0/) for building forms. Hence, I decided to build a similar library that allows developers to build forms quickly with the basic functionality you would expect from web forms.

> Note: this is different than the [`alt-form`](https://github.com/altjs/form) library implemented by the creator of Alt.js. This is a more updated version of working with forms using an Alt Store to track the form state.

#### How do I use Alt Reform?
`alt-reform`constructs forms using 3 different parts:

1. **Form object**: a javascript object that is used to configure logic underlying the form such as validations, initial values, submission behavior, etc. This object uses an Alt Store in the implementation to store the state of the form. The creation of this object is provided by the library. See example for more details.
2. **Form component**: a React component that represents the UI of the form such as how each input field should look, how field errors should be displayed, etc. This is just a React component so the library does not provide any components you must use. 
3. **Form connector**: a high order React component that connects the Form Object and the Form Component. It will take attributes of the Form Object and pass them in as props to the Form Component.

