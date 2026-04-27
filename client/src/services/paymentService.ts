import { API } from './api';
import { Transaction } from '../types';

export const createDepositApi = async (amount: number): Promise<{
  message: string;
  checkoutUrl: string;
  transaction: Transaction;
}> => {
  const response = await API.post('/payments/deposit', { amount });
  return response.data;
};

export const verifyDepositStatusApi = async (
  sessionId: string
): Promise<{
  message: string;
  paymentStatus: string;
  transaction: Transaction;
  walletBalance: number;
}> => {
  const response = await API.get(`/payments/deposit/status/${sessionId}`);
  return response.data;
};

export const withdrawFundsApi = async (
  amount: number
): Promise<{
  message: string;
  transaction: Transaction;
  walletBalance: number;
}> => {
  const response = await API.post('/payments/withdraw', { amount });
  return response.data;
};

export const transferFundsApi = async (
  receiverId: string,
  amount: number
): Promise<{
  message: string;
  transaction: Transaction;
  walletBalance: number;
}> => {
  const response = await API.post('/payments/transfer', { receiverId, amount });
  return response.data;
};

export const getTransactionHistoryApi = async (): Promise<{
  walletBalance: number;
  transactions: Transaction[];
}> => {
  const response = await API.get('/payments/transactions');
  return response.data;
};

export const getTransactionStatusApi = async (
  transactionId: string
): Promise<{
  transaction: Transaction;
}> => {
  const response = await API.get(`/payments/transactions/${transactionId}/status`);
  return response.data;
};
