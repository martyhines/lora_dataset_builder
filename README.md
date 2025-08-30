# 🎨 LoRa Dataset Builder

A beautiful, modern web application for building and managing image datasets with AI-powered caption generation. Built with React, TypeScript, and Firebase.

## ✨ Features

- **📤 Drag & Drop Upload**: Intuitive image upload with drag-and-drop support
- **🤖 AI Caption Generation**: Automatic caption generation for training datasets
- **🖼️ Beautiful Gallery**: Modern, responsive image gallery with batch operations
- **☁️ Cloud Storage**: Firebase-powered storage and database
- **🎯 Desktop-First Design**: Optimized for professional desktop workflows
- **📱 Responsive**: Works great on all devices
- **🔒 Secure**: Firebase security rules and authentication

## 🚀 Live Demo

Visit the live application: [https://martyhines.github.io/lora_dataset_builder](https://martyhines.github.io/lora_dataset_builder)

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom CSS
- **Backend**: Firebase (Firestore + Storage)
- **Deployment**: GitHub Pages + GitHub Actions
- **Build Tool**: Vite
- **Package Manager**: npm

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── UploadZone.tsx  # File upload component
│   ├── Gallery.tsx     # Image gallery
│   ├── Toolbar.tsx     # Action toolbar
│   └── ImageCard.tsx   # Individual image cards
├── hooks/              # Custom React hooks
├── services/           # Firebase services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/             # CSS and styling
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/martyhines/lora_dataset_builder.git
   cd lora_dataset_builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Firebase config
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

### Firebase Setup

1. Create a new Firebase project
2. Enable Firestore and Storage
3. Copy your Firebase config to `.env.local`
4. Set up security rules

## 🚀 Deployment

This project automatically deploys to GitHub Pages on every push to the `main` branch using GitHub Actions.

### Manual Deployment

```bash
npm run build
# Deploy the `dist` folder to your hosting service
```

## 📝 Environment Variables

Create a `.env.local` file with:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## �� Acknowledgments

- Built with ❤️ using modern web technologies
- Special thanks to the Firebase and React communities
- Inspired by the need for better dataset management tools

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact [mhines76@gmail.com](mailto:mhines76@gmail.com).

---

**Made with ❤️ by [Marty Hines](https://github.com/martyhines)**