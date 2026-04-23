import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type LatestCheckIn = {
  date?: string;
  day?: string;
  overall_effect?: string;
  benefit_domain?: string;
  effect_feel?: string;
  later_day?: string;
};

type CheckIn = {
  date?: string;
};

export default function HomeScreen() {
  const [latestCheckIn, setLatestCheckIn] = useState<LatestCheckIn | null>(null);
  const [weeklyCount, setWeeklyCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const latest = await AsyncStorage.getItem("latestCheckIn");
        const rawCheckIns = await AsyncStorage.getItem("checkIns");

        if (latest) {
          setLatestCheckIn(JSON.parse(latest));
        } else {
          setLatestCheckIn(null);
        }

        if (rawCheckIns) {
          const parsed: CheckIn[] = JSON.parse(rawCheckIns);
          setWeeklyCount(parsed.slice(-7).length);
        } else {
          setWeeklyCount(0);
        }
      };

      loadData();
    }, [])
  );

  const isTodayCheckIn = useMemo(() => {
    if (!latestCheckIn?.date) return false;

    const saved = new Date(latestCheckIn.date);
    const now = new Date();

    return (
      saved.getFullYear() === now.getFullYear() &&
      saved.getMonth() === now.getMonth() &&
      saved.getDate() === now.getDate()
    );
  }, [latestCheckIn]);

  const buttonLabel = isTodayCheckIn
    ? "Today's check-in done"
    : "Start today's check-in";

  const microcopy = useMemo(() => {
    if (weeklyCount === 0) return "Your first few check-ins will create the first useful signal.";
    if (weeklyCount < 3) return "You are building the first pattern.";
    if (weeklyCount < 5) return "The picture is starting to sharpen.";
    return "You have enough data here to make the weekly summary meaningful.";
  }, [weeklyCount]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ADHD Companion</Text>
      <Text style={styles.subtitle}>
        A calm, simple check-in for medication titration.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Today</Text>
        <Text style={styles.cardValue}>
          {isTodayCheckIn ? "Check-in completed today" : "No check-in completed yet"}
        </Text>

        {isTodayCheckIn && latestCheckIn?.benefit_domain ? (
          <Text style={styles.cardSubtle}>
            Main change: {latestCheckIn.benefit_domain}
          </Text>
        ) : null}
      </View>

      <View style={styles.miniCard}>
        <Text style={styles.miniCardTitle}>Pattern building</Text>
        <Text style={styles.miniCardValue}>{weeklyCount} check-in{weeklyCount === 1 ? "" : "s"} logged</Text>
        <Text style={styles.miniCardSubtle}>{microcopy}</Text>
      </View>

      <Pressable
        style={[
          styles.primaryButton,
          isTodayCheckIn && styles.primaryButtonDisabled,
        ]}
        onPress={() => {
          if (!isTodayCheckIn) {
            router.push("/check-in");
          }
        }}
      >
        <Text style={styles.primaryButtonText}>{buttonLabel}</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => router.push("/weekly-summary")}
      >
        <Text style={styles.secondaryButtonText}>View weekly summary</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1220",
    padding: 24,
    justifyContent: "center",
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
    marginBottom: 32,
  },
  card: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  miniCard: {
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
  },
  miniCardTitle: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 8,
  },
  miniCardValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#F8FAFC",
    marginBottom: 6,
  },
  miniCardSubtle: {
    fontSize: 14,
    color: "#94A3B8",
    lineHeight: 20,
  },
  cardLabel: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#F8FAFC",
  },
  cardSubtle: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: "#7C3AED",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
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
  },
  secondaryButtonText: {
    color: "#E2E8F0",
    fontSize: 16,
    fontWeight: "600",
  },
});
