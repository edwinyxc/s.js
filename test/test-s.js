var assert = require('assert');
require('../src/s.js');

var report = S._log('Report:');
S.install();

describe('Object', function() {

    describe('#create -- create objects using the input as prototype',
        function() {
            it('obj.create()', function() {
                var cat = {
                    miao: 'miao'
                };
                var another_cat = cat.create();
                assert.equal(another_cat.miao, 'miao');
            });

            it('Object.create(obj)', function() {
                var cat = {
                    miao: 'miao'
                };
                var another_cat = Object.create(cat);
                assert.equal(another_cat.miao, 'miao');
            })
        });

    describe('#forEach -- using fn(item,index) for iteration',
        function() {
            it('obj.forEach(fn)', function() {
                var o = {
                    a: 'a1',
                    b: 'b2',
                    c: 'c3'
                }
                var out = [];
                var indexs = [];
                o.forEach(function(item, index) {
                    out.push(item);
                    indexs.push(index);
                });

                assert.deepEqual(['a1', 'b2', 'c3'], out);
                assert.deepEqual(['a', 'b', 'c'], indexs);
            });

            it('Object.forEach(fn)', function() {
                var o = {
                    a: 'a1',
                    b: 'b2',
                    c: 'c3'
                }
                var out = [];
                var indexs = [];

                report(Object.forEach);

                Object.forEach(o, function(item, index) {
                    out.push(item);
                    indexs.push(index);
                });

                assert.deepEqual(['a1', 'b2', 'c3'], out);
                assert.deepEqual(['a', 'b', 'c'], indexs);
            });
        })
    describe('#map -- similar to Array#map', function(){

    });

    describe('#tap -- call the interceptor & return itself', function() {
        it('obj.tap(inter)', function() {
            var a = {};
            assert.equal(a.tap(function(_) {
                _.a = 'a';
            }).a, 'a');
        })

        it('Object.tap(obj,inter)', function() {
            var a = {};
            assert.equal(Object.tap(a, function(_) {
                _.a = 'a';
            }).a, 'a');
        })
    })

});

describe('Function', function() {

    describe('#negate -- return a negated version of predicate', function() {

        it('fn.negate()', function() {
            var isArray = Array.isArray;
            console.log(isArray.negate);
            console.log(Function.prototype.negate);
            var isNotArray = isArray.negate();
            console.log(isNotArray);
            assert.equal(isNotArray({}), true);
            assert.equal(isNotArray([]), false);
        });

        it('Function.negate(fn)', function() {
            var isNotArray = Function.negate(Array.isArray);
            console.log(isNotArray);
            assert.equal(isNotArray({}), true);
            assert.equal(isNotArray([]), false);
        })
    });

    describe('#noop -- do nothing', function() {
        it('basic', function() {
            assert.equal(

                Array.filter(Function.noop.toString(), function(_) {
                    return _ !== ' '
                }).join(''),

                'function(){}');
        })
    });

    describe('curry -- curry function', function() {
        it('(fn(){}).curry()', function() {
            var add = function(a, b, c, d, e) {
                return a + b + c + d + e;
            };

            var curryAll = add.curry();
            assert.equal(curryAll(1)(2)(3)(4)(5), 15);
        });

        it('Function.curry(fn)', function() {
            var add = function(a, b, c, d, e) {
                return a + b + c + d + e;
            };

            var curryAll = Function.curry(add);
            assert.equal(curryAll(1)(2)(3)(4)(5), 15);
        });
    });

    describe('#partial -- bind without changing the *this* value', function() {
        it('(fn(){}).partial( _,*,_,_,* )', function() {
            var add = function(a, b, c, d, e) {
                return a + b + c + d + e;
            };

            var _ = add.partial._;

            var p1 = add.partial(_, 1, _, 3, 4);
            assert.equal(p1(2, 3), 13);
        })

        it('Function.partial(fn, _,****)', function() {
            var add = function(a, b, c, d, e) {
                return a + b + c + d + e;
            };
            var _ = Function.partial._;
            var p1 = Function.partial(add, _, _, 1, 3, 4);
            assert.equal(p1(2, 3), 13);
        })
    });

    describe('#once -- function can only be called once', function(){
        it('(fn).once()')
    });

    describe('#wrap -- return a new wrapped function', function(){
        it('(fn).wrap(wrpper)')
    });
    
    describe('#compose -- turn f(), g(), h() into f(g(h()))', function(){
        it('Function.compose(fn,......)')
        it('fn.compose(......)')
    });

});

describe('Array', function() {


    describe('creation', function() {

        describe('#dim(len,[initial]) -- create a array with length of len, initialized by initial', function() {
            it('Array.dim(len,[initial])', function() {
                assert.deepEqual(Array.dim(4, 1), [1, 1, 1, 1]);
            });
        })

        describe('#matrix(m,n,[initial]) -- create a m x n matrix with initial value', function() {
            it('Array.matrix(m,n,[initial])', function() {
                var m = [
                    [0, 0, 0],
                    [0, 0, 0],
                ];
                assert.deepEqual(Array.matrix(2, 3, 0), m);
            });
        })
    })

    describe('access', function() {
        
        describe('#pluck -- quick map, return a plain array', function(){
            it('arr.pluck(name)')
        });

        describe('#where -- similar to Array#filter but it takes a query-object rather than function as its argument)',function(){
            it('arr.where({...})')
        });

        describe('#find -- find the first match the predicate', function() {
            it('arr.find(fn)', function() {
                var data = [1, 3, 4, 5222, 456, 23, 25, 2, {
                    a: 233
                }];
                assert.equal(233, data.find(S.isObject).a);
            });

            it('Array.find(arr,fn)', function() {
                var data = [1, 3, 4, 5222, 456, 23, 25, 2, {
                    a: 233
                }];
                assert.equal(233, Array.find(data, S.isObject).a);
            });

        });


        describe('#first -- return first element of array', function() {
            it('arr.first()', function() {
                var a = [];
                var b = [2, 3, 4];
                assert.equal(a.first(), void 0);
                assert.equal(b.first(), 2);
            })
        });

        describe('#last -- return last element of array', function() {
            it('arr.last()', function() {

                var a = [];
                var b = [2, 3, 4];
                assert.equal(b.last(), 4);
                assert.equal(a.last(), void 0);
            })
        })

        describe('#contains -- return true if the array contains the input',
            function() {
                it('arr.contains(obj)', function() {
                    var b = [23, 34, 5, 5, 6, 9, 7, 7, 7233, 8];
                    assert.equal(b.contains(23), true);
                    assert.equal(b.contains(22), false);
                })
            });

        describe('#densify -- return a copy that contains no "undifined" element',
            function() {
                it('arr.densify()', function() {
                    var dirty = [undefined, 123, 4, undefined, 2, 555, undefined, 44, 2, undefined];
                    assert.deepEqual([123, 4, 2, 555, 44, 2], dirty.densify());
                });

                it('Array.densify(arr)', function() {
                    var dirty = [undefined, 123, 4, undefined, 2, 555, undefined, 44, 2, undefined];
                    assert.deepEqual([123, 4, 2, 555, 44, 2], Array.densify(dirty));

                })
            });


        describe('compact -- return a copy with all falsy elements removed', function() {
            it('arr.compact()', function() {
                var dirty = [false, 123, 4, 0, 2, 555, NaN, 44, 2, undefined];
                assert.deepEqual(dirty.compact(), [123, 4, 2, 555, 44, 2]);
            })

            it('Array.compact(arr)', function() {
                var dirty = [false, 123, 4, 0, 2, 555, NaN, 44, 2, undefined];
                assert.deepEqual(Array.compact(dirty), [123, 4, 2, 555, 44, 2]);
            })

        });

        describe('#exclude -- return a copy with input elements removed', function() {
            it('arr.exclude(a,b,c....)')
            it('Array.exclude(arr,a,b,c....)')
        })

        describe('#deduplicate -- return a copy that every element only occur once', function() {})

        describe('#find -- return the first element meet the predicate', function() {
            it('arr.find(fn)', function() {
                var a = [1, 23, 4, 5, 6, 73444, 5];
                assert.equal(a.find(function(_) {
                    return _ === 5;
                }), 5);
            })
        });



        describe('#findIndex -- return the index of  first element meets the predicate', function() {
            it('arr.findIndex(fn)', function() {
                var a = [1, 23, 4, 5, 6, 73444, 5];
                assert.equal(a.findIndex(function(_) {
                    return _ === 5;
                }), 3);
            })
        });

        describe('#isEmpty -- return true if array.length === 0',function(){
            it('arr.isEmpty()', function(){
                assert.equal([].isEmpty,true);
            })
        });

        describe('#partition -- split into two arrays by the predicate, one whose elements all satisfy the predicate and one whose not', function(){
            it('arr.partition(fn)')
        });

        describe('#indexWhere -- similar to indexOf but recieves a function as its predicate',function(){
            it('arr.indexWhere(fn)')
        });

        describe('#update -- update specified element with new value', function(){
            it('arr.update(index, newVal)')
        })
        
    })

    describe('mutable', function() {

        describe('#trim -- trim the array & return itself',
            function() {
                it('arr.trim()')
                it('Array.trim(arr)')
            });
        describe('#clear -- empty the array', function() {
            it('arr.clear()')
            it('Array.trim(arr)')
        });
    })

    describe('extra & experimental', function() {

        describe('#reductions -- similar to the Array.reduce except returns an array records every intermediate value', function() {
            it('arr.reductions(fn, [initial])')
            it('Array.reductions(arr, fn, [initial])')
        });


    });
});
