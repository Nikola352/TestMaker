const electron = require('electron');
const ipc = electron.ipcRenderer;
window.$ = window.jQuery = require('jquery');

var RAZRED = '';

ipc.on('class-name', function(e, raz){
  RAZRED = raz;
  $('h1.razred').html(RAZRED);
  ipc.send('get-student-data', RAZRED);
});

function removeStudent(){
  var id = $(this).parent().attr('class').substr(2);
  ipc.send('remove-student', {id:id, razred:RAZRED});
  ipc.send('get-student-data', RAZRED);
}

function backToDisabled($li){
  $parent.find('.update')
    .attr('src', '../assets/edit.png')
    .hover(function() {
      $(this).attr('src', '../assets/edit_active.png');
    }, function(){
      $(this).attr('src', '../assets/edit.png');
    })
    .unbind('click')
    .on('click', editStudent);

  $parent.find('.remove')
    .attr('src', '../assets/remove.png')
    .hover(function() {
      $(this).attr('src', '../assets/remove_active.png');
    }, function(){
      $(this).attr('src', '../assets/remove.png');
    })
    .unbind('click')
    .on('click', removeStudent);

    $parent.find('input')
      .removeClass('editing')
      .prop('disabled', true);
}

function editStudent(){
  $parent = $(this).parent();
  $parent.find('input')
    .addClass('editing')
    .prop('disabled', false);

  var id = $parent.attr('class').substr(2);

  $parent.find('img.remove')
    .attr('src', '../assets/iks.png')
    .hover(function() {
      $(this).attr('src', '../assets/iks_red.png');
    }, function(){
      $(this).attr('src', '../assets/iks.png');
    })
    .unbind('click')
    .on('click', function() {
      backToDisabled($parent);
      ipc.send('get-student-data', RAZRED);
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
        ime: $parent.find('input.ime').val(),
        prezime: $parent.find('input.prezime').val()
      }

      ipc.send('update-student', {id: id, podaci: podaci});

      backToDisabled($parent);
    });
}

ipc.on('student-info', function(e, ucenici){
  $('#ucenici').html('');

  for(ucenik of ucenici){
    $li = $('<li>').addClass(`id${ucenik.id}`);

    $('<input>')
      .addClass('ime')
      .prop('disabled', true)
      .val(ucenik.ime)
      .appendTo($li);
    $('<input>')
      .addClass('prezime')
      .prop('disabled', true)
      .val(ucenik.prezime)
      .appendTo($li);

    $('<img>')
      .addClass('ucBtn remove')
      .attr('src', '../assets/remove.png')
      .on('click', removeStudent)
      .hover(function(){
        $(this).attr('src','../assets/remove_active.png');
      }, function(){
        $(this).attr('src','../assets/remove.png');
      })
      .appendTo($li);
    $('<img>')
      .addClass('ucBtn update')
      .attr('src', '../assets/edit.png')
      .on('click', editStudent)
      .hover(function(){
        $(this).attr('src','../assets/edit_active.png');
      }, function(){
        $(this).attr('src','../assets/edit.png');
      })
      .appendTo($li);

    $('<img>')
      .addClass('ucBtn results')
      .attr('src', '../assets/results.png')
      .on('click', function() {
        ipc.send('view-student-results', ucenik.id);
      }).hover(function() {
        $(this).attr('src', '../assets/results_active.png');
      }, function() {
        $(this).attr('src', '../assets/results.png');
      })
      .appendTo($li);

    $('#ucenici').append($li);
  }
})

$('#back')
  .hover(function() {
    $(this).attr('src', '../assets/back_active.png');
  }, function(){
    $(this).attr('src', '../assets/back.png');
  })
  .on('click', function(){
    ipc.send('switch-view', {view: 'classes'});
});

$('#dodajUcenika').on('click', function() {
  var imeInput = $('input[name="imeIn"]');
  var prezInput = $('input[name="prezimeIn"]');

  if(imeInput.val()=='' || prezInput.val()==''){
    ipc.send('input-error');
  } else{
    ipc.send('add-student', {
      ime: imeInput.val(),
      prezime: prezInput.val(),
      razred: RAZRED,
      rezultati: ''
    });

    imeInput.val('');
    prezInput.val('');

    ipc.send('get-student-data', RAZRED);
  }
});


function keyPress(e){
  if(e.keyCode === 13){
    // enter
    if($('#novi-ucenik input').is(':focus')){
      $('#dodajUcenika').trigger('click');
    }
  }
}

window.addEventListener('keydown', keyPress);
