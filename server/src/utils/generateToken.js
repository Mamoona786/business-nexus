import jwt from 'jsonwebtoken';

const generateToken = (userId, role) => {
  return jwt.sign(
    {
      userId,
      role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'business-nexus',
      audience: 'business-nexus-users'
    }
  );
};

export default generateToken;
