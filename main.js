const {
    app,
    BrowserWindow,
    globalShortcut,
    shell
} = require('electron')
const os = require('os')
const path = require('path')
const electron = require('electron')
const ipc = require('electron').ipcMain
const dialog = require('electron').dialog
var osvar = process.platform;
const fs = require('fs');
var rootDir = "Desktop" + path.sep + "QR" + path.sep
var a = "";
if (osvar == 'win32') {
    var appPath = app.getAppPath();
    var tmp = appPath.split("app.asar");
    var filePath = path.join(tmp[0], 'xdlab/settings.js');
}
if (osvar == 'darwin') {
    var appPath = app.getAppPath();
    var tmp = appPath.split(".app");
    if (tmp.length > 1) {
        var n = tmp[0].lastIndexOf("/");
        var filePath = tmp[0].substr(0, n + 1) + 'xdlab/settings.js';
        // var keyOpen = tmp[0].substr(0, n + 1) + 'xdlab/openVirtualKB.app'
        // var keyShow = tmp[0].substr(0, n + 1) + 'xdlab/showVirtualKB.app'
        // var keyHide = tmp[0].substr(0, n + 1) + 'xdlab/hideVirtualKB.app'
        // var keyClose = tmp[0].substr(0, n + 1) + 'xdlab/closeVirtualKB.app'
    } else {
        var filePath = path.join(appPath, 'xdlab/settings.js');
        // var keyOpen = path.join(appPath, 'xdlab/openVirtualKB.app');
        // var keyShow = path.join(appPath, 'xdlab/showVirtualKB.app');
        // var keyHide = path.join(appPath, 'xdlab/hideVirtualKB.app');
        // var keyClose = path.join(appPath, 'xdlab/closeVirtualKB.app');
    }
}
var settings = require(filePath);
var wid = settings.w;
var he = settings.h;
let mainWindow;
var cachePath = app.getPath('userData') + path.sep + 'Cache';
// Init Browser Window
function createWindow() {
    // const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize
    mainWindow = new BrowserWindow({
        show: true,
        enableLargerThanScreen: true,
        resizable: false,
        fullscreen: true,
        frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    // mainWindow.setBounds({
    //     x: 0,
    //     y: 0,
    //     width: wid,
    //     height: he
    // });
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    })
    mainWindow.on('closed', () => {
        mainWindow = null;
        app.quit();
        // shell.openItem(keyClose)
    })
    mainWindow.loadURL(settings.url);
    // mainWindow.loadFile("index.html");
    if (settings.devTools) mainWindow.webContents.openDevTools();
    ipc.on('excelAlert', function(event, arg) {
        const options = {
            type: 'none',
            buttons: ['OK'],
            defaultId: 0,
            message: 'Choose Excel File!',
        };
        dialog.showMessageBox(null, options, () => {});
    });
    ipc.on('folderAlert', function(event, arg) {
        const options = {
            type: 'none',
            buttons: ['OK'],
            defaultId: 0,
            message: 'Enter Folder Name!',
        };
        dialog.showMessageBox(null, options, () => {});
    });
    ipc.on('sendData', function(event, rcvData) {
        // console.log("recieve: ", rcvData)
        var base64data = rcvData.imgData.replace(/^data:image\/png;base64,/, "");
        var rootDir = "Desktop" + path.sep + "QR" + path.sep
        if (!fs.existsSync(path.join(os.homedir(), rootDir))) {
            fs.mkdirSync(path.join(os.homedir(), rootDir));
            fs.chmodSync(path.join(os.homedir(), rootDir), '0777');
        }
        rootDir = rootDir + rcvData.folderName + path.sep
        console.log("rootDir", rootDir)
        if (!fs.existsSync(path.join(os.homedir(), rootDir))) {
            fs.mkdirSync(path.join(os.homedir(), rootDir));
            fs.chmodSync(path.join(os.homedir(), rootDir), '0777');
        }
        fs.writeFile(path.join(os.homedir(), rootDir + rcvData.skuId + ".png"), base64data, 'base64', function(err) {
            console.log("error" + err);
            // console.log("path:" + path.join(os.homedir(), rootDir));
            if (err) throw err
            console.log('It\'s saved!')
            event.sender.send('sendDataSuccess', "success")
            rootDir = ""
        });
    });
    const ses = mainWindow.webContents.session
    ipc.on('clearcookies', function(event, arg) {
        console.log("in clearcookies")
        ses.clearStorageData({
                storages: 'cookies'
            })
            // shell.openItem(keyHide);
    });
    // mainWindow.webContents.on('new-window', (event) => {
    //     // event.preventDefault()
    //     console.log("new window opened")
    //         // shell.openItem(keyShow);
    // });
    if (mainWindow.webContents.isDestroyed()) {
        // shell.openItem(keyHide);
        console.log("closed")
    }
}
// shell.openItem(keyOpen);
// All Listeners
app.on('ready', () => {
    app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
    app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
    globalShortcut.register('Esc', () => {
        app.quit();
    })
    globalShortcut.register('Cmd+R', () => {
        mainWindow.webContents.reloadIgnoringCache();
    })
    createWindow();
    mainWindow.webContents.send('replykeyboard', "message")
});
ipc.on('save-dialog', function(event) {
    console.log("Dialog from local")
    const options = {
        title: 'Save an Image',
        filters: [{
            name: 'Images',
            extensions: ['png']
        }]
    }
    dialog.showSaveDialog(options, function(filename) {
        console.log("Dialog from local 1")
        if (filename) event.sender.send('saved-file', filename)
    })
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});