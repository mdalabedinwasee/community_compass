// leader_dashboard.js

// Simulated community data
let communityData = {
    members: 10,
    posts: [],
    polls: [],
    notifications: [],
    chats: [],
    name: "",
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
        allergies: "",
        additionalInfo: "",
    },
    location: null,
};

// Initialize Supabase client globally
const { createClient } = window.supabase;
const supabase = createClient(
    "https://mbhdhiexfkammibifdum.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iaGRoaWV4ZmthbW1pYmlmZHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NTE3MTAsImV4cCI6MjA2MTUyNzcxMH0.EXO5ybawj1KPxGSkzgPlVBiyvLbVKd2QVu-ptX9MDK4"
);

let currentUsername = localStorage.getItem("currentUsername") || "Anonymous"; // Initialize with a fallback
let currentCommunityId = "";
let currentPollId = null; // To track the poll being edited or deleted
let currentPostId = null; // To track the post being edited or deleted
let currentMessageId = null; // To track the chat message being edited or deleted
let lastMessageTimestamp = null; // For polling new messages
let pollingInterval = null; // For message polling

// Function to show error messages on the page
function showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    document.querySelector(".container").prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000); // Remove error after 5 seconds
}

// Check if profile is completed after community creation
function checkProfileCompletion() {
    if (!userData.profileCompleted) {
        showError(
            "Please complete your profile, including the emergency information form, in 'My Profile' to proceed."
        );
    }
}

// Load community data from localStorage
function loadCommunityData() {
    const storedCommunity = localStorage.getItem("communityData");
    if (storedCommunity) {
        const parsedData = JSON.parse(storedCommunity);
        communityData.name = parsedData.name || "Unnamed Community";
        communityData.members = parsedData.members || communityData.members;
        document.getElementById(
            "dashboard-title"
        ).textContent = `Leader Dashboard - ${communityData.name}`;
    }
}

// Display emergency info
function displayEmergencyInfo() {
    try {
        const emergencyInfoDisplay = document.getElementById(
            "emergency-info-display"
        );
        if (emergencyInfoDisplay) {
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
        }
    } catch (error) {
        showError("Error loading emergency information: " + error.message);
    }
}

// Update analytics
function updateAnalytics() {
    try {
        document.getElementById("member-count").textContent = communityData.members;
        document.getElementById("post-count").textContent =
            communityData.posts.length + communityData.polls.length;
        document.getElementById("recent-activity").textContent =
            communityData.posts.length
                ? `${communityData.posts.length} new posts today`
                : "No recent activity";
    } catch (error) {
        showError("Error updating analytics: " + error.message);
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
        showError("Error setting up post image preview: " + error.message);
    }
}

// Edit post image preview
function setupEditPostImagePreview() {
    try {
        const fileInput = document.getElementById("edit-post-image");
        const previewImg = document.getElementById("edit-post-preview-img");

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
        showError("Error setting up edit post image preview: " + error.message);
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
            document.getElementById("post-content").value = "";
            document.getElementById("post-image").value = "";
            document.getElementById("post-preview-img").style.display = "none";
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
                creator: currentUsername,
                image: imageFile ? URL.createObjectURL(imageFile) : null,
                timestamp: new Date().toLocaleString(),
                likes: [],
                comments: [],
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
        showError("Error setting up post creation: " + error.message);
    }
}

// Edit post
function setupEditPost() {
    try {
        const modal = document.getElementById("edit-post-modal");
        const closeModal = document.getElementById("close-edit-post");

        closeModal.addEventListener("click", () => {
            modal.style.display = "none";
            document.getElementById("edit-post-content").value = "";
            document.getElementById("edit-post-image").value = "";
            document.getElementById("edit-post-preview-img").style.display = "none";
            currentPostId = null;
        });

        document.getElementById("submit-edit-post").addEventListener("click", () => {
            const content = document.getElementById("edit-post-content").value.trim();
            const imageFile = document.getElementById("edit-post-image").files[0];

            if (!content) {
                alert("Post content is required.");
                return;
            }

            const postIndex = communityData.posts.findIndex((p) => p.id === currentPostId);
            if (postIndex === -1) {
                showError("Post not found.");
                return;
            }

            communityData.posts[postIndex] = {
                ...communityData.posts[postIndex],
                content,
                image: imageFile
                    ? URL.createObjectURL(imageFile)
                    : communityData.posts[postIndex].image,
                timestamp: new Date().toLocaleString(),
            };

            document.getElementById("edit-post-content").value = "";
            document.getElementById("edit-post-image").value = "";
            document.getElementById("edit-post-preview-img").style.display = "none";
            modal.style.display = "none";
            currentPostId = null;
            updateFeed();
            updateAnalytics();
        });
    } catch (error) {
        showError("Error setting up post editing: " + error.message);
    }
}

// Handle Like/Unlike
function toggleLike(postId) {
    try {
        const post = communityData.posts.find((p) => p.id === postId);
        if (!post) return;

        const userId = currentUsername || "anonymous";
        const hasLiked = post.likes.includes(userId);

        if (hasLiked) {
            post.likes = post.likes.filter((id) => id !== userId);
        } else {
            post.likes.push(userId);
        }

        updateFeed();
    } catch (error) {
        showError("Error toggling like: " + error.message);
    }
}

// Handle Comment Submission
function submitComment(postId) {
    try {
        const post = communityData.posts.find((p) => p.id === postId);
        if (!post) return;

        const commentInput = document.getElementById(`comment-input-${postId}`);
        const content = commentInput.value.trim();
        if (!content) {
            alert("Comment cannot be empty.");
            return;
        }

        const comment = {
            id: Date.now(),
            content,
            username: currentUsername || "Anonymous",
            timestamp: new Date().toLocaleString(),
        };

        post.comments.push(comment);
        commentInput.value = "";
        updateFeed();
    } catch (error) {
        showError("Error submitting comment: " + error.message);
    }
}

// Toggle Comment Section
function toggleCommentSection(postId) {
    const commentSection = document.getElementById(`comment-section-${postId}`);
    if (commentSection) {
        commentSection.classList.toggle("active");
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
            document.getElementById("poll-question").value = "";
            document.getElementById("poll-timer").value = "";
            document.getElementById("poll-options").innerHTML = `
                <input type="text" class="poll-option" placeholder="Option 1" required>
                <input type="text" class="poll-option" placeholder="Option 2" required>
            `;
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
            const options = Array.from(
                document.getElementsByClassName("poll-option")
            ).map((input) => input.value.trim());
            const timerDays = parseInt(
                document.getElementById("poll-timer").value.trim() || "0"
            );

            if (!question || options.some((opt) => !opt)) {
                alert("Poll question and all options are required.");
                return;
            }

            let expiresAt = null;
            if (timerDays > 0) {
                const now = new Date();
                expiresAt = new Date(now.getTime() + timerDays * 24 * 60 * 60 * 1000);
            }

            const poll = {
                id: Date.now(),
                type: "poll",
                question,
                options: options.map((opt) => ({ text: opt, votes: 0 })),
                timestamp: new Date().toLocaleString(),
                votedUsers: [],
                expiresAt: expiresAt ? expiresAt.toISOString() : null,
            };

            communityData.polls.push(poll);
            document.getElementById("poll-question").value = "";
            document.getElementById("poll-timer").value = "";
            document.getElementById("poll-options").innerHTML = `
                <input type="text" class="poll-option" placeholder="Option 1" required>
                <input type="text" class="poll-option" placeholder="Option 2" required>
            `;
            updateFeed();
            updateAnalytics();
            modal.style.display = "none";
        });
    } catch (error) {
        showError("Error setting up poll creation: " + error.message);
    }
}

// Edit poll
function setupEditPoll() {
    try {
        const modal = document.getElementById("edit-poll-modal");
        const closeModal = document.getElementById("close-edit-poll");

        closeModal.addEventListener("click", () => {
            modal.style.display = "none";
            currentPollId = null;
        });

        document
            .getElementById("add-edit-poll-option")
            .addEventListener("click", () => {
                const optionsContainer = document.getElementById("edit-poll-options");
                const newOption = document.createElement("input");
                newOption.type = "text";
                newOption.className = "poll-option";
                newOption.placeholder = `Option ${optionsContainer.children.length + 1}`;
                newOption.required = true;
                optionsContainer.appendChild(newOption);
            });

        document
            .getElementById("submit-edit-poll")
            .addEventListener("click", () => {
                const question = document
                    .getElementById("edit-poll-question")
                    .value.trim();
                const options = Array.from(
                    document
                        .getElementById("edit-poll-options")
                        .getElementsByClassName("poll-option")
                ).map((input) => input.value.trim());
                const timerDays = parseInt(
                    document.getElementById("edit-poll-timer").value.trim() || "0"
                );

                if (!question || options.some((opt) => !opt)) {
                    alert("Poll question and all options are required.");
                    return;
                }

                let expiresAt = null;
                if (timerDays > 0) {
                    const now = new Date();
                    expiresAt = new Date(now.getTime() + timerDays * 24 * 60 * 60 * 1000);
                }

                const pollIndex = communityData.polls.findIndex(
                    (p) => p.id === currentPollId
                );
                if (pollIndex === -1) {
                    showError("Poll not found.");
                    return;
                }

                communityData.polls[pollIndex] = {
                    ...communityData.polls[pollIndex],
                    question,
                    options: options.map((opt) => ({
                        text: opt,
                        votes: 0, // Reset votes on edit
                    })),
                    votedUsers: [], // Reset voters on edit
                    expiresAt: expiresAt ? expiresAt.toISOString() : null,
                    timestamp: new Date().toLocaleString(),
                };

                modal.style.display = "none";
                currentPollId = null;
                updateFeed();
                updateAnalytics();
            });
    } catch (error) {
        showError("Error setting up poll editing: " + error.message);
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
        showError("Error setting up community analytics: " + error.message);
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
            const description = document
                .getElementById("emergency-description")
                .value.trim();
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
                        alert(
                            "Emergency alert sent to all community members with your location!"
                        );
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
            document.getElementById("emergency-description").value = "";
        });
    } catch (error) {
        showError("Error setting up emergency alert: " + error.message);
    }
}

// Check if poll is active
function isPollActive(poll) {
    if (!poll.expiresAt) return true; // No timer set, poll is always active
    const now = new Date();
    const expiresAt = new Date(poll.expiresAt);
    return now < expiresAt;
}

// Get remaining time for poll
function getRemainingTime(poll) {
    if (!poll.expiresAt) return null;
    const now = new Date();
    const expiresAt = new Date(poll.expiresAt);
    const diffMs = expiresAt - now;
    if (diffMs <= 0) return null;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${minutes}m remaining`;
}

// Vote on poll
function voteOnPoll(pollId, optionIndex) {
    try {
        const poll = communityData.polls.find((p) => p.id === pollId);
        if (!poll) return;

        if (!isPollActive(poll)) {
            alert("This poll has expired and is no longer accepting votes.");
            return;
        }

        const userId = currentUsername || "anonymous";

        // Track user's previous vote
        const userVoteIndex = poll.options.findIndex((opt, index) =>
            poll.votedUsers.some(
                (vote) => vote.userId === userId && vote.optionIndex === index
            )
        );

        // If user has voted before, remove their previous vote
        if (userVoteIndex !== -1) {
            poll.options[userVoteIndex].votes--;
            poll.votedUsers = poll.votedUsers.filter(
                (vote) =>
                    !(vote.userId === userId && vote.optionIndex === userVoteIndex)
            );
        }

        // Add new vote
        poll.options[optionIndex].votes++;
        poll.votedUsers.push({ userId, optionIndex });

        updateFeed();
    } catch (error) {
        showError("Error voting on poll: " + error.message);
    }
}

// Show poll context menu
function showPollContextMenu(pollId, x, y) {
    currentPollId = pollId;
    const contextMenu = document.getElementById("poll-context-menu");
    contextMenu.style.top = `${y}px`;
    contextMenu.style.left = `${x}px`;
    contextMenu.style.display = "block";
    document.addEventListener("click", hidePollContextMenu, { once: true });
}

// Hide poll context menu
function hidePollContextMenu() {
    const contextMenu = document.getElementById("poll-context-menu");
    contextMenu.style.display = "none";
    currentPollId = null;
}

// Show post context menu
function showPostContextMenu(postId, x, y) {
    currentPostId = postId;
    const contextMenu = document.getElementById("post-context-menu");
    contextMenu.style.top = `${y}px`;
    contextMenu.style.left = `${x}px`;
    contextMenu.style.display = "block";
    document.addEventListener("click", hidePostContextMenu, { once: true });
}

// Hide post context menu
function hidePostContextMenu() {
    const contextMenu = document.getElementById("post-context-menu");
    contextMenu.style.display = "none";
    currentPostId = null;
}

// Edit poll
function editPoll() {
    try {
        const poll = communityData.polls.find((p) => p.id === currentPollId);
        if (!poll) {
            showError("Poll not found.");
            return;
        }

        const modal = document.getElementById("edit-poll-modal");
        const questionInput = document.getElementById("edit-poll-question");
        const optionsContainer = document.getElementById("edit-poll-options");
        const timerInput = document.getElementById("edit-poll-timer");

        questionInput.value = poll.question;
        optionsContainer.innerHTML = poll.options
            .map(
                (opt, index) =>
                    `<input type="text" class="poll-option" value="${opt.text}" placeholder="Option ${
                        index + 1
                    }" required>`
            )
            .join("");
        timerInput.value = poll.expiresAt
            ? Math.ceil(
                  (new Date(poll.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)
              )
            : "";

        modal.style.display = "block";
        hidePollContextMenu();
    } catch (error) {
        showError("Error opening poll for editing: " + error.message);
    }
}

// Delete poll
function deletePoll() {
    try {
        if (!confirm("Are you sure you want to delete this poll?")) return;

        communityData.polls = communityData.polls.filter(
            (p) => p.id !== currentPollId
        );
        hidePollContextMenu();
        updateFeed();
        updateAnalytics();
    } catch (error) {
        showError("Error deleting poll: " + error.message);
    }
}

// Edit post
function editPost() {
    try {
        const post = communityData.posts.find((p) => p.id === currentPostId);
        if (!post) {
            showError("Post not found.");
            return;
        }

        const modal = document.getElementById("edit-post-modal");
        const contentInput = document.getElementById("edit-post-content");
        const previewImg = document.getElementById("edit-post-preview-img");

        contentInput.value = post.content;
        if (post.image) {
            previewImg.src = post.image;
            previewImg.style.display = "block";
        } else {
            previewImg.src = "";
            previewImg.style.display = "none";
        }

        modal.style.display = "block";
        hidePostContextMenu();
    } catch (error) {
        showError("Error opening post for editing: " + error.message);
    }
}

// Delete post
function deletePost() {
    try {
        if (!confirm("Are you sure you want to delete this post?")) return;

        communityData.posts = communityData.posts.filter(
            (p) => p.id !== currentPostId
        );
        hidePostContextMenu();
        updateFeed();
        updateAnalytics();
    } catch (error) {
        showError("Error deleting post: " + error.message);
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
                    const userId = currentUsername || "anonymous";
                    const hasLiked = item.likes.includes(userId);
                    return `
                        <div class="feed-item">
                            <button class="post-menu-button" onclick="showPostContextMenu(${
                                item.id
                            }, event.pageX, event.pageY)">...</button>
                            <div class="creator">${item.creator}</div>
                            <p>${item.content}</p>
                            ${item.image ? `<img src="${item.image}" alt="Post Image">` : ""}
                            <p><small>${item.timestamp}</small></p>
                            <div class="post-actions">
                                <button class="react-button ${hasLiked ? "active" : ""}" onclick="toggleLike(${item.id})">
                                    ${hasLiked ? "Unlike" : "Like"} (${item.likes.length})
                                </button>
                                <button class="comment-button" onclick="toggleCommentSection(${item.id})">
                                    Comment (${item.comments.length})
                                </button>
                            </div>
                            <div id="comment-section-${item.id}" class="comment-section">
                                <div class="comment-list">
                                    ${item.comments
                                        .map(
                                            (comment) => `
                                        <div class="comment-item">
                                            <strong>${comment.username}</strong>: ${comment.content}
                                            <br><small>${comment.timestamp}</small>
                                        </div>
                                    `
                                        )
                                        .join("")}
                                </div>
                                <textarea id="comment-input-${item.id}" class="comment-input" placeholder="Write a comment..."></textarea>
                                <button class="comment-submit" onclick="submitComment(${item.id})">Post</button>
                            </div>
                        </div>
                    `;
                } else if (item.type === "poll") {
                    const totalVotes = item.options.reduce(
                        (sum, opt) => sum + opt.votes,
                        0
                    );
                    const userId = currentUsername || "anonymous";
                    const userVoteIndex = item.options.findIndex((opt, index) =>
                        item.votedUsers.some(
                            (vote) => vote.userId === userId && vote.optionIndex === index
                        )
                    );
                    const hasVoted = userVoteIndex !== -1;
                    const isActive = isPollActive(item);
                    const remainingTime = getRemainingTime(item);

                    return `
                        <div class="feed-item">
                            <button class="poll-menu-button" onclick="showPollContextMenu(${
                                item.id
                            }, event.pageX, event.pageY)">...</button>
                            <h4>${item.question}</h4>
                            <div class="poll-options">
                                ${item.options
                                    .map(
                                        (opt, index) => `
                                    <div class="poll-option-item">
                                        <input 
                                            type="checkbox" 
                                            id="poll-${item.id}-option-${index}" 
                                            ${hasVoted && userVoteIndex === index ? "checked" : ""} 
                                            ${isActive ? "" : "disabled"}
                                            onchange="voteOnPoll(${item.id}, ${index})"
                                        >
                                        <label for="poll-${item.id}-option-${index}">${opt.text}</label>
                                        <span>${opt.votes} votes</span>
                                        <div class="poll-bar" style="width: ${
                                            totalVotes ? (opt.votes / totalVotes) * 100 : 0
                                        }%;"></div>
                                    </div>
                                `
                                    )
                                    .join("")}
                            </div>
                            ${
                                isActive && remainingTime
                                    ? `<p class="poll-timer">${remainingTime}</p>`
                                    : `<p class="poll-closed">Poll Closed</p>`
                            }
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
                return "";
            })
            .join("");
    } catch (error) {
        showError("Error updating feed: " + error.message);
    }
}

// Update notifications
function updateNotifications() {
    try {
        const notificationCount = document.getElementById("notification-count");
        notificationCount.textContent = communityData.notifications.length;
    } catch (error) {
        showError("Error updating notifications: " + error.message);
    }
}

// Chat functionality
async function setCurrentUsernameForRLS() {
    try {
        const { error } = await supabase.rpc("set_current_username", {
            username: currentUsername,
        });
        if (error) {
            console.error("Error setting current username for RLS:", error);
            showError("Failed to set user context: " + error.message);
        }
    } catch (err) {
        console.error("Unexpected error setting current username:", err);
        showError("Unexpected error setting user context: " + err.message);
    }
}

function joinChat() {
    const usernameInput = document.getElementById("username");
    const communityIdInput = document.getElementById("community-id");
    currentUsername = usernameInput.value.trim();
    currentCommunityId = communityIdInput.value.trim();

    if (!currentUsername || !currentCommunityId) {
        alert("Please enter a username and community ID.");
        return;
    }

    localStorage.setItem("currentUsername", currentUsername); // Persist username
    setCurrentUsernameForRLS();
    document.getElementById("join-form").style.display = "none";
    document.getElementById("chat-container").style.display = "block";
    loadMessages();
    setupRealtime();
    startPollingMessages();
}

async function loadMessages() {
    try {
        const { data, error } = await supabase
            .from("messages")
            .select("*")
            .eq("community_id", currentCommunityId)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error loading messages:", error);
            showError("Failed to load messages: " + error.message);
            return;
        }

        const chatMessages = document.getElementById("chat-messages");
        chatMessages.innerHTML = "";
        data.forEach((msg) => displayMessage(msg));
        chatMessages.scrollTop = chatMessages.scrollHeight;

        if (data.length > 0) {
            lastMessageTimestamp = new Date(
                data[data.length - 1].created_at
            ).toISOString();
        }
    } catch (err) {
        console.error("Unexpected error loading messages:", err);
        showError("Unexpected error loading messages: " + err.message);
    }
}

function displayMessage(msg) {
    const chatMessages = document.getElementById("chat-messages");
    const existingMessage = document.querySelector(
        `.message[data-message-id="${msg.id}"]`
    );
    if (existingMessage) return;

    const messageDiv = document.createElement("div");
    messageDiv.classList.add(
        "message",
        msg.username === currentUsername ? "mine" : "other"
    );
    messageDiv.dataset.messageId = msg.id;

    const timestamp = new Date(msg.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
    const contentDiv = document.createElement("div");
    contentDiv.textContent = `${msg.username}: ${msg.content}`;
    messageDiv.appendChild(contentDiv);

    const timestampDiv = document.createElement("div");
    timestampDiv.classList.add("message-timestamp");
    timestampDiv.textContent = timestamp;
    messageDiv.appendChild(timestampDiv);

    if (msg.username === currentUsername) {
        messageDiv.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            currentMessageId = msg.id;
            showContextMenu(e.pageX, e.pageY);
        });
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showContextMenu(x, y) {
    const contextMenu = document.getElementById("context-menu");
    contextMenu.style.top = `${y}px`;
    contextMenu.style.left = `${x}px`;
    contextMenu.style.display = "block";
    document.addEventListener("click", hideContextMenu, { once: true });
}

function hideContextMenu() {
    const contextMenu = document.getElementById("context-menu");
    contextMenu.style.display = "none";
    currentMessageId = null;
}

async function editMessage() {
    const messageDiv = document.querySelector(
        `.message[data-message-id="${currentMessageId}"]`
    );
    if (!messageDiv) {
        showError("Message not found.");
        return;
    }

    const contentDiv = messageDiv.querySelector("div:first-child");
    const originalContent = contentDiv.textContent
        .split(": ")
        .slice(1)
        .join(": ");

    messageDiv.innerHTML = "";
    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("message-edit-input");
    input.value = originalContent;
    messageDiv.appendChild(input);

    const buttonDiv = document.createElement("div");
    buttonDiv.classList.add("message-edit-buttons");
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.classList.add("cancel");
    buttonDiv.appendChild(saveButton);
    buttonDiv.appendChild(cancelButton);
    messageDiv.appendChild(buttonDiv);

    saveButton.addEventListener("click", async () => {
        const newContent = input.value.trim();
        if (!newContent) {
            alert("Message content cannot be empty.");
            return;
        }

        try {
            await setCurrentUsernameForRLS();
            const { data, error } = await supabase
                .from("messages")
                .update({ content: newContent })
                .eq("id", currentMessageId)
                .eq("username", currentUsername)
                .select();

            if (error) {
                console.error("Error updating message:", error);
                showError("Failed to update message: " + error.message);
                return;
            }

            if (!data || data.length === 0) {
                console.error("No rows updated. Possible RLS restriction.");
                showError("Unable to update message.");
                return;
            }

            messageDiv.innerHTML = "";
            hideContextMenu();
            loadMessages(); // Refresh messages
        } catch (err) {
            console.error("Unexpected error updating message:", err);
            showError("Unexpected error updating message: " + err.message);
        }
    });

    cancelButton.addEventListener("click", () => {
        loadMessages();
        hideContextMenu();
    });
}

async function deleteMessage() {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
        await setCurrentUsernameForRLS();
        const { data, error } = await supabase
            .from("messages")
            .delete()
            .eq("id", currentMessageId)
            .eq("username", currentUsername)
            .select();

        if (error) {
            console.error("Error deleting message:", error);
            showError("Failed to delete message: " + error.message);
            return;
        }

        if (!data || data.length === 0) {
            console.error("No rows deleted. Possible RLS restriction.");
            showError("Unable to delete message.");
            return;
        }

        hideContextMenu();
        loadMessages(); // Refresh messages
    } catch (err) {
        console.error("Unexpected error deleting message:", err);
        showError("Unexpected error deleting message: " + err.message);
    }
}

document.getElementById("chat-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const messageInput = document.getElementById("message-input");
    const content = messageInput.value.trim();

    if (!content) return;

    try {
        await setCurrentUsernameForRLS();
        const { data, error } = await supabase
            .from("messages")
            .insert({
                community_id: currentCommunityId,
                username: currentUsername,
                content,
            })
            .select();

        if (error) {
            console.error("Error sending message:", error);
            showError("Failed to send message: " + error.message);
            return;
        }

        messageInput.value = "";
        if (data && data.length > 0) {
            displayMessage(data[0]);
        }
    } catch (err) {
        console.error("Unexpected error sending message:", err);
        showError("Unexpected error sending message: " + err.message);
    }
});

function startPollingMessages() {
    if (pollingInterval) clearInterval(pollingInterval);

    pollingInterval = setInterval(async () => {
        try {
            if (!lastMessageTimestamp) return;

            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .eq("community_id", currentCommunityId)
                .gt("created_at", lastMessageTimestamp)
                .order("created_at", { ascending: true });

            if (error) {
                console.error("Error polling messages:", error);
                return;
            }

            if (data && data.length > 0) {
                data.forEach((msg) => displayMessage(msg));
                lastMessageTimestamp = new Date(
                    data[data.length - 1].created_at
                ).toISOString();
            }
        } catch (err) {
            console.error("Unexpected error polling messages:", err);
        }
    }, 2000);
}

function stopPollingMessages() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
}

function setupRealtime() {
    supabase.removeAllChannels();

    const channel = supabase
        .channel(`public:messages:community_id=eq.${currentCommunityId}`)
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "messages",
                filter: `community_id=eq.${currentCommunityId}`,
            },
            (payload) => {
                console.log("INSERT event:", payload);
                displayMessage(payload.new);
                lastMessageTimestamp = new Date(payload.new.created_at).toISOString();
                stopPollingMessages();
            }
        )
        .on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "messages",
                filter: `community_id=eq.${currentCommunityId}`,
            },
            (payload) => {
                console.log("UPDATE event:", payload);
                const messageDiv = document.querySelector(
                    `.message[data-message-id="${payload.new.id}"]`
                );
                if (messageDiv) {
                    messageDiv.innerHTML = "";
                    displayMessage(payload.new);
                }
            }
        )
        .on(
            "postgres_changes",
            {
                event: "DELETE",
                schema: "public",
                table: "messages",
                filter: `community_id=eq.${currentCommunityId}`,
            },
            (payload) => {
                console.log("DELETE event:", payload);
                const messageDiv = document.querySelector(
                    `.message[data-message-id="${payload.old.id}"]`
                );
                if (messageDiv) {
                    messageDiv.remove();
                }
            }
        )
        .subscribe();
}

// Setup hamburger menu for mobile
function setupHamburgerMenu() {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");

    hamburger.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });
}

// Setup chat modal
function setupChatModal() {
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
            stopPollingMessages();
            supabase.removeAllChannels();
            document.getElementById("chat-container").style.display = "none";
            document.getElementById("join-form").style.display = "block";
            document.getElementById("chat-messages").innerHTML = "";
            document.getElementById("username").value = currentUsername;
            document.getElementById("community-id").value = "";
            currentCommunityId = "";
        });
    } catch (error) {
        showError("Error setting up chat modal: " + error.message);
    }
}

// Sign out
function setupSignOut() {
    document.getElementById("signout-link").addEventListener("click", (event) => {
        event.preventDefault();
        localStorage.removeItem("currentUsername");
        localStorage.removeItem("communityData");
        window.location.href = "signin.html";
    });
}

// Initialize dashboard
function initializeDashboard() {
    try {
        loadCommunityData();
        checkProfileCompletion();
        setupHamburgerMenu();
        setupCreatePost();
        setupEditPost();
        setupPostImagePreview();
        setupEditPostImagePreview();
        setupCreatePoll();
        setupEditPoll();
        setupCommunityAnalytics();
        setupEmergencyAlert();
        setupChatModal();
        setupSignOut();
        updateFeed();
        updateNotifications();
        updateAnalytics();
    } catch (error) {
        showError("Error initializing dashboard: " + error.message);
    }
}

// Run initialization when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeDashboard);

// Expose necessary functions to global scope for HTML event handlers
window.showPollContextMenu = showPollContextMenu;
window.hidePollContextMenu = hidePollContextMenu;
window.showPostContextMenu = showPostContextMenu;
window.hidePostContextMenu = hidePostContextMenu;
window.editPoll = editPoll;
window.deletePoll = deletePoll;
window.editPost = editPost;
window.deletePost = deletePost;
window.voteOnPoll = voteOnPoll;
window.toggleLike = toggleLike;
window.toggleCommentSection = toggleCommentSection;
window.submitComment = submitComment;
window.joinChat = joinChat;
window.editMessage = editMessage;
window.deleteMessage = deleteMessage;