import FormActions from 'helpers/FormActions';

const StoreFactory = (namespace, dispatcher, initialState) => {
  const {
    changed, saved, canceled,
    validationStarted, validationFailed,
    focused, blurred, normalized,
    submitSuccess, submitFailed, startLoading,
    endLoading
  } = FormActions(namespace)

  return dispatcher.createUnsavedStore({
    state: {
      submitError: null,
      errors: {},
      focused: null,
      fields: initialState,
      touched: [],
      loading: false
    },
    bindListeners: {
      updateFields: [saved, canceled, normalized],
      fieldChange: changed,
      onValidationStarted: validationStarted,
      fail: validationFailed,
      focus: focused,
      blur: blurred,
      onSubmitSuccess: submitSuccess,
      onSubmitFailed: submitFailed,
      onStartLoading: startLoading,
      onEndLoading: endLoading
    },
    onStartLoading() {
      this.setState({loading: true})
    },
    onEndLoading() {
      this.setState({loading: false})
    },
    onSubmitSuccess() {
      this.setState({submitError: null})
    },
    onSubmitFailed(error) {
      this.setState({submitError: error})
    },
    onValidationStarted() {
      this.setState({errors: {}})
    },
    updateFields(state) {
      this.setState({fields: state})
    },
    fieldChange({state, key}) {
      let newState = { fields: state }
      this.setNewTouchedState(newState, key);
      this.setState(newState)
    },
    fail(invalidState) {
      this.setState({errors: invalidState})
    },
    focus({key, value}) {
      this.setState({focused: key})
    },
    blur({key, value}) {
      let newState = { focused: null }
      this.setNewTouchedState(newState, key);
      this.setState(newState)
    },
    setNewTouchedState(newState, key) {
      if (this.state.touched.indexOf(key) === -1) {
        Object.assign(newState, { touched: [...this.state.touched, key]})
      }
    }
  })
}

export default StoreFactory;
