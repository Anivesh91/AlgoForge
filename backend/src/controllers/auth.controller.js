const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { registerSchema, loginSchema } = require('../validators/auth.schema');
const { successResponse, errorResponse } = require('../utils/response');

const COOKIE_NAME = 'algoforge_token';

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'algoforge_development_secret_key_2026_super_secure',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return errorResponse(res, 'VALIDATION_ERROR', 'Email is already registered', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      passwordHash,
    });

    const token = generateToken(user._id);
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    return successResponse(res, user, 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      return errorResponse(res, 'AUTH_FAILED', 'Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(validatedData.password, user.passwordHash);
    if (!isMatch) {
      return errorResponse(res, 'AUTH_FAILED', 'Invalid email or password', 401);
    }

    const token = generateToken(user._id);
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    return successResponse(res, user);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  return successResponse(res, { message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
  return successResponse(res, req.user);
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};
