var Client = function() { this.init(); };

Client.prototype = {

    //away_timeout: 300000,
    away_timeout: 300000,

    init: function() {
        var $this = this;
        
        this.away    = false;
        this.mouse   = false;
        this.msgsnd  = true;
        this.keyplay = false;
        
        FB.api('/me', function(response) {
            $this.username = response.name;
            $this.id       = response.id;
            $this.start();
        });
        
        $(document.body).click(function() { $('#msg').focus(); });
        
        // xylo
        $('#xylo li').hover(function() {
            if($this.socket)
                $this.socket.emit('xylo', { key: $(this).data('key') });
        
        }, function() { });
        
        $('#keyboard-keys').click(function(e) { e.preventDefault(); e.stopPropagation(); $this.toggleKeyboardPlay(); });
        $(document).keydown(function(e) { $this.playSound(e); });
        
        $(document).click(function() { if($this.keyplay) $this.toggleKeyboardPlay(); });
    },
    
    start: function() {
        var $this = this;
        
        this.socket = io.connect('https://chat.marcosantos.me:8869');
        
        this.socket.on('connect', function() {
            $this.onConnect();
        });
        
        this.socket.on('msg', function(data) { $this.processData(data); });
        this.socket.on('userlist', function(data) { $this.processUserList(data); });
        this.socket.on('away', function(data) { $this.proccessAway(data); });
        this.socket.on('mouse-move', function(data) { $this.processMouseMoving(data); });
        this.socket.on('xylo', function(data) { $this.playXylo(data); });
        
        $('#sender').submit(function(e) {
            e.preventDefault();
            $this.processLocalMsg();
        });
        
        $('#msg').focus();
        
        $(document).keydown(function(e) { $this.putAway(false); });
        $(document).mousemove(function(e) { $this.putAway(false); $this.sendMouseMoving(e); });
        $(document).click(function() { $this.putAway(false); });
    },
    
    processLocalMsg: function() {
    
        var msg = $('#msg').val();
    
        if(msg.length > 0) {
        
            var is_local_cmd = false;
        
            // check if it is a local command
            if(msg && msg[0] == '/') {
            
                // commands
                var space_pos = msg.indexOf(' ');
                var stop_pos  = space_pos > -1 ? space_pos : msg.length;  
                var command   = msg.substring(0, stop_pos);
            
                switch(command) {
                    case '/notify':
                        
                        if(msg.indexOf('on') > -1)
                            this.msgsnd = true;
                        else if(msg.indexOf('off') > -1)
                            this.msgsnd = false;
                        
                        is_local_cmd = true;
                        
                        $('#messages').append('<p class="mode0">A notificação sonora de novas mensagens está '+(this.msgsnd ? 'ligada' : 'desligada')+'</p>');
                        
                        break;
                
                    case '/mouse':
                        
                        if(msg.indexOf('on') > -1) {
                            this.mouse = true;
                            this.socket.emit('mouse-move', { top: '100px', left: '400px' });
                        }
                        else if(msg.indexOf('off') > -1) {
                            this.mouse = false;
                            $('#mouse'+this.id).css({ top: '-50px', left: '50px' });
                            this.socket.emit('mouse-move', { top: '-50px', left: '-50px' });
                        }
                        
                        msg = '/me '+(this.mouse ? 'ligou' : 'desligou')+' o tracking do rato'; 
                            
                        break;
                        
                    case '/clear':
                        $('#messages').html('');
                        msg = '/me limpou a sua palhota'; 
                        $('#clean-snd')[0].play();
                        break;
                }
            }
            
            if(!is_local_cmd)
                this.socket.emit('msg', { msg: msg });

            $('#msg').val('');
            $('#msg').focus();
        }
    },
    
    onConnect: function() {
        var $this = this;
    
        this.socket.emit('set-username', { username: this.username, id: this.id });
        
        if(this.msgsnd)
            this.playWelcome();
            //$('#welcome-snd')[0].play();
    
        this.socket.emit('set-away', { state: this.away });
        
        this.away_interval = setInterval(function() { $this.putAway(true); }, this.away_timeout);
    },
    
    processData: function(data) {
    
        var msg = '';
        
        switch(data.mode) {
            case 0:
                msg = data.username + ' entrou na #palhota';
                break;
                    
            case 1:
                msg = '&lt;<span class="username">'+data.username+'</span>&gt; '+data.msg;
                break;
                
            case 2:
                $('#mouse'+data.id).remove();
                msg = data.username + ' saiu da #palhota';
                break;
                
            case 3:
                msg = data.username + ' ' + data.msg;
                break;
                
            case 4:
                data.mode = 3;
                msg = data.username + ' abana a palhota em pelota';
                this.shake();
                break;
                
            case 5:
                data.mode = 3;
                msg = data.username + ' invoca os índios da palhota';
                
                if(this.msgsnd)
                    $('#welcome-snd')[0].play();
                    
                break;
                
            case 6:
                window.location.reload();
                break;
        }
        
        $('#messages').append('<p class="mode'+data.mode+'">'+msg+'</p>');
        $("#messages").scrollTop($("#messages")[0].scrollHeight);
        
        var date = new Date();
        
        document.title = data.username+' chatting :: '+date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        
        if(this.msgsnd && data.id && data.id != this.id && this.away)
            $('#msg-snd')[0].play();
    },
    
    processUserList: function(data) {
    
        $('#user-list ul').html('');
        
        for(var i in data)
            if(data[i]) {
            
                $('#user-list ul').append('<li id="user'+data[i].id+'" class="'+(data[i].away ? 'away' : '')+'"><img src="https://graph.facebook.com/'+data[i].id+'/picture?type=square" /> '+data[i].username+'</li>');
                
                if(data[i].away)
                    $('#user'+data[i].id).addClass('away');
                
                if(!$('#mouse'+data[i].id).length)
                    //$(document.body).append('<img src="/img/cursor.png" id="mouse'+data[i].id+'" class="user-cursor" />');
                    $(document.body).append('<img style="width: 40px; height: 40px; border-radius: 15px;" src="https://graph.facebook.com/'+data[i].id+'/picture?type=square" id="mouse'+data[i].id+'" class="user-cursor" />');
            }
    },
    
    proccessAway: function(data) {
        if(data.away)
            $('#user'+data.id).addClass('away');
        else
            $('#user'+data.id).removeClass('away');
    },
    
    putAway: function(away) {
        
        clearInterval(this.away_interval);
    
        if(!away) {
            var $this = this;
            this.away_interval = setInterval(function() { $this.putAway(true); }, this.away_timeout);
        }
        
        if(this.away != away) {
            this.away = away;
            this.socket.emit('set-away', { state: this.away });
        }
    },
    
    shake: function() {
    
        $('body, html').css('overflow-x', 'hidden');
        $('#main').css('position', 'absolute');
        
        $('#shake-snd')[0].play();
        
        $('#main').animate({ left: '-5px' }, 70,
            function() { $('#main').animate({ left: '5px' }, 70,
                
                        function() { $('#main').animate({ left: '-5px' }, 70,
                            function() { $('#main').animate({ left: '0px' }, 70,
                                function() { $('body, html').css('overflow-x', 'auto'); $('#main').css('position', 'relative'); }
                            )}
                        )}
                  
            )}); 
        
    },
    
    sendMouseMoving: function(e) {
        if(this.mouse)
            this.socket.emit('mouse-move', { top: e.pageY+'px', left: e.pageX+'px' }); 
    },
    
    processMouseMoving: function(data) {
        //if(this.mouse/*  && data.id != this.id */)
            $('#mouse'+data.id).css({ top: data.top, left: data.left });
    },
    
    playXylo: function(data) {
        if(this.msgsnd) {
        
            var audio = $('#xylo'+data.key).clone();
            
            audio[0].onended = function() {
                $(audio).remove();
            };
        
            audio[0].play();
            
            $('#xylo .key-'+data.key).stop().animate({ opacity: 1 }, 75, function() {
                $('#xylo .key-'+data.key).animate({ opacity: 0.4 }, 1000);
            });
        }
        
    },
    
    toggleKeyboardPlay: function() {
        
        if(this.keyplay) {
            this.keyplay = false;
            $('#keyboard-keys').addClass('disabled');
        }
        else {
            this.keyplay = true;
            $('#keyboard-keys').removeClass('disabled');
        }
    
    },
    
    playSound: function(e) {
        if(this.keyplay) {
            e.preventDefault();
            
            switch(String.fromCharCode(e.keyCode)) {
                case 'A':
                    this.socket.emit('xylo', { key: 1 });
                    break;
                    
                case 'S':
                    this.socket.emit('xylo', { key: 2 });
                    break;
                    
                case 'D':
                    this.socket.emit('xylo', { key: 3 });
                    break;
                    
                case 'F':
                    this.socket.emit('xylo', { key: 4 });
                    break;
                    
                case 'G':
                    this.socket.emit('xylo', { key: 5 });
                    break;
                    
                case 'H':
                    this.socket.emit('xylo', { key: 6 });
                    break;
                    
                case 'J':
                    this.socket.emit('xylo', { key: 7 });
                    break;
                    
                case 'K':
                    this.socket.emit('xylo', { key: 8 });
                    break;
                    
            }
        }
    },
    
    playWelcome: function() {
        $('#welcome-snd')[0].play();
    }
};

