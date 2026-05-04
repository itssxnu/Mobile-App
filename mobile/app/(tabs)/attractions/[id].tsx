import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getAttractionById, updateAttraction, deleteAttraction } from "../../../src/services/attractionService";
import { getUserData } from "../../../src/services/authService";
import { API_BASE_URL } from "../../../src/config/apiConfig";

export default function AttractionDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [attraction, setAttraction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [editDifficulty, setEditDifficulty] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [attractionData, user] = await Promise.all([
        getAttractionById(id),
        getUserData()
      ]);
      
      setAttraction(attractionData.data);
      setCurrentUser(user);
      
      setEditDescription(attractionData.data.description);
      setEditDifficulty(attractionData.data.difficultyLevel);
    } catch (error) {
      Alert.alert("Error", "Could not load attraction details.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [id])
  );

  const isOwnerOrAdmin = () => {
    if (!currentUser || !attraction) return false;
    if (currentUser.role?.toUpperCase() === "ADMIN") return true;
    return currentUser._id === attraction.provider?._id || currentUser.id === attraction.provider?._id;
  };

  const handleUpdate = async () => {
    if (!editDescription.trim() || !editDifficulty.trim()) {
      Alert.alert("Required", "Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);
      const updated = await updateAttraction(id, {
        description: editDescription,
        difficultyLevel: editDifficulty,
      });
      setAttraction(updated.data);
      setIsEditing(false);
      Alert.alert("Success", "Attraction updated successfully!");
    } catch (error) {
      Alert.alert("Update Failed", error.response?.data?.message || "Could not update.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    // Alert.alert callbacks don't work reliably on web — use window.confirm instead
    const confirmed =
      Platform.OS === "web"
        ? window.confirm("Are you sure you want to permanently delete this attraction?")
        : await new Promise((resolve) =>
            Alert.alert(
              "Delete Attraction",
              "Are you sure you want to permanently delete this attraction?",
              [
                { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
                { text: "Delete", style: "destructive", onPress: () => resolve(true) },
              ]
            )
          );

    if (!confirmed) return;

    try {
      setLoading(true);
      await deleteAttraction(id);
      // Navigate immediately — don't rely on Alert callback
      router.replace("/(tabs)/attractions");
    } catch (error: any) {
      setLoading(false);
      if (Platform.OS === "web") {
        window.alert(error.response?.data?.message || "Could not delete.");
      } else {
        Alert.alert("Delete Failed", error.response?.data?.message || "Could not delete.");
      }
    }
  };

  if (loading || !attraction) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <ActivityIndicator size="large" color="#3a5a40" />
      </View>
    );
  }

  const photoUrl = attraction.coverPhoto.startsWith("http")
    ? attraction.coverPhoto
    : `${API_BASE_URL}${attraction.coverPhoto}`;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: photoUrl }} style={styles.image} />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{attraction.name}</Text>
              <Text style={styles.district}>
                <Ionicons name="location" size={16} color="#588157" /> {attraction.district}
              </Text>
            </View>
          </View>

          <View style={styles.badgesRow}>
            <View style={[styles.badge, styles[`badge${attraction.difficultyLevel}`]]}>
              <Text style={styles.badgeText}>{attraction.difficultyLevel} Hike</Text>
            </View>
            {attraction.entryFee === 0 ? (
              <View style={[styles.badge, styles.badgeFree]}>
                <Text style={styles.badgeText}>Free Entry</Text>
              </View>
            ) : (
              <View style={[styles.badge, styles.badgeFee]}>
                <Text style={styles.badgeText}>Rs {attraction.entryFee}</Text>
              </View>
            )}
          </View>

          <Text style={styles.sectionTitle}>About</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editDescription}
              onChangeText={setEditDescription}
              multiline
            />
          ) : (
            <Text style={styles.description}>{attraction.description}</Text>
          )}

          {!isEditing && attraction.additionalPhotos && attraction.additionalPhotos.length > 0 && (
            <View style={styles.gallerySection}>
              <Text style={styles.sectionTitle}>Gallery</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
                {attraction.additionalPhotos.map((photoUri, idx) => (
                  <Image 
                    key={idx} 
                    source={{ uri: photoUri.startsWith("http") ? photoUri : `${API_BASE_URL}${photoUri}` }} 
                    style={styles.galleryImage} 
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {isEditing && (
            <View style={styles.editSection}>
              <Text style={styles.sectionTitle}>Difficulty Level</Text>
              <View style={styles.row}>
                {["Easy", "Moderate", "Hard"].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.choiceButton, editDifficulty === level && styles.choiceButtonActive]}
                    onPress={() => setEditDifficulty(level)}
                  >
                    <Text style={[styles.choiceText, editDifficulty === level && styles.choiceTextActive]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.providerCard}>
            <Ionicons name="person-circle" size={40} color="#a3b18a" />
            <View>
              <Text style={styles.providerLabel}>Submitted by</Text>
              <Text style={styles.providerName}>{attraction.provider?.name || "Unknown Explorer"}</Text>
            </View>
          </View>

          {isOwnerOrAdmin() && (
            <View style={styles.actionContainer}>
              {isEditing ? (
                <>
                  <TouchableOpacity style={styles.saveButton} onPress={handleUpdate} disabled={saving}>
                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => {
                    setIsEditing(false);
                    setEditDescription(attraction.description);
                    setEditDifficulty(attraction.difficultyLevel);
                  }}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.manageRow}>
                  <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                    <Ionicons name="pencil" size={20} color="#ffffff" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Ionicons name="trash" size={20} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#dad7cd" },
  centered: { justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: 40 },
  imageContainer: { width: "100%", height: 300, position: "relative" },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    backgroundColor: "#dad7cd",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: 24,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "900", color: "#344e41", marginBottom: 6 },
  district: { fontSize: 16, color: "#588157", fontWeight: "600" },
  badgesRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  badgeEasy: { backgroundColor: "#d1fae5" },
  badgeModerate: { backgroundColor: "#fef3c7" },
  badgeHard: { backgroundColor: "#fee2e2" },
  badgeFree: { backgroundColor: "#dbeafe" },
  badgeFee: { backgroundColor: "#e0e7ff" },
  badgeText: { fontSize: 13, fontWeight: "700", color: "#344e41" },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#344e41", marginBottom: 12 },
  description: { fontSize: 15, color: "#588157", lineHeight: 24, marginBottom: 24 },
  gallerySection: { marginBottom: 24 },
  galleryScroll: { gap: 12 },
  galleryImage: { width: 140, height: 140, borderRadius: 16, resizeMode: "cover" },
  
  // Edit mode styles
  input: { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#a3b18a", borderRadius: 12, padding: 14, color: "#344e41", fontSize: 15, marginBottom: 24 },
  textArea: { height: 120, textAlignVertical: "top" },
  editSection: { marginBottom: 24 },
  row: { flexDirection: "row", gap: 10 },
  choiceButton: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#a3b18a", alignItems: "center" },
  choiceButtonActive: { backgroundColor: "#3a5a40", borderColor: "#3a5a40" },
  choiceText: { color: "#588157", fontWeight: "600" },
  choiceTextActive: { color: "#ffffff" },

  providerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#a3b18a",
    gap: 12,
    marginBottom: 24,
  },
  providerLabel: { fontSize: 12, color: "#588157", fontWeight: "700", textTransform: "uppercase" },
  providerName: { fontSize: 16, color: "#344e41", fontWeight: "800" },
  
  actionContainer: { borderTopWidth: 1, borderTopColor: "#a3b18a", paddingTop: 24 },
  manageRow: { flexDirection: "row", gap: 12 },
  editButton: { flex: 1, backgroundColor: "#3a5a40", flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 16, borderRadius: 14, gap: 8 },
  editButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  deleteButton: { backgroundColor: "#fef2f2", width: 56, justifyContent: "center", alignItems: "center", borderRadius: 14, borderWidth: 1, borderColor: "#fca5a5" },
  
  saveButton: { backgroundColor: "#3a5a40", padding: 16, borderRadius: 14, alignItems: "center", marginBottom: 12 },
  saveButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  cancelButton: { padding: 16, alignItems: "center" },
  cancelButtonText: { color: "#588157", fontSize: 16, fontWeight: "700" },
});
