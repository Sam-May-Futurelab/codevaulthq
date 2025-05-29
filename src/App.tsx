import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import SnippetDetail from './pages/SnippetDetail.tsx';
import UploadPage from './pages/UploadPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import BrowsePage from './pages/BrowsePage.tsx';
import Header from './components/Header.tsx';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-vault-dark to-vault-medium">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/snippet/:id" element={<SnippetDetail />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/browse" element={<BrowsePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App
