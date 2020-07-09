const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const os = require('os');
const ifaces = os.networkInterfaces();
const socketio = require('socket.io');
const electronApp = require('electron').app;

// lookup computers address
var IP_ADDRESS;
Object.keys(ifaces).forEach(function (ifname) {
  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }
    // I really hope this happenes only once
    IP_ADDRESS = iface.address;
  });
});

function getIP() {
  return IP_ADDRESS;
}

var TEST_STARTED = false;  // true when test is in progress
var answers = {};
var finished = {};  // username: boolean
var submissionCount = 0;
var loginCount = 0;

var sessionMiddleware = session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
});

var app = express();
var server;  // server is started in startServer function
var io;  // socket
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(sessionMiddleware);
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(electronApp.getPath('userData'), 'images')));

app.get('/', function(req, res) {
  if(req.session.loggedin === true){
    if(TEST_STARTED){
      res.redirect('/test');
    } else{
      if(finished[req.session.username]){
        res.sendFile(path.join(__dirname, 'views', 'finish.html'));
      } else{
        res.sendFile(path.join(__dirname, 'views', 'success.html'));
      }
    }
  } else{
    // login page
    res.sendFile(path.join(__dirname, 'views','login.html'));
  }
});

function startServer(port, loginInfo, loggedinUsers, win){
  app.post('/', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    loginInfo.forEach((user, i) => {
      if(user.username === username && user.password === password){
        req.session.loggedin = true;
        req.session.username = username;

        finished[username] = false;

        answers[username] = {};

        var id = username.substr(8);
        loggedinUsers.push(id);
        win.webContents.send('user-loggedin', id);
        loginCount++;
      }
    });

    res.redirect('/')
    res.end();
  });

  server = app.listen(port);
  io = socketio.listen(server);

  io.use(function(socket, next){
    sessionMiddleware(socket.request, socket.request.res || {}, next)
  });

  io.on('connection', function(socket) {
    socket.on('submit', function(odgovori){
      answers[socket.request.session.username] = odgovori;
      finished[socket.request.session.username] = true;
    });
    socket.on('successful-submission', function(){
      submissionCount++;
      if(submissionCount >= loginCount){
        server.close();
      }
    });
  });
}

function startTest(questInfo, duration){
  TEST_STARTED = true;
  io.sockets.emit('start-test');

  app.get('/test', function(req, res) {
    if(req.session.loggedin === true){
      if(finished[req.session.username]){
        // has submited the answers
        res.sendFile(path.join(__dirname, 'views', 'finish.html'));
      } else{
        var username = req.session.username;
        res.render('test', {questions:questInfo[username], duration:duration});
      }
    } else{
      // not logged in
      res.redirect('/');
    }
  });
}

function endTest(resolve, reject){
  io.emit('end-test');

  TEST_STARTED = false;

  setInterval(function() {
    if(submissionCount >= loginCount){
      resolve(answers);
    }
  }, 1000);
}

function closeServer(){
  // server can be closed from multiple places
  // if this function is fired after the server
  // is already closed, exception is thrown
  try {
    server.close();
  } catch(err){
    if(err) console.log(err);
  }
}

module.exports = {
  startServer: startServer,
  startTest: startTest,
  endTest: endTest,
  getIP: getIP,
  closeServer: closeServer
};
