export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  return { valid: true, message: 'Strong password' };
};

export const validateName = (name) => {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: 'Name cannot be empty' };
  }
  if (name.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters' };
  }
  if (name.length > 255) {
    return { valid: false, message: 'Name cannot exceed 255 characters' };
  }
  return { valid: true, message: 'Valid name' };
};

export const validateForm = (formData, requiredFields) => {
  const errors = {};

  requiredFields.forEach((field) => {
    if (!formData[field] || formData[field].trim() === '') {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
  });

  if (formData.email && !validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (formData.password) {
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.message;
    }
  }

  if (formData.name) {
    const nameValidation = validateName(formData.name);
    if (!nameValidation.valid) {
      errors.name = nameValidation.message;
    }
  }

  return errors;
};

export const isFormValid = (errors) => {
  return Object.keys(errors).length === 0;
};

export const getErrorMessage = (error) => {
  // Handle axios error response
  if (error.response?.data) {
    const data = error.response.data;
    return data.message || data.error || 'An error occurred';
  }
  
  // Handle generic errors
  const messages = {
    'auth/invalid-credentials': 'Invalid email or password',
    'auth/email-exists': 'This email is already registered',
    'auth/weak-password': 'Password is too weak',
    'network/timeout': 'Network timeout. Please try again.',
    'network/error': 'Network error. Please check your connection.',
  };

  return messages[error] || error || 'An error occurred';
};
