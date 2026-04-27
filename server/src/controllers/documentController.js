import Document from '../models/Document.js';
import { createNotification } from '../utils/notificationHelper.js';

const buildFileUrl = (req, folder, filename) => {
  return `${req.protocol}://${req.get('host')}/uploads/${folder}/${filename}`;
};

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Document file is required');
    }

    const { title, status } = req.body;

    const document = await Document.create({
      title: title || req.file.originalname,
      fileUrl: buildFileUrl(req, 'documents', req.file.filename),
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
      relatedUsers: [req.user._id],
      status: status || 'draft',
      version: 1,
      versions: [
        {
          version: 1,
          fileUrl: buildFileUrl(req, 'documents', req.file.filename),
          fileName: req.file.originalname,
          fileType: req.file.mimetype,
          fileSize: req.file.size,
          uploadedBy: req.user._id
        }
      ]
    });
    await createNotification({
      req,
      recipient: req.user._id,
      sender: req.user._id,
      type: 'document',
      title: 'Document uploaded',
      message: `${document.title} was uploaded successfully.`,
      link: '/documents',
      entityId: document._id,
      entityType: 'Document'
    });
    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
};

export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({
      relatedUsers: req.user._id
    })
      .populate('uploadedBy', 'name email role avatarUrl')
      .sort({ updatedAt: -1 });

    res.json(documents);
  } catch (error) {
    next(error);
  }
};

export const getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      relatedUsers: req.user._id
    }).populate('uploadedBy', 'name email role avatarUrl');

    if (!document) {
      res.status(404);
      throw new Error('Document not found');
    }

    res.json(document);
  } catch (error) {
    next(error);
  }
};

export const uploadNewVersion = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('New version file is required');
    }

    const document = await Document.findOne({
      _id: req.params.id,
      relatedUsers: req.user._id
    });

    if (!document) {
      res.status(404);
      throw new Error('Document not found');
    }

    const nextVersion = document.version + 1;
    const fileUrl = buildFileUrl(req, 'documents', req.file.filename);

    document.version = nextVersion;
    document.fileUrl = fileUrl;
    document.fileName = req.file.originalname;
    document.fileType = req.file.mimetype;
    document.fileSize = req.file.size;

    document.versions.push({
      version: nextVersion,
      fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user._id
    });

    await document.save();

    res.json(document);
  } catch (error) {
    next(error);
  }
};

export const updateDocumentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ['draft', 'pending_review', 'approved', 'rejected', 'signed'];

    if (!allowedStatuses.includes(status)) {
      res.status(400);
      throw new Error('Invalid document status');
    }

    const document = await Document.findOne({
      _id: req.params.id,
      relatedUsers: req.user._id
    });

    if (!document) {
      res.status(404);
      throw new Error('Document not found');
    }

    document.status = status;
    await document.save();

        await createNotification({
      req,
      recipient: req.user._id,
      sender: req.user._id,
      type: 'document',
      title: 'Document status updated',
      message: `${document.title} status changed to ${status}.`,
      link: '/documents',
      entityId: document._id,
      entityType: 'Document'
    });

    res.json(document);
  } catch (error) {
    next(error);
  }
};

export const uploadSignature = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Signature file is required');
    }

    const document = await Document.findOne({
      _id: req.params.id,
      relatedUsers: req.user._id
    });

    if (!document) {
      res.status(404);
      throw new Error('Document not found');
    }

    document.signatureUrl = buildFileUrl(req, 'signatures', req.file.filename);
    document.status = 'signed';

    await document.save();

    res.json(document);
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      relatedUsers: req.user._id
    });

    if (!document) {
      res.status(404);
      throw new Error('Document not found');
    }

    await document.deleteOne();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
};
