import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { DEFAULT_TEMPLATE, MEDICATION_RESPONSE_TEMPLATES } from "../data/templates";

export default function SelectTemplateScreen() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  useEffect(() => {
    const loadSelectedTemplate = async () => {
      const savedTemplateId = await AsyncStorage.getItem("selectedTemplateId");
      setSelectedTemplateId(savedTemplateId ?? DEFAULT_TEMPLATE.id);
    };

    loadSelectedTemplate();
  }, []);

  const handleSelect = async (templateId: string) => {
    await AsyncStorage.setItem("selectedTemplateId", templateId);
    setSelectedTemplateId(templateId);
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Choose template</Text>
      <Text style={styles.subtitle}>
        Pick the medication response pattern you want to track. You can change this later.
      </Text>

      {MEDICATION_RESPONSE_TEMPLATES.map((template) => {
        const isSelected = template.id === selectedTemplateId;

        return (
          <Pressable
            key={template.id}
            style={[styles.card, isSelected && styles.cardSelected]}
            onPress={() => handleSelect(template.id)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{template.name}</Text>
              {isSelected ? (
                <Text style={styles.selectedBadge}>Selected</Text>
              ) : null}
            </View>
            <Text style={styles.cardDescription}>{template.description}</Text>
          </Pressable>
        );
      })}

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
  cardSelected: {
    borderColor: "#7C3AED",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  selectedBadge: {
    color: "#A78BFA",
    fontSize: 13,
    fontWeight: "700",
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
