const electron = require('electron');
const ipc = electron.ipcRenderer;
window.$ = window.jQuery = require('jquery');

var slova = 'абвгдђежзијклљмнњопрстћуфхцчџш';

$('input.brOdgovora').on('change', function(){
  if($(this).val() > 30 || $(this).val() < 0){
    // send a message to the user
    // not alert, but error box from the main process
    return;
  }
  $odgTable = $('.odgovori');
  $odgTable.html('');
  for(let i=0; i<$(this).val(); i++){
    $row = $('<tr>');
    $('<td>').text(slova[i]+')').appendTo($row);
    $('<td>').append(
      $('<input type="text">')
    ).append(
      $('<input type="checkbox">').attr('name', slova[i])
    ).appendTo($row);
    $odgTable.append($row);
  }
});

$('button.slika').on('click', function(e){
  ipc.send('choose-picture');
});

ipc.on('picture-path-ready', function(e, arg){
  $('.podaci img').attr('src', arg);
  $('button.vrati-sliku').css('display', 'inline');
});

$('button.vrati-sliku').on('click', function(){
  $('.podaci img').attr('src', '../assets/default.png');
  $(this).css('display', 'none');
})

function handleFirstTab(e){
  if(e.keyCode === 9){
    document.body.classList.add('user-is-tabbing');
    window.removeEventListener('keydown', handleFirstTab);
  }
}

window.addEventListener('keydown', handleFirstTab);
