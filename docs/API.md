# API Documentation

## Custom Hooks API

### useLogger()

Custom hook providing structured logging functionality throughout the application.

#### Returns
```typescript
{
  info: (event: string, data?: any) => void;
  warn: (event: string, data?: any) => void;
  error: (event: string, data?: any) => void;
  getLogs: () => LogEntry[];
  clearLogs: () => void;
}
```

#### Methods

**info(event, data?)**
- **Purpose**: Log informational events
- **Parameters**:
  - `event` (string): Description of the event
  - `data` (any, optional): Additional data to log
- **Example**: `logger.info('URL shortened successfully', { shortCode: 'abc123' })`

**warn(event, data?)**
- **Purpose**: Log warning events
- **Parameters**:
  - `event` (string): Description of the warning
  - `data` (any, optional): Additional data to log
- **Example**: `logger.warn('Shortcode already exists', { shortCode: 'taken' })`

**error(event, data?)**
- **Purpose**: Log error events
- **Parameters**:
  - `event` (string): Description of the error
  - `data` (any, optional): Additional data to log
- **Example**: `logger.error('Failed to save URL', { error: errorObject })`

**getLogs()**
- **Purpose**: Retrieve all stored log entries
- **Returns**: `LogEntry[]`
- **Example**: `const logs = logger.getLogs()`

**clearLogs()**
- **Purpose**: Clear all stored log entries
- **Returns**: `void`
- **Example**: `logger.clearLogs()`

### useDataStore()

Custom hook providing data persistence and retrieval functionality.

#### Returns
```typescript
DataStore instance with methods:
{
  getAllUrls: () => ShortenedUrl[];
  addUrl: (url: ShortenedUrl) => void;
  getUrlByShortCode: (shortCode: string) => ShortenedUrl | null;
  updateUrl: (url: ShortenedUrl) => void;
  deleteUrl: (id: string) => void;
  isShortCodeUnique: (shortCode: string) => boolean;
  addClick: (shortCode: string, clickEvent: ClickEvent) => void;
}
```

#### Methods

**getAllUrls()**
- **Purpose**: Retrieve all stored shortened URLs
- **Returns**: `ShortenedUrl[]`
- **Throws**: Never (returns empty array on error)
- **Logs**: Retrieval count and any errors

**addUrl(url)**
- **Purpose**: Add a new shortened URL to storage
- **Parameters**:
  - `url` (ShortenedUrl): Complete URL object to store
- **Returns**: `void`
- **Throws**: Error if storage operation fails
- **Logs**: Success with URL details or failure with error

**getUrlByShortCode(shortCode)**
- **Purpose**: Find a URL by its shortcode
- **Parameters**:
  - `shortCode` (string): The shortcode to search for
- **Returns**: `ShortenedUrl | null`
- **Logs**: Search result (found/not found)

**updateUrl(url)**
- **Purpose**: Update an existing URL in storage
- **Parameters**:
  - `url` (ShortenedUrl): Updated URL object
- **Returns**: `void`
- **Throws**: Error if storage operation fails
- **Logs**: Success or failure with URL details

**deleteUrl(id)**
- **Purpose**: Remove a URL from storage
- **Parameters**:
  - `id` (string): Unique identifier of URL to delete
- **Returns**: `void`
- **Throws**: Error if storage operation fails
- **Logs**: Deletion success or failure

**isShortCodeUnique(shortCode)**
- **Purpose**: Check if a shortcode is available
- **Parameters**:
  - `shortCode` (string): Shortcode to check
- **Returns**: `boolean` (true if unique/available)
- **Logs**: Uniqueness check result

**addClick(shortCode, clickEvent)**
- **Purpose**: Add a click event to a URL's analytics
- **Parameters**:
  - `shortCode` (string): Target URL's shortcode
  - `clickEvent` (ClickEvent): Click data to add
- **Returns**: `void`
- **Throws**: Error if URL not found or storage fails
- **Logs**: Click addition success or failure

### useValidation()

Custom hook providing input validation functionality.

#### Returns
```typescript
{
  validateUrl: (url: string) => ValidationResult;
  validateValidityPeriod: (period: number) => ValidationResult;
  validateShortcode: (shortcode: string) => ValidationResult;
}
```

#### ValidationResult Interface
```typescript
interface ValidationResult {
  isValid: boolean;
  message: string;
}
```

#### Methods

**validateUrl(url)**
- **Purpose**: Validate URL format and structure
- **Parameters**:
  - `url` (string): URL to validate
- **Returns**: `ValidationResult`
- **Validation Rules**:
  - Must not be empty
  - Must match URL pattern regex
  - Supports http/https protocols
- **Logs**: Validation success or failure with URL

**validateValidityPeriod(period)**
- **Purpose**: Validate validity period constraints
- **Parameters**:
  - `period` (number): Period in minutes
- **Returns**: `ValidationResult`
- **Validation Rules**:
  - Must be positive number
  - Maximum 525,600 minutes (1 year)
- **Logs**: Validation result with period value

**validateShortcode(shortcode)**
- **Purpose**: Validate custom shortcode format
- **Parameters**:
  - `shortcode` (string): Shortcode to validate
- **Returns**: `ValidationResult`
- **Validation Rules**:
  - Optional field (empty string is valid)
  - Must be alphanumeric only
  - Length between 4-10 characters
- **Logs**: Validation result with shortcode

### useShortcodeGenerator()

Custom hook providing shortcode generation functionality.

#### Returns
```typescript
{
  generateShortcode: (length?: number) => string;
  generateUniqueShortcode: (existingCodes: string[], length?: number) => string;
}
```

#### Methods

**generateShortcode(length?)**
- **Purpose**: Generate a random alphanumeric shortcode
- **Parameters**:
  - `length` (number, optional): Length of shortcode (default: 6)
- **Returns**: `string`
- **Character Set**: A-Z, a-z, 0-9 (62 characters)
- **Logs**: Generated shortcode and length

**generateUniqueShortcode(existingCodes, length?)**
- **Purpose**: Generate a unique shortcode avoiding collisions
- **Parameters**:
  - `existingCodes` (string[]): Array of existing shortcodes to avoid
  - `length` (number, optional): Starting length (default: 6)
- **Returns**: `string`
- **Algorithm**:
  - Generate shortcode of specified length
  - Check against existing codes
  - Retry up to 100 times
  - If still colliding, increase length by 1 and retry
- **Logs**: Generation attempts and final result

## Utility Functions

### generateClickEvent()

Utility function for simulating click analytics data.

#### Signature
```typescript
generateClickEvent(): ClickEvent
```

#### Returns
```typescript
{
  timestamp: number;    // Current timestamp
  source: string;      // Random from predefined sources
  geo: string;        // Random from predefined regions
}
```

#### Predefined Sources
- "Direct"
- "Google Search"
- "Social Media"
- "Email"
- "Referral"
- "Other"

#### Predefined Regions
- "North America"
- "Europe"
- "Asia"
- "South America"
- "Africa"
- "Oceania"

## Component Props API

### ErrorBoundary

#### Props
```typescript
interface Props {
  children: ReactNode;
}
```

#### State
```typescript
interface State {
  hasError: boolean;
  error?: Error;
}
```

### Navigation

No props required. Uses React Router's `useLocation` hook internally.

### UrlForm

No props required. Manages internal state for form data and results.

#### Internal State
```typescript
const [forms, setForms] = useState<UrlFormData[]>([]);
const [results, setResults] = useState<ShortenedUrl[]>([]);
const [isProcessing, setIsProcessing] = useState<boolean>(false);
const [errors, setErrors] = useState<{ [key: string]: string }>({});
```

### Statistics

No props required. Loads data from DataStore on mount.

#### Internal State
```typescript
const [urls, setUrls] = useState<ShortenedUrl[]>([]);
const [expandedUrls, setExpandedUrls] = useState<Set<string>>(new Set());
```

### RedirectPage

Uses React Router's `useParams` hook to extract shortcode from URL.

#### URL Parameters
- `shortcode` (string): The shortcode to redirect

#### Internal State
```typescript
const [status, setStatus] = useState<'loading' | 'redirecting' | 'not_found' | 'expired'>('loading');
```

## Error Handling API

### Error Types

**Validation Errors**
- Field-specific validation failures
- User-friendly error messages
- Non-blocking (form remains functional)

**Storage Errors**
- localStorage quota exceeded
- JSON parsing failures
- Data corruption

**Redirect Errors**
- Shortcode not found
- URL expired
- Invalid shortcode format

**Component Errors**
- React component crashes
- Caught by Error Boundary
- Graceful fallback UI

### Error Response Format

All validation functions return consistent error format:
```typescript
{
  isValid: boolean;
  message: string;  // User-friendly error message
}
```

### Error Logging

All errors are automatically logged with context:
```typescript
logger.error('Error description', {
  error: errorObject,
  context: additionalData
});
```

## Storage API

### localStorage Keys

**shortened_urls**
- **Type**: `string` (JSON serialized array)
- **Content**: Array of `ShortenedUrl` objects
- **Size**: Variable (depends on number of URLs and clicks)

**app_logs**
- **Type**: `string` (JSON serialized array)
- **Content**: Array of `LogEntry` objects
- **Size**: Limited to last 1000 entries (auto-rotation)

### Data Persistence

**Automatic Saving**
- All data operations immediately persist to localStorage
- No manual save required
- Atomic operations (all-or-nothing)

**Data Loading**
- Automatic on application start
- Graceful handling of missing/corrupted data
- Default to empty arrays on errors

**Data Cleanup**
- Log rotation prevents unlimited growth
- No automatic URL cleanup (user-controlled)
- Expired URLs remain for analytics

## Performance Considerations

### Hook Optimization
- Singleton patterns prevent multiple instances
- Memoized functions where appropriate
- Minimal re-renders through careful state management

### Storage Optimization
- JSON serialization for complex objects
- Efficient data structures
- Minimal storage footprint

### Component Optimization
- React.memo for expensive components
- Efficient event handlers
- Optimized re-rendering strategies