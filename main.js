const electron = require('electron');
const {app, BrowserWindow, dialog, Menu} = electron;
const ipc = electron.ipcMain;
const path = require('path');
const events = require('events');
const newQuestion = require('./dbManagement/newQuestion');
const viewQuestion = require('./dbManagement/viewQuestion');
const studentM = require('./dbManagement/studentManagement');
const testM = require('./server/test');
const knexSetup = require('./dbManagement/db-setup');
var knex; // initialized when the app is ready
const {autoUpdater} = require('electron-updater');

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


// Application and Context Menus

const appMenuTemplate = [
  {role: 'fileMenu'},
  {
    label: 'Edit',
    submenu: [
      {role: 'cut'},
      {role: 'copy'},
      {role: 'paste'},
      {role: 'delete'},
      {type: 'separator'},
      {role: 'selectAll'}
    ]
  },
  {
    label: 'View',
    submenu: [
      {role: 'resetZoom'},
      {role: 'zoomIn'},
      {role: 'zoomOut'},
      {type: 'separator'},
      {role: 'togglefullscreen'},
      {type: 'separator'},
      {role: 'toggleDevTools'}
    ]
  },
  {
    label: 'Help',
    click: function(){
      console.log('Help');
    }
  }

]
const appMenu = Menu.buildFromTemplate(appMenuTemplate);

const ctxMenuTemplate = [
  {role: 'cut', accelerator: 'CmdOrCtrl+x'},
  {role: 'copy', accelerator: 'CmdOrCtrl+c'},
  {role: 'paste', accelerator: 'CmdOrCtrl+v'},
  {role: 'delete'},
  {role: 'selectAll', accelerator: 'CmdOrCtrl+a'},
  {type: 'separator'},
  {role: 'minimize'},
  {role: 'close'}
]
const ctxMenu = Menu.buildFromTemplate(ctxMenuTemplate);


// Application lifecycle

app.on('ready', function(){
  autoUpdater.checkForUpdatesAndNotify();

  knex = knexSetup(app);

  createMainWindow();

  Menu.setApplicationMenu(appMenu);

  win.mainWin.webContents.on('context-menu', function(){
    ctxMenu.popup(win.mainWin);
  });

});

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


// IPC handlers

ipc.on('open-newQuest-process', function(e){
  win.newQuestWin = newQuestion.createWindow(win.mainWin, ctxMenu);
});

ipc.on('open-viewQuest-process', function(e){
  win.viewQuestWin = viewQuestion.createWindow(win.mainWin);
});

ipc.on('open-student-process', function(e){
  win.studentWin = studentM.createWindow(win.mainWin, ctxMenu);
});

ipc.on('open-startTest-process', function(e){
  win.startTestWin = testM.createWindow(win.mainWin, ctxMenu);
})

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
  viewQuestion.removeQuestion(knex, arg, win.viewQuestWin)
    .then(function(info){
      e.reply('question-removed');
    });
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
  studentM.studentInfo(knex, arg, win);
});

ipc.on('remove-student', function(e, arg){
  studentM.removeStudent(knex, arg.id, arg.razred, win.studentWin);
});

ipc.on('update-student', function(e, arg){
  studentM.updateStudent(knex, arg.id, arg.podaci, win.studentWin);
});

ipc.on('view-student-results', function(e, arg){
  studentM.showTestResults(knex, arg, win.studentWin);
});

ipc.on('switch-view', function(e, arg){
  if(arg.view === 'students'){
    win.studentWin.loadFile('./renderer/students.html')
      .then(function(){
        win.studentWin.webContents.send('class-name', arg.class)
      });
  }
  else if(arg.view === 'classes'){
    win.studentWin.loadFile('./renderer/classes.html');
  }
});

// event emitter which handles different phases during exam
testEmitter = new events.EventEmitter();

ipc.on('start-server', function(e, arg){
  testM.startTest(arg, testEmitter, knex, win.startTestWin);
});

ipc.on('start-test', function(){
  testEmitter.emit('start-test');
});

ipc.on('end-test', function(){
  testEmitter.emit('end-test');
});

ipc.on('print-login-info', function(e, arg){
  testM.printLoginInfo(arg, win.startTestWin);
})
