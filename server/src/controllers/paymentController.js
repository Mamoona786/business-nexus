import Stripe from 'stripe';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { createNotification } from '../utils/notificationHelper.js';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const formatTransaction = (transaction) => ({
  id: transaction._id.toString(),
  userId: transaction.userId?.toString(),
  fromUserId: transaction.fromUserId?.toString() || null,
  toUserId: transaction.toUserId?.toString() || null,
  type: transaction.type,
  amount: transaction.amount,
  currency: transaction.currency,
  status: transaction.status,
  stripeSessionId: transaction.stripeSessionId,
  stripePaymentIntentId: transaction.stripePaymentIntentId,
  description: transaction.description,
  createdAt: transaction.createdAt,
  updatedAt: transaction.updatedAt
});

export const createDeposit = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      res.status(400);
      throw new Error('Valid deposit amount is required');
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      type: 'deposit',
      amount: Number(amount),
      currency: 'usd',
      status: 'Pending',
      description: 'Stripe wallet deposit'
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Business Nexus Wallet Deposit'
            },
            unit_amount: Math.round(Number(amount) * 100)
          },
          quantity: 1
        }
      ],
      metadata: {
        transactionId: transaction._id.toString(),
        userId: req.user._id.toString()
      },
      success_url: `${process.env.CLIENT_URL}/payments?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payments?cancelled=true`
    });

    transaction.stripeSessionId = session.id;
    await transaction.save();

    res.status(201).json({
      message: 'Deposit session created',
      checkoutUrl: session.url,
      transaction: formatTransaction(transaction)
    });
  } catch (error) {
    next(error);
  }
};

export const verifyDepositStatus = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const transaction = await Transaction.findOne({
      stripeSessionId: sessionId,
      userId: req.user._id
    });

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid' && transaction.status !== 'Completed') {
      transaction.status = 'Completed';
      transaction.stripePaymentIntentId = session.payment_intent || '';

      await transaction.save();

      await User.findByIdAndUpdate(req.user._id, {
        $inc: { walletBalance: transaction.amount }
      });

      await createNotification({
        req,
        recipient: req.user._id,
        sender: req.user._id,
        type: 'payment',
        title: 'Deposit completed',
        message: `Your wallet deposit of $${transaction.amount} was completed.`,
        link: '/payments',
        entityId: transaction._id,
        entityType: 'Transaction'
      });
    }

    if (session.payment_status === 'unpaid' && session.status === 'expired') {
      transaction.status = 'Failed';
      await transaction.save();

      await createNotification({
        req,
        recipient: req.user._id,
        sender: req.user._id,
        type: 'payment',
        title: 'Deposit failed',
        message: `Your wallet deposit of $${transaction.amount} failed or expired.`,
        link: '/payments',
        entityId: transaction._id,
        entityType: 'Transaction'
      });
    }

    const updatedUser = await User.findById(req.user._id).select('-password');

    res.status(200).json({
      message: 'Deposit status checked',
      paymentStatus: session.payment_status,
      transaction: formatTransaction(transaction),
      walletBalance: updatedUser.walletBalance || 0
    });
  } catch (error) {
    next(error);
  }
};

export const withdrawFunds = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      res.status(400);
      throw new Error('Valid withdraw amount is required');
    }

    const user = await User.findById(req.user._id);

    if ((user.walletBalance || 0) < Number(amount)) {
      res.status(400);
      throw new Error('Insufficient wallet balance');
    }

    user.walletBalance -= Number(amount);
    await user.save();

    const transaction = await Transaction.create({
      userId: req.user._id,
      type: 'withdraw',
      amount: Number(amount),
      currency: 'usd',
      status: 'Completed',
      description: 'Wallet withdrawal request'
    });

    await createNotification({
      req,
      recipient: req.user._id,
      sender: req.user._id,
      type: 'payment',
      title: 'Withdrawal completed',
      message: `Your withdrawal of $${transaction.amount} was completed.`,
      link: '/payments',
      entityId: transaction._id,
      entityType: 'Transaction'
    });

    res.status(201).json({
      message: 'Withdraw completed successfully',
      transaction: formatTransaction(transaction),
      walletBalance: user.walletBalance
    });
  } catch (error) {
    next(error);
  }
};

export const transferFunds = async (req, res, next) => {
  try {
    const { receiverId, amount } = req.body;

    if (!receiverId || !amount || Number(amount) <= 0) {
      res.status(400);
      throw new Error('Receiver and valid amount are required');
    }

    if (receiverId === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot transfer funds to yourself');
    }

    const sender = await User.findById(req.user._id);
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      res.status(404);
      throw new Error('Receiver not found');
    }

    if ((sender.walletBalance || 0) < Number(amount)) {
      res.status(400);
      throw new Error('Insufficient wallet balance');
    }

    sender.walletBalance -= Number(amount);
    receiver.walletBalance = (receiver.walletBalance || 0) + Number(amount);

    await sender.save();
    await receiver.save();

    const transaction = await Transaction.create({
      userId: req.user._id,
      fromUserId: req.user._id,
      toUserId: receiverId,
      type: 'transfer',
      amount: Number(amount),
      currency: 'usd',
      status: 'Completed',
      description: `Transfer to ${receiver.name}`
    });

    await createNotification({
      req,
      recipient: req.user._id,
      sender: req.user._id,
      type: 'payment',
      title: 'Payment sent',
      message: `You sent $${transaction.amount} to ${receiver.name}.`,
      link: '/payments',
      entityId: transaction._id,
      entityType: 'Transaction'
    });

    await createNotification({
      req,
      recipient: receiverId,
      sender: req.user._id,
      type: 'payment',
      title: 'Payment received',
      message: `${req.user.name} sent you $${transaction.amount}.`,
      link: '/payments',
      entityId: transaction._id,
      entityType: 'Transaction'
    });

    res.status(201).json({
      message: 'Transfer completed successfully',
      transaction: formatTransaction(transaction),
      walletBalance: sender.walletBalance
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionHistory = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { userId: req.user._id },
        { fromUserId: req.user._id },
        { toUserId: req.user._id }
      ]
    }).sort({ createdAt: -1 });

    const user = await User.findById(req.user._id).select('-password');

    res.status(200).json({
      walletBalance: user.walletBalance || 0,
      transactions: transactions.map(formatTransaction)
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionStatus = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.user._id },
        { fromUserId: req.user._id },
        { toUserId: req.user._id }
      ]
    });

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    res.status(200).json({
      transaction: formatTransaction(transaction)
    });
  } catch (error) {
    next(error);
  }
};
