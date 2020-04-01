function createWindow(parentWin){
  const {BrowserWindow} = require('electron');

  var win = new BrowserWindow({
    width: 720,
    height: 750,
    minWidth: 690,
    parent: parentWin,
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('./renderer/viewQuestion.html');

  win.on('ready-to-show', win.show);

  win.on('closed', function(){
    win = null;
  });

  return win;
}

function getData(knex, e, selector){
  knex('Pitanja').select('*')
  .orderBy('id', 'desc')
  .where('predmet','LIKE', `%${selector.predmet}%`)
  .where('oblast','LIKE', `%${selector.oblast}%`)
  .where('textPitanja','LIKE',`%${selector.text}%`)
  .from('Pitanja')
  .limit(10) // only the last 10 results
  .then(function(rows){
    var data = [];
    for(let i=0; i<10 && i<rows.length; i++){
      data.push(rows[i]);
    }
    e.reply('quest-data', data);
  })
  .catch(function(err){
    if(err) throw err;
  })

}

function getSubj(knex, e){
  knex('Predmeti').select('*').from('Predmeti')
  .then(function(rows) {
    e.reply('subj-data', rows);
  })
}

function removeLesson(knex, predmet, oblast){
  knex('Predmeti').select('*')
    .where('predmet', '=', predmet)
    .then(function(rows){
      var lekcije = rows[0]['oblasti'].split('&|&');
      // ukloni lekciju iz niza
      lekcije.splice(lekcije.indexOf(oblast), 1);

      if(lekcije.length === 0){
        // ako nema vise oblasti/lekcija iz predmeta
        // ukloni predmet
        knex('Predmeti')
          .where('predmet', '=', predmet)
          .del()
          .then(function(){null;})
          .catch(function(err){if(err) throw err});
      } else{
        // ako nije poslednja oblast/lekcija
        var nove_oblasti = lekcije.join('&|&');
        // sacuvaj nove oblasti (bez izbacene)
        knex('Predmeti')
          .where('predmet', '=', predmet)
          .update({
            oblasti: nove_oblasti
          })
          .then(function(){null;})
          .catch(function(err){if(err) throw err;})
      }
    })
    .catch(function(err) {
      if(err) throw err;
    })
}

function removeQuestion(knex, id, win){
  const {dialog} = require('electron');

  var res = dialog.showMessageBoxSync(win, {
    type: 'question',
    title: 'Упозорење',
    buttons: ['Да', 'Hе'],
    message: 'Да ли сте сигурни да желите да обришете питање?',
    detail: 'Oво ће трајно уклонити питање из базе података.'
  });

  if(res===0){
    // korisnik je pritisnuo 'Да'

    // odredi predmet i oblast pitanja
    var OBLAST, PREDMET;
    knex('Pitanja').select('*')
      .where('id', '=', id)
      .then(function(rows) {
        PREDMET = rows[0]['predmet'];
        OBLAST = rows[0]['oblast'];
      })
      .catch(function(err) {
        if(err) throw err;
      })

    knex('Pitanja')
      .where('id','=',id)
      .del()
      .then(function(){
        // Prikazi poruku o uspjesnoj akciji
        dialog.showMessageBox(win, {
          type: 'info',
          title: 'Обрисано',
          message: 'Питање је успјешно уклоњено из базе података'
        });

        // pronadji sva pitanja iz iste oblasti
        knex('Pitanja')
          .select('predmet', 'oblast').from('Pitanja')
          .where('oblast', '=', OBLAST)
          .then(function(r1){
            if(r1.length === 0){
              // ako je poslednje pitanje iz oblasti/lekcije
              removeLesson(knex, PREDMET, OBLAST);
            }
          })
      })
      .catch(function(err){
        if(err) throw err;
      });
  }

}

function updateQuestion(knex, id, podaci, win){
  const {dialog} = require('electron');

  knex('Pitanja')
    .where('id', '=', id)
    .update(podaci)
    .then(function(){
      dialog.showMessageBoxSync(win, {
        type: 'info',
        title: 'Сачувано',
        message: 'Питање је успјешно сачувано у бази података'
      });
    })
    .catch(function(){if(err) throw err;});
}

module.exports = {
  createWindow: createWindow,
  getData: getData,
  getSubj: getSubj,
  removeQuestion: removeQuestion,
  updateQuestion: updateQuestion
}
