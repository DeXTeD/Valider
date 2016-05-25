# Valider
Walidator formularzy client-side w HTML5.


## Instalacja
```sh
$ bower install valider
```

## Przykład
Online:
- [Simple](http://9px.pl/Projects/Valider/demos/example.html)
- [Bootstrap](http://9px.pl/Projects/Valider/demos/bootstrap.html)

```js
$('form').Valider({
    onErrors: function(errors) {
        // Tutaj możesz zrobić coś z wszystkimi błędami
        // `errors` jest obiektem w którym kluczem jest nazwa inputa
    },
    onInputError: function(error) {
        // Błąd dla poszczególnego inputa
        // Możesz np. dodać klasę błędu
        this.addClass('error')
        // Oraz umieścić gdzieś komunikat `error`
        var errorTag = this.next();
        if (errorTag.lenght) {
            errorTag.text(error);
        } else {
            errorTag = $('<span/>', {text: error});
            this.after(errorTag);
        }
    },
    onInputPass: function() {
        // Input który miał błąd i użytkownik go poprawił,
        // więc trzeba usunąć klasę
        this.removeClass('error');
        // oraz komunikat
        this.next().remove();
    }
    // Jest tu jeszcze parametr lang np. `lang: 'ru'`
    // ale nie trzeba o nim pamiętać
    // domyślnie jest brany z atrybutu `lang` w tagu <html>
});
```

### Dodatkowa konfiguracja

W łatwy sposób można dodać własne wyrażenie regularne:
```js
$.Valider.addRegex('binary', /^[01]+$/);
```
Teraz wystarczy tylko użyć atrybutu `data-regex` podając wcześniej zdefiniowaną nazwę:
```html
<input type="text" name="code" data-regex="binary">
```

Możemy też tworzyć własne funkcje, które sprawdzą poprawność inputa:
```js
$.Valider.addFilter('[data-not]', function(input, val) {
    return $.inArray(val, input.data('not').split(',')) === -1;
});
```
```html
<input type="text" name="user" data-not="admin,root">
```

Trzeba również pamiętać o komunikatach, tak więc dodajmy dwa do powyższych przykładów:
```js
$.Valider.addLang({
        'pl': {
            'regex:binary': 'Niepoprawny kod binarny',
            '[data-not]': 'Wymyśl jakiś lepszy login'
        },
        'en': {
            'regex:binary': 'Invalid binary code',
            '[data-not]': 'Think of a better login'
        }
    })
```

## License
Valider is open-sourced software licensed under the MIT License.

## Changelog

### 1.2.3
- Fix: Filtrowanie inputów po nazwie może spowodować błędy

### 1.2.2
- Fix: Teraz komunikaty przy `.invalidate(errors)` znikają jak nie podano

### 1.2.0
- Walidacja teraz jest również przy "on change"
- Dodatkowy event dla inputa "validate"

### 1.1.1
- Walidacja email powinna być case insensitive
- Drobne poprawki formatowania

### 1.1.0
- Walidacja zaraz po opuszczeniu pola (blur)
- Nowy filtr `[data-limit]` do ograniczania maksymalnej ilości znaków w polu
- Poprawione przykłady

### 1.0.0
- Więcej przykładów
- Usunięty domyślny alert w przypadku błędu
- Dodatkowy parametr `input` w callbackach błędów

### 0.5.0
- ValiderConfig -> $.Valider

### 0.4.0
- dodawania własnych filtrów (`$.Valider.addFilter`)
- dodawanie wyrażeń regularnych (`$.Valider.addRegex`) i ich komunikatów (`regex:nazwa`)

### 0.3.1
- Parę drobnych poprawek

### 0.3.0
- Usunięto Lo-dash
- Dodano wymuszenie typu inputa za pomocą data-type
- Dodana walidacja URLi
- Strict mode
- Lepszy data-equals

### 0.2.0
- Porównanie dwóch inputów (data-equals)
- Tłumaczenie na angielski

### 0.1.0
- Initial release
