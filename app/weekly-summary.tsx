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

type CheckIn = {
  date?: string;
  day?: string;
  dose_taken?: string;
  overall_effect?: string;
  benefit_domain?: string;
  effect_feel?: string;
  later_day?: string;
};

function countValues(values: string[]) {
  const counts: Record<string, number> = {};

  for (const value of values) {
    counts[value] = (counts[value] || 0) + 1;
  }

  return counts;
}

function mostCommon(values: string[]) {
  if (values.length === 0) return null;

  const counts = countValues(values);

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

const ISSUE_WEIGHTS: Record<string, number> = {
  "Flat / not myself": 3,
  "Too rough / jittery": 3,
  "Wore off too early": 2,
  "Crashed / got snappy": 2,
  "Lasted too long / affected sleep": 2,
};

function highestWeightedIssue(values: string[]) {
  if (values.length === 0) return null;

  const scores: Record<string, number> = {};

  for (const value of values) {
    const weight = ISSUE_WEIGHTS[value] ?? 1;
    scores[value] = (scores[value] || 0) + weight;
  }

  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
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

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const raw = await AsyncStorage.getItem("checkIns");
        if (!raw) {
          setCheckIns([]);
          return;
        }

        const parsed: CheckIn[] = JSON.parse(raw);

        const sorted = parsed
          .filter((item) => item.date)
          .sort(
            (a, b) =>
              new Date(b.date || "").getTime() - new Date(a.date || "").getTime()
          );

        setCheckIns(sorted);
      };

      loadData();
    }, [])
  );

  const last7 = useMemo(() => checkIns.slice(0, 7), [checkIns]);
  const daysLogged = last7.length;

  const medicationTakenDays = useMemo(() => {
    return last7.filter(
      (entry) =>
        entry.dose_taken === "Yes, as planned" ||
        entry.dose_taken === "Yes, but later than planned"
    ).length;
  }, [last7]);

  const mostCommonBenefit = useMemo(() => {
    return mostCommon(
      last7
        .map((entry) => entry.benefit_domain)
        .filter((v): v is string => !!v && v !== "No clear improvement")
    );
  }, [last7]);

  const mostCommonIssue = useMemo(() => {
    const issues = last7.flatMap((entry) => {
      const values: string[] = [];

      if (entry.effect_feel === "Flat / not myself") values.push("Flat / not myself");
      if (entry.effect_feel === "Too rough / jittery") values.push("Too rough / jittery");
      if (entry.later_day === "Wore off too early") values.push("Wore off too early");
      if (entry.later_day === "Crashed / got snappy") values.push("Crashed / got snappy");
      if (entry.later_day === "Lasted too long / affected sleep") {
        values.push("Lasted too long / affected sleep");
      }

      return values;
    });

    return highestWeightedIssue(issues);
  }, [last7]);

  const earlyWeek = useMemo(() => last7.slice(0, Math.ceil(last7.length / 2)), [last7]);
  const lateWeek = useMemo(() => last7.slice(Math.ceil(last7.length / 2)), [last7]);

  const earlyBenefit = useMemo(() => {
    return mostCommon(
      earlyWeek
        .map((entry) => entry.benefit_domain)
        .filter((v): v is string => !!v && v !== "No clear improvement")
    );
  }, [earlyWeek]);

  const lateBenefit = useMemo(() => {
    return mostCommon(
      lateWeek
        .map((entry) => entry.benefit_domain)
        .filter((v): v is string => !!v && v !== "No clear improvement")
    );
  }, [lateWeek]);

  const confidence =
    last7.length <= 2
      ? "early signal"
      : last7.length <= 4
      ? "emerging pattern"
      : "consistent pattern";

  const encouragement = useMemo(() => {
    if (daysLogged === 0) return "No pattern yet. One check-in is enough to start.";
    if (daysLogged < 3) return "You are building the first signal. A few more days will sharpen it.";
    if (daysLogged < 5) return "You are building a clearer pattern now.";
    return "You have enough data here to have a much better titration conversation.";
  }, [daysLogged]);

  const insight = useMemo(() => {
    if (daysLogged === 0) {
      return "No check-ins logged yet, so there isn't enough data to summarise.";
    }

    if (daysLogged < 3) {
      return "Early signal only so far. Keep logging to build a clearer weekly pattern.";
    }

    if (
      earlyBenefit &&
      lateBenefit &&
      earlyBenefit !== lateBenefit &&
      lateBenefit === "No clear benefit pattern"
    ) {
      return `Benefit appears clearer earlier in the week, especially around ${earlyBenefit}, but becomes less distinct later in the week.`;
    }

    if (earlyBenefit && lateBenefit && earlyBenefit !== lateBenefit) {
      return `The pattern shifts across the week, from ${earlyBenefit} earlier on to ${lateBenefit} later.`;
    }

    if (mostCommonIssue === "Wore off too early") {
      return "The strongest pattern this week suggests the medication may be helping, but not covering enough of the day.";
    }

    if (mostCommonIssue === "Crashed / got snappy") {
      return "The main concern this week is rebound or a crash later in the day.";
    }

    if (mostCommonIssue === "Too rough / jittery") {
      return `The week shows a ${confidence} of overstimulation or roughness, even though some benefit may be present.`;
    }

    if (mostCommonIssue === "Flat / not myself") {
      return `The week shows a ${confidence} of emotional flattening, which is worth monitoring.`;
    }

    if (mostCommonBenefit) {
      return `The clearest positive signal this week is ${mostCommonBenefit}.`;
    }

    return "No strong positive or negative pattern stands out yet.";
  }, [
    confidence,
    daysLogged,
    earlyBenefit,
    lateBenefit,
    mostCommonBenefit,
    mostCommonIssue,
  ]);

  const guidance = useMemo(() => {
    if (daysLogged < 3) {
      return "Keep logging for a few more days before drawing firm conclusions.";
    }

    if (mostCommonIssue === "Flat / not myself" && mostCommonBenefit) {
      return `There seems to be useful effect around ${mostCommonBenefit}, but emotional flattening is now the more important discussion point. This could be worth raising as a possible dose or formulation issue.`;
    }

    if (mostCommonIssue === "Too rough / jittery" && mostCommonBenefit) {
      return `There may be some useful effect, especially around ${mostCommonBenefit}, but the main concern is tolerability. This could point to the dose feeling too strong.`;
    }

    if (mostCommonIssue === "Wore off too early" && mostCommonBenefit) {
      return `Benefit is present, especially around ${mostCommonBenefit}, but the main issue looks like duration rather than lack of effect.`;
    }

    if (mostCommonIssue === "Crashed / got snappy") {
      return "The signal points more toward rebound later in the day than poor effectiveness overall.";
    }

    if (!mostCommonIssue && mostCommonBenefit) {
      return `The current pattern is mostly positive, with ${mostCommonBenefit} standing out as the clearest benefit.`;
    }

    return "Keep logging to build a clearer pattern before making changes.";
  }, [daysLogged, mostCommonBenefit, mostCommonIssue]);

const summaryText = useMemo(() => {
  const benefitLabel = mostCommonBenefit || "No clear benefit pattern yet";
  const issueLabel = mostCommonIssue || "No strong issue reported";
  const earlyLabel = earlyBenefit || "No clear benefit pattern";
  const lateLabel = lateBenefit || "No clear benefit pattern";

  const lines = [
    "ADHD Companion - Weekly Summary",
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
  ];

  return lines.join("\n");
}, [
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
      if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(summaryText);
        window.alert("Weekly summary copied to clipboard.");
        return;
      }

      await Share.share({
        message: summaryText,
        title: "ADHD Companion Weekly Summary",
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
        <Text style={styles.cardHeading}>Overview</Text>
        <Text style={styles.metric}>Days logged: {daysLogged} / 7</Text>
        <Text style={styles.metric}>Medication taken: {medicationTakenDays} days</Text>
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
          <Text style={styles.metric}>No check-ins yet.</Text>
        ) : (
          last7.map((entry, index) => (
            <View key={`${entry.date}-${index}`} style={styles.entryRow}>
              <Text style={styles.entryDate}>{formatDateLabel(entry.date)}</Text>
              <Text style={styles.entryDetail}>
                Benefit: {entry.benefit_domain || "N/A"}
              </Text>
              <Text style={styles.entryDetail}>
                Feel: {entry.effect_feel || "N/A"}
              </Text>
              <Text style={styles.entryDetail}>
                Later: {entry.later_day || "N/A"}
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
