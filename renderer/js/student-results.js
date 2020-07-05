const electron = require('electron');
const ipc = electron.ipcRenderer;
window.$ = window.jQuery = require('jquery');

var slova = 'абвгдђежзијклљмнњопрстћуфхцчџш';

function dropDown(){
    $(this).parent().parent().find('div.drop-down').css('display', 'block');
    $(this).attr('src', '../assets/arr_up.png')
    .hover(function(){
      $(this).attr('src', '../assets/arr_up_active.png');
    }, function(){
      $(this).attr('src', '../assets/arr_up.png');
    });
    $(this).unbind('click');
    $(this).on('click', function(){
      $(this).parent().parent().find('div.drop-down').css('display', 'none');
      $(this).attr('src', '../assets/arr_down.png')
      .hover(function(){
        $(this).attr('src', '../assets/arr_down_active.png');
      }, function(){
        $(this).attr('src', '../assets/arr_down.png');
      });
      $(this).unbind('click');
      $(this).on('click', dropDown);
    });
}

ipc.on('student-results', function(e, results){
  console.log(results);
  if(results.length === 0){
    $('#rezultati').append($('<p>').text('Ученик још није радио ни један тест.'));
  }
  for(res of results){
    var $div = $('<div>').addClass('test');
    var $p = $('<p>').addClass('visible');
    $('<span>')
      .addClass('br-bod')
      .text(`освојено бодова: ${res.osvojenoBod}`)
      .appendTo($p);
    $('<span>')
      .addClass('tot-bod')
      .text(`укупно: ${res.ukupnoBod}`)
      .appendTo($p);
    $('<span>')
      .addClass('procenat')
      .text(`проценат: ${res.procenat.toFixed(2)}%`)
      .appendTo($p);

    $('<input type="image">')
      .attr('src', '../assets/arr_down.png')
      .hover(function(){
        $(this).attr('src', '../assets/arr_down_active.png');
      }, function(){
        $(this).attr('src', '../assets/arr_down.png');
      })
      .on('click', dropDown)
      .appendTo($p);

    $div.append($p);

    var $dropDown = $('<div>').addClass('drop-down');
    for(odgovor of res.odgovori){
      var $odg = $('<div>');
      $('<p>').text(odgovor.pitanje.textPitanja).appendTo($odg);
      var brBod = 0;
      if(odgovor.correct){brBod = odgovor.pitanje.brojBodova}
      $('<p>')
        .text(`бр. бодова: ${brBod}/${odgovor.pitanje.brojBodova}`)
        .appendTo($odg);

      var ponudjeniOdgovori = odgovor.pitanje.odgovori.split('&|&').slice(0,-1);
      var $ul = $('<ul>');
      for(var i=0; i<ponudjeniOdgovori.length; i++){
        $li = $('<li>').text(`${slova[i]}) ${ponudjeniOdgovori[i]}`);
        if(odgovor.ans.includes(slova[i])){
          if(odgovor.correctAns.includes(slova[i])){
            $li.css('color', '#00ff0f');
          } else{
            $li.css('color', '#f33');
          }
        } else{
          if(odgovor.correctAns.includes(slova[i])){
            $li.css('color', 'yellow');
          }
        }
        $ul.append($li);
      }
      $odg.append($ul);

      $('<img>').attr('src', odgovor.pitanje.slika).appendTo($odg);

      $dropDown.append($odg);
    }

    $div.append($dropDown);
    $('#rezultati').append($div);
  }
});
