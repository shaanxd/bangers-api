const { Op } = require('sequelize');

const { Document } = require('../models');
const {
  documentTypes: { DRIVING_LICENSE, OTHER_DOCUMENTS }
} = require('../constants/documentTypes');

const add_document = async (req, res, next) => {
  try {
    const {
      user: { id: userId },
      file: { filename },
      body: { type }
    } = req;
    if (!type || (type !== DRIVING_LICENSE && type !== OTHER_DOCUMENTS)) {
      return res.status(400).json({
        message: 'Invalid document type'
      });
    }
    const document = await Document.findOne({
      where: {
        userId,
        type: type
      }
    });
    if (document) {
      return res.status(400).json({
        message: 'You have already added a document of selected type.'
      });
    }
    const img = `/images/documents/${filename}`;
    const createdDocument = await Document.create({
      userId,
      type,
      img
    });
    const allDocuments = await Document.findAll({
      where: {
        userId
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'userId']
      }
    });
    res.status(200).json(allDocuments);
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error. Please try again.'
    });
  }
};

module.exports = {
  add_document
};
