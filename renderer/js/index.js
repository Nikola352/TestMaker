const electron = require('electron');
const ipc = electron.ipcRenderer;

document.getElementById('newQuestBtn').addEventListener('click', function(){
  ipc.send('open-newQuest-process');
});

document.getElementById('viewQuestBtn').addEventListener('click', function(){
  ipc.send('open-viewQuest-process');
});

document.getElementById('createTestBtn').addEventListener('click', function(){
  ipc.send('open-createTest-process');
});

document.getElementById('viewTestBtn').addEventListener('click', function(){
  ipc.send('open-viewTest-process');
});

document.getElementById('startTestBtn').addEventListener('click', function(){
  ipc.send('open-startTest-process');
});

function handleFirstTab(e){
  if(e.keyCode === 9){
    document.body.classList.add('user-is-tabbing');
    window.removeEventListener('keydown', handleFirstTab);
  }
}

window.addEventListener('keydown', handleFirstTab);
