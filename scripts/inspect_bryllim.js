const fs = require('fs');
const html = fs.readFileSync('C:/Users/ASUS/.gemini/antigravity/brain/a62760da-fe80-4ad1-be0a-24521dd59d09/scratch/bryllim.html', 'utf8');

// Title and meta description
const title = html.match(/<title>([^<]+)<\/title>/i);
console.log('Title:', title ? title[1] : 'none');

// Look for CSS stylesheets
const cssLinks = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi)].map(m => m[0]);
console.log('CSS links:', cssLinks);

// Look for inline styles or Next.js / Tailwind classes
const hasNext = html.includes('__NEXT_DATA__') || html.includes('_next/');
console.log('Is Next.js:', hasNext);

// Find style tags
const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]);
console.log('Style blocks count:', styleBlocks.length);

if (styleBlocks.length > 0) {
  fs.writeFileSync('C:/Users/ASUS/.gemini/antigravity/brain/a62760da-fe80-4ad1-be0a-24521dd59d09/scratch/bryllim_styles.css', styleBlocks.join('\n\n'));
  console.log('Wrote bryllim_styles.css');
}

// Check sample classes used in HTML
const classes = [...html.matchAll(/class="([^"]+)"/g)].map(m => m[1]).slice(0, 30);
console.log('Sample classes:');
console.log(classes.slice(0, 15));
