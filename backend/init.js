require('./lib/server.js');

var options = { host: 'chat.marcosantos.me',
                port: 8869 }

var server = new Server(options);
server.start();
