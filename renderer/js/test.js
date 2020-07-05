const electron = require('electron');
const ipc = electron.ipcRenderer;
window.$ = window.jQuery = require('jquery');

ipc.on('test-info', function(e, arg){
  var $ul = $('ul.ucenici');
  arg.info.ucenici.forEach((ucenik, i) => {
    $li = $('<li>').addClass('id'+ucenik.id);
    $('<p>').text(ucenik.ime).appendTo($li);
    $('<img>').attr('src', '../assets/iks_red.png').appendTo($li);
    $ul.append($li);
  });

  arg.loggedinUsers.forEach((id, i) => {
    $(`ul.ucenici li.id${id} img`).attr('src', '../assets/save_green.png');
  });

});

ipc.on('user-loggedin', function(e, id){
  $(`ul.ucenici li.id${id} img`).attr('src', '../assets/save_green.png');
});

$(document).ready(()=>{
  $('#end-test').on('click', function(){
    ipc.send('end-test');
  });
});
