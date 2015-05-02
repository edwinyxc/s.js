(function() {
    var log_level = ['err', 'warn', 'info', 'debug'];
    /**
     * ['err','warn','info','debug']
     */
    var _log_level = 'warn';

    //consts
    // VERSION
    var version = '0.0.2';

    var __slice = Array.prototype.slice;

    var __undefined = void 0;

    //helper function: make arguments as array
    var _array = function(_args) {
        return __slice.call(_args);
    }

    var install_Promise_on_need = function() {
        if (!(root.Promise) || typeof root.Promise !== 'function') {
            root.Promise = Promise;
        }
    }


    var __DO_NOTHING = function() {}

    /***************** PREDICATES ************/

    function isObject(obj) {
        return typeof obj === 'object'
    }

    function isEmpty(obj) {
        var type = typeof obj;
        switch (type) {
            case 'undefined':
                return true;
            case 'string':
                return obj.length === 0;
            case 'number':
                return obj === 0;
            case 'object':
                return Array.isArray(obj) ? (obj.length === 0) : (pairs(obj).length === 0)
            case 'function':
                return false;
            default:
                return true;
        }
    }

    function isNull(obj) {
        return null == obj;
    }

    /***************** BASIC *****************/

    function negate(fn) {
        return function() {
            return !fn.apply(null, arguments);
        }
    }

    function extend() {
        if (arguments.length < 1)
            throw 'extend err: arguments.length < 1';

        var target = Object(arguments[0]);

        if (typeof target === 'undefined' || target == null)
            throw new TypeError('extend err: args[0] == null');

        var len = arguments.length;
        for (var i = len - 1; i >= 1; i--) {
            if (arguments[i] === __undefined) continue;

            pairs(arguments[i]).forEach(function(kv) {
                var key = kv[0],
                    value = kv[1]
                if (typeof kv[1] === 'object') {
                    target[key] = extend({}, target[key], value);
                } else {
                    target[key] = value;
                }
            });
        }
        return target;
    }

    function pairs(obj, useNameValue) {
        obj = obj || {};
        var pairs = [];
        for (var index in obj) {
            if (obj.hasOwnProperty(index)) {
                pairs.push(useNameValue ? {
                    name: index,
                    value: obj[index]
                } : [index, obj[index]])
            }
        }
        return pairs;
    }

    function tap(obj, interceptor) {
        interceptor(obj);
        return obj;
    }

    function _log(level) {
        var target_level = log_level.indexOf(level);

        if (target_level === -1 ||
            target_level <= log_level.indexOf(_log_level)) {

            return console.log.bind(console, level);
        }

        return __DO_NOTHING;
    }


    //find root object
    var root = (function() {
        if (typeof window !== 'undefined') {
            _log('info')('using: window');
            return window;

        } else if (typeof global !== 'undefined') {
            _log('info')('using: global');
            return global;
        } else {
            var err = 'no global found, fail';
            _log('err')(err);
            throw new Error(err);
        }
    })();

    //install S namespace
    //root.S = S;

    var install = function() {
        function _for(o, fn) {
            for (var i in o) {
                if (o.hasOwnProperty(i)) {
                    fn(o[i], i);
                }
            }
        }

        function install(global, addons, _name) {
            _for(addons, function(addon, name) {

                if (typeof global[name] !== 'function') {
                    if (!global.hasOwnProperty(name)) {
                        global[name] = addon;
                        _log('info')('Install', name, 'to', _name);
                    }
                } else {
                    _log('warn')(_name + '.' + name + ' exists, uninstalled');
                }

            });
        }

        function assign_generic(global, methods) {
            methods.forEach(function(methodName) {
                if (!global.hasOwnProperty(methodName)) {
                    var method = global.prototype[methodName];
                    _log('debug')('Generalized', methodName);
                    if (typeof method === 'function') {
                        /*
                        global[methodName] = function() {
                            var arg = __slice.call(arguments);
                            console.log('arg',arg)
                            console.log('method', method)
                            return method.apply(arg[0],arg.splice(1));
                        }
                        */
                        global[methodName] = Function.call.bind(method);
                        /*global[methodName] = function() {
                            //return method.call.apply(method, arguments);
                        };*/
                    }
                }
            });
        }

        install(Object, Object_statics, 'Object');
        install(Object.prototype, Object_addons, 'Object.prototype');

        install(Array, Array_statics, 'Array');
        install(Array.prototype, Array_addons, 'Array.prototype');

        assign_generic(Array, ['join', 'reverse', 'sort', 'push', 'pop', 'shift', 'unshift',
            'splice', 'concat', 'slice', 'indexOf', 'lastIndexOf',
            'forEach', 'map', 'reduce', 'reduceRight', 'filter',
            'some', 'every',
            'find', 'findIndex', 'compact', 'densify', 'where', 'exclude', 'isEmpty'
        ]);

        install(Function, Function_statics, 'Function');
        install(Function.prototype, Function_addons, 'Function.prototype');

        install_Promise_on_need();
    }


    var Object_addons = {

        extend: function() {
            return extend.apply(this, [this].concat(__slice.call(arguments)));
        },

        pairs: function() {
            return pairs.apply(this,[this].concat(__slice.call(arguments)));
        },

        create: function() {
            var F = function F() {};
            F.prototype = this;
            return new F();
        },

        tap: function(interceptor) {
            interceptor(this);
            return this;
        },

        getOrCreate: function(name, obj) {
            if (this.hasOwnProperty(name)) {
                return this[name];
            } else {
                this[name] = obj;
                return obj;
            }
        },

        getOrDefault: function(name, obj) {
            var ret;
            if (this.hasOwnProperty(name) && !isNull(ret = this[name])) {
                return ret;
            } else {
                return obj;
            }
        }

    };

    var Object_statics = {
        isEmpty: isEmpty,
        isNull: isNull,
        notNull: negate(isNull),
        notEmpty: negate(isEmpty),
        extend: extend,
        pairs: pairs,
        create: Function.call.bind(Object_addons.create),
        tap: Function.call.bind(Object_addons.tap)
    };

    var Function_addons = {

        compose: function() {
            var args = arguments;
            var tail = args.length - 1;
            var fn = this;
            return function() {
                var i = tail;
                var result = args[tail].apply(this, arguments);
                while (i--) result = args[i].call(this, result);
                return fn.call(this, result);
            };
        },

        wrap: function(wrapper) {
            return Function_statics.partial(wrapper, this);
        },

        once: function() {
            var fn = this;
            var memo;
            var called = false;

            return function() {
                if (!called) {
                    memo = fn.apply(this, arguments);
                    called = true;
                }
                return memo;
            }
        },

        method: function(name, func) {
            if (!this.prototype[name]) {
                this.prototype[name] = func;
            } else {
                _log('warn')('method failure: ' + name + 'exists.')
            }
            return this;
        },

        curry: function(n) {
            var fn = this;
            n = n || fn.length;

            function get_curried_fn(prev) {
                return function() {
                    // Concat the all just-specified argument with the array of
                    // previously-specified arguments.
                    var args = (prev || [])
                        .concat(__slice.call(arguments, 0));

                    // Not all arguments have been satisfied yet,
                    // so return a curried version of the original function.
                    if (args.length < n) return get_curried_fn(args);

                    // Otherwise, invoke the original function with
                    // the arguments and return its value.
                    else return fn.apply(this, args)
                }
            }

            return get_curried_fn();
        },

        partial: (function() {
            function partialAny( /*, args...*/ ) {
                var fn = this;

                var orig = __slice.call(arguments, 0);

                return function() {
                    var partial = __slice.call(arguments, 0);
                    var args = [];
                    for (var i = 0; i < orig.length; i++) {
                        args[i] = orig[i] === partialAny._ ? partial.shift() : orig[i];
                    }
                    return fn.apply(this, args.concat(partial));
                };
            }

            // This is used as the placeholder argument.
            partialAny._ = {};

            return partialAny;
        }()),

        negate: function() {
            var fn = this;
            return function() {
                return !fn.apply(null, arguments);
            }
        }

    };

    var Function_statics = {

        compose: Function.call.bind(Function_addons.compose),

        partial: tap(Function.call.bind(Function_addons.partial), function(partial) {
            partial._ = Function_addons.partial._;
        }),

        curry: Function.call.bind(Function_addons.curry),

        negate: Function.call.bind(Function_addons.negate),

        trampoline: function(fn) {
            while (fn && typeof(fn) === 'function') fn = fn();
        },

        once: Function.call.bind(Function_addons.once),

        wrap: Function.call.bind(Function_addons.wrap),

        noop: function() {}

    }

    var Array_addons = {

        isEmpty: function() {
            return root === this || isNull(this) || this.length === 0
        },

        partition: function(filterFn) {
            var _true = [],
                _false = [];
            for (var i = 0, len = this.length; i < len; i++) {
                if (filterFn(this[i], i)) _true.push(this[i]);
                else _false.push(this[i]);
            }
            return [_true, _false];
        },

        update: function(index, newVal) {
            return tap(this, function(arr) {
                arr[index] = newVal
            });
        },

        reductions: function(reduceFunc, inital) {
            acc = [];
            this.reduce(Function_statics.wrap(reduceFunc, function(fn) {
                return tap(fn.apply(this, __slice.call(arguments, 1)), function(ret) {
                    acc.push(ret);
                });
            }), inital);
            return acc;
        },

        exclude: function() {
            var arr = this;
            var args = __slice.call(arguments);
            return arr.filter(function(elem) {
                return !args.reduce(function(result, arg) {
                    return result || arg === elem
                }, false)
            })
        },

        indexWhere: function(o) {

            function checkKV(k, v) {
                return function(o) {
                    return o[k] && o[k] == v
                }

            }

            var checkers = pairs(o).map(function(_) {
                return checkKV(_[0], _[1])
            })

            return this.filter(function(_) {
                return checkers.reduce(function(result, checker) {
                    return result && checker(_);
                }, true)
            }).map(function(_, idx) {
                return idx;
            });
        },

        where: function(o) {

            function checkKV(k, v) {
                return function(o) {
                    return o[k] && o[k] == v
                }

            }

            var checkers = pairs(o).map(function(_) {
                return checkKV(_[0], _[1])
            })

            return this.filter(function(_) {
                return checkers.reduce(function(result, checker) {
                    return result && checker(_);
                }, true);
            });
        },

        first: function() {
            return this.length > 0 ? this[0] : void 0;
        },
        last: function() {
            return this.length > 0 ? this[this.length - 1] : void 0;
        },
        contains: function(o) {
            return this.indexOf(o) !== -1;
        },
        densify: function() {
            return this.filter(function(_) {
                return typeof _ !== 'undefined';
            });
        },
        compact: function() {
            return this.filter(function(_) {
                return (!!_);
            });
        },
        find: function(predicate) {
            if (this == null) {
                throw new TypeError('Array.prototype.find called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;

            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return value;
                }
            }
            return undefined;
        },

        findIndex: function(predicate) {
            if (this == null) {
                throw new TypeError('Array.prototype.findIndex called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;

            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return i;
                }
            }
            return -1;
        },

        pluck: function(name) {
            return this.filter(isObject).map(function(_) {
                return _['name'];
            })
        }
    };
    var Array_statics = {
        from: (function() {
            var toStr = Object.prototype.toString;
            var isCallable = function(fn) {
                return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
            };
            var toInteger = function(value) {
                var number = Number(value);
                if (isNaN(number)) {
                    return 0;
                }
                if (number === 0 || !isFinite(number)) {
                    return number;
                }
                return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
            };
            var maxSafeInteger = Math.pow(2, 53) - 1;
            var toLength = function(value) {
                var len = toInteger(value);
                return Math.min(Math.max(len, 0), maxSafeInteger);
            };

            // The length property of the from method is 1.
            return function from(arrayLike /*, mapFn, thisArg */ ) {
                // 1. Let C be the this value.
                var C = this;

                // 2. Let items be ToObject(arrayLike).
                var items = Object(arrayLike);

                // 3. ReturnIfAbrupt(items).
                if (arrayLike == null) {
                    throw new TypeError("Array.from requires an array-like object - not null or undefined");
                }

                // 4. If mapfn is undefined, then let mapping be false.
                var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
                var T;
                if (typeof mapFn !== 'undefined') {
                    // 5. else      
                    // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
                    if (!isCallable(mapFn)) {
                        throw new TypeError('Array.from: when provided, the second argument must be a function');
                    }

                    // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
                    if (arguments.length > 2) {
                        T = arguments[2];
                    }
                }

                // 10. Let lenValue be Get(items, "length").
                // 11. Let len be ToLength(lenValue).
                var len = toLength(items.length);

                // 13. If IsConstructor(C) is true, then
                // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
                // 14. a. Else, Let A be ArrayCreate(len).
                var A = isCallable(C) ? Object(new C(len)) : new Array(len);

                // 16. Let k be 0.
                var k = 0;
                // 17. Repeat, while k < len… (also steps a - h)
                var kValue;
                while (k < len) {
                    kValue = items[k];
                    if (mapFn) {
                        A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                    } else {
                        A[k] = kValue;
                    }
                    k += 1;
                }
                // 18. Let putStatus be Put(A, "length", len, true).
                A.length = len;
                // 20. Return A.
                return A;
            };
        }()),

        of: function() {
            return __slice.call(arguments);
        },

        dim: function(len, initial) {
            var a = [],
                i;
            for (i = 0; i < len; i++) {
                a[i] = initial
            }
            return a;
        },

        matrix: function(m, n, initial) {
            var a, i, j, ma = [];
            for (i = 0; i < m; i++) {
                a = [];
                for (j = 0; j < n; j++) {
                    a[j] = initial;
                }
                ma[i] = a;
            }
            return ma;
        }

    };




    /***************** PROMISE ***************/

    function Promise(fn) {
        var state = 'pending';
        var value;
        var deferred = null;

        function resolve(new_value) {
            try {
                //duck type check
                if (new_value && typeof new_value.then === 'function') {
                    new_value.then(resolve, reject);
                    return;
                }

                state = 'resolved';
                value = new_value;

                if (deferred) {
                    handle(deferred);
                }
            } catch (e) {
                reject(e)
            }
        }

        function reject(reason) {
            state = 'rejected';
            value = reason;

            if (deferred) {
                handle(deferred);
            }
        }

        function handle(handler) {
            if (state === 'pending') {
                deferred = handler;
                return;
            }

            var next_tick = function() {
                var handler_cb;

                if (state === 'resolved') {
                    handler_cb = handler.on_resolved;
                } else {
                    handler_cb = handler.on_rejected;
                }

                if (!handler_cb) {
                    if (state === 'resolved') {
                        handler.resolve(value);
                    } else {
                        handler.reject(value);
                    }

                    return;
                }

                var ret;
                try {
                    ret = handler_cb(value);
                } catch (e) {
                    handler.reject(e);
                    return;
                }

                handler.resolve(ret);
            }

            // for node-js
            if (setImmediate && typeof setImmediate === 'function') {
                setImmediate(next_tick);
            } else if (process && process.nextTick && typeof process.nextTick === 'function') {
                process.nextTick(next_tick);
            } else {
                // fail-back
                setTimeout(next_tick, 1);
            }

        }

        this.then = function(on_resolved, on_rejected) {
            return new Promise(function(resolve, reject) {

                handle({
                    on_resolved: on_resolved,
                    on_rejected: on_rejected,
                    resolve: resolve,
                    reject: reject
                });
            });
        };

        this.catch = this.then.bind(this, undefined);

        fn(resolve, reject);
    }


    Promise.resolve = function(fn) {
        return new Promise(function(on_resolve) {
            on_resolve(fn);
        });
    };

    Promise.all = function() {
        var promises = (_array(arguments) || [])
            .reduce(function(acc, _) {
                if (_ instanceof Promise) {
                    acc.push(_);
                } else if (_is_array(_)) {
                    _.forEach(acc.push);
                }

                return acc;
            }, []);

        console.log('debug-all', promises);

        return new Promise(function(on_resolve, on_rejected) {

            //var _promises = [];
            var _states = [];
            for (var i = 0; i < promises.length; i++) {
                _states.push({
                    index: i,
                    status: 'pending',
                    result: undefined
                })
                var finish = check(i);

                promises[i].then(finish.on_resolved,
                        finish.on_rejected)
                    .then(check_all_done);
                //_promises.push(promises[i]);
            }

            function is_all_done() {
                return !_states.some(function(_) {
                    return _.status === 'pending'
                })
            }

            function check_all_done() {
                if (is_all_done()) {
                    on_resolve(_states)
                }
            }

            function check(i) {
                return {
                    on_resolved: function(result) {
                        //console.log('debug-promise','on_reslov', result);
                        _states[i].status = 'resolved';
                        _states[i].result = result;
                    },
                    on_rejected: function(error) {
                        //console.log('debug-promise','on_rejected', error);
                        _states[i].status = 'rejected';
                        _states[i].result = err;
                    }
                }
            }
        });
    }

    // Promise.any()
    //END OF PROMISE

    //install the s.js

    install();
}.call(this));
