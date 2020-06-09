const { Op } = require('sequelize');

const CustomError = require('../error/error');
const { Document, User } = require('../models');
const {
  documentTypes: { DRIVING_LICENSE, OTHER_DOCUMENTS },
} = require('../constants/documentTypes');

const add_document = async (req, res, next) => {
  const {
    user: { id: userId },
    file: { filename },
    body: { type, issuedDate },
  } = req;
  if (!type || (type !== DRIVING_LICENSE && type !== OTHER_DOCUMENTS)) {
    throw new CustomError(400, 'Invalid document type.');
  }
  if (!issuedDate) {
    throw new CustomError(400, 'Please select an issued date');
  }
  const document = await Document.findOne({
    where: {
      userId,
      type: type,
    },
  });
  if (document) {
    await document.destroy();
  }
  const img = `/images/documents/${filename}`;
  await Document.create({
    userId,
    type,
    img,
    issuedDate,
  });
  const allDocuments = await Document.findAll({
    where: {
      userId,
    },
    attributes: {
      exclude: ['createdAt', 'updatedAt', 'userId'],
    },
  });
  res.status(200).json(allDocuments);
};

const get_user = async (req, res, next) => {
  const {
    user: { id: userId },
  } = req;
  const foundUser = await User.findByPk(userId, {
    attributes: {
      exclude: [
        'createdAt',
        'updatedAt',
        'facebookProvider',
        'googleProvider',
        'userType',
        'password',
        'isBlackListed',
      ],
    },
  });
  if (!foundUser) {
    throw new CustomError(400, 'User not found.');
  }
  res.status(200).json(foundUser);
};

const get_documents = async (req, res, next) => {
  const {
    user: { id: userId },
  } = req;
  const userDoc = await Document.findAll({
    where: { userId },
    attributes: { exclude: ['createdAt', 'updatedAt', 'userId'] },
  });
  res.status(200).json(userDoc);
};

module.exports = {
  add_document,
  get_user,
  get_documents,
};
