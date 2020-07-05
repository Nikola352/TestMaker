const electron = require('electron');
const ipc = electron.ipcRenderer;
window.$ = window.jQuery = require('jquery');

ipc.on('address-info', function(e, arg) {
  $('#ip').text(arg);
})

ipc.on('login-info', function(e, info) {
  info.forEach((item, i) => {
    $li = $('<li>');
    $('<p>').text(item.ucenik).appendTo($li);
    $('<p>').text(item.username).appendTo($li);
    $('<p>').text(item.password).appendTo($li);
    $('#login-list').append($li);
  });
});

$(document).ready(function() {
  $('#start-test').on('click', function() {
    ipc.send('start-test');
  });

  $('#print').on('click', function() {
    var html = '<ul style="list-style-type:none">';
    // html string of #login-list ul with pdf styles
    var $ul = $('<ul>');
    $('#login-list li').each(function() {
      var $li = $('<li>');
      $li.css({
        'display': 'inline-block',
        'margin': '20px',
        'font-size': '2em'
      })
      $li.html( $(this).html() );
      $ul.append($li);
    });

    html += $ul.html();
    html += '</ul>';

    ipc.send('print-login-info', html)
  })
})
