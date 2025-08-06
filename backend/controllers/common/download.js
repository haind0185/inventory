const { app, dialog } = require('electron');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const XLSX = require('xlsx');
const XLSXStyle = require('xlsx-style');

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
    try {
        await fsPromises.writeFile(filePath, buffer); // ✅ await được vì là Promise
        return await copy(filePath, filename);        // ✅ await copy sau khi lưu xong
    } catch (err) {
        console.error(err);
        throw new Error(`Lỗi đường dẫn: ${filePath}`);
    }
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

const downloadStyle = async (workbook, filename) => {
    // Ghi workbook vào buffer
    const buffer = XLSXStyle.write(workbook, { type: 'buffer', bookType: 'xlsx' });

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
    try {
        await fsPromises.writeFile(filePath, buffer); // ✅ await được vì là Promise
        return await copy(filePath, filename);        // ✅ await copy sau khi lưu xong
    } catch (err) {
        console.error(err);
        throw new Error(`Lỗi đường dẫn: ${filePath}`);
    }
};

export const Service = {
    download: download,
    downloadStyle: downloadStyle,
    copy: copy,
};
