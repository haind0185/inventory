window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        console.log('ctrl+f')
        e.preventDefault()
        ipcRenderer.send('on-find')
    }
})