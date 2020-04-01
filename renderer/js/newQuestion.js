const electron = require('electron');
const ipc = electron.ipcRenderer;
window.$ = window.jQuery = require('jquery');

var slova = 'абвгдђежзијклљмнњопрстћуфхцчџш';
var brOdgovora = 0;
var PRED_DATA;

$(document).ready(function(){
  ipc.send('get-subj-data');
});

ipc.on('subj-data', function(e, arg){
  PRED_DATA = arg;
  var predmeti = []
  for(row of arg){
    predmeti.push(row['predmet']);
  }

  for(var i=0; i<predmeti.length; i++){
    $('<option>')
    .attr('value', predmeti[i])
    .appendTo($('#predmet-list'));
  }
});

$('input.predmet').on('change', function(){
  predmet = $(this).val();
  console.log(PRED_DATA)
  for(row of PRED_DATA){
    console.log(row);
    if(row['predmet'] === predmet){
      var oblasti = row['oblasti'].split('&|&');
      $('#oblast-list').html('');
      for(var i=0; i<oblasti.length; i++){
        $('<option>')
        .attr('value', oblasti[i])
        .appendTo($('#oblast-list'));
      }

    }
  }
})

$('input.brOdgovora').on('change', function(){
  var noviBroj = Number($(this).val());

  if(noviBroj > 30 || noviBroj < 0){
    ipc.send('invalid-number');
    $(this).val(brOdgovora);
    return;
  }

  $odgTable = $('.odgovori');
  if(noviBroj > brOdgovora){
    for(var i=brOdgovora; i<noviBroj; i++){
      $row = $('<tr>');
      $('<td>').text(slova[i]+')').appendTo($row);
      $('<td>').append(
        $('<input type="text">')
          .attr('id', i-(-1))
          .on('keydown', deflectEvent)
      ).append(
        $('<input type="checkbox">').attr('name', slova[i])
      ).appendTo($row);
      $odgTable.append($row);
    }
  } else{
    for(var i=brOdgovora; i>noviBroj; i--){
      $('tr:last-child').remove();
    }
  }

  brOdgovora = noviBroj;
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
    var n = brOdgovora;
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
  for(var i=0; i<brOdgovora; i++){
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
