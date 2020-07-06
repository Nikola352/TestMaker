function createWindow(parentWin, contextMenu){
  const {BrowserWindow} = require('electron');

  var win = new BrowserWindow({
    width: 730,
    height: 785,
    parent: parentWin,
    modal: true,
    //resizable: false,
    show: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('./renderer/newQuestion.html');

  win.on('ready-to-show', win.show);

  win.webContents.on('context-menu', function(e, params){
    contextMenu.popup(win);
  });

  win.on('closed', function(){
    win = null;
  });

  return win;
}

function newQuestion(knex, podaci, win){
  const {dialog} = require('electron');

  knex('sqlite_sequence').select('*').where('name','=','Pitanja')
    .then(function(rows) {
      // id pitanja koje treba da se unese
      var id = rows[0]['seq'] + 1;

      if(podaci.slika != '../images/default.png')
        podaci.slika = savePicture(podaci.slika, id);

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

    }).catch(function(err){if(err) throw err});

}

function savePicture(oldPath, id){
  const fs = require('fs');
  const path = require('path');
  const process = require('process');

  var ext = path.extname(oldPath); // extension
  var newFileName =  `img${id}${ext}`;
  // copy image to "root/images" directory
  fs.copyFile(oldPath, path.join(process.cwd(),'images', newFileName),
    function(err) {
      if(err) throw err;
  });


  return ('../images/' + newFileName);
}

module.exports =
{
  createWindow: createWindow,
  newQuestion: newQuestion
}
