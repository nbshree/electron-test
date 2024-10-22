const {app, BrowserWindow, Tray, Menu, ipcMain,dialog} = require('electron');
const {keyboard, Key} = require('@nut-tree/nut-js');
const path = require('node:path')
const fs = require('fs')
const { autoUpdater } = require('electron-updater')
const logger = require('electron-log')

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

app.on('ready', ()=>{
    createWindow();
    checkUpdate();
});

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

function checkUpdate(){
    logger.info("test")

    // autoUpdater.updateConfigPath = path.join(__dirname, 'dev-app-update.yml');
    //
    // console.info("path.join(__dirname, 'dev-app-update.yml')", path.join(__dirname, 'dev-app-update.yml'))
    // autoUpdater.allowPrerelease = true;
    // autoUpdater.forceDevUpdateConfig = true;
    // // //检测更新
    // autoUpdater.checkForUpdatesAndNotify();

    // 检测是否需要更新
    autoUpdater.on('checking-for-update', () => {
        logger.info("checking-for-update")
    });

    //监听'error'事件
    autoUpdater.on('error', (err) => {
        logger.info("error",err)
    })

    //监听'update-available'事件，发现有新版本时触发
    autoUpdater.on('update-available', () => {
        logger.info("found new version")
        autoUpdater.downloadUpdate()
    })

    //默认会自动下载新版本，如果不想自动下载，设置autoUpdater.autoDownload = false

    //监听'update-downloaded'事件，新版本下载完成时触发
    autoUpdater.on('update-downloaded', () => {
        logger.info("update-downloaded", 22222222222)
        dialog.showMessageBox({
            type: 'info',
            title: '应用更新',
            message: '发现新版本，是否更新？',
            buttons: ['是', '否']
        }).then((buttonIndex) => {
            if(buttonIndex.response == 0) {  //选择是，则退出程序，安装新版本
                autoUpdater.quitAndInstall()
                app.quit()
            }
        })
    })

    // 我们需要主动触发一次更新检查
    ipcMain.on('checkForUpdate', () => {
        logger.info("checkForUpdate", 22222222222)
        // 当我们收到渲染进程传来的消息，主进程就就进行一次更新检查
        autoUpdater.checkForUpdates().then((res)=>{
            logger.info("checkForUpdates", res)
        });
        // autoUpdater.checkForUpdatesAndNotify();
    });
}