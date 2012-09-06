/*
 * Valider - HTML5 Form Validation
 * @author DeXTeD
 * @version 0.4
 * @license MIT
 */

(function ($) {
	"use strict";

	var Valider = function (form, config) {

		var self = this;

		// Extend config
		this.config = $.extend({
			onErrors: function (errors) {
				// Simple error
				var arr = [];
				$.each(errors, function (key, value) {
					arr.push(value);
				});
				alert(arr.join('\n'));
			},
			onInputError: function (error) {},
			onInputPass: function () {},
			lang: $('html').attr('lang') || 'en'
		}, config || {});

		// Store incorrect inputs for onErrors callback
		this.incorrectInputs = {};

		// Cache form and inputs
		this.form = form;
		this.inputs = form.find(':input:not(:button, :image, :reset, :submit, :disabled), textarea:not(:disabled)');

		// Bind validation on submit and disable native HTML5 form validation
		form.on('submit.valider', function (event) {
			self.validate(self.inputs, event);
		}).attr('novalidate', 'novalidate');

		return this;
	};

	Valider.prototype = {

		regex: {
			'number': /^-?[0-9]*(\.[0-9]+)?$/,
			'email': /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/,
			'url': /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i
		},

		errors: {
			en: {
				'*'            : 'Incorrect value',
				'[required]'   : 'Field :name is required',
				'[type=email]' : 'Invalid email address',
				'[type=number]': 'Value must be a number',
				'[type=url]'   : 'Invalid URL',
				'[max]'        : 'The maximum value is :max',
				'[min]'        : 'The minimum value is :min',
				'[data-equals]': 'The value is not the same as the field :equals'
			},
			pl: {
				'*'            : 'Niepoprawna wartość',
				'[required]'   : 'Pole ":name" jest wymagane',
				'[type=email]' : 'Błędny adres e-mail',
				'[type=number]': 'Wartość musi być liczbą',
				'[type=url]'   : 'Niepoprawny adres WWW',
				'[max]'        : 'Maksymalna wartość to :max',
				'[min]'        : 'Minimala wartość to :min',
				'[data-equals]': 'Wartość nie jest taka sama jak pole :equals'
			}
		},

		filters: {
			'[required]': function (input, val) {
				if (input.is(':checkbox')) {
					return input.prop('checked');
				}
				if (input.is(':radio')) {
					// TODO radio support
					return true;
				}
				return !!val;
			},
			'[type=email], [data-type=email]': function (input, val) {
				return val === '' || this.regex.email.test(val);
			},
			'[type=number], [data-type=number]': function (input, val) {
				var valDot = val.replace(',', '.');
				if (valDot !== val) {
					input.val(valDot);
				}
				return val === '' || this.regex.number.test(valDot);
			},
			'[type=url], [data-type=url]': function (input, val) {
				return val === '' || this.regex.url.test(val);
			},
			'[max], [data-type=max]': function (input, val) {
				var max = input.attr("max") || input.data("max");
				return val === '' || (parseFloat(val) <= parseFloat(max));
			},
			'[min], [data-type=min]': function (input, val) {
				var min = input.attr("min") || input.data("min");
				return val === '' || (parseFloat(val) >= parseFloat(min));
			},
			'[pattern]': function (input, val) {
				return val === '' || new RegExp("^" + input.attr("pattern") + "$").test(val);
			},
			'[data-regex]': function (input, val) {
				return val === '' || this.regex[input.data('regex')].test(val);
			},
			'[data-equals]': function (input, val) {
				var input2 = this.inputs.filter('[name=' + input.data('equals') + ']');
				return val === input2.val();
			}
		},

		getError: function (key, input) {

			var error = input.data('message'),
				// Attributes - replace :names
				attrs = {
					'name': input.data('name') || input.attr('name'),
					'val': input.val(),
					'min': input.attr("min") || input.data("min"),
					'max': input.attr("max") || input.data("max"),
					'equals': input.data("equalsName") || input.data("equals")
				};

			if (key === '[data-regex]') {
				// Fix key with data-regex
				key = 'regex:' + input.data('regex');
			} else {
				// Fix key with data-type
				key = key.split(',')[0];
			}

			// No error?
			if (!error) {
				// Get error
				error = this.errors[this.config.lang][key];
				// still don't have
				if (!error) {
					// data type
					var type = input.data('type');
					if (type) {
						error = this.errors[this.config.lang]['[type=' + type + ']'];
					}
					// default error
					if (!error) {
						error = this.errors[this.config.lang]['*'];
					}
				}
			}

			// Replace all attributes
			$.each(attrs, function (key, value) {
				error = error.replace(':' + key, attrs[key]);
			});

			return error;
		},

		// Call user error callback function
		callInputError: function (key, input) {
			var error = this.getError(key, input);
			this.config.onInputError.call(input, error);
			return error;
		},

		// Call user pass callback function
		callInputPass: function (input) {
			this.config.onInputPass.call(input);
		},

		// Validate one input
		validateInput: function (input) {
			var self = this,
				status = true;

			$.each(this.filters, function (key, fn) {
				if (input.is(key)) {
					if (!fn.call(self, input, input.val())) {
						self.bindInput(input);
						status = self.callInputError(key, input);
						return false;
					}
				}
			});
			return status;
		},

		// Bind input to recheck value on change
		bindInput: function (input) {
			var self = this,
				timer;
			// Remove all to prevent multiple binds
			this.unBindInput(input);
			// Bind all possible events and debounce them
			input.on('keyup.valider-input change.valider-input click.valider-input', function () {
				clearTimeout(timer);
				timer = setTimeout(function () {
					var check = self.validateInput(input);
					if (check === true) {
						// input is valid - delete error, unbind and callback
						delete self.incorrectInputs[input.attr('name')];
						self.unBindInput(input);
						self.callInputPass(input);
					} else {
						// Save error name
						self.incorrectInputs[input.attr('name')] = check;
					}
				}, 200);
			});
		},

		// Unbind input
		unBindInput: function (input) {
			input.off('.valider-input');
		},

		// Validate all inputs in form
		validate: function (inputs, event) {
			var self = this,
				isError = false;

			inputs.each(function () {
				var input = $(this),
					name = input.attr('name'),
					check = self.validateInput(input);

				if (check !== true) {
					// Save error name
					self.incorrectInputs[name] = check;
					isError = true;
				} else if (self.incorrectInputs[name]) {
					// input is valid - delete error, unbind and callback
					delete self.incorrectInputs[name];
					self.unBindInput(input);
					self.callInputPass(input);
				}
			});

			// If some input has error, prevent submit
			if (isError) {
				this.config.onErrors.call(null, this.incorrectInputs);
				event.preventDefault();
			}
		}

	};

	$.Valider = {
		addLang: function (lng) {
			$.extend(true, Valider.prototype.errors, lng);
			return this;
		},
		addRegex: function (name, regex) {
			if (typeof name === 'object') {
				$.extend(Valider.prototype.regex, name);
			} else {
				var filterObj = {};
				filterObj[name] = regex;
				$.extend(Valider.prototype.regex, filterObj);
			}
			return this;
		},
		addFilter: function (filter, fn) {
			if (typeof filter === 'object') {
				$.extend(Valider.prototype.filters, filter);
			} else {
				var filterObj = {};
				filterObj[filter] = fn;
				$.extend(Valider.prototype.filters, filterObj);
			}
			return this;
		}
	};

	// jQuery Plugin
	$.fn.Valider = function (conf) {
		return this.each(function () {
			var form = $(this);
			if (form.is('form')) {
				form.data('valider', new Valider(form, conf));
			}
		});
	};

})(window.jQuery);