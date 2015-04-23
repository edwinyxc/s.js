function Promise(fn) {
    var state = 'pending';
    var value;
    var deferred = null;

    function resolve( new_value ) {
        try {
            //duck type check
            if( new_value && typeof new_value.then === 'function') {
                new_value.then( resolve, reject );
                return;
            }

            state = 'resolved';
            value = new_value;

            if(deferred) {
                handle(deferred);
            }
        } catch ( e ) {
            reject(e)
        }
    }

    function reject( reason ) {
        state = 'rejected';
        value = reason;

        if(deferred) {
            handle(deferred);
        }
    }

    function handle( handler ) {
        if(state === 'pending') {
            deferred = handler;
            return;
        }
        
        var next_tick = function(){
            var handler_cb;
            
            if(state === 'resolved') {
                handler_cb = handler.on_resolved;
            } else {
                handler_cb = handler.on_rejected;
            }

            if(!handler_cb){
                if(state === 'resolved') {
                    handler.resolve(value);
                } else {
                    handler.reject(value);
                }

                return;
            }

            var ret;
            try {
                ret  = handler_cb(value);
            } catch (e) {
                handler.reject(e);
                return;
            }

            handler.resolve(ret);
        }

        // for node-js
        if(setImmediate && typeof setImmediate === 'function') {
            setImmediate(next_tick);
        } else if(process && process.nextTick 
           && typeof process.nextTick === 'function') {
            process.nextTick(next_tick);
        } else {
            // fail-back
            setTimeout(next_tick,1);
        }
        
    }

    this.then = function( on_resolved, on_rejected ) {
        return new Promise( function( resolve, reject ) {
            handle({
                on_resolved: on_resolved,
                on_rejected: on_rejected,
                resolve: resolve,
                reject: reject,
            });
        });
    };

    this.catch = this.then.bind(this,undefined);

    fn(resolve, reject);
}

Promise.resolve = function (fn) {
    return new Promise( function( on_resolve ) {
        on_resolve(fn);
    });
}

Promise.all = function () {
    var promises = (Array.prototype.slice.call(arguments)
        || [] ).filter( function (_) {
        return  _ instanceof Promise
    });
    

    return new Promise( function ( on_resolve, on_rejected ) {

        //var _promises = [];
        var _states = [];
        for(var i = 0; i < promises.length; i++) {
                _states.push({
                    index : i,
                    status : 'pending',
                    result : undefined
                })
                var finish = check(i);

                promises[i].then(finish.on_resolved,
                                 finish.on_rejected)
                           .then(check_all_done);
                //_promises.push(promises[i]);
        }
        
        function is_all_done() {
            return  ! _states.some( function (_) {
                return _.status === 'pending'
            })
        }

        function check_all_done() {
            //console.log('debug-promise','check-all-done', is_all_done())
            //console.log('debug-promise','check-all-done', _states);
            if( is_all_done()) {
                on_resolve(_states)
            }
        }

        function check(i) {
            return {
                on_resolved: function (result) {
                    //console.log('debug-promise','on_reslov', result);
                    _states[i].status = 'resolved';
                    _states[i].result = result;
                },
                on_rejected: function (error) {
                    //console.log('debug-promise','on_rejected', error);
                    _states[i].status = 'rejected';
                    _states[i].result = err;
                }
            }
        }
    });
}

// Promise.any()

module.exports = Promise;
