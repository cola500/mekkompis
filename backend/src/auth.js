import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Check if authentication is enabled
const authEnabled = () => {
  return process.env.JWT_SECRET && process.env.AUTH_PASSWORD_HASH;
};

// Middleware to authenticate JWT token
export const authenticateToken = (req, res, next) => {
  // Skip authentication for auth endpoints
  if (req.path.startsWith('/auth/')) {
    return next();
  }

  // If auth is not enabled (local development), skip authentication
  if (!authEnabled()) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access token krävs',
      authRequired: true
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        error: 'Ogiltig eller utgången token',
        authRequired: true
      });
    }
    req.user = user;
    next();
  });
};

// Login endpoint handler
export const login = async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Lösenord krävs' });
  }

  // Verify password against hash in environment variable
  const passwordHash = process.env.AUTH_PASSWORD_HASH;

  if (!passwordHash) {
    return res.status(500).json({
      error: 'Autentisering är inte konfigurerad på servern'
    });
  }

  try {
    const isValid = await bcrypt.compare(password, passwordHash);

    if (!isValid) {
      return res.status(401).json({ error: 'Felaktigt lösenord' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { authenticated: true, timestamp: Date.now() },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    res.json({
      token,
      expiresIn: '7d',
      message: 'Inloggning lyckades'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Inloggning misslyckades' });
  }
};

// Verify token endpoint
export const verifyToken = (req, res) => {
  // If auth is not enabled, return success
  if (!authEnabled()) {
    return res.json({ valid: true, authEnabled: false });
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.json({ valid: false, authEnabled: true });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    if (err) {
      return res.json({ valid: false, authEnabled: true });
    }
    res.json({ valid: true, authEnabled: true });
  });
};

// Helper function to generate password hash (for setup)
export const generatePasswordHash = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Check if auth is configured
export const getAuthStatus = (req, res) => {
  res.json({
    authEnabled: authEnabled(),
    message: authEnabled()
      ? 'Autentisering är aktiverad'
      : 'Autentisering är inaktiverad (lokal utveckling)'
  });
};
