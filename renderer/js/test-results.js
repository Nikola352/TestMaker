const electron = require('electron');
const ipc = electron.ipcRenderer;
window.$ = window.jQuery = require('jquery');

var slova = 'абвгдђежзијклљмнњопрстћуфхцчџш';

function dropDown(){
    $(this).parent().find('div.drop-down').css('display', 'block');
    $(this).attr('src', '../assets/arr_up.png')
    .hover(function(){
      $(this).attr('src', '../assets/arr_up_active.png');
    }, function(){
      $(this).attr('src', '../assets/arr_up.png');
    });
    $(this).unbind('click');
    $(this).on('click', function(){
      $(this).parent().find('div.drop-down').css('display', 'none');
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

ipc.on('test-results', function(e, res){
  console.log(res);
  $('.loading').css('display', 'none');
  $('.overview').css('display', 'block');

  var brojUcenika=0, zbirProcenata=0;

  for(var id of Object.keys(res)){
    brojUcenika++;
    zbirProcenata += res[id].procenat;

    $div = $('<div>').addClass(`id${id}`).addClass('visible');
    $('<p>').text(res[id].ime).appendTo($div);
    $('<p>').text(res[id].prezime).appendTo($div);

    $('<input type="image">')
      .attr('src', '../assets/arr_down.png')
      .hover(function(){
        $(this).attr('src', '../assets/arr_down_active.png');
      }, function(){
        $(this).attr('src', '../assets/arr_down.png');
      })
      .on('click', dropDown)
      .appendTo($div);

    $('<p>')
      .text(`${res[id].osvojenoBod} / ${res[id].ukupnoBod} = ${res[id].procenat.toFixed(2)}%`)
      .appendTo($div);

    var $dropDown = $('<div>').addClass('drop-down');
    for(odgovor of res[id].odgovori){
      var $odg = $('<div>');
      $('<p>').text(odgovor.pitanje.textPitanja).appendTo($odg);
      $('<p>').text('бр. бодова: '+odgovor.pitanje.brojBodova).appendTo($odg);

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

    $('div.rezultati').append($div);
  }

  $('#brUcenika').text(brojUcenika);
  $('#average').text((zbirProcenata/brojUcenika).toFixed(2));
});
