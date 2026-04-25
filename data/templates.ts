export type SignalType =
  | "adherence"
  | "overall_effect"
  | "benefit"
  | "issue"
  | "duration";

export type AnswerOption = {
  label: string;
  value: string;
  signalType?: SignalType;
  weight?: number;
};

export type CheckInQuestion = {
  id: string;
  prompt: string;
  options: AnswerOption[];
};

export type CheckInTemplate = {
  id: string;
  name: string;
  description: string;
  questions: CheckInQuestion[];
};

export const ADHD_TITRATION_TEMPLATE: CheckInTemplate = {
  id: "adhd_titration",
  name: "ADHD medication titration",
  description:
    "Tracks daily medication response, benefit, tolerability, and wear-off patterns.",
  questions: [
    {
      id: "dose_taken",
      prompt: "Did you take your medication today?",
      options: [
        {
          label: "Yes, as planned",
          value: "yes_planned",
          signalType: "adherence",
        },
        {
          label: "Yes, but later than planned",
          value: "yes_late",
          signalType: "adherence",
          weight: 1,
        },
        {
          label: "No",
          value: "no",
          signalType: "adherence",
          weight: 2,
        },
      ],
    },
    {
      id: "overall_effect",
      prompt: "Did it help today?",
      options: [
        {
          label: "Yes, clearly",
          value: "clear_benefit",
          signalType: "overall_effect",
          weight: 4,
        },
        {
          label: "A bit",
          value: "some_benefit",
          signalType: "overall_effect",
          weight: 2,
        },
        {
          label: "Hard to tell",
          value: "unclear",
          signalType: "overall_effect",
          weight: 1,
        },
        {
          label: "Not really",
          value: "not_really",
          signalType: "overall_effect",
          weight: 0,
        },
        {
          label: "No, worse",
          value: "worse",
          signalType: "overall_effect",
          weight: -2,
        },
      ],
    },
    {
      id: "benefit_domain",
      prompt: "What changed most today?",
      options: [
        {
          label: "Easier to get started",
          value: "initiation",
          signalType: "benefit",
          weight: 2,
        },
        {
          label: "Quieter head",
          value: "mental_noise",
          signalType: "benefit",
          weight: 2,
        },
        {
          label: "Calmer / less reactive",
          value: "emotional_regulation",
          signalType: "benefit",
          weight: 2,
        },
        {
          label: "Better focus",
          value: "focus",
          signalType: "benefit",
          weight: 2,
        },
        {
          label: "More steady through the day",
          value: "stability",
          signalType: "benefit",
          weight: 2,
        },
        {
          label: "No clear improvement",
          value: "none",
          signalType: "benefit",
          weight: 0,
        },
      ],
    },
    {
      id: "effect_feel",
      prompt: "How did it feel overall?",
      options: [
        {
          label: "Smooth and calm",
          value: "smooth_calm",
          signalType: "issue",
          weight: 0,
        },
        {
          label: "Useful but a bit intense",
          value: "intense",
          signalType: "issue",
          weight: 1,
        },
        {
          label: "Flat / not myself",
          value: "flat",
          signalType: "issue",
          weight: 3,
        },
        {
          label: "Too rough / jittery",
          value: "jittery",
          signalType: "issue",
          weight: 3,
        },
        {
          label: "No real effect",
          value: "no_effect",
          signalType: "overall_effect",
          weight: -1,
        },
      ],
    },
    {
      id: "later_day",
      prompt: "What happened later in the day?",
      options: [
        {
          label: "Stayed steady",
          value: "steady",
          signalType: "duration",
          weight: 0,
        },
        {
          label: "Wore off too early",
          value: "wore_off_early",
          signalType: "duration",
          weight: 2,
        },
        {
          label: "Crashed / got snappy",
          value: "crash_snappy",
          signalType: "duration",
          weight: 2,
        },
        {
          label: "Couldn't tell",
          value: "unclear",
          signalType: "duration",
          weight: 0,
        },
        {
          label: "Lasted too long / affected sleep",
          value: "too_long_sleep",
          signalType: "duration",
          weight: 2,
        },
      ],
    },
  ],
};

export const MEDICATION_RESPONSE_TEMPLATES: CheckInTemplate[] = [
  ADHD_TITRATION_TEMPLATE,
];

export const DEFAULT_TEMPLATE = ADHD_TITRATION_TEMPLATE;export type SignalType =
  | "adherence"
  | "overall_effect"
  | "benefit"
  | "issue"
  | "duration";

export type AnswerOption = {
  label: string;
  value: string;
  signalType?: SignalType;
  weight?: number;
};

export type CheckInQuestion = {
  id: string;
  prompt: string;
  options: AnswerOption[];
};

export type CheckInTemplate = {
  id: string;
  name: string;
  description: string;
  questions: CheckInQuestion[];
};

export const ADHD_TITRATION_TEMPLATE: CheckInTemplate = {
  id: "adhd_titration",
  name: "ADHD medication titration",
  description:
    "Tracks daily medication response, benefit, tolerability, and wear-off patterns.",
  questions: [
    {
      id: "dose_taken",
      prompt: "Did you take your medication today?",
      options: [
        {
          label: "Yes, as planned",
          value: "yes_planned",
          signalType: "adherence",
        },
        {
          label: "Yes, but later than planned",
          value: "yes_late",
          signalType: "adherence",
          weight: 1,
        },
        {
          label: "No",
          value: "no",
          signalType: "adherence",
          weight: 2,
        },
      ],
    },
    {
      id: "overall_effect",
      prompt: "Did it help today?",
      options: [
        {
          label: "Yes, clearly",
          value: "clear_benefit",
          signalType: "overall_effect",
          weight: 4,
        },
        {
          label: "A bit",
          value: "some_benefit",
          signalType: "overall_effect",
          weight: 2,
        },
        {
          label: "Hard to tell",
          value: "unclear",
          signalType: "overall_effect",
          weight: 1,
        },
        {
          label: "Not really",
          value: "not_really",
          signalType: "overall_effect",
          weight: 0,
        },
        {
          label: "No, worse",
          value: "worse",
          signalType: "overall_effect",
          weight: -2,
        },
      ],
    },
    {
      id: "benefit_domain",
      prompt: "What changed most today?",
      options: [
        {
          label: "Easier to get started",
          value: "initiation",
          signalType: "benefit",
          weight: 2,
        },
        {
          label: "Quieter head",
          value: "mental_noise",
          signalType: "benefit",
          weight: 2,
        },
        {
          label: "Calmer / less reactive",
          value: "emotional_regulation",
          signalType: "benefit",
          weight: 2,
        },
        {
          label: "Better focus",
          value: "focus",
          signalType: "benefit",
          weight: 2,
        },
        {
          label: "More steady through the day",
          value: "stability",
          signalType: "benefit",
          weight: 2,
        },
        {
          label: "No clear improvement",
          value: "none",
          signalType: "benefit",
          weight: 0,
        },
      ],
    },
    {
      id: "effect_feel",
      prompt: "How did it feel overall?",
      options: [
        {
          label: "Smooth and calm",
          value: "smooth_calm",
          signalType: "issue",
          weight: 0,
        },
        {
          label: "Useful but a bit intense",
          value: "intense",
          signalType: "issue",
          weight: 1,
        },
        {
          label: "Flat / not myself",
          value: "flat",
          signalType: "issue",
          weight: 3,
        },
        {
          label: "Too rough / jittery",
          value: "jittery",
          signalType: "issue",
          weight: 3,
        },
        {
          label: "No real effect",
          value: "no_effect",
          signalType: "overall_effect",
          weight: -1,
        },
      ],
    },
    {
      id: "later_day",
      prompt: "What happened later in the day?",
      options: [
        {
          label: "Stayed steady",
          value: "steady",
          signalType: "duration",
          weight: 0,
        },
        {
          label: "Wore off too early",
          value: "wore_off_early",
          signalType: "duration",
          weight: 2,
        },
        {
          label: "Crashed / got snappy",
          value: "crash_snappy",
          signalType: "duration",
          weight: 2,
        },
        {
          label: "Couldn't tell",
          value: "unclear",
          signalType: "duration",
          weight: 0,
        },
        {
          label: "Lasted too long / affected sleep",
          value: "too_long_sleep",
          signalType: "duration",
          weight: 2,
        },
      ],
    },
  ],
};

export const MEDICATION_RESPONSE_TEMPLATES: CheckInTemplate[] = [
  ADHD_TITRATION_TEMPLATE,
];

export const DEFAULT_TEMPLATE = ADHD_TITRATION_TEMPLATE;
