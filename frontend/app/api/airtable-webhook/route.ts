import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';
import Airtable from 'airtable';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse and validate webhook data from Airtable
 */
function parseAirtableWebhook(body: any) {
  console.log('📥 Parsing Airtable webhook data...');

  const requiredFields = ['recordId', 'name', 'email', 'goal'];
  const missingFields = requiredFields.filter(field => !body[field]);

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  const userData = {
    recordId: body.recordId,
    name: body.name,
    email: body.email,
    age: body.age || 'Not specified',
    weight: body.weight || 'Not specified',
    height: body.height || 'Not specified',
    goal: body.goal,
    experience: body.experience || 'Beginner',
    availability: body.availability || '3-4 days per week',
    equipment: body.equipment || 'Gym access',
    dietary_restrictions: body.dietary_restrictions || 'None',
    injuries: body.injuries || 'None',
  };

  console.log(`✅ Parsed data for: ${userData.name} (${userData.email})`);
  return userData;
}

/**
 * Generate personalized workout plan using Claude AI
 */
async function generateWorkoutPlan(anthropic: Anthropic, userData: any) {
  console.log('🤖 Generating workout plan with Claude AI...');

  const prompt = `You are an expert fitness coach and nutritionist. Create a comprehensive, personalized workout and meal plan.

USER PROFILE:
- Name: ${userData.name}
- Age: ${userData.age}
- Current Weight: ${userData.weight}
- Height: ${userData.height}
- Primary Goal: ${userData.goal}
- Experience Level: ${userData.experience}
- Weekly Availability: ${userData.availability}
- Equipment Access: ${userData.equipment}
- Dietary Restrictions: ${userData.dietary_restrictions}
- Injuries/Limitations: ${userData.injuries}

CREATE A COMPLETE PLAN WITH:

# YOUR PERSONALIZED UNWEIGHTED PLAN

## Welcome, ${userData.name}!

[Write a personalized 2-3 sentence introduction addressing their specific goal and experience level]

## YOUR 4-WEEK WORKOUT PLAN

Create a detailed 4-week progressive workout plan:

### Week 1: Foundation Building
**Monday - [Workout Type]:**
- Exercise 1: [Name] - [Sets] x [Reps] - [Rest period]
  Form cue: [Specific instruction]
- Exercise 2: [Name] - [Sets] x [Reps] - [Rest period]
  Form cue: [Specific instruction]
[Continue for 4-6 exercises]

**Wednesday - [Workout Type]:**
[Same structure]

**Friday - [Workout Type]:**
[Same structure]

[Repeat for Weeks 2, 3, 4 with progressive overload]

## YOUR NUTRITION PLAN

**Calculated Macros:**
- TDEE: [Calculate based on stats] calories
- Goal Calories: [Adjust for goal] calories/day
- Protein: [Amount]g (40%)
- Carbs: [Amount]g (35%)
- Fats: [Amount]g (25%)

**Sample Day:**
Breakfast (7-8 AM): [Specific meal] - [Calories] cal, [P]g/[C]g/[F]g
Snack (10 AM): [Specific snack]
Lunch (12-1 PM): [Specific meal] - [Calories] cal, [P]g/[C]g/[F]g
Snack (3 PM): [Specific snack]
Dinner (6-7 PM): [Specific meal] - [Calories] cal, [P]g/[C]g/[F]g

## 5 SIMPLE RECIPES

### Recipe 1: [Name]
**Prep Time:** [X] min | **Servings:** [X] | **Macros per serving:** [P]g/[C]g/[F]g

**Ingredients:**
- [Ingredient 1] - [Amount]
- [Ingredient 2] - [Amount]
[Max 7 ingredients]

**Instructions:**
1. [Step 1]
2. [Step 2]
[Keep under 5 steps]

[Repeat for 5 recipes]

## WEEKLY PROGRESS TRACKING

**Measurements to Track:**
- Weight (Monday mornings, same conditions)
- Body measurements (chest, waist, hips) - weekly
- Progress photos (front, side, back) - weekly
- Energy levels (1-10 scale) - daily
- Workout performance (weights/reps) - each session

**Weekly Check-In Questions:**
1. How did you feel this week?
2. Which workouts felt best?
3. Any struggles with nutrition?
4. Sleep quality (1-10)?
5. Stress levels (1-10)?

**When to Adjust:**
- If no progress after 2 weeks: reduce calories by 200
- If losing too fast (>2 lbs/week): increase calories by 200
- If workouts too easy: increase weight by 5-10%
- If too fatigued: add rest day or reduce volume

## YOUR PERSONALIZED TIPS

[Write 4-5 specific tips addressing their goal, experience level, and equipment. Make it motivational but realistic]

## WHAT TO EXPECT

**Week 1:** Adaptation phase. Focus on form. Expect soreness.
**Week 2:** Starting to feel stronger. Groove is forming.
**Week 3:** Noticeable improvements in energy and strength.
**Week 4:** Significant progress. Ready to level up.

## FINAL MOTIVATION

[Write 2-3 sentences of personalized encouragement specific to their journey]

Remember: Progress isn't linear. Trust the process. You've got this! 💪

Questions? Reply to this email anytime.

- The Unweighted Team`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const plan = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log(`✅ Generated ${plan.length} characters of workout plan`);
    return plan;
  } catch (error) {
    console.error('❌ Error generating plan with Claude:', error);
    throw new Error(`Failed to generate workout plan: ${error}`);
  }
}

/**
 * Convert markdown to HTML with professional styling
 */
function convertMarkdownToHTML(markdown: string): string {
  console.log('🎨 Converting markdown to HTML...');

  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3 style="color: #1A1F3A; font-size: 18px; font-weight: 600; margin: 24px 0 12px 0;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="color: #1A1F3A; font-size: 22px; font-weight: 700; margin: 32px 0 16px 0; border-bottom: 2px solid #FF4458; padding-bottom: 8px;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="color: #1A1F3A; font-size: 28px; font-weight: 800; margin: 24px 0 20px 0;">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong style="font-weight: 700; color: #1A1F3A;">$1</strong>')
    // Lists
    .replace(/^\- (.*$)/gim, '<li style="margin: 8px 0; line-height: 1.6;">$1</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p style="margin: 12px 0; line-height: 1.7; color: #333;">')
    .replace(/\n/g, '<br>');

  // Wrap in paragraphs
  html = '<p style="margin: 12px 0; line-height: 1.7; color: #333;">' + html + '</p>';

  // Wrap lists
  html = html.replace(/(<li.*?<\/li>)/gim, '<ul style="padding-left: 24px; margin: 16px 0;">$1</ul>');

  console.log('✅ Converted to HTML');
  return html;
}

/**
 * Send personalized plan via email using Resend
 */
async function sendPlanEmail(resend: Resend, email: string, name: string, plan: string) {
  console.log(`📧 Sending email to ${email}...`);

  const htmlContent = convertMarkdownToHTML(plan);

  const emailHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Personalized Unweighted Plan</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; max-width: 100%;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1A1F3A 0%, #2A3F5F 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 32px; font-weight: 800; margin: 0 0 10px 0; letter-spacing: -0.5px;">
                UNWEIGHTED
              </h1>
              <p style="color: #FF4458; font-size: 14px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 2px;">
                Your Personalized Plan
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <div style="color: #333; font-size: 15px; line-height: 1.7;">
                ${htmlContent}
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 30px 40px 30px; text-align: center;">
              <a href="https://unweighted.fit"
                 style="display: inline-block; background-color: #FF4458; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 700; font-size: 16px; transition: background-color 0.3s;">
                Visit Unweighted.fit
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1A1F3A; padding: 30px; text-align: center;">
              <p style="color: #ffffff; font-size: 14px; margin: 0 0 10px 0;">
                <strong>Questions? Just reply to this email!</strong>
              </p>
              <p style="color: #999; font-size: 12px; margin: 0;">
                © 2025 Unweighted. All rights reserved.
              </p>
              <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                <a href="https://unweighted.fit" style="color: #FF4458; text-decoration: none;">unweighted.fit</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const result = await resend.emails.send({
      from: 'Unweighted <plans@unweighted.fit>',
      to: [email],
      subject: `${name}, Your Personalized Unweighted Plan is Ready! 🚀`,
      html: emailHTML,
    });

    console.log(`✅ Email sent successfully! ID: ${result.data?.id}`);
    return result;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error(`Failed to send email: ${error}`);
  }
}

/**
 * Update Airtable record with generated plan and status
 */
async function updateAirtableRecord(airtableBase: any, recordId: string, plan: string) {
  console.log(`📝 Updating Airtable record ${recordId}...`);

  try {
    const table = airtableBase(process.env.AIRTABLE_TABLE_ID!);

    await table.update(recordId, {
      'Plan Generated': plan,
      'Status': 'Sent',
      'Sent At': new Date().toISOString(),
    });

    console.log('✅ Airtable record updated successfully');
  } catch (error) {
    console.error('❌ Error updating Airtable:', error);
    throw new Error(`Failed to update Airtable: ${error}`);
  }
}

// ============================================================================
// MAIN WEBHOOK HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  console.log('\n🚀 ========================================');
  console.log('🚀 AIRTABLE WEBHOOK RECEIVED');
  console.log('🚀 ========================================\n');

  try {
    // Validate environment variables
    const requiredEnvVars = {
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
      AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
      AIRTABLE_TABLE_ID: process.env.AIRTABLE_TABLE_ID,
    };

    for (const [key, value] of Object.entries(requiredEnvVars)) {
      if (!value) {
        console.error(`❌ Missing environment variable: ${key}`);
        return NextResponse.json({
          success: false,
          error: `Server configuration error: Missing ${key}`,
        }, { status: 500 });
      }
    }

    // Initialize API clients (only runs at request time, not build time)
    console.log('🔧 Initializing API clients...');
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    const resend = new Resend(process.env.RESEND_API_KEY!);

    const airtableBase = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY!,
    }).base(process.env.AIRTABLE_BASE_ID!);

    console.log('✅ API clients initialized successfully');

    // Parse request body
    const body = await request.json();
    console.log('📦 Webhook payload:', JSON.stringify(body, null, 2));

    // Step 1: Parse and validate webhook data
    const userData = parseAirtableWebhook(body);

    // Step 2: Generate workout plan with Claude
    const plan = await generateWorkoutPlan(anthropic, userData);

    if (!plan || plan.trim().length === 0) {
      throw new Error('Generated plan is empty');
    }

    // Step 3: Send email with the plan
    await sendPlanEmail(resend, userData.email, userData.name, plan);

    // Step 4: Update Airtable record
    await updateAirtableRecord(airtableBase, userData.recordId, plan);

    console.log('\n✅ ========================================');
    console.log('✅ WORKFLOW COMPLETED SUCCESSFULLY');
    console.log('✅ ========================================\n');

    return NextResponse.json({
      success: true,
      message: 'Workout plan generated and sent successfully',
      recordId: userData.recordId,
      emailSent: true,
    }, { status: 200 });

  } catch (error: any) {
    console.error('\n❌ ========================================');
    console.error('❌ WORKFLOW FAILED');
    console.error('❌ Error:', error.message);
    console.error('❌ Stack:', error.stack);
    console.error('❌ ========================================\n');

    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({
    message: 'Unweighted Airtable Webhook Endpoint',
    status: 'active',
    version: '1.0.0',
    endpoints: {
      POST: 'Receive webhook from Airtable and generate workout plan',
    },
  }, { status: 200 });
}
