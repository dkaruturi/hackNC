//Required dependencies
var express = require('express');
var bodyParser = require('body-parser');

//Create express server & socket.io
var app = express();

//Set public directory
app.use(express.static(__dirname + '/app/views'));

//JSON parsing for handling data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//App Modules
var modules = {
    visual: require('./app/modules/visual.js'),
    messages: require('./app/modules/messages.js'),
    search: require('./app/modules/search.js')
};

modules.visual(app);
modules.messages(app);
modules.search(app);

//Landing Page
app.get([
    '/index', '/index.html', '/'
], function(req, res) {
    res.sendFile('index.html', {root: './app/views'});
});

//Start Express Server
app.listen(process.env.PORT || 3000, '0.0.0.0' , function() {
    console.log('Express Server Started');
});
