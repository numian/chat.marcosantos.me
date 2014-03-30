Channel = function(n, s) { this.init(n, s); };

Channel.prototype = {
    
    users: new Object(),

    init: function(name, server) {
        this.name   = name;
        this.server = server;
    },
    
    add: function(user) {
        this.users[user.socket.id] = user;
        user.addToChannel(this);
    },

    send: function(cmd) {
     
        if(cmd.mode == 1 || cmd.mode == 3 || cmd.mode == 4)
            cmd.msg = this.processMsg(cmd.msg);
    
        for(var i in this.users)
            this.users[i].send(cmd);
            
        if(cmd.mode == 0 || cmd.mode == 2)
            this.sendUserList();
    },
    
    processMsg: function(msg) {
        msg = msg.replace(/>/g, '&gt;').replace(/</g, '&lt;');
        
        // links in text
        var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        msg = msg.replace(exp, '<a href="$1" target="_blank">$1</a>');
        
        // youtube sniffer
        /* var regExp = /href="(.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]{11})?)"/;
        var match = msg.match(regExp);
        
        console.log(match);
        
        if(match && match[8].length == 11)
            msg += '<iframe width="420" height="315" src="http://www.youtube.com/embed/'+match[8]+'" frameborder="0" allowfullscreen></iframe>'; */

        // smileys
        /* for(var j in this.smileys)
            for(var k in this.smileys[j])
                msg = msg.replace(new RegExp(this.regExpEscape(this.smileys[j][k]), 'gi'), '<img style="position:relative; top: -5px" src="/img/smileys/'+j+'" />'); */
        
        return msg;
    },
    
    regExpEscape: function(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    },
    
    sendUserList: function() {
        var userlist = new Array();
        var unique   = {};
        
        for(var i in this.users) {
            if(typeof(unique[this.users[i].id]) == 'undefined' && this.users[i].id) {
                userlist.push({ username: this.users[i].username, id: this.users[i].id, away: this.users[i].away });
                unique[this.users[i].id] = true;
            }
        }
            
        for(var i in this.users)
            this.users[i].socket.emit('userlist', userlist);
    },
    
    remove: function(id) {
    
        var username = false;
        var usr_id   = false;
        
        for(var i in this.users)
            if(this.users[i].socket.id == id) {
                username = this.users[i].username;
                usr_id   = this.users[i].id;
                delete(this.users[i]);
            }
                
        this.sendUserList();
        this.send({ mode: 2, username: username, id: usr_id });
    },
    
    setAway: function(data) {
        for(var i in this.users)
            this.users[i].socket.emit('away', data);
    },
    
    allowUserName: function(new_username) {
        for(var i in this.users)
            if(this.users[i].username == new_username)
                return false;
                
        return true;
    },
    
    sendMouseMove: function(data) {
        for(var i in this.users)
            this.users[i].socket.volatile.emit('mouse-move', data);
    },
    
    sendXylo: function(data) {
        for(var i in this.users)
            this.users[i].socket.emit('xylo', data);
    },
    
    
    smileys: { "aa.gif":["O:-)","O:)","O+)","O=)","0:-)","0:)","0+)","0=)"],
               "happy.gif":[":-)",":)","=)","+)"],
               "ac.gif":[":-(",":(","+(","=("],
               "ad.gif":[";-)",";)","^_~"],
               "ae.gif":[":-P",":P",":-p",":p","+P","=P","+p","=p",":-b",":b","+b","=b"],
               "af.gif":["8-)","8)","B)"],
               "ag.png":[":-D",":D","+D","=D"],
               "ah.gif":[":-",":[",";'>",";-."],
               "ai.gif":["=-O","=O","=-o","=0","O_O","O_o","o_O","O_0","o_0","0_O","0_o"],
               "aj.gif":[":-*",":*",":-{}",":{}","+{}","={}","^.^"],
               "ak.gif":[":'(",":-'("],
               "al.gif":[":-X",":-x","X:[","x:[",":-#",":#"],
               "am.gif":[">:o",">:O",">+O",">:o",">+o",":-@"],
               "an.gif":[":-|",":|","=|"],
               "ao.gif":[":-\\",":-/",":\\","*BEEE*"],
               "ap.gif":["*JOKINGLY*","8P","8p"],
               "aq.gif":["],:->","}:->","],:>","}:>",">:-],",">:],","*DIABLO*"],
               "ar.gif":["[:-}","[:}"],
               "as.gif":["*KISSED*"],
               "at.gif":[":-!",";-!",":!",";!",":-~",";-~"],
               "au.gif":["*TIRED*","|-0"],
               "av.gif":["*STOP*"],
               "aw.gif":["*KISSING*"],
               "ax.gif":["@}->--","@}-:--","@>}--`---"],
               "ay.gif":["*THUMBS%%__%%UP*","*GOOD*"],
               "az.gif":["*DRINK*"],
               "ba.gif":["*IN%%__%%LOVE*"],
               "bb.gif":["@="],
               "bc.gif":["*HELP*"],
               "bd.gif":["\\m/"],
               "be.gif":["%)","%-)",":$"],
               "bf.gif":["*OK*"],
               "bg.gif":["*WASSUP*","*SUP*"],
               "bh.gif":["*SORRY*"],
               "bi.gif":["*BRAVO*"],
               "bj.gif":["*ROFL*"],
               "bk.gif":["*PARDON*","=],"],
               "bl.gif":["*NO*"],
               "bm.gif":["*CRAZY*"],
               "bn.gif":["*DONT_KNOW*","*UNKNOWN*"],
               "bo.gif":["*DANCE*"],
               "bp.gif":["*YAHOO*","*YAHOO!*"],
               "bq.gif":[";D","*ACUTE*"],
               "br.gif":["*BB*"],
               "bs.gif":["*BYE*"],
               "bt.gif":["*HI*"],
               "bu.gif":["*HAPPY*"],
               "bv.gif":["*LOL*"],
               "bw.gif":["*SCRATCH*"],
               "bx.gif":["*YEEES!*"],
               "by.gif":["*SMOKE*"],
               "bz.gif":["*BOSS*"],
               "ca.gif":["*SARCASTIC*"],
               "cb.gif":["*BOAST*"],
               "cd.gif":["*db*"],
               "ce.gif":["*HOHO*"],
               "cf.gif":["*SHOUT*"],
               "cg.gif":["*VAVA*"],
               "ch.gif":["*CENSORED*"],
               "ci.gif":["*SEARCH*"],
               "cj.gif":["*BEACH*"],
               "ck.gif":["*FOCUS*"],
               "cl.gif":["*HUNTER*"],
               "cm.gif":["*GIRL_CRY*","*GIRL_CRAY*"],
               "cn.gif":["*GIRL_CRAZY*"],
               "co.gif":["*HOSPITAL*"],
               "cp.gif":["*GIRL_IN_LOVE*"],
               "cq.gif":["*PINKGLASSES*"],
               "cr.gif":["*HYSTERIC*"],
               "cs.gif":["*TENDER*"],
               "ct.gif":["*SPRUSE_UP*"],
               "cu.gif":["*FLIRT*"],
               "cv.gif":["*GIVE_HEART*"],
               "cw.gif":["*CURTSEY*"],
               "cx.gif":["*FEMINIST*"],
               "cy.gif":["*GIRL_DRINK*"],
               "cz.gif":["*HAHA*"],
               "da.gif":["*IMPOSSIBLE*"],
               "db.gif":["*SIGH*"],
               "dc.gif":["X-)","X)"],
               "dd.gif":["*SLOW*"],
               "de.gif":["*MOIL*","*JOB*"],
               "df.gif":["*YES*"],
               "dg.gif":["*MEGA_SHOK*"],
               "dh.gif":["*THANK*"],
               "di.gif":["*KING*"],
               "dj.gif":["*LAZY*"],
               "dk.gif":["*FRIEND*"],
               "dl.gif":["*PUNISH*"],
               "dm.gif":["*WIZARD*"],
               "dn.gif":["*V*"],
               "do.gif":["*SPITEFUL*"],
               "dp.gif":["*TEASE*"],
               "dr.gif":["*SCARE*"],
               "ds.gif":["*THIS*"],
               "dt.gif":["*PAINT*"],
               "du.gif":["*TRAINING*"],
               "dv.gif":["*PARTY*"]}
};

