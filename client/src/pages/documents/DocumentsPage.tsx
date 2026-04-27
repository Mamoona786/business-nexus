import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  PenLine,
  RefreshCcw
} from 'lucide-react';

import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Document, DocumentStatus } from '../../types';
import {
  deleteDocumentApi,
  getDocumentsApi,
  updateDocumentStatusApi,
  uploadDocumentApi,
  uploadDocumentVersionApi,
  uploadSignatureApi
} from '../../services/documentService';

const formatSize = (bytes: number) => {
  if (!bytes) return '0 KB';

  const kb = bytes / 1024;
  const mb = kb / 1024;

  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  return `${kb.toFixed(2)} KB`;
};

const statusVariant = (status: DocumentStatus) => {
  if (status === 'approved' || status === 'signed') return 'success';
  if (status === 'rejected') return 'error';
  if (status === 'pending_review') return 'warning';
  return 'secondary';
};

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const data = await getDocumentsApi();
      setDocuments(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setIsUploading(true);

      await uploadDocumentApi(
        selectedFile,
        title.trim() || selectedFile.name,
        'draft'
      );

      toast.success('Document uploaded successfully');
      setTitle('');
      setSelectedFile(null);
      await fetchDocuments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await deleteDocumentApi(documentId);
      toast.success('Document deleted');
      await fetchDocuments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleStatusChange = async (documentId: string, status: DocumentStatus) => {
    try {
      await updateDocumentStatusApi(documentId, status);
      toast.success('Status updated');
      await fetchDocuments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Status update failed');
    }
  };

  const handleVersionUpload = async (
    documentId: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      await uploadDocumentVersionApi(documentId, file);
      toast.success('New version uploaded');
      await fetchDocuments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Version upload failed');
    } finally {
      event.target.value = '';
    }
  };

  const handleSignatureUpload = async (
    documentId: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      await uploadSignatureApi(documentId, file);
      toast.success('Signature uploaded');
      await fetchDocuments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Signature upload failed');
    } finally {
      event.target.value = '';
    }
  };

  const totalUsed = documents.reduce((sum, doc) => sum + doc.fileSize, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Processing Chamber</h1>
          <p className="text-gray-600">
            Upload, preview, version, sign and track your business documents
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Upload Document</h2>
        </CardHeader>

        <CardBody>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Document title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />

            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />

            <Button
              leftIcon={<Upload size={18} />}
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Storage</h2>
          </CardHeader>

          <CardBody className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Documents</span>
                <span className="font-medium text-gray-900">{documents.length}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used</span>
                <span className="font-medium text-gray-900">{formatSize(totalUsed)}</span>
              </div>

              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-primary-600 rounded-full"
                  style={{ width: `${Math.min((totalUsed / (50 * 1024 * 1024)) * 100, 100)}%` }}
                />
              </div>

              <p className="text-xs text-gray-500">Limit example: 50 MB</p>
            </div>
          </CardBody>
        </Card>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">All Documents</h2>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RefreshCcw size={16} />}
                onClick={fetchDocuments}
              >
                Refresh
              </Button>
            </CardHeader>

            <CardBody>
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading documents...</p>
              ) : documents.length === 0 ? (
                <p className="text-sm text-gray-500">No documents uploaded yet.</p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => {
                    const docId = doc._id || doc.id || '';

                    return (
                      <div
                        key={docId}
                        className="p-4 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors duration-200"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-primary-50 rounded-lg">
                            <FileText size={24} className="text-primary-600" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {doc.title}
                              </h3>

                              <Badge variant={statusVariant(doc.status)} size="sm">
                                {doc.status.replace('_', ' ')}
                              </Badge>

                              <Badge variant="secondary" size="sm">
                                v{doc.version}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-500">
                              <span>{doc.fileName}</span>
                              <span>{formatSize(doc.fileSize)}</span>
                              <span>
                                Modified {new Date(doc.updatedAt).toLocaleDateString()}
                              </span>
                            </div>

                            {doc.signatureUrl && (
                              <a
                                href={doc.signatureUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block mt-2 text-xs text-primary-600 hover:underline"
                              >
                                View uploaded signature
                              </a>
                            )}

                            <div className="flex flex-wrap gap-2 mt-3">
                              <select
                                value={doc.status}
                                onChange={(e) =>
                                  handleStatusChange(docId, e.target.value as DocumentStatus)
                                }
                                className="border border-gray-300 rounded-md px-2 py-1 text-xs"
                              >
                                <option value="draft">Draft</option>
                                <option value="pending_review">Pending Review</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="signed">Signed</option>
                              </select>

                              <label className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md border border-gray-300 cursor-pointer hover:bg-gray-50">
                                <RefreshCcw size={14} />
                                New Version
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => handleVersionUpload(docId, e)}
                                />
                              </label>

                              <label className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md border border-gray-300 cursor-pointer hover:bg-gray-50">
                                <PenLine size={14} />
                                Upload Signature
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  onChange={(e) => handleSignatureUpload(docId, e)}
                                />
                              </label>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                              <Button variant="ghost" size="sm" className="p-2" aria-label="Preview">
                                <Eye size={18} />
                              </Button>
                            </a>

                            <a href={doc.fileUrl} download>
                              <Button variant="ghost" size="sm" className="p-2" aria-label="Download">
                                <Download size={18} />
                              </Button>
                            </a>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2 text-error-600 hover:text-error-700"
                              aria-label="Delete"
                              onClick={() => handleDelete(docId)}
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
