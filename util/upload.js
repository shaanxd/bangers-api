const multer = require('multer');
const uuidv4 = require('uuid/v4');
const path = require('path');

const DEST = './public/images';

const getMulter = (folder) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `${DEST}/${folder}/`);
    },
    filename: (req, file, cb) => {
      cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
    },
  });

  return multer({ storage: storage });
};

module.exports = getMulter;
