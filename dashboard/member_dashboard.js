// member_dashboard.js

// Simulated community data (shared with leader)
let communityData = {
    members: 10,
    posts: [],
    polls: [],
    notifications: [],
    chats: [],
  };
  
  // Simulated user data (member)
  let userData = {
    role: "member",
  };
  
  // Update feed
  function updateFeed() {
    const feed = document.getElementById("feed");
    const allItems = [...communityData.posts, ...communityData.polls].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  
    feed.innerHTML = allItems
      .map((item) => {
        if (item.type === "post") {
          return `
            <div class="feed-item">
              <p>${item.content}</p>
              ${item.image ? `<img src="${item.image}" alt="Post Image">` : ""}
              <p><small>${item.timestamp}</small></p>
            </div>
          `;
        } else if (item.type === "poll") {
          const totalVotes = item.options.reduce((sum, opt) => sum + opt.votes, 0);
          return `
            <div class="feed-item">
              <h4>${item.question}</h4>
              <div class="poll-options">
                ${item.options
                  .map((opt, index) => `
                    <div class="poll-option-item">
                      <span>${opt.text}</span>
                      <span>${opt.votes} votes</span>
                      <div class="poll-bar" style="width: ${
                        totalVotes ? (opt.votes / totalVotes) * 100 : 0
                      }%;"></div>
                    </div>
                  `)
                  .join("")}
              </div>
              <div class="reaction-buttons">
                <button onclick="reactToPoll(${item.id}, 'thumbsUp')">👍 ${
            item.reactions.thumbsUp
          }</button>
                <button onclick="reactToPoll(${item.id}, 'thumbsDown')">👎 ${
            item.reactions.thumbsDown
          }</button>
              </div>
              <div class="comments-section">
                ${item.comments
                  .map((comment) => `<div class="comment">${comment}</div>`)
                  .join("")}
                <div class="comment-input">
                  <input type="text" placeholder="Add a comment..." id="comment-${
                    item.id
                  }">
                  <button onclick="addComment(${item.id})">Comment</button>
                </div>
              </div>
              <p><small>${item.timestamp}</small></p>
            </div>
          `;
        } else if (item.type === "emergency") {
          const mapLink = item.location
            ? `https://www.openstreetmap.org/?mlat=${item.location.latitude}&mlon=${item.location.longitude}#map=15/${item.location.latitude}/${item.location.longitude}`
            : "#";
          return `
            <div class="feed-item" style="border: 2px solid red;">
              <h4>Emergency Alert</h4>
              <p>${item.description}</p>
              <p>Location: <a href="${mapLink}" target="_blank">${
            item.location ? "View on Map" : "Location not available"
          }</a></p>
              <p><small>${item.timestamp}</small></p>
            </div>
          `;
        }
      })
      .join("");
  }
  
  // React to poll
  function reactToPoll(pollId, reactionType) {
    const poll = communityData.polls.find((p) => p.id === pollId);
    if (poll) {
      poll.reactions[reactionType]++;
      updateFeed();
    }
  }
  
  // Add comment to poll
  function addComment(pollId) {
    const commentInput = document.getElementById(`comment-${pollId}`);
    const comment = commentInput.value.trim();
    if (comment) {
      const poll = communityData.polls.find((p) => p.id === pollId);
      if (poll) {
        poll.comments.push(comment);
        commentInput.value = "";
        updateFeed();
      }
    }
  }
  
  // Update notifications
  function updateNotifications() {
    const notificationCount = document.getElementById("notification-count");
    notificationCount.textContent = communityData.notifications.length;
  }
  
  // Chat functionality
  function setupChat() {
    const chatMessages = document.getElementById("chat-messages");
    const chatInput = document.getElementById("chat-input");
    const sendButton = document.getElementById("send-chat");
  
    sendButton.addEventListener("click", () => {
      const message = chatInput.value.trim();
      if (message) {
        communityData.chats.push({
          user: "Member",
          message,
          timestamp: new Date().toLocaleString(),
        });
        chatInput.value = "";
        updateChat();
      }
    });
  
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendButton.click();
      }
    });
  }
  
  function updateChat() {
    const chatMessages = document.getElementById("chat-messages");
    chatMessages.innerHTML = communityData.chats
      .map(
        (chat) => `
          <div class="chat-message">
            <strong>${chat.user}:</strong> ${chat.message} <small>(${chat.timestamp})</small>
          </div>
        `
      )
      .join("");
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Hamburger menu
  function setupHamburgerMenu() {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
  
    if (hamburger && navLinks) {
      hamburger.addEventListener("click", () => {
        navLinks.classList.toggle("active");
      });
    }
  }
  
  // Sign out
  function setupSignOut() {
    const signOutLink = document.getElementById("signout-link");
    if (signOutLink) {
      signOutLink.addEventListener("click", (event) => {
        event.preventDefault();
        localStorage.removeItem("userSession");
        alert("You have been signed out successfully.");
        window.location.href = "signin.html";
      });
    }
  }
  
  // Initialize
  document.addEventListener("DOMContentLoaded", () => {
    updateFeed();
    updateNotifications();
    setupChat();
    setupHamburgerMenu();
    setupSignOut();
  });
  
  // Expose functions to global scope for inline event handlers
  window.reactToPoll = reactToPoll;
  window.addComment = addComment;