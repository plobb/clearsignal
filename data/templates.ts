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
  category?: string;
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
          category: "activation",
        },
        {
          label: "Flat / not myself",
          value: "flat",
          signalType: "issue",
          weight: 3,
          category: "flattening",
        },
        {
          label: "Too rough / jittery",
          value: "jittery",
          signalType: "issue",
          weight: 3,
          category: "activation",
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
          category: "duration",
        },
        {
          label: "Crashed / got snappy",
          value: "crash_snappy",
          signalType: "duration",
          weight: 2,
          category: "rebound",
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
          category: "sleep",
        },
      ],
    },
  ],
};


export const MOOD_MEDICATION_TEMPLATE: CheckInTemplate = {
  id: "mood_medication",
  name: "Mood medication titration",
  description:
    "Tracks daily response, mood, anxiety, tolerability, and sleep patterns during medication changes.",
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
      prompt: "How did today feel overall?",
      options: [
        {
          label: "Clearly better",
          value: "clear_benefit",
          signalType: "overall_effect",
          weight: 4,
        },
        {
          label: "A bit better",
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
          label: "No real change",
          value: "not_really",
          signalType: "overall_effect",
          weight: 0,
        },
        {
          label: "Worse",
          value: "worse",
          signalType: "overall_effect",
          weight: -2,
        },
      ],
    },
    {
      id: "benefit_domain",
      prompt: "What improved most today?",
      options: [
        {
          label: "Mood felt lighter",
          value: "mood_lighter",
          signalType: "benefit",
          weight: 2,
        },
        {
          label: "Less anxious",
          value: "less_anxious",
          signalType: "benefit",
          weight: 2,
        },
        {
          label: "More steady",
          value: "more_steady",
          signalType: "benefit",
          weight: 2,
        },
        {
          label: "More energy",
          value: "more_energy",
          signalType: "benefit",
          weight: 2,
        },
        {
          label: "Better sleep",
          value: "better_sleep",
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
      prompt: "Any noticeable downside today?",
      options: [
        {
          label: "No major downside",
          value: "none",
          signalType: "issue",
          weight: 0,
        },
        {
          label: "Emotionally flat",
          value: "flat",
          signalType: "issue",
          weight: 3,
          category: "flattening",
        },
        {
          label: "More anxious / activated",
          value: "activated",
          signalType: "issue",
          weight: 3,
          category: "activation",
        },
        {
          label: "Tired / foggy",
          value: "foggy",
          signalType: "issue",
          weight: 2,
          category: "foggy",
        },
        {
          label: "Nausea / stomach upset",
          value: "nausea",
          signalType: "issue",
          weight: 2,
          category: "nausea",
        },
      ],
    },
    {
      id: "later_day",
      prompt: "How was the rest of the day?",
      options: [
        {
          label: "Stayed steady",
          value: "steady",
          signalType: "duration",
          weight: 0,
        },
        {
          label: "Dipped later",
          value: "dipped_later",
          signalType: "duration",
          weight: 2,
          category: "duration",
        },
        {
          label: "Felt restless later",
          value: "restless_later",
          signalType: "duration",
          weight: 2,
          category: "rebound",
        },
        {
          label: "Couldn't tell",
          value: "unclear",
          signalType: "duration",
          weight: 0,
        },
        {
          label: "Affected sleep",
          value: "sleep_affected",
          signalType: "duration",
          weight: 2,
          category: "sleep",
        },
      ],
    },
  ],
};

export const MEDICATION_RESPONSE_TEMPLATES: CheckInTemplate[] = [
  ADHD_TITRATION_TEMPLATE,
  MOOD_MEDICATION_TEMPLATE,
];

export const DEFAULT_TEMPLATE = ADHD_TITRATION_TEMPLATE;

export function getTemplateById(templateId: string | null | undefined): CheckInTemplate {
  return (
    MEDICATION_RESPONSE_TEMPLATES.find((template) => template.id === templateId) ??
    DEFAULT_TEMPLATE
  );
}
