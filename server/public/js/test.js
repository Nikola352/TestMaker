$(document).ready(()=>{
  var socket = io();

  function submitAnswers(){
    var odgovori = {};
    $('.question').each((index, element)=>{
      var quest_id = $(element).attr('data-id');
      odgovori[quest_id] = [];
      $(element).find('input[type="checkbox"]').each((ind, elem)=>{
        if($(elem).is(':checked')){
          odgovori[quest_id].push($(elem).val());
        }
      })
    });
    socket.emit('submit', odgovori);

    location.reload(true);
  }

  $('#end').on('click', ()=>{
    if(confirm('Завршите тест сада?')){
      submitAnswers();
    }
  });

  socket.on('end-test', submitAnswers);

  setInterval(function(){
    var minutes = parseInt($('.timer .min').text());
    var seconds = parseInt($('.timer .sec').text());

    if(seconds > 0){
      seconds--;
    } else if(minutes>0){
      minutes--;
      seconds = 59;
    } else{
      submitAnswers();
    }

    if(minutes===5 && seconds===0){
      $('.timer').css({color: 'yellow'});
    } else if(minutes===1 && seconds===0){
      $('.timer').css({color: 'red'});
    }

    seconds = seconds < 10 ? "0" + seconds : seconds;

    $('.timer .min').text(minutes);
    $('.timer .sec').text(seconds);

  }, 1000);

});
