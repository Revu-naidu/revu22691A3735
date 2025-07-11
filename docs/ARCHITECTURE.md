# Architecture Documentation

## System Overview

The Client-Side React URL Shortener is a single-page application (SPA) built with React 18 and TypeScript that operates entirely within the browser environment. The application uses localStorage for data persistence and implements a custom logging system for comprehensive event tracking.

## Core Architecture Principles

### 1. Client-Side Only Design
- **No Backend Dependencies**: All functionality operates within the browser
- **localStorage Persistence**: Data survives browser sessions but remains device-specific
- **Simulated Analytics**: Click tracking uses realistic but simulated data sources

### 2. Modular Component Architecture
```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions and services
├── types/              # TypeScript type definitions
└── App.tsx             # Main application component
```

### 3. Data Flow Architecture
```
User Input → Validation → Data Store → UI Update → Logging
     ↓
Component State → localStorage → Logger → Analytics
```

## Core Systems

### 1. Logging Middleware (`useLogger`)

**Purpose**: Replace console.log with structured, persistent logging

**Implementation**:
- Singleton pattern ensures consistent logging across the application
- Stores logs in localStorage with structured format
- Automatic log rotation (keeps last 1000 entries)
- Three log levels: INFO, WARN, ERROR

**Log Entry Structure**:
```typescript
interface LogEntry {
  timestamp: number;
  type: 'INFO' | 'WARN' | 'ERROR';
  event: string;
  data?: any;
}
```

**Usage Example**:
```typescript
const logger = useLogger();
logger.info('URL shortened successfully', { shortCode: 'abc123' });
logger.error('Validation failed', { field: 'url', value: 'invalid-url' });
```

### 2. Data Store (`useDataStore`)

**Purpose**: Manage all URL data persistence and retrieval

**Implementation**:
- Singleton pattern for consistent data access
- localStorage-based persistence with JSON serialization
- CRUD operations with error handling and logging
- Automatic data validation and cleanup

**Core Methods**:
- `getAllUrls()`: Retrieve all stored URLs
- `addUrl(url)`: Add new shortened URL
- `getUrlByShortCode(code)`: Find URL by shortcode
- `updateUrl(url)`: Update existing URL (for click tracking)
- `deleteUrl(id)`: Remove URL from storage
- `isShortCodeUnique(code)`: Check shortcode availability

### 3. Validation System (`useValidation`)

**Purpose**: Comprehensive input validation with user-friendly error messages

**Validation Rules**:
- **URL Format**: Regex-based validation for proper URL structure
- **Validity Period**: Must be positive integer, max 1 year (525,600 minutes)
- **Shortcode**: 4-10 alphanumeric characters, uniqueness check

**Implementation**:
```typescript
const validation = useValidation();
const urlResult = validation.validateUrl('https://example.com');
// Returns: { isValid: boolean, message: string }
```

### 4. Shortcode Generator (`useShortcodeGenerator`)

**Purpose**: Generate unique, collision-free shortcodes

**Features**:
- Configurable length (default 6 characters)
- Alphanumeric character set (A-Z, a-z, 0-9)
- Collision detection with automatic retry
- Fallback to longer codes if needed

**Algorithm**:
1. Generate random alphanumeric string
2. Check against existing shortcodes
3. Retry with same length (max 100 attempts)
4. If collision persists, increase length by 1
5. Repeat until unique code found

## Data Models

### 1. ShortenedUrl Interface
```typescript
interface ShortenedUrl {
  id: string;              // Unique identifier (timestamp + random)
  originalUrl: string;     // Full original URL with protocol
  shortCode: string;       // Generated or custom shortcode
  creationDate: number;    // Unix timestamp
  expiryDate: number | null; // Unix timestamp or null for no expiry
  clicks: ClickEvent[];    // Array of click tracking data
}
```

### 2. ClickEvent Interface
```typescript
interface ClickEvent {
  timestamp: number;       // Unix timestamp of click
  source: string;         // Simulated traffic source
  geo: string;           // Simulated geographical region
}
```

### 3. UrlFormData Interface
```typescript
interface UrlFormData {
  originalUrl: string;
  validityPeriod: number;  // Minutes
  preferredShortcode: string;
}
```

## Routing Strategy

### 1. Application Routes
- `/` - Main URL shortening interface
- `/stats` - Analytics and statistics dashboard

### 2. Dynamic Shortcode Routes
- `/:shortcode` - Redirect handler for shortened URLs

### 3. Route Hierarchy
```typescript
<Router>
  <Routes>
    {/* Shortcode redirect - highest priority */}
    <Route path="/:shortcode" element={<RedirectPage />} />
    
    {/* Application routes with navigation */}
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
</Router>
```

## Component Architecture

### 1. Component Hierarchy
```
App
├── ErrorBoundary
├── Router
    ├── RedirectPage (/:shortcode)
    └── Main Application
        ├── Navigation
        ├── UrlForm (/)
        └── Statistics (/stats)
```

### 2. Component Responsibilities

**App.tsx**:
- Root component setup
- Router configuration
- Global error boundary
- Application initialization logging

**Navigation.tsx**:
- Top navigation bar
- Active route highlighting
- Responsive design

**UrlForm.tsx**:
- Multi-URL input form (up to 5 URLs)
- Real-time validation
- Batch processing
- Results display

**Statistics.tsx**:
- URL listing with analytics
- Expandable click details
- Summary statistics
- Data visualization

**RedirectPage.tsx**:
- Shortcode lookup
- Expiration checking
- Click tracking
- Redirect execution

**ErrorBoundary.tsx**:
- Global error catching
- User-friendly error display
- Error logging
- Recovery options

## State Management

### 1. Local Component State
- Form inputs and validation states
- UI interaction states (expanded/collapsed)
- Loading and processing states

### 2. Persistent State (localStorage)
- `shortened_urls`: Array of ShortenedUrl objects
- `app_logs`: Array of LogEntry objects

### 3. State Flow
```
User Action → Component State → Validation → Data Store → localStorage → Logger
```

## Error Handling Strategy

### 1. Error Boundary
- Catches React component errors
- Displays user-friendly error page
- Logs errors for debugging
- Provides recovery options

### 2. Data Operation Errors
- Try-catch blocks around all data operations
- Graceful degradation for missing data
- User-friendly error messages
- Comprehensive error logging

### 3. Validation Errors
- Real-time input validation
- Field-specific error messages
- Form submission prevention
- Clear error state management

## Performance Considerations

### 1. Data Storage
- localStorage size limits (~5-10MB)
- JSON serialization overhead
- Log rotation to prevent memory bloat
- Efficient data structures

### 2. Component Optimization
- React.memo for expensive components
- Efficient re-rendering strategies
- Minimal state updates
- Optimized event handlers

### 3. Bundle Size
- Tree-shaking for unused code
- Efficient imports
- Minimal external dependencies
- Code splitting opportunities

## Security Considerations

### 1. Input Sanitization
- URL validation prevents XSS
- Shortcode character restrictions
- Input length limitations
- HTML encoding for display

### 2. Data Privacy
- Client-side only storage
- No data transmission
- User-controlled data retention
- Clear data ownership

### 3. URL Safety
- Protocol validation
- Malicious URL detection
- Safe redirect practices
- User awareness of destinations

## Scalability Limitations

### 1. Storage Constraints
- localStorage size limits
- Single-device accessibility
- No data synchronization
- Manual backup/restore

### 2. Performance Limits
- Linear search operations
- Memory usage growth
- Browser-specific limitations
- No server-side optimization

### 3. Feature Constraints
- No real-time collaboration
- No advanced analytics
- No bulk operations
- No API integrations

## Technology Choices Justification

### 1. React 18 + TypeScript
- **Pros**: Type safety, modern React features, excellent tooling
- **Cons**: Learning curve, build complexity
- **Decision**: Industry standard with excellent developer experience

### 2. localStorage vs IndexedDB
- **Pros**: Simple API, synchronous operations, wide support
- **Cons**: Size limitations, string-only storage
- **Decision**: Sufficient for application requirements, faster development

### 3. React Router Dom
- **Pros**: Standard routing solution, dynamic route support
- **Cons**: Client-side only, SEO limitations
- **Decision**: Perfect fit for SPA requirements

### 4. Tailwind CSS
- **Pros**: Utility-first, consistent design, small bundle
- **Cons**: Learning curve, HTML verbosity
- **Decision**: Rapid development with consistent styling

### 5. Lucide React Icons
- **Pros**: Consistent design, tree-shakeable, lightweight
- **Cons**: Limited icon set
- **Decision**: Modern, clean icons that match design aesthetic