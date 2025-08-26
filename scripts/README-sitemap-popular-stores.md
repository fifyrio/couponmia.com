# Sitemap Popular Stores Update Script

## Overview

The `update-sitemap-popular-stores.js` script automatically calculates and updates the top 5 most popular stores in the `sitemap.xml` file based on database popularity metrics.

## Features

- **Automatic Popularity Calculation**: Calculates store popularity scores based on multiple factors
- **Database Integration**: Queries Supabase database for real-time store data
- **Sitemap Update**: Automatically updates `public/sitemap.xml` with new top stores
- **Backup Creation**: Creates backup of original sitemap before making changes
- **Integration with Daily Sync**: Integrated into the `sync-today.js` workflow

## Popularity Scoring Algorithm

The script calculates store popularity using the following weighted scoring system:

### Scoring Components (Total: 100 points)

1. **Featured Store Status** (50 points)
   - `is_featured: true` = 50 points
   - `is_featured: false` = 0 points

2. **Active Offers Count** (up to 30 points)
   - 50+ offers = 30 points
   - 30-49 offers = 24 points
   - 20-29 offers = 21 points
   - 15-19 offers = 18 points
   - 10-14 offers = 15 points
   - 5-9 offers = 12 points
   - 3-4 offers = 9 points
   - 2 offers = 6 points
   - 1 offer = 3 points

3. **Rating Score** (up to 15 points)
   - Based on store rating (3.0-4.5 scale)
   - Formula: `Math.min((rating - 3.0) * 10, 15)`

4. **Review Count Score** (up to 5 points)
   - Based on number of reviews
   - Formula: `Math.min(review_count / 100, 5)`

## Usage

### Standalone Execution
```bash
npm run sync:sitemap-popular-stores
```

### As Part of Daily Sync
```bash
npm run sync-today
```

## Script Output

The script provides detailed output including:

- Database query results
- Top 5 stores with their scores and metrics
- Sitemap update confirmation
- Backup file creation
- Execution time

### Example Output
```
🚀 Starting Sitemap Popular Stores Update...
============================================================
📊 Fetching store popularity data from database...
Found 1000 stores in database

🏆 Top 5 Popular Stores:
1. Moglix (moglix) - Score: 100
   Featured: true, Offers: 80, Rating: 4.5
2. Claire's (claire-s) - Score: 99
   Featured: true, Offers: 679, Rating: 4.4
3. clarev (clarev) - Score: 98
   Featured: true, Offers: 74, Rating: 4.3
4. GlobeIn (globein) - Score: 98
   Featured: true, Offers: 51, Rating: 4.3
5. Quill (quill) - Score: 98
   Featured: true, Offers: 52, Rating: 4.3

📝 Updating sitemap.xml with new top stores...
💾 Created backup: /path/to/sitemap.xml.backup
✅ Successfully updated sitemap.xml

🎉 Sitemap update completed successfully in 3.88s
```

## Sitemap Structure

The script updates the "Top 5 Popular Stores" section in `sitemap.xml`:

```xml
  <!-- Top 5 Popular Stores -->
  <url>
    <loc>https://couponmia.com/store/store-alias</loc>
    <lastmod>2025-08-26</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
```

## Integration with sync-today.js

The script is integrated into the daily sync workflow as the final step:

```javascript
{
  name: "Sitemap Popular Stores Update",
  command: "npm run sync:sitemap-popular-stores",
  description: "Update sitemap.xml with top 5 popular stores"
}
```

## Environment Requirements

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- Database access to `stores` table

## Error Handling

- Validates environment variables
- Handles database connection errors
- Creates backup before sitemap modifications
- Provides detailed error messages
- Graceful failure handling

## Backup and Recovery

- Automatically creates `sitemap.xml.backup` before changes
- Original sitemap can be restored from backup if needed
- Backup includes timestamp for version tracking

## Performance

- Optimized database queries
- Efficient XML parsing and generation
- Minimal execution time (typically 3-5 seconds)
- Memory-efficient processing

## Maintenance

- Run daily as part of sync-today workflow
- Monitor script output for any errors
- Review popularity scores periodically
- Update scoring algorithm as needed

## Future Enhancements

Potential improvements:
- Configurable number of top stores
- Additional scoring factors (click tracking, conversion rates)
- Historical popularity trends
- A/B testing for different scoring algorithms
- Automated alerts for significant changes
