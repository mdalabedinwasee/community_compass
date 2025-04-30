// index.js

// Function to display a dynamic welcome message
function displayWelcomeMessage() {
    const brandElement = document.querySelector('.brand');
    const userVisited = localStorage.getItem('userVisited');
  
    if (userVisited) {
      brandElement.textContent = 'Welcome Back!';
    } else {
      brandElement.textContent = 'Welcome to Community Compass';
      localStorage.setItem('userVisited', 'true');
    }
  }
  
  // Function to handle button clicks (for logging or future functionality)
  function setupButtonListeners() {
    const buttons = document.querySelectorAll('.action-btn');
    buttons.forEach(button => {
      button.addEventListener('click', (event) => {
        const action = event.target.textContent; // e.g., "Sign Up" or "Sign In"
        console.log(`User clicked: ${action}`);
        // Optional: Add a loading state or animation
        event.target.style.opacity = '0.7';
        setTimeout(() => {
          event.target.style.opacity = '1';
        }, 200);
      });
    });
  }
  
  // Function to toggle hamburger menu for mobile (to be used with updated HTML/CSS)
  function setupHamburgerMenu() {
    // Placeholder: Add hamburger menu functionality if topbar is updated
    // Example: Toggle a mobile menu when a hamburger icon is clicked
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
  
    if (hamburger && navMenu) {
      hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
      });
    }
  }
  
  // Placeholder for future real-time emergency alert notification
  function setupEmergencyAlertListener() {
    // Simulate receiving an emergency alert (to be replaced with WebSocket/API)
    // Example: Display a notification popup
    const alertNotification = document.createElement('div');
    alertNotification.className = 'alert-notification';
    alertNotification.innerHTML = `
      <h3>Emergency Alert!</h3>
      <p>Test Alert: This is a sample notification.</p>
    `;
    alertNotification.style.display = 'none';
    document.body.appendChild(alertNotification);
  
    // Simulate an alert after 5 seconds (for testing)
    setTimeout(() => {
      alertNotification.style.display = 'block';
      setTimeout(() => {
        alertNotification.style.display = 'none';
      }, 5000); // Hide after 5 seconds
    }, 5000);
  }
  
  // Initialize all functionality when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', () => {
    displayWelcomeMessage();
    setupButtonListeners();
    setupHamburgerMenu();
    // setupEmergencyAlertListener(); // Uncomment to test alert notification
  });