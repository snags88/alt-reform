import isPromise from 'is-promise';
import FormConnector from './FormConnector'
import StoreFactory from './helpers/FormStoreFactory';
import FormActions from './helpers/FormActions';
import Utils from './helpers/FormUtils';

const Namespaces = Utils.Namespaces()

export { FormConnector, Namespaces }

export default (namespace, dispatcher, opts) => {
  Namespaces.register(namespace);

  const {
    initialState={},
    onSubmit= s => s,
    onSubmitSuccess= s => s,
    onSubmitFail= e => e,
    fields={},
    normalizers={},
  } = opts

  // get the action creators
  const {
    changed, saved, canceled,
    validationStarted, validationFailed,
    focused, blurred, normalized,
    submitSuccess, submitFailed, startLoading,
    endLoading
  } = FormActions(namespace)

  const store = StoreFactory(namespace, dispatcher, initialState)

  const submit = (e) => {
    if (typeof e === 'object' && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    dispatcher.dispatch(startLoading()); // update load state
    normalize();
    return validate()
      .then(state => {
        dispatcher.dispatch(saved(state));
        let response = onSubmit(state);

        if (isPromise(response)) {
          return response
            .then((response) => {
              dispatcher.dispatch(submitSuccess());
              dispatcher.dispatch(endLoading());
              onSubmitSuccess(response)
            }).catch((response) => {
              dispatcher.dispatch(submitFailed(response));
              dispatcher.dispatch(endLoading());
              onSubmitFail(response)
            });
        } else {
          dispatcher.dispatch(endLoading());
          return Promise.resolve(response);
        }
      }).catch((err) => {
        dispatcher.dispatch(endLoading());
        return err;
      })
  }

  const validate = () => {
    dispatcher.dispatch(validationStarted());
    let currentState = store.getState().fields;
    let validators = fields;
    return Utils.validate(currentState, fields).catch(errors => {
      dispatcher.dispatch(validationFailed(errors));
      return Promise.reject(errors);
    })
  }

  const normalize = () => {
    let currentState = store.getState().fields;
    let normalizedState = Utils.normalize(currentState, normalizers)
    dispatcher.dispatch(normalized(normalizedState));
    return normalizedState;
  }

  const cancel = () => {
    let currentState = store.getState().fields;
    dispatcher.dispatch(canceled(currentState));
    dispatcher.dispatch(endLoading());
  }

  const onChange = (ev) => { Utils.dispatchEvent(ev, change) }
  const change = (state) => {
    let currentState = store.getState().fields;
    let newState = Object.assign({}, currentState, state)
    let changedKey = Object.keys(state)[0];
    dispatcher.dispatch(changed({state:newState, key:changedKey}));

    return Promise.resolve(newState);
  }

  const onBlur = (ev) => { Utils.dispatchEvent(ev, blur) }
  const blur = (state) => {
    let key = Object.keys(state)[0];
    let value = state[key];
    dispatcher.dispatch(blurred({key, value}))
  }

  const onFocus = (ev) => { Utils.dispatchEvent(ev, focus) }
  const focus = (state) => {
    let key = Object.keys(state)[0];
    let value = state[key];
    dispatcher.dispatch(focused({key, value}))
  }

  const formFields = () => {
    const state = store.getState().fields;
    return Object.keys(fields).reduce((all, key) => {
      let value = state[key] || '';
      all[key] = {'data-flux-key': key, value, onChange, onFocus, onBlur}
      return all;
    }, {})
  }

  return {
    store,
    submit,
    cancel,
    validate,
    normalize,
    change,
    blur,
    fields: formFields,
  }
}

