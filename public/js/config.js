define([], function() {
    requirejs.config({
        baseUrl: '/js/',
        shim: {
            'jquery': {
                exports: '$'
            },
            'underscore': {
                exports: '_'    
            },
            'backbone': {
                deps: ['underscore', 'jquery'],
                exports: 'Backbone'
            }       
        },             
        paths: {
            'jquery':[
                '//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min'
            ],        
            'underscore': '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.3/underscore-min',             
            'backbone': '//cdnjs.cloudflare.com/ajax/libs/backbone.js/0.9.9/backbone-min'
        }         
    });
});