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

function newQuestion(){
  continue;
}

module.exports =
{
  createWindow: createWindow,
  newQuestion: newQuestion
}
