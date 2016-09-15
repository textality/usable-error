'use strict';

module.exports = customError;

var log = console.log.bind(console);

function customError(name, opts) {
    /**
     * Create a custom error class.
     *
     * @param {string} name - The name of error class.
     * @param {Object} [opts] - Addintional options for create error class.
     * @param {function} [opts.parent] - The parent error constructor, that will be inherits.
     * @param {string[]} [opts.props] - Additional properties, that will be added to
     *                                   custom error class.
     * @param {string} [opts.defaultMsg] - Default message.
     *
     * @returns {function} Custom error objects constructor
     * @throws {Error} name must be a non-empty string!
     * @throws {Error} opts must be a object!
     */

    checkArgs(arguments);
    if (opts) {
        var parent = opts.parent;
        var props = opts.props;
        var defaultMsg = opts.defaultMsg;
        checkOpts(parent, defaultMsg, props, opts);
    }
    if (props) {
        checkProps(props);
    }

    function _Error() {
        if (!(this instanceof _Error)) {
            var args = [null];
            for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
            return new (_Error.bind.apply(_Error, args));
        }
        var opts = parseArgs(arguments, props, defaultMsg);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, opts.stackStartFunction || _Error);
        } else {
            this.stack = (new Error()).stack;
        }
        setErrorProperties(this, opts);
    }
    var fn = (new Function('props', 'parseArgs', 'defaultMsg', 'setErrorProperties',
                'return ' + _Error.toString().split('_Error').join(name)));
    _Error = fn(props, parseArgs, defaultMsg, setErrorProperties);
    if (parent) {
        if (typeof parent == 'function') {
            _Error.prototype = Object.create(parent.prototype);
        } else {
            _Error.prototype = Object.create(parent);
        }
    } else {
        _Error.prototype = Object.create(Error.prototype);
    }
    _Error.prototype.name = name;
    _Error.prototype.constructor = _Error;
    return _Error;
}

function checkArgs(argsObj) {
    if (argsObj.length > 2) throw new Error('customError: Too many arguments!');
    var name = argsObj[0];
    var opts = argsObj[1];
    if (!name || typeof name != 'string') throw new Error(
            'customError: name must be a non-empty string!');
    if (opts !== undefined && typeof opts != 'object')
        throw new Error('customError: opts must be a object!');
}

function checkOpts(parent, defaultMsg, props, opts) {
    if (Object.keys(opts).length == 0)
        throw new Error('customError: opts must be a non-empty object!');
    var optsKeys = {'parent': null, 'defaultMsg': null, 'props': null};
    Object.keys(opts).forEach(function(k) {
        if (!optsKeys.hasOwnProperty(k))
            throw new Error('customError: unknown option "' + k + '"');
    });
    if (parent !== undefined &&  !(parent instanceof Error))
        throw new Error('customError: opts.parent must be inherits Error.prototype!');
    if (defaultMsg != undefined && !defaultMsg && typeof defaultMsg != 'string')
        throw new Error('customError: opts.defaultMsg if present, must be a non-empty string!');
    if (props !== undefined && (!Array.isArray(props)))
        throw new Error('customError: opts.props must be a array!');
}

function checkProps(props) {
    if (props.length == 0)
        throw new Error('customError: properties list must be a non-empty array');
    props.forEach(function(p) {
        if (!p || typeof p != 'string')
            throw new Error('customError: Each property name in opts.props, ' +
                    'must be a non-empty string!');
        if (p == 'stackStartFunction')
            throw new Error('customError: "stackStartFunction" is reserved property name!');
        if (p == 'message')
            throw new Error('customError: "message" is reserved property name!');
        if (p == 'stack')
            throw new Error('customError: "stack" is reserved property name!');
    });
}

function setErrorProperties(obj, opts) {
    var keys = Object.getOwnPropertyNames(opts);
    keys.forEach(function(k) {
        if (k == 'stackStartFunction') return;
        obj[k] = opts[k];
    });
}

function oneOpts(scope) {
    // _Error(opts)
    scope.opts = {};
    if (scope.alen == 1 && scope._isOpts(scope.args[0])) {
        scope.opts = scope.args[0];
        return true;
    }
}

function msgAndOpts(scope) {
    // _Error(msg, opts)
    scope.opts = {};
    if (scope.alen == 2 && typeof scope.args[0] == 'string' &&
            scope._isOpts(scope.args[1])) {
        scope.opts = scope.args[1];
        if (scope.opts.message) {
            throw new Error('Redundant argument: message');
        } else {
            scope.opts.message = scope.args[0];
        }
        return true;
    }
}

function optsAndStackStartFn(scope) {
    // _Error(opts, stackStartFn)
    scope.opts = {};
    if (scope.alen == 2 && scope._isOpts(scope.args[0]) && typeof scope.args[1] == 'function') {
        scope.opts = scope.args[0];
        if (scope.opts.stackStartFunction) {
            throw new Error('Redundant argument: stackStartFunction');
        } else {
            scope.opts.stackStartFunction = scope.args[1];
        }
        return true;
    }
}

function msgAndOptsAndStackStartFn(scope) {
    // _Error(msg, opts, stackStartFn);
    scope.opts = {};
    if (scope.alen == 3 && typeof scope.args[0] == 'string' &&
            scope._isOpts(scope.args[1]) &&
            typeof scope.args[2] == 'function') {
        scope.opts = scope.args[1];
        if (scope.opts.message) {
            throw new Error('Redundant argument: message');
        } else {
            scope.opts.message = scope.args[0];
        }
        if (scope.opts.stackStartFunction) {
            throw new Error('Redundant argument: stackStartFunction');
        } else {
            scope.opts.stackStartFunction = scope.args[2];
        }
        return true;
    }
}

function onlyProps(scope) {
    // _Error(p1, p2)
    scope.opts = {};
    if (scope.alen == scope.plen) {
        scope.opts = scope.optsFromArgs(scope.props, scope.args);
        return true;
    }
}

function propsAndMsgOrStackStartFn(scope) {
    // _Error(msg, p1, p2), _Error(p1, p2, stackStartFn)
    scope.opts = {};
    if (scope.alen - scope.plen == 1) {
        if (typeof scope.args[scope.alen-1] == 'function') {
            var stackStartFunction = scope.args.pop();
        } else if(typeof scope.args[0] == 'string') {
            var message = scope.args.shift();
        } else {
            throw new Error('Invalid type of message or ' +
                    'stackStartFunction argument!');
        }
        scope.opts = scope.optsFromArgs(scope.props, scope.args);
        if (message) scope.opts.message = message;
        if (stackStartFunction) scope.opts.stackStartFunction = stackStartFunction;
        return true;
    }
}

function propsAndMsgAndStackStartFn(scope) {
    // _Error(msg, p1, p2, stackStartFn)
    scope.opts = {};
    if (scope.alen - scope.plen == 2) {
        if (typeof scope.args[0] == 'string' && typeof scope.args[scope.alen-1] == 'function') {
            var message = scope.args.shift();
            var stackStartFunction = scope.args.pop();
        } else {
            throw new Error('Invalid type of message and ' +
                    'stackStartFunction agruments!');
        }
        scope.opts = scope.optsFromArgs(scope.props, scope.args);
        if (message) scope.opts.message = message;
        if (stackStartFunction) scope.opts.stackStartFunction = stackStartFunction;
        return true;
    }
}

function msgOrStackStartFn(scope) {
    // _Error(msg), _Error(stackStartFn)
    scope.opts = {};
    if (scope.alen == 1) {
        if (typeof scope.args[0] == 'string') {
            scope.opts.message = scope.args[0];
        } else if (typeof scope.args[0] == 'function') {
            scope.opts.stackStartFunction = scope.args[0];
        } else {
            throw new Error('Argument must be a message or stackStartFunction!')
        }
        return true;
    }
}

function msgAndStackStartFn(scope) {
    // _Error(msg, stackStartFn)
    scope.opts = {};
    if (scope.alen == 2) {
        if (typeof scope.args[0] == 'string') {
            scope.opts.message = scope.args[0];
        } else {
            throw new Error('message must be a string!')
        }
        if (typeof scope.args[1] == 'function') {
            scope.opts.stackStartFunction = scope.args[1];
        } else {
            throw new Error('stackStartFunction must be a function!');
        }
        return true;
    }
}

function isOpts(props, options) {
    if (!Array.isArray(props) || props.length == 0)
        throw new Error('props must be a non-empty array!');
    if (typeof options != 'object') return false;
    if (props.every(function (p) {return options.hasOwnProperty(p);})) {
        var keys = [];
        Object.keys(options).forEach(function(k) {
            if (k != 'message' && k != 'stackStartFunction') keys.push(k);
        });
        if (keys.length === props.length) return true;
    } else {
        return false;
    }
}

function optsFromArgs(props, args) {
    if (!Array.isArray(props) || props.length == 0)
        throw new Error('props must be a non-empty array!');
    if (typeof args != 'object' || !('length' in args))
        throw new Error('args must be array or arguments object!');
    if (props.length != args.length)
        throw new Error('Argument list does not match to predefined ' +
                'properties of error object!');
    var opts = {};
    for (var i = 0; i < props.length; i++) {
        opts[props[i]] = args[i];
    }
    return opts;
}

function parseArgs(argsObj, props, defaultMsg) {
    if (props !== undefined && !Array.isArray(props))
        throw new Error('Props must be an array or undefined!');
    if (props && props.length == 0)
        throw new Error('Props must be a non-empty array!');
    var scope = {};
    scope.optsFromArgs = optsFromArgs;
    scope._isOpts = isOpts.bind(null, props);
    scope.props = props;
    scope.args = [];
    for (var i = 0; i < argsObj.length; i++) {
        scope.args.push(argsObj[i]);
    }
    scope.alen = scope.args.length;
    scope.plen = scope.props ? scope.props.length : undefined;
    // Predefined properties case
    if (scope.props) {
        // _Error();
        if (scope.alen == 0) {
            throw new Error('Missing required arguments!\n' +
                    'Predefined error object properties: "' + scope.props + '"');
        // _Error(opts)
        } else if (oneOpts(scope)) {
            ;
        // _Error(msg, opts)
        } else if (msgAndOpts(scope)) {
            ;
        // _Error(opts, stackStartFn)
        } else if (optsAndStackStartFn(scope)) {
            ;
        // _Error(msg, opts, stackStartFn);
        } else if (msgAndOptsAndStackStartFn(scope)) {
            ;
        // _Error(p1, p2)
        } else if (onlyProps(scope)) {
            ;
        // _Error(msg, p1, p2), _Error(p1, p2, stackStartFn)
        } else if (propsAndMsgOrStackStartFn(scope)) {
            ;
        // _Error(msg, p1, p2, stackStartFn)
        } else if (propsAndMsgAndStackStartFn(scope)) {
            ;
        // _Error(msg, p1, p2, stackStartFn, a)
        } else if (scope.alen - scope.plen > 2) {
            throw new Error('Too many arguments!');
        // props=['p1', 'p2'] _Error(p1)
        } else if (scope.alen - scope.plen < 0) {
            throw new Error('Missing required error properies!\n' +
                    'Required properties: ' + scope.props);
        // Logical error in check arguments algorithm
        } else {
            throw new Error('Arguments check internal error!');
        }
    // Without predefined properties case
    } else {
        // _Error()
        if (scope.alen == 0) {
            scope.opts = {};
        // _Error(msg), _Error(stackStartFn)
        } else if (msgOrStackStartFn(scope)) {
            ;
        // _Error(msg, stackStartFn)
        } else if (msgAndStackStartFn(scope)) {
            ;
        } else {
            throw new Error('Too many arguments!');
        }
    }
    if (!scope.opts.message && defaultMsg) scope.opts.message = defaultMsg;
    return scope.opts;
}
