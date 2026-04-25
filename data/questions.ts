import { DEFAULT_TEMPLATE } from "./templates";
import { CheckInQuestion } from "../types/checkin";

export const CHECK_IN_QUESTIONS: CheckInQuestion[] =
  DEFAULT_TEMPLATE.questions.map((question) => ({
    id: question.id,
    prompt: question.prompt,
    options: question.options.map((option) => option.label),
  }));
