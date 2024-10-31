import moment from 'moment';
import InventoryController from "../controllers/InventoryController";
const express = require("express");
const router = express.Router();
const path = require('path');
const { app, dialog } = require('electron');
const fs = require('fs');

router.get("/", InventoryController.index);
router.get("/list", InventoryController.list);
router.get("/total", InventoryController.total);
router.get("/totalPrice", InventoryController.totalPrice);
router.get("/product", InventoryController.product);

router.get("/download-database", async (req, res) => {
    const databasePath = app.isPackaged ? path.join(process.resourcesPath, '../database.sqlite') : path.join(__dirname, '../../database.sqlite');
    let filename = moment().format('YYYYMMDD_HHmmss')+"_database.sqlite"

    const { filePath: savePath } = await dialog.showSaveDialog({
        title: 'Save Database File',
        defaultPath: filename,
        buttonLabel: 'Save'
    });

    if (!savePath) return res.json({path: databasePath});

    fs.copyFile(databasePath, savePath, (err) => {
        if (err) {
            console.error('Error saving the file:', err);
        } else {
            console.log('File saved successfully to', savePath);
        }
    });
    return res.json({path: databasePath})
});

const InventoryRouter = router;

export default InventoryRouter;
