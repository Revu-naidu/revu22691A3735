# Testing Guide

## Testing Strategy Overview

The URL Shortener application uses a comprehensive testing approach covering unit tests, integration tests, and end-to-end testing scenarios. This guide covers testing methodologies, test cases, and quality assurance procedures.

## Testing Framework Setup

### Dependencies

```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "vitest": "^0.34.0",
    "@vitest/ui": "^0.34.0",
    "jsdom": "^22.1.0",
    "msw": "^1.3.0"
  }
}
```

### Configuration

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
});
```

**src/test/setup.ts:**
```typescript
import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  
  // Clear all mocks before each test
  vi.clearAllMocks();
});
```

## Unit Tests

### Custom Hooks Testing

#### useLogger Hook Tests

**src/hooks/__tests__/useLogger.test.ts:**
```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLogger } from '../useLogger';

describe('useLogger', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with empty logs', () => {
    const { result } = renderHook(() => useLogger());
    expect(result.current.getLogs()).toEqual([]);
  });

  it('should log info messages correctly', () => {
    const { result } = renderHook(() => useLogger());
    
    act(() => {
      result.current.info('Test info message', { data: 'test' });
    });

    const logs = result.current.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      type: 'INFO',
      event: 'Test info message',
      data: { data: 'test' }
    });
    expect(logs[0].timestamp).toBeTypeOf('number');
  });

  it('should log warn messages correctly', () => {
    const { result } = renderHook(() => useLogger());
    
    act(() => {
      result.current.warn('Test warning', { warning: true });
    });

    const logs = result.current.getLogs();
    expect(logs[0].type).toBe('WARN');
    expect(logs[0].event).toBe('Test warning');
  });

  it('should log error messages correctly', () => {
    const { result } = renderHook(() => useLogger());
    
    act(() => {
      result.current.error('Test error', { error: new Error('Test') });
    });

    const logs = result.current.getLogs();
    expect(logs[0].type).toBe('ERROR');
    expect(logs[0].event).toBe('Test error');
  });

  it('should persist logs to localStorage', () => {
    const { result } = renderHook(() => useLogger());
    
    act(() => {
      result.current.info('Persistent log');
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'app_logs',
      expect.stringContaining('Persistent log')
    );
  });

  it('should clear logs correctly', () => {
    const { result } = renderHook(() => useLogger());
    
    act(() => {
      result.current.info('Log to clear');
      result.current.clearLogs();
    });

    expect(result.current.getLogs()).toEqual([]);
  });

  it('should limit logs to 1000 entries', () => {
    const { result } = renderHook(() => useLogger());
    
    act(() => {
      // Add 1001 logs
      for (let i = 0; i < 1001; i++) {
        result.current.info(`Log ${i}`);
      }
    });

    expect(result.current.getLogs()).toHaveLength(1000);
  });
});
```

#### useDataStore Hook Tests

**src/utils/__tests__/dataStore.test.ts:**
```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useDataStore } from '../dataStore';
import { ShortenedUrl } from '../../types';

const mockUrl: ShortenedUrl = {
  id: 'test-id',
  originalUrl: 'https://example.com',
  shortCode: 'test123',
  creationDate: Date.now(),
  expiryDate: Date.now() + 30 * 60 * 1000,
  clicks: []
};

describe('useDataStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should return empty array when no URLs stored', () => {
    const dataStore = useDataStore();
    expect(dataStore.getAllUrls()).toEqual([]);
  });

  it('should add URL correctly', () => {
    const dataStore = useDataStore();
    
    act(() => {
      dataStore.addUrl(mockUrl);
    });

    const urls = dataStore.getAllUrls();
    expect(urls).toHaveLength(1);
    expect(urls[0]).toEqual(mockUrl);
  });

  it('should find URL by shortcode', () => {
    const dataStore = useDataStore();
    
    act(() => {
      dataStore.addUrl(mockUrl);
    });

    const foundUrl = dataStore.getUrlByShortCode('test123');
    expect(foundUrl).toEqual(mockUrl);
  });

  it('should return null for non-existent shortcode', () => {
    const dataStore = useDataStore();
    const foundUrl = dataStore.getUrlByShortCode('nonexistent');
    expect(foundUrl).toBeNull();
  });

  it('should check shortcode uniqueness correctly', () => {
    const dataStore = useDataStore();
    
    act(() => {
      dataStore.addUrl(mockUrl);
    });

    expect(dataStore.isShortCodeUnique('test123')).toBe(false);
    expect(dataStore.isShortCodeUnique('unique123')).toBe(true);
  });

  it('should update URL correctly', () => {
    const dataStore = useDataStore();
    
    act(() => {
      dataStore.addUrl(mockUrl);
    });

    const updatedUrl = { ...mockUrl, clicks: [{ timestamp: Date.now(), source: 'Direct', geo: 'US' }] };
    
    act(() => {
      dataStore.updateUrl(updatedUrl);
    });

    const foundUrl = dataStore.getUrlByShortCode('test123');
    expect(foundUrl?.clicks).toHaveLength(1);
  });

  it('should delete URL correctly', () => {
    const dataStore = useDataStore();
    
    act(() => {
      dataStore.addUrl(mockUrl);
    });

    act(() => {
      dataStore.deleteUrl('test-id');
    });

    expect(dataStore.getAllUrls()).toHaveLength(0);
  });

  it('should add click event correctly', () => {
    const dataStore = useDataStore();
    const clickEvent = { timestamp: Date.now(), source: 'Direct', geo: 'US' };
    
    act(() => {
      dataStore.addUrl(mockUrl);
      dataStore.addClick('test123', clickEvent);
    });

    const foundUrl = dataStore.getUrlByShortCode('test123');
    expect(foundUrl?.clicks).toHaveLength(1);
    expect(foundUrl?.clicks[0]).toEqual(clickEvent);
  });
});
```

#### useValidation Hook Tests

**src/utils/__tests__/validation.test.ts:**
```typescript
import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useValidation } from '../validation';

describe('useValidation', () => {
  it('should validate URLs correctly', () => {
    const { result } = renderHook(() => useValidation());
    
    // Valid URLs
    expect(result.current.validateUrl('https://example.com')).toEqual({
      isValid: true,
      message: ''
    });
    
    expect(result.current.validateUrl('http://test.co.uk')).toEqual({
      isValid: true,
      message: ''
    });
    
    // Invalid URLs
    expect(result.current.validateUrl('')).toEqual({
      isValid: false,
      message: 'URL is required'
    });
    
    expect(result.current.validateUrl('not-a-url')).toEqual({
      isValid: false,
      message: 'Please enter a valid URL'
    });
  });

  it('should validate validity periods correctly', () => {
    const { result } = renderHook(() => useValidation());
    
    // Valid periods
    expect(result.current.validateValidityPeriod(30)).toEqual({
      isValid: true,
      message: ''
    });
    
    expect(result.current.validateValidityPeriod(525600)).toEqual({
      isValid: true,
      message: ''
    });
    
    // Invalid periods
    expect(result.current.validateValidityPeriod(0)).toEqual({
      isValid: false,
      message: 'Validity period must be positive'
    });
    
    expect(result.current.validateValidityPeriod(525601)).toEqual({
      isValid: false,
      message: 'Validity period cannot exceed 1 year'
    });
  });

  it('should validate shortcodes correctly', () => {
    const { result } = renderHook(() => useValidation());
    
    // Valid shortcodes
    expect(result.current.validateShortcode('')).toEqual({
      isValid: true,
      message: ''
    });
    
    expect(result.current.validateShortcode('test123')).toEqual({
      isValid: true,
      message: ''
    });
    
    // Invalid shortcodes
    expect(result.current.validateShortcode('ab')).toEqual({
      isValid: false,
      message: 'Shortcode must be 4-10 characters long'
    });
    
    expect(result.current.validateShortcode('test-123')).toEqual({
      isValid: false,
      message: 'Shortcode must contain only letters and numbers'
    });
  });
});
```

### Component Testing

#### UrlForm Component Tests

**src/components/__tests__/UrlForm.test.tsx:**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import UrlForm from '../UrlForm';

// Mock the custom hooks
vi.mock('../../utils/dataStore');
vi.mock('../../utils/validation');
vi.mock('../../utils/shortcodeGenerator');
vi.mock('../../hooks/useLogger');

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('UrlForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with initial state', () => {
    renderWithRouter(<UrlForm />);
    
    expect(screen.getByText('Shorten URLs')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    expect(screen.getByText('Shorten URLs')).toBeInTheDocument();
  });

  it('allows adding and removing URL forms', async () => {
    const user = userEvent.setup();
    renderWithRouter(<UrlForm />);
    
    // Initially should have 1 form
    expect(screen.getByText('URL #1')).toBeInTheDocument();
    
    // Add a form
    await user.click(screen.getByText(/Add URL/));
    expect(screen.getByText('URL #2')).toBeInTheDocument();
    
    // Remove a form
    const removeButtons = screen.getAllByRole('button');
    const removeButton = removeButtons.find(btn => btn.querySelector('svg'));
    if (removeButton) {
      await user.click(removeButton);
    }
    
    expect(screen.queryByText('URL #2')).not.toBeInTheDocument();
  });

  it('validates form inputs', async () => {
    const user = userEvent.setup();
    renderWithRouter(<UrlForm />);
    
    // Try to submit empty form
    await user.click(screen.getByText('Shorten URLs'));
    
    await waitFor(() => {
      expect(screen.getByText('URL is required')).toBeInTheDocument();
    });
  });

  it('handles form submission correctly', async () => {
    const user = userEvent.setup();
    renderWithRouter(<UrlForm />);
    
    // Fill in valid data
    await user.type(screen.getByPlaceholderText('https://example.com'), 'https://test.com');
    await user.clear(screen.getByDisplayValue('30'));
    await user.type(screen.getByDisplayValue(''), '60');
    
    // Submit form
    await user.click(screen.getByText('Shorten URLs'));
    
    // Should show processing state
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('displays results after successful submission', async () => {
    const user = userEvent.setup();
    renderWithRouter(<UrlForm />);
    
    // Mock successful submission
    await user.type(screen.getByPlaceholderText('https://example.com'), 'https://test.com');
    await user.click(screen.getByText('Shorten URLs'));
    
    await waitFor(() => {
      expect(screen.getByText('✅ Success! URLs Shortened')).toBeInTheDocument();
    });
  });

  it('limits forms to maximum of 5', async () => {
    const user = userEvent.setup();
    renderWithRouter(<UrlForm />);
    
    // Add forms until limit
    for (let i = 0; i < 5; i++) {
      const addButton = screen.getByText(/Add URL/);
      if (!addButton.hasAttribute('disabled')) {
        await user.click(addButton);
      }
    }
    
    // Should be disabled at limit
    expect(screen.getByText(/Add URL/).closest('button')).toBeDisabled();
  });
});
```

#### Statistics Component Tests

**src/components/__tests__/Statistics.test.tsx:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Statistics from '../Statistics';
import { ShortenedUrl } from '../../types';

const mockUrls: ShortenedUrl[] = [
  {
    id: '1',
    originalUrl: 'https://example.com',
    shortCode: 'test123',
    creationDate: Date.now() - 86400000, // 1 day ago
    expiryDate: Date.now() + 86400000, // 1 day from now
    clicks: [
      { timestamp: Date.now(), source: 'Direct', geo: 'North America' },
      { timestamp: Date.now() - 3600000, source: 'Social Media', geo: 'Europe' }
    ]
  }
];

vi.mock('../../utils/dataStore', () => ({
  useDataStore: () => ({
    getAllUrls: () => mockUrls
  })
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Statistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders statistics overview', () => {
    renderWithRouter(<Statistics />);
    
    expect(screen.getByText('URL Statistics')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Total URLs
    expect(screen.getByText('2')).toBeInTheDocument(); // Total Clicks
  });

  it('displays URL cards with correct information', () => {
    renderWithRouter(<Statistics />);
    
    expect(screen.getByText('localhost:3000/test123')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Click count
  });

  it('expands and collapses click details', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Statistics />);
    
    // Initially collapsed
    expect(screen.queryByText('Click Details')).not.toBeInTheDocument();
    
    // Expand
    const expandButton = screen.getByRole('button');
    await user.click(expandButton);
    
    expect(screen.getByText('Click Details')).toBeInTheDocument();
    expect(screen.getByText('Direct')).toBeInTheDocument();
    expect(screen.getByText('Social Media')).toBeInTheDocument();
  });

  it('shows empty state when no URLs exist', () => {
    vi.mocked(useDataStore).mockReturnValue({
      getAllUrls: () => []
    });
    
    renderWithRouter(<Statistics />);
    
    expect(screen.getByText('No URLs Yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first shortened URL to see statistics here.')).toBeInTheDocument();
  });

  it('identifies expired URLs correctly', () => {
    const expiredUrl: ShortenedUrl = {
      ...mockUrls[0],
      expiryDate: Date.now() - 86400000 // Expired 1 day ago
    };
    
    vi.mocked(useDataStore).mockReturnValue({
      getAllUrls: () => [expiredUrl]
    });
    
    renderWithRouter(<Statistics />);
    
    expect(screen.getByText('Expired')).toBeInTheDocument();
  });
});
```

## Integration Tests

### End-to-End User Flows

**src/test/integration/urlShortening.test.tsx:**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';

describe('URL Shortening Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('completes full URL shortening workflow', async () => {
    const user = userEvent.setup();
    render(<BrowserRouter><App /></BrowserRouter>);
    
    // Navigate to home page
    expect(screen.getByText('Shorten URLs')).toBeInTheDocument();
    
    // Fill in URL form
    await user.type(
      screen.getByPlaceholderText('https://example.com'),
      'https://www.google.com'
    );
    
    // Set custom shortcode
    await user.type(
      screen.getByPlaceholderText('mycode123'),
      'google123'
    );
    
    // Submit form
    await user.click(screen.getByText('Shorten URLs'));
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('✅ Success! URLs Shortened')).toBeInTheDocument();
    });
    
    // Verify short URL is displayed
    expect(screen.getByText('localhost:3000/google123')).toBeInTheDocument();
    
    // Navigate to statistics
    await user.click(screen.getByText('Statistics'));
    
    // Verify URL appears in statistics
    expect(screen.getByText('localhost:3000/google123')).toBeInTheDocument();
    expect(screen.getByText('https://www.google.com')).toBeInTheDocument();
  });

  it('handles validation errors gracefully', async () => {
    const user = userEvent.setup();
    render(<BrowserRouter><App /></BrowserRouter>);
    
    // Try to submit with invalid URL
    await user.type(
      screen.getByPlaceholderText('https://example.com'),
      'not-a-url'
    );
    
    await user.click(screen.getByText('Shorten URLs'));
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
    });
    
    // Form should still be functional
    expect(screen.getByText('Shorten URLs')).toBeInTheDocument();
  });

  it('prevents duplicate shortcodes', async () => {
    const user = userEvent.setup();
    render(<BrowserRouter><App /></BrowserRouter>);
    
    // Create first URL with custom shortcode
    await user.type(
      screen.getByPlaceholderText('https://example.com'),
      'https://first.com'
    );
    await user.type(
      screen.getByPlaceholderText('mycode123'),
      'duplicate'
    );
    await user.click(screen.getByText('Shorten URLs'));
    
    await waitFor(() => {
      expect(screen.getByText('✅ Success! URLs Shortened')).toBeInTheDocument();
    });
    
    // Try to create second URL with same shortcode
    await user.type(
      screen.getByPlaceholderText('https://example.com'),
      'https://second.com'
    );
    await user.type(
      screen.getByPlaceholderText('mycode123'),
      'duplicate'
    );
    await user.click(screen.getByText('Shorten URLs'));
    
    // Should show error
    await waitFor(() => {
      expect(screen.getByText('This shortcode is already taken')).toBeInTheDocument();
    });
  });
});
```

### Redirect Flow Testing

**src/test/integration/redirect.test.tsx:**
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';
import { ShortenedUrl } from '../../types';

// Mock window.location.href
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
});

const mockUrl: ShortenedUrl = {
  id: 'test-id',
  originalUrl: 'https://example.com',
  shortCode: 'test123',
  creationDate: Date.now(),
  expiryDate: Date.now() + 30 * 60 * 1000,
  clicks: []
};

describe('Redirect Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.href = '';
    vi.clearAllMocks();
  });

  it('redirects to original URL for valid shortcode', async () => {
    // Setup URL in storage
    localStorage.setItem('shortened_urls', JSON.stringify([mockUrl]));
    
    render(
      <MemoryRouter initialEntries={['/test123']}>
        <App />
      </MemoryRouter>
    );
    
    // Should show redirecting message
    expect(screen.getByText('Redirecting...')).toBeInTheDocument();
    
    // Should redirect after delay
    await waitFor(() => {
      expect(window.location.href).toBe('https://example.com');
    }, { timeout: 2000 });
  });

  it('shows not found for invalid shortcode', async () => {
    render(
      <MemoryRouter initialEntries={['/nonexistent']}>
        <App />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Link Not Found')).toBeInTheDocument();
    });
    
    expect(screen.getByText("The short link you're looking for doesn't exist or has been removed.")).toBeInTheDocument();
  });

  it('shows expired message for expired URLs', async () => {
    const expiredUrl: ShortenedUrl = {
      ...mockUrl,
      expiryDate: Date.now() - 1000 // Expired 1 second ago
    };
    
    localStorage.setItem('shortened_urls', JSON.stringify([expiredUrl]));
    
    render(
      <MemoryRouter initialEntries={['/test123']}>
        <App />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Link Expired')).toBeInTheDocument();
    });
    
    expect(screen.getByText('This short link has expired and is no longer valid.')).toBeInTheDocument();
  });

  it('tracks click events on successful redirect', async () => {
    localStorage.setItem('shortened_urls', JSON.stringify([mockUrl]));
    
    render(
      <MemoryRouter initialEntries={['/test123']}>
        <App />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(window.location.href).toBe('https://example.com');
    }, { timeout: 2000 });
    
    // Check that click was recorded
    const updatedUrls = JSON.parse(localStorage.getItem('shortened_urls') || '[]');
    expect(updatedUrls[0].clicks).toHaveLength(1);
    expect(updatedUrls[0].clicks[0]).toMatchObject({
      timestamp: expect.any(Number),
      source: expect.any(String),
      geo: expect.any(String)
    });
  });
});
```

## Performance Testing

### Load Testing

**src/test/performance/loadTest.test.ts:**
```typescript
import { describe, it, expect } from 'vitest';
import { useDataStore } from '../../utils/dataStore';
import { ShortenedUrl } from '../../types';

describe('Performance Tests', () => {
  it('handles large number of URLs efficiently', () => {
    const dataStore = useDataStore();
    const startTime = performance.now();
    
    // Create 1000 URLs
    const urls: ShortenedUrl[] = [];
    for (let i = 0; i < 1000; i++) {
      urls.push({
        id: `id-${i}`,
        originalUrl: `https://example${i}.com`,
        shortCode: `code${i}`,
        creationDate: Date.now(),
        expiryDate: Date.now() + 30 * 60 * 1000,
        clicks: []
      });
    }
    
    // Add all URLs
    urls.forEach(url => dataStore.addUrl(url));
    
    const addTime = performance.now() - startTime;
    expect(addTime).toBeLessThan(1000); // Should complete in under 1 second
    
    // Test retrieval performance
    const retrievalStart = performance.now();
    const allUrls = dataStore.getAllUrls();
    const retrievalTime = performance.now() - retrievalStart;
    
    expect(allUrls).toHaveLength(1000);
    expect(retrievalTime).toBeLessThan(100); // Should retrieve in under 100ms
  });

  it('handles large number of clicks efficiently', () => {
    const dataStore = useDataStore();
    const url: ShortenedUrl = {
      id: 'test-id',
      originalUrl: 'https://example.com',
      shortCode: 'test123',
      creationDate: Date.now(),
      expiryDate: Date.now() + 30 * 60 * 1000,
      clicks: []
    };
    
    dataStore.addUrl(url);
    
    const startTime = performance.now();
    
    // Add 1000 clicks
    for (let i = 0; i < 1000; i++) {
      dataStore.addClick('test123', {
        timestamp: Date.now(),
        source: 'Direct',
        geo: 'North America'
      });
    }
    
    const clickTime = performance.now() - startTime;
    expect(clickTime).toBeLessThan(2000); // Should complete in under 2 seconds
    
    const updatedUrl = dataStore.getUrlByShortCode('test123');
    expect(updatedUrl?.clicks).toHaveLength(1000);
  });
});
```

## Test Coverage

### Coverage Configuration

**vitest.config.ts coverage setup:**
```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

### Running Coverage

```bash
# Run tests with coverage
npm run test:coverage

# View coverage report
open coverage/index.html
```

## Manual Testing Checklist

### Functional Testing

**URL Shortening:**
- [ ] Single URL shortening works
- [ ] Batch URL shortening (2-5 URLs) works
- [ ] Custom shortcodes are accepted
- [ ] Auto-generated shortcodes are unique
- [ ] Validation errors display correctly
- [ ] Success messages appear after shortening
- [ ] Copy to clipboard functionality works

**URL Redirection:**
- [ ] Valid shortcodes redirect correctly
- [ ] Invalid shortcodes show 404 page
- [ ] Expired URLs show expiry message
- [ ] Click tracking records properly
- [ ] Redirect delay is appropriate

**Statistics:**
- [ ] URL list displays correctly
- [ ] Click counts are accurate
- [ ] Expandable details work
- [ ] Summary statistics are correct
- [ ] Empty state displays when no URLs

**Navigation:**
- [ ] Navigation between pages works
- [ ] Active page highlighting works
- [ ] Browser back/forward buttons work
- [ ] Direct URL access works

### Browser Compatibility

**Desktop Browsers:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Mobile Browsers:**
- [ ] Chrome Mobile
- [ ] Safari Mobile
- [ ] Firefox Mobile

### Accessibility Testing

**Keyboard Navigation:**
- [ ] Tab order is logical
- [ ] All interactive elements are reachable
- [ ] Enter/Space activate buttons
- [ ] Escape closes modals/dropdowns

**Screen Reader:**
- [ ] Form labels are properly associated
- [ ] Error messages are announced
- [ ] Navigation landmarks exist
- [ ] Content structure is logical

**Visual:**
- [ ] Color contrast meets WCAG standards
- [ ] Text is readable at 200% zoom
- [ ] Focus indicators are visible
- [ ] No information conveyed by color alone

### Performance Testing

**Load Times:**
- [ ] Initial page load < 3 seconds
- [ ] Navigation between pages < 1 second
- [ ] Form submissions < 2 seconds
- [ ] Statistics page load < 2 seconds

**Responsiveness:**
- [ ] Mobile layout works correctly
- [ ] Tablet layout works correctly
- [ ] Desktop layout works correctly
- [ ] Touch interactions work on mobile

### Security Testing

**Input Validation:**
- [ ] XSS attempts are prevented
- [ ] SQL injection attempts fail (N/A for client-side)
- [ ] Malformed URLs are rejected
- [ ] Oversized inputs are handled

**Data Protection:**
- [ ] localStorage data is properly formatted
- [ ] No sensitive data in logs
- [ ] No data leakage between sessions
- [ ] Proper error handling prevents data exposure

## Continuous Integration

### GitHub Actions Workflow

**.github/workflows/test.yml:**
```yaml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run type check
      run: npm run type-check
    
    - name: Run tests
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/coverage-final.json
        fail_ci_if_error: true
```

### Quality Gates

**Pre-commit Hooks:**
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

**Quality Thresholds:**
- Test coverage: ≥ 80%
- Linting: 0 errors
- Type checking: 0 errors
- Build: successful
- Bundle size: < 1MB gzipped