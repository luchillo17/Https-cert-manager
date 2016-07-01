// Https test server over port 443, can use any port

var fs = require('fs');
var express = require('express');
var https = require('https');
var key = fs.readFileSync('./privkey.pem');
var cert = fs.readFileSync('./fullchain.pem');
var https_options = {
    key: key,
    cert: cert
};
var PORT = 60001;
app = express();

// routes
app.get('/', function(req, res) {
    res.send('HELLO WORLD!');
});
app.get('/hey', function(req, res) {
    res.send('HEY!');
});
app.post('/ho', function(req, res) {
    res.send('HO!');
});

server = https.createServer(https_options, app).listen(PORT);
console.log('HTTPS Server listening on %s', PORT);
