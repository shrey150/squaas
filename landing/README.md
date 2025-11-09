# SQUAAS Landing Page

Skyrim-themed landing page for **SQUAAS** (SideQuests as a Service).

## Design

- **Theme:** Dark Skyrim aesthetic with gold accents
- **Fonts:** 
  - Cinzel (headlines, titles)
  - Spectral (body text)
- **Colors:**
  - Gold (#C9A961) - primary accent
  - Bronze (#8B6F47) - secondary
  - Dark Brown (#1a0f0a) - background
  - Parchment (#E8DCC4) - text

## Features

- **Hero section** with large video placeholder
- **Experience section** highlighting 4 main features
- **How It Works** - 3-step process
- **Waitlist signup** form
- Fully responsive design
- Ornate borders and Skyrim-style decorative elements

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Deployment

Deploy to Vercel:

```bash
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

## Video Placeholder

The hero section has a placeholder for a video. To add your video:

1. Replace the video placeholder `<div>` with:
   ```tsx
   <video 
     className="w-full h-full object-cover" 
     controls 
     poster="/video-poster.jpg"
   >
     <source src="/your-video.mp4" type="video/mp4" />
   </video>
   ```

2. Add your video file to `/public/your-video.mp4`
3. Add a poster image to `/public/video-poster.jpg`

## Customization

- **Colors:** Edit `app/globals.css` `:root` variables
- **Content:** Edit `app/page.tsx`
- **Fonts:** Modify `app/layout.tsx`
