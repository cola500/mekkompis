import { useState, useEffect, useMemo } from 'react';
import './App.css';

const API_URL = 'http://localhost:3000/api';

function App() {
  // View state
  const [currentView, setCurrentView] = useState('motorcycles'); // 'motorcycles' or 'jobs'

  // Motorcycles state
  const [motorcycles, setMotorcycles] = useState([]);
  const [selectedMotorcycle, setSelectedMotorcycle] = useState(null);
  const [showMotorcycleForm, setShowMotorcycleForm] = useState(false);
  const [editingMotorcycleId, setEditingMotorcycleId] = useState(null); // null = new, ID = editing
  const [motorcycleFormData, setMotorcycleFormData] = useState({
    brand: '',
    model: '',
    year: '',
    registration_number: '',
    current_mileage: ''
  });

  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showNewJobForm, setShowNewJobForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null); // null = new, ID = editing
  const [jobFormData, setJobFormData] = useState({
    motorcycle_id: '',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    mileage: '',
    cost: ''
  });
  const [jobFilter, setJobFilter] = useState('all'); // 'all', 'completed', 'incomplete'
  const [jobSort, setJobSort] = useState('date-desc'); // 'date-desc', 'date-asc', 'cost-desc'
  const [editingItemId, setEditingItemId] = useState(null);
  const [editItemData, setEditItemData] = useState({ item_name: '', quantity: 1 });

  // Notification state
  const [notification, setNotification] = useState(null);

  // Loading states
  const [isLoadingMotorcycles, setIsLoadingMotorcycles] = useState(false);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Lightbox state
  const [lightboxImage, setLightboxImage] = useState(null);

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Filtered and sorted jobs
  const filteredAndSortedJobs = useMemo(() => {
    let filtered = [...jobs];

    // Filter
    if (jobFilter === 'completed') {
      filtered = filtered.filter(job => job.completed === 1);
    } else if (jobFilter === 'incomplete') {
      filtered = filtered.filter(job => job.completed === 0);
    }

    // Sort
    filtered.sort((a, b) => {
      if (jobSort === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (jobSort === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (jobSort === 'cost-desc') return (b.cost || 0) - (a.cost || 0);
      return 0;
    });

    return filtered;
  }, [jobs, jobFilter, jobSort]);

  // Fetch motorcycles on mount
  useEffect(() => {
    fetchMotorcycles();
  }, []);

  // Handle lightbox keyboard events (ESC to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && lightboxImage) {
        setLightboxImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage]);

  // Fetch motorcycles
  const fetchMotorcycles = async () => {
    setIsLoadingMotorcycles(true);
    try {
      const response = await fetch(`${API_URL}/motorcycles`);
      const data = await response.json();
      setMotorcycles(data);
    } catch (error) {
      console.error('Error fetching motorcycles:', error);
      showNotification('Kunde inte hämta motorcyklar', 'error');
    } finally {
      setIsLoadingMotorcycles(false);
    }
  };

  // Fetch single motorcycle with jobs
  const fetchMotorcycleDetails = async (motorcycleId) => {
    setIsLoadingJobs(true);
    try {
      const response = await fetch(`${API_URL}/motorcycles/${motorcycleId}`);
      const data = await response.json();
      setSelectedMotorcycle(data);
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Error fetching motorcycle details:', error);
      showNotification('Kunde inte hämta motorcykeldetaljer', 'error');
    } finally {
      setIsLoadingJobs(false);
    }
  };

  // Validate motorcycle form
  const validateMotorcycleForm = () => {
    const errors = [];

    if (motorcycleFormData.year && motorcycleFormData.year < 1900) {
      errors.push('Årsmodell kan inte vara före 1900');
    }

    if (motorcycleFormData.year && motorcycleFormData.year > new Date().getFullYear() + 1) {
      errors.push('Årsmodell kan inte vara mer än 1 år fram i tiden');
    }

    if (motorcycleFormData.current_mileage && motorcycleFormData.current_mileage < 0) {
      errors.push('Milantal kan inte vara negativt');
    }

    return errors;
  };

  // Create or update motorcycle
  const handleMotorcycleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateMotorcycleForm();
    if (errors.length > 0) {
      showNotification(errors.join('. '), 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('brand', motorcycleFormData.brand);
      formData.append('model', motorcycleFormData.model);
      if (motorcycleFormData.year) formData.append('year', motorcycleFormData.year);
      if (motorcycleFormData.registration_number) formData.append('registration_number', motorcycleFormData.registration_number);
      if (motorcycleFormData.current_mileage) formData.append('current_mileage', motorcycleFormData.current_mileage);

      const isEditing = editingMotorcycleId !== null;
      const url = isEditing
        ? `${API_URL}/motorcycles/${editingMotorcycleId}`
        : `${API_URL}/motorcycles`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        body: formData
      });

      if (response.ok) {
        setMotorcycleFormData({
          brand: '',
          model: '',
          year: '',
          registration_number: '',
          current_mileage: ''
        });
        setShowMotorcycleForm(false);
        setEditingMotorcycleId(null);

        // If editing the currently selected motorcycle, refresh its details
        if (isEditing && selectedMotorcycle?.id === editingMotorcycleId) {
          fetchMotorcycleDetails(editingMotorcycleId);
        }
        fetchMotorcycles();

        showNotification(
          isEditing ? 'Motorcykel uppdaterad!' : 'Motorcykel skapad!',
          'success'
        );
      }
    } catch (error) {
      console.error(`Error ${editingMotorcycleId ? 'updating' : 'creating'} motorcycle:`, error);
      showNotification(
        `Kunde inte ${editingMotorcycleId ? 'uppdatera' : 'skapa'} motorcykel`,
        'error'
      );
    }
  };

  // Start editing motorcycle
  const handleEditMotorcycle = () => {
    setEditingMotorcycleId(selectedMotorcycle.id);
    setMotorcycleFormData({
      brand: selectedMotorcycle.brand || '',
      model: selectedMotorcycle.model || '',
      year: selectedMotorcycle.year || '',
      registration_number: selectedMotorcycle.registration_number || '',
      current_mileage: selectedMotorcycle.current_mileage || ''
    });
    setShowMotorcycleForm(true);
    setCurrentView('motorcycles'); // Switch to motorcycles view to show the form
  };

  // Delete motorcycle
  const handleDeleteMotorcycle = (motorcycleId) => {
    const jobCount = selectedMotorcycle?.job_count || 0;
    const motorcycleName = `${selectedMotorcycle?.brand} ${selectedMotorcycle?.model}`;

    setDeleteConfirm({
      title: 'Ta bort motorcykel?',
      message: `Detta kommer permanent ta bort ${motorcycleName}${jobCount > 0 ? ` och alla dess ${jobCount} jobb` : ''}. Denna åtgärd kan inte ångras.`,
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_URL}/motorcycles/${motorcycleId}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            setSelectedMotorcycle(null);
            setJobs([]);
            setSelectedJob(null);
            setCurrentView('motorcycles'); // Go back to motorcycles view
            fetchMotorcycles();
            showNotification('Motorcykel borttagen', 'success');
          }
        } catch (error) {
          console.error('Error deleting motorcycle:', error);
          showNotification('Kunde inte ta bort motorcykel', 'error');
        }
        setDeleteConfirm(null);
      }
    });
  };

  // Fetch job details
  const fetchJobDetails = async (jobId) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}`);
      const data = await response.json();
      setSelectedJob(data);
    } catch (error) {
      console.error('Error fetching job details:', error);
      alert('Kunde inte hämta jobbdetaljer');
    }
  };

  // Validate job form
  const validateJobForm = () => {
    const errors = [];

    if (jobFormData.cost && jobFormData.cost < 0) {
      errors.push('Kostnad kan inte vara negativ');
    }

    if (jobFormData.mileage && jobFormData.mileage < 0) {
      errors.push('Milantal kan inte vara negativt');
    }

    const selectedDate = new Date(jobFormData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare only dates
    const oneMonthAhead = new Date(today);
    oneMonthAhead.setMonth(oneMonthAhead.getMonth() + 1);

    if (selectedDate > oneMonthAhead) {
      errors.push('Datum kan inte vara mer än 1 månad fram i tiden');
    }

    return errors;
  };

  // Create or update job
  const handleJobSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateJobForm();
    if (errors.length > 0) {
      showNotification(errors.join('. '), 'error');
      return;
    }

    try {
      const isEditing = editingJobId !== null;
      const url = isEditing
        ? `${API_URL}/jobs/${editingJobId}`
        : `${API_URL}/jobs`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobFormData)
      });

      if (response.ok) {
        setJobFormData({
          motorcycle_id: jobFormData.motorcycle_id,
          title: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          mileage: '',
          cost: ''
        });
        setShowNewJobForm(false);
        setEditingJobId(null);

        if (selectedMotorcycle) {
          fetchMotorcycleDetails(selectedMotorcycle.id);
        }

        // If editing the currently selected job, refresh its details
        if (isEditing && selectedJob?.id === editingJobId) {
          fetchJobDetails(editingJobId);
        }

        showNotification(
          isEditing ? 'Jobb uppdaterat!' : 'Jobb skapat!',
          'success'
        );
      }
    } catch (error) {
      console.error(`Error ${editingJobId ? 'updating' : 'creating'} job:`, error);
      showNotification(
        `Kunde inte ${editingJobId ? 'uppdatera' : 'skapa'} jobb`,
        'error'
      );
    }
  };

  // Start editing job
  const handleEditJob = () => {
    setEditingJobId(selectedJob.id);
    setJobFormData({
      motorcycle_id: selectedJob.motorcycle_id,
      title: selectedJob.title || '',
      description: selectedJob.description || '',
      date: selectedJob.date || new Date().toISOString().split('T')[0],
      mileage: selectedJob.mileage || '',
      cost: selectedJob.cost || ''
    });
    setShowNewJobForm(true);
  };

  // Delete job
  const handleDeleteJob = (jobId) => {
    const jobTitle = selectedJob?.title || 'detta jobb';

    setDeleteConfirm({
      title: 'Ta bort jobb?',
      message: `Detta kommer permanent ta bort "${jobTitle}" med alla bilder, anteckningar och inköpsartiklar. Denna åtgärd kan inte ångras.`,
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_URL}/jobs/${jobId}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            setSelectedJob(null);
            if (selectedMotorcycle) {
              fetchMotorcycleDetails(selectedMotorcycle.id);
            }
            showNotification('Jobb borttaget', 'success');
          }
        } catch (error) {
          console.error('Error deleting job:', error);
          showNotification('Kunde inte ta bort jobb', 'error');
        }
        setDeleteConfirm(null);
      }
    });
  };

  // Toggle job completion
  const handleToggleJobCompletion = async (jobId, e) => {
    e.stopPropagation(); // Prevent triggering job selection
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}/complete`, {
        method: 'PATCH'
      });

      if (response.ok) {
        if (selectedMotorcycle) {
          fetchMotorcycleDetails(selectedMotorcycle.id);
        }
        if (selectedJob && selectedJob.id === jobId) {
          fetchJobDetails(jobId);
        }
      }
    } catch (error) {
      console.error('Error toggling job completion:', error);
      alert('Kunde inte uppdatera status');
    }
  };

  // Image upload
  const handleImageUpload = async (jobId, file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}/images`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        fetchJobDetails(jobId);
        showNotification('Bild uppladdad!', 'success');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showNotification('Kunde inte ladda upp bild', 'error');
    }
  };

  // Delete image
  const handleDeleteImage = async (imageId, jobId) => {
    try {
      const response = await fetch(`${API_URL}/images/${imageId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchJobDetails(jobId);
        showNotification('Bild borttagen', 'success');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      showNotification('Kunde inte ta bort bild', 'error');
    }
  };

  // Add note
  const handleAddNote = async (jobId, content) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        fetchJobDetails(jobId);
        showNotification('Anteckning tillagd!', 'success');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      showNotification('Kunde inte lägga till anteckning', 'error');
    }
  };

  // Shopping item handlers
  const handleAddShoppingItem = async (jobId, itemName, quantity) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}/shopping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemName, quantity: quantity || 1 })
      });

      if (response.ok) {
        fetchJobDetails(jobId);
        showNotification('Inköpsartikel tillagd!', 'success');
      }
    } catch (error) {
      console.error('Error adding shopping item:', error);
      showNotification('Kunde inte lägga till inköpsartikel', 'error');
    }
  };

  const handleToggleShoppingItem = async (itemId, jobId) => {
    try {
      const response = await fetch(`${API_URL}/shopping/${itemId}`, {
        method: 'PATCH'
      });

      if (response.ok) {
        fetchJobDetails(jobId);
      }
    } catch (error) {
      console.error('Error toggling shopping item:', error);
      alert('Kunde inte uppdatera status');
    }
  };

  const handleUpdateShoppingItem = async (itemId, jobId) => {
    try {
      const response = await fetch(`${API_URL}/shopping/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editItemData)
      });

      if (response.ok) {
        setEditingItemId(null);
        fetchJobDetails(jobId);
        showNotification('Artikel uppdaterad!', 'success');
      }
    } catch (error) {
      console.error('Error updating shopping item:', error);
      showNotification('Kunde inte uppdatera artikel', 'error');
    }
  };

  const handleDeleteShoppingItem = async (itemId, jobId) => {
    try {
      const response = await fetch(`${API_URL}/shopping/${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchJobDetails(jobId);
        showNotification('Artikel borttagen', 'success');
      }
    } catch (error) {
      console.error('Error deleting shopping item:', error);
      showNotification('Kunde inte ta bort artikel', 'error');
    }
  };

  return (
    <div className="app">
      {/* Notification Toast */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{deleteConfirm.title}</h3>
            <p>{deleteConfirm.message}</p>
            <div className="modal-actions">
              <button
                className="cancel-btn-large"
                onClick={() => setDeleteConfirm(null)}
              >
                Avbryt
              </button>
              <button
                className="delete-btn-large"
                onClick={deleteConfirm.onConfirm}
              >
                Ta bort
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxImage && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="lightbox-close"
            onClick={() => setLightboxImage(null)}
            aria-label="Stäng"
          >
            ×
          </button>
          <img
            src={`http://localhost:3000/uploads/${lightboxImage.filename}`}
            alt={lightboxImage.original_name}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <header>
        <h1>🏍️ Mekkompis</h1>
        <div className="header-actions">
          {currentView === 'motorcycles' && (
            <button onClick={() => {
              setShowMotorcycleForm(!showMotorcycleForm);
              if (showMotorcycleForm) {
                // Reset editing state when closing form
                setEditingMotorcycleId(null);
                setMotorcycleFormData({
                  brand: '',
                  model: '',
                  year: '',
                  registration_number: '',
                  current_mileage: ''
                });
              }
            }}>
              {showMotorcycleForm ? 'Avbryt' : '+ Ny Motorcykel'}
            </button>
          )}
          {currentView === 'jobs' && selectedMotorcycle && (
            <>
              <button onClick={() => {
                setCurrentView('motorcycles');
                setSelectedMotorcycle(null);
                setSelectedJob(null);
                setJobs([]);
              }}>
                ← Tillbaka till motorcyklar
              </button>
              <button onClick={() => {
                setShowNewJobForm(!showNewJobForm);
                if (!showNewJobForm) {
                  setJobFormData({
                    ...jobFormData,
                    motorcycle_id: selectedMotorcycle.id
                  });
                } else {
                  // Reset editing state when closing form
                  setEditingJobId(null);
                  setJobFormData({
                    motorcycle_id: selectedMotorcycle.id,
                    title: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                    mileage: '',
                    cost: ''
                  });
                }
              }}>
                {showNewJobForm ? 'Avbryt' : '+ Nytt Jobb'}
              </button>
            </>
          )}
        </div>
      </header>

      <div className="container">
        {/* NEW/EDIT MOTORCYCLE FORM */}
        {showMotorcycleForm && currentView === 'motorcycles' && (
          <div className="form-card">
            <h2>{editingMotorcycleId ? 'Redigera motorcykel' : 'Lägg till motorcykel'}</h2>
            <form onSubmit={handleMotorcycleSubmit}>
              <div className="form-group">
                <label htmlFor="motorcycle-brand">Märke *</label>
                <input
                  id="motorcycle-brand"
                  type="text"
                  value={motorcycleFormData.brand}
                  onChange={(e) => setMotorcycleFormData({ ...motorcycleFormData, brand: e.target.value })}
                  required
                  aria-required="true"
                />
              </div>
              <div className="form-group">
                <label htmlFor="motorcycle-model">Modell *</label>
                <input
                  id="motorcycle-model"
                  type="text"
                  value={motorcycleFormData.model}
                  onChange={(e) => setMotorcycleFormData({ ...motorcycleFormData, model: e.target.value })}
                  required
                  aria-required="true"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="motorcycle-year">Årsmodell</label>
                  <input
                    id="motorcycle-year"
                    type="number"
                    value={motorcycleFormData.year}
                    onChange={(e) => setMotorcycleFormData({ ...motorcycleFormData, year: e.target.value })}
                    placeholder="T.ex. 2020"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="motorcycle-reg">Regnummer</label>
                  <input
                    id="motorcycle-reg"
                    type="text"
                    value={motorcycleFormData.registration_number}
                    onChange={(e) => setMotorcycleFormData({ ...motorcycleFormData, registration_number: e.target.value })}
                    placeholder="T.ex. ABC123"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="motorcycle-mileage">Nuvarande milantal</label>
                <input
                  id="motorcycle-mileage"
                  type="number"
                  min="0"
                  value={motorcycleFormData.current_mileage}
                  onChange={(e) => setMotorcycleFormData({ ...motorcycleFormData, current_mileage: e.target.value })}
                  placeholder="T.ex. 15000"
                  aria-describedby="mileage-help"
                />
                <small id="mileage-help" className="form-help">I kilometer</small>
              </div>
              <button type="submit">{editingMotorcycleId ? 'Uppdatera motorcykel' : 'Spara motorcykel'}</button>
            </form>
          </div>
        )}

        {/* NEW/EDIT JOB FORM */}
        {showNewJobForm && currentView === 'jobs' && (
          <div className="form-card">
            <h2>{editingJobId ? 'Redigera mek-jobb' : 'Skapa nytt mek-jobb'}</h2>
            <form onSubmit={handleJobSubmit}>
              <div className="form-group">
                <label htmlFor="job-title">Titel *</label>
                <input
                  id="job-title"
                  type="text"
                  value={jobFormData.title}
                  onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                  required
                  aria-required="true"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="job-date">Datum *</label>
                  <input
                    id="job-date"
                    type="date"
                    value={jobFormData.date}
                    onChange={(e) => setJobFormData({ ...jobFormData, date: e.target.value })}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="job-mileage">Milantal</label>
                  <input
                    id="job-mileage"
                    type="number"
                    min="0"
                    value={jobFormData.mileage}
                    onChange={(e) => setJobFormData({ ...jobFormData, mileage: e.target.value })}
                    placeholder="T.ex. 15000"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="job-cost">Kostnad (kr)</label>
                  <input
                    id="job-cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={jobFormData.cost}
                    onChange={(e) => setJobFormData({ ...jobFormData, cost: e.target.value })}
                    placeholder="T.ex. 450"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="job-description">Beskrivning</label>
                <textarea
                  id="job-description"
                  value={jobFormData.description}
                  onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                  rows="4"
                />
              </div>
              <button type="submit">{editingJobId ? 'Uppdatera jobb' : 'Spara jobb'}</button>
            </form>
          </div>
        )}

        {/* MOTORCYCLES VIEW */}
        {currentView === 'motorcycles' && (
          <div className="motorcycles-grid">
            {isLoadingMotorcycles ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Laddar motorcyklar...</p>
              </div>
            ) : motorcycles.length === 0 ? (
              <div className="empty-state">
                <p>Inga motorcyklar ännu. Lägg till din första!</p>
              </div>
            ) : (
              motorcycles.map(motorcycle => (
                <div
                  key={motorcycle.id}
                  className="motorcycle-card"
                  onClick={() => {
                    setSelectedMotorcycle(motorcycle);
                    fetchMotorcycleDetails(motorcycle.id);
                    setCurrentView('jobs');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedMotorcycle(motorcycle);
                      fetchMotorcycleDetails(motorcycle.id);
                      setCurrentView('jobs');
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Öppna ${motorcycle.brand} ${motorcycle.model}`}
                >
                  <div className="motorcycle-header">
                    <h3>{motorcycle.brand} {motorcycle.model}</h3>
                    {motorcycle.year && <span className="year-badge">{motorcycle.year}</span>}
                  </div>
                  {motorcycle.registration_number && (
                    <p className="reg-number">{motorcycle.registration_number}</p>
                  )}
                  {motorcycle.current_mileage && (
                    <p className="mileage">📏 {motorcycle.current_mileage} km</p>
                  )}
                  <div className="motorcycle-stats">
                    <div className="stat">
                      <span className="stat-value">{motorcycle.job_count}</span>
                      <span className="stat-label">Jobb</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{motorcycle.total_cost.toFixed(0)} kr</span>
                      <span className="stat-label">Total kostnad</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* JOBS VIEW */}
        {currentView === 'jobs' && selectedMotorcycle && (
          <div className="jobs-view-wrapper">
            <div className="motorcycle-banner">
              <div>
                <h2>{selectedMotorcycle.brand} {selectedMotorcycle.model}</h2>
                {selectedMotorcycle.registration_number && (
                  <p>{selectedMotorcycle.registration_number}</p>
                )}
              </div>
              <div className="banner-stats">
                <div className="stat">
                  <span className="stat-label">Jobb</span>
                  <span className="stat-value">{selectedMotorcycle.job_count}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Total kostnad</span>
                  <span className="stat-value">{selectedMotorcycle.total_cost.toFixed(0)} kr</span>
                </div>
              </div>
              <div className="banner-actions">
                <button
                  className="edit-btn"
                  onClick={handleEditMotorcycle}
                >
                  Redigera
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteMotorcycle(selectedMotorcycle.id)}
                >
                  Ta bort motorcykel
                </button>
              </div>
            </div>

            <div className="main-content">
              <div className="jobs-list">
                <div className="jobs-list-header">
                  <h3>Mek-jobb</h3>
                  {jobs.length > 0 && (
                    <div className="jobs-controls">
                      <select
                        value={jobFilter}
                        onChange={(e) => setJobFilter(e.target.value)}
                        aria-label="Filtrera jobb"
                      >
                        <option value="all">Alla jobb</option>
                        <option value="incomplete">Pågående</option>
                        <option value="completed">Klara</option>
                      </select>
                      <select
                        value={jobSort}
                        onChange={(e) => setJobSort(e.target.value)}
                        aria-label="Sortera jobb"
                      >
                        <option value="date-desc">Nyast först</option>
                        <option value="date-asc">Äldst först</option>
                        <option value="cost-desc">Högst kostnad</option>
                      </select>
                    </div>
                  )}
                </div>
                {isLoadingJobs ? (
                  <div className="loading-spinner-small">
                    <div className="spinner-small"></div>
                    <p>Laddar jobb...</p>
                  </div>
                ) : jobs.length === 0 ? (
                  <p className="empty-state">Inga jobb ännu för denna motorcykel.</p>
                ) : filteredAndSortedJobs.length === 0 ? (
                  <p className="empty-state">Inga jobb matchar filtret.</p>
                ) : (
                  filteredAndSortedJobs.map(job => (
                    <div
                      key={job.id}
                      className={`job-item ${selectedJob?.id === job.id ? 'active' : ''} ${job.completed ? 'completed' : ''}`}
                      onClick={() => fetchJobDetails(job.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          fetchJobDetails(job.id);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Välj jobb: ${job.title}`}
                      aria-pressed={selectedJob?.id === job.id}
                    >
                      <div className="job-item-header">
                        <input
                          type="checkbox"
                          checked={job.completed === 1}
                          onChange={(e) => handleToggleJobCompletion(job.id, e)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="job-item-content">
                          <h4>{job.title}</h4>
                          <p className="job-date">{job.date}</p>
                          {job.cost && <p className="job-cost">{job.cost} kr</p>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedJob ? (
                <div className="job-details">
                  <div className="job-header">
                    <div>
                      <h3>{selectedJob.title}</h3>
                      <p className="job-date">{selectedJob.date}</p>
                      {selectedJob.mileage && (
                        <p className="job-mileage">📏 {selectedJob.mileage} km</p>
                      )}
                      {selectedJob.cost && (
                        <p className="job-cost">💰 {selectedJob.cost} kr</p>
                      )}
                    </div>
                    <div className="job-header-actions">
                      <button
                        className="edit-btn"
                        onClick={handleEditJob}
                      >
                        Redigera
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteJob(selectedJob.id)}
                      >
                        Ta bort
                      </button>
                    </div>
                  </div>

                  <div className="job-section">
                    <h4>Beskrivning</h4>
                    <p>{selectedJob.description || 'Ingen beskrivning'}</p>
                  </div>

                  <div className="job-section">
                    <h4>Inköpslista</h4>
                    {selectedJob.shoppingItems?.length > 0 && (
                      <div className="shopping-list">
                        {selectedJob.shoppingItems.map(item => (
                          <div key={item.id} className="shopping-item">
                            {editingItemId === item.id ? (
                              <div className="shopping-item-edit">
                                <input
                                  type="text"
                                  value={editItemData.item_name}
                                  onChange={(e) => setEditItemData({ ...editItemData, item_name: e.target.value })}
                                  placeholder="Artikelnamn"
                                />
                                <input
                                  type="number"
                                  min="1"
                                  value={editItemData.quantity}
                                  onChange={(e) => setEditItemData({ ...editItemData, quantity: e.target.value })}
                                  className="quantity-input"
                                />
                                <button
                                  className="save-btn"
                                  onClick={() => handleUpdateShoppingItem(item.id, selectedJob.id)}
                                >
                                  ✓
                                </button>
                                <button
                                  className="cancel-btn"
                                  onClick={() => setEditingItemId(null)}
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <>
                                <label>
                                  <input
                                    type="checkbox"
                                    checked={item.purchased === 1}
                                    onChange={() => handleToggleShoppingItem(item.id, selectedJob.id)}
                                  />
                                  <span className={item.purchased === 1 ? 'purchased' : ''}>
                                    {item.item_name} {item.quantity > 1 && `(${item.quantity} st)`}
                                  </span>
                                </label>
                                <div className="item-actions">
                                  <button
                                    className="edit-item-btn"
                                    onClick={() => {
                                      setEditingItemId(item.id);
                                      setEditItemData({ item_name: item.item_name, quantity: item.quantity });
                                    }}
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className="delete-item-btn"
                                    onClick={() => handleDeleteShoppingItem(item.id, selectedJob.id)}
                                  >
                                    ×
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const itemName = e.target.itemName.value;
                        const quantity = e.target.quantity.value;
                        if (itemName) {
                          handleAddShoppingItem(selectedJob.id, itemName, quantity);
                          e.target.reset();
                        }
                      }}
                    >
                      <div className="shopping-form-row">
                        <input
                          type="text"
                          name="itemName"
                          placeholder="T.ex. Olja, Bultar, Filter..."
                        />
                        <input
                          type="number"
                          name="quantity"
                          min="1"
                          defaultValue="1"
                          placeholder="st"
                          className="quantity-input"
                        />
                        <button type="submit">Lägg till</button>
                      </div>
                    </form>
                  </div>

                  <div className="job-section">
                    <h4>Bilder</h4>
                    <div className="images-grid">
                      {selectedJob.images?.map(image => (
                        <div key={image.id} className="image-container">
                          <img
                            src={`http://localhost:3000/uploads/${image.filename}`}
                            alt={image.original_name}
                            onClick={() => setLightboxImage(image)}
                          />
                          <button
                            className="delete-image-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage(image.id, selectedJob.id);
                            }}
                            aria-label="Ta bort bild"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <label className="upload-btn">
                      + Lägg till bild
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            handleImageUpload(selectedJob.id, e.target.files[0]);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  <div className="job-section">
                    <h4>Anteckningar & Tutorials</h4>
                    {selectedJob.notes?.map(note => (
                      <div key={note.id} className="note">
                        <p>{note.content}</p>
                        <small>{new Date(note.created_at).toLocaleDateString('sv-SE')}</small>
                      </div>
                    ))}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const content = e.target.note.value;
                        if (content) {
                          handleAddNote(selectedJob.id, content);
                          e.target.reset();
                        }
                      }}
                    >
                      <textarea
                        name="note"
                        placeholder="Lägg till anteckning eller tutorial..."
                        rows="3"
                      />
                      <button type="submit">Lägg till</button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="job-details-placeholder">
                  <div className="placeholder-content">
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="12" y1="18" x2="12" y2="12"></line>
                      <line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>
                    <h3>Välj ett jobb</h3>
                    <p>Klicka på ett jobb till vänster för att se detaljer, bilder och inköpslista.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
