import StoreFactory from 'helpers/FormStoreFactory';
import Alt          from 'alt';

describe('FormStoreFactory', function() {
  const generateStore = (state={}) => {
    return StoreFactory(this.namespace, this.dispatcher, state)
  }

  beforeEach(() => {
    this.dispatcher = new Alt
    this.namespace = 'Specs'
    this.testState = {test: '123'}
    this.store = generateStore();
  })

  describe('default store state', () => {
    beforeEach(() => {
      this.defaultState = this.store.getState()
    })

    it('sets an "errors" state to empty object', () => {
      expect(this.defaultState.errors).toEqual({});
    })

    it('sets a "focused" state to null', () => {
      expect(this.defaultState.focused).toEqual(null);
    })

    it('sets a "fields" state to empty object', () => {
      expect(this.defaultState.fields).toEqual({});
    })

    it('sets a "touched" state to empty array', () => {
      expect(this.defaultState.touched).toEqual([]);
    })

    it('sets a "submitError" state to null', () => {
      expect(this.defaultState.submitError).toBeNull();
    })

    it('sets a "loading" state to false', () => {
      expect(this.defaultState.loading).toEqual(false);
    })
  });

  describe('when given an initialState option', () => {
    it('sets the store\'s initial field state correctly', () => {
      let store = generateStore(this.testState)

      expect(store.getState().fields).toEqual(this.testState)
    })
  });

  describe('bound listeners', () => {
    const dispatchAction = (actionName, payload) => {
      this.dispatcher.dispatch({
        type: `${this.namespace}/${actionName}`,
        payload
      })
    }

    describe('when `changed` is dispatched', () => {
      it('does not reset the other states', () => {
        let errorState = {test: 'required'}
        dispatchAction('validationFailed', errorState)
        dispatchAction('changed', {state: this.testState, key: 'test'})
        expect(this.store.getState().errors).toEqual(errorState)
      })

      it('sets the "fields" state to the payload', () => {
        dispatchAction('changed', {state: this.testState, key: 'test'})
        expect(this.store.getState().fields).toEqual(this.testState)
      })

      it('adds the key to the "touched" state', () => {
        dispatchAction('changed', {state: this.testState, key: 'test'})
        expect(this.store.getState().touched).toContain('test')
      })
    })

    describe('when `saved` is dispatched', () => {
      it('sets the "fields" state to the state payload', () => {
        dispatchAction('saved', this.testState)
        expect(this.store.getState().fields).toEqual(this.testState)
      })
    })

    describe('when `canceled` is dispatched', () => {
      it('sets the "fields" state to the payload', () => {
        dispatchAction('canceled', this.testState)
        expect(this.store.getState().fields).toEqual(this.testState)
      })
    })

    describe('when `normalized` is dispatched', () => {
      it('sets the "fields" state to the payload', () => {
        dispatchAction('normalized', this.testState)
        expect(this.store.getState().fields).toEqual(this.testState)
      })
    })

    describe('when `focused` is dispatched', () => {
      it('sets the "focused" state to the payload', () => {
        dispatchAction('focused', {key:'testField', value: '123'})
        expect(this.store.getState().focused).toEqual('testField')
      })
    })

    describe('when `blurred` is dispatched', () => {
      it('sets the "focused" state to null', () => {
        dispatchAction('focused', {key: 'testField', value: '123'})
        expect(this.store.getState().focused).not.toBeNull()
        dispatchAction('blurred', {key: 'testField', value: ''})
        expect(this.store.getState().focused).toBeNull()
      })

      it('adds the field to the "touched" state', () => {
        expect(this.store.getState().touched).not.toContain('testField')
        dispatchAction('blurred', {key: 'testField', value: '123'})
        expect(this.store.getState().touched).toContain('testField')
      })

      it('does not add the field to the "touched" state if it exists already', () => {
        expect(this.store.getState().touched.length).toEqual(0)
        dispatchAction('blurred', {key: 'testField', value: '123'})
        expect(this.store.getState().touched.length).toEqual(1)
        dispatchAction('blurred', {key: 'testField', value: '123'})
        expect(this.store.getState().touched.length).toEqual(1)
      })
    })

    describe('when `validationStarted` is dispatched', () => {
      it('sets the "errors" state to empty object', () => {
        dispatchAction('validationStarted')
        expect(this.store.getState().errors).toEqual({})
      })
    })

    describe('when `validationFailed` is dispatched', () => {
      it('sets the "errors" state to payload', () => {
        let invalid = { invalidField: 'test error' };
        dispatchAction('validationFailed', invalid)

        expect(this.store.getState().errors).toEqual(invalid)
      })
    })

    describe('when `submitSuccess` is dispatched', () => {
      it('sets the "submitError" state to null', () => {
        dispatchAction('submitFailed', {message: 'error'})
        expect(this.store.getState().submitError).not.toEqual(null)

        dispatchAction('submitSuccess', null)
        expect(this.store.getState().submitError).toEqual(null)
      })
    })

    describe('when `submitFailed` is dispatched', () => {
      it('sets the "submitError" state to the payload', () => {
        let payload = {message: 'error'}
        dispatchAction('submitFailed', payload)
        expect(this.store.getState().submitError).toEqual(payload)
      })
    })

    describe('when `startLoading` is dispatched', () => {
      it('sets the "loading" state to true', () => {
        dispatchAction('startLoading', null)
        expect(this.store.getState().loading).toEqual(true)
      })
    })

    describe('when `endLoading` is dispatched', () => {
      it('sets the "loading" state to false', () => {
        dispatchAction('endLoading', null)
        expect(this.store.getState().loading).toEqual(false)
      })
    })
  })
});


