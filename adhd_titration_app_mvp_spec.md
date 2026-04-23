# ADHD Titration App — v0.1 Product Specification

---

## 1. Product Overview

A mobile-first app designed to support ADHD medication titration by capturing structured daily responses with minimal friction and generating clinician-ready weekly summaries.

Core idea:
- Replace diaries with guided, lightweight check-ins
- Convert simple taps into structured clinical signals
- Generate clear, actionable summaries for dose decisions

---

## 2. Problem Statement

ADHD titration suffers from:
- vague patient recall
- inconsistent or abandoned logging
- repetitive, fatiguing questionnaires
- lack of timing and duration data

Clinicians receive low-quality input, slowing optimisation.

This app aims to:
- reduce friction in daily reporting
- improve signal quality
- capture duration and side-effect patterns
- accelerate titration decisions

---

## 3. Target Users

### Primary
Adults starting ADHD medication titration

### Secondary
Clinicians reviewing treatment response

---

## 4. User Stories

### As a user:
- I want to check in quickly without thinking too much
- I want to understand if my medication is working
- I want to feel calmer and more consistent
- I want to avoid keeping a diary
- I want something I can show my clinician

### As a clinician:
- I want clear patterns, not raw logs
- I want to understand duration and side effects
- I want to identify whether to increase, reduce, or switch

---

## 5. Core UX Principles

- < 60 seconds per check-in
- Tap-first, minimal typing
- Feels like help, not logging
- Avoid repetition fatigue
- Clear > clever
- Immediate feedback after entry

---

## 6. MVP Feature Set

### Included
- Daily 5-question check-in
- Rotating question phrasing
- Adaptive follow-ups
- Local data storage
- Daily feedback message
- Weekly summary report
- Medication + dose setup
- Reminder notification

### Excluded (v0.1)
- accounts / login
- cloud sync
- clinician dashboards
- PDF export
- AI summaries
- lifestyle tracking

---

## 7. App Screens (v0.1)

### 1. Setup Screen
- medication name
- dose
- usual time taken

### 2. Daily Check-in Flow
- 5 core questions
- optional follow-ups
- final confirmation + feedback

### 3. Home / Status Screen
- today’s status (done / pending)
- last summary message
- quick access to history

### 4. Weekly Summary Screen
- structured summary
- pattern interpretation

### 5. History View
- simple list of past days

---

## 8. Daily Check-in Structure

### Q1 Dose taken
- Yes on time
- Yes late
- No

### Q2 Did it help
- Clearly
- A bit
- Hard to tell
- Not really
- Worse

### Q3 What changed most
- Initiation
- Mental clarity
- Calm/reactivity
- Focus
- Stability
- None

### Q4 How did it feel
- Smooth
- Intense
- Flat
- Jittery
- No effect

### Q5 Later in day
- Steady
- Wore off early
- Crash
- Unclear
- Too long

---

## 9. Data Model (Simplified)

### Daily Entry
- id
- date
- dose_taken
- timing
- overall_effect
- benefit_domain
- effect_feel
- later_pattern
- followups
- note

### Derived Metrics
- overallBenefit
- initiation
- focus
- mentalNoise
- emotionalRegulation
- stability
- durationQuality
- sideEffectBurden

---

## 10. Scoring Logic

Each answer maps to numeric signals.

Example:
- clearly = +4
- a bit = +2
- worse = -2

Domains increment respective metrics.

Later-day answers drive duration scoring.

---

## 11. Daily Classification

Each day assigned a label:
- good_fit
- helpful_short
- helpful_rough
- unclear
- worse

---

## 12. Weekly Aggregation

Calculate:
- adherence
- average benefit
- dominant benefit domain
- effect quality distribution
- duration pattern
- side-effect frequency

---

## 13. Weekly Summary Output

Structure:

Medication + dose
Entries completed

Effect summary
Main improvements

Quality pattern
Duration pattern

Side effects

Interpretation (rule-based)

---

## 14. Interpretation Rules (v0.1)

### Good fit
High benefit + low side effects + steady duration

### Under coverage
Good benefit + early wear-off pattern

### Too strong
Benefit + high intensity / jitter

### Flat effect
Repeated emotional flattening

### Unclear
No consistent signal

---

## 15. Notifications

- one daily reminder
- based on medication time

Future:
- multi-point reminders

---

## 16. Tech Stack

- React Native (Expo)
- local storage
- git
- built via WSL

---

## 17. MVP Milestones

### Phase 1
- project setup
- check-in flow working

### Phase 2
- scoring logic
- daily feedback

### Phase 3
- weekly summary

### Phase 4
- notifications

---

## 18. Success Criteria

- user completes 5+ entries week 1
- check-in < 60s
- weekly summary is understandable
- user perceives insight

---

## 19. Next Step

Move to:
- repo setup
- Expo scaffold
- implement check-in flow

