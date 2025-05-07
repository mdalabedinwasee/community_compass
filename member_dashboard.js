// member_dashboard.js

// Simulated community data
let communityData = {
  members: 10,
  posts: [],
  notifications: [],
  chats: [],
  name: "",
};

// Simulated user data (member)
let userData = {
  role: "member",
  username: "",
};

// Initialize Supabase client globally
const { createClient } = window.supabase;
const supabase = createClient('https://mbhdhiexfkammibifdum.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iaGRoaWV4ZmthbW1pYmlmZHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5NTE3MTAsImV4cCI6MjA2MTUyNzcxMH0.EXO5ybawj1KPxGSkzgPlVBiyvLbVKd2QVu-ptX9MDK4');

let currentUsername = '';
let currentCommunityId = '';
let editingMessageId = null;
let selectedMessageId = null;

// Function to show error messages
function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  document.querySelector(".container").prepend(errorDiv);
}

// Helper function to format timestamp (WhatsApp style)
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  
  return isToday
    ? `${formattedHours}:${minutes} ${ampm}`
    : `${date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })} ${formattedHours}:${minutes} ${ampm}`;
}

// Load community data from localStorage
function loadCommunityData() {
  const storedCommunity = localStorage.getItem("communityData");
  if (storedCommunity) {
      const parsedData = JSON.parse(storedCommunity);
      communityData.name = parsedData.name || "Unnamed Community";
      communityData.members = parsedData.members || communityData.members;
      communityData.posts = parsedData.posts || [];
      communityData.notifications = parsedData.notifications || [];
      document.getElementById("dashboard-title").textContent = `Member Dashboard - ${communityData.name}`;
  }
}

// Post image preview
function setupPostImagePreview() {
  try {
      const fileInput = document.getElementById("post-image");
      const previewImg = document.getElementById("post-preview-img");

      fileInput.addEventListener("change", (event) => {
          const file = event.target.files[0];
          if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                  previewImg.src = e.target.result;
                  previewImg.style.display = "block";
              };
              reader.readAsDataURL(file);
          } else {
              previewImg.src = "";
              previewImg.style.display = "none";
          }
      });
  } catch (error) {
      showError("Error setting up post image preview.");
  }
}

// Create post
function setupCreatePost() {
  try {
      const modal = document.getElementById("create-post-modal");
      const openModal = document.getElementById("create-post-link");
      const closeModal = document.getElementById("close-create-post");

      openModal.addEventListener("click", (event) => {
          event.preventDefault();
          modal.style.display = "block";
      });

      closeModal.addEventListener("click", () => {
          modal.style.display = "none";
      });

      document.getElementById("submit-post").addEventListener("click", () => {
          const content = document.getElementById("post-content").value.trim();
          const imageFile = document.getElementById("post-image").files[0];

          if (!content) {
              alert("Post content is required.");
              return;
          }

          const post = {
              id: Date.now(),
              type: "post",
              content,
              image: imageFile ? URL.createObjectURL(imageFile) : null,
              timestamp: new Date().toLocaleString(),
              likes: 0,
              comments: [],
          };

          communityData.posts.push(post);
          document.getElementById("post-content").value = "";
          document.getElementById("post-image").value = "";
          document.getElementById("post-preview-img").style.display = "none";
          updateFeed();
          modal.style.display = "none";
      });
  } catch (error) {
      showError("Error setting up post creation.");
  }
}

// Emergency alert (text-only)
function setupEmergencyAlert() {
  try {
      const modal = document.getElementById("emergency-modal");
      const openButton = document.getElementById("emergency-alert-button");
      const sendButton = document.getElementById("send-emergency");
      const cancelButton = document.getElementById("cancel-emergency");

      openButton.addEventListener("click", () => {
          modal.style.display = "block";
      });

      sendButton.addEventListener("click", () => {
          const description = document.getElementById("emergency-description").value.trim();
          if (!description) {
              alert("Emergency description is required.");
              return;
          }

          const alertData = {
              id: Date.now(),
              type: "emergency",
              description,
              timestamp: new Date().toLocaleString(),
              sender: userData.username || "Member",
          };

          communityData.notifications.push({
              message: `Emergency Alert from ${alertData.sender}: ${description}`,
              timestamp: alertData.timestamp,
          });

          communityData.posts.push(alertData);
          document.getElementById("emergency-description").value = "";
          updateFeed();
          updateNotifications();
          modal.style.display = "none";
          alert("Emergency alert sent to all community members!");
      });

      cancelButton.addEventListener("click", () => {
          modal.style.display = "none";
      });
  } catch (error) {
      showError("Error setting up emergency alert.");
  }
}

// Update feed
function updateFeed() {
  try {
      const feed = document.getElementById("feed");
      const allItems = [...communityData.posts].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      feed.innerHTML = allItems
          .map((item) => {
              if (item.type === "post") {
                  return `
                      <div class="feed-item">
                          <p>${item.content}</p>
                          ${item.image ? `<img src="${item.image}" alt="Post Image">` : ""}
                          <div class="reaction-buttons">
                              <button onclick="likePost(${item.id})">👍 ${item.likes || 0}</button>
                          </div>
                          <div class="comments-section">
                              ${item.comments
                                  ? item.comments
                                        .map((comment) => `<div class="comment">${comment}</div>`)
                                        .join("")
                                  : ""}
                              <div class="comment-input">
                                  <input type="text" placeholder="Add a comment..." id="comment-${item.id}">
                                  <button onclick="addComment(${item.id})">Comment</button>
                              </div>
                          </div>
                          <p><small>${item.timestamp}</small></p>
                      </div>
                  `;
              } else if (item.type === "emergency") {
                  return `
                      <div class="feed-item" style="border: 2px solid red;">
                          <h4>Emergency Alert</h4>
                          <p>From: ${item.sender}</p>
                          <p>${item.description}</p>
                          <p><small>${item.timestamp}</small></p>
                      </div>
                  `;
              }
          })
          .join("");
  } catch (error) {
      showError("Error updating feed.");
  }
}

// Like a post
function likePost(postId) {
  try {
      const post = communityData.posts.find((p) => p.id === postId);
      if (post) {
          post.likes = (post.likes || 0) + 1;
          updateFeed();
      }
  } catch (error) {
      showError("Error liking post.");
  }
}

// Add comment to post
function addComment(postId) {
  try {
      const commentInput = document.getElementById(`comment-${postId}`);
      const comment = commentInput.value.trim();
      if (comment) {
          const post = communityData.posts.find((p) => p.id === postId);
          if (post) {
              post.comments = post.comments || [];
              post.comments.push(`${userData.username || "Member"}: ${comment}`);
              commentInput.value = "";
              updateFeed();
          }
      }
  } catch (error) {
      showError("Error adding comment to post.");
  }
}

// Update notifications
function updateNotifications() {
  try {
      const notificationCount = document.getElementById("notification-count");
      notificationCount.textContent = communityData.notifications.length;
  } catch (error) {
      showError("Error updating notifications.");
  }
}

// Chat functionality
function joinChat() {
  const usernameInput = document.getElementById('username');
  const communityIdInput = document.getElementById('community-id');
  currentUsername = usernameInput.value.trim();
  currentCommunityId = communityIdInput.value.trim();

  if (!currentUsername || !currentCommunityId) {
      alert('Please enter a username and community ID.');
      return;
  }

  userData.username = currentUsername;
  document.getElementById('join-form').style.display = 'none';
  document.getElementById('chat-container').style.display = 'block';
  document.getElementById('view-pinned-messages').style.display = 'block';

  loadMessages();
  setupRealtime();
  setupContextMenu();
}

async function loadMessages() {
  try {
      const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('community_id', currentCommunityId)
          .order('created_at', { ascending: true });

      if (error) {
          console.error('Error loading messages:', error);
          return;
      }

      const chatMessages = document.getElementById('chat-messages');
      chatMessages.innerHTML = '';
      data.forEach((msg) => renderMessage(msg));
      chatMessages.scrollTop = chatMessages.scrollHeight;
  } catch (error) {
      showError("Error loading chat messages.");
  }
}

function renderMessage(msg) {
  const chatMessages = document.getElementById('chat-messages');
  const isMine = msg.username === currentUsername;
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', isMine ? 'mine' : 'other');
  if (msg.is_pinned) messageDiv.classList.add('pinned-message');
  if (msg.reply_to_id) messageDiv.classList.add('reply');

  const profilePic = `https://via.placeholder.com/40`; // Placeholder for profile picture
  const formattedTime = formatTimestamp(msg.created_at);
  const reactions = msg.reactions || {};
  const reactionDisplay = Object.entries(reactions)
    .map(([emoji, users]) => `${emoji} ${users.length}`)
    .join(' ');

  messageDiv.innerHTML = `
      <img src="${profilePic}" class="profile-pic" alt="${msg.username}'s profile picture">
      <div>
          <div class="username">${msg.username}</div>
          <div class="message-content">${msg.content}</div>
          <div class="message-timestamp">${formattedTime}</div>
          ${msg.reply_to_id ? `<div class="reply-info">Replying to message ID ${msg.reply_to_id}</div>` : ''}
          ${reactionDisplay ? `<div class="message-reactions">${reactionDisplay}</div>` : ''}
      </div>
  `;
  messageDiv.dataset.messageId = msg.id;
  messageDiv.addEventListener('contextmenu', showContextMenu);
  messageDiv.addEventListener('touchstart', handleTouchStart);
  messageDiv.addEventListener('touchend', handleTouchEnd);
  chatMessages.appendChild(messageDiv);
}

async function renderPinnedMessages() {
  try {
      const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('community_id', currentCommunityId)
          .eq('is_pinned', true)
          .order('created_at', { ascending: true });

      if (error) {
          console.error('Error loading pinned messages:', error);
          return;
      }

      const pinnedMessages = document.getElementById('pinned-messages');
      pinnedMessages.innerHTML = '<h4>Pinned Messages</h4>';
      if (data.length === 0) {
          pinnedMessages.innerHTML += '<p>No pinned messages.</p>';
      } else {
          data.forEach((msg) => {
              const messageDiv = document.createElement('div');
              messageDiv.classList.add('message', 'pinned-message');
              const profilePic = `https://via.placeholder.com/40`;
              const formattedTime = formatTimestamp(msg.created_at);
              const reactions = msg.reactions || {};
              const reactionDisplay = Object.entries(reactions)
                .map(([emoji, users]) => `${emoji} ${users.length}`)
                .join(' ');
              messageDiv.innerHTML = `
                  <img src="${profilePic}" class="profile-pic" alt="${msg.username}'s profile picture">
                  <div>
                      <div class="username">${msg.username}</div>
                      <div class="message-content">${msg.content}</div>
                      <div class="message-timestamp">${formattedTime}</div>
                      ${msg.reply_to_id ? `<div class="reply-info">Replying to message ID ${msg.reply_to_id}</div>` : ''}
                      ${reactionDisplay ? `<div class="message-reactions">${reactionDisplay}</div>` : ''}
                  </div>
              `;
              messageDiv.dataset.messageId = msg.id;
              messageDiv.addEventListener('contextmenu', showContextMenu);
              messageDiv.addEventListener('touchstart', handleTouchStart);
              messageDiv.addEventListener('touchend', handleTouchEnd);
              pinnedMessages.appendChild(messageDiv);
          });
      }
  } catch (error) {
      showError("Error loading pinned messages.");
  }
}

document.getElementById('chat-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const messageInput = document.getElementById('message-input');
  const content = messageInput.value.trim();

  if (!content) return;

  try {
      if (editingMessageId) {
          const { error } = await supabase
              .from('messages')
              .update({ content })
              .eq('id', editingMessageId)
              .eq('username', currentUsername);

          if (error) {
              console.error('Error editing message:', error);
              showError('Error editing message.');
          }
          editingMessageId = null;
          messageInput.placeholder = 'Type a message...';
      } else {
          const messageData = {
              community_id: currentCommunityId,
              username: currentUsername,
              content,
              is_pinned: false,
              reactions: {},
              starred: false,
          };
          if (window.replyToMessageId) {
              messageData.reply_to_id = window.replyToMessageId;
          }

          const { error } = await supabase
              .from('messages')
              .insert(messageData);

          if (error) {
              console.error('Error sending message:', error);
              showError('Error sending message.');
          }
      }

      messageInput.value = '';
      window.replyToMessageId = null;
  } catch (error) {
      showError("Error processing message.");
  }
});

// Context Menu Functionality
let touchTimer;
const longPressDuration = 500; // 500ms for long press

function showContextMenu(event) {
  event.preventDefault();
  const contextMenu = document.getElementById('message-context-menu');
  selectedMessageId = event.currentTarget.dataset.messageId;
  
  const { clientX: x, clientY: y } = event;
  contextMenu.style.top = `${y}px`;
  contextMenu.style.left = `${x}px`;
  contextMenu.style.display = 'block';

  // Hide menu when clicking elsewhere
  document.addEventListener('click', hideContextMenu);
}

function handleTouchStart(event) {
  touchTimer = setTimeout(() => {
      showContextMenu(event);
  }, longPressDuration);
}

function handleTouchEnd(event) {
  clearTimeout(touchTimer);
}

function hideContextMenu() {
  const contextMenu = document.getElementById('message-context-menu');
  contextMenu.style.display = 'none';
  document.removeEventListener('click', hideContextMenu);
}

function setupContextMenu() {
  // Already set up in renderMessage and renderPinnedMessages via event listeners
}

window.handleContextMenuAction = async function(action) {
  if (!selectedMessageId) return;

  const messageDiv = document.querySelector(`.message[data-message-id="${selectedMessageId}"]`);
  const content = messageDiv.querySelector('.message-content').textContent;

  switch (action) {
      case 'reply':
          replyToMessage(selectedMessageId);
          break;
      case 'copy':
          navigator.clipboard.writeText(content).then(() => {
              alert('Message copied to clipboard!');
          });
          break;
      case 'forward':
          alert('Forward functionality not implemented yet.');
          break;
      case 'star':
          await starMessage(selectedMessageId);
          break;
      case 'pin':
          await pinMessage(selectedMessageId);
          break;
      case 'delete':
          await deleteMessage(selectedMessageId);
          break;
      case 'select':
          alert('Select functionality not implemented yet.');
          break;
      case 'share':
          if (navigator.share) {
              navigator.share({
                  title: 'Shared Message',
                  text: content,
              }).then(() => console.log('Message shared!'))
                .catch((error) => console.error('Error sharing:', error));
          } else {
              alert('Share functionality not supported on this device.');
          }
          break;
  }
  hideContextMenu();
};

window.handleReaction = async function(emoji) {
  if (!selectedMessageId) return;

  try {
      // Fetch the current reactions
      const { data, error } = await supabase
          .from('messages')
          .select('reactions')
          .eq('id', selectedMessageId)
          .single();

      if (error) {
          console.error('Error fetching reactions:', error);
          showError('Error fetching reactions.');
          return;
      }

      const reactions = data.reactions || {};
      if (!reactions[emoji]) {
          reactions[emoji] = [];
      }

      // Add the current user to the reaction if not already present
      if (!reactions[emoji].includes(currentUsername)) {
          reactions[emoji].push(currentUsername);
      }

      // Update the reactions in Supabase
      const { error: updateError } = await supabase
          .from('messages')
          .update({ reactions })
          .eq('id', selectedMessageId);

      if (updateError) {
          console.error('Error updating reactions:', updateError);
          showError('Error updating reactions.');
      }
  } catch (error) {
      showError("Error adding reaction.");
  }
  hideContextMenu();
};

async function pinMessage(messageId) {
  try {
      const { error } = await supabase
          .from('messages')
          .update({ is_pinned: true })
          .eq('id', messageId);

      if (error) {
          console.error('Error pinning message:', error);
          showError('Error pinning message.');
      }
  } catch (error) {
      showError("Error pinning message.");
  }
}

async function starMessage(messageId) {
  try {
      const { error } = await supabase
          .from('messages')
          .update({ starred: true })
          .eq('id', messageId);

      if (error) {
          console.error('Error starring message:', error);
          showError('Error starring message.');
      } else {
          alert('Message starred!');
      }
  } catch (error) {
      showError("Error starring message.");
  }
}

async function deleteMessage(messageId) {
  try {
      const { error } = await supabase
          .from('messages')
          .delete()
          .eq('id', messageId)
          .eq('username', currentUsername);

      if (error) {
          console.error('Error deleting message:', error);
          showError('Error deleting message.');
      }
  } catch (error) {
      showError("Error deleting message.");
  }
}

function replyToMessage(messageId) {
  window.replyToMessageId = messageId;
  document.getElementById('message-input').placeholder = `Replying to message ID ${messageId}...`;
  document.getElementById('message-input').focus();
}

function setupRealtime() {
  supabase
      .channel(`public:messages:community_id=eq.${currentCommunityId}`)
      .on(
          'postgres_changes',
          {
              event: '*',
              schema: 'public',
              table: 'messages',
              filter: `community_id=eq.${currentCommunityId}`,
          },
          (payload) => {
              if (payload.eventType === 'INSERT') {
                  renderMessage(payload.new);
                  document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
              } else if (payload.eventType === 'UPDATE') {
                  const messageDiv = document.querySelector(`.message[data-message-id="${payload.new.id}"]`);
                  if (messageDiv) {
                      messageDiv.querySelector('.message-content').textContent = payload.new.content;
                      if (payload.new.is_pinned) {
                          messageDiv.classList.add('pinned-message');
                      } else {
                          messageDiv.classList.remove('pinned-message');
                      }
                      // Update reactions display
                      const reactions = payload.new.reactions || {};
                      const reactionDisplay = Object.entries(reactions)
                        .map(([emoji, users]) => `${emoji} ${users.length}`)
                        .join(' ');
                      const reactionDiv = messageDiv.querySelector('.message-reactions');
                      if (reactionDiv) {
                          reactionDiv.textContent = reactionDisplay;
                      } else if (reactionDisplay) {
                          const newReactionDiv = document.createElement('div');
                          newReactionDiv.className = 'message-reactions';
                          newReactionDiv.textContent = reactionDisplay;
                          messageDiv.querySelector('div').appendChild(newReactionDiv);
                      }
                  }
              } else if (payload.eventType === 'DELETE') {
                  const messageDiv = document.querySelector(`.message[data-message-id="${payload.old.id}"]`);
                  if (messageDiv) messageDiv.remove();
              }
              if (document.getElementById('pinned-messages').style.display === 'block') {
                  renderPinnedMessages();
              }
          }
      )
      .subscribe();
}

function setupChat() {
  try {
      const modal = document.getElementById("chat-modal");
      const openModal = document.getElementById("chat-link");
      const closeModal = document.getElementById("close-chat");
      const viewPinnedButton = document.getElementById("view-pinned-messages");

      openModal.addEventListener("click", (event) => {
          event.preventDefault();
          modal.style.display = "block";
      });

      closeModal.addEventListener("click", () => {
          modal.style.display = "none";
          document.getElementById('join-form').style.display = 'block';
          document.getElementById('chat-container').style.display = 'none';
          document.getElementById('view-pinned-messages').style.display = 'none';
          document.getElementById('pinned-messages').style.display = 'none';
          currentUsername = '';
          currentCommunityId = '';
          const chatMessages = document.getElementById('chat-messages');
          if (chatMessages) chatMessages.innerHTML = '';
      });

      viewPinnedButton.addEventListener("click", () => {
          const pinnedMessages = document.getElementById('pinned-messages');
          const chatMessages = document.getElementById('chat-messages');
          const chatContainer = document.getElementById('chat-container');
          if (pinnedMessages.style.display === 'none') {
              pinnedMessages.style.display = 'block';
              chatMessages.style.display = 'none';
              chatContainer.style.display = 'none';
              viewPinnedButton.textContent = 'View All Messages';
              renderPinnedMessages();
          } else {
              pinnedMessages.style.display = 'none';
              chatMessages.style.display = 'block';
              chatContainer.style.display = 'block';
              viewPinnedButton.textContent = 'View Pinned Messages';
          }
      });
  } catch (error) {
      showError("Error setting up chat.");
  }
}

// Hamburger menu
function setupHamburgerMenu() {
  try {
      const hamburger = document.querySelector(".hamburger");
      const navLinks = document.querySelector(".nav-links");

      if (hamburger && navLinks) {
          hamburger.addEventListener("click", () => {
              navLinks.classList.toggle("active");
          });
      }
  } catch (error) {
      showError("Error setting up hamburger menu.");
  }
}

// Sign out
function setupSignOut() {
  try {
      const signOutLink = document.getElementById("signout-link");
      if (signOutLink) {
          signOutLink.addEventListener("click", (event) => {
              event.preventDefault();
              localStorage.removeItem("userSession");
              alert("You have been signed out successfully.");
              window.location.href = "signin.html";
          });
      }
  } catch (error) {
      showError("Error setting up sign-out.");
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  try {
      loadCommunityData();
      updateFeed();
      setupPostImagePreview();
      setupCreatePost();
      setupEmergencyAlert();
      setupChat();
      updateNotifications();
      setupHamburgerMenu();
      setupSignOut();
  } catch (error) {
      showError("Error initializing dashboard: " + error.message);
  }
});

// Expose functions to global scope
window.likePost = likePost;
window.addComment = addComment;
window.joinChat = joinChat;
window.replyToMessage = replyToMessage;