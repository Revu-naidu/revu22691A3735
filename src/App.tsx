import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Navigation from './components/Navigation';
import UrlForm from './components/UrlForm';
import Statistics from './components/Statistics';
import RedirectPage from './components/RedirectPage';
import { useLogger } from './hooks/useLogger';

function App() {
  const logger = useLogger();

  React.useEffect(() => {
    logger.info('Application initialized');
  }, [logger]);

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            {/* Redirect route - must come before the navigation routes */}
            <Route path="/:shortcode" element={<RedirectPage />} />
            
            {/* Main application routes with navigation */}
            <Route path="/*" element={
              <>
                <Navigation />
                <Routes>
                  <Route path="/" element={<UrlForm />} />
                  <Route path="/stats" element={<Statistics />} />
                </Routes>
              </>
            } />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;