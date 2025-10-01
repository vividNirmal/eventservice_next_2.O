/**
 * Form storage utilities for saving and retrieving form data
 */

const STORAGE_KEYS = {
  FORMS: 'event_service_forms',
  SUBMISSIONS: 'event_service_form_submissions'
};

/**
 * Form Storage Class
 */
class FormStorageManager {
  /**
   * Get all forms
   * @returns {Array} Array of form schemas
   */
  getAllForms() {
    try {
      const forms = localStorage.getItem(STORAGE_KEYS.FORMS);
      return forms ? JSON.parse(forms) : [];
    } catch (error) {
      console.error('Error getting forms:', error);
      return [];
    }
  }

  /**
   * Get specific form by ID
   * @param {string} id - Form ID
   * @returns {Object|null} Form schema or null
   */
  getForm(id) {
    const forms = this.getAllForms();
    return forms.find(form => form.id === id) || null;
  }

  /**
   * Save form
   * @param {Object} form - Form schema
   */
  saveForm(form) {
    try {
      const forms = this.getAllForms();
      const existingIndex = forms.findIndex(f => f.id === form.id);
      
      const formToSave = {
        ...form,
        updatedAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        forms[existingIndex] = formToSave;
      } else {
        formToSave.createdAt = new Date().toISOString();
        forms.push(formToSave);
      }

      localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(forms));
    } catch (error) {
      console.error('Error saving form:', error);
      throw new Error('Failed to save form');
    }
  }

  /**
   * Delete form
   * @param {string} id - Form ID
   */
  deleteForm(id) {
    try {
      const forms = this.getAllForms();
      const filteredForms = forms.filter(form => form.id !== id);
      localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(filteredForms));
      
      // Also delete associated submissions
      this.deleteFormSubmissions(id);
    } catch (error) {
      console.error('Error deleting form:', error);
      throw new Error('Failed to delete form');
    }
  }

  /**
   * Get form submissions
   * @param {string} formId - Form ID
   * @returns {Array} Array of submissions
   */
  getFormSubmissions(formId) {
    try {
      const submissions = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      const allSubmissions = submissions ? JSON.parse(submissions) : [];
      return allSubmissions.filter(submission => submission.formId === formId);
    } catch (error) {
      console.error('Error getting submissions:', error);
      return [];
    }
  }

  /**
   * Save form submission
   * @param {Object} submission - Submission data
   */
  saveSubmission(submission) {
    try {
      const submissions = this.getAllSubmissions();
      const submissionToSave = {
        ...submission,
        id: `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        submittedAt: new Date().toISOString()
      };

      submissions.push(submissionToSave);
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    } catch (error) {
      console.error('Error saving submission:', error);
      throw new Error('Failed to save submission');
    }
  }

  /**
   * Get all submissions
   * @returns {Array} Array of all submissions
   */
  getAllSubmissions() {
    try {
      const submissions = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      return submissions ? JSON.parse(submissions) : [];
    } catch (error) {
      console.error('Error getting all submissions:', error);
      return [];
    }
  }

  /**
   * Delete form submissions
   * @param {string} formId - Form ID
   */
  deleteFormSubmissions(formId) {
    try {
      const submissions = this.getAllSubmissions();
      const filteredSubmissions = submissions.filter(submission => submission.formId !== formId);
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(filteredSubmissions));
    } catch (error) {
      console.error('Error deleting submissions:', error);
    }
  }

  /**
   * Export form data as JSON
   * @param {string} formId - Form ID
   * @returns {Object} Export data
   */
  exportFormData(formId) {
    const form = this.getForm(formId);
    const submissions = this.getFormSubmissions(formId);

    return {
      form,
      submissions,
      exportedAt: new Date().toISOString(),
      totalSubmissions: submissions.length
    };
  }

  /**
   * Import form data
   * @param {Object} data - Import data
   */
  importFormData(data) {
    try {
      if (data.form) {
        this.saveForm(data.form);
      }

      if (data.submissions && Array.isArray(data.submissions)) {
        const allSubmissions = this.getAllSubmissions();
        const newSubmissions = [...allSubmissions, ...data.submissions];
        localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(newSubmissions));
      }
    } catch (error) {
      console.error('Error importing form data:', error);
      throw new Error('Failed to import form data');
    }
  }

  /**
   * Clear all form data
   */
  clearAllData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.FORMS);
      localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}

// Create singleton instance
export const FormStorage = new FormStorageManager();

/**
 * Export form submissions as CSV
 * @param {string} formId - Form ID
 * @param {string} filename - Output filename
 */
export const exportSubmissionsAsCSV = (formId, filename = 'form-submissions.csv') => {
  const form = FormStorage.getForm(formId);
  const submissions = FormStorage.getFormSubmissions(formId);

  if (!form || submissions.length === 0) {
    throw new Error('No data to export');
  }

  // Get all field names from form elements
  const fieldNames = form.elements
    .filter(el => el.type !== 'divider' && el.type !== 'heading' && el.type !== 'paragraph')
    .map(el => el.name);

  // Create CSV header
  const headers = ['Submission ID', 'Submitted At', ...fieldNames];
  
  // Create CSV rows
  const rows = submissions.map(submission => {
    const row = [
      submission.id,
      new Date(submission.submittedAt).toLocaleString(),
      ...fieldNames.map(field => {
        const value = submission.data[field];
        // Handle arrays (for multi-select fields)
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        // Escape quotes and handle strings
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      })
    ];
    return row;
  });

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  // Download CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
