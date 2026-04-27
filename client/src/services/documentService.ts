import { API } from './api';
import { Document, DocumentStatus } from '../types';

export const getDocumentsApi = async () => {
  const { data } = await API.get<Document[]>('/documents');
  return data;
};

export const uploadDocumentApi = async (
  file: File,
  title: string,
  status: DocumentStatus = 'draft'
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('status', status);

  const { data } = await API.post<Document>('/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return data;
};

export const uploadDocumentVersionApi = async (documentId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await API.post<Document>(`/documents/${documentId}/version`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return data;
};

export const updateDocumentStatusApi = async (
  documentId: string,
  status: DocumentStatus
) => {
  const { data } = await API.patch<Document>(`/documents/${documentId}/status`, {
    status
  });

  return data;
};

export const uploadSignatureApi = async (documentId: string, file: File) => {
  const formData = new FormData();
  formData.append('signature', file);

  const { data } = await API.post<Document>(`/documents/${documentId}/signature`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return data;
};

export const deleteDocumentApi = async (documentId: string) => {
  const { data } = await API.delete(`/documents/${documentId}`);
  return data;
};
