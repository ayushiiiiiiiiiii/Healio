// Profile Page

const api = {
    async get(endpoint) {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('API Error');
        return response.json();
    },
    async put(endpoint, data) {
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('API Error');
        return response.json();
    }
};

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Load Profile Data
async function loadProfile() {
    try {
        const user = await api.get('/api/profile');
        const stats = await api.get('/api/profile/stats');
        
        // Display profile info
        document.getElementById('profile-username').textContent = user.username;
        document.getElementById('profile-email').textContent = user.email;
        document.getElementById('account-email').textContent = user.email;
        document.getElementById('member-since').textContent = 
            new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        
        // Display stats
        document.getElementById('stat-moods').textContent = stats.totalMoods;
        document.getElementById('stat-entries').textContent = stats.totalEntries;
        document.getElementById('stat-chats').textContent = stats.totalChats;
        document.getElementById('stat-streak').textContent = stats.streakToday ? '1' : '0';
        
        // Load form values
        document.getElementById('edit-username').value = user.username;
        document.getElementById('edit-bio').value = user.bio || '';
        document.getElementById('dark-mode-toggle').checked = user.preferences?.darkMode || false;
        document.getElementById('notifications-toggle').checked = user.preferences?.notifications !== false;
    } catch (err) {
        console.error('Error loading profile:', err);
        showToast('Error loading profile', 'error');
    }
}

// Save Profile Changes
document.getElementById('save-profile-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('save-profile-btn');
    btn.disabled = true;
    
    try {
        const data = {
            username: document.getElementById('edit-username').value,
            bio: document.getElementById('edit-bio').value,
            preferences: {
                darkMode: document.getElementById('dark-mode-toggle').checked,
                notifications: document.getElementById('notifications-toggle').checked
            }
        };
        
        await api.put('/api/profile', data);
        showToast('Profile updated successfully!');
        
        // Update UI if dark mode changed
        if (data.preferences.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    } catch (err) {
        console.error(err);
        showToast('Failed to update profile', 'error');
    } finally {
        btn.disabled = false;
    }
});

document.addEventListener('DOMContentLoaded', loadProfile);
