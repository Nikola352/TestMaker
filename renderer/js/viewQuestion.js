const electron = require('electron');
const ipc = electron.ipcRenderer;
window.$ = window.jQuery = require('jquery');

var slova = 'абвгдђежзијклљмнњопрстћуфхцчџш';
var DATA = {};
var PRED_DATA = {};
var FILTERS = {
  predmet: '',
  oblast: '',
  text: ''
}
var isInitialData = true;
var onPredmetChange = false;
var onSearch = false;

$(document).ready(function(){
  ipc.send('get-subj-data');
  ipc.send('get-question-data', FILTERS);
});

$('select.predmet').on('change', function(){
  FILTERS.predmet = $('select.predmet').val();
  onPredmetChange = true;
  ipc.send('get-question-data', FILTERS);
});

$('select.oblast').on('change', function(){
  FILTERS.oblast = $('select.oblast').val();
  ipc.send('get-question-data', FILTERS);
});

$('#searchBtn').on('click', function(){
  FILTERS.text = $('#search').val();
  ipc.send('get-question-data', FILTERS);
});

function removeQuestion() {
  var id = $(this).parent().attr("class").split(/\s+/)[0];
  ipc.send('remove-question', id);
  ipc.send('get-question-data', FILTERS);
}

function backToDisabled($div){
  $div.find('input.edit')
  .attr('src', '../assets/edit.png')
  .hover(function() {
    $(this).attr('src', '../assets/edit_active.png');
  }, function(){
    $(this).attr('src', '../assets/edit.png');
  })
  .unbind('click')
  .on('click', updateQuestion);

  $div.find('input.remove')
  .attr('src', '../assets/remove.png')
  .hover(function() {
    $(this).attr('src', '../assets/remove_active.png');
  }, function(){
    $(this).attr('src', '../assets/remove.png');
  })
  .unbind('click')
  .on('click', removeQuestion);

  $div.css('background-color', 'inherit');
  $div.find('input[type="text"], input[type="checkbox"], input.brBodova, textarea').each(function(i){
    // disable all input elems
    $(this).attr('disabled', 'disabled');
  });
}

function updateQuestion() {
  $div = $(this).parent();
  $div.css('background-color', '#008ac6');
  $div.find('input[disabled="disabled"], textarea').each(function(i){
    // enable all input elems
    $(this).removeAttr('disabled');
  });
  var id = $div.attr("class").split(/\s+/)[0];

  $div.find('input.remove')
    .attr('src', '../assets/iks.png')
    .hover(function() {
      $(this).attr('src', '../assets/iks_red.png');
    }, function(){
      $(this).attr('src', '../assets/iks.png');
    })
    .unbind('click')
    .on('click', function() {
      backToDisabled($div);
      ipc.send('get-question-data', FILTERS);
    });

  $(this)
    .attr('src', '../assets/save_green.png')
    .hover(function() {
      $(this).attr('src', '../assets/save_green.png');
    }, function(){
      $(this).attr('src', '../assets/save.png');
    })
    .unbind('click')
    .on('click', function(){
      // get data
      var podaci = {
        textPitanja: $div.find('textarea').val(),
        odgovori: '',
        tacniOdgovori: '',
        predmet: $div.find('.questInfo.predmet').val(),
        oblast: $div.find('.questInfo.oblast').val(),
        brojBodova: Number($div.find('input.brBodova').val())
      }

      $div.find('td input[type=text]').each(function(i) {
        podaci.odgovori += $(this).val() + '&|&';
        if($div.find(`input[name="${slova[i]}"]`).is(':checked')){
          podaci.tacniOdgovori += slova[i];
        }
      });

      ipc.send('update-question', {id: id, podaci: podaci});

      backToDisabled($div);

    });

}

function displayQuestions() {
  $container = $('div.pitanja');
  $container.html('');
  for(row of DATA){
    var $div = $('<div>').addClass(`${row['id']} questDiv`);
    $('<input type="text">')
      .addClass('questInfo')
      .addClass('predmet')
      .attr('disabled', 'disabled')
      .val(row['predmet'])
      .appendTo($div);
    $('<input type="text">')
      .addClass('questInfo')
      .addClass('oblast')
      .attr('disabled', 'disabled')
      .val(row['oblast'])
      .appendTo($div);

    $('<input type="image">')
      .addClass('edit')
      .attr('src', '../assets/edit.png')
      .on('click', updateQuestion)
      .appendTo($div);
    $('<input type="image">')
      .addClass('remove')
      .attr('src', '../assets/remove.png')
      .on('click', removeQuestion)
      .appendTo($div);

    $('<textarea rows="13" cols="35">')
      .addClass('text')
      .attr('disabled', 'disabled')
      .val(row['textPitanja'])
      .appendTo($div);

    $('<img>')
      .attr('src',row['slika'])
      .appendTo($div);

    var odgovori = row['odgovori'].split('&|&');
    var tacni = row['tacniOdgovori'].split('&|&');
    $odgTable = $('<table>');
    for(let i=0; i<odgovori.length-1; i++){
      $row = $('<tr>');
      $('<td>').text(slova[i]+')').appendTo($row);

      $odgInput = $('<input type="text">')
        .attr('disabled', 'disabled')
        .val(odgovori[i]);

      $checkbox = $('<input type="checkbox">')
        .attr('disabled', 'disabled')
        .attr('name', slova[i]);
      if(row['tacniOdgovori'].includes(slova[i])){
        $checkbox.prop('checked', true);
      }

      $('<td>')
      .append($odgInput)
      .append($checkbox)
      .appendTo($row);

      $odgTable.append($row);
    }
    $div.append($odgTable);

    $('<input type="number">')
      .addClass('brBodova')
      .val(row['brojBodova'])
      .attr('disabled', 'disabled')
      .appendTo($div);

    $container.append($div);

    $('input.edit').hover(function(){
      $(this).attr('src','../assets/edit_active.png');
    }, function(){
      $(this).attr('src','../assets/edit.png');
    });
    $('input.remove').hover(function(){
      $(this).attr('src','../assets/remove_active.png');
    }, function(){
      $(this).attr('src','../assets/remove.png');
    });
  }
  console.log(DATA);
}

ipc.on('subj-data', function(e, arg){
  PRED_DATA = arg;
  // fill select.predmet
  var predmeti = []
  for(row of arg){
    predmeti.push(row['predmet']);
  }

  for(var i=0; i<predmeti.length; i++){
    if(predmeti.indexOf(predmeti[i]) === i){
      // only first occurence
      $('<option>')
      .attr('value', predmeti[i])
      .text(predmeti[i])
      .appendTo($('select.predmet'));
    }
  }
});

ipc.on('quest-data', function(e, arg){
  DATA = arg;

  if(onPredmetChange){
    // fill select.oblast
    var oblasti = [];
    for(row of PRED_DATA){
      if(row['predmet'] === FILTERS.predmet){
        oblasti = row['oblasti'].split('&|&');
      }
    }
    $('select.oblast').html('<option value="">Било која</option>');
    for(var i=0; i<oblasti.length; i++){
      if(oblasti.indexOf(oblasti[i]) === i){
        // only first occurence
        $('<option>')
        .attr('value', oblasti[i])
        .text(oblasti[i])
        .appendTo($('select.oblast'));
      }
    }
    onPredmetChange = false;
  }

  displayQuestions();

});

function keyPress(e){
  if(e.keyCode === 9){
    // enable tab
    document.body.classList.add('user-is-tabbing');
    window.removeEventListener('keydown', handleFirstTab);
  } else if(e.keyCode === 13){
    if($('#search').is(':focus')){
      FILTERS.text = $('#search').val();
      ipc.send('get-question-data', FILTERS);
    }
  }
}

window.addEventListener('keydown', keyPress);
