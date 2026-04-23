import { CheckInQuestion } from "../types/checkin";

export const CHECK_IN_QUESTIONS: CheckInQuestion[] = [
  {
    id: "dose_taken",
    prompt: "Did you take your medication today?",
    options: ["Yes, as planned", "Yes, but later than planned", "No"],
  },
  {
    id: "overall_effect",
    prompt: "Did it help today?",
    options: ["Yes, clearly", "A bit", "Hard to tell", "Not really", "No, worse"],
  },
  {
    id: "benefit_domain",
    prompt: "What changed most today?",
    options: [
      "Easier to get started",
      "Quieter head",
      "Calmer / less reactive",
      "Better focus",
      "More steady through the day",
      "No clear improvement",
    ],
  },
  {
    id: "effect_feel",
    prompt: "How did it feel overall?",
    options: [
      "Smooth and calm",
      "Useful but a bit intense",
      "Flat / not myself",
      "Too rough / jittery",
      "No real effect",
    ],
  },
  {
    id: "later_day",
    prompt: "What happened later in the day?",
    options: [
      "Stayed steady",
      "Wore off too early",
      "Crashed / got snappy",
      "Couldn't tell",
      "Lasted too long / affected sleep",
    ],
  },
];