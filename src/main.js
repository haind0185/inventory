import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import server from '../backend/index';
// const log = require('electron-log');
// const { autoUpdater } = require('electron-updater');
const { updateElectronApp } = require('update-electron-app');

// ------------------------------------auto-update------------------------------------
// autoUpdater.logger = log;
// autoUpdater.logger.transports.file.level = 'info';
// autoUpdater.updateConfigPath = path.resolve(__dirname, '../../app-update.yml');

// // Check for updates and download
// autoUpdater.on('checking-for-update', () => {
//     log.info('Hai: checking for update.');
// });

// autoUpdater.on('update-available', (info) => {
//     log.info('Hai: update available.');
// });

// autoUpdater.on('update-not-available', (info) => {
//     log.info('Hai: update not available.');
// });

// autoUpdater.on('error', (err) => {
//     log.error('Hai: error in auto-updater. ' + err);
// });

// autoUpdater.on('download-progress', (progressObj) => {
//     let log_message = "Download speed: " + progressObj.bytesPerSecond;
//     log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
//     log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
//     log.info(log_message);
// });

// autoUpdater.on('update-downloaded', (info) => {
//     log.info('Hai: Update downloaded. Quitting and installing...');
//     // Force update installation
//     autoUpdater.quitAndInstall();
// });
// ------------------------------------auto-update------------------------------------

// setup server
const port = 5000

server.listen(port, () => {
    console.log(`Express server is running at http://localhost:${port}`);
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
        },
    });

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    // auto-update
    // autoUpdater.checkForUpdatesAndNotify();
    updateElectronApp({
        repo: 'haind0185/inventory',
        logger: require('electron-log')
    });

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
