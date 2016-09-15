var test = require('tape');
var customError = require('../index');

function testErrObjBase(t, errObj, errConstructor) {
    t.ok(errObj instanceof Error, 'error instanceof Error');
    t.ok(errObj instanceof errConstructor, 'error instanceof ' + errConstructor.name);
    t.ok(errObj.name = errConstructor.name, 'error name is equal to ' + errConstructor.name + '.name');
    t.ok(errObj.constructor.name = errConstructor.name, 'error constructor name is equal to ' + errConstructor.name + '.name');
    t.ok(errObj.stack && typeof errObj.stack == 'string', 'error stack property is non-empty string');
}

function testErrObj(t, errObj, errConstructor) {
    testErrObjBase(t, errObj, errConstructor);
    t.ok(errObj.message === '', 'error message is empty string');
}

function testErrObjMsg(t, errObj, errConstructor, msg) {
    testErrObjBase(t, errObj, errConstructor);
    t.ok(errObj.message === msg, 'error message is ' + msg);
}

function testErrClassBase(t, errClass) {
    t.throws(errClass.bind(null, 'asd', 'bsd'), /^Error: stackStartFunction must be a function!/,
            'If second argument not a function, throws ..stackStartFunction must be a function');
    t.throws(function() { new errClass('asd', 'bsd'); }, /^Error: stackStartFunction must be a function!/,
            '("new" case)If second argument not a function, throws ..stackStartFunction must be a function');
    t.throws(errClass.bind(null, 'asd', 'bsd', 'csd'), /^Error: Too many arguments/,
            'Too many arguments passed to the function constructor');
    t.throws(function() { new errClass('asd', 'bsd', 'csd'); }, /^Error: Too many arguments/,
            '("new" case)Too many arguments passed to the function constructor');
    t.throws(errClass.bind(null, 1), /^Error: Argument must be a message or stackStartFunction!/,
            'Invalid first argument throws ..Argument must be a message or stackStartFunction');
    t.throws(function() { errClass(1); }, /^Error: Argument must be a message or stackStartFunction!/,
            '("new" case)Invalid first argument throws ..Argument must be a message or stackStartFunction');
    t.throws(errClass.bind(null, 1, 1), /^Error: message must be a string!/,
            'Invalid first argument in two arguments case, throws ..message must be a string!');
    t.throws(function() { errClass(1, 1); }, /^Error: message must be a string!/,
            '("new" case)Invalid first argument in two arguments case, throws ..message must be a string!');
}

test('Test custom error class constructor.', function(t) {
    t.plan(16);
    t.throws(customError, /^Error: customError: name must be a non-empty string!/,
            'Create error class without name throws ..name must be a non-empty string');
    t.throws(customError.bind(null, ''), /^Error: customError: name must be a non-empty string!/,
            'Create error class with empty name throws ..name must be a non-empty string');
    t.throws(customError.bind(null, 3), /^Error: customError: name must be a non-empty string!/,
            'Create error class with non-string name throws ..name must be a non-empty string');
    t.throws(customError.bind(null, 'asd', 'bsd', 'csd'), /^Error: customError: Too many arguments/,
            'Excess arguments throws ..too many arguments');
    t.throws(customError.bind(null, 'asd', 'bsd'), /^Error: customError: opts must be a object!/,
            'Invalid options argument causes of throw ..opts must be a a object');
    t.throws(customError.bind(null, 'asd', {}), /^Error: customError: opts must be a non-empty object/,
            'Empty options argument causes of throw ..opts must be a non-empty object');
    t.throws(customError.bind(null, 'asd', {a: 'asd'}), /^Error: customError: unknown option "a"/,
            'Unknown option causes of throw ..unknown option');
    t.throws(customError.bind(null, 'asd', {parent: 'asd'}),
            /^Error: customError: parent must be a function or object that inherits Error class/,
            'Invalid parent type causes of throw ..parent must be a function or object that inherits Error class');
    t.throws(customError.bind(null, 'asd', {parent: (new Error()), defaultMsg: ''}),
            /^Error: customError: opts.defaultMsg if present, must be a non-empty string/,
            'Invalid default message option causes of throw ..must be a non-empty string');
    t.throws(customError.bind(null, 'asd',
                {parent: (new Error()), defaultMsg: 'asd', props: {}}),
            /^Error: customError: opts.props must be a array!/,
            'Invalid properties type causes of throw ..opts.props must be a array');
    t.throws(customError.bind(null, 'asd',
                {parent: (new Error()), defaultMsg: 'asd', props: []}),
            /^Error: customError: properties list must be a non-empty array/,
            'empty properties list causes of throw ..properties list must be a non-empty array');
    t.throws(customError.bind(null, 'asd',
                {parent: (new Error()), defaultMsg: 'asd', props: ['asd', 3]}),
            /^Error: customError: Each property name in opts.props, must be a non-empty string/,
            'Invalid type of property name of property list causes of ' +
            'throw ..must be a non-empty string');
    t.throws(customError.bind(null, 'asd',
                {parent: (new Error()), defaultMsg: 'asd', props: ['asd', '']}),
            /^Error: customError: Each property name in opts.props, must be a non-empty string/,
            'Empty property name of property list causes of ' +
            'throw ..must be a non-empty string');
    t.throws(customError.bind(null, 'asd',
                {parent: (new Error()), defaultMsg: 'asd', props: ['asd', 'stackStartFunction']}),
            /^Error: customError: "stackStartFunction" is reserved property name/,
            '"stackStartFunction" is reserved property name');
    t.throws(customError.bind(null, 'asd',
                {parent: (new Error()), defaultMsg: 'asd', props: ['asd', 'message']}),
            /^Error: customError: "message" is reserved property name/,
            '"message" is reserved property name');
    t.throws(customError.bind(null, 'asd',
                {parent: (new Error()), defaultMsg: 'asd', props: ['asd', 'stack']}),
            /^Error: customError: "stack" is reserved property name/,
            '"stack" is reserved property name');
});

test('Test custom error class without predefined properties', function(t) {
    var TestError = customError('TestError');
    var err1 = TestError();
    var err2 = new TestError();
    var err3 = TestError('asd');
    var err4 = new TestError('asd');
    t.plan(32);
    testErrObj(t, err1, TestError);
    testErrObj(t, err1, TestError);
    testErrObjMsg(t, err3, TestError, 'asd');
    testErrObjMsg(t, err4, TestError, 'asd');
    testErrClassBase(t, TestError);
});


test('Test custom error class with default message', function(t) {

    function testErrorObjWithProperties(t, err, msg) {
        t.equal(err instanceof Error, true, 'error obj is instance of Error class');
        t.equal(err instanceof TestError, true, 'error obj is instance of TestError class');
        t.equal(err.constructor === TestError2, true, 'test constructor');
        t.equal(err.constructor.name== 'TestError2', true, 'test constructor name');
        t.equal(err.message == msg, true, 'test error message');
        t.equal(err.name == 'TestError2', true, 'test error name');
        t.equal(err.prop1 == 'prop1_val', true, 'test prop1 property');
        t.equal(err.prop2 == 'prop2_val', true, 'test prop2 property'); 
    }
    var TestError = customError('TestError', {defaultMsg: 'default'});
    var TestError2 = customError('TestError2', {defaultMsg: 'default',
        props: ['prop1', 'prop2'], parent: TestError});
    var stackStartFunction = function() {};
    var err1 = new TestError();
    var err2 = new TestError('asd');
    var err3 = new TestError2('error message', 'prop1_val', 'prop2_val', stackStartFunction);
    var err4 = new TestError2('prop1_val', 'prop2_val');
    var err5 = new TestError2('prop1_val', 'prop2_val', stackStartFunction);
    var err6 = new TestError2('error message', {prop1: 'prop1_val', prop2: 'prop2_val'}, stackStartFunction);
    var err7 = new TestError2('error message', {prop1: 'prop1_val', prop2: 'prop2_val'});
    var err8 = new TestError2({message: 'error message', prop1: 'prop1_val', prop2: 'prop2_val'});
    t.plan(70);
    testErrObjMsg(t, err1, TestError, 'default'); 
    testErrObjMsg(t, err2, TestError, 'asd'); 
    testErrClassBase(t, TestError);
    t.throws(TestError2.bind(null, 'asd'), /^Error: Missing required error properies!/,
            'Missing properties throws ..Missing required error properies!');
    t.throws(TestError2.bind(null, 'asd', 'bsd', 'csd', 'fsd'),
            /^Error: Invalid type of message and stackStartFunction agruments!/,
            'test error constructor with too many argument');
    testErrorObjWithProperties(t, err3, 'error message');
    testErrorObjWithProperties(t, err4, 'default');
    testErrorObjWithProperties(t, err5, 'default');
    testErrorObjWithProperties(t, err6, 'error message');
    testErrorObjWithProperties(t, err7, 'error message');
    testErrorObjWithProperties(t, err8, 'error message');

});
