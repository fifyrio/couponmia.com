/**
 * SVG Placeholder utilities
 * Provides inline SVG placeholders to replace external placeholder services
 */

/**
 * Generate a data URI SVG placeholder
 * @param width - Width of the SVG
 * @param height - Height of the SVG
 * @param text - Optional text to display
 * @param bgColor - Background color (hex without #)
 * @param textColor - Text color (hex without #)
 * @returns Data URI string for use in img src
 */
export function generateSVGPlaceholder(
  width: number,
  height: number,
  text?: string,
  bgColor: string = 'f3f4f6',
  textColor: string = '6b7280'
): string {
  const displayText = text || `${width}×${height}`;
  const fontSize = Math.min(width, height) * 0.15;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#${bgColor}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" 
            fill="#${textColor}" text-anchor="middle" dy=".3em">${displayText}</text>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Common placeholder SVGs used throughout the app
 */
export const PLACEHOLDER_SVGS = {
  // Store logo placeholder (120x60)
  storeLogo: generateSVGPlaceholder(120, 60, 'LOGO', 'f9fafb', '9ca3af'),
  
  // Blog image placeholder (300x200) 
  blogImage: generateSVGPlaceholder(300, 200, 'IMAGE', 'f3f4f6', '6b7280'),
  
  // Generic small placeholder
  small: generateSVGPlaceholder(80, 80, '', 'e5e7eb', '9ca3af'),
  
  // Holiday banner placeholder (1520x400)
  holidayBanner: generateSVGPlaceholder(1520, 400, 'HOLIDAY BANNER', 'f9fafb', '8b5cf6'),
} as const;

/**
 * Get a store logo placeholder SVG
 */
export function getStoreLogoPlaceholder(): string {
  return PLACEHOLDER_SVGS.storeLogo;
}

/**
 * Get a blog image placeholder SVG
 */
export function getBlogImagePlaceholder(): string {
  return PLACEHOLDER_SVGS.blogImage;
}

/**
 * Get a holiday banner placeholder SVG
 */
export function getHolidayBannerPlaceholder(): string {
  return PLACEHOLDER_SVGS.holidayBanner;
}