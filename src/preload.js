import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("versions", {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
});

contextBridge.exposeInMainWorld("electron", {
    onSyncBeforeQuit: (callback) => ipcRenderer.on("sync-before-quit", callback),
    
    onSearch: (text) => ipcRenderer.send("on-search", text),
    onClear: () => ipcRenderer.send("on-clear"),
    syncDone: () => ipcRenderer.send("sync-done"),
    
    onUpdateAvailable: (callback) => ipcRenderer.on("update-available", callback), // 1
    onUpdateDownloaded: (callback) => ipcRenderer.on("update-downloaded", callback),  // 2
    quitAndInstall: () => ipcRenderer.send("on-update-downloaded"),  // 3
});
