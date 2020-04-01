const electron = require('electron');
const {app, BrowserWindow, dialog} = electron;
const ipc = electron.ipcMain;
const path = require('path');
const newQuestion = require('./dbManagement/newQuestion');
const viewQuestion = require('./dbManagement/viewQuestion');
const studentM = require('./dbManagement/studentManagement');
// database
const knex = require('knex')({
  client: 'sqlite3',
  connection:{
    filename: 'data.sqlite3'
  },
  useNullAsDefault: true
});

// Windows
var win = {
  mainWin: null,
  newQuestWin: null,
  viewQuestWin: null,
  studentWin: null,
  startTestWin: null,
}

function createMainWindow(){
  win.mainWin = new BrowserWindow({
    width: 750,
    height: 590,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.mainWin.loadFile('renderer/index.html');

  win.mainWin.on('ready-to-show', win.mainWin.show)

  win.mainWin.on('closed', function(){
    win.mainWin = null;
    //app.quit();
  });
}


// IPC handlers

ipc.on('open-newQuest-process', function(e){
  win.newQuestWin = newQuestion.createWindow(win.mainWin);
});

ipc.on('open-viewQuest-process', function(e){
  win.viewQuestWin = viewQuestion.createWindow(win.mainWin);
});

ipc.on('open-student-process', function(e){
  win.studentWin = studentM.createWindow(win.mainWin);
});

ipc.on('choose-picture', function(e, arg){
  dialog.showOpenDialog(win.newQuestWin, {
    title: 'Izaberi sliku',
    buttonLabel: 'Choose',
    filters: [
      {name: 'Images', extensions: ['jpg', 'png', 'gif']}
    ],
  }).then(function(result){
    if(!result.canceled){
      e.reply('picture-path-ready', result.filePaths[0]);
    }
  }).catch(function(err){
    console.log('Error here: ', err);
  });

});

ipc.on('input-error', function(){
  dialog.showErrorBox('Грешка', 'Молим попуните сва поља исправно');
});

ipc.on('invalid-number', function() {
  dialog.showErrorBox('Грешка', 'Унесите број између 1 и 30');
})

ipc.on('add-new-question', function(e, arg) {
  newQuestion.newQuestion(knex, arg, win.newQuestWin);
});

ipc.on('get-question-data', function(e, arg){
  viewQuestion.getData(knex, e, arg);
});

ipc.on('get-subj-data', function(e){
  viewQuestion.getSubj(knex, e);
});

ipc.on('remove-question', function(e, arg){
  viewQuestion.removeQuestion(knex, arg, win.viewQuestWin);
});

ipc.on('update-question', function(e, arg){
  viewQuestion.updateQuestion(knex, arg.id, arg.podaci, win.viewQuestWin);
});

ipc.on('get-class-data', function(e){
  studentM.getClasses(knex, e);
});

ipc.on('add-class', function(e, arg){
  studentM.addClass(knex, arg, win.studentWin);
})

ipc.on('remove-class', function(e, arg){
  studentM.removeClass(knex, arg, win.studentWin);
});

ipc.on('add-student', function(e, arg){
  studentM.addStudent(knex, arg, win.studentWin);
});

ipc.on('get-student-data', function(e, arg){
  studentM.studentInfo(knex, arg, win.studentWin);
});

ipc.on('remove-student', function(e, arg){
  studentM.removeStudent(knex, arg, win.studentWin);
});

ipc.on('update-student', function(e, arg){
  studentM.updateStudent(knex, arg.id, arg.podaci, win.studentWin);
});

ipc.on('view-student-results', function(e, arg){
  studentM.showTestResults(knex, arg, win.studentWin);
});

ipc.on('switch-view', function(e, arg){
  if(arg.view==='students'){
    win.studentWin.loadFile('./renderer/students.html')
      .then(function(){
        win.studentWin.webContents.send('class-name', arg.class)
      });
  }
  else if(arg.view==='classes'){
    win.studentWin.loadFile('./renderer/classes.html');
  }

});


// Application lifecycle

app.on('ready', createMainWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function() {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win.mainWin === null) {
    createMainWindow()
  }
})
