import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("versions", {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
});

contextBridge.exposeInMainWorld("electron", {
    onSyncBeforeQuit: (callback) => ipcRenderer.on("sync-before-quit", callback),
    onFind: (callback) => ipcRenderer.on("on-find", callback),

    onSearch: (text) => ipcRenderer.send("on-search", text),
    onClear: () => ipcRenderer.send("on-clear"),
    syncDone: () => ipcRenderer.send("sync-done"),
});
