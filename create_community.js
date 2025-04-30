// create_community.js

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

  if (!formData.name) {
    showError(document.querySelector('input[placeholder="Community Name"]'), 'Community name is required');
    isValid = false;
  }

  if (!formData.description) {
    showError(document.querySelector('textarea[placeholder="Community Description"]'), 'Description is required');
    isValid = false;
  }

  if (!formData.welcomeMessage) {
    showError(document.getElementById('welcome-message'), 'Welcome message is required');
    isValid = false;
  }

  if (!formData.rules) {
    showError(document.querySelector('textarea[placeholder="Community Rules (e.g., No spam, Be respectful)"]'), 'Rules are required');
    isValid = false;
  }

  return isValid;
}

// Function to handle profile picture preview
function setupProfilePicturePreview() {
  const fileInput = document.getElementById('profile-picture');
  const previewImg = document.getElementById('preview-img');

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewImg.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      previewImg.src = '';
      previewImg.style.display = 'none';
    }
  });
}

// Function to handle welcome image preview
function setupWelcomeImagePreview() {
  const fileInput = document.getElementById('welcome-image');
  const previewImg = document.getElementById('welcome-preview-img');

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewImg.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      previewImg.src = '';
      previewImg.style.display = 'none';
    }
  });
}

// Function to handle visibility-dependent fields
function setupVisibilityDependencies() {
  const visibilitySelect = document.getElementById('visibility');
  const joinMessageSection = document.getElementById('join-message-section');

  visibilitySelect.addEventListener('change', (event) => {
    if (event.target.value === 'restricted') {
      joinMessageSection.style.display = 'block';
    } else {
      joinMessageSection.style.display = 'none';
    }
  });
}

// Function to handle introduction prompt dependencies
function setupIntroPromptDependencies() {
  const introPromptCheckbox = document.getElementById('intro-prompt');
  const introChannelSection = document.getElementById('intro-channel');
  const introChannelInput = document.getElementById('intro-channel');

  introPromptCheckbox.addEventListener('change', (event) => {
    if (event.target.checked) {
      introChannelSection.style.display = 'block';
      introChannelInput.disabled = false;
    } else {
      introChannelSection.style.display = 'none';
      introChannelInput.disabled = true;
    }
  });

  // Initial state
  if (introPromptCheckbox.checked) {
    introChannelSection.style.display = 'block';
    introChannelInput.disabled = false;
  } else {
    introChannelSection.style.display = 'none';
    introChannelInput.disabled = true;
  }
}

// Function to handle form submission
function handleFormSubmission() {
  const form = document.getElementById('createCommunityForm');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const profilePictureFile = document.getElementById('profile-picture').files[0];
    const welcomeImageFile = document.getElementById('welcome-image').files[0];

    const formData = {
      name: document.querySelector('input[placeholder="Community Name"]').value.trim(),
      description: document.querySelector('textarea[placeholder="Community Description"]').value.trim(),
      welcomeMessage: document.getElementById('welcome-message').value.trim(),
      welcomeImage: welcomeImageFile ? welcomeImageFile.name : null,
      visibility: document.querySelector('#visibility').value,
      joinMessage: document.getElementById('join-message').value.trim() || null,
      rules: document.querySelector('textarea[placeholder="Community Rules (e.g., No spam, Be respectful)"]').value.trim(),
      introPrompt: document.getElementById('intro-prompt').checked,
      introChannel: document.getElementById('intro-channel').value.trim() || null,
      defaultNotificationSettings: {
        notifyMessages: document.getElementById('default-notify-messages').checked,
        notifyMentions: document.getElementById('default-notify-mentions').checked
      },
      profilePicture: profilePictureFile ? profilePictureFile.name : null
    };

    if (validateForm(formData)) {
      try {
        console.log('Community Data:', formData);
        alert('Community created successfully! Redirecting to chat...');
        window.location.href = 'chat.html';
      } catch (error) {
        showError(document.querySelector('.create-btn'), 'An error occurred. Please try again.');
      }
    }
  });
}

// Function to toggle hamburger menu for mobile
function setupHamburgerMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
}

// Function to handle sign-out
function setupSignOut() {
  const signOutLink = document.getElementById('signout-link');
  if (signOutLink) {
    signOutLink.addEventListener('click', (event) => {
      event.preventDefault();
      localStorage.removeItem('userSession');
      alert('You have been signed out successfully.');
      window.location.href = 'signin.html';
    });
  }
}

// Initialize all functionality when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  setupProfilePicturePreview();
  setupWelcomeImagePreview();
  setupVisibilityDependencies();
  setupIntroPromptDependencies();
  handleFormSubmission();
  setupHamburgerMenu();
  setupSignOut();
});