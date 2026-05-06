const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Disk Storage (For Products) ---
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const diskFileFilter = (req, file, cb) => {
    // Accept images only for disk upload
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const uploadDisk = multer({
    storage: diskStorage,
    fileFilter: diskFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// --- Memory Storage (For Audio/Meeting Minutes) ---
const memoryStorage = multer.memoryStorage();
const uploadMemory = multer({ 
    storage: memoryStorage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit for audio
});

module.exports = {
    uploadDisk,
    uploadMemory
};


