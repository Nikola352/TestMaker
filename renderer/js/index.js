const electron = require('electron');
const ipc = electron.ipcRenderer;

document.getElementById('newQuestBtn').addEventListener('click', function(){
  ipc.send('open-newQuest-process');
});

document.getElementById('viewQuestBtn').addEventListener('click', function(){
  ipc.send('open-viewQuest-process');
});

document.getElementById('studentsBtn').addEventListener('click', function(){
  ipc.send('open-student-process');
});

document.getElementById('startTestBtn').addEventListener('click', function(){
  ipc.send('open-startTest-process');
});
