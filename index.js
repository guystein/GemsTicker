var express = require('express');
var app = express();
var request = require("request");
var q = require('q');
var moment = require('moment');
var fs = require('fs');
var $ = require('jquery');

function getPrice() {
    console.log('get price start');

    var deferred = q.defer();

    var url = "http://coinmarketcap-nexuist.rhcloud.com/api/gemz";

    request({
        url: url,
        json: true
    }, function (error, response, body) {
        console.log('get price done');

        if (!error && response.statusCode === 200) {
            deferred.resolve(body.price.usd);
        } else {
            deferred.reject(error);
        }
    });

    return deferred.promise;
}

function getTemplate() {

    console.log('get template start');

    var deferred = q.defer();

    fs.readFile('views/main.html', 'utf8', function (err,data) {
        console.log('get template done');
        if (err) {
            deferred.reject(error);
        } else {
            deferred.resolve(data);
        }
    });

    return deferred.promise;
}

//app.use(express.static('images'));
app.use('/public', express.static('public'));


app.get('/', function (req, res) {

    console.log('start get');

    q.all([getPrice(), getTemplate()]).then(function (output) {
        console.log('output returned');

        var html = output[1],
            price = parseFloat(output[0] * 100, 2).toFixed(2),
            now = new Date();

        var minutes = "" + now.getMinutes();
        minutes = minutes.length == 1 ? "0" + minutes : minutes;
        var dateText = now.getHours() + ":" + minutes;

        html = html.replace('$$$', price + '$');
        html = html.replace('00:00', dateText);

        //$(html)
        //    .find('.dollars')
        //    .text(price + "$")
        //    .end()
        //    .find('.time')
        //    .text('20:45');

        res.send(html);

        //res.send(output[0]);

        //res.send(html);

    }, function (error) {
        console.log('error', error);
    });



});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});