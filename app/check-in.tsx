import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DEFAULT_TEMPLATE, getTemplateById, type CheckInTemplate } from "../data/templates";

type CheckInAnswers = Record<string, string>;

export default function CheckInScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<CheckInAnswers>({});
  const [activeTemplate, setActiveTemplate] =
    useState<CheckInTemplate>(DEFAULT_TEMPLATE);

  useEffect(() => {
    const loadTemplate = async () => {
      const selectedTemplateId = await AsyncStorage.getItem("selectedTemplateId");
      setActiveTemplate(getTemplateById(selectedTemplateId));
    };

    loadTemplate();
  }, []);

  const questions = activeTemplate.questions;
  const question = questions[currentIndex];
  const isComplete = currentIndex >= questions.length;

  const handleAnswer = async (answer: string) => {
    if (!question) return;

    const updatedAnswers = {
      ...answers,
      [question.id]: answer,
    };

    setAnswers(updatedAnswers);

    if (currentIndex === questions.length - 1) {
      const finalAnswers = {
        ...updatedAnswers,
        date: new Date().toISOString(),
        day: new Date().toDateString(),
        templateId: activeTemplate.id,
        templateName: activeTemplate.name,
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

  const completionRows = useMemo(() => {
    return Object.entries(answers).filter(
      ([key]) => !["date", "day", "templateId", "templateName"].includes(key)
    );
  }, [answers]);

  if (isComplete) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Check-in complete</Text>
        <Text style={styles.subtitle}>Nice. You logged today's check-in.</Text>
        <Text style={styles.templateLabel}>{activeTemplate.name}</Text>

        <View style={styles.card}>
          {completionRows.map(([key, value]) => (
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

  if (!question) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading check-in...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        Question {currentIndex + 1} of {questions.length}
      </Text>

      <Text style={styles.templateLabel}>{activeTemplate.name}</Text>
      <Text style={styles.title}>{question.prompt}</Text>

      <View style={styles.optionsContainer}>
        {question.options.map((option) => (
          <Pressable
            key={option.value}
            style={styles.optionButton}
            onPress={() => handleAnswer(option.value)}
          >
            <Text style={styles.optionText}>{option.label}</Text>
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
  templateLabel: {
    fontSize: 14,
    color: "#A78BFA",
    marginBottom: 12,
    fontWeight: "600",
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
    marginBottom: 12,
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