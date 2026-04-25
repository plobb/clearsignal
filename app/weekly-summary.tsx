import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  DEFAULT_TEMPLATE,
  getTemplateById,
  type CheckInTemplate,
} from "../data/templates";

type CheckIn = {
  date?: string;
  day?: string;
  templateId?: string;
  templateName?: string;
  dose_taken?: string;
  overall_effect?: string;
  benefit_domain?: string;
  effect_feel?: string;
  later_day?: string;
};

type SignalSummary = {
  label: string;
  value: string;
  score: number;
  category?: string;
};

function getTemplateOption(
  template: CheckInTemplate,
  questionId: string,
  storedAnswer: string
) {
  const question = template.questions.find((item) => item.id === questionId);
  return question?.options.find(
    (option) => option.label === storedAnswer || option.value === storedAnswer
  );
}

function formatStoredAnswer(
  template: CheckInTemplate,
  questionId: string,
  storedAnswer?: string
) {
  if (!storedAnswer) return "N/A";

  return getTemplateOption(template, questionId, storedAnswer)?.label ?? storedAnswer;
}

function strongestSignal(
  entries: CheckIn[],
  template: CheckInTemplate,
  signalTypes: string[],
  excludeZeroWeight = true
): SignalSummary | null {
  const scores: Record<string, SignalSummary> = {};

  for (const entry of entries) {
    for (const question of template.questions) {
      const storedAnswer = entry[question.id as keyof CheckIn];

      if (typeof storedAnswer !== "string") continue;

      const option = getTemplateOption(template, question.id, storedAnswer);

      if (!option?.signalType || !signalTypes.includes(option.signalType)) {
        continue;
      }

      const weight = option.weight ?? 1;

      if (excludeZeroWeight && weight === 0) continue;

      const key = option.value;

      scores[key] = {
        label: option.label,
        value: option.value,
        category: option.category,
        score: (scores[key]?.score ?? 0) + weight,
      };
    }
  }

  return Object.values(scores).sort((a, b) => b.score - a.score)[0] ?? null;
}

function formatDateLabel(iso?: string) {
  if (!iso) return "Unknown day";

  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function WeeklySummaryScreen() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [activeTemplate, setActiveTemplate] =
    useState<CheckInTemplate>(DEFAULT_TEMPLATE);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const raw = await AsyncStorage.getItem("checkIns");
        const selectedTemplateId = await AsyncStorage.getItem("selectedTemplateId");
        const template = getTemplateById(selectedTemplateId);

        setActiveTemplate(template);

        if (!raw) {
          setCheckIns([]);
          return;
        }

        const parsed: CheckIn[] = JSON.parse(raw);

        const filtered = parsed.filter((entry) => {
          if (entry.templateId) {
            return entry.templateId === template.id;
          }

          // Older records were created before templateId existed.
          // Treat those as belonging to the original/default template.
          return template.id === DEFAULT_TEMPLATE.id;
        });

        const sorted = filtered
          .filter((item) => item.date)
          .sort(
            (a, b) =>
              new Date(b.date || "").getTime() -
              new Date(a.date || "").getTime()
          );

        setCheckIns(sorted);
      };

      loadData();
    }, [])
  );

  const last7 = useMemo(() => checkIns.slice(0, 7), [checkIns]);
  const daysLogged = last7.length;

  const medicationTakenDays = useMemo(() => {
    return last7.filter((entry) => {
      if (!entry.dose_taken) return false;

      const option = getTemplateOption(activeTemplate, "dose_taken", entry.dose_taken);

      return option?.value === "yes_planned" || option?.value === "yes_late";
    }).length;
  }, [activeTemplate, last7]);

  const mostCommonBenefitSignal = useMemo(() => {
    return strongestSignal(last7, activeTemplate, ["benefit"]);
  }, [activeTemplate, last7]);

  const mostCommonBenefit = mostCommonBenefitSignal?.label ?? null;

  const mostCommonIssueSignal = useMemo(() => {
    return strongestSignal(last7, activeTemplate, ["issue", "duration"]);
  }, [activeTemplate, last7]);

  const mostCommonIssue = mostCommonIssueSignal?.label ?? null;

  const earlyWeek = useMemo(
    () => last7.slice(0, Math.ceil(last7.length / 2)),
    [last7]
  );

  const lateWeek = useMemo(
    () => last7.slice(Math.ceil(last7.length / 2)),
    [last7]
  );

  const earlyBenefitSignal = useMemo(() => {
    return strongestSignal(earlyWeek, activeTemplate, ["benefit"]);
  }, [activeTemplate, earlyWeek]);

  const earlyBenefit = earlyBenefitSignal?.label ?? null;

  const lateBenefitSignal = useMemo(() => {
    return strongestSignal(lateWeek, activeTemplate, ["benefit"]);
  }, [activeTemplate, lateWeek]);

  const lateBenefit = lateBenefitSignal?.label ?? null;

  const confidence =
    last7.length <= 2
      ? "early signal"
      : last7.length <= 4
      ? "emerging pattern"
      : "consistent pattern";

  const encouragement = useMemo(() => {
    if (daysLogged === 0) {
      return `No data yet for ${activeTemplate.name}. Start logging to build the first pattern.`;
    }

    if (daysLogged < 3) {
      return "You are building the first signal. A few more days will sharpen it.";
    }

    if (daysLogged < 5) {
      return "You are building a clearer pattern now.";
    }

    return "You have enough data here to have a much better titration conversation.";
  }, [activeTemplate.name, daysLogged]);

  const issueCategory = mostCommonIssueSignal?.category ?? "none";

  const insight = useMemo(() => {
    if (daysLogged === 0) {
      return `No ${activeTemplate.name} check-ins logged yet, so there is not enough data to summarise.`;
    }

    if (daysLogged < 3) {
      return "Early signal only so far. Keep logging to build a clearer weekly pattern.";
    }

    if (earlyBenefit && lateBenefit && earlyBenefit !== lateBenefit) {
      return `The benefit pattern shifts across the week, from ${earlyBenefit} earlier on to ${lateBenefit} later.`;
    }

    if (issueCategory === "flattening") {
      return `The week shows a ${confidence} of emotional flattening, which is worth monitoring.`;
    }

    if (issueCategory === "activation") {
      return `The week shows a ${confidence} of activation, jitteriness, or overstimulation.`;
    }

    if (issueCategory === "duration") {
      return `The strongest pattern this week suggests benefit may be present, but duration may be limited.`;
    }

    if (issueCategory === "rebound") {
      return "The main concern this week is a later-day rebound or crash pattern.";
    }

    if (issueCategory === "sleep") {
      return "The strongest issue signal this week relates to sleep or late-day over-coverage.";
    }

    if (issueCategory === "foggy") {
      return "The week suggests tiredness or fogginess may be a limiting factor.";
    }

    if (issueCategory === "nausea") {
      return "The week suggests nausea or stomach upset may be a notable tolerability issue.";
    }

    if (mostCommonBenefit) {
      return `The clearest positive signal this week is ${mostCommonBenefit}.`;
    }

    return "No strong positive or negative pattern stands out yet.";
  }, [
    activeTemplate.name,
    confidence,
    daysLogged,
    earlyBenefit,
    issueCategory,
    lateBenefit,
    mostCommonBenefit,
  ]);

  const guidance = useMemo(() => {
    if (daysLogged < 3) {
      return "Keep logging for a few more days before drawing firm conclusions.";
    }

    if (issueCategory === "flattening" && mostCommonBenefit) {
      return `There seems to be useful effect around ${mostCommonBenefit}, but emotional flattening is now the more important discussion point. This could be worth raising as a possible tolerability, dose, or formulation issue.`;
    }

    if (issueCategory === "activation" && mostCommonBenefit) {
      return `There may be useful effect around ${mostCommonBenefit}, but activation or overstimulation appears to be the limiting factor. This is worth discussing before assuming the dose is a good fit.`;
    }

    if (issueCategory === "duration" && mostCommonBenefit) {
      return `Benefit is present, especially around ${mostCommonBenefit}, but the main issue looks like duration rather than lack of effect.`;
    }

    if (issueCategory === "rebound") {
      return "The signal points more toward rebound later in the day than poor effectiveness overall.";
    }

    if (issueCategory === "sleep") {
      return "Sleep impact is worth discussing, especially if it is repeated or affects next-day function.";
    }

    if (issueCategory === "foggy") {
      return "Tiredness or fogginess may be worth discussing as a tolerability issue, especially if function is affected.";
    }

    if (issueCategory === "nausea") {
      return "Nausea or stomach upset may be worth discussing if it persists, worsens, or affects adherence.";
    }

    if (!mostCommonIssue && mostCommonBenefit) {
      return `The current pattern is mostly positive, with ${mostCommonBenefit} standing out as the clearest benefit.`;
    }

    return "Keep logging to build a clearer pattern before making changes.";
  }, [daysLogged, issueCategory, mostCommonBenefit, mostCommonIssue]);

  const summaryText = useMemo(() => {
    const benefitLabel = mostCommonBenefit || "No clear benefit pattern yet";
    const issueLabel = mostCommonIssue || "No strong issue reported";
    const earlyLabel = earlyBenefit || "No clear benefit pattern";
    const lateLabel = lateBenefit || "No clear benefit pattern";

    const lines = [
      "ClearSignal - Weekly Summary",
      "",
      `Template: ${activeTemplate.name}`,
      "",
      "Data completeness:",
      `- ${daysLogged} of 7 days logged`,
      `- Medication taken on ${medicationTakenDays} logged day${
        medicationTakenDays === 1 ? "" : "s"
      }`,
      "",
      "Effect summary:",
      `- Consistent benefit: ${benefitLabel}`,
      `- Main issue signal: ${issueLabel}`,
      "",
      "Pattern across the week:",
      `- Early week: ${earlyLabel}`,
      `- Late week: ${lateLabel}`,
      "",
      "Interpretation:",
      insight,
      "",
      "Guidance for discussion:",
      guidance,
      "",
      "Note:",
      "This summary is intended to support, not replace, discussion with a qualified clinician.",
    ];

    return lines.join("\n");
  }, [
    activeTemplate.name,
    daysLogged,
    medicationTakenDays,
    mostCommonBenefit,
    mostCommonIssue,
    earlyBenefit,
    lateBenefit,
    insight,
    guidance,
  ]);

  const handleExport = useCallback(async () => {
    try {
      if (
        Platform.OS === "web" &&
        typeof navigator !== "undefined" &&
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(summaryText);
        window.alert("Weekly summary copied to clipboard.");
        return;
      }

      await Share.share({
        message: summaryText,
        title: "ClearSignal Weekly Summary",
      });
    } catch (error) {
      Alert.alert("Export failed", "Could not export the weekly summary.");
    }
  }, [summaryText]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Weekly Summary</Text>
      <Text style={styles.subtitle}>
        A simple view of the last 7 check-ins and the strongest patterns.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardHeading}>Template</Text>
        <Text style={styles.metric}>{activeTemplate.name}</Text>
        <Text style={styles.note}>{activeTemplate.description}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeading}>Overview</Text>
        <Text style={styles.metric}>Days logged: {daysLogged} / 7</Text>
        <Text style={styles.metric}>
          Medication taken: {medicationTakenDays} days
        </Text>
        <Text style={styles.note}>{encouragement}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeading}>Main signals</Text>
        <Text style={styles.metric}>
          Most common benefit: {mostCommonBenefit || "No clear pattern yet"}
        </Text>
        <Text style={styles.metric}>
          Most common issue: {mostCommonIssue || "No strong issue reported"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeading}>Trend across the week</Text>
        <Text style={styles.metric}>
          Early week: {earlyBenefit || "No clear benefit pattern"}
        </Text>
        <Text style={styles.metric}>
          Late week: {lateBenefit || "No clear benefit pattern"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeading}>Insight</Text>
        <Text style={styles.insight}>{insight}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeading}>Guidance</Text>
        <Text style={styles.metric}>{guidance}</Text>
      </View>

      <View style={styles.buttonRow}>
        <Pressable style={styles.secondaryButton} onPress={handleExport}>
          <Text style={styles.secondaryButtonText}>Copy / share summary</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeading}>Last 7 check-ins</Text>
        {last7.length === 0 ? (
          <Text style={styles.metric}>No check-ins yet for this template.</Text>
        ) : (
          last7.map((entry, index) => (
            <View key={`${entry.date}-${index}`} style={styles.entryRow}>
              <Text style={styles.entryDate}>{formatDateLabel(entry.date)}</Text>
              <Text style={styles.entryDetail}>
                Benefit: {formatStoredAnswer(activeTemplate, "benefit_domain", entry.benefit_domain)}
              </Text>
              <Text style={styles.entryDetail}>
                Feel: {formatStoredAnswer(activeTemplate, "effect_feel", entry.effect_feel)}
              </Text>
              <Text style={styles.entryDetail}>
                Later: {formatStoredAnswer(activeTemplate, "later_day", entry.later_day)}
              </Text>
            </View>
          ))
        )}
      </View>

      <Pressable style={styles.primaryButton} onPress={() => router.back()}>
        <Text style={styles.primaryButtonText}>Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#0B1220",
    minHeight: "100%",
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    color: "#CBD5E1",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 12,
  },
  metric: {
    fontSize: 16,
    color: "#E2E8F0",
    marginBottom: 8,
    lineHeight: 22,
  },
  note: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 8,
    lineHeight: 20,
  },
  insight: {
    fontSize: 16,
    color: "#F8FAFC",
    lineHeight: 24,
  },
  entryRow: {
    borderTopWidth: 1,
    borderTopColor: "#1F2937",
    paddingTop: 12,
    marginTop: 12,
  },
  entryDate: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 6,
  },
  entryDetail: {
    fontSize: 14,
    color: "#CBD5E1",
    marginBottom: 4,
  },
  buttonRow: {
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#7C3AED",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#0F172A",
  },
  secondaryButtonText: {
    color: "#E2E8F0",
    fontSize: 16,
    fontWeight: "600",
  },
});
