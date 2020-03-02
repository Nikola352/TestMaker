function createWindow(parentWin){
  const {BrowserWindow} = require('electron');

  var win = new BrowserWindow({
    width: 720,
    height: 750,
    parent: parentWin,
    modal: true,
    //resizable: false,
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
    var data = [];
    for(let i=0; i<10 && i<rows.length; i++){
      data.push(rows[i]);
    }
    e.reply('subj-data', data);
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
