const {BrowserWindow} = require('electron');

function createWindow(){
  var win = new BrowserWindow({
    width: 700,
    height: 700,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('./renderer/viewQuestion.html');

  win.on('closed', function(){
    win = null;
  });

  return win;
}

module.exports = {
  createWindow: createWindow,
}
