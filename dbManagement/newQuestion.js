function createWindow(parentWin){
  const {BrowserWindow} = require('electron');

  var win = new BrowserWindow({
    width: 730,
    height: 785,
    parent: parentWin,
    modal: true,
    //resizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('./renderer/newQuestion.html');

  win.on('ready-to-show', win.show);

  win.on('closed', function(){
    win = null;
  });

  return win;
}

function newQuestion(knex, podaci, win){
  const {dialog} = require('electron');

  knex('Pitanja').insert(podaci).into('Pitanja')
  // unesi pitanje u bazu
  .then(function(rows1) { // kada je unijeto

    knex('Pitanja').select('*').where('predmet','=',podaci.predmet)
    .then(function(rows){
      if(rows.length <= 1){
        // ako je prvo pitanje iz predmeta
        // unesi predmet u bazu predmeta
        knex('Predmeti').insert({
          predmet: podaci.predmet,
          oblasti: podaci.oblast
        })
        .into('Predmeti')
        .then(function() {
          null;
        })
        .catch(function(err) {
          if(err) throw err;
        });
      } else {
        // ako je predmet vec u bazi
        knex('Predmeti').select('*').where('predmet','=',podaci.predmet)
        .then(function(r){
          var obl = r[0]['oblasti'].split('&|&');
          if(obl.indexOf(podaci.oblast) === -1){
            // ako oblast nije u bazi
            // unesi oblast u bazu
            knex('Predmeti').where('predmet', '=', podaci.predmet)
              .update({oblasti: r[0]['oblasti']+'&|&'+podaci.oblast})
              // oblasti je string rastavljen sa '&|&'
              .then(function(r){null})
              .catch(function(err){if(err){throw err;}})
          }
        })
        .catch(function(err) {
          if(err) throw err;
        })
      }

    })
    .catch(function(err){
      if(err) throw err;
    });


  })
  .catch(function(err) {
    if(err) throw err;
  });


  // Prikazi poruku o uspjesnoj akciji
  dialog.showMessageBoxSync(win, {
    type: 'info',
    title: 'Сачувано',
    message: 'Питање је успјешно сачувано у бази података'
  });

  // zatvori prozor
  win.close();
  win = null;
}

module.exports =
{
  createWindow: createWindow,
  newQuestion: newQuestion
}
