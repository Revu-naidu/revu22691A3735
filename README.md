# Client-Side React URL Shortener

A fully functional, responsive URL shortener built with React that operates entirely client-side using localStorage for data persistence.

##  Features

- **URL Shortening**: Create short URLs with custom or auto-generated codes
- **Batch Processing**: Shorten up to 5 URLs simultaneously
- **Analytics**: Detailed click tracking with simulated sources and geographical data
- **Expiration Management**: Set custom validity periods for URLs
- **Client-Side Storage**: All data persists in browser's localStorage
- **Custom Logging**: Comprehensive logging middleware (no console.log usage)
- **Responsive Design**: Works seamlessly on mobile and desktop

##  Architecture

### Data Model
```typescript
interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  creationDate: number;
  expiryDate: number | null;
  clicks: ClickEvent[];
}

interface ClickEvent {
  timestamp: number;
  source: string; // Simulated: "Direct", "Social Media", etc.
  geo: string;    // Simulated: "North America", "Europe", etc.
}
```

### Core Components

1. **Logging Middleware** (`useLogger`)
   - Custom hook for application-wide logging
   - Stores logs in localStorage with structured format
   - Captures all significant events and errors

2. **Data Store** (`useDataStore`)
   - Singleton pattern for data management
   - localStorage-based persistence
   - CRUD operations for URL objects

3. **Validation System** (`useValidation`)
   - Comprehensive URL format validation
   - Validity period constraints
   - Shortcode uniqueness checks

4. **Shortcode Generator** (`useShortcodeGenerator`)
   - Unique 6-8 character alphanumeric code generation
   - Collision detection and resolution
   - Support for custom preferred codes

### Technology Stack

- **React 18** with TypeScript
- **React Router Dom** for navigation and dynamic routing
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** as build tool

### Routing Strategy

- `/` - Main URL shortening interface
- `/stats` - Analytics and statistics dashboard
- `/:shortcode` - Dynamic redirect routes for shortened URLs

The application uses React Router's dynamic routing to handle shortcode redirects. When a user visits `/{shortcode}`, the app:
1. Extracts the shortcode from the URL parameter
2. Looks up the URL in localStorage
3. Checks expiration status
4. Records click analytics
5. Redirects to the original URL

##  Key Implementation Details

### Assumptions Made

1. **Click Simulation**: Since this is client-side only, click sources and geographical data are randomly generated from predefined lists
2. **No Backend**: All data persistence uses localStorage, limiting storage to ~5-10MB
3. **Single Device**: URLs are only accessible from the device/browser where they were created
4. **Basic Analytics**: Click tracking is simulated but follows realistic patterns

### Design Decisions

1. **localStorage over IndexedDB**: Chosen for simplicity and speed, suitable for the expected data volume
2. **Singleton Pattern**: Used for DataStore and Logger to ensure consistent state management
3. **Custom Logging**: Implemented instead of console.log to provide structured, reviewable logs
4. **Component Isolation**: Each component has a single responsibility with clear data flow

##  Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Access the application at `http://localhost:3000`

##  Usage

1. **Create Short URLs**:
   - Enter original URL(s)
   - Set validity period (default: 30 minutes)
   - Optionally specify custom shortcode
   - Click "Shorten URLs"

2. **View Analytics**:
   - Navigate to Statistics page
   - View all created URLs with click counts
   - Expand individual URLs for detailed click data

3. **Use Short URLs**:
   - Visit `localhost:3000/{shortcode}` to redirect
   - Click events are automatically tracked
   - Expired URLs show appropriate error messages

##  Data Storage

All data is stored in browser's localStorage under two keys:
- `shortened_urls`: Array of ShortenedUrl objects
- `app_logs`: Array of LogEntry objects

Data persists until:
- User clears browser data
- localStorage quota is exceeded
- User manually deletes data

##  Error Handling

- React Error Boundaries for component-level errors
- Try-catch blocks for data operations
- Validation feedback for user inputs
- Graceful degradation for expired/missing URLs
- Comprehensive logging for debugging

## Future Enhancements

- QR code generation for short URLs
- Bulk URL import/export
- Advanced analytics with charts
- URL categorization and tagging
- Browser extension integration
