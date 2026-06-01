# Healio - Personal Journal & Mood Tracker

A modern, full-stack personal diary and mood tracking web application built with Node.js, Express.js, MongoDB, and Tailwind CSS.

> **💡 Disclaimer:** Healio is a warm companion designed to help you de-stress and reflect, and is NOT a replacement for professional clinical care.

---

## 🌟 Status
**Production Ready** - All core features implemented, tested, and deployed:
- ✅ Chat history persistence
- ✅ Mood tracking with analytics
- ✅ Journal management
- ✅ Wellness resources
- ✅ User authentication & profiles
- ✅ Dashboard with stats
- ✅ Responsive design

---

## 🎯 Key Features

### 🤖 AI Chatbot
- Real-time conversation with Gemini API
- Context-aware empathetic responses
- Chat history persistence
- System prompts for mental health focus

### 📊 Mood Tracking
- Emoji-based emotion selector (8 emotions)
- Intensity scaling (1-10)
- Weekly/monthly analytics with charts
- Trigger tracking

### 📔 Journal Management
- Create, edit, delete entries
- Emotional tagging system
- Full-text search
- Soft delete preservation

### 🧘 Wellness Resources
- Breathing exercises
- Meditation guides
- Mental health tips
- Emergency resources

### 👤 User Management
- JWT authentication with bcrypt hashing
- User profiles and settings
- Statistics tracking
- Preference management

### 📈 Dashboard
- Daily affirmations
- Mood trends visualization
- Recent activity feed
- User statistics overview

---

## 🛠️ Tech Stack

**Frontend:**
- EJS Templating
- Vanilla JavaScript
- Tailwind CSS
- Glassmorphism UI
- Chart.js for analytics

**Backend:**
- Node.js 14+
- Express.js 5.1+
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for hashing

**External:**
- Google Gemini API 2.0
- Font Awesome Icons

---

## 📋 Installation

### Prerequisites
- Node.js 14+
- MongoDB Atlas account
- Google Gemini API key

### Setup

```bash
# 1. Clone repository
cd Healio

# 2. Install dependencies
npm install

# 3. Create .env file
cat > .env << EOF
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/healio
EOF

# 4. Start server
npm start
```

Server runs on `http://localhost:3000`

---

## 📱 Pages

| Page | Route | Auth Required | Description |
|------|-------|---------------|-------------|
| Landing | `/landing` | No | Features & testimonials |
| Login/Signup | `/` | No | Authentication |
| Dashboard | `/dashboard` | Yes | Overview & stats |
| Chat | `/chat` | Yes | AI conversation |
| Mood Tracker | `/mood-tracker` | Yes | Mood logging & analytics |
| Journal | `/journal` | Yes | Entry management |
| Wellness | `/wellness` | Yes | Resources & exercises |
| Profile | `/profile` | Yes | User settings |

---

## 🔌 API Endpoints

### Authentication
```
POST   /signup              - Register user
POST   /signin              - Login user
GET    /logout              - Logout user
```

### Chat
```
POST   /api/chat/chatbot                    - Send message
POST   /api/chat/conversation               - Create/get conversation
GET    /api/chat/conversations              - List conversations
GET    /api/chat/history/:conversationId    - Get chat history
DELETE /api/chat/conversations/:conversationId - Archive
```

### Mood
```
POST   /api/mood                    - Create mood
GET    /api/mood                    - List moods
GET    /api/mood/today              - Today's moods
GET    /api/mood/analytics/:period  - Analytics
PUT    /api/mood/:id                - Update mood
DELETE /api/mood/:id                - Delete mood
```

### Journal
```
POST   /api/journal              - Create entry
GET    /api/journal              - List entries
GET    /api/journal/:id          - Get entry
PUT    /api/journal/:id          - Update entry
DELETE /api/journal/:id          - Delete entry
GET    /api/journal/tags/list    - Get tags
```

### Wellness
```
GET    /api/wellness                - List resources
GET    /api/wellness/category/:cat  - By category
GET    /api/affirmation/daily       - Daily affirmation
```

### Profile
```
GET    /api/profile           - Get profile
PUT    /api/profile           - Update profile
GET    /api/profile/stats     - Get statistics
```

---

## 🗂️ Project Structure

```
Healio/
├── models/              # Database schemas
│   ├── user.js
│   ├── Chat.js
│   ├── Mood.js
│   ├── Journal.js
│   ├── Wellness.js
│   └── Affirmation.js
│
├── routes/              # API routes
│   ├── auth.js
│   ├── chat.js
│   ├── mood.js
│   ├── journal.js
│   ├── wellness.js
│   └── profile.js
│
├── views/               # EJS templates
│   ├── landing.ejs
│   ├── dashboard.ejs
│   ├── mood-tracker.ejs
│   ├── journal.ejs
│   ├── wellness.ejs
│   ├── profile.ejs
│   └── partials/
│
├── public/              # Static files
│   ├── javascript/
│   ├── stylesheet/
│   └── bg.png
│
├── middleware/
│   └── authmiddleware.js
│
├── index.js            # Main server
└── package.json
```

---

## 🔒 Security

- JWT token-based authentication
- Bcrypt password hashing (salt: 10)
- Protected routes with middleware
- User ownership verification
- Soft deletes for data preservation
- Input validation
- CORS headers

---

## 🎨 Design

**Color Palette:**
- Primary Pink: `#ff69b4`, `#ff1493`
- Text Dark: `#4a4a4a`
- White: `#ffffff`

**Features:**
- Glassmorphism UI with backdrop blur
- Responsive grid layouts
- Smooth CSS animations (GPU accelerated)
- Mobile-first responsive design
- Dark soothing gradients

---

## 📊 Database Models

### User
```js
{
  username, email, password (hashed),
  bio, profilePicture,
  preferences: { darkMode, notifications, language },
  moodStreak, createdAt, updatedAt
}
```

### Mood
```js
{
  userId, emotion, intensity (1-10),
  note, triggers, activities,
  timestamp, createdAt
}
```

### Journal
```js
{
  userId, title, content,
  emotion, tags, isPinned,
  createdAt, updatedAt, deletedAt (soft)
}
```

### Chat
```js
{
  userId, conversationId,
  messages: [{role, text, timestamp}],
  mood, tags, summary, isArchived,
  createdAt, updatedAt
}
```

---

## 🚀 Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=<strong-secret>
GEMINI_API_KEY=<your-key>
MONGO_URI=<mongodb-connection>
```

### Server
```bash
npm start  # Production mode
```

---

## 🧪 Features Implemented

- [x] User authentication (JWT + Bcrypt)
- [x] AI chatbot with Gemini API
- [x] Chat history persistence
- [x] Mood tracking with analytics
- [x] Journal with CRUD operations
- [x] Wellness resources & affirmations
- [x] User profiles & settings
- [x] Dashboard with charts
- [x] Responsive design (mobile/tablet/desktop)
- [x] Toast notifications
- [x] Data validation
- [x] Error handling

---

## 📈 Future Enhancements

- Real-time notifications
- Dark mode toggle
- Export data to PDF
- Advanced analytics
- Community features
- Video counseling integration
- Habit tracking
- Sleep & exercise tracking

---

## 🆘 Support & Resources

**In Crisis?**
- 988 Suicide & Crisis Lifeline (US)
- Crisis Text Line: Text HOME to 741741
- International: https://www.iasp.info/resources/Crisis_Centres/

---

## 📄 License

Open source for educational purposes.

---

**Built with ❤️ for Mental Wellness**
