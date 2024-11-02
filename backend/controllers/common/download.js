const { app, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Sample file name
// const filename = sampleData.xlsx

const download = async (workbook, filename) => {
    // Ghi workbook vào buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Xác định đường dẫn lưu file
    const directory = app.isPackaged
        ? path.join(process.resourcesPath, 'downloads')
        : path.join(__dirname, 'downloads');

    const filePath = path.join(directory, filename);

    if (!fs.existsSync(directory)) {
        console.log('Directory:', filePath);
        fs.mkdirSync(directory, { recursive: true });
    }

    console.log('Server path:', filePath);
    // Lưu file vào hệ thống server
    const resSave = fs.writeFile(filePath, buffer, async (err) => {
        if (err) {
            console.log(err);
            throw new Error(`Lỗi đường dẫn: ${filePath}`);
        } else {
            // Copy file từ server vào local
            return await copy(filePath, filename);
        }
    });

    return resSave
};

const copy = async (serverPath, filename) => {
    const { filePath: localPath } = await dialog.showSaveDialog({
        title: 'Save File',
        defaultPath: filename,
        buttonLabel: 'Save',
    });

    if (!localPath) {
        return false;
    }

    console.log(`Copy from: ${serverPath}, to: ${localPath}`);
    fs.copyFile(serverPath, localPath, (err) => {
        if (err) {
            throw new Error(`Lỗi đường dẫn: ${serverPath}`);
        } else {
            return localPath;
        }
    });
    return localPath;
};

export const Service = {
    download: download,
    copy: copy,
};
