# Workout Plan Automation API - Testing Guide

## 🎉 What's Been Built

A complete workout plan automation system that:
1. ✅ Receives webhooks from Airtable
2. ✅ Generates personalized workout plans with Claude AI
3. ✅ Sends beautiful HTML emails via Resend
4. ✅ Updates Airtable records with status and plan

## 📁 Files Created

### 1. API Endpoint
**Location:** `/frontend/app/api/airtable-webhook/route.ts`
- Complete webhook handler
- 5 helper functions (parse, generate, convert, email, update)
- Comprehensive error handling
- Detailed console logging

### 2. Environment Variables
**Location:** `/frontend/.env.local` (NOT committed to git)
- ANTHROPIC_API_KEY
- RESEND_API_KEY
- AIRTABLE_API_KEY
- AIRTABLE_BASE_ID
- AIRTABLE_TABLE_ID

### 3. Dependencies Added
- `@anthropic-ai/sdk` - Claude AI integration
- `resend` - Email delivery
- `airtable` - Airtable API

## 🚀 How to Start the Server

```bash
# From the root directory
npm run dev

# Or from the frontend directory
cd frontend
npm run dev
```

The API will be available at: `http://localhost:3000/api/airtable-webhook`

## 🧪 Testing the API

### Option 1: Test with cURL

```bash
curl -X POST http://localhost:3000/api/airtable-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "recordId": "recTEST123",
    "name": "John Doe",
    "email": "your-test-email@example.com",
    "age": "25",
    "weight": "180",
    "height": "6'\''0\"",
    "goal": "Lose weight",
    "experience": "Beginner",
    "availability": "3-4 days per week",
    "equipment": "Gym access",
    "dietary_restrictions": "None",
    "injuries": "None"
  }'
```

### Option 2: Test with Postman/Insomnia

**Method:** POST
**URL:** `http://localhost:3000/api/airtable-webhook`
**Headers:** `Content-Type: application/json`
**Body:** (Use the JSON from Option 1)

### Option 3: Test with Airtable Automation

1. Go to your Airtable base
2. Create an Automation
3. **Trigger:** When record matches conditions (e.g., Status = "Pending")
4. **Action:** Send to webhook
   - **URL:** `https://your-domain.com/api/airtable-webhook`
   - **Method:** POST
   - **Body:** Map fields to JSON structure

Example webhook body in Airtable:
```json
{
  "recordId": "{Record ID}",
  "name": "{Name}",
  "email": "{Email}",
  "age": "{Age}",
  "weight": "{Weight}",
  "height": "{Height}",
  "goal": "{Goal}",
  "experience": "{Experience Level}",
  "availability": "{Weekly Availability}",
  "equipment": "{Equipment Access}",
  "dietary_restrictions": "{Dietary Restrictions}",
  "injuries": "{Injuries/Limitations}"
}
```

## 📧 What Happens When You Test

1. **Console Logs:** Watch your terminal for detailed logs:
   ```
   🚀 AIRTABLE WEBHOOK RECEIVED
   📥 Parsing Airtable webhook data...
   ✅ Parsed data for: John Doe
   🤖 Generating workout plan with Claude AI...
   ✅ Generated 3500 characters of workout plan
   🎨 Converting markdown to HTML...
   📧 Sending email to john@example.com...
   ✅ Email sent successfully!
   📝 Updating Airtable record...
   ✅ Airtable record updated successfully
   ✅ WORKFLOW COMPLETED SUCCESSFULLY
   ```

2. **Email Delivery:** Check the email inbox for:
   - Subject: "{Name}, Your Personalized Unweighted Plan is Ready! 🚀"
   - Professional HTML email with Unweighted branding
   - Complete workout plan with 4 weeks of exercises
   - Nutrition plan with macros
   - 5 simple recipes
   - Progress tracking guide

3. **Airtable Update:** The record will be updated with:
   - **Plan Generated:** Full text of the plan
   - **Status:** "Sent"
   - **Sent At:** Timestamp

## 🔍 Testing Checklist

- [ ] Start the dev server (`npm run dev`)
- [ ] Test the GET endpoint (`http://localhost:3000/api/airtable-webhook`)
- [ ] Send a test POST request with sample data
- [ ] Verify console logs show all steps completing
- [ ] Check email inbox for the plan
- [ ] Verify Airtable record is updated
- [ ] Test with different user profiles (muscle gain, athlete, etc.)
- [ ] Test error handling (missing fields, invalid data)
- [ ] Test with real Airtable automation

## 🐛 Troubleshooting

### Error: "Missing required fields"
- Ensure recordId, name, email, and goal are included in the request

### Error: "Failed to generate workout plan"
- Check ANTHROPIC_API_KEY is valid
- Verify Claude API quota/limits

### Error: "Failed to send email"
- Check RESEND_API_KEY is valid
- Verify sender domain (plans@unweighted.fit) is configured in Resend
- Check email address format

### Error: "Failed to update Airtable"
- Check AIRTABLE_API_KEY, AIRTABLE_BASE_ID, and AIRTABLE_TABLE_ID
- Verify field names match exactly (case-sensitive):
  - "Plan Generated"
  - "Status"
  - "Sent At"

### No logs appearing
- Ensure you're running `npm run dev` from the correct directory
- Check that .env.local is in the frontend directory
- Restart the dev server

## 🌐 Deploying to Production

### 1. Vercel (Recommended)
```bash
# Deploy the frontend
cd frontend
vercel
```

Add environment variables in Vercel dashboard:
- ANTHROPIC_API_KEY
- RESEND_API_KEY
- AIRTABLE_API_KEY
- AIRTABLE_BASE_ID
- AIRTABLE_TABLE_ID

### 2. Update Airtable Webhook URL
Replace `http://localhost:3000` with your production URL:
`https://your-domain.vercel.app/api/airtable-webhook`

## 📊 Expected Response Format

### Success (200)
```json
{
  "success": true,
  "message": "Workout plan generated and sent successfully",
  "recordId": "recXXXXX",
  "emailSent": true
}
```

### Error (500)
```json
{
  "success": false,
  "error": "Error message here",
  "timestamp": "2025-11-03T22:30:00.000Z"
}
```

## 🎨 Email Features

- **Mobile Responsive:** Looks great on all devices
- **Professional Design:** Navy (#1A1F3A) and Red (#FF4458) branding
- **Clear Typography:** Easy to read with proper hierarchy
- **Structured Content:**
  - Welcome message
  - 4-week workout plan
  - Nutrition plan with macros
  - 5 simple recipes
  - Progress tracking guide
  - Personalized tips
  - Motivation section
- **Call to Action:** Link back to unweighted.fit
- **Professional Footer:** Contact info and branding

## 🔐 Security Notes

- ✅ .env.local is in .gitignore (API keys not committed)
- ✅ Environment variables loaded securely
- ✅ Input validation on webhook data
- ✅ Error messages don't expose sensitive data

## 📝 Next Steps

1. **Test locally** with the cURL command above
2. **Verify email delivery** works
3. **Check Airtable updates** are correct
4. **Deploy to Vercel** for production use
5. **Configure Airtable automation** to use production URL
6. **Monitor logs** for any issues

## 🆘 Need Help?

Check the console logs - they're very detailed and will show you exactly where any issues occur. Each step logs its progress with clear emojis and messages.

---

**Built with:** Next.js 16, Claude Sonnet 4, Resend, Airtable API
**Status:** ✅ Ready to test and deploy
