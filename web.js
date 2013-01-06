var server = function(config){
    var express = require('express');    
    var path = require('path');
    var app = express();

    app.engine('html', require('ejs').renderFile);
    app.set('view', path.join(__dirname, 'views'));
    app.set('view engine', 'html');
    app.set('env', 'development');

    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/*', function(req, res){
        res.render('index'); 
    });
    return app;
};

var port = process.env.PORT || 5000;
var app = server();
app.listen(port);