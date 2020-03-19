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
        .attr('id', i+1)
        .on('keydown', deflectEvent)
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

deflectEvent = function(event) {
    var n = $('input.brOdgovora').val();
    if(event.keyCode === 38) {
      if($(this).attr('id') == 1){
        $('#'+n).focus();
      } else {
        $('#'+($(this).attr('id')-1)).focus();
      }
    }
    if(event.keyCode === 40){
      if($(this).attr('id') == n){
        $('#'+1).focus();
      } else {
        $('#'+($(this).attr('id')-(-1))).focus();
      }
    }
}

$('#save').on('click', function(){
  var podaci = {
    textPitanja: $('textarea.pitanje').val(),
    odgovori: '',
    tacniOdgovori: '',
    predmet: $('input.predmet').val(),
    oblast: $('input.oblast').val(),
    slika: $('img').attr('src'),
    brojBodova: Number($('input.brBodova').val())
  }
  for(var i=0; i<$('input.brOdgovora').val(); i++){
    podaci.odgovori += $('#'+(i+1)).val() + '&|&';
    if($('input[name="'+slova[i]+'"]').is(':checked')){
      podaci.tacniOdgovori += slova[i];
    }
  }

  if(podaci.predmet==='' || podaci.oblast===''
    || podaci.textPitanja==='' || podaci.odgovori===''
    || podaci.tacniOdgovori==='' || podaci.brojBodova<=0){
    ipc.send('input-error');
  } else{
    ipc.send('add-new-question', podaci);
  }

});
