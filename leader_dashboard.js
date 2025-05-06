// leader_dashboard.js

// Simulated community data
let communityData = {
    members: 10,
    posts: [],
    polls: [],
    notifications: [],
    chats: [],
    name: "", // Community name from create_community
};

// Simulated user data (leader)
let userData = {
    role: "leader",
    profileCompleted: false,
    emergencyInfo: {
        fullName: "",
        emergencyContact: "",
        medicalConditions: "",
        bloodType: "",
        address: "",
        allergies: "", // Optional
        additionalInfo: "", // Optional
    },
    location: null,
};

// Initialize Supabase client globally
const { createClient } = window.supabase;
const supabase = createClient('https://mbhdhiexfkammibifdum.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iaGRoaWV4ZmthbW1pYmlmZHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NTE3MTAsImV4cCI6MjA2MTUyNzcxMH0.EXO5ybawj1KPxGSkzgPlVBiyvLbVKd2QVu-ptX9MDK4');

let currentUsername = '';
let currentCommunityId = '';

// Function to show error messages on the page
function showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    document.querySelector(".container").prepend(errorDiv);
}

// Check if profile is completed after community creation
function checkProfileCompletion() {
    if (!userData.profileCompleted) {
        showError("Please complete your profile, including the emergency information form, in 'My Profile' to proceed.");
    }
}

// Load community data from localStorage
function loadCommunityData() {
    const storedCommunity = localStorage.getItem("communityData");
    if (storedCommunity) {
        const parsedData = JSON.parse(storedCommunity);
        communityData.name = parsedData.name || "Unnamed Community";
        communityData.members = parsedData.members || communityData.members;
        document.getElementById("dashboard-title").textContent = `Leader Dashboard - ${communityData.name}`;
    }
}

// Display emergency info
function displayEmergencyInfo() {
    try {
        const emergencyInfoDisplay = document.getElementById("emergency-info-display");
        const info = userData.emergencyInfo;
        emergencyInfoDisplay.innerHTML = `
            <p>Full Name: ${info.fullName || "Not provided"}</p>
            <p>Emergency Contact: ${info.emergencyContact || "Not provided"}</p>
            <p>Medical Conditions: ${info.medicalConditions || "None"}</p>
            <p>Blood Type: ${info.bloodType || "Not provided"}</p>
            <p>Address: ${info.address || "Not provided"}</p>
            <p>Allergies: ${info.allergies || "None"}</p>
            <p>Additional Info: ${info.additionalInfo || "None"}</p>
        `;
    } catch (error) {
        showError("Error loading emergency information.");
    }
}

// Update analytics
function updateAnalytics() {
    try {
        document.getElementById("member-count").textContent = communityData.members;
        document.getElementById("post-count").textContent = communityData.posts.length + communityData.polls.length;
        document.getElementById("recent-activity").textContent = communityData.posts.length
            ? `${communityData.posts.length} new posts today`
            : "No recent activity";
    } catch (error) {
        showError("Error updating analytics.");
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
            };

            communityData.posts.push(post);
            document.getElementById("post-content").value = "";
            document.getElementById("post-image").value = "";
            document.getElementById("post-preview-img").style.display = "none";
            updateFeed();
            updateAnalytics();
            modal.style.display = "none";
        });
    } catch (error) {
        showError("Error setting up post creation.");
    }
}

// Create poll
function setupCreatePoll() {
    try {
        const modal = document.getElementById("create-poll-modal");
        const openModal = document.getElementById("create-poll-link");
        const closeModal = document.getElementById("close-create-poll");

        openModal.addEventListener("click", (event) => {
            event.preventDefault();
            modal.style.display = "block";
        });

        closeModal.addEventListener("click", () => {
            modal.style.display = "none";
        });

        document.getElementById("add-poll-option").addEventListener("click", () => {
            const optionsContainer = document.getElementById("poll-options");
            const newOption = document.createElement("input");
            newOption.type = "text";
            newOption.className = "poll-option";
            newOption.placeholder = `Option ${optionsContainer.children.length + 1}`;
            newOption.required = true;
            optionsContainer.appendChild(newOption);
        });

        document.getElementById("submit-poll").addEventListener("click", () => {
            const question = document.getElementById("poll-question").value.trim();
            const options = Array.from(document.getElementsByClassName("poll-option")).map(
                (input) => input.value.trim()
            );

            if (!question || options.some((opt) => !opt)) {
                alert("Poll question and all options are required.");
                return;
            }

            const poll = {
                id: Date.now(),
                type: "poll",
                question,
                options: options.map((opt) => ({ text: opt, votes: 0 })),
                timestamp: new Date().toLocaleString(),
                comments: [],
                reactions: { thumbsUp: 0, thumbsDown: 0 },
            };

            communityData.polls.push(poll);
            document.getElementById("poll-question").value = "";
            document.getElementById("poll-options").innerHTML = `
                <input type="text" class="poll-option" placeholder="Option 1" required>
                <input type="text" class="poll-option" placeholder="Option 2" required>
            `;
            updateFeed();
            updateAnalytics();
            modal.style.display = "none";
        });
    } catch (error) {
        showError("Error setting up poll creation.");
    }
}

// Setup Community Analytics
function setupCommunityAnalytics() {
    try {
        const modal = document.getElementById("analytics-modal");
        const openModal = document.getElementById("analytics-link");
        const closeModal = document.getElementById("close-analytics");

        openModal.addEventListener("click", (event) => {
            event.preventDefault();
            updateAnalytics();
            modal.style.display = "block";
        });

        closeModal.addEventListener("click", () => {
            modal.style.display = "none";
        });
    } catch (error) {
        showError("Error setting up community analytics.");
    }
}

// Emergency alert with location
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

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        userData.location = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        };
                        const alertData = {
                            id: Date.now(),
                            type: "emergency",
                            description,
                            location: userData.location,
                            timestamp: new Date().toLocaleString(),
                            sender: userData.emergencyInfo.fullName || "Leader",
                        };

                        communityData.notifications.push({
                            message: `Emergency Alert from ${alertData.sender}: ${description}`,
                            location: userData.location,
                            timestamp: alertData.timestamp,
                        });

                        communityData.posts.push(alertData);
                        document.getElementById("emergency-description").value = "";
                        updateFeed();
                        updateNotifications();
                        modal.style.display = "none";
                        alert("Emergency alert sent to all community members with your location!");
                    },
                    (error) => {
                        alert("Unable to retrieve location. Please enable location services.");
                    }
                );
            } else {
                alert("Geolocation is not supported by your browser.");
            }
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
                            <p>From: ${item.sender}</p>
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
    } catch (error) {
        showError("Error updating feed.");
    }
}

// React to poll
function reactToPoll(pollId, reactionType) {
    try {
        const poll = communityData.polls.find((p) => p.id === pollId);
        if (poll) {
            poll.reactions[reactionType]++;
            updateFeed();
        }
    } catch (error) {
        showError("Error reacting to poll.");
    }
}

// Add comment to poll
function addComment(pollId) {
    try {
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
    } catch (error) {
        showError("Error adding comment to poll.");
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

    // Hide join form and show chat
    document.getElementById('join-form').style.display = 'none';
    document.getElementById('chat-container').style.display = 'block';

    // Load messages and set up real-time
    loadMessages();
    setupRealtime();
}

async function loadMessages() {
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
    data.forEach((msg) => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', msg.username === currentUsername ? 'mine' : 'other');
        messageDiv.textContent = `${msg.username}: ${msg.content}`;
        chatMessages.appendChild(messageDiv);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.getElementById('chat-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageInput = document.getElementById('message-input');
    const content = messageInput.value.trim();

    if (!content) return;

    const { error } = await supabase
        .from('messages')
        .insert({
            community_id: currentCommunityId,
            username: currentUsername,
            content,
        });

    if (error) {
        console.error('Error sending message:', error);
    }

    messageInput.value = '';
});

function setupRealtime() {
    supabase
        .channel(`public:messages:community_id=eq.${currentCommunityId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `community_id=eq.${currentCommunityId}`,
            },
            (payload) => {
                const messageDiv = document.createElement('div');
                messageDiv.classList.add('message', payload.new.username === currentUsername ? 'mine' : 'other');
                messageDiv.textContent = `${payload.new.username}: ${payload.new.content}`;
                document.getElementById('chat-messages').appendChild(messageDiv);
                document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
            }
        )
        .subscribe();
}

function setupChat() {
    try {
        const modal = document.getElementById("chat-modal");
        const openModal = document.getElementById("chat-link");
        const closeModal = document.getElementById("close-chat");

        openModal.addEventListener("click", (event) => {
            event.preventDefault();
            modal.style.display = "block";
        });

        closeModal.addEventListener("click", () => {
            modal.style.display = "none";
            document.getElementById('join-form').style.display = 'block';
            document.getElementById('chat-container').style.display = 'none';
            currentUsername = '';
            currentCommunityId = '';
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) chatMessages.innerHTML = '';
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
        // Simulate fetching user data
        userData.profileCompleted = localStorage.getItem("profileCompleted") === "true";
        checkProfileCompletion();

        // Load community data
        loadCommunityData();

        // Simulate fetching emergency info
        userData.emergencyInfo = JSON.parse(localStorage.getItem("emergencyInfo")) || userData.emergencyInfo;

        displayEmergencyInfo();
        updateFeed();
        updateAnalytics();
        setupPostImagePreview();
        setupCreatePost();
        setupCreatePoll();
        setupCommunityAnalytics();
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
window.reactToPoll = reactToPoll;
window.addComment = addComment;
window.joinChat = joinChat;