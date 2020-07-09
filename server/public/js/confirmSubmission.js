$(document).ready(function(){
  var socket = io();
  socket.emit('successful-submission');
});
