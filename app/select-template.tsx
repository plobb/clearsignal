import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MEDICATION_RESPONSE_TEMPLATES } from "../data/templates";

export default function SelectTemplateScreen() {
  const handleSelect = async (templateId: string) => {
    await AsyncStorage.setItem("selectedTemplateId", templateId);
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Choose template</Text>
      <Text style={styles.subtitle}>
        Pick the medication response pattern you want to track. You can change this later.
      </Text>

      {MEDICATION_RESPONSE_TEMPLATES.map((template) => (
        <Pressable
          key={template.id}
          style={styles.card}
          onPress={() => handleSelect(template.id)}
        >
          <Text style={styles.cardTitle}>{template.name}</Text>
          <Text style={styles.cardDescription}>{template.description}</Text>
        </Pressable>
      ))}

      <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
        <Text style={styles.secondaryButtonText}>Cancel</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#0B1220",
    minHeight: "100%",
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#94A3B8",
    lineHeight: 20,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
  },
  secondaryButtonText: {
    color: "#E2E8F0",
    fontSize: 16,
    fontWeight: "600",
  },
});
