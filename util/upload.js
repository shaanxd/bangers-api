const multer = require('multer');
const uuidv4 = require('uuid/v4');
const path = require('path');

const DEST = './public/images/documents/';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DEST);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
