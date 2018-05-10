console.log('test');
var express = require('express');
var cors = require('cors')
var app = express();

/**
 * 设置跨域
 */
app.use(cors())

app.get('/register', function (req, res) {
    res.send(JSON.stringify({data:'hello'}));
})

app.post('/textPost', function (req, res) {
    res.send(JSON.stringify({data:'hello'}));
})

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});