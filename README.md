# LinkedIn-like Professional Network

A modern, AI-powered social networking platform for professionals with automatic post classification, AI-assisted content generation, and interactive features.

## 🚀 Features

### Core Features
- **Unified Input Prompt**: Clean, LinkedIn-inspired interface for creating posts
- **AI-Powered Post Classification**: Automatic detection of post types (text, event, poll, announcement, job, achievement)
- **AI-Assisted Content Generation**: Generate professional posts using OpenAI GPT
- **Interactive Post Preview**: Edit and preview posts before publishing
- **Real-time Feed**: Dynamic feed with different post types and interactions
- **RSVP System**: Interactive RSVP functionality for event posts
- **MongoDB Persistence**: Full database integration for post storage

### Technical Features
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages
- **Loading States**: Smooth loading indicators throughout the application
- **Toast Notifications**: Real-time feedback for user actions
- **Responsive Design**: Mobile-first design with TailwindCSS
- **API Abstraction**: Clean API layer with proper error handling
- **Type Safety**: Structured data models and validation

## 🛠 Tech Stack

### Frontend
- **React 18** with Hooks
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **Custom Hooks** for state management

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **OpenAI API** for AI features
- **CORS** enabled for cross-origin requests

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- OpenAI API key

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Headout-hackathon
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   ```bash
   cd ../backend
   cp .env.example .env
   # Edit .env file with your configuration
   ```

   Required environment variables:
   ```env
   PORT=5000
   OPENAI_API_KEY=your_openai_api_key_here
   MONGODB_URI=mongodb://localhost:27017/linkedin-posts
   ```

5. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

6. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

7. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

8. **Configure OpenAI API Key**
   - Open the application in your browser
   - Click the settings icon in the header
   - Enter your OpenAI API key
   - Save the configuration

## 🎯 Usage

### Creating Posts
1. Click on the input box "What would you like to share?"
2. Type your content or use the ✨ Generate Post feature
3. The AI will automatically classify your post type
4. Review and edit in the preview screen
5. Click "Looks good! Post it" to publish

### AI Features
- **Auto Classification**: Posts are automatically categorized as text, event, poll, announcement, job, or achievement
- **Content Generation**: Use the Generate Post button to create professional content from simple prompts
- **Smart Suggestions**: AI provides contextually appropriate content based on your input

### Interactive Features
- **RSVP for Events**: Click Going/Maybe/Not Going on event posts
- **Real-time Updates**: See RSVP counts update in real-time
- **Post Editing**: Edit content before publishing in the preview screen

## 🏗 Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── PostCard.jsx
│   │   │   ├── PostInput.jsx
│   │   │   ├── PostPreview.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Toast.jsx
│   │   ├── hooks/
│   │   │   └── useToast.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   └── postController.js
│   ├── models/
│   │   └── Post.js
│   ├── routes/
│   │   └── postRoutes.js
│   ├── services/
│   │   └── openaiService.js
│   ├── server.js
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Posts
- `GET /api/posts` - Retrieve all posts
- `POST /api/posts` - Create a new post
- `PUT /api/posts/:id/rsvp` - Update RSVP status

### AI Features
- `POST /api/posts/detect-type` - Classify post type using AI
- `POST /api/posts/generate` - Generate post content using AI

## 🎨 Design Decisions

### UI/UX
- **LinkedIn-inspired Design**: Clean, professional interface
- **Progressive Enhancement**: Features work without JavaScript
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Mobile-first**: Responsive design for all screen sizes

### Architecture
- **Separation of Concerns**: Clear separation between UI, business logic, and data
- **Error Boundaries**: Graceful error handling at component level
- **API Abstraction**: Centralized API calls with proper error handling
- **State Management**: Local state with React hooks for simplicity

### Security
- **API Key Handling**: Client-side storage with server-side validation
- **Input Validation**: Comprehensive validation on both client and server
- **Error Messages**: User-friendly messages without exposing system details

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://your-cluster-url
OPENAI_API_KEY=your-production-api-key
PORT=5000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for providing the GPT API
- TailwindCSS for the utility-first CSS framework
- MongoDB for the database solution
- React team for the excellent frontend framework