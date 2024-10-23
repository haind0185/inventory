const path = require('path');
const { app } = require('electron');
const fs = require('fs');

// Get the correct base path for saving files
const basePath = app.isPackaged
    ? path.join(process.resourcesPath, 'uploads')
    : path.join(__dirname, 'uploads');

// Make sure the folder exists
if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
}

// Configure multer storage
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `${file.fieldname}-${uniqueSuffix}-${file.originalname}`;
        cb(null, filename);
    }
});

const up = multer({ storage: storage });

const pms = (req, res, next) => {
    if (req.file) {
        const filePath = path.join(__dirname, 'uploads', req.file.filename);
        fs.chmod(filePath, 0o666, (err) => {
            if (err) {
                console.error('Failed to set permissions:', err);
                return res.status(500).send('Error setting file permissions.');
            }
            next();
        });
    } else {
        next();
    }
};

export const upload = up
export const setPermissions = pms
