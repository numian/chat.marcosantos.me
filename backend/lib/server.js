require('./channel.js');
require('./client.js');

const https = require('https'),
      fs    = require('fs');

Server = function(opt) { this.init(opt); };

Server.prototype = {
    
    channels: new Array(),
    
    init: function(options) {
        this.options = options;
    
        this.default_channel = new Channel('Curiosity', this);
        this.channels.push(this.default_channel);
    },

    start: function() {
        
        var $this = this;
    
        this.server = https.createServer({ key: fs.readFileSync('../certs/marcosantos_me.key'),
                                           cert: fs.readFileSync('../certs/marcosantos_me.pem')  
                                          }, function(req, res) { });
        
        
        this.server.listen(this.options.port, this.options.hostname);
        
        this.io = require('socket.io').listen(this.server);
        this.io.set('log level', 0);
        
        this.io.sockets.on('connection', function(socket) {
            var client = new Client(socket);
            $this.default_channel.add(client);
        });
        
    },
    
}

