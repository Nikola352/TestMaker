const electron = require('electron');
const ipc = electron.ipcRenderer;
window.$ = window.jQuery = require('jquery');

var SUBJ_DATA;

$(document).ready(function() {
  ipc.send('get-subj-data');
  ipc.send('get-class-data');

  $('select.predmet').on('change', addLessons);
  $('select.odjeljenje').on('change', function() {
    var raz = $('select.odjeljenje').val();
    ipc.send('get-student-data', raz);
  });
})

ipc.on('subj-data', function(e, data) {
  SUBJ_DATA = data;
  for(row of data){
    $('<option>')
      .text(row['predmet'])
      .val(row['predmet'])
      .appendTo($('select.predmet'));
  }
  addLessons();
});

ipc.on('class-data', function(e, data) {
  for(row of data){
    $('<option>')
      .text(row['razred'])
      .val(row['razred'])
      .appendTo($('select.odjeljenje'));
  }
  var raz = $('select.odjeljenje').val();
  ipc.send('get-student-data', raz);
});

function selectListItem() {
  $(this).addClass('selected')
    .unbind('click')
    .on('click', function() {
      $(this).removeClass('selected')
        .unbind('click')
        .on('click', selectListItem);
    });
}

function addLessons() {
  $ul = $('ul.oblasti');
  $ul.html(''); // empty the list
  for(row of SUBJ_DATA){
    if(row['predmet'] === $('select.predmet').val()){
      // only 1 will be found
      var oblasti = row['oblasti'].split('&|&');
      oblasti.forEach((oblast) => {
        $('<li>')
          .text(oblast)
          .appendTo($ul)
          .on('click', selectListItem);
      });
    }
  }
}

ipc.on('student-info', function(e, data) { // add students to list
  $ul = $('ul.ucenici');
  $ul.html(''); // empty the list
  for(row of data){
    if(row['razred'] === $('select.odjeljenja').val()){
      $('<li>')
        .addClass('id'+row['id'])
        .text(`${row['ime']}  ${row['prezime']}`)
        .appendTo($ul)
        .on('click', selectListItem);
    }
  }
});

$('button.start-server').on('click', function() {
  var info = {
    predmet: $('select.predmet').val(),
    oblasti: [],
    brPitanja: $('input.br-pitanja').val(),
    trajanje: {
      min: $('.duration input.min').val(),
      sec: $('.duration input.sec').val()
    },
    razred: $('select.odjeljenje').val(),
    ucenici: [],
    port: $('input.port').val()
  }

  $('ul.oblasti li.selected').each(function(i) {
    info.oblasti.push($(this).text());
  });
  $('ul.ucenici li.selected').each(function(i) {
    info.ucenici.push({
      id: $(this).attr('class').split(/\s+/)[0].substring(2),
      ime: $(this).text()
    });
  });

  ipc.send('start-server', info);

});
