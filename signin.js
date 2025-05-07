// signin.js

// Function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to display error messages
function showError(input, message) {
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.style.color = 'red';
  errorElement.style.fontSize = '12px';
  errorElement.style.marginBottom = '10px';
  errorElement.textContent = message;
  input.parentNode.insertBefore(errorElement, input.nextSibling);
}

// Function to clear all error messages
function clearErrors() {
  document.querySelectorAll('.error-message').forEach(error => error.remove());
}

// Function to validate the form
function validateForm(formData) {
  let isValid = true;
  clearErrors();

  if (!formData.email) {
    showError(document.querySelector('input[placeholder="Email address"]'), 'Email is required');
    isValid = false;
  } else if (!isValidEmail(formData.email)) {
    showError(document.querySelector('input[placeholder="Email address"]'), 'Invalid email format');
    isValid = false;
  }

  if (!formData.password) {
    showError(document.querySelector('input[placeholder="Password"]'), 'Password is required');
    isValid = false;
  }

  return isValid;
}

// Function to handle form submission
function handleFormSubmission() {
  const form = document.getElementById('signinForm');
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent page refresh

    const formData = {
      email: document.querySelector('input[placeholder="Email address"]').value.trim(),
      password: document.querySelector('input[placeholder="Password"]').value,
    };

    if (validateForm(formData)) {
      try {
        console.log('Form Data:', formData);
        alert('Sign-in validated successfully! Redirecting...');
        window.location.href = 'option.html'; // Redirect to option.html
      } catch (error) {
        showError(document.querySelector('.signin-btn'), 'An error occurred. Please try again.');
      }
    }
  });
}

// Function to toggle hamburger menu for mobile
function setupHamburgerMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
}

// Initialize all functionality when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  handleFormSubmission();
  setupHamburgerMenu();
});