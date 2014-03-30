Client = function(s) { this.init(s); };

Client.prototype = {
    
    channels: new Array(),
    away: false,

    init: function(socket) {
        var $this = this;
    
        this.socket = socket;
        this.socket.on('disconnect', function() { $this.disconnect(); });
        this.socket.on('msg', function(data) { $this.processMsg(data); });
        this.socket.on('set-username', function(data) { if(data.username && data.id) $this.setUsername(data.id, data.username); });
        this.socket.on('set-away', function(data) { $this.setAway(data.state); });
        this.socket.on('mouse-move', function(data) { $this.sendMouseMove(data); });
        this.socket.on('xylo', function(data) { $this.sendXylo(data); });
    },

    send: function(cmd) {
        this.socket.emit('msg', cmd);
    },
    
    disconnect: function() {
        this.channels[0].remove(this.socket.id);
    },

    processMsg: function(data) {
        data.mode     = 1;
        data.username = this.username;
        data.id       = this.id;
        
        // process commands
        if(data.msg && data.msg[0] == '/') {
            
            // commands
            var space_pos = data.msg.indexOf(' ');
            var stop_pos  = space_pos > -1 ? space_pos : data.msg.length;  
            var command   = data.msg.substring(0, stop_pos);
        
            switch(command) {
                case '/me':
                    data.mode = 3;
                    data.msg  = data.msg.replace('/me ', '');
                    break;
                    
                case '/nick':
                    
                    var new_username = data.msg.replace('/nick ', '').replace(/>/g, '&gt;').replace(/</g, '&lt;');;
                
                    if(this.channels[0].allowUserName(new_username, this.id)) {
                        data.mode = 3;
                        data.msg = ' agora chama-se '+new_username;
                        
                        this.username = new_username;
                        
                        this.channels[0].sendUserList();
                    }
                    break;
                    
                case '/shake':
                    data.mode = 4;
                    data.msg  = data.msg.replace('/shake', '');
                    break;
                    
                case '/call':
                    data.mode = 5;
                    data.msg  = data.msg.replace('/call', '');
                    break;
                    
                case '/reload':
                    if(this.id == 1331388173) {
                        data.mode = 6;
                        data.msg  = 'Actualizando a palhota';
                    }
                    break;
            }
        }
        
        this.channels[0].send(data);
    },
    
    addToChannel: function(channel) {
        this.channels.push(channel);
    },
    
    setUsername: function(id, username) {
        this.id       = id;
        //this.username = username.split(' ')[0]+' Palhota';
        this.username = username;
        this.channels[0].send({ mode: 0, username: this.username, id: this.id });
        this.channels[0].sendUserList();
    },
    
    setAway: function(state) {
        this.away = state;
        this.channels[0].setAway({ id: this.id, username: this.username, away: state });
    },
    
    sendMouseMove: function(data) {
        data.id = this.id;
        this.channels[0].sendMouseMove(data);
    },
    
    sendXylo: function(data) {
        this.channels[0].sendXylo(data);
    }
    
}
