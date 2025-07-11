import React, { useState } from 'react';
import { Plus, Minus, Link } from 'lucide-react';
import { UrlFormData, ShortenedUrl } from '../types';
import { useValidation } from '../utils/validation';
import { useDataStore } from '../utils/dataStore';
import { useShortcodeGenerator } from '../utils/shortcodeGenerator';
import { useLogger } from '../hooks/useLogger';

const UrlForm: React.FC = () => {
  const [forms, setForms] = useState<UrlFormData[]>([
    { originalUrl: '', validityPeriod: 30, preferredShortcode: '' }
  ]);
  const [results, setResults] = useState<ShortenedUrl[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validation = useValidation();
  const dataStore = useDataStore();
  const shortcodeGenerator = useShortcodeGenerator();
  const logger = useLogger();

  const addForm = () => {
    if (forms.length < 5) {
      setForms([...forms, { originalUrl: '', validityPeriod: 30, preferredShortcode: '' }]);
      logger.info('Added new URL form', { totalForms: forms.length + 1 });
    }
  };

  const removeForm = (index: number) => {
    if (forms.length > 1) {
      const newForms = forms.filter((_, i) => i !== index);
      setForms(newForms);
      logger.info('Removed URL form', { index, totalForms: newForms.length });
    }
  };

  const updateForm = (index: number, field: keyof UrlFormData, value: string | number) => {
    const newForms = [...forms];
    newForms[index] = { ...newForms[index], [field]: value };
    setForms(newForms);
  };

  const validateForm = (form: UrlFormData, index: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    const urlValidation = validation.validateUrl(form.originalUrl);
    if (!urlValidation.isValid) {
      newErrors[`url_${index}`] = urlValidation.message;
    }

    const periodValidation = validation.validateValidityPeriod(form.validityPeriod);
    if (!periodValidation.isValid) {
      newErrors[`period_${index}`] = periodValidation.message;
    }

    const shortcodeValidation = validation.validateShortcode(form.preferredShortcode);
    if (!shortcodeValidation.isValid) {
      newErrors[`shortcode_${index}`] = shortcodeValidation.message;
    }

    if (form.preferredShortcode && !dataStore.isShortCodeUnique(form.preferredShortcode)) {
      newErrors[`shortcode_${index}`] = 'This shortcode is already taken';
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setResults([]);
    setErrors({});

    logger.info('Starting URL shortening process', { formCount: forms.length });

    try {
      const processedUrls: ShortenedUrl[] = [];
      let hasErrors = false;

      for (let i = 0; i < forms.length; i++) {
        const form = forms[i];
        
        if (!validateForm(form, i)) {
          hasErrors = true;
          continue;
        }

        const existingCodes = dataStore.getAllUrls().map(u => u.shortCode);
        const shortCode = form.preferredShortcode || 
          shortcodeGenerator.generateUniqueShortcode(existingCodes);

        const url: ShortenedUrl = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          originalUrl: form.originalUrl.startsWith('http') ? form.originalUrl : `https://${form.originalUrl}`,
          shortCode,
          creationDate: Date.now(),
          expiryDate: Date.now() + (form.validityPeriod * 60 * 1000),
          clicks: []
        };

        dataStore.addUrl(url);
        processedUrls.push(url);
        
        logger.info('Successfully shortened URL', { 
          id: url.id, 
          shortCode: url.shortCode,
          originalUrl: url.originalUrl 
        });
      }

      if (!hasErrors) {
        setResults(processedUrls);
        setForms([{ originalUrl: '', validityPeriod: 30, preferredShortcode: '' }]);
        logger.info('URL shortening process completed successfully', { 
          processedCount: processedUrls.length 
        });
      }
    } catch (error) {
      logger.error('Error during URL shortening process', { error });
      setErrors({ general: 'An error occurred while shortening URLs. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Link className="h-6 w-6 mr-2" />
          Shorten URLs
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {forms.map((form, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">URL #{index + 1}</h3>
                {forms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeForm(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original URL *
                  </label>
                  <input
                    type="text"
                    value={form.originalUrl}
                    onChange={(e) => updateForm(index, 'originalUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                  {errors[`url_${index}`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`url_${index}`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Validity Period (minutes)
                  </label>
                  <input
                    type="number"
                    value={form.validityPeriod}
                    onChange={(e) => updateForm(index, 'validityPeriod', parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                  {errors[`period_${index}`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`period_${index}`]}</p>
                  )}
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Shortcode (optional)
                  </label>
                  <input
                    type="text"
                    value={form.preferredShortcode}
                    onChange={(e) => updateForm(index, 'preferredShortcode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="mycode123"
                  />
                  {errors[`shortcode_${index}`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`shortcode_${index}`]}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={addForm}
              disabled={forms.length >= 5}
              className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add URL ({forms.length}/5)
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-md transition-colors flex items-center"
            >
              {isProcessing ? 'Processing...' : 'Shorten URLs'}
            </button>
          </div>

          {errors.general && (
            <p className="text-red-500 text-sm">{errors.general}</p>
          )}
        </form>
      </div>

      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">✅ Success! URLs Shortened</h3>
          <div className="space-y-4">
            {results.map((url) => (
              <div key={url.id} className="border rounded-lg p-4 bg-green-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Short URL:</p>
                    <p className="text-lg font-mono text-blue-600 mb-2">
                      {window.location.origin}/{url.shortCode}
                    </p>
                    <p className="text-sm text-gray-600">
                      Expires: {new Date(url.expiryDate!).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/${url.shortCode}`)}
                    className="mt-2 sm:mt-0 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlForm;