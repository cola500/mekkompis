import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create database in the database folder
const dbPath = join(__dirname, '../../database/mekkompis.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS motorcycles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER,
    registration_number TEXT,
    current_mileage INTEGER,
    image_filename TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    motorcycle_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    mileage INTEGER,
    cost REAL,
    completed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (motorcycle_id) REFERENCES motorcycles(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS shopping_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    item_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    purchased INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'backlog',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Prepared statements for better performance and security
export const queries = {
  // Motorcycles
  getAllMotorcycles: db.prepare('SELECT * FROM motorcycles ORDER BY created_at DESC'),
  getMotorcycleById: db.prepare('SELECT * FROM motorcycles WHERE id = ?'),
  createMotorcycle: db.prepare('INSERT INTO motorcycles (brand, model, year, registration_number, current_mileage, image_filename) VALUES (?, ?, ?, ?, ?, ?)'),
  updateMotorcycle: db.prepare('UPDATE motorcycles SET brand = ?, model = ?, year = ?, registration_number = ?, current_mileage = ?, image_filename = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'),
  deleteMotorcycle: db.prepare('DELETE FROM motorcycles WHERE id = ?'),

  // Jobs
  getAllJobs: db.prepare('SELECT * FROM jobs ORDER BY date DESC, created_at DESC'),
  getJobsByMotorcycleId: db.prepare('SELECT * FROM jobs WHERE motorcycle_id = ? ORDER BY date DESC, created_at DESC'),
  getJobById: db.prepare('SELECT * FROM jobs WHERE id = ?'),
  createJob: db.prepare('INSERT INTO jobs (motorcycle_id, title, description, date, mileage, cost) VALUES (?, ?, ?, ?, ?, ?)'),
  updateJob: db.prepare('UPDATE jobs SET motorcycle_id = ?, title = ?, description = ?, date = ?, mileage = ?, cost = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'),
  deleteJob: db.prepare('DELETE FROM jobs WHERE id = ?'),
  getTotalCostByMotorcycleId: db.prepare('SELECT SUM(cost) as total_cost FROM jobs WHERE motorcycle_id = ? AND cost IS NOT NULL'),
  getJobCountByMotorcycleId: db.prepare('SELECT COUNT(*) as job_count FROM jobs WHERE motorcycle_id = ?'),

  // Images
  getImagesByJobId: db.prepare('SELECT * FROM images WHERE job_id = ? ORDER BY created_at ASC'),
  createImage: db.prepare('INSERT INTO images (job_id, filename, original_name) VALUES (?, ?, ?)'),
  deleteImage: db.prepare('DELETE FROM images WHERE id = ?'),
  getImageById: db.prepare('SELECT * FROM images WHERE id = ?'),

  // Notes
  getNotesByJobId: db.prepare('SELECT * FROM notes WHERE job_id = ? ORDER BY created_at ASC'),
  createNote: db.prepare('INSERT INTO notes (job_id, content) VALUES (?, ?)'),
  updateNote: db.prepare('UPDATE notes SET content = ? WHERE id = ?'),
  deleteNote: db.prepare('DELETE FROM notes WHERE id = ?'),

  // Shopping items
  getShoppingItemsByJobId: db.prepare('SELECT * FROM shopping_items WHERE job_id = ? ORDER BY created_at ASC'),
  createShoppingItem: db.prepare('INSERT INTO shopping_items (job_id, item_name, quantity, purchased) VALUES (?, ?, ?, ?)'),
  updateShoppingItem: db.prepare('UPDATE shopping_items SET item_name = ?, quantity = ?, purchased = ? WHERE id = ?'),
  toggleShoppingItem: db.prepare('UPDATE shopping_items SET purchased = ? WHERE id = ?'),
  deleteShoppingItem: db.prepare('DELETE FROM shopping_items WHERE id = ?'),
  getShoppingItemById: db.prepare('SELECT * FROM shopping_items WHERE id = ?'),

  // Job completion
  toggleJobCompleted: db.prepare('UPDATE jobs SET completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'),

  // Features
  getAllFeatures: db.prepare('SELECT * FROM features ORDER BY created_at DESC'),
  getFeatureById: db.prepare('SELECT * FROM features WHERE id = ?'),
  createFeature: db.prepare('INSERT INTO features (title, description, status) VALUES (?, ?, ?)'),
  updateFeatureStatus: db.prepare('UPDATE features SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'),
  updateFeature: db.prepare('UPDATE features SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'),
  deleteFeature: db.prepare('DELETE FROM features WHERE id = ?'),
};

export default db;
