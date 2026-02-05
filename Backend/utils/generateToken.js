const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Render (Production) detect karne ke liye
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('jwt', token, {
    httpOnly: true,
    // Render par HTTPS hota hai, isliye secure TRUE hona chahiye
    secure: isProduction ? true : false, 
    // Agar production h to 'none' (cross-domain ke liye), nahi to 'lax' (localhost ke liye)
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, 
  });
};

module.exports = generateToken;