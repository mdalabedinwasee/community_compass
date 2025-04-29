// chat.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase client
const supabase = createClient('https://mbhdhiexfkammibifdum.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iaGRoaWV4ZmthbW1pYmlmZHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NTE3MTAsImV4cCI6MjA2MTUyNzcxMH0.EXO5ybawj1KPxGSkzgPlVBiyvLbVKd2QVu-ptX9MDK4');

let currentUsername = '';
let currentCommunityId = '';

// Join chat function
window.joinChat = function () {
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
};

// Load existing messages
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

// Send a message
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

// Set up real-time subscription
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