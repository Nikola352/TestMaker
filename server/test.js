// all functions from grader and server module are called here
const server = require('./server');
const grader = require('./grader');

function createWindow(parentWin){
  const {BrowserWindow} = require('electron');

  var win = new BrowserWindow({
    width: 670,
    height: 725,
    minWidth: 450,
    parent: parentWin,
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('./renderer/startTest.html');

  win.on('ready-to-show', win.show);

  win.on('closed', function(){
    win = null;
    server.closeServer();
  });

  return win;
}

function generatePasswords(ucenici){
  // returns an array of objects
  var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  var n = charset.length;
  var loginInfo = [];
  ucenici.forEach((ucenik, i) => {
    var pass = '';
    for(var i=0; i<8; i++){ // pass has 8 characters
      pass += charset.charAt(Math.floor(Math.random() * n));
    }
    loginInfo.push({
      ucenik: ucenik.ime,
      username: 'username' + ucenik.id,
      password: pass + (ucenik.id % 100)
    });
  });
  return loginInfo;
}

async function chooseQuestions(knex, testInfo, loginInfo){
  // returns an object
  // keys are students' usernames
  // values are lists of question objects
  var to_return = {};

  await knex('Pitanja').select('*')
    .whereIn('oblast', testInfo.oblasti)
    .then(function(pitanja) {
      for(info of loginInfo){ // for every student
        // shuffle the questions array randomly
        pitanja.sort(function(a,b) {
          // if func returns negative num, a is sorted before b
          // if it returns positive number, b is before a
          return (Math.random() - 0.5) // 50% chance
        });

        // get required number of elems from begining
        var arr = pitanja.slice(0, testInfo.brPitanja);

        try {
          arr.forEach((quest, i) => {
            quest.odgovori = quest.odgovori.split('&|&').slice(0,-1);
          });
        } catch (e) {
          console.log('Ignore this?  ', e);
        }

        to_return[info.username] = arr;
      }
    })
    .catch(function(err) {
      if(err) throw err;
    });

    return to_return;
}

async function startTest(info, testEmitter, knex, win){
  var loginInfo = generatePasswords(info.ucenici);

  var loggedinUsers = [];

  server.startServer(info.port, loginInfo, loggedinUsers, win);

  var url = server.getIP() + ':' +info.port;
  console.log(url);

  win.loadFile('./renderer/loginInfo.html')
    .then(function(){
      win.webContents.send('address-info', url);
      win.webContents.send('login-info', loginInfo);
    });

  testEmitter.on('start-test', function(){
    chooseQuestions(knex, info, loginInfo).then((questInfo)=>{
      server.startTest(questInfo, info.trajanje);
    });

    win.loadFile('./renderer/test.html')
      .then(function() {
        win.webContents.send('test-info', {info: info, loggedinUsers: loggedinUsers});
      })
      .catch(function(err) {
        if(err) console.log(error);
      });
  });

  testEmitter.on('end-test', function(){
    const {dialog} =  require('electron');

    var response = dialog.showMessageBoxSync(win, {
      type: 'question',
      title: 'Упозорење',
      buttons: ['Да', 'Hе'],
      message: 'Да ли сте сигурни да желите да завршите тест сада?',
      detail: 'Притисните "Да" ако су сви ученици завршили'
    });

    if(response === 0){ // 'Да'
      new Promise(server.endTest).then((answers)=>{
        win.loadFile('./renderer/test-results.html')
          .then(()=>{
            grader(answers, info, knex).then((results)=>{
              win.webContents.send('test-results', results);
            });
          })
          .catch((err)=>{
            if(err) console.log(err);
          });
      }) .catch((err)=>{
        if(err) console.log(err);
      });
    }
  });
}

function getCommandLine() {
  // returns command for opening file with default app
   switch (process.platform) {
      case 'darwin' : return 'open';
      case 'win32' : return 'start';
      case 'win64' : return 'start';
      default : return 'xdg-open';
   }
}

function printLoginInfo(html, win) {
  const {dialog} =  require('electron');
  const pdf = require('html-pdf');
  const sys = require('sys');
  const exec = require('child_process').exec;
  const path = require('path');

  dialog.showSaveDialog(win, {
    title: 'Export to PDF',
    filters: [
      {name: 'PDF', extensions: ['pdf']}
    ]
  }).then(function(obj) {
    if(!obj.canceled){
      var options = {'format': 'A4',
          'orientation': 'portrait'};
      pdf.create(html, options).toFile(obj.filePath, function(err, res) {
        exec(getCommandLine() + ' ' + obj.filePath);
      });
    }
  }).catch(function(err) {
    if(err) console.log(err);
  })
}

module.exports = {
  createWindow: createWindow,
  startTest: startTest,
  printLoginInfo: printLoginInfo
}
