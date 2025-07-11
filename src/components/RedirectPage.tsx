import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDataStore } from '../utils/dataStore';
import { useLogger } from '../hooks/useLogger';
import { generateClickEvent } from '../utils/clickSimulator';

const RedirectPage: React.FC = () => {
  const { shortcode } = useParams<{ shortcode: string }>();
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'not_found' | 'expired'>('loading');
  const dataStore = useDataStore();
  const logger = useLogger();

  useEffect(() => {
    const handleRedirect = async () => {
      if (!shortcode) {
        setStatus('not_found');
        logger.error('No shortcode provided in URL');
        return;
      }

      logger.info('Attempting to redirect shortcode', { shortcode });

      try {
        const url = dataStore.getUrlByShortCode(shortcode);
        
        if (!url) {
          setStatus('not_found');
          logger.warn('Shortcode not found', { shortcode });
          return;
        }

        // Check if URL is expired
        if (url.expiryDate && Date.now() > url.expiryDate) {
          setStatus('expired');
          logger.warn('Shortcode expired', { shortcode, expiryDate: url.expiryDate });
          return;
        }

        // Generate and add click event
        const clickEvent = generateClickEvent();
        dataStore.addClick(shortcode, clickEvent);
        
        setStatus('redirecting');
        logger.info('Successful redirect', { 
          shortcode, 
          originalUrl: url.originalUrl, 
          clickEvent 
        });

        // Redirect after a short delay to show the redirecting message
        setTimeout(() => {
          window.location.href = url.originalUrl;
        }, 1000);

      } catch (error) {
        logger.error('Error during redirect process', { error, shortcode });
        setStatus('not_found');
      }
    };

    handleRedirect();
  }, [shortcode, dataStore, logger]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading...</h2>
            <p className="text-gray-600">Please wait while we process your request.</p>
          </div>
        );

      case 'redirecting':
        return (
          <div className="text-center">
            <div className="text-green-500 text-4xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Redirecting...</h2>
            <p className="text-gray-600">You will be redirected to the original URL shortly.</p>
            <div className="mt-4">
              <div className="animate-pulse bg-blue-100 rounded-full h-2 w-full">
                <div className="bg-blue-500 h-2 rounded-full w-3/4 transition-all duration-1000"></div>
              </div>
            </div>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center">
            <div className="text-amber-500 text-4xl mb-4">⏰</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Link Expired</h2>
            <p className="text-gray-600 mb-6">
              This short link has expired and is no longer valid.
            </p>
            <a
              href="/"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors"
            >
              Create New Link
            </a>
          </div>
        );

      case 'not_found':
      default:
        return (
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Link Not Found</h2>
            <p className="text-gray-600 mb-6">
              The short link you're looking for doesn't exist or has been removed.
            </p>
            <a
              href="/"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors"
            >
              Create New Link
            </a>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default RedirectPage;