import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import { join } from 'path';
import server from '../backend/index';

let isSyncingBeforeQuit = false; // Biến để kiểm tra trạng thái đồng bộ

const startServer = () => {
    const port = 5000
    return server.listen(port, () => {
        console.log(`Express server is running at http://localhost:${port}`);
    });
}

var  sv = startServer()

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

let mainWindow = null
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

    console.log(iconPath)

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }

    globalShortcut.register('CommandOrControl+E', () => {
        restartServer()
    })

    // globalShortcut.register('CommandOrControl+F', () => {
    //     mainWindow.webContents.send('on-find')
    // });

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
    console.log("Sync xong, ứng dụng sẽ thoát.");
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