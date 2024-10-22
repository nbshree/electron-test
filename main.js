const {app, BrowserWindow, Tray, Menu, ipcMain} = require('electron');
const {keyboard, Key} = require('@nut-tree/nut-js');
const path = require('node:path')
const fs = require('fs')

let tray = null;
let window = null;
let clickInterval;

const createWindow = () => {
    window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    window.loadFile('index.html')
    window.on('minimize', function (event) {
        event.preventDefault();
        window.hide();
        createTray();
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

let key1 = 'Q';

ipcMain.on('saveKey', (_, v) => {
    console.info("v", v)
    key1 = v;
})

ipcMain.on('saveFile', (_, v) => {
    console.info("v", v)
    fs.writeFileSync('D://hello.txt', v);
})

ipcMain.handle('readFile', (_, v) => {
    console.info("v", v)
    return fs.readFileSync('D://hello.txt').toString();
})

function createTray() {
    const iconPath = path.join(__dirname, 'icon.png');

    tray = new Tray(iconPath); // 使用你的应用图标

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'show', click: function () {
                window.show();
                tray.destroy();
            }
        },
        {
            label: 'start', click: function () {
                clickInterval = setInterval(async () => {
                    await keyboard.pressKey(Key[key1]);
                    await keyboard.releaseKey(Key[key1]);
                }, 1000);
            }
        },
        {
            label: 'end', click: function () {
                clearInterval(clickInterval);
            }
        },
        {
            label: 'Quit', click: function () {
                app.quit();
            }
        }
    ]);

    tray.setToolTip('Your App Name');
    tray.setContextMenu(contextMenu);
}