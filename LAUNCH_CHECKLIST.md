# Launch Checklist

## Pre-Launch

- [ ] All environment variables set in Vercel dashboard
- [ ] Supabase project configured with production URL
- [ ] Stripe products and prices created (Pro + Premium, monthly + yearly)
- [ ] Stripe webhook endpoint configured for production URL
- [ ] Custom domain configured and DNS propagated
- [ ] SSL certificate active
- [ ] PWA manifest loads correctly (DevTools → Application)
- [ ] Service worker registers successfully
- [ ] OG image renders at `/opengraph-image`
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Robots.txt accessible at `/robots.txt`
- [ ] Terms of Service reviewed and finalized
- [ ] Privacy Policy reviewed and finalized
- [ ] All landing page sections render correctly
- [ ] Mobile responsive tested at 375px
- [ ] Dark mode works across all pages
- [ ] Authentication flow works end-to-end (signup → onboarding → dashboard)
- [ ] Stripe checkout flow works (upgrade → payment → webhook → tier update)
- [ ] Error boundaries catch errors gracefully
- [ ] Loading skeletons display during data fetches

## Launch Day

- [ ] Deploy to production via Vercel
- [ ] Verify production URL loads correctly
- [ ] Test signup flow on production
- [ ] Test Stripe payment on production (use test card if still in test mode)
- [ ] Verify email delivery (magic links, notifications)
- [ ] Check Vercel Analytics for any errors
- [ ] Share on social media / Product Hunt / relevant communities

## Post-Launch

- [ ] Monitor error rates in Vercel dashboard
- [ ] Monitor Stripe webhook delivery
- [ ] Check Supabase connection pool usage
- [ ] Gather user feedback from early adopters
- [ ] Set up uptime monitoring
- [ ] Review and respond to user support requests
- [ ] Plan iteration based on user feedback
