# User Guide

## Getting Started

### System Requirements
- Modern web browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- JavaScript enabled
- localStorage support (enabled by default in all modern browsers)
- Minimum 10MB available storage space

### Accessing the Application
1. Open your web browser
2. Navigate to `http://localhost:3000`
3. The application will load automatically

### First Time Setup
No setup required! The application works immediately upon loading. All data is stored locally in your browser.

## Main Features

### 1. URL Shortening

#### Creating Short URLs

**Single URL Shortening:**
1. Navigate to the home page (`/`)
2. Enter your long URL in the "Original URL" field
3. Optionally set a validity period (default: 30 minutes)
4. Optionally enter a preferred shortcode
5. Click "Shorten URLs"

**Batch URL Shortening (up to 5 URLs):**
1. Click "Add URL" to create additional input forms
2. Fill in each URL form with your desired settings
3. Click "Shorten URLs" to process all URLs at once
4. Remove unwanted forms using the minus (-) button

#### Input Fields Explained

**Original URL** (Required)
- Enter the full URL you want to shorten
- Examples: `https://example.com`, `http://very-long-domain-name.com/path/to/page`
- The system will automatically add `https://` if no protocol is specified

**Validity Period** (Optional)
- Set how long the short URL should remain active
- Measured in minutes (default: 30 minutes)
- Range: 1 minute to 525,600 minutes (1 year)
- After expiration, the short URL will show an error page

**Preferred Shortcode** (Optional)
- Choose your own custom shortcode
- Must be 4-10 characters long
- Only letters and numbers allowed (no spaces or special characters)
- Must be unique (system will warn if already taken)
- If left empty, a random code will be generated

#### Understanding Results

After successful shortening, you'll see:
- **Short URL**: The new shortened link (e.g., `localhost:3000/abc123`)
- **Expiry Date**: When the link will stop working
- **Copy Button**: Click to copy the short URL to your clipboard

### 2. Using Short URLs

#### Accessing Short URLs
1. Copy the provided short URL
2. Paste it into any browser's address bar
3. Press Enter to navigate

#### What Happens When You Visit a Short URL
1. **Valid URL**: You'll see a "Redirecting..." message, then automatically go to the original URL
2. **Expired URL**: You'll see an "Link Expired" error page
3. **Invalid URL**: You'll see a "Link Not Found" error page

#### Click Tracking
Every time someone visits your short URL:
- A click event is recorded with timestamp
- Simulated traffic source is assigned (e.g., "Direct", "Social Media")
- Simulated geographical region is recorded (e.g., "North America", "Europe")

### 3. Statistics and Analytics

#### Accessing Statistics
1. Click "Statistics" in the top navigation
2. View all your created URLs and their performance data

#### Understanding the Statistics Dashboard

**Summary Cards:**
- **Total URLs**: Number of short URLs you've created
- **Active URLs**: URLs that haven't expired yet
- **Expired URLs**: URLs that are no longer functional
- **Total Clicks**: Combined clicks across all your URLs

**Individual URL Cards:**
Each URL shows:
- Short URL (clickable to test)
- Original URL
- Creation and expiry dates
- Total click count
- Unique sources and regions that clicked
- Expand button for detailed click data

**Detailed Click Data:**
Click the expand button (down arrow) to see:
- Complete list of all clicks
- Timestamp of each click
- Traffic source for each click
- Geographical region for each click
- Sorted by most recent first

### 4. Navigation

#### Main Navigation Menu
- **Shorten URLs**: Create new short URLs (home page)
- **Statistics**: View analytics for all your URLs

#### URL Structure
- `localhost:3000/` - Home page (URL shortening)
- `localhost:3000/stats` - Statistics dashboard
- `localhost:3000/{shortcode}` - Redirect to original URL

## Tips and Best Practices

### Creating Effective Short URLs

**Choose Memorable Shortcodes:**
- Use relevant abbreviations (e.g., "blog2024" for a blog post)
- Avoid confusing characters (0 vs O, 1 vs l)
- Keep it short but meaningful

**Set Appropriate Expiry Times:**
- **Social Media Posts**: 1-7 days
- **Email Campaigns**: 30-90 days
- **Permanent Links**: 1 year (maximum)
- **Temporary Shares**: 1-24 hours

**Batch Processing:**
- Group related URLs together for easier management
- Use consistent naming patterns for shortcodes
- Process multiple URLs at once to save time

### Managing Your URLs

**Regular Cleanup:**
- Review expired URLs periodically
- Check statistics to identify popular content
- Remove or recreate expired URLs as needed

**Monitoring Performance:**
- Check click counts to measure engagement
- Analyze traffic sources to understand your audience
- Use geographical data to target content

**Backup Considerations:**
- URLs are stored only in your browser
- Clear browser data will delete all URLs
- Consider manually backing up important URLs

## Troubleshooting

### Common Issues

**"URL is required" Error:**
- Make sure you've entered a URL in the Original URL field
- Check that the URL is not just spaces

**"Please enter a valid URL" Error:**
- Ensure your URL includes a domain (e.g., example.com)
- Check for typos in the URL
- Make sure the URL format is correct

**"This shortcode is already taken" Error:**
- Choose a different custom shortcode
- Leave the shortcode field empty for auto-generation
- Try adding numbers or letters to make it unique

**"Link Not Found" Error:**
- Check that you've typed the short URL correctly
- Verify the shortcode exists in your Statistics page
- The URL may have been deleted

**"Link Expired" Error:**
- The URL has passed its expiry date
- Create a new short URL for the same destination
- Check the Statistics page for the original expiry date

### Browser Compatibility Issues

**Application Won't Load:**
- Ensure JavaScript is enabled
- Try refreshing the page
- Clear browser cache and reload
- Check browser console for error messages

**Data Not Saving:**
- Verify localStorage is enabled
- Check available storage space
- Try in an incognito/private window
- Disable browser extensions that might interfere

**Redirects Not Working:**
- Check that the original URL is accessible
- Verify the URL includes http:// or https://
- Test the original URL directly in a new tab

### Performance Issues

**Slow Loading:**
- Clear browser cache
- Close unnecessary browser tabs
- Check available system memory
- Try in a different browser

**Statistics Page Slow:**
- Large numbers of clicks can slow loading
- Consider clearing old log data
- Refresh the page if it becomes unresponsive

## Data Management

### Understanding Data Storage

**What's Stored:**
- All shortened URLs and their details
- Click tracking data for analytics
- Application logs for debugging
- User preferences and settings

**Where It's Stored:**
- Locally in your browser's localStorage
- No data is sent to external servers
- Data remains on your device only

**Storage Limitations:**
- Approximately 5-10MB total storage available
- Automatic log rotation prevents unlimited growth
- Browser may clear data if storage is full

### Data Privacy

**Your Data is Private:**
- No data collection by external services
- No tracking cookies or analytics
- All processing happens in your browser
- No account creation or personal information required

**Data Sharing:**
- URLs are only accessible from your device/browser
- No sharing between devices or users
- No cloud synchronization
- Complete user control over data

### Backup and Recovery

**Manual Backup:**
1. Open browser developer tools (F12)
2. Go to Application/Storage tab
3. Find localStorage entries for the application
4. Copy the data for manual backup

**Data Recovery:**
- No automatic recovery options
- Clearing browser data permanently deletes URLs
- No cloud backup or sync available
- Consider external documentation for important URLs

## Advanced Usage

### Power User Tips

**Keyboard Shortcuts:**
- Tab through form fields efficiently
- Enter to submit forms
- Escape to close expanded statistics

**URL Patterns:**
- Use consistent shortcode patterns for organization
- Group related URLs with similar prefixes
- Document your shortcode conventions

**Analytics Insights:**
- Monitor click patterns to optimize content timing
- Use geographical data for regional content strategies
- Track source effectiveness for marketing campaigns

### Integration Ideas

**Social Media:**
- Create short URLs for social media posts
- Track engagement across platforms
- Use memorable shortcodes for campaigns

**Email Marketing:**
- Shorten long URLs for cleaner emails
- Track click-through rates
- Set appropriate expiry dates for campaigns

**Content Management:**
- Create short URLs for frequently shared content
- Use analytics to identify popular resources
- Maintain a library of permanent short URLs

### Limitations to Consider

**Single Device Access:**
- URLs only work from the creating device
- No multi-device synchronization
- Consider this for team/shared usage

**No Real-Time Collaboration:**
- Each user has their own URL collection
- No sharing between browsers or users
- Plan accordingly for team projects

**Analytics Limitations:**
- Simulated data for sources and geography
- No real-time visitor tracking
- Basic click counting only

## Support and Resources

### Getting Help

**Self-Service Options:**
- Review this user guide
- Check the troubleshooting section
- Examine browser console for errors
- Try the application in incognito mode

**Common Solutions:**
- Refresh the page for temporary issues
- Clear browser cache for persistent problems
- Check browser compatibility requirements
- Verify JavaScript and localStorage are enabled

### Best Practices Summary

1. **Plan Your URLs**: Think about expiry dates and shortcodes before creating
2. **Monitor Performance**: Regularly check statistics for insights
3. **Maintain Organization**: Use consistent naming patterns
4. **Consider Privacy**: Remember data stays on your device only
5. **Backup Important URLs**: Document critical short URLs externally
6. **Test Before Sharing**: Verify short URLs work before distributing
7. **Set Realistic Expiry Dates**: Balance accessibility with security
8. **Use Meaningful Shortcodes**: Make them memorable and relevant