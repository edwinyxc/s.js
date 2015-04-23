var Promise = require('./s.js').Promise;
var http = require('http');

function getJSON(path) {
    return new Promise( function(resolve, reject) {
        http.get('http://localhost:8080/'+path, function(res) {
            if( res.statusCode === 404 )
               reject('404');
            else 
                res.setEncoding('utf-8')
                    .on('data',  function(data){
                        resolve(function(){ return JSON.parse(data)});
                    })
                    .on('error', reject)
        });
    })
}

var echo_promise;

function getEcho(i) {
    echo_promise = echo_promise || getJSON('list');
    console.log('echo_promise');
    return echo_promise.then ( function(list) {
        return getJSON(list[i]);
    });
}

function echo(x) {
    return console.log.bind(console,x);
}

getEcho(0)
.then( function(i) {
    console.log("echo " + i);
    return getEcho(1)
}) 
.then( function(i) {
    console.log("echo " + i)
})
.catch( echo('catch') );

Promise.all(getJSON('list'), getJSON('cost')) 
        .then(echo('all'),echo('bug'));

var i = 0;

setInterval(function(){
    console.log(i++);
},1000)

