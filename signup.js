// signup.js

// Function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to validate phone number (basic check for digits and length)
function isValidPhone(phone) {
  const phoneRegex = /^\d{10,15}$/;
  return phoneRegex.test(phone);
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

  if (!formData.firstName) {
    showError(document.querySelector('input[placeholder="First name"]'), 'First name is required');
    isValid = false;
  }

  if (!formData.surname) {
    showError(document.querySelector('input[placeholder="Surname"]'), 'Surname is required');
    isValid = false;
  }

  if (!formData.email) {
    showError(document.querySelector('input[placeholder="Email address"]'), 'Email is required');
    isValid = false;
  } else if (!isValidEmail(formData.email)) {
    showError(document.querySelector('input[placeholder="Email address"]'), 'Invalid email format');
    isValid = false;
  }

  if (!formData.phone) {
    showError(document.querySelector('input[placeholder="Phone number"]'), 'Phone number is required');
    isValid = false;
  } else if (!isValidPhone(formData.phone)) {
    showError(document.querySelector('input[placeholder="Phone number"]'), 'Invalid phone number (10-15 digits)');
    isValid = false;
  }

  if (!formData.password) {
    showError(document.querySelector('input[placeholder="New password"]'), 'Password is required');
    isValid = false;
  } else if (formData.password.length < 6) {
    showError(document.querySelector('input[placeholder="New password"]'), 'Password must be at least 6 characters');
    isValid = false;
  }

  if (!formData.confirmPassword) {
    showError(document.querySelector('input[placeholder="Re-type password"]'), 'Please confirm your password');
    isValid = false;
  } else if (formData.password !== formData.confirmPassword) {
    showError(document.querySelector('input[placeholder="Re-type passwordLicensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
")'), 'Passwords do not match');
    isValid = false;
  }

  return isValid;
}

// Function to toggle password visibility
function setupPasswordToggle() {
  const passwordInputs = document.querySelectorAll('input[type="password"]');
  passwordInputs.forEach(input => {
    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.textContent = 'Show';
    toggleButton.className = 'toggle-password';
    input.parentNode.appendChild(toggleButton);

    toggleButton.addEventListener('click', () => {
      if (input.type === 'password') {
        input.type = 'text';
        toggleButton.textContent = 'Hide';
      } else {
        input.type = 'password';
        toggleButton.textContent = 'Show';
      }
    });
  });
}

// Function to handle form submission
function handleFormSubmission() {
  const form = document.querySelector('form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = {
      firstName: document.querySelector('input[placeholder="First name"]').value.trim(),
      surname: document.querySelector('input[placeholder="Surname"]').value.trim(),
      email: document.querySelector('input[placeholder="Email address"]').value.trim(),
      phone: document.querySelector('input[placeholder="Phone number"]').value.trim(),
      password: document.querySelector('input[placeholder="New password"]').value,
      confirmPassword: document.querySelector('input[placeholder="Re-type password"]').value,
    };

    if (validateForm(formData)) {
      try {
        console.log('Form Data:', formData);
        alert('Form validated successfully! Redirecting...');
        window.location.href = 'authentication.html';
      } catch (error) {
        showError(document.querySelector('.signup-btn'), 'An error occurred. Please try again.');
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

document.addEventListener('DOMContentLoaded', () => {
  setupPasswordToggle();
  handleFormSubmission();
  setupHamburgerMenu();
});