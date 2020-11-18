var fs = require('fs');
var http = require('http');
var https = require('https');
var url = require('url');

var dictionary = {
    'foo': 'bar'
};

var dictionaryHandler = (request, response) => {
    var u = url.parse(request.url);
    var key = u.pathname.substr(1)
    console.log('Request: ' + key);
    if (key === 'research-links.json') {
        fs.readFile('research-links.json', (err, data) => {
            response.writeHead(200, {'Content-Type': 'text/json'});
            response.write(data);
            response.end();
        })
        return;
    }
    else if (key.length === 0) {
        fs.readFile('index.html', (err, data) => {
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write(data);
            response.end();
        })
        return;
    }

    var def = dictionary[key.toUpperCase()];
    if (!def) {
        response.writeHead(404);
        response.end(key + ' was not found');
        return;
    }
    response.writeHead(200);
    response.end(def);
}

var download = (url, file, callback) => {
  var stream = fs.createWriteStream(file);
  var req = https.get(url, function(res) {
    res.pipe(stream);
    stream.on('finish', function() {
      stream.close(callback);
      console.log(file + ' downloaded');
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

download('https://meekly.github.io/research-dictionary.json', 'dictionary.json', (err) => {
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

download('https://meekly.github.io/research-links.json', 'research-links.json', (err) => {
    if (err) {
        console.log(err);
        return;
    }
});

const server = http.createServer(dictionaryHandler);

server.listen(8080, (err) => {
  if (err) {
    return console.log('Error starting server: ' + err);
  }

  console.log('Server is listening on 8080');
});
