var fs = require('fs');
var http = require('http');
var https = require('https');
var url = require('url');

var dictionary = {
    'foo': 'bar'
};

var dictionaryHandler = (request, response) => {
    var u = url.parse(request.url);
    var key = '';
    if (u.pathname.length > 0) {
        key = u.pathname.substr(1).toUpperCase();
    }
    var def = dictionary[key];
    if (!def) {
        response.writeHead(404);
        response.end(key + ' was not found');
        return;
    }
    response.writeHead(200);
    response.end(def);
}

var downloadDictionary = (url, file, callback) => {
  var stream = fs.createWriteStream(file);
  var req = https.get(url, function(res) {
    res.pipe(stream);
    stream.on('finish', function() {
      stream.close(callback);
      console.log('Dictionary downloaded');
    });
  }).on('error', function(err) {
    fs.unlink(file);
    if (callback) cb(err.message);
  });
};

var loadDictionary = (file, callback) => {
    fs.readFile(file, (err, data) => {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        dictionary = JSON.parse(data);
        console.log('Dictionary loaded.');
        callback();
    })
};

downloadDictionary('https://meekly.github.io/research-dictionary.json', 'dictionary.json', (err) => {
    if (err) {
        console.log(err);
        return;
    }
    loadDictionary('dictionary.json', (err) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log('ready to serve');
    });
});

const server = http.createServer(dictionaryHandler);

server.listen(8080, (err) => {
  if (err) {
    return console.log('Error starting server: ' + err);
  }

  console.log('Server is listening on 8080');
});
