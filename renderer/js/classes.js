const electron = require('electron');
const ipc = electron.ipcRenderer;
window.$ = window.jQuery = require('jquery');

$(document).ready(function(){
  ipc.send('get-class-data');
});

ipc.on('class-data', function(e, data){
  $('#odjeljenja').html('');
  for(raz of data){
    $('<button>')
      .addClass('odjeljenje')
      .text(raz.razred)
      .on('click', switchView)
      .appendTo($('#odjeljenja'));
  }
});

function switchView(){
  ipc.send('switch-view', {view: 'students', class: $(this).text()});
}

$('#dodajRazred').on('click', function() {
  var razInput = $('input[name="razredIn"]');
  var odjInput = $('input[name="odjeljenjeIn"]');

  if(razInput.val()=='' || odjInput.val()==''){
    ipc.send('input-error');
  } else{
    var classStr = razInput.val().toUpperCase() + '-' + odjInput.val();
    ipc.send('add-class', classStr);

    razInput.val('');
    odjInput.val('');

    ipc.send('get-class-data');
  }
});

function ukloniRazred(){
  $('#odjeljenja .odjeljenje')
  .addClass('red-hover')
  .unbind('click')
  .on('click', function(){
    ipc.send('remove-class', $(this).text());
    $('#odjeljenja .odjeljenje')
      .removeClass('red-hover')
      .unbind('click').click(switchView);
      $('#ukloniRazred').unbind('click').on('click', ukloniRazred)
    ipc.send('get-class-data');
  });

  $(this).unbind('click')
  .on('click', function(){
    $('#odjeljenja .odjeljenje')
      .removeClass('red-hover')
      .unbind('click').click(switchView);
    $(this).unbind('click').on('click', ukloniRazred);
  })
}

$('#ukloniRazred').on('click', ukloniRazred);

function keyPress(e){
  if(e.keyCode === 9){
    // enable tab
    document.body.classList.add('user-is-tabbing');
    window.removeEventListener('keydown', handleFirstTab);
  } else if(e.keyCode === 13){
    // enter
    if($('input[name="odjeljenjeIn"]').is(':focus')
      || $('input[name="razredIn"]').is(':focus')){
        $('#dodajRazred').trigger('click');
    }
  }
}

window.addEventListener('keydown', keyPress);
