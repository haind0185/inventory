import { app, BrowserWindow, globalShortcut, ipcMain, dialog, autoUpdater } from 'electron';
import { join } from 'path';
import server from '../backend/index';
const log = require("electron-log");
const net = require('net');
const { updateElectronApp, UpdateSourceType } = require('update-electron-app')

let mainWindow = null
log.transports.file.resolvePath = () => `${app.getPath("userData")}/logs/main.log`;
log.transports.file.level = "debug";
  
updateElectronApp({
    updateSource: {
        type: UpdateSourceType.ElectronPublicUpdateService,
        repo: 'haind0185/inventory'
    },
    logger: require('electron-log'),
    notifyUser: false
})

autoUpdater.autoDownload = false;

autoUpdater.on('update-available', async () => {
    log.info("1. update-available");
    await mainWindow.webContents.send('update-available');
});

autoUpdater.on('update-downloaded', async () => {
    log.info("2. update-downloaded");
    await mainWindow.webContents.send('update-downloaded');
});

ipcMain.on("on-update-downloaded", () => {
    log.info("3. quitAndInstall");
    autoUpdater.quitAndInstall();
});

// Thiết lập Single Instance Lock để ngăn chạy nhiều instance
app.requestSingleInstanceLock();
app.on('second-instance', () => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
    }
});

let isSyncingBeforeQuit = false; // Biến để kiểm tra trạng thái đồng bộ

function checkPort(port) {
    return new Promise((resolve) => {
        const tester = net.createServer()
            .once('error', (err) => {
                if (err.code === 'EADDRINUSE') resolve(false);
                else resolve(false);
            })
            .once('listening', () => {
                tester.once('close', () => resolve(true)).close()
            })
            .listen(port);
    });
}

const startServer = async () => {
    const port = 5000
    const isPortAvailable = await checkPort(5000);
  
    if (!isPortAvailable) {
        log.error("🛑 Port 5000 is already in use. Exit application...");
        app.quit();
        return;
    }
    return server.listen(port, () => {
        console.log(`Express server is running at http://localhost:${port}`);
    });
}

var sv = startServer()

const restartServer = () => {
    if (sv) {
        sv.close(() => {
            console.log('Server stopped. Restarting...');
            sv = startServer()
        });
    } else {
        sv = startServer()
    }
}

if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = () => {
    const iconPath = app.isPackaged
    ? join(process.resourcesPath, 'icon.ico')
    : join(__dirname, '../../icon.ico');
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
        },
        icon: iconPath,
    });

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }

    globalShortcut.register('CommandOrControl+E', () => {
        restartServer()
    })

    // globalShortcut.register('CommandOrControl+L', () => {
    //     mainWindow.webContents.send('update-available');
    // })

    mainWindow.webContents.once('did-finish-load', () => {
    });


    mainWindow.on("close", (event) => {
        if (!isSyncingBeforeQuit) {
            event.preventDefault(); // Ngăn chặn thoát ngay lập tức
            isSyncingBeforeQuit = true; // Đánh dấu là đang đồng bộ trước khi thoát
            mainWindow.webContents.send("sync-before-quit"); // Gửi sự kiện xuống renderer
        } else {
            app.quit();
        }
    });
};

ipcMain.on("sync-done", () => {
    console.log("Sync completed.");
    app.quit();
});

ipcMain.on("on-search", async (event, text) => {
    if(text) {
        mainWindow.webContents.findInPage(text)
    } else {
        mainWindow.webContents.stopFindInPage("clearSelection")
    }
});

ipcMain.on("on-clear", () => {
    mainWindow.webContents.stopFindInPage("clearSelection")
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});