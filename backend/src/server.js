import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import routes from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static(join(__dirname, '../../uploads')));

// API routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mekkompis API körs!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: err.message || 'Något gick fel på servern'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`<Í  Mekkompis backend körs på http://localhost:${PORT}`);
  console.log(`=Ê API endpoint: http://localhost:${PORT}/api`);
  console.log(`=¼  Bilder: http://localhost:${PORT}/uploads`);
});
