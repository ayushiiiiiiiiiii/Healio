// API Client
const api = {
    async get(endpoint) {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('API Error');
        return response.json();
    },
    async post(endpoint, data) {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
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
    },
    async delete(endpoint) {
        const response = await fetch(endpoint, { method: 'DELETE' });
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

let currentEntryId = null;
const entryTags = new Set();

// Show Edit Form
function showEditForm(entry = null) {
    const viewMode = document.getElementById('view-mode');
    const editMode = document.getElementById('edit-mode');
    
    if (entry) {
        currentEntryId = entry._id;
        document.getElementById('entry-title').value = entry.title;
        document.getElementById('entry-content').value = entry.content;
        
        // Set emotion
        if (entry.emotion) {
            document.querySelectorAll('.emotion-btn').forEach(btn => {
                btn.classList.toggle('selected', btn.dataset.emotion === entry.emotion);
            });
        }
        
        // Set tags
        entryTags.clear();
        const tagsContainer = document.getElementById('entry-tags');
        tagsContainer.innerHTML = '';
        (entry.tags || []).forEach(tag => {
            entryTags.add(tag);
            addTagUI(tag, tagsContainer);
        });
        
        document.getElementById('delete-entry-btn').classList.remove('hidden');
    } else {
        currentEntryId = null;
        document.getElementById('entry-title').value = '';
        document.getElementById('entry-content').value = '';
        entryTags.clear();
        document.getElementById('entry-tags').innerHTML = '';
        document.querySelectorAll('.emotion-btn').forEach(btn => btn.classList.remove('selected'));
        document.getElementById('delete-entry-btn').classList.add('hidden');
    }
    
    viewMode.classList.add('hidden');
    editMode.classList.remove('hidden');
}

function addTagUI(text, container) {
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.innerHTML = `${text} <span class="remove">×</span>`;
    tag.querySelector('.remove').addEventListener('click', () => {
        entryTags.delete(text);
        tag.remove();
    });
    container.appendChild(tag);
}

// Tag input
document.getElementById('tag-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
        e.preventDefault();
        const text = e.target.value.trim();
        if (!entryTags.has(text)) {
            entryTags.add(text);
            addTagUI(text, document.getElementById('entry-tags'));
        }
        e.target.value = '';
    }
});

// Save Entry
document.getElementById('save-entry-btn')?.addEventListener('click', async () => {
    const title = document.getElementById('entry-title').value.trim();
    const content = document.getElementById('entry-content').value.trim();
    const emotion = document.querySelector('.emotion-btn.selected')?.dataset.emotion;
    
    if (!title || !content) {
        showToast('Title and content are required', 'error');
        return;
    }
    
    const data = { title, content, emotion, tags: Array.from(entryTags) };
    
    try {
        const btn = document.getElementById('save-entry-btn');
        btn.disabled = true;
        
        if (currentEntryId) {
            await api.put(`/api/journal/${currentEntryId}`, data);
            showToast('Entry updated successfully!');
        } else {
            await api.post('/api/journal', data);
            showToast('Entry created successfully!');
        }
        
        setTimeout(() => location.reload(), 1500);
    } catch (err) {
        showToast('Failed to save entry', 'error');
    }
});

// Delete Entry
document.getElementById('delete-entry-btn')?.addEventListener('click', async () => {
    if (!currentEntryId) return;
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
        await api.delete(`/api/journal/${currentEntryId}`);
        showToast('Entry deleted successfully!');
        setTimeout(() => location.reload(), 1500);
    } catch (err) {
        showToast('Failed to delete entry', 'error');
    }
});

// Back button
document.getElementById('back-btn')?.addEventListener('click', () => {
    document.getElementById('view-mode').classList.remove('hidden');
    document.getElementById('edit-mode').classList.add('hidden');
});

// Create new
document.getElementById('create-new-btn')?.addEventListener('click', () => showEditForm());

// Load entries
async function loadEntries() {
    try {
        const search = document.getElementById('search-input')?.value || '';
        const emotion = document.getElementById('emotion-filter')?.value || '';
        let url = '/api/journal';
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (emotion) params.append('emotion', emotion);
        if (params.toString()) url += '?' + params.toString();
        
        const data = await api.get(url);
        const list = document.getElementById('entries-list');
        
        if (!data.entries || data.entries.length === 0) {
            list.innerHTML = '<p class="loading-text">No journal entries yet. Start writing!</p>';
            return;
        }
        
        list.innerHTML = data.entries.map(entry => `
            <div class="entry-card" onclick='showEditForm(${JSON.stringify(entry).replace(/'/g, "&apos;")})'>
                <p class="entry-title">${entry.title}</p>
                <p class="entry-date">${new Date(entry.createdAt).toLocaleDateString()}</p>
                <p class="entry-preview">${entry.content.substring(0, 100)}...</p>
            </div>
        `).join('');
    } catch (err) {
        console.error(err);
        document.getElementById('entries-list').innerHTML = '<p class="loading-text">Error loading entries</p>';
    }
}

// Search & filter
document.getElementById('search-input')?.addEventListener('input', loadEntries);
document.getElementById('emotion-filter')?.addEventListener('change', loadEntries);

// Emotion button selection
document.querySelectorAll('.emotion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.emotion-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    });
});

document.addEventListener('DOMContentLoaded', loadEntries);
