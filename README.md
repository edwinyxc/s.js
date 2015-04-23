# s.js
simple, smart, starter, slim, small, swift...... js common lib 

###USAGE

    s_js(); // improve javascript and create a global namespace S
    
    undo_s_js(); // remove all the methods we`ve broaden the
    Array,Object,Function.... and remove the S global namespace;
    



#### Constants
    s.nil //empty list

#### Utils
    s.is_function
    s.is_array
    s.is_object

#### Transform

    // extend 
    s.extend()

    s.keys()

    s.pairs()

    // currying the function up to the n-th parameters
    s.curry(fn, n)

````

    // Run callback on each elements and return itself  
    s._for(list).each(cb(elem,i))

    // Return true when in-list items satisfy the input criteiron. 
    s._for(list).some(fn(elem,i))
    
    // Return true when every item meets the input criterion.
    s._for(list).every(fn(elem,i))

    // Return a sublist with the underlying start & end;
    s._for(list).sub(start,end)

    // Return a filtered list using the input function
    s._for(list).select[find]();

    // 
    s._for(list).reduce(function(elem,i), init_val)

    // Return true if the list holds the element
    s._for(list).contains(element);
    
    // Return the sorted list using the input compare strategy.
    // The return value (positive or negative) of Compare function indicates the order. 
    s._for(list).sort(compare_fn(a,b));
    
    // Return the first value of the list
    s._for(list).first();
    
    // Return the last value 
    s._for(list).last();

    // Partition the list using the input function and return the result
    // in a array like [sub_list_true, sub_list_false]
    // split by the partition function
    s._for(list).partition(partition_fn(elem,i));
    
    // Remove the duplicate items and return the result.
    s._for(list).deduplicate();
        
    // Return the raw array
    s._for(list).val();
    
````
