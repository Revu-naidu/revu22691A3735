import React, { useState, useEffect } from 'react';
import { BarChart3, ExternalLink, Clock, MousePointer, ChevronDown, ChevronUp } from 'lucide-react';
import { ShortenedUrl } from '../types';
import { useDataStore } from '../utils/dataStore';
import { useLogger } from '../hooks/useLogger';

const Statistics: React.FC = () => {
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [expandedUrls, setExpandedUrls] = useState<Set<string>>(new Set());
  const dataStore = useDataStore();
  const logger = useLogger();

  useEffect(() => {
    const loadUrls = () => {
      const allUrls = dataStore.getAllUrls();
      setUrls(allUrls);
      logger.info('Loaded URLs for statistics page', { count: allUrls.length });
    };

    loadUrls();
  }, [dataStore, logger]);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedUrls);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedUrls(newExpanded);
  };

  const isExpired = (url: ShortenedUrl) => {
    return url.expiryDate && Date.now() > url.expiryDate;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getUniqueStats = (url: ShortenedUrl) => {
    const sources = new Set(url.clicks.map(c => c.source));
    const geos = new Set(url.clicks.map(c => c.geo));
    return { sources: sources.size, geos: geos.size };
  };

  if (urls.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No URLs Yet</h2>
          <p className="text-gray-600">
            Create your first shortened URL to see statistics here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <BarChart3 className="h-6 w-6 mr-2" />
          URL Statistics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{urls.length}</div>
            <div className="text-sm text-gray-600">Total URLs</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {urls.filter(u => !isExpired(u)).length}
            </div>
            <div className="text-sm text-gray-600">Active URLs</div>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">
              {urls.filter(u => isExpired(u)).length}
            </div>
            <div className="text-sm text-gray-600">Expired URLs</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {urls.reduce((total, url) => total + url.clicks.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Clicks</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {urls.map((url) => {
          const stats = getUniqueStats(url);
          const isUrlExpired = isExpired(url);
          const isExpanded = expandedUrls.has(url.id);

          return (
            <div key={url.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <a
                        href={`/${url.shortCode}`}
                        className="text-lg font-mono text-blue-600 hover:text-blue-800 mr-2"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {window.location.origin}/{url.shortCode}
                      </a>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                      {isUrlExpired && (
                        <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                          Expired
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{url.originalUrl}</p>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Created: {formatDate(url.creationDate)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Expires: {url.expiryDate ? formatDate(url.expiryDate) : 'Never'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">{url.clicks.length}</div>
                      <div className="text-sm text-gray-600">Clicks</div>
                    </div>
                    <button
                      onClick={() => toggleExpanded(url.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {url.clicks.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-semibold text-gray-700">Sources</div>
                      <div className="text-gray-600">{stats.sources} unique</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-semibold text-gray-700">Regions</div>
                      <div className="text-gray-600">{stats.geos} unique</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-semibold text-gray-700">First Click</div>
                      <div className="text-gray-600">
                        {formatDate(Math.min(...url.clicks.map(c => c.timestamp)))}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-semibold text-gray-700">Last Click</div>
                      <div className="text-gray-600">
                        {formatDate(Math.max(...url.clicks.map(c => c.timestamp)))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {isExpanded && url.clicks.length > 0 && (
                <div className="border-t bg-gray-50 p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <MousePointer className="h-5 w-5 mr-2" />
                    Click Details
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Timestamp</th>
                          <th className="text-left py-2">Source</th>
                          <th className="text-left py-2">Region</th>
                        </tr>
                      </thead>
                      <tbody>
                        {url.clicks
                          .sort((a, b) => b.timestamp - a.timestamp)
                          .map((click, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-2 font-mono text-xs">
                                {formatDate(click.timestamp)}
                              </td>
                              <td className="py-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  {click.source}
                                </span>
                              </td>
                              <td className="py-2">
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                  {click.geo}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Statistics;