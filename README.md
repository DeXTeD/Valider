# Valider
Client-side Form Validation with HTML5.

## Example
```js
$('form').Valider({
	onErrors: function(errors) {
		// Do something with errors object - (input name: error)
	},
	onInputError: function(error) {
		// input with error
		// this = jquery input object
		// You can eg. add error class
	},
	onInputPass: function() {
		// input which was an error
		// this = jquery input object
		// You must clean input
	}
});
```

### Configuration

Regular expression:
```js
$.Valider
	.addRegex('binary', /^[01]+$/)
	.addLang({
		'en': {
			'regex:binary': 'Invalid binary code'
		},
		'pl': {
			'regex:binary': 'Niepoprawny kod binarny'
		},
		'de' {
			'regex:binary': 'Ungültig Binärcode'
		}
	});
```
```html
<input type="text" name="code" data-regex="binary">
```

Custom filter:
```js
$.Valider.addFilter('[data-not]', function(input, val) {
	return $.inArray(val, input.data('not').split(','));
});
```
```html
<input type="text" name="user" data-not="admin,root">
```

## License
Valider is open-sourced software licensed under the MIT License.

## Changelog

### 0.4
- dodawania własnych filtrów (`$.Valider.addFilter`)
- dodawanie wyrażeń regularnych (`$.Valider.addRegex`) i ich komunikatów (`regex:nazwa`)
- Parę drobnych poprawek

### 0.3
- Usunięto Lo-dash
- Dodano wymuszenie typu inputa za pomocą data-type
- Dodana walidacja URLi
- Strict mode
- Lepszy data-equals

### 0.2
- Porównanie dwóch inputów (data-equals)
- Tłumaczenie na angielski

### 0.1
- Initial release