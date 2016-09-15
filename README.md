# usable-error
Create custom error

### install
*npm install usable-error*

### update
*npm update usable-error*

### uninstall
*npm uninstall usable-error*

```javascript
var customError = require('usable-error');

var MyError = customError('MyError');

var err = new MyError('error message');
err.name; // 'MyError'
err.message; // 'error message'
err.constructor; // [Function: MyError]
err.constructor.name; // 'MyError'
err instanceof ParentError; // true
err instanceof Error; // true

throw new MyError(); // Throws error without message

throw new MyError('error message'); // Throws error with message

// Throws error with message and stack trace will be truncated until(inclusive) stackStartFunction
throw new MyError('error message', stackStartFunction);

throw new MyError(stackStartFunction); // Throws error without message, stack trace will be truncated


var MyError = customError('MyError', {defaultMsg: 'default error message'});


throw new MyError(); // Throws error, with default message

throw new MyError('error message'); // Throws error with custom message

// Throws error with default message and stack trace will be truncated until(inclusive) stackStartFunction
throw new MyError(stackStartFunction);

// Throws error with custom message, stack trace will be truncated 
throw new MyError('error message', stackStartFunction);


// Custom error class that inherits ParentError with default message and predefined properties
var MyError = customError('MyError', {defaultMsg: 'default error message',
                                      parent: ParentError,
                                      props: ['prop1', 'prop2']});

var err = new MyError('prop1_value', 'prop2_value');
err.message; // 'default error message'
err.prop1; // 'prop1_value'
err.prop2; // 'prop2_value'

/* Throws error with custom message, predefined properties and stack trace will be truncated
until(inclusive) stackStartFunction */
throw new MyError('error message', 'prop1_value', 'prop2_value', stackStartFunction);

throw new MyError({message: 'error message',
                   prop1: 'prop1_value',
                   prop2: 'prop2_value',
                   stackStartFunction: stackStartFunction});

throw new MyError('error message', {prop1: 'prop1_value', prop2: 'prop2_value'},
                  stackStartFunction);

// Custom error class with predefined error object properties               
var MyError = customError('MyError', {props: ['prop1', 'prop2']});

// Throws error without message and values of required properties
throw new MyError('prop1_value', 'prop2_value')

// Throws error with message and values of required properties
throw new MyError('error message', 'prop1_value', 'prop2_value')
```

### license
MIT
