var sqlite3 = require('sqlite3').verbose();
var fs = require("fs");
var file = "./iot.json";
var _ = require("underscore");

fs.readFile(file, 'utf8', function(err, data) {
    if (err) {
        console.log('Error: ' + err);
        return;
    }
    config = JSON.parse(data);
    start_server();
});

function parse_url(url) {
    var db = new sqlite3.Database(config["db_name"]);
    var result = function(callback) {
        db.all("SELECT * FROM basic;", function(err, rows) {
            callback(null, JSON.stringify(rows));
            return;
        });
    };
    console.log(result);
    db.close();
    return JSON.stringify({});
}

function start_server() {

    var db = new sqlite3.Database(config["db_name"]);
    var create_table = 'create table if not exists basic (' + config["db_table"] + ');';
    console.log(create_table);

    db.serialize(function() {
        db.run(create_table);
        _.each(config["init_table"], function(insert_data) {
            db.run(insert_data);
        });
    });

    db.close();

    var coap = require('coap');
    var server = coap.createServer({});

    server.on('request', function(req, res) {
        if (req.headers['GET'] !== 0) {
            res.setOption('Content-Format', 'application/json');

            res.end(parse_url(req.url));

            res.code = '4.06';
        } else {
            res.end('Hello ' + req.url.split('/')[1] + '\n');
        }
    });

    server.listen(function() {
        console.log('server started');
    });

}