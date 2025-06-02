import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.tsx';
import HomePage from './pages/HomePage.tsx';
import SnippetDetail from './pages/SnippetDetail.tsx';
import UploadPage from './pages/UploadPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import BrowsePage from './pages/BrowsePage.tsx';
import Header from './components/Header.tsx';
import AudioToggle from './components/AudioToggle.tsx';
import ThemeToggle from './components/ThemeToggle.tsx';
import { ToastContainer } from './components/Toast.tsx';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
          <Header />
          <ToastContainer />
          <main>
            <div className="px-4 py-8">              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/snippet/:id" element={<SnippetDetail />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/:username" element={<ProfilePage />} />
                <Route path="/browse" element={<BrowsePage />} />
              </Routes>
            </div>
          </main>
          <AudioToggle />
          <ThemeToggle />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App
