import { validate, normalize, dispatchEvent, Namespaces } from 'helpers/FormUtils';

describe('FormUtils', function() {
  describe('Namespaces.register', () => {
    const registerName = () => {
      this.registerNamespace(this.namespace);
    }

    beforeEach(() => {
      this.Namespaces = Namespaces()
      this.registerNamespace = this.Namespaces.register;
      this.namespace = 'test_spec';
    })

    describe('non-duplicate name', () => {
      it('registers the name successfully', () => {
        expect(registerName).not.toThrow();
      })
    })

    describe('duplicate name', () => {
      it('throws an error', () => {
        registerName()
        expect(registerName).toThrow();
      })
    })
  })

  describe('validate()', () => {
    beforeEach(() => {
      this.validState = { test: '123' }
      this.invalidState = { test: '', hello: 'world'}
      this.validators = {
        test: (val) => !!val.length ? 'noop' : Error('required'),
        hello: () => {}
      }
    })

    describe('when a field fails validation', () => {
      it('rejects the promise with an error object', (done) => {
        validate(this.invalidState, this.validators).then(done.fail)
          .catch((e) => {
            expect(e).toEqual({test: 'required'});
            done();
          })
      })
    })

    describe('when all fields pass validation', () => {
      it('returns a then-able with the valid state', (done) => {
        let expectedState = {test: '123', hello: ''}

        validate(this.validState, this.validators).then((state) => {
          expect(state).toEqual(expectedState)
          done();
        }).catch(done.fail)
      })
    })
  });

  describe('normalize()', () => {
    beforeEach(() => {
      this.currentState = { hello: '123', world: '456' }
      this.normalizer = { hello: (value) => '789' }
      this.normalizedState = normalize(this.currentState, this.normalizer)
    })

    it('does not mutate the original state', () => {
      expect(this.currentState).toEqual(this.currentState)
    })

    it('normalizes fields with normalizers', () => {
      expect(this.normalizedState).toEqual(jasmine.objectContaining({hello: '789'}))
    })

    it('does not change fields without normalizers', () => {
      expect(this.normalizedState).toEqual(jasmine.objectContaining({world: '456'}))
    })
  })

  describe('dispatchEvent', () => {
    beforeEach(() => {
      this.spy = jasmine.createSpy('dispatchEvent spy');
      this.validEvent = {
        target: {
          dataset: {fluxKey: 'key'},
          value: 'value'
        }
      }

      this.invalidEvent = {
        target: {
          dataset: {},
          value: 'value'
        }
      }
    })

    describe('when event target has flux key', () => {
      it('calls the handler with the correct payload', () => {
        let expectedPayload = {key: 'value'}
        dispatchEvent(this.validEvent, this.spy)

        expect(this.spy).toHaveBeenCalledWith(expectedPayload);
      })
    })

    describe('when event target does not have a flux key', () => {
      it('does not call the handler', () => {
        dispatchEvent(this.invalidEvent, this.spy)

        expect(this.spy).not.toHaveBeenCalled();
      })
    })
  })
});

