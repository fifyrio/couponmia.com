# Holiday Images Generator

This script generates AI-powered holiday-themed sale banners using Replicate API and uploads them to Cloudflare R2.

## Environment Variables Required

```bash
REPLICATE_API_TOKEN=your_replicate_api_token
R2_ACCOUNT_ID=your_cloudflare_account_id  
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_ENDPOINT=pub-xxxxx.r2.dev  # Optional but recommended
```

## Usage

### Generate image for a specific holiday:
```bash
npm run generate:holiday-images black-friday
node scripts/generate-holiday-images.js cyber-monday
```

### Generate images for all holidays:
```bash  
node scripts/generate-holiday-images.js --all
```

### Available holiday slugs:
- `black-friday` - Black Friday
- `cyber-monday` - Cyber Monday  
- `christmas-day` - Christmas Day
- `halloween` - Halloween
- `valentines-day` - Valentine's Day
- `mothers-day` - Mother's Day
- `fathers-day` - Father's Day
- `summer-sale` - Summer Sale
- `winter-sale` - Winter Sale
- And many more...

## What the script does:

1. **Generates Image**: Uses Replicate API with FLUX model to create a holiday-themed sale banner
2. **Downloads Image**: Fetches the generated image
3. **Uploads to R2**: Stores the image in Cloudflare R2 bucket 
4. **Updates Page**: Automatically updates the holiday page template with the new image URL

## Output

- Images are uploaded to: `https://pub-xxxxx.r2.dev/holiday-images/{holiday-slug}-sale-banner.webp`
- The holiday page at `/holidays/[holiday-slug]` automatically displays the generated image
- Images are cached for 1 year with appropriate headers

## Error Handling

- Script validates all required environment variables before running
- Includes retry logic and proper error reporting
- Continues processing other holidays if one fails (when using `--all`)
- Provides detailed success/failure summary

## Rate Limiting

- 2-second delay between API calls when processing all holidays
- Uses optimized settings for faster generation (FLUX-schnell model)
- Generates 19:5 aspect ratio (1520x400) WebP images optimized for wide banners