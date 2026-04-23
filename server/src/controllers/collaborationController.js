import CollaborationRequest from '../models/CollaborationRequest.js';
import User from '../models/User.js';

const formatUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl || '',
  bio: user.bio || '',
  location: user.location || '',
  startupName: user.startupName || '',
  pitchSummary: user.pitchSummary || '',
  fundingNeeded: user.fundingNeeded || '',
  industry: user.industry || '',
  foundedYear: user.foundedYear || null,
  teamSize: user.teamSize || 1,
  investmentInterests: user.investmentInterests || [],
  investmentStage: user.investmentStage || [],
  totalInvestments: user.totalInvestments || 0,
  minimumInvestment: user.minimumInvestment || '',
  maximumInvestment: user.maximumInvestment || ''
});

const formatRequest = (request) => ({
  id: request._id.toString(),
  investorId: request.investorId?._id?.toString?.() || request.investorId.toString(),
  entrepreneurId: request.entrepreneurId?._id?.toString?.() || request.entrepreneurId.toString(),
  investor: request.investorId?.name ? formatUser(request.investorId) : undefined,
  entrepreneur: request.entrepreneurId?.name ? formatUser(request.entrepreneurId) : undefined,
  message: request.message,
  status: request.status,
  createdAt: request.createdAt,
  updatedAt: request.updatedAt
});

export const sendCollaborationRequest = async (req, res, next) => {
  try {
    if (req.user.role !== 'investor') {
      res.status(403);
      throw new Error('Only investors can send collaboration requests');
    }

    const { entrepreneurId, message } = req.body;

    if (!entrepreneurId || !message) {
      res.status(400);
      throw new Error('Entrepreneur id and message are required');
    }

    const entrepreneur = await User.findById(entrepreneurId);

    if (!entrepreneur || entrepreneur.role !== 'entrepreneur') {
      res.status(404);
      throw new Error('Entrepreneur not found');
    }

    if (req.user._id.toString() === entrepreneurId) {
      res.status(400);
      throw new Error('You cannot send a collaboration request to yourself');
    }

    const existingRequest = await CollaborationRequest.findOne({
      investorId: req.user._id,
      entrepreneurId
    });

    if (existingRequest) {
      res.status(400);
      throw new Error('A collaboration request already exists for this entrepreneur');
    }

    const request = await CollaborationRequest.create({
      investorId: req.user._id,
      entrepreneurId,
      message
    });

    const populatedRequest = await CollaborationRequest.findById(request._id)
      .populate('investorId')
      .populate('entrepreneurId');

    res.status(201).json({
      message: 'Collaboration request sent successfully',
      request: formatRequest(populatedRequest)
    });
  } catch (error) {
    next(error);
  }
};

export const getMyCollaborationRequests = async (req, res, next) => {
  try {
    const { type = req.user.role === 'entrepreneur' ? 'incoming' : 'outgoing' } = req.query;

    let filter = {};

    if (type === 'incoming') {
      filter = { entrepreneurId: req.user._id };
    } else if (type === 'outgoing') {
      filter = { investorId: req.user._id };
    } else {
      filter =
        req.user.role === 'entrepreneur'
          ? { entrepreneurId: req.user._id }
          : { investorId: req.user._id };
    }

    const requests = await CollaborationRequest.find(filter)
      .populate('investorId')
      .populate('entrepreneurId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      requests: requests.map(formatRequest)
    });
  } catch (error) {
    next(error);
  }
};

export const updateCollaborationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ['accepted', 'rejected', 'in_progress', 'closed'];

    if (!allowedStatuses.includes(status)) {
      res.status(400);
      throw new Error('Invalid status value');
    }

    const request = await CollaborationRequest.findById(req.params.id);

    if (!request) {
      res.status(404);
      throw new Error('Collaboration request not found');
    }

    const isInvestor = request.investorId.toString() === req.user._id.toString();
    const isEntrepreneur = request.entrepreneurId.toString() === req.user._id.toString();

    if (!isInvestor && !isEntrepreneur) {
      res.status(403);
      throw new Error('You are not allowed to update this request');
    }

    if ((status === 'accepted' || status === 'rejected') && !isEntrepreneur) {
      res.status(403);
      throw new Error('Only the entrepreneur can accept or reject a request');
    }

    request.status = status;
    await request.save();

    const populatedRequest = await CollaborationRequest.findById(request._id)
      .populate('investorId')
      .populate('entrepreneurId');

    res.status(200).json({
      message: 'Request status updated successfully',
      request: formatRequest(populatedRequest)
    });
  } catch (error) {
    next(error);
  }
};

export const getDeals = async (req, res, next) => {
  try {
    const filter =
      req.user.role === 'investor'
        ? {
            investorId: req.user._id,
            status: { $in: ['accepted', 'in_progress', 'closed'] }
          }
        : {
            entrepreneurId: req.user._id,
            status: { $in: ['accepted', 'in_progress', 'closed'] }
          };

    const requests = await CollaborationRequest.find(filter)
      .populate('investorId')
      .populate('entrepreneurId')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      deals: requests.map(formatRequest)
    });
  } catch (error) {
    next(error);
  }
};
