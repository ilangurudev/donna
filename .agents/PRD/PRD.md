# Product Requirements Document: Donna - AI-Native Life Operating System

## Executive Summary

**Product Name:** Donna

**Vision:** Build the first truly AI-native Life OS that eliminates the maintenance burden plaguing traditional productivity systems by using autonomous intelligence to maintain structure, surface insights, and enable natural interaction—without requiring users to sacrifice data sovereignty.

**Core Insight:** Current Life OS systems fail not because users lack discipline, but because the systems demand unsustainable maintenance (5-9 hours weekly). AI makes it possible to invert this: instead of users maintaining structure for dumb databases, intelligent systems maintain themselves while users focus on actual work.

**Target Users:** Knowledge workers, creators, and professionals who have tried productivity systems (Notion, Obsidian, bullet journaling) but abandoned them due to maintenance overhead. Secondary focus: neurodivergent users for whom traditional systems have 100% abandonment rates.

**Success Metrics:**
- Users capture 10+ items per week through conversation (vs. 0-2 in traditional systems)
- System maintenance time < 30 minutes per week (vs. 5-9 hours currently)
- 60%+ of captured information gets resurfaced proactively (vs. 16% in traditional PKM)
- 70%+ user retention at 90 days (vs. <30% for traditional productivity apps)
- 80%+ of users complete daily check-ins (morning/evening) at least 4 days per week

---

## Product Principles

### 1. Capture > Structure
Users express naturally through voice, text, or images. AI extracts structure. Users never manually categorize, tag, or organize unless they want to.

### 2. Intelligence > Discipline
The system maintains itself. No weekly reviews required. No stale data accumulation. The system stays healthy through autonomous agents, not user habits.

### 3. Conversation > Navigation
Primary interface is conversational. Users ask questions instead of clicking through dashboards. "What should I work on today?" not "check Tasks database filtered by due date."

### 4. Listen Before Advising
The system checks in with the user first—understanding their state, energy, and concerns—before offering recommendations. Insights are earned through dialogue, not dumped unprompted.

### 5. Proactive > Reactive
System surfaces insights before users ask. "You haven't contacted Sarah in 2 weeks and she's blocking 3 tasks" appears automatically, not during manual review.

### 6. Sovereignty > Convenience
Users own their data. Markdown files on their filesystem are source of truth. System works locally-first. AI services can be self-hosted or use user's own API keys.

---

## MVP Scope: The "Intelligent Capture + Daily Rhythm" Core Loop

### What's IN Scope for MVP

The MVP delivers one complete, magical experience: a user engages in natural morning and evening check-ins with Donna, captures thoughts throughout the day, and receives intelligent guidance on what to focus on—all based on understanding their full context and current state.

This requires four core user-facing capabilities:

### 1. Morning Brief - Listen First, Then Guide

**User Experience:**

**Phase 1: Check-in (System listens first)**
- User opens Donna in the morning
- Donna: "Good morning! How are you feeling about today?"
- User responds naturally: "Honestly, pretty tired. Didn't sleep well."
- Donna: "I hear you. What's on your mind this morning?"
- User: "Just worried about the investor meeting coming up. Feel like there's still so much to prepare."

**Phase 2: Pointed Discovery Questions (2-3 max)**
- Donna asks contextual follow-ups based on what user shared:
  - "The investor meeting is Thursday - how prepared do you feel on the pricing model part?"
  - "How much focus time do you think you have today with your energy level?"
  - "Did Sarah ever get back to you about the wireframes?"

**Phase 3: Intelligent Brief (Only after listening)**
- "Okay, based on what you've shared and what I see in your work, here's what I'm thinking for today..."
- Presents 2-3 priorities with reasoning that connects to what user said
- "Since you mentioned feeling low energy, I'm suggesting we start with the Sarah follow-up - it's important but not cognitively heavy. That leaves the pricing model work for when you have more focus time tomorrow."
- User can ask follow-ups, accept recommendations, or adjust

**What Users Experience:**
- Donna checks in with them as a human would
- System listens before prescribing
- Recommendations feel personalized to their current state
- Priorities consider both urgency AND their capacity today
- They feel heard, not just managed

**Key Capabilities:**
- Conversational check-in that adapts to user's response style
- Contextual question generation based on user's state + work context
- Integration of emotional/energy state into planning logic
- Transparent reasoning that references what user shared
- Ability to adjust recommendations based on user feedback

---

### 2. Nightly Debrief - Reflect, Learn, Preview

**User Experience:**

**Phase 1: Reflection Prompt (Open-ended)**
- Donna (evening notification): "How did today go?"
- User: "Pretty good actually. The Sarah conversation went better than expected."
- Donna: "That's great to hear! What felt good today? What didn't?"
- User: "Got Sarah's feedback, that felt productive. But I got pulled into an unexpected design discussion and never touched the pricing model."

**Phase 2: Specific Questions (Adaptive based on their day)**
- Donna asks smart follow-ups:
  - "You mentioned the design discussion was unexpected - is that something that needs to be captured as new work?"
  - "How did Sarah's feedback affect the timeline? Any new tasks?"
  - "The pricing model rolled to tomorrow - with the investor meeting Thursday, does that still feel manageable?"

**Phase 3: Insights & Tomorrow Preview**
- "Here's what I noticed today..."
  - "You completed 2 of 3 priorities - that's solid given the interruption"
  - "The Sarah task is done and she gave feedback that spawns 3 design iterations"
  - "Pricing model is now the critical path item with only 2 days until the meeting"
- "Looking at tomorrow, you have a lighter meeting load and mentioned you slept poorly tonight. Want me to keep tomorrow focused on just the pricing work, or should we tackle those design iterations too?"
- Ends with: "Anything else on your mind before tomorrow?"

**What Users Experience:**
- Reflection happens naturally through conversation
- System learns what happened without manual status updates
- They can process their day verbally/in writing
- Tomorrow's plan adapts based on today's reality
- No guilt about incomplete tasks - system understands context

**Key Capabilities:**
- Conversational reflection that extracts structured updates
- Pattern recognition across days/weeks
- Automatic task status updates based on conversation
- Adaptive planning based on completion patterns
- Emotional intelligence in tone and recommendations

---

### 3. Natural Language Capture (Anytime)

**User Experience:**
- User can capture thoughts anytime throughout the day
- Primary UI is always a conversation interface with text input and voice button
- User says: "I just realized our pricing model should be usage-based with a generous free tier, not seat-based. This could be the differentiator in the market. Need to model out the unit economics."
- System: "Interesting insight. Should this be a task for your investor prep project?"
- User: "Yes, and it's high priority"
- System: "Got it. I've captured this as a high-priority task for investor prep and stored your reasoning about the differentiator angle. I'll make sure it surfaces when you're working on pricing."

**What Users Experience:**
- Speak or type naturally—no forms, no fields, no manual categorization
- System understands context: tasks, people, deadlines, relationships between items
- Immediate confirmation that information was captured correctly
- Opportunity to clarify or add details conversationally
- Voice input works seamlessly (speak while walking, driving, or multitasking)

**Key Capabilities:**
- Accept text or voice input anytime
- Extract entities: tasks, people, projects, deadlines, relationships
- Create appropriate records automatically
- Confirm understanding conversationally
- Allow users to correct or clarify through natural dialogue
- Connect captured information to existing context

---

### 4. Contextual Question Answering (Anytime)

**User Experience:**
- User asks questions naturally throughout the day:
  - "What did Sarah say about the navigation concerns?"
  - "What tasks are blocking the website launch?"
  - "When did I last work on the pricing model?"
  - "Why do my projects tend to run late?"
- System explores user's information dynamically and responds with relevant context
- Answers include not just facts, but insights and patterns

**What Users Experience:**
- Ask questions in natural language—no query syntax to learn
- Get relevant information pulled from all connected context
- Receive insights about patterns across their work
- See connections between items they may have missed
- Get actionable recommendations based on their data

**Key Capabilities:**
- Understand natural language questions about tasks, projects, people, patterns
- Dynamically explore user's information to find answers
- Discover patterns and connections across domains
- Synthesize findings into clear, conversational responses
- Provide reasoning and evidence for insights

---

### What's OUT of Scope for MVP

To ship fast and validate the core concept, we explicitly exclude:

**Not in MVP:**
- Mobile native apps (web-only initially, responsive design)
- Collaboration/multi-user features
- Direct calendar integration (user manually mentions events)
- Email integration
- Habit tracking databases
- Goal hierarchies and OKRs (just tasks and projects)
- Advanced visualizations (graph views, dashboards)
- Plugin/extension system
- Custom AI model training
- Financial tracking
- Health/wellness tracking
- Advanced relationship CRM features beyond basic contact tracking
- Team/shared workspaces
- Advanced security features beyond basic encryption
- Customizable check-in schedules (fixed morning/evening for MVP)

---

## User Flows

### Primary Flow: Daily Rhythm (Morning → Work → Evening)

**Persona:** Alex, a product manager juggling 3 projects, 15 stakeholders, and constant context switching. Tried Notion for 6 weeks but abandoned after missing 3 weekly reviews and watching the system decay.

#### Morning (8:00 AM)

**Opening:**
- Alex opens Donna over coffee
- Donna: "Good morning! How are you feeling about today?"
- Alex: "Bit stressed honestly. Have that investor meeting coming up Thursday."
- Donna: "What's on your mind this morning?"
- Alex: "Just feeling behind on the pricing model prep. And I still haven't heard back from Sarah about the wireframes."

**Discovery Questions:**
- Donna: "The investor meeting is in 2 days - how prepared do you feel on the pricing piece specifically?"
- Alex: "Maybe 40%? I have the framework but haven't run the numbers yet."
- Donna: "Got it. And with Sarah - when did you last reach out to her?"
- Alex: "Sent her the wireframes... maybe 10 days ago?"

**Intelligent Brief:**
- Donna: "Okay, here's what I'm thinking. You have 4 hours of focus time today between meetings. Given that the investor meeting is in 2 days and you're at 40% on pricing, I'd prioritize that work today. The Sarah follow-up is also urgent - it's been 11 days and that's blocking 3 other tasks on the website project.

  My recommendation: Start with a quick message to Sarah (15 min), then dedicate your focus blocks to pricing model work. That gets the blocker cleared and makes real progress on your high-stress item. Sound good?"

- Alex: "Yeah, that makes sense. What should I ask Sarah specifically?"
- Donna: "Based on the wireframes you sent, you were asking for feedback on the navigation structure and the checkout flow. Want me to draft a follow-up message?"

**Value Delivered:**
- Donna listened first, understood Alex's stress and context
- Recommendations considered both urgency and Alex's mental state
- Clear reasoning for prioritization
- Proactive help with next actions

---

#### Throughout Day

**Capture Moment 1 (10:30 AM - after Sarah responds):**
- Alex: "Sarah just replied! She likes the navigation but has concerns about the mobile checkout flow. Says it needs to be simpler. We should probably do 3 design iterations."
- Donna: "Got it. Should I create tasks for those 3 design iterations and link them to the website project?"
- Alex: "Yes, and they need to be done before next week."
- Donna: "Perfect. I'll schedule them across the next few days. Do you want to handle these yourself or should they be assigned to the design team?"
- Alex: "Design team."
- Donna: "Done. I've created 3 tasks for the design team, due next week, connected to your website project. The Sarah blocker is now cleared."

**Capture Moment 2 (2:00 PM - unexpected insight):**
- Alex (voice input while walking): "Just realized in that meeting - our pricing model should be usage-based with a generous free tier, not seat-based. This could be the differentiator. Need to model out the unit economics."
- Donna: "That's a interesting pivot. Should this replace the current pricing work or is it in addition?"
- Alex: "Replace. The seat-based model isn't going to work for our market."
- Donna: "Got it. I'll update your pricing task to focus on usage-based modeling and preserve your reasoning about the differentiator angle. This is still for the Thursday investor meeting?"
- Alex: "Yes, definitely."

**Value Delivered:**
- System adapted to changing reality (new tasks from Sarah feedback)
- Captured insight in the moment without breaking flow
- Understood pivot in approach and updated plans accordingly
- All updates happened through natural conversation

---

#### Evening (7:00 PM)

**Reflection:**
- Donna: "How did today go?"
- Alex: "Pretty productive actually. Got Sarah's feedback and made good progress on pricing."
- Donna: "Nice! What felt good today? What didn't?"
- Alex: "The Sarah stuff felt great - that blocker was stressing me out. Pricing work was good but I only got about 60% through the modeling. Got pulled into an unexpected design review that ate 90 minutes."

**Discovery Questions:**
- Donna: "That design review - is there anything from it that needs to be captured?"
- Alex: "No, it was for someone else's project."
- Donna: "And the pricing model - you're at 60% now. Does that still feel doable before Thursday at 2pm?"
- Alex: "Yeah, I think so. If I can get 3 solid hours tomorrow I'll be in good shape."

**Insights & Preview:**
- Donna: "Here's what I noticed today:
  - You completed 2 of 3 priorities (Sarah follow-up ✓, pricing model partial progress)
  - You cleared a major blocker and created 3 new tasks for the design team
  - Your pricing approach pivoted to usage-based modeling
  - An unexpected meeting ate 90 minutes but you still made meaningful progress

  Looking at tomorrow: You have 5 hours of focus time with only 2 short meetings. Your main priority should be finishing that pricing model - you need about 3 hours and you'll have 5 available. Want me to protect that time and keep everything else off your radar?"

- Alex: "Yes please. Just let me focus on pricing tomorrow."
- Donna: "You got it. Anything else on your mind before tomorrow?"
- Alex: "No, I'm good."
- Donna: "Great. Get some rest - big day tomorrow!"

**Value Delivered:**
- Natural reflection that extracted structured updates
- System understood what happened without manual status updates
- Tomorrow's plan adapts to today's reality (pricing is now sole focus)
- No guilt about partial completion - system understands context
- Alex ends day feeling organized and clear on tomorrow

---

### Secondary Flow: Capture on the Go

**Scenario:** Alex is walking between meetings, has an insight about pricing strategy

1. Alex pulls out phone, opens Donna mobile web
2. Says into voice interface: "I just realized our pricing model should be usage-based with a generous free tier, not seat-based. This could be the differentiator in the market. Need to model out the unit economics."
3. System: "Interesting insight. Should this be a task for your investor prep project?"
4. Alex: "Yes, and it's high priority"
5. System: "Got it. I've captured this as a high-priority task for investor prep and stored your reasoning about the differentiator angle. I'll make sure it surfaces when you're working on pricing."

**What Happened:**
- User captured insight in the moment, hands-free
- System understood context and connections automatically
- Reasoning preserved for later reference
- Task properly prioritized and linked to project

**Value Delivered:**
- Captured insight in the moment, hands-free
- System understood context and connections
- Reasoning preserved for later reference

---

### Tertiary Flow: Answering Novel Questions

**Scenario:** Alex wonders if there's a pattern to project delays

1. Alex asks: "Why do my projects tend to run late?"
2. System explores Alex's information dynamically and discovers:
   - 70% of projects finished 2-4 weeks past deadline
   - Tasks involving external stakeholders took 3x longer
   - Projects with weekly stakeholder check-ins had 90% on-time rate
3. System responds: "Looking at your 6 completed projects, I see a pattern. Projects that ran late (70% of them) had significantly longer wait times for external stakeholder input. The projects that finished on time had weekly stakeholder check-ins scheduled proactively. The data suggests more frequent communication cadence reduces delays."
4. Alex: "Can you show me which current projects have this risk?"
5. System: "Your website redesign and marketplace launch both have external stakeholders but no recurring check-ins scheduled. Want me to suggest a communication plan?"

**What Happened:**
- User asked open-ended analytical question
- System dynamically explored historical data
- Identified meaningful patterns without pre-programmed analysis
- Surfaced actionable insight about current work
- Offered proactive help to prevent future issues

**Value Delivered:**
- Agent discovered insights through dynamic exploration
- Answered question not anticipated in original design
- Provided actionable recommendations based on patterns

---

## Core User Experience Requirements

### Morning Brief Experience

**Must Have:**
- Warm, conversational opening ("How are you feeling about today?")
- Open-ended initial questions before any recommendations
- 2-3 contextual discovery questions maximum
- Brief only appears after user has shared their state
- Clear reasoning that connects to what user shared
- Ability to skip ("Just give me the brief") for rushed mornings

**Design Principles:**
- Listen before advising - never jump straight to priorities
- Questions should feel natural, not like a form
- Recommendations should reference user's stated concerns/energy
- Tone should match user's mood (stressed → supportive, energized → enthusiastic)
- Keep it conversational, not robotic

---

### Nightly Debrief Experience

**Must Have:**
- Reflection prompt that invites open sharing
- Follow-up questions based on what happened today
- Automatic extraction of updates (completions, blockers, new tasks)
- Insights summary that shows system learned from the day
- Tomorrow preview that adapts based on today
- Ends with open-ended "anything else?" to capture loose threads

**Design Principles:**
- Make reflection feel valuable, not like homework
- No guilt about incomplete tasks - system understands reality
- Insights should surprise and delight ("I noticed...")
- Tomorrow's plan should feel collaborative, not prescribed
- User can be brief or detailed - both are valid

---

### Conversational Interface (All Interactions)

**Must Have:**
- Text input with real-time response
- Voice input with transcription
- Streaming responses (show thinking in real-time)
- Conversation history within session
- Ability to ask follow-up questions
- System asks clarifying questions when needed
- Works across all flows (check-ins, capture, questions)

**Design Principles:**
- Feels like talking to a knowledgeable assistant
- No learning curve—just speak naturally
- System guides users to better questions
- Responses are conversational, not robotic
- Tone adapts to context (morning check-in vs. quick capture)

---

### Capture Experience (Anytime)

**Must Have:**
- Multi-turn conversation to capture complex information
- System extracts structure without user input
- Immediate confirmation of what was captured
- Option to correct or clarify
- Works equally well via text or voice
- Accessible from anywhere in the app

**Design Principles:**
- Zero friction—as easy as sending a text message
- Never requires forms, dropdowns, or manual categorization
- System asks smart follow-up questions
- Users can dump brain freely without worrying about structure

---

### Question Answering Experience (Anytime)

**Must Have:**
- Accept natural language questions
- Show reasoning steps (optional toggle)
- Provide sources for facts
- Suggest related questions
- Allow drilling down into details

**Design Principles:**
- Answers should be conversational, not database dumps
- Include "why this matters" context
- Highlight patterns and connections
- Make insights actionable

---

## Personalization & Emotional Intelligence

### Adapting to User Over Time

**The system should learn:**
- Preferred check-in times (some users are early birds, others night owls)
- Communication style preferences (detailed vs. concise, formal vs. casual)
- Energy patterns (which days/times user has most focus)
- Response patterns (what tone resonates, what questions annoy)
- Capacity patterns (how much user typically completes)

**How this affects behavior:**
- Morning brief timing adjusts automatically
- Question depth matches user's typical response length
- Recommendations consider learned capacity, not just urgency
- Tone calibrates to user's communication style

### Emotional Intelligence

**System should recognize and respond to:**
- **Stress/overwhelm:** "You mentioned feeling behind..." → Simplify recommendations, be supportive
- **Excitement/wins:** "That's great!" → Acknowledge and celebrate genuinely
- **Low energy:** "Bit tired today..." → Suggest lighter tasks, more flexibility
- **Frustration:** "This is taking forever..." → Acknowledge difficulty, offer help
- **Confusion:** "I'm not sure what to focus on..." → Break down options clearly

**Key principles:**
- Match user's energy (don't be peppy when they're stressed)
- Acknowledge emotions without being therapist-y
- Adjust recommendations based on stated capacity
- Celebrate wins genuinely, not robotically
- Reduce load when user is overwhelmed, don't add to it

---

## Data Sovereignty & Storage

### User Data Ownership

**Principles:**
- All user data stored as markdown files in user's chosen location
- User can read, edit, move, or delete files at any time
- System works with user's edits seamlessly
- Data remains accessible even if Donna stops working

**Markdown Structure:**
All user data stored in predictable folders:
```
/user-data/
  /tasks/
    2026-02-follow-up-sarah-wireframes.md
    2026-02-pricing-model-exploration.md
  /projects/
    q1-2026-website-redesign.md
  /people/
    sarah-chen.md
  /notes/
    2026-02-initial-thoughts-pricing.md
  /daily-logs/
    2026-02-14.md  (auto-generated from check-ins)
  /check-ins/
    2026-02-14-morning.md
    2026-02-14-evening.md
```

**File Format:**
Each file uses consistent frontmatter for metadata:
```markdown
---
type: task
status: todo
created: 2026-02-14T09:30:00Z
due_date: 2026-02-15
energy_required: medium
---

# Follow up with Sarah about wireframe feedback

Need to get her input on the navigation concerns she raised.

Related: [[Q1 2026 Website Redesign]]
Person: [[Sarah Chen]]
```

**Check-in Files:**
Morning and evening check-ins are also stored as markdown:
```markdown
---
type: check-in
time: morning
date: 2026-02-14
mood: stressed
energy_level: medium-low
---

# Morning Check-in - Feb 14, 2026

## How I'm feeling
Bit stressed honestly. Have that investor meeting coming up Thursday.

## What's on my mind
Just feeling behind on the pricing model prep. And I still haven't heard back from Sarah about the wireframes.

## Priorities for today
1. Follow up with Sarah (15 min)
2. Pricing model work (focus blocks)
```

**User Can:**
- Edit files directly in any text editor
- Sync via Dropbox, iCloud, Git, or whatever they want
- Read their data without the app running
- Export/backup trivially (it's just files)
- Switch to any other markdown-based tool
- See complete history of check-ins and conversations

---
