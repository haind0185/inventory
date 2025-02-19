// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

console.log("preload")
contextBridge.exposeInMainWorld("versions", {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    // 能暴露的不仅仅是函数，我们还可以暴露变量
});

contextBridge.exposeInMainWorld("electron", {
    onSyncBeforeQuit: (callback) => ipcRenderer.on("sync-before-quit", callback),
    syncDone: () => ipcRenderer.send("sync-done"),
});
