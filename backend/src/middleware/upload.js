const multer = require('multer');

// Memory storage to access file.buffer
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

module.exports = upload;
