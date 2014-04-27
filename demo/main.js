requirejs.config({
    baseUrl: './',
    paths: {
      'jquery': 'lib/jquery-1.11.0.min.js'
    }
});

require(['../q-validator'], function(qv){
    console.log(qv);
});