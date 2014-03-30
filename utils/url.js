var msg = 'asasas <a href="http://www.youtube.com/watch?v=fI_BI0FlhMM">http://www.youtube.com/watch?v=fI_BI0FlhMM</a> asas';

// youtube sniffer
var regExp = /href="(.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*)"/;
var match = msg.match(regExp);

if(match && match[8].length == 11)
    msg += '<iframe width="420" height="315" src="http://www.youtube.com/embed/'+match[8]+'" frameborder="0" allowfullscreen></iframe>';

console.log(msg);

