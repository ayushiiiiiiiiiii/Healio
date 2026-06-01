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
    }
};

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// State
let selectedEmotion = null;
const triggers = new Set();
const activities = new Set();

// Mood Button Selection
document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove previous selection
        document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
        
        // Select current
        btn.classList.add('selected');
        selectedEmotion = btn.dataset.emotion;
        
        // Show mood details
        document.getElementById('mood-details').classList.remove('hidden');
    });
});

// Intensity Slider
const intensityInput = document.getElementById('intensity');
const intensityValue = document.getElementById('intensity-value');

intensityInput?.addEventListener('input', (e) => {
    intensityValue.textContent = e.target.value;
});

// Triggers Tag Input
const triggerInput = document.getElementById('trigger-input');
const triggersContainer = document.getElementById('triggers');

triggerInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
        e.preventDefault();
        addTag(e.target.value.trim(), triggers, triggersContainer);
        e.target.value = '';
    }
});

// Activities Tag Input
const activityInput = document.getElementById('activity-input');
const activitiesContainer = document.getElementById('activities');

activityInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
        e.preventDefault();
        addTag(e.target.value.trim(), activities, activitiesContainer);
        e.target.value = '';
    }
});

// Add Tag
function addTag(text, set, container) {
    if (set.has(text)) return;
    set.add(text);
    
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.innerHTML = `${text} <span class="remove">×</span>`;
    tag.querySelector('.remove').addEventListener('click', () => {
        set.delete(text);
        tag.remove();
    });
    container.appendChild(tag);
}

// Save Mood Entry
document.getElementById('save-mood-btn')?.addEventListener('click', async () => {
    if (!selectedEmotion) {
        showToast('Please select an emotion first', 'error');
        return;
    }

    const btn = document.getElementById('save-mood-btn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
        await api.post('/api/mood', {
            emotion: selectedEmotion,
            intensity: parseInt(document.getElementById('intensity').value),
            note: document.getElementById('note').value,
            triggers: Array.from(triggers),
            activities: Array.from(activities)
        });

        showToast('Mood entry saved successfully! 🎉', 'success');
        
        // Reset form
        setTimeout(() => {
            location.reload();
        }, 1500);
    } catch (err) {
        showToast('Failed to save mood entry', 'error');
        console.error(err);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save Mood Entry';
    }
});

// Load Trend Chart
let trendChartInstance;
async function loadTrendChart() {
    try {
        const data = await api.get('/api/mood/analytics/weekly');
        const moods = data.moods;

        // Group by date
        const moodsByDate = {};
        moods.forEach(mood => {
            const date = new Date(mood.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!moodsByDate[date]) {
                moodsByDate[date] = [];
            }
            moodsByDate[date].push(mood.intensity);
        });

        const labels = Object.keys(moodsByDate);
        const values = labels.map(date => {
            const avg = moodsByDate[date].reduce((a, b) => a + b, 0) / moodsByDate[date].length;
            return Math.round(avg * 10) / 10;
        });

        const ctx = document.getElementById('trendChart')?.getContext('2d');
        if (!ctx) return;

        if (trendChartInstance) {
            trendChartInstance.destroy();
        }

        trendChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.length ? labels : ['No data'],
                datasets: [{
                    label: 'Average Intensity',
                    data: values.length ? values : [0],
                    borderColor: '#ff69b4',
                    backgroundColor: 'rgba(255, 105, 180, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#ff69b4'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: { color: '#4a4a4a', font: { size: 12, weight: '600' } }
                    }
                },
                scales: {
                    y: { beginAtZero: true, max: 10, ticks: { color: '#999' } },
                    x: { ticks: { color: '#999' } }
                }
            }
        });
    } catch (err) {
        console.error('Error loading trend chart:', err);
    }
}

// Load Frequency Chart
let frequencyChartInstance;
async function loadFrequencyChart() {
    try {
        const data = await api.get('/api/mood/analytics/weekly');
        const analytics = data.analytics;

        const labels = Object.keys(analytics.emotionCounts);
        const values = Object.values(analytics.emotionCounts);
        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#C7CEEA', '#FF85B3', '#FECA57', '#FFA502'];

        const ctx = document.getElementById('frequencyChart')?.getContext('2d');
        if (!ctx) return;

        if (frequencyChartInstance) {
            frequencyChartInstance.destroy();
        }

        frequencyChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.length ? labels : ['No data'],
                datasets: [{
                    label: 'Frequency',
                    data: values.length ? values : [0],
                    backgroundColor: colors.slice(0, labels.length),
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        labels: { color: '#4a4a4a', font: { size: 12, weight: '600' } }
                    }
                },
                scales: {
                    x: { ticks: { color: '#999' } },
                    y: { ticks: { color: '#999' } }
                }
            }
        });
    } catch (err) {
        console.error('Error loading frequency chart:', err);
    }
}

// Load Mood History
async function loadMoodHistory() {
    try {
        const data = await api.get('/api/mood?limit=20');
        const moods = data.moods;

        const historyContainer = document.getElementById('mood-history');
        if (!moods || moods.length === 0) {
            historyContainer.innerHTML = '<p class="loading-text">No mood entries yet. Start tracking your moods!</p>';
            return;
        }

        const emotionEmojis = {
            happy: '😊', sad: '😢', anxious: '😰', calm: '🧘',
            angry: '😠', hopeful: '🤗', overwhelmed: '😫', grateful: '🙏'
        };

        historyContainer.innerHTML = moods.map(mood => `
            <div class="mood-entry">
                <div class="mood-entry-header">
                    <span class="mood-emotion">${emotionEmojis[mood.emotion] || '😐'} ${mood.emotion}</span>
                    <span class="mood-intensity">Intensity: ${mood.intensity}/10</span>
                </div>
                ${mood.note ? `<div class="mood-note">${mood.note}</div>` : ''}
                <div class="mood-date">${new Date(mood.createdAt).toLocaleString()}</div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error loading mood history:', err);
        document.getElementById('mood-history').innerHTML = '<p class="loading-text">Unable to load mood history</p>';
    }
}

// Initialize
async function init() {
    try {
        await Promise.all([
            loadTrendChart(),
            loadFrequencyChart(),
            loadMoodHistory()
        ]);
    } catch (err) {
        console.error('Initialization error:', err);
    }
}

document.addEventListener('DOMContentLoaded', init);
