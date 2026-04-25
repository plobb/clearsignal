# ClearSignal Product Specification - Treatment Context MVP

---

## 1. Product Overview

ClearSignal is a mobile-first app for tracking treatment response during medication titration or medication review.

It captures structured daily check-ins with minimal friction and turns them into clinician-ready weekly summaries.

The key product shift is:

> ClearSignal tracks a treatment context, not a single medication in isolation.

A treatment context may include one medication or a combination of medications, such as:

- ADHD medication starting while sertraline is already established
- ADHD medication plus a PRN beta blocker for situational anxiety
- Mood medication changes alongside anxiety or sleep support

The app should avoid implying that any observed effect or side effect definitely came from one medication unless the data and clinician review support that conclusion.

---

## 2. Core Principle

The plan defines what might matter.  
The daily check-in records what actually happened.

This means:

- a treatment plan stays active even if one medication was not taken that day
- not taking a medication can itself be clinically useful information
- PRN medication should remain visible so absence, non-need, missed use, and effect can be understood
- shared daily outcomes should be asked once, not repeated for every medication

---

## 3. Problem Statement

Medication titration and combination treatment are often monitored using vague recall:

- "I think it helped"
- "I felt strange"
- "I was anxious but I did not take the beta blocker"
- "I slept badly but I am not sure why"

Clinicians need clearer signals around:

- adherence
- benefit
- tolerability
- duration
- rebound
- mood
- anxiety
- sleep
- whether patterns occur in the context of the whole treatment plan

ClearSignal aims to improve signal quality without becoming a heavy diary or medication-management system.

---

## 4. Target Users

### Primary

Adults tracking medication response during:

- ADHD medication titration
- antidepressant or mood medication changes
- combined ADHD + mood/anxiety treatment
- PRN anxiety medication use

### Secondary

Clinicians reviewing patient-reported treatment response.

---

## 5. Core UX Principles

- Check-in should take less than 60 seconds
- Tap-first, minimal typing
- Clear language, not clinical jargon
- Feels supportive, not like surveillance
- Avoid false attribution to a single drug
- Provide useful summaries without overclaiming
- Prefer stable signals over free-text noise

---

## 6. Current Implementation

Current app architecture already supports much of this direction:

- templates live in `data/templates.ts`
- each template defines questions, answer options, signal types, weights, and categories
- check-ins store `templateId` and `templateName`
- answer storage is value-based
- display is label-based
- weekly summary is scoped to the selected template
- legacy records without a template ID are treated as the default template

Current storage keys:

```text
checkIns[]
latestCheckIn
selectedTemplateId
```

Current daily check-in shape:

```ts
{
  date,
  day,
  templateId,
  templateName,
  dose_taken,
  overall_effect,
  benefit_domain,
  effect_feel,
  later_day
}
```

---

## 7. Conceptual Model

### Current term

```text
Template
```

### Better user-facing term

```text
Tracking plan
```

For now, templates remain the implementation mechanism.

A tracking plan represents the current treatment context being monitored.

Examples:

```text
ADHD medication titration
Mood medication titration
ADHD start with existing mood/anxiety treatment
```

---

## 8. Treatment Context Rules

### Rule 1 - Effects belong to the context

Weekly summaries should say:

```text
This pattern occurred during the current treatment plan.
```

They should not say:

```text
This medication caused this pattern.
```

### Rule 2 - Medication-specific adherence matters

For a combined plan, adherence may need to be tracked separately:

```text
Did you take your ADHD medication today?
Did you take sertraline today?
Did you take your beta blocker today?
```

### Rule 3 - PRN medication needs special options

For PRN medication, yes/no is not enough.

Example options:

```text
Yes
No, not needed
No, but I probably needed it
No, forgot / avoided
```

### Rule 4 - Shared outcome questions are asked once

The app should not ask duplicate global questions for every medication.

Ask once:

```text
How did today feel overall?
What improved most?
Any noticeable downside?
How was the rest of the day?
How was sleep?
```

### Rule 5 - Modules may stay active when a medication is absent

If beta blocker was not taken, the anxiety module still matters.

Example interpretations:

```text
Anxiety low + beta blocker not taken because not needed
Anxiety high + beta blocker not taken but probably needed
Anxiety high + beta blocker taken
```

These are different signals.

---

## 9. MVP Decision

Do not build dynamic medication/module composition yet.

The next safe product step is:

```text
Add one combined template:
"ADHD start with existing mood/anxiety treatment"
```

This avoids an overbuilt medication engine while capturing the important clinical reality.

The combined template should include:

- ADHD medication adherence
- mood medication adherence
- PRN anxiety medication adherence
- ADHD benefit signals
- mood/anxiety state signals
- tolerability signals
- sleep / rebound / duration signals
- explicit copy that effects are interpreted in the context of the treatment plan

---

## 10. Proposed Combined Template

Working name:

```text
ADHD start with existing mood/anxiety treatment
```

Purpose:

```text
Tracks ADHD medication response while recognising that mood medication and PRN anxiety medication may also shape daily experience.
```

Example questions:

### Q1 - ADHD medication

```text
Did you take your ADHD medication today?
- Yes, as planned
- Yes, but later than planned
- No
```

### Q2 - Mood medication

```text
Did you take your regular mood medication today?
- Yes, as planned
- Yes, but later than planned
- No
```

### Q3 - PRN anxiety medication

```text
Did you take your PRN anxiety medication today?
- Yes
- No, not needed
- No, but I probably needed it
- No, forgot / avoided
```

### Q4 - Overall effect

```text
How did today feel overall?
- Clearly better
- A bit better
- Hard to tell
- No real change
- Worse
```

### Q5 - Main positive change

```text
What improved most today?
- Easier to get started
- Better focus
- Quieter head
- Calmer / less reactive
- Less anxious
- Mood felt lighter
- More steady through the day
- No clear improvement
```

### Q6 - Main difficulty or downside

```text
What was the main downside today?
- No major downside
- Flat / not myself
- Too rough / jittery
- More anxious / activated
- Tired / foggy
- Nausea / stomach upset
- Irritable / snappy
```

### Q7 - Later-day pattern

```text
What happened later in the day?
- Stayed steady
- Wore off too early
- Dipped later
- Crashed / got snappy
- Restless later
- Lasted too long / affected sleep
- Couldn't tell
```

This is slightly longer than the current 5-question flow, so it should be tested carefully for friction.

---

## 11. Weekly Summary Principles

The weekly summary should include a context note:

```text
This summary reflects the selected tracking plan and should not be read as attributing effects to one medication without clinical review.
```

It should summarise:

- days logged
- ADHD medication taken days
- regular mood medication taken days
- PRN anxiety medication use / non-use
- main benefit signal
- main issue signal
- anxiety/mood/focus patterns
- duration / rebound / sleep patterns
- suggested discussion points

Example wording:

```text
The strongest pattern this week occurred in the context of the combined treatment plan. Focus and initiation improved, but emotional flattening was also reported repeatedly. This is worth discussing as a tolerability signal rather than assuming a simple dose-response effect from one medication.
```

---

## 12. Objective Data, Future Layer

Apple Health or similar integrations may eventually add context such as:

- sleep duration
- resting heart rate
- heart rate variability
- weight trend
- activity
- blood pressure, if available

This should remain contextual data, not the core product.

Safe wording:

```text
Sleep duration was lower on days where late-day stimulation was reported.
```

Avoid:

```text
Medication X caused poor sleep.
```

---

## 13. Out of Scope for Current MVP

Do not build yet:

- full medication database
- drug interaction logic
- causality inference
- dynamic module composition
- Apple Health integration
- clinician dashboard
- cloud sync
- PDF export
- AI-assisted diary input

---

## 14. Near-Term Development Plan

### Step 1 - Stabilise current implementation

- Keep existing templates working
- Confirm tomorrow's one-template-only smoke test
- Confirm weekly summary remains scoped correctly

### Step 2 - Add combined template

Add:

```text
ADHD start with existing mood/anxiety treatment
```

Use current template architecture.  
No dynamic plan engine yet.

### Step 3 - Adjust user-facing language

Gradually change visible wording:

```text
Template
```

to:

```text
Tracking plan
```

Only after combined template is working.

### Step 4 - Evaluate friction

Check whether the combined template is still quick enough.

If it feels too long, introduce gentle branching later.

---

## 15. Success Criteria

For the next version:

- user can select a combined ADHD + mood/anxiety tracking plan
- daily check-in captures medication-specific adherence
- weekly summary is scoped to that plan
- summary explicitly avoids single-drug attribution
- check-in remains tolerable and quick
- data is still simple enough to inspect/debug

---

## 16. Product Direction

ClearSignal is evolving from:

```text
ADHD titration tracker
```

to:

```text
Configurable treatment-response tracking platform
```

The goal is not to model all pharmacology.

The goal is to make patient-reported experience more structured, honest, and useful.
