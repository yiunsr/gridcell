const { app, Menu, dialog, ipcMain } = require('electron')
resolve = require('path').resolve

const utils = require('./utils.js')

var mainWindow;

const template = [
  {
      label: 'File', 
      submenu: [
          {
              label: 'Open',
              click () { 
                  dialog.showOpenDialog({properties: ['openFile']}, function (filepaths) {
                      if (filepaths !== undefined) {
                        // var data = {api: "loadFile", action: "end", param: {filepath:filepaths[0]}}
                        // utils.sendRenderAPI(data);
                        var url = `${__dirname}/../assets/html/grid.html`;
                        url = resolve(url);
                        url += `?filepath=` + encodeURIComponent(filepaths[0]);

                        global.mainWindow.loadURL('file://' + url);
                      }
                  });
              }
          },
          {
              label: 'Export CSV', 
              click () { 
                  require('electron').shell.openExternal('https://electronjs.org') 
              }
          },
          {type: 'separator'},
          {label: 'Quit', click: function() {
              app.quit();}
          }
      ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteandmatchstyle' },
      { role: 'delete' },
      { role: 'selectall' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Go',
    submenu: [
      {label: 'Line..', click: function() {
        }
      }
    ]
  },
  {
    label: 'Debug',
    submenu: [
      {label: 'Test01', click: function() {
        var data = {api: "eval", action: "test", param: {eval:"test01();"}}
        utils.sendRenderAPI(data);
      }
      }
    ]
  },
  {
    role: 'window',
    submenu: [
      { role: 'minimize' },
      { role: 'close' }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { require('electron').shell.openExternal('https://electronjs.org') }
      }
    ]
  }
]
  
if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  })

  // Edit menu
  template[1].submenu.push(
    { type: 'separator' },
    {
      label: 'Speech',
      submenu: [
        { role: 'startspeaking' },
        { role: 'stopspeaking' }
      ]
    }
  )

  // Window menu
  template[3].submenu = [
    { role: 'close' },
    { role: 'minimize' },
    { role: 'zoom' },
    { type: 'separator' },
    { role: 'front' }
  ]
}
  
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)


