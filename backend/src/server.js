import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import routes from './routes.js';
import { authenticateToken } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - only allow specific origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173']; // Development default

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'CORS policy: Origin not allowed';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static(join(__dirname, '../../uploads')));

// API routes with authentication
app.use('/api', authenticateToken, routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mekkompis API k�rs!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: err.message || 'N�got gick fel p� servern'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`<�  Mekkompis backend k�rs p� http://localhost:${PORT}`);
  console.log(`=� API endpoint: http://localhost:${PORT}/api`);
  console.log(`=�  Bilder: http://localhost:${PORT}/uploads`);
});
