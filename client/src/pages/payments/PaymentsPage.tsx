import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CreditCard, ArrowDownToLine, ArrowUpFromLine, Send } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Transaction } from '../../types';
import {
  createDepositApi,
  verifyDepositStatusApi,
  withdrawFundsApi,
  transferFundsApi,
  getTransactionHistoryApi
} from '../../services/paymentService';

export const PaymentsPage: React.FC = () => {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadTransactions = async () => {
    try {
      const response = await getTransactionHistoryApi();
      setWalletBalance(response.walletBalance);
      setTransactions(response.transactions);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load transactions');
    }
  };

  useEffect(() => {
    loadTransactions();

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const cancelled = params.get('cancelled');

    if (cancelled) {
      toast.error('Payment was cancelled');
    }

    if (sessionId) {
      verifyDepositStatusApi(sessionId)
        .then((response) => {
          setWalletBalance(response.walletBalance);
          toast.success('Deposit status updated');
          window.history.replaceState({}, '', '/payments');
          loadTransactions();
        })
        .catch((error: any) => {
          toast.error(error?.response?.data?.message || 'Failed to verify deposit');
        });
    }
  }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = Number(depositAmount);

    if (!amount || amount <= 0) {
      toast.error('Enter a valid deposit amount');
      return;
    }

    setIsLoading(true);

    try {
      const response = await createDepositApi(amount);
      window.location.href = response.checkoutUrl;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Deposit failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = Number(withdrawAmount);

    if (!amount || amount <= 0) {
      toast.error('Enter a valid withdraw amount');
      return;
    }

    setIsLoading(true);

    try {
      const response = await withdrawFundsApi(amount);
      setWalletBalance(response.walletBalance);
      setWithdrawAmount('');
      toast.success(response.message);
      loadTransactions();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Withdraw failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = Number(transferAmount);

    if (!receiverId || !amount || amount <= 0) {
      toast.error('Receiver ID and valid amount are required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await transferFundsApi(receiverId, amount);
      setWalletBalance(response.walletBalance);
      setReceiverId('');
      setTransferAmount('');
      toast.success(response.message);
      loadTransactions();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Transfer failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeVariant = (status: Transaction['status']) => {
    if (status === 'Completed') return 'success';
    if (status === 'Failed') return 'error';
    return 'warning';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600">Manage deposits, withdrawals, transfers and transaction history</p>
      </div>

      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Wallet Balance</p>
              <h2 className="text-3xl font-bold text-gray-900">
                ${walletBalance.toFixed(2)}
              </h2>
            </div>
            <CreditCard size={36} className="text-primary-600" />
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <ArrowDownToLine size={20} />
              Deposit
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleDeposit} className="space-y-4">
              <Input
                label="Amount USD"
                type="number"
                min="1"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="50"
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                Pay with Stripe
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <ArrowUpFromLine size={20} />
              Withdraw
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <Input
                label="Amount USD"
                type="number"
                min="1"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="20"
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                Withdraw
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Send size={20} />
              Transfer
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleTransfer} className="space-y-4">
              <Input
                label="Receiver User ID"
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                placeholder="Paste receiver user id"
              />
              <Input
                label="Amount USD"
                type="number"
                min="1"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="10"
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                Transfer
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-3 pr-4">Type</th>
                  <th className="py-3 pr-4">Amount</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Description</th>
                  <th className="py-3 pr-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b">
                    <td className="py-3 pr-4 capitalize">{transaction.type}</td>
                    <td className="py-3 pr-4">
                      ${transaction.amount.toFixed(2)} {transaction.currency.toUpperCase()}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={getBadgeVariant(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">{transaction.description}</td>
                    <td className="py-3 pr-4">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}

                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
