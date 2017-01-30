import React              from 'react';
import { shallow, mount } from 'enzyme';
import Alt                from 'alt';

import AltForm, {Namespaces} from 'Form';
import FormConnector        from 'FormConnector';

import jsdom from 'jsdom'
const doc = jsdom.jsdom('<!doctype html><html><body></body></html>')
global.document = doc
global.window = doc.defaultView

describe('AltFormConnector', function() {
  beforeEach(() => {
    this.dispatcher = new Alt
    this.namespace = 'Specs'
    this.initialState = {test: '123'};
    Namespaces.reset();
    this.form = AltForm(this.namespace, this.dispatcher, {
      fields: {test: () => {}},
      initialState: this.initialState,
    })

    this.testComponent = React.createClass({
      render() {
        return <div fields={this.props.fields} id='test-component'/>
      }
    })

    this.wrappedComponent = FormConnector(this.form)(this.testComponent)
  })

  it('sets the form state as the wrapper component state', () => {
    let wrapper = shallow(<this.wrappedComponent/>)
    let storeState = this.form.store.getState();

    expect(wrapper.state()).toEqual(storeState);
  })

  it('updates the wrapper component state when store state changes', () => {
    let wrapper = mount(<this.wrappedComponent/>) //mount to add listeners
    let newState = {test: 'newState'}
    this.form.change(newState);
    let newStoreState = this.form.store.getState()

    expect(wrapper.state()).toEqual(newStoreState);
  })

  it('sends the form object attributes (except fields) as props to the child component', () => {
    let { fields, ..._form } = this.form;
    let wrapper = shallow(<this.wrappedComponent />);

    expect(wrapper.props()).toEqual(jasmine.objectContaining(_form));
  })

  it('sends form errors as errors props', () => {
    let errorState = {errors: {test: 'test error message'}}
    let wrapper = shallow(<this.wrappedComponent />);
    wrapper.setState(errorState)

    expect(wrapper.props()).toEqual(jasmine.objectContaining(errorState));
  })

  it('sends the proper field value as fields props', () => {
    let wrapper = mount(<this.wrappedComponent />);
    let childComponent = wrapper.find('#test-component');

    expect(childComponent.props().fields.test.value).toEqual('123');
    this.form.change({test: 'newFieldState'})
    expect(childComponent.props().fields.test.value).toEqual('newFieldState');
  })

  it('sends additional props as is to the child component', () => {
    let additionalProps = {additionalProps: 'test more props'}
    let wrapper = shallow(<this.wrappedComponent {...additionalProps}/>);

    expect(wrapper.props()).toEqual(jasmine.objectContaining(additionalProps));
  })

  it('sends touched fields in touched props', () => {
    let wrapper = shallow(<this.wrappedComponent/>);
    let newState = {touched: ['test touched field']}
    wrapper.setState(newState)

    expect(wrapper.props()).toEqual(jasmine.objectContaining(newState));
  })

  it('sends loading field in loading props', () => {
    let wrapper = shallow(<this.wrappedComponent/>);
    let newState = {loading: true}
    wrapper.setState(newState)

    expect(wrapper.props()).toEqual(jasmine.objectContaining(newState));
  })
});

