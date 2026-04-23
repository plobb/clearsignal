import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CHECK_IN_QUESTIONS } from "../data/questions";

type CheckInAnswers = Record<string, string>;

export default function CheckInScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<CheckInAnswers>({});

  const question = CHECK_IN_QUESTIONS[currentIndex];
  const isComplete = currentIndex >= CHECK_IN_QUESTIONS.length;

  const handleAnswer = async (answer: string) => {
    const updatedAnswers = {
      ...answers,
      [question.id]: answer,
    };

    setAnswers(updatedAnswers);

    if (currentIndex === CHECK_IN_QUESTIONS.length - 1) {
      const now = new Date();

      const finalAnswers = {
        ...updatedAnswers,
        date: now.toISOString(),
        day: now.toDateString(),
      };

      const existing = await AsyncStorage.getItem("checkIns");
      const checkIns = existing ? JSON.parse(existing) : [];

      checkIns.push(finalAnswers);

      await AsyncStorage.setItem("checkIns", JSON.stringify(checkIns));
      await AsyncStorage.setItem("latestCheckIn", JSON.stringify(finalAnswers));

      setAnswers(finalAnswers);
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (isComplete) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Check-in complete</Text>
        <Text style={styles.subtitle}>Nice. You logged today's check-in.</Text>

        <View style={styles.card}>
          {Object.entries(answers).map(([key, value]) => (
            <View key={key} style={styles.answerRow}>
              <Text style={styles.answerKey}>{key}</Text>
              <Text style={styles.answerValue}>{value}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.primaryButtonText}>Back to home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        Question {currentIndex + 1} of {CHECK_IN_QUESTIONS.length}
      </Text>

      <Text style={styles.title}>{question.prompt}</Text>

      <View style={styles.optionsContainer}>
        {question.options.map((option) => (
          <Pressable
            key={option}
            style={styles.optionButton}
            onPress={() => handleAnswer(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </Pressable>
        ))}
      </View>
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
  progress: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 17,
    color: "#CBD5E1",
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionText: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  answerRow: {
    marginBottom: 12,
  },
  answerKey: {
    color: "#94A3B8",
    fontSize: 13,
    marginBottom: 4,
  },
  answerValue: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "500",
  },
  primaryButton: {
    backgroundColor: "#7C3AED",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});
