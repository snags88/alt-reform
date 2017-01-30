/*
 * validate()
 *
 * currentState: object that represents current state to validate
 * validators: object that has k-v of field to validation function
 *
 * if a field fails validation, will reject promise with error object
 * if all fields pass validation, will return then-able with valid state
 */
import isPromise from 'is-promise'

export const validate = (currentState={}, validators={}) => {
  const results = Object.keys(validators).map(key => {
    try {
      let currentValue = currentState[key] || '';
      let value = validators[key] ? validators[key](currentValue) : Promise.resolve()

      if (value instanceof Error) { throw value; }

      return isPromise(value)
        ? validation.then(value => ({key, value}), err => ({key, err}))
        : Promise.resolve({key, value: currentValue})
    } catch (err) {
      return Promise.resolve({key, err})
    }
  })

  const errors = {}, validState = {};
  return Promise.all(results).then(result => {
    result.forEach(({key, value, err}) => {
      err ? (errors[key] = err.message) : validState[key] = value;
    })

    let hasErrors = !!Object.keys(errors).length;
    if (hasErrors) {
      return Promise.reject(errors);
    } else {
      return validState;
    }
  })
};

/*
 * normalize()
 *
 * currentState: object that represents pre-normalized state
 * normalizers: object that has k-v of field to normalizing function
 *
 * will return a new state object after normalizer functions have been run
 * will not mutate original state
 */

export const normalize = (currentState={}, normalizers={}) => {
  let newState = {}
  Object.keys(currentState).forEach(key => {
    let val = currentState[key];
    newState[key] = normalizers[key] ? normalizers[key](val) : val;
  })
  return newState;
};

/*
 * dispatchEvent()
 *
 * ev: event object from event listeners
 * handler: the handler for the digested event payload
 *
 */

export const dispatchEvent = (ev, handler) => {
  const target = ev.target;
  if (target.dataset.fluxKey) {
    let payload = {}
    payload[target.dataset.fluxKey] = target.value
    handler(payload)
  }
}

/*
 * Namespaces()
 *
 * register: register provided name
 * reset: resets registered names
 *
 */

export const Namespaces = () => {
  let names = []
  return {
    register(namespace) {
      if(names.indexOf(namespace) === -1) {
        names.push(namespace)
      } else {
        throw Error(`Namespace "${namespace}" already taken.`)
      }
    },
    reset() {
      names = [];
    }
  }
}

export default { normalize, validate, dispatchEvent, Namespaces }
