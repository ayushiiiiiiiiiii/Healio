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

// Greeting based on time
function updateGreeting() {
    const hour = new Date().getHours();
    const greeting = document.getElementById('greeting');
    if (hour < 12) {
        greeting.textContent = 'Good morning! ☀️ Start your day with a positive mindset.';
    } else if (hour < 18) {
        greeting.textContent = 'Good afternoon! 🌤️ Keep pushing towards your goals.';
    } else {
        greeting.textContent = 'Good evening! 🌙 Time to wind down and reflect.';
    }
}

// Load Daily Affirmation
async function loadAffirmation() {
    try {
        const affirmation = await api.get('/api/affirmation/daily');
        document.getElementById('affirmation-text').textContent = `"${affirmation.text}"`;
    } catch (err) {
        document.getElementById('affirmation-text').textContent = '"You are stronger than you think." - Healio';
    }
}

// Load User Statistics
async function loadStats() {
    try {
        const stats = await api.get('/api/profile/stats');
        document.getElementById('mood-count').textContent = stats.totalMoods;
        document.getElementById('entry-count').textContent = stats.totalEntries;
        document.getElementById('chat-count').textContent = stats.totalChats;
        document.getElementById('streak-status').textContent = stats.streakToday ? '✓ Today' : '—';
    } catch (err) {
        console.error('Error loading stats:', err);
    }
}

// Load Mood Analytics Chart
let moodChartInstance;
async function loadMoodChart() {
    try {
        const data = await api.get('/api/mood/analytics/weekly');
        const moods = data.moods;

        // Group moods by date
        const moodsByDate = {};
        moods.forEach(mood => {
            const date = new Date(mood.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!moodsByDate[date]) {
                moodsByDate[date] = [];
            }
            moodsByDate[date].push(mood.intensity);
        });

        // Calculate average intensity per day
        const labels = Object.keys(moodsByDate);
        const values = labels.map(date => {
            const avg = moodsByDate[date].reduce((a, b) => a + b, 0) / moodsByDate[date].length;
            return Math.round(avg * 10) / 10;
        });

        const ctx = document.getElementById('moodChart').getContext('2d');
        
        // Destroy previous chart if exists
        if (moodChartInstance) {
            moodChartInstance.destroy();
        }

        moodChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.length ? labels : ['No data'],
                datasets: [{
                    label: 'Average Mood Intensity',
                    data: values.length ? values : [0],
                    borderColor: '#ff69b4',
                    backgroundColor: 'rgba(255, 105, 180, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#ff69b4',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#4a4a4a',
                            font: { size: 12, weight: '600' }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#999'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#999'
                        }
                    }
                }
            }
        });
    } catch (err) {
        console.error('Error loading mood chart:', err);
    }
}

// Load Emotion Distribution Chart
let emotionChartInstance;
async function loadEmotionChart() {
    try {
        const data = await api.get('/api/mood/analytics/weekly');
        const analytics = data.analytics;

        const labels = Object.keys(analytics.emotionCounts);
        const values = Object.values(analytics.emotionCounts);
        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#C7CEEA', '#FF85B3', '#FECA57', '#FFA502'];

        const ctx = document.getElementById('emotionChart').getContext('2d');
        
        // Destroy previous chart if exists
        if (emotionChartInstance) {
            emotionChartInstance.destroy();
        }

        emotionChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels.length ? labels : ['No data'],
                datasets: [{
                    data: values.length ? values : [1],
                    backgroundColor: colors.slice(0, labels.length),
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#4a4a4a',
                            font: { size: 12, weight: '600' },
                            padding: 15
                        }
                    }
                }
            }
        });
    } catch (err) {
        console.error('Error loading emotion chart:', err);
    }
}

// Load Recent Activity
async function loadRecentActivity() {
    try {
        const moods = await api.get('/api/mood?limit=5');
        const entries = await api.get('/api/journal?limit=5');

        const activities = [];

        // Add moods
        moods.moods?.forEach(mood => {
            activities.push({
                type: 'Mood',
                text: `Logged ${mood.emotion} feeling (intensity: ${mood.intensity}/10)`,
                time: new Date(mood.createdAt).toLocaleDateString(),
                date: new Date(mood.createdAt).getTime()
            });
        });

        // Add journal entries
        entries.entries?.forEach(entry => {
            activities.push({
                type: 'Journal',
                text: `Wrote: "${entry.title}"`,
                time: new Date(entry.createdAt).toLocaleDateString(),
                date: new Date(entry.createdAt).getTime()
            });
        });

        // Sort by date (newest first)
        activities.sort((a, b) => b.date - a.date);

        const activityList = document.getElementById('activity-list');
        if (activities.length === 0) {
            activityList.innerHTML = '<p class="loading-text">No recent activity. Start by logging a mood or writing a journal entry!</p>';
            return;
        }

        activityList.innerHTML = activities.slice(0, 10).map(activity => `
            <div class="activity-item">
                <div class="activity-type">📌 ${activity.type}</div>
                <div class="activity-text">${activity.text}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error loading recent activity:', err);
        document.getElementById('activity-list').innerHTML = '<p class="loading-text">Unable to load recent activity</p>';
    }
}

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        
        // Update active state
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        // Navigate based on page
        const pages = {
            dashboard: '/dashboard',
            mood: '/mood-tracker',
            journal: '/journal',
            wellness: '/wellness',
            profile: '/profile'
        };

        window.location.href = pages[page] || '/dashboard';
    });
});

// Initialize Dashboard
async function initDashboard() {
    updateGreeting();
    await Promise.all([
        loadAffirmation(),
        loadStats(),
        loadMoodChart(),
        loadEmotionChart(),
        loadRecentActivity()
    ]);
}

// Load on DOM ready
document.addEventListener('DOMContentLoaded', initDashboard);

// Refresh data every 5 minutes
setInterval(async () => {
    await loadStats();
    await loadRecentActivity();
}, 5 * 60 * 1000);
