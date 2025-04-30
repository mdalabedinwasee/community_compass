// option.js

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
        event.preventDefault(); // Prevent immediate navigation
        // Simulate clearing session data (replace with actual backend logout if available)
        localStorage.removeItem('userSession'); // Example: Clear session data (if using localStorage)
        alert('You have been signed out successfully.');
        window.location.href = 'signin.html'; // Redirect to sign-in page
      });
    }
  }
  
  // Initialize all functionality when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', () => {
    setupHamburgerMenu();
    setupSignOut();
  });