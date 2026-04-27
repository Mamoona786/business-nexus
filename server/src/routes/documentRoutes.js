import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  uploadNewVersion,
  updateDocumentStatus,
  uploadSignature,
  deleteDocument
} from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const documentStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/documents');
  },
  filename(req, file, cb) {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueName);
  }
});

const signatureStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/signatures');
  },
  filename(req, file, cb) {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/jpg'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, Word, Excel, PNG and JPG files are allowed'));
  }
};

const uploadDocumentFile = multer({
  storage: documentStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

const uploadSignatureFile = multer({
  storage: signatureStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

router.use(protect);

router
  .route('/')
  .get(getDocuments)
  .post(uploadDocumentFile.single('file'), uploadDocument);

router
  .route('/:id')
  .get(getDocumentById)
  .delete(deleteDocument);

router.patch('/:id/status', updateDocumentStatus);

router.post('/:id/version', uploadDocumentFile.single('file'), uploadNewVersion);

router.post('/:id/signature', uploadSignatureFile.single('signature'), uploadSignature);

export default router;
