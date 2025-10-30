# Unweighted Frontend

Modern Next.js 14 frontend for the Unweighted workout planning platform.

## Features

- **Landing Page**: Hero section, features, FAQ, and waitlist signup
- **Multi-Step Survey**: 10-step personalized fitness questionnaire
- **Plan Display**: Beautiful workout plan visualization with week selection
- **Responsive Design**: Mobile-first, works on all devices
- **Share Functionality**: Every plan gets a unique shareable link
- **Analytics Tracking**: Session-based analytics for user insights

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **React Hooks** - State management

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running (see `/api` folder)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.local .env.local
   # Edit .env.local with your API URL
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

For production, update these to your deployed URLs.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── survey/            # Survey form
│   │   └── page.tsx
│   ├── plan/              # Plan display
│   │   └── [shareToken]/
│   │       └── page.tsx
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── lib/                   # Utilities
│   └── api.ts            # API client
├── components/            # Reusable components
├── public/               # Static assets
└── tailwind.config.ts    # Tailwind configuration
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Configure environment variables:
   - `NEXT_PUBLIC_API_URL` = Your Railway backend URL
   - `NEXT_PUBLIC_FRONTEND_URL` = Your Vercel URL
4. Deploy

### Deploy to Other Platforms

The frontend is a standard Next.js app and can be deployed to:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Self-hosted with `npm start`

## API Integration

The frontend communicates with the backend API through `/lib/api.ts`:

- `submitSurvey(data)` - Submit survey and generate plan
- `getPlan(shareToken)` - Retrieve plan by share token
- `joinWaitlist(data)` - Add email to waitlist
- `trackEvent(eventType, metadata)` - Track analytics events

## Pages

### Landing Page (`/`)
- Hero section with CTA
- Features section
- How it works
- FAQ
- Waitlist signup

### Survey Page (`/survey`)
- 10-step multi-step form
- Progress indicator
- Validation
- Generates plan on completion

### Plan Page (`/plan/[shareToken]`)
- Plan overview with stats
- Week selector
- Workout details with exercises
- Share functionality
- Waitlist CTA

## Customization

### Colors

Edit `tailwind.config.ts` to change the color scheme:

```typescript
theme: {
  extend: {
    colors: {
      primary: { ... }
    }
  }
}
```

### Content

- Landing page copy: `app/page.tsx`
- Survey questions: `app/survey/page.tsx`
- Plan display: `app/plan/[shareToken]/page.tsx`

## Development Tips

- Use `npm run dev` for hot reload
- Check browser console for API errors
- Session ID is stored in sessionStorage for analytics
- Plans are fetched server-side for SEO

## Support

For issues or questions, please open an issue on GitHub.
