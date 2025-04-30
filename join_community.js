// join_community.js

// Simulated community data (replace with backend fetch in a real app)
const communities = [
    {
      id: 1,
      name: "Hiking Group",
      description: "A community for hiking enthusiasts to share tips and plan trips.",
      profilePicture: "https://via.placeholder.com/80",
      rules: "Be respectful, no spam, keep discussions on-topic.",
      visibility: "public",
      welcomeMessage: "Welcome to the Hiking Group! We’re excited to have you here.",
      introPrompt: true,
      defaultNotificationSettings: { notifyMessages: true, notifyMentions: true }
    },
    {
      id: 2,
      name: "Book Club",
      description: "A place to discuss your favorite books and authors.",
      profilePicture: "https://via.placeholder.com/80",
      rules: "No spoilers without warning, be kind, share book recommendations.",
      visibility: "restricted",
      welcomeMessage: "Welcome to the Book Club! Let’s dive into some great reads.",
      introPrompt: false,
      defaultNotificationSettings: { notifyMessages: false, notifyMentions: true }
    }
  ];
  
  // Function to display error messages
  function showError(element, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.style.color = 'red';
    errorElement.style.fontSize = '12px';
    errorElement.style.marginBottom = '10px';
    errorElement.textContent = message;
    element.parentNode.insertBefore(errorElement, element.nextSibling);
  }
  
  // Function to clear all error messages
  function clearErrors() {
    document.querySelectorAll('.error-message').forEach(error => error.remove());
  }
  
  // Function to populate the community list
  function populateCommunityList() {
    const communityList = document.getElementById('community-list');
    communities.forEach(community => {
      const option = document.createElement('option');
      option.value = community.id;
      option.textContent = community.name;
      communityList.appendChild(option);
    });
  }
  
  // Function to display community details
  function setupCommunitySelection() {
    const communityList = document.getElementById('community-list');
    const welcomeSection = document.getElementById('welcome-section');
    const communityPicture = document.getElementById('community-picture');
    const communityName = document.getElementById('community-name');
    const communityDescription = document.getElementById('community-description');
    const communityRules = document.getElementById('community-rules');
    const notifyMessages = document.getElementById('notify-messages');
    const notifyMentions = document.getElementById('notify-mentions');
  
    communityList.addEventListener('change', (event) => {
      const selectedCommunityId = parseInt(event.target.value);
      const selectedCommunity = communities.find(community => community.id === selectedCommunityId);
  
      if (selectedCommunity) {
        // Display community details
        communityPicture.src = selectedCommunity.profilePicture;
        communityName.textContent = selectedCommunity.name;
        communityDescription.textContent = selectedCommunity.description;
        communityRules.textContent = selectedCommunity.rules;
        welcomeSection.style.display = 'block';
  
        // Set default notification settings
        notifyMessages.checked = selectedCommunity.defaultNotificationSettings.notifyMessages;
        notifyMentions.checked = selectedCommunity.defaultNotificationSettings.notifyMentions;
  
        // Show custom welcome message
        alert(selectedCommunity.welcomeMessage);
  
        // If the community is restricted, show a "Request to Join" message
        if (selectedCommunity.visibility === 'restricted') {
          document.getElementById('join-btn').textContent = 'Request to Join';
        } else {
          document.getElementById('join-btn').textContent = 'Join Community';
        }
      } else {
        welcomeSection.style.display = 'none';
      }
    });
  }
  
  // Function to handle joining the community
  function handleJoinCommunity() {
    const joinBtn = document.getElementById('join-btn');
    const rulesAcknowledgment = document.getElementById('rules-acknowledgment');
    const communityList = document.getElementById('community-list');
  
    joinBtn.addEventListener('click', (event) => {
      event.preventDefault();
      clearErrors();
  
      const selectedCommunityId = parseInt(communityList.value);
      const selectedCommunity = communities.find(community => community.id === selectedCommunityId);
  
      if (!selectedCommunity) {
        showError(communityList, 'Please select a community');
        return;
      }
  
      if (!rulesAcknowledgment.checked) {
        showError(rulesAcknowledgment.parentNode, 'You must agree to the community rules');
        return;
      }
  
      const notificationSettings = {
        notifyMessages: document.getElementById('notify-messages').checked,
        notifyMentions: document.getElementById('notify-mentions').checked
      };
  
      // Simulate joining the community
      console.log('Joining Community:', {
        communityId: selectedCommunityId,
        notificationSettings
      });
  
      if (selectedCommunity.visibility === 'restricted') {
        alert('Your request to join has been submitted. You will be notified once approved.');
        window.location.href = 'option.html';
      } else {
        // If intro prompt is enabled, encourage introduction
        if (selectedCommunity.introPrompt) {
          const introMessage = prompt('Introduce yourself to the community! (e.g., Hi, I’m Alex, I love hiking!)');
          if (introMessage) {
            console.log('Introduction:', introMessage);
            // In a real app, this would be sent to the chat or a dedicated introductions section
          }
        }
        alert(`Welcome to ${selectedCommunity.name}! Redirecting to chat...`);
        window.location.href = `chat.html?community_id=${selectedCommunityId}`;
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
    populateCommunityList();
    setupCommunitySelection();
    handleJoinCommunity();
    setupHamburgerMenu();
    setupSignOut();
  });