import express from 'express';
import multer from 'multer';
import { queries } from './db.js';
import { login, verifyToken, getAuthStatus } from './auth.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// ========== AUTHENTICATION ENDPOINTS ==========

// Login
router.post('/auth/login', login);

// Verify token
router.get('/auth/verify', verifyToken);

// Check auth status
router.get('/auth/status', getAuthStatus);

// Setup multer for file uploads
const uploadDir = join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Sanitize filename to prevent path traversal attacks
function sanitizeFilename(filename) {
  // Remove path separators and parent directory references
  return filename
    .replace(/[/\\]/g, '') // Remove slashes
    .replace(/\.\./g, '')   // Remove parent directory references
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .substring(0, 255); // Limit length
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const sanitized = sanitizeFilename(file.originalname);
    const ext = path.extname(sanitized).toLowerCase();
    const basename = path.basename(sanitized, ext);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

    // Create safe filename: timestamp-random-sanitizedname.ext
    const safeFilename = `${uniqueSuffix}-${basename}${ext}`;
    cb(null, safeFilename);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Endast bildfiler �r till�tna!'));
    }
  }
});

// ========== MOTORCYCLES ENDPOINTS ==========

// Get all motorcycles
router.get('/motorcycles', (req, res) => {
  try {
    const motorcycles = queries.getAllMotorcycles.all();

    // Add statistics for each motorcycle
    const motorcyclesWithStats = motorcycles.map(motorcycle => {
      const totalCost = queries.getTotalCostByMotorcycleId.get(motorcycle.id);
      const jobCount = queries.getJobCountByMotorcycleId.get(motorcycle.id);

      return {
        ...motorcycle,
        total_cost: totalCost.total_cost || 0,
        job_count: jobCount.job_count || 0
      };
    });

    res.json(motorcyclesWithStats);
  } catch (error) {
    console.error('Error getting motorcycles:', error);
    res.status(500).json({ error: 'Kunde inte hämta motorcyklar' });
  }
});

// Get single motorcycle with all jobs
router.get('/motorcycles/:id', (req, res) => {
  try {
    const motorcycle = queries.getMotorcycleById.get(req.params.id);
    if (!motorcycle) {
      return res.status(404).json({ error: 'Motorcykeln hittades inte' });
    }

    const jobs = queries.getJobsByMotorcycleId.all(motorcycle.id);
    const totalCost = queries.getTotalCostByMotorcycleId.get(motorcycle.id);
    const jobCount = queries.getJobCountByMotorcycleId.get(motorcycle.id);

    res.json({
      ...motorcycle,
      jobs,
      total_cost: totalCost.total_cost || 0,
      job_count: jobCount.job_count || 0
    });
  } catch (error) {
    console.error('Error getting motorcycle:', error);
    res.status(500).json({ error: 'Kunde inte hämta motorcykel' });
  }
});

// Create new motorcycle
router.post('/motorcycles', upload.single('image'), (req, res) => {
  try {
    const { brand, model, year, registration_number, current_mileage } = req.body;

    if (!brand || !model) {
      return res.status(400).json({ error: 'Märke och modell krävs' });
    }

    const imageFilename = req.file ? req.file.filename : null;

    const result = queries.createMotorcycle.run(
      brand,
      model,
      year || null,
      registration_number || null,
      current_mileage || null,
      imageFilename
    );

    const motorcycle = queries.getMotorcycleById.get(result.lastInsertRowid);
    res.status(201).json(motorcycle);
  } catch (error) {
    console.error('Error creating motorcycle:', error);
    res.status(500).json({ error: 'Kunde inte skapa motorcykel' });
  }
});

// Update motorcycle
router.put('/motorcycles/:id', upload.single('image'), (req, res) => {
  try {
    const { brand, model, year, registration_number, current_mileage } = req.body;

    if (!brand || !model) {
      return res.status(400).json({ error: 'Märke och modell krävs' });
    }

    const existingMotorcycle = queries.getMotorcycleById.get(req.params.id);
    if (!existingMotorcycle) {
      return res.status(404).json({ error: 'Motorcykeln hittades inte' });
    }

    // Use new image if uploaded, otherwise keep existing
    const imageFilename = req.file ? req.file.filename : existingMotorcycle.image_filename;

    // Delete old image if new one uploaded
    if (req.file && existingMotorcycle.image_filename) {
      const oldImagePath = join(uploadDir, existingMotorcycle.image_filename);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    queries.updateMotorcycle.run(
      brand,
      model,
      year || null,
      registration_number || null,
      current_mileage || null,
      imageFilename,
      req.params.id
    );

    const motorcycle = queries.getMotorcycleById.get(req.params.id);
    res.json(motorcycle);
  } catch (error) {
    console.error('Error updating motorcycle:', error);
    res.status(500).json({ error: 'Kunde inte uppdatera motorcykel' });
  }
});

// Delete motorcycle
router.delete('/motorcycles/:id', (req, res) => {
  try {
    const motorcycle = queries.getMotorcycleById.get(req.params.id);

    if (!motorcycle) {
      return res.status(404).json({ error: 'Motorcykeln hittades inte' });
    }

    // Delete motorcycle image if exists
    if (motorcycle.image_filename) {
      const imagePath = join(uploadDir, motorcycle.image_filename);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    queries.deleteMotorcycle.run(req.params.id);
    res.json({ message: 'Motorcykeln har tagits bort' });
  } catch (error) {
    console.error('Error deleting motorcycle:', error);
    res.status(500).json({ error: 'Kunde inte ta bort motorcykel' });
  }
});

// ========== JOBS ENDPOINTS ==========

// Get all jobs
router.get('/jobs', (req, res) => {
  try {
    const jobs = queries.getAllJobs.all();
    res.json(jobs);
  } catch (error) {
    console.error('Error getting jobs:', error);
    res.status(500).json({ error: 'Kunde inte h�mta jobb' });
  }
});

// Get single job with images, notes and shopping items
router.get('/jobs/:id', (req, res) => {
  try {
    const job = queries.getJobById.get(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Jobbet hittades inte' });
    }

    const images = queries.getImagesByJobId.all(job.id);
    const notes = queries.getNotesByJobId.all(job.id);
    const shoppingItems = queries.getShoppingItemsByJobId.all(job.id);

    res.json({ ...job, images, notes, shoppingItems });
  } catch (error) {
    console.error('Error getting job:', error);
    res.status(500).json({ error: 'Kunde inte h�mta jobb' });
  }
});

// Create new job
router.post('/jobs', (req, res) => {
  try {
    const { motorcycle_id, title, description, date, mileage, cost } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: 'Titel och datum krävs' });
    }

    const result = queries.createJob.run(
      motorcycle_id || null,
      title,
      description || '',
      date,
      mileage || null,
      cost || null
    );
    const job = queries.getJobById.get(result.lastInsertRowid);

    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Kunde inte skapa jobb' });
  }
});

// Update job
router.put('/jobs/:id', (req, res) => {
  try {
    const { motorcycle_id, title, description, date, mileage, cost } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: 'Titel och datum krävs' });
    }

    queries.updateJob.run(
      motorcycle_id || null,
      title,
      description || '',
      date,
      mileage || null,
      cost || null,
      req.params.id
    );
    const job = queries.getJobById.get(req.params.id);

    if (!job) {
      return res.status(404).json({ error: 'Jobbet hittades inte' });
    }

    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Kunde inte uppdatera jobb' });
  }
});

// Delete job
router.delete('/jobs/:id', (req, res) => {
  try {
    // Get images to delete files
    const images = queries.getImagesByJobId.all(req.params.id);

    // Delete the job (will cascade delete images and notes in DB)
    queries.deleteJob.run(req.params.id);

    // Delete image files from disk
    images.forEach(image => {
      const filePath = join(uploadDir, image.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    res.json({ message: 'Jobbet har tagits bort' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Kunde inte ta bort jobb' });
  }
});

// Toggle job completion status
router.patch('/jobs/:id/complete', (req, res) => {
  try {
    const job = queries.getJobById.get(req.params.id);

    if (!job) {
      return res.status(404).json({ error: 'Jobbet hittades inte' });
    }

    const newStatus = job.completed === 1 ? 0 : 1;
    queries.toggleJobCompleted.run(newStatus, req.params.id);

    res.json({ message: 'Status uppdaterad', completed: newStatus });
  } catch (error) {
    console.error('Error toggling job completion:', error);
    res.status(500).json({ error: 'Kunde inte uppdatera status' });
  }
});

// Upload image for a job
router.post('/jobs/:id/images', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Ingen bild uppladdad' });
    }

    const result = queries.createImage.run(
      req.params.id,
      req.file.filename,
      req.file.originalname
    );

    const image = queries.getImageById.get(result.lastInsertRowid);
    res.status(201).json(image);
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Kunde inte ladda upp bild' });
  }
});

// Delete image
router.delete('/images/:id', (req, res) => {
  try {
    const image = queries.getImageById.get(req.params.id);

    if (!image) {
      return res.status(404).json({ error: 'Bilden hittades inte' });
    }

    // Delete from database
    queries.deleteImage.run(req.params.id);

    // Delete file from disk
    const filePath = join(uploadDir, image.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Bilden har tagits bort' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Kunde inte ta bort bild' });
  }
});

// Add note to job
router.post('/jobs/:id/notes', (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Anteckning kan inte vara tom' });
    }

    const result = queries.createNote.run(req.params.id, content);
    const notes = queries.getNotesByJobId.all(req.params.id);

    res.status(201).json(notes);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Kunde inte skapa anteckning' });
  }
});

// Update note
router.put('/notes/:id', (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Anteckning kan inte vara tom' });
    }

    queries.updateNote.run(content, req.params.id);
    res.json({ message: 'Anteckningen har uppdaterats' });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Kunde inte uppdatera anteckning' });
  }
});

// Delete note
router.delete('/notes/:id', (req, res) => {
  try {
    queries.deleteNote.run(req.params.id);
    res.json({ message: 'Anteckningen har tagits bort' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Kunde inte ta bort anteckning' });
  }
});

// Add shopping item to job
router.post('/jobs/:id/shopping', (req, res) => {
  try {
    const { itemName, quantity } = req.body;

    if (!itemName) {
      return res.status(400).json({ error: 'Artikelnamn krävs' });
    }

    queries.createShoppingItem.run(req.params.id, itemName, quantity || 1, 0);
    const items = queries.getShoppingItemsByJobId.all(req.params.id);

    res.status(201).json(items);
  } catch (error) {
    console.error('Error creating shopping item:', error);
    res.status(500).json({ error: 'Kunde inte skapa inköpsartikel' });
  }
});

// Update shopping item
router.put('/shopping/:id', (req, res) => {
  try {
    const { item_name, quantity } = req.body;
    const item = queries.getShoppingItemById.get(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Artikeln hittades inte' });
    }

    queries.updateShoppingItem.run(
      item_name || item.item_name,
      quantity || item.quantity,
      item.purchased,
      req.params.id
    );

    res.json({ message: 'Artikel uppdaterad' });
  } catch (error) {
    console.error('Error updating shopping item:', error);
    res.status(500).json({ error: 'Kunde inte uppdatera artikel' });
  }
});

// Toggle shopping item purchased status
router.patch('/shopping/:id', (req, res) => {
  try {
    const item = queries.getShoppingItemById.get(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Artikeln hittades inte' });
    }

    const newStatus = item.purchased === 1 ? 0 : 1;
    queries.toggleShoppingItem.run(newStatus, req.params.id);

    res.json({ message: 'Status uppdaterad' });
  } catch (error) {
    console.error('Error toggling shopping item:', error);
    res.status(500).json({ error: 'Kunde inte uppdatera status' });
  }
});

// Delete shopping item
router.delete('/shopping/:id', (req, res) => {
  try {
    queries.deleteShoppingItem.run(req.params.id);
    res.json({ message: 'Artikeln har tagits bort' });
  } catch (error) {
    console.error('Error deleting shopping item:', error);
    res.status(500).json({ error: 'Kunde inte ta bort artikel' });
  }
});

export default router;
