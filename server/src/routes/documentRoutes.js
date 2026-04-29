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

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Document upload, versioning, signing and status APIs
 */

/**
 * @swagger
 * /documents:
 *   get:
 *     summary: Get documents
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Documents fetched successfully
 *
 *   post:
 *     summary: Upload a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 */
router
  .route('/')
  .get(getDocuments)
  .post(uploadDocumentFile.single('file'), uploadDocument);

/**
 * @swagger
 * /documents/{id}:
 *   get:
 *     summary: Get document by ID
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document fetched successfully
 *
 *   delete:
 *     summary: Delete document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted successfully
 */
router
  .route('/:id')
  .get(getDocumentById)
  .delete(deleteDocument);

/**
 * @swagger
 * /documents/{id}/status:
 *   patch:
 *     summary: Update document status
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/status', updateDocumentStatus);

/**
 * @swagger
 * /documents/{id}/version:
 *   post:
 *     summary: Upload new document version
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/version', uploadDocumentFile.single('file'), uploadNewVersion);

/**
 * @swagger
 * /documents/{id}/signature:
 *   post:
 *     summary: Upload document signature
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/signature', uploadSignatureFile.single('signature'), uploadSignature);

export default router;
