function createWindow(parentWin){
  const {BrowserWindow} = require('electron');

  var win = new BrowserWindow({
    width: 720,
    height: 750,
    minWidth: 400,
    parent: parentWin,
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('./renderer/classes.html');

  win.on('ready-to-show', win.show);

  win.on('closed', function(){
    win = null;
  });

  return win;
}

function getClasses(knex, e){
  knex('Razredi').select('*')
    .orderBy('razred')
    .from('Razredi')
    .then(function(rows) {
      e.reply('class-data', rows);
    })
    .catch(function(err) {
      if(err) throw err;
    });
}

function addClass(knex, arg, win){
  const {dialog} = require('electron');

  knex('Razredi')
    .insert({razred: arg})
    .into('Razredi')
    .then(function() {
      dialog.showMessageBox(win, { // Prikazi poruku o uspjesnoj akciji
        type: 'info',
        title: 'Сачувано',
        message: 'Одјељење је успјешно додато у базу података'
      });
    })
    .catch(function(err) {
      if(err) throw err;
    })
}

function removeClass(knex, arg, win){
  const {dialog} = require('electron');

  var res = dialog.showMessageBoxSync(win, {
    type: 'question',
    title: 'Упозорење',
    buttons: ['Да', 'Hе'],
    message: 'Да ли сте сигурни да желите да избришете одјељење?',
    detail: 'Oво ће трајно уклонити одјељење и све ученике у њему из базе података.'
  });

  if(res===0){
    // ako je odgovor 'Да', obrisi razred
    knex('Razredi')
      .where('razred','=',arg)
      .del()
      .then(function(){
        // obrisi sve ucenike iz razreda
        knex('Ucenici')
          .where('razred','=',arg)
          .del()
          .then(function(){
            // Prikazi poruku o uspjesnoj akciji
            dialog.showMessageBox(win, {
              type: 'info',
              title: 'Обрисано',
              message: 'Oдјељење је успјешно уклоњено из базе података'
            });
          })
          .catch(function(err){
            if(err) throw err;
          });
      })
      .catch(function(err){
        if(err) throw err;
      });
  }
}

function studentInfo(knex, className, win) {
  knex('Ucenici')
    .select('id', 'ime', 'prezime') .from('Ucenici')
    .where('razred', '=', className)
    .orderBy('prezime')
    .then(function(rows){
      win.webContents.send('student-info', rows);
    })
    .catch(function(err){
      if(err) throw err;
    })
}

function addStudent(knex, podaci, win){
  const {dialog} = require('electron');

  knex('Ucenici')
    .insert(podaci)
    .into('Ucenici')
    .then(function() {
      dialog.showMessageBox(win, {
        type: 'info',
        title: 'Сачувано',
        message: 'Подаци ученика су успјешно унијети у базу података'
      })
    })
    .catch(function(err){
      if(err) throw err;
    });
}

function removeStudent(knex, id, win){
  const {dialog} = require('electron');

  var res = dialog.showMessageBoxSync(win, {
    type: 'question',
    title: 'Упозорење',
    buttons: ['Да', 'Hе'],
    message: 'Да ли сте сигурни да желите да уклоните ученика?',
    detail: 'Oво ће трајно избрисати податке о ученику из базе података.'
  });

  if(res===0){
    // ako je odgovor 'Да', obrisi ucenika
    knex('Ucenici')
      .where('id','=',id)
      .del()
      .then(function(){
        // Prikazi poruku o uspjesnoj akciji
        dialog.showMessageBox(win, {
          type: 'info',
          title: 'Обрисано',
          message: 'Подаци о ученику су успјешно уклоњени из базе података'
        });
      }).catch(function(err){
        if(err) throw err;
      });
  }
}

function updateStudent(knex, id, podaci, win){
  const {dialog} = require('electron');

  knex('Ucenici')
    .where('id', '=', id)
    .update(podaci)
    .then(function(){
      dialog.showMessageBoxSync(win, {
        type: 'info',
        title: 'Сачувано',
        message: 'Подаци о ученику су успјешно сачувани у бази података'
      });
    })
    .catch(function(){if(err) throw err;});
}

function showTestResults(knex, id, win){
  // TODO: Open a new window with student's test results
  null;
}

module.exports = {
  createWindow: createWindow,
  getClasses: getClasses,
  addClass: addClass,
  removeClass: removeClass,
  studentInfo: studentInfo,
  addStudent: addStudent,
  removeStudent: removeStudent,
  updateStudent: updateStudent,
  showTestResults: showTestResults
}

// Раскиселишели ти се опанци?

// Чокањчићем ћеш ме, чокањчићем ћу те.
