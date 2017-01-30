import Form, { Namespaces } from 'Form';
import Alt from 'alt';

describe('Form', function() {
  const generateForm = (opts={}) => {
    return Form(
      this.namespace,
      this.dispatcher,
      Object.assign({}, {fields: this.fields}, opts)
    )
  }

  beforeEach(() => {
    this.validationSpy = jasmine.createSpy('validationSpy')
    this.dispatcher = new Alt
    this.namespace = 'Specs'
    this.testState = {test: '123'}
    this.fields = {
      test: this.validationSpy
    }

    Namespaces.reset();
    this.form = generateForm();
  })

  describe('public API', () => {
    it('implements store, submit, fields, cancel, validate, and normalize', () => {
      let apis = ['store', 'submit', 'fields',
        'cancel', 'validate', 'normalize', 'change',
        'blur'
      ]

      apis.forEach((api) => {
        expect(this.form[api]).toBeDefined();
      })
    });
  });

  describe('submit()', () => {
    it('dispatches startLoading', (done) => {
      spyOn(this.dispatcher, 'dispatch');
      this.form.submit().then(state => {
        expect(this.dispatcher.dispatch).toHaveBeenCalledWith({
          type: `${this.namespace}/startLoading`,
          payload: null
        })
        done()
      }).catch(done.fail)
    });

    describe('on successful validation', () => {
      it('dispatches saved with the state', (done) => {
        this.form.change(this.testState);

        spyOn(this.dispatcher, 'dispatch');
        this.form.submit().then(state => {
          expect(this.dispatcher.dispatch).toHaveBeenCalledWith({
            type: `${this.namespace}/saved`,
            payload: this.testState
          })
          done()
        }).catch(done.fail)
      })
    })

    it('calls the onSubmit function with the state', (done) => {
      let onSubmitSpy = jasmine.createSpy('onSubmitSpy')
      Namespaces.reset()
      let form = generateForm({ onSubmit: onSubmitSpy });

      form.change(this.testState)

      form.submit().then(() => {
        expect(onSubmitSpy).toHaveBeenCalledWith(this.testState)
        done();
      }).catch(done.fail)
    })

    describe('when onSubmit returns a promise', () => {
      describe('on success', () => {
        beforeEach(() => {
          this.response = 'test response'
          this.successResponse = new Promise((resolve) => resolve(this.response) );
          this.onSubmitSpy = jasmine.createSpy('onSubmitSpy').and.returnValue(this.successResponse)
          this.onSubmitSuccessSpy = jasmine.createSpy('onSubmitSuccessSpy')

          Namespaces.reset()
          this.successForm = generateForm({
            onSubmit: this.onSubmitSpy,
            onSubmitSuccess: this.onSubmitSuccessSpy
          });
        })

        it('dispatches endLoading', (done) => {
          spyOn(this.dispatcher, 'dispatch')

          this.successForm.submit().then(() => {
            expect(this.dispatcher.dispatch).toHaveBeenCalledWith({
              type: `${this.namespace}/endLoading`,
              payload: null
            })
            done();
          }).catch(done.fail)
        });

        it('dispatches submitSuccess', (done) => {
          spyOn(this.dispatcher, 'dispatch')

          this.successForm.submit().then(() => {
            expect(this.dispatcher.dispatch).toHaveBeenCalledWith({
              type: `${this.namespace}/submitSuccess`,
              payload: null
            })
            done();
          }).catch(done.fail)
        })

        it('calls the onSubmitSuccess function with the response', (done) => {
          this.successForm.submit().then(() => {
            expect(this.onSubmitSuccessSpy).toHaveBeenCalledWith(this.response);
            done();
          }).catch(done.fail)
        })
      })

      describe('on fail', () => {
        beforeEach(() => {
          this.response = 'test response'
          this.failedResponse = new Promise((resolve, reject) => reject(this.response) );
          this.onSubmitSpy = jasmine.createSpy('onSubmitSpy').and.returnValue(this.failedResponse)
          this.onSubmitFailSpy = jasmine.createSpy('onSubmitFailSpy')

          Namespaces.reset()
          this.failedForm = generateForm({
            onSubmit: this.onSubmitSpy,
            onSubmitFail: this.onSubmitFailSpy
          });
        })

        it('dispatches endLoading', (done) => {
          spyOn(this.dispatcher, 'dispatch')

          this.failedForm.submit().then(() => {
            expect(this.dispatcher.dispatch).toHaveBeenCalledWith({
              type: `${this.namespace}/endLoading`,
              payload: null
            })
            done();
          }).catch(done.fail)
        });

        it('dispatches submitFailed', (done) => {
          spyOn(this.dispatcher, 'dispatch')

          this.failedForm.submit().then(() => {
            expect(this.dispatcher.dispatch).toHaveBeenCalledWith({
              type: `${this.namespace}/submitFailed`,
              payload: this.response
            })
            done();
          }).catch(done.fail)
        })

        it('calls the onSubmitFail function with the response', (done) => {
          this.failedForm.submit().then(() => {
            expect(this.onSubmitFailSpy).toHaveBeenCalledWith(this.response);
            done();
          }).catch(done.fail)
        })
      })
    })

    describe('when onSubmit does not return a promise', () => {
      beforeEach(() => {
        this.spyResponse = 'return value test';
        this.onSubmitSpy = jasmine.createSpy('onSubmitSpy').and.returnValue(this.spyResponse);

        Namespaces.reset()
        this.synchronousForm = generateForm({ onSubmit: this.onSubmitSpy });
      })

      it('dispatches endLoading', (done) => {
        spyOn(this.dispatcher, 'dispatch')

        this.synchronousForm.submit().then(() => {
          expect(this.dispatcher.dispatch).toHaveBeenCalledWith({
            type: `${this.namespace}/endLoading`,
            payload: null
          })
          done();
        }).catch(done.fail)
      });

      it('passes the return value of onSubmit', (done) => {
        this.synchronousForm.submit().then((response) => {
          expect(response).toEqual(this.spyResponse);
          done();
        }).catch(done.fail)
      })
    })

    describe('when form save fails', () => {
      beforeEach(() => {
        this.onSubmitSpy = jasmine.createSpy('onSubmitSpy')

        Namespaces.reset()
        this.invalidForm = generateForm({
          initialState: {test: ''},
          onSubmit: this.onSubmitSpy,
          fields: {test: () => Error('required')}
        })
      })

      it('dispatches endLoading', (done) => {
        spyOn(this.dispatcher, 'dispatch')

        this.invalidForm.submit().then(() => {
          expect(this.dispatcher.dispatch).toHaveBeenCalledWith({
            type: `${this.namespace}/endLoading`,
            payload: null
          })
          done();
        }).catch(done.fail)
      });

      it('does not call onSubmit', (done) => {
        this.invalidForm.submit().then(() => {
          expect(this.onSubmitSpy).not.toHaveBeenCalled()
          done();
        }).catch(done.fail)
      })

      it('rejects promise and returns the error', (done) => {
        this.invalidForm.submit().then((err) => {
          expect(err).toEqual({test: 'required'});
          done();
        }).catch(done.fail)
      })
    })
  });

  describe('fields option key', () => {
    it('sets the correct field on the form fields object', () => {
      let field = Object.keys(this.fields)[0];
      let formFields = this.form.fields();
      expect(Object.keys(formFields)).toContain(field);
    })
  });

  describe('validate()', () => {
    it('dispatches validationStarted', () => {
      spyOn(this.dispatcher, 'dispatch')
      this.form.validate();

      expect(this.dispatcher.dispatch).toHaveBeenCalledWith({
        type: `${this.namespace}/validationStarted`,
        payload: null
      })
    })

    it('calls the field function for validation with current value', (done) => {
      let testValue = '123123'
      this.form.change({test: testValue});

      this.form.validate().then(() => {
        expect(this.validationSpy).toHaveBeenCalledWith(testValue)
        done();
      }).catch(done.fail)
    })

    describe('successful validation', () => {
      it('returns the valid state in a thenable', (done) => {
        this.form.change(this.testState);
        this.form.validate().then(state => {
          expect(state).toEqual(this.testState)
          done()
        }).catch(done.fail)
      })
    })

    describe('failed validation', () => {
      it('dispatches validation failed with error object', (done) => {
        spyOn(this.dispatcher, 'dispatch')
        Namespaces.reset()
        let form = generateForm({
          initialState: {test: ''},
          fields: {test: () => Error('required')}
        })

        form.validate().then(done.fail)
        .catch(() => {
          expect(this.dispatcher.dispatch).toHaveBeenCalledWith({
            type: `${this.namespace}/validationFailed`,
            payload: {test: 'required'}
          })
          done();
        });
      })
    })
  })

  describe('normalize()', () => {
    it('dispatches the normalized state', () => {
      spyOn(this.dispatcher, 'dispatch')
      Namespaces.reset()
      let form = generateForm({
        initialState: this.testState,
        normalizers: {test: () => 'normalized' }
      })

      form.normalize()
      expect(this.dispatcher.dispatch).toHaveBeenCalledWith({
        type: `${this.namespace}/normalized`,
        payload: {test: 'normalized'}
      })
    })

    it('returns the normalized state', () => {
      Namespaces.reset()
      let form = generateForm({
        initialState: this.testState,
        normalizers: {test: () => 'normalized' }
      })

      let normalizedState = form.normalize();
      expect(normalizedState).toEqual({test: 'normalized'});
    })
  })

  describe('cancel()', () => {
    it('dispatches endLoading', () => {
      spyOn(this.dispatcher, 'dispatch')

      this.form.cancel();
      expect(this.dispatcher.dispatch).toHaveBeenCalledWith({
        type: `${this.namespace}/endLoading`,
        payload: null
      })
    });

    it('dispatches the cancel action with currentState', () => {
      this.form.change(this.testState)
      spyOn(this.dispatcher, 'dispatch')

      this.form.cancel();
      expect(this.dispatcher.dispatch).toHaveBeenCalledWith({
        type: `${this.namespace}/canceled`,
        payload: this.testState
      })
    })
  })

  describe('change()', () => {
    it('dispatches change with new state and changed key', () => {
      spyOn(this.dispatcher, 'dispatch')
      let newState = {test: '000'}

      this.form.change(newState)
      expect(this.dispatcher.dispatch).toHaveBeenCalledWith({
        type: `${this.namespace}/changed`,
        payload: {state: newState, key: 'test'}
      })
    })

    it('dispatches chage with merged state', () => {
      this.form.change(this.testState)
      let newState = {hello: 'world'}

      spyOn(this.dispatcher, 'dispatch')
      this.form.change(newState)

      let mergedState = Object.assign({}, this.testState, newState)
      expect(this.dispatcher.dispatch).toHaveBeenCalledWith({
        type: `${this.namespace}/changed`,
        payload: {state: mergedState, key: 'hello'}
      })
    })
  })

  describe('blur()', () => {
    it('dispatches blurred with key value obj', () => {
      spyOn(this.dispatcher, 'dispatch')
      let key = 'test', value = 'abc';
      let state = {}
      state[key] = value;

      this.form.blur(state)
      expect(this.dispatcher.dispatch).toHaveBeenCalledWith({
        type: `${this.namespace}/blurred`,
        payload: {key, value}
      })
    })
  })

  describe('fields', () => {
    it('returns an object with configured form fields', () => {
      let keys = Object.keys(this.fields);

      keys.forEach((key) => {
        let fields = this.form.fields();
        expect(fields[key]).toBeDefined();
        expect(Object.keys(fields[key])).toEqual([
          'data-flux-key', 'value', 'onChange', 'onFocus', 'onBlur'
        ])
      })
    })

    it('sets the initial value properly', () => {
      Namespaces.reset()
      let form = generateForm({initialState: this.testState})

      expect(form.fields().test.value).toEqual(this.testState.test);
    })
  });

});

