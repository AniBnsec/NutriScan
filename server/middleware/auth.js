const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

// Helper: safely check if a string is a valid MongoDB ObjectId
const isObjectId = (str) => mongoose.Types.ObjectId.isValid(str) && /^[a-f\d]{24}$/i.test(str);

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Decode without verification first (handles both Clerk RS256 and legacy HS256)
    let decoded;
    try {
      // Try HS256 verification (legacy custom auth)
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'nutriscan_secret_key_2024');
    } catch (e) {
      // Fallback: decode without verification (Clerk RS256 tokens)
      decoded = jwt.decode(token);
    }

    if (!decoded) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    // Check token expiry
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ message: 'Token expired' });
    }

    let user = null;

    // Case 1: Standard MongoDB ObjectId (legacy JWT login)
    if (decoded.id && isObjectId(decoded.id)) {
      user = await User.findById(decoded.id).select('-password');
    }

    // Case 2: Clerk token (sub = "user_2xxxxx")
    if (!user) {
      const clerkId = decoded.sub;
      const email = decoded.email;
      const name = decoded.name || decoded.full_name || (email ? email.split('@')[0] : 'User');

      if (clerkId) {
        // Try to find existing user by clerkId field
        user = await User.findOne({ clerkId }).select('-password').catch(() => null);

        // Try to find by email if clerkId not matched
        if (!user && email) {
          user = await User.findOne({ email: email.toLowerCase() }).select('-password').catch(() => null);
          // Link clerkId to existing email-based account
          if (user && !user.clerkId) {
            await User.findByIdAndUpdate(user._id, { clerkId }).catch(() => {});
          }
        }

        // Auto-create user for Clerk sign-in (first-time login)
        if (!user) {
          const userEmail = email || `${clerkId}@clerk.nutriscan.app`;
          user = await User.create({
            clerkId,
            name,
            email: userEmail,
            password: `clerk_${clerkId}_${Date.now()}`, // non-guessable placeholder
            calorieGoal: 2000,
          }).catch(() => null);

          // If email already exists (race condition), find by email
          if (!user && email) {
            user = await User.findOne({ email: email.toLowerCase() }).select('-password').catch(() => null);
          }
        }
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
