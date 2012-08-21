(function($){

	// Add HTML5 input types
	$.each(["search", "tel", "url", "email", "datetime", "date", "month", "week", "time", "datetime-local", "number", "range", "color"], function(i, t) {
		$.expr[":"][t] = function(elem){
			return elem.getAttribute("type") === t;
		};
	});

	window.Valider = function(form, config) {

		var self = this;

		// Extend config
		this.config = $.extend({
			onInputError: function(error) {},
			onErrors: function(errors) {
				var arr = [];
				$.each(errors, function(key, value) {
					arr.push(value);
				});
				alert(arr.join(', '));
			},
			onInputPass: function() {},
			lang: $('html').attr('lang') || 'en'
		}, config || {});

		// Store incorrect inputs for onErrors callback
		this.incorrectInputs = {};

		// Cache form and inputs
		this.form = form;
		this.inputs = form.find(':input:not(:button, :image, :reset, :submit, :disabled), textarea:not(:disabled)');

		// Validate on submit
		form.on('submit.valider', function(event) {
			self.validate(self.inputs, event);
		}).attr('novalidate', 'novalidate');

		// Return himself for API in jquery data
		return this;
	};

	Valider.prototype = {

		regex: {
			'zipcode': /^\d+[0-9\-]+\d+?$/,
			'name': /^[a-zA-Z -\/.,0-9]*$/,
			'address': /^([0-9])+([0-9a-zA-Z -\/.,#])*$/,
			'letters': /^[a-zA-Z]*$/,
			'email': /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/,
			'url': /https?:\/\/([_a-z\d\-]+(\.[_a-z\d\-]+)+)(([_a-z\d\-\\\.\/]+[_a-z\d\-\\\/])+)*/,
			'city': /^[A-Za-z. '-]+$/,
			'password': /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
			'credit-card': /^([0-9]{2})+\/+([0-9]{2})$/
		},

		errors: {
			pl: {
				'*'					: 'Niepoprawna wartość',
				'[required]'		: 'Pole ":name" jest wymagane',
				':email'			: 'Błędny adres e-mail',
				':number'			: 'Wartość musi być liczbą',
				':url'				: 'Niepoprawny adres',
				'[max]'				: 'Maksymalna wartość to :max (minimalna :min)',
				'[min]'				: 'Minimala wartość to :min (maksymalna :max)',
				'[data-equals]'		: 'Wartość nie jest taka sama jak pole :equals'
			}
		},

		getError: function(key, input) {

			// Attributes for replace :names
			var error = '',
				attrs = {
					'name': input.data('name') || input.attr('name'),
					'val': _.escape(input.val()),
					'min': input.attr("min"),
					'max': input.attr("max")
				};

			// Input has its own message
			if(input.data('message')) {
				error = input.data('message');
			} else {
				// Get error
				error = this.errors[this.config.lang][key];
			}

			// No error? Get default
			if(_.isUndefined(error)) {
				error = this.errors[this.config.lang]['*'];
			}

			// Replace all attributes
			$.each(attrs, function(key, value){
				error = error.replace(':'+key, attrs[key]);
			});

			return error;
		},

		// Call user error callback function
		callInputError: function(key, input) {
			var error = this.getError(key, input);
			this.config.onInputError.call(input, error);
			return error;
		},

		// Call user pass callback function
		callInputPass: function(input) {
			this.config.onInputPass.call(input);
		},

		// Filter collection
		filters: {
			'[required]': function(input, val) {
				if(input.is(':checkbox')) {
					return input.prop('checked');
				}
				if(input.is(':radio')) {
					// TODO radio support
					return true;
				}
				return !_.isEmpty(val);
			},
			':email': function(input, val) {
				return val==='' || this.regex.email.test(val);
			},
			':number': function(input, val) {
				return val==='' || _.isFinite(parseInt(val, 10));
			},
			'[max]': function(input, val) {
				return val==='' || (parseFloat(val) <= parseFloat(input.attr("max"))) ? true : false;
			},
			'[min]': function(input, val) {
				return val==='' || (parseFloat(val) >= parseFloat(input.attr("min"))) ? true : false;
			},
			'[pattern]': function(input, val) {
				return val === '' || new RegExp("^" + input.attr("pattern") + "$").test(val);
			}
		},

		// Validate one input
		validateInput: function(input) {
			var self = this,
				status = true;

			input = $(input);

			$.each(this.filters, function(key, fn) {
				if(input.is(key)) {
					if(!fn.call(self, input, input.val())) {
						self.bindInput(input);
						status = self.callInputError(key, input);
						return false;
					}
				}
			});
			return status;
		},

		// Bind input to recheck value on change
		bindInput: function(input) {
			var self = this;
			// Remove all to prevent multiple binds
			this.unBindInput(input);
			// Bind all possible events and debounce them
			input.on('keyup.valider-input change.valider-input click.valider-input', _.debounce(function(event) {
				var check = self.validateInput(input);
				if(self.validateInput(input) === true) {
					delete self.incorrectInputs[input.attr('name')];
					self.callInputPass(input);
					self.unBindInput(input);
				} else {
					// Save error name
					self.incorrectInputs[input.attr('name')] = check;
				}
			}, 200));
		},
		// Unbind input to re-check value on change
		unBindInput: function(input) {
			input.off('.valider-input');
		},

		// Validate all inputs in form
		validate: function(inputs, event) {
			var self = this,
				isError = false;

			inputs.each(function() {
				var input = $(this),
					name = input.attr('name'),
					check = self.validateInput(input);
				if(check !== true) {
					// Save error name
					self.incorrectInputs[name] = check;
					isError = true;
				} else if(self.incorrectInputs[name]) {
					delete self.incorrectInputs[name];
					self.callInputPass(input);
					self.unBindInput(input);
				}
			});

			// If some input has error, prevent submit
			if(isError) {
				this.config.onErrors.call(null, this.incorrectInputs);
				event.preventDefault();
			}
		}

	};

	// jQuery Plugin
	$.fn.Valider = function(conf) {
		return this.each(function() {
			var form = $(this);
			form.data('valider', new Valider(form, conf));
		});
	};

})(window.jQuery);