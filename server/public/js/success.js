var socket = io();

socket.on('start-test', function(arg) {
  window.location.replace('/test');
})
