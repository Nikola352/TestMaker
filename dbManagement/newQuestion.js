function createWindow(parentWin){
  const {BrowserWindow} = require('electron');

  var win = new BrowserWindow({
    width: 755,
    height: 800,
    parent: parentWin,
    modal: true,
    resizable: false,
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
  .then(function(rows) {
    console.log(rows);
  })
  .catch(function(err) {
    if(err) throw err;
  });

  dialog.showMessageBoxSync(win, {
    type: 'info',
    title: 'Сачувано',
    message: 'Питање је успјешно сачувано у бази података'
  });

  win.close();
  win = null;
}

module.exports =
{
  createWindow: createWindow,
  newQuestion: newQuestion
}
