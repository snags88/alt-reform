(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("AltReform", [], factory);
	else if(typeof exports === 'object')
		exports["AltReform"] = factory();
	else
		root["AltReform"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _Form = __webpack_require__(1);
	
	var _Form2 = _interopRequireDefault(_Form);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Namespaces = exports.FormConnector = undefined;
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _isPromise = __webpack_require__(2);
	
	var _isPromise2 = _interopRequireDefault(_isPromise);
	
	var _FormConnector = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./FormConnector\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	
	var _FormConnector2 = _interopRequireDefault(_FormConnector);
	
	var _FormStoreFactory = __webpack_require__(4);
	
	var _FormStoreFactory2 = _interopRequireDefault(_FormStoreFactory);
	
	var _FormActions2 = __webpack_require__(5);
	
	var _FormActions3 = _interopRequireDefault(_FormActions2);
	
	var _FormUtils = __webpack_require__(6);
	
	var _FormUtils2 = _interopRequireDefault(_FormUtils);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var Namespaces = _FormUtils2.default.Namespaces();
	
	exports.FormConnector = _FormConnector2.default;
	exports.Namespaces = Namespaces;
	
	exports.default = function (namespace, dispatcher, opts) {
	  Namespaces.register(namespace);
	
	  var _opts$initialState = opts.initialState,
	      initialState = _opts$initialState === undefined ? {} : _opts$initialState,
	      _opts$onSubmit = opts.onSubmit,
	      onSubmit = _opts$onSubmit === undefined ? function (s) {
	    return s;
	  } : _opts$onSubmit,
	      _opts$onSubmitSuccess = opts.onSubmitSuccess,
	      onSubmitSuccess = _opts$onSubmitSuccess === undefined ? function (s) {
	    return s;
	  } : _opts$onSubmitSuccess,
	      _opts$onSubmitFail = opts.onSubmitFail,
	      onSubmitFail = _opts$onSubmitFail === undefined ? function (e) {
	    return e;
	  } : _opts$onSubmitFail,
	      _opts$fields = opts.fields,
	      fields = _opts$fields === undefined ? {} : _opts$fields,
	      _opts$normalizers = opts.normalizers,
	      normalizers = _opts$normalizers === undefined ? {} : _opts$normalizers;
	
	  // get the action creators
	
	  var _FormActions = (0, _FormActions3.default)(namespace),
	      changed = _FormActions.changed,
	      saved = _FormActions.saved,
	      canceled = _FormActions.canceled,
	      validationStarted = _FormActions.validationStarted,
	      validationFailed = _FormActions.validationFailed,
	      focused = _FormActions.focused,
	      blurred = _FormActions.blurred,
	      normalized = _FormActions.normalized,
	      submitSuccess = _FormActions.submitSuccess,
	      submitFailed = _FormActions.submitFailed,
	      startLoading = _FormActions.startLoading,
	      endLoading = _FormActions.endLoading;
	
	  var store = (0, _FormStoreFactory2.default)(namespace, dispatcher, initialState);
	
	  var submit = function submit(e) {
	    if ((typeof e === 'undefined' ? 'undefined' : _typeof(e)) === 'object' && typeof e.preventDefault === 'function') {
	      e.preventDefault();
	    }
	
	    dispatcher.dispatch(startLoading()); // update load state
	    normalize();
	    return validate().then(function (state) {
	      dispatcher.dispatch(saved(state));
	      var response = onSubmit(state);
	
	      if ((0, _isPromise2.default)(response)) {
	        return response.then(function (response) {
	          dispatcher.dispatch(submitSuccess());
	          dispatcher.dispatch(endLoading());
	          onSubmitSuccess(response);
	        }).catch(function (response) {
	          dispatcher.dispatch(submitFailed(response));
	          dispatcher.dispatch(endLoading());
	          onSubmitFail(response);
	        });
	      } else {
	        dispatcher.dispatch(endLoading());
	        return Promise.resolve(response);
	      }
	    }).catch(function (err) {
	      dispatcher.dispatch(endLoading());
	      return err;
	    });
	  };
	
	  var validate = function validate() {
	    dispatcher.dispatch(validationStarted());
	    var currentState = store.getState().fields;
	    var validators = fields;
	    return _FormUtils2.default.validate(currentState, fields).catch(function (errors) {
	      dispatcher.dispatch(validationFailed(errors));
	      return Promise.reject(errors);
	    });
	  };
	
	  var normalize = function normalize() {
	    var currentState = store.getState().fields;
	    var normalizedState = _FormUtils2.default.normalize(currentState, normalizers);
	    dispatcher.dispatch(normalized(normalizedState));
	    return normalizedState;
	  };
	
	  var cancel = function cancel() {
	    var currentState = store.getState().fields;
	    dispatcher.dispatch(canceled(currentState));
	    dispatcher.dispatch(endLoading());
	  };
	
	  var onChange = function onChange(ev) {
	    _FormUtils2.default.dispatchEvent(ev, change);
	  };
	  var change = function change(state) {
	    var currentState = store.getState().fields;
	    var newState = Object.assign({}, currentState, state);
	    var changedKey = Object.keys(state)[0];
	    dispatcher.dispatch(changed({ state: newState, key: changedKey }));
	
	    return Promise.resolve(newState);
	  };
	
	  var onBlur = function onBlur(ev) {
	    _FormUtils2.default.dispatchEvent(ev, blur);
	  };
	  var blur = function blur(state) {
	    var key = Object.keys(state)[0];
	    var value = state[key];
	    dispatcher.dispatch(blurred({ key: key, value: value }));
	  };
	
	  var onFocus = function onFocus(ev) {
	    _FormUtils2.default.dispatchEvent(ev, focus);
	  };
	  var focus = function focus(state) {
	    var key = Object.keys(state)[0];
	    var value = state[key];
	    dispatcher.dispatch(focused({ key: key, value: value }));
	  };
	
	  var formFields = function formFields() {
	    var state = store.getState().fields;
	    return Object.keys(fields).reduce(function (all, key) {
	      var value = state[key] || '';
	      all[key] = { 'data-flux-key': key, value: value, onChange: onChange, onFocus: onFocus, onBlur: onBlur };
	      return all;
	    }, {});
	  };
	
	  return {
	    store: store,
	    submit: submit,
	    cancel: cancel,
	    validate: validate,
	    normalize: normalize,
	    change: change,
	    blur: blur,
	    fields: formFields
	  };
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = isPromise;
	
	function isPromise(obj) {
	  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
	}


/***/ },
/* 3 */,
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _FormActions2 = __webpack_require__(5);
	
	var _FormActions3 = _interopRequireDefault(_FormActions2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	var StoreFactory = function StoreFactory(namespace, dispatcher, initialState) {
	  var _FormActions = (0, _FormActions3.default)(namespace),
	      changed = _FormActions.changed,
	      saved = _FormActions.saved,
	      canceled = _FormActions.canceled,
	      validationStarted = _FormActions.validationStarted,
	      validationFailed = _FormActions.validationFailed,
	      focused = _FormActions.focused,
	      blurred = _FormActions.blurred,
	      normalized = _FormActions.normalized,
	      submitSuccess = _FormActions.submitSuccess,
	      submitFailed = _FormActions.submitFailed,
	      startLoading = _FormActions.startLoading,
	      endLoading = _FormActions.endLoading;
	
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
	    onStartLoading: function onStartLoading() {
	      this.setState({ loading: true });
	    },
	    onEndLoading: function onEndLoading() {
	      this.setState({ loading: false });
	    },
	    onSubmitSuccess: function onSubmitSuccess() {
	      this.setState({ submitError: null });
	    },
	    onSubmitFailed: function onSubmitFailed(error) {
	      this.setState({ submitError: error });
	    },
	    onValidationStarted: function onValidationStarted() {
	      this.setState({ errors: {} });
	    },
	    updateFields: function updateFields(state) {
	      this.setState({ fields: state });
	    },
	    fieldChange: function fieldChange(_ref) {
	      var state = _ref.state,
	          key = _ref.key;
	
	      var newState = { fields: state };
	      if (this.state.touched.indexOf(key) === -1) {
	        Object.assign(newState, { touched: [].concat(_toConsumableArray(this.state.touched), [key]) });
	      }
	      this.setState(newState);
	    },
	    fail: function fail(invalidState) {
	      this.setState({ errors: invalidState });
	    },
	    focus: function focus(_ref2) {
	      var key = _ref2.key,
	          value = _ref2.value;
	
	      this.setState({ focused: key });
	    },
	    blur: function blur(_ref3) {
	      var key = _ref3.key,
	          value = _ref3.value;
	
	      var newState = { focused: null };
	      if (this.state.touched.indexOf(key) === -1) {
	        Object.assign(newState, { touched: [].concat(_toConsumableArray(this.state.touched), [key]) });
	      }
	      this.setState(newState);
	    }
	  });
	};
	
	exports.default = StoreFactory;
	module.exports = exports['default'];

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createActions = __webpack_require__(20);
	
	exports.default = function (namespace) {
	  return (0, _createActions.generateActions)(namespace, ['saved', 'canceled', 'changed', 'validationStarted', 'validationFailed', 'focused', 'blurred', 'normalized', 'submitSuccess', 'submitFailed', 'startLoading', 'endLoading']);
	};
	
	module.exports = exports['default'];

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Namespaces = exports.dispatchEvent = exports.normalize = exports.validate = undefined;
	
	var _isPromise = __webpack_require__(2);
	
	var _isPromise2 = _interopRequireDefault(_isPromise);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var validate = exports.validate = function validate() {
	  var currentState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	  var validators = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	
	  var results = Object.keys(validators).map(function (key) {
	    try {
	      var currentValue = currentState[key] || '';
	      var value = validators[key] ? validators[key](currentValue) : Promise.resolve();
	
	      if (value instanceof Error) {
	        throw value;
	      }
	
	      return (0, _isPromise2.default)(value) ? validation.then(function (value) {
	        return { key: key, value: value };
	      }, function (err) {
	        return { key: key, err: err };
	      }) : Promise.resolve({ key: key, value: currentValue });
	    } catch (err) {
	      return Promise.resolve({ key: key, err: err });
	    }
	  });
	
	  var errors = {},
	      validState = {};
	  return Promise.all(results).then(function (result) {
	    result.forEach(function (_ref) {
	      var key = _ref.key,
	          value = _ref.value,
	          err = _ref.err;
	
	      err ? errors[key] = err.message : validState[key] = value;
	    });
	
	    var hasErrors = !!Object.keys(errors).length;
	    if (hasErrors) {
	      return Promise.reject(errors);
	    } else {
	      return validState;
	    }
	  });
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
	
	/*
	 * validate()
	 *
	 * currentState: object that represents current state to validate
	 * validators: object that has k-v of field to validation function
	 *
	 * if a field fails validation, will reject promise with error object
	 * if all fields pass validation, will return then-able with valid state
	 */
	var normalize = exports.normalize = function normalize() {
	  var currentState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	  var normalizers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	
	  var newState = {};
	  Object.keys(currentState).forEach(function (key) {
	    var val = currentState[key];
	    newState[key] = normalizers[key] ? normalizers[key](val) : val;
	  });
	  return newState;
	};
	
	/*
	 * dispatchEvent()
	 *
	 * ev: event object from event listeners
	 * handler: the handler for the digested event payload
	 *
	 */
	
	var dispatchEvent = exports.dispatchEvent = function dispatchEvent(ev, handler) {
	  var target = ev.target;
	  if (target.dataset.fluxKey) {
	    var payload = {};
	    payload[target.dataset.fluxKey] = target.value;
	    handler(payload);
	  }
	};
	
	/*
	 * Namespaces()
	 *
	 * register: register provided name
	 * reset: resets registered names
	 *
	 */
	
	var Namespaces = exports.Namespaces = function Namespaces() {
	  var names = [];
	  return {
	    register: function register(namespace) {
	      if (names.indexOf(namespace) === -1) {
	        names.push(namespace);
	      } else {
	        throw Error('Namespace "' + namespace + '" already taken.');
	      }
	    },
	    reset: function reset() {
	      names = [];
	    }
	  };
	};
	
	exports.default = { normalize: normalize, validate: validate, dispatchEvent: dispatchEvent, Namespaces: Namespaces };

/***/ },
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var dispatch = function dispatch(x) {
	  for (var _len = arguments.length, a = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    a[_key - 1] = arguments[_key];
	  }
	
	  return a.length ? [x].concat(a) : x == null ? null : x;
	};
	
	exports.dispatch = dispatch;
	var createActions = function createActions(namespace, obj) {
	  return Object.keys(obj).reduce(function (actions, name) {
	    var id = namespace + "/" + name;
	    var action = function action(x) {
	      return { type: id, payload: obj[name](x) };
	    };
	    action.id = id;
	    action.dispatch = obj[name];
	    actions[name] = action;
	    return actions;
	  }, {});
	};
	
	var generateActions = function generateActions(namespace, actions) {
	  return createActions(namespace, actions.reduce(function (o, name) {
	    o[name] = dispatch;
	    return o;
	  }, {}));
	};
	
	exports.generateActions = generateActions;
	exports["default"] = createActions;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=AltReform.js.map