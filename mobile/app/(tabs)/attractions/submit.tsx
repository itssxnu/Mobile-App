import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { createAttraction } from "../../../src/services/attractionService";

export default function SubmitAttraction() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [district, setDistrict] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("Easy");
  const [entryFee, setEntryFee] = useState("");
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [additionalPhotos, setAdditionalPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickCoverPhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9], // Landscape
      quality: 0.7,
    });

    if (!result.canceled) {
      setCoverPhoto(result.assets[0].uri);
    }
  };

  const pickAdditionalPhotos = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const newUris = result.assets.map(asset => asset.uri);
      setAdditionalPhotos(prev => [...prev, ...newUris].slice(0, 5)); // Limit to 5
    }
  };

  const removeAdditionalPhoto = (index) => {
    setAdditionalPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim() || !district.trim() || !coverPhoto) {
      Alert.alert("Required", "Please fill all required fields and upload a cover photo.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("district", district.trim());
      formData.append("difficultyLevel", difficultyLevel);
      formData.append("entryFee", entryFee ? entryFee : "0");

      const appendFile = async (fieldName: string, uri: string, index = "") => {
        if (Platform.OS === "web") {
          // On web, fetch the blob from the URI and append it
          const response = await fetch(uri);
          const blob = await response.blob();
          const filename = `photo${index}.jpg`;
          formData.append(fieldName, blob, filename);
        } else {
          // On mobile, use the RN-style object
          const filename = uri.split("/").pop() || `photo${index}.jpg`;
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;
          formData.append(fieldName, {
            uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
            name: filename,
            type: type,
          } as any);
        }
      };

      await appendFile("coverPhoto", coverPhoto);

      for (let i = 0; i < additionalPhotos.length; i++) {
        await appendFile("additionalPhotos", additionalPhotos[i], String(i));
      }

      await createAttraction(formData);
      // Navigate immediately — Alert callbacks don't fire on web
      router.back();
    } catch (err: any) {
      if (Platform.OS === "web") {
        window.alert(err.response?.data?.message || "Something went wrong. Please try again.");
      } else {
        Alert.alert("Submission Failed", err.response?.data?.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#344e41" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submit a Gem</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Basic Info</Text>
          
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Attraction Name *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Secret Waterfall" />
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>District *</Text>
            <TextInput style={styles.input} value={district} onChangeText={setDistrict} placeholder="e.g. Nuwara Eliya" />
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Description *</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              value={description} 
              onChangeText={setDescription} 
              placeholder="Tell us what makes it special..."
              multiline
              numberOfLines={4}
            />
          </View>

          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Difficulty Level</Text>
            <View style={styles.row}>
              {["Easy", "Moderate", "Hard"].map((level) => (
                <TouchableOpacity 
                  key={level} 
                  style={[styles.choiceButton, difficultyLevel === level && styles.choiceButtonActive]}
                  onPress={() => setDifficultyLevel(level)}
                >
                  <Text style={[styles.choiceText, difficultyLevel === level && styles.choiceTextActive]}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Entry Fee (Rs)</Text>
            <TextInput 
              style={styles.input} 
              value={entryFee} 
              onChangeText={setEntryFee} 
              placeholder="0 if free" 
              keyboardType="numeric" 
            />
          </View>

          <Text style={styles.sectionTitle}>Cover Photo *</Text>
          <TouchableOpacity style={styles.photoUpload} onPress={pickCoverPhoto}>
            {coverPhoto ? (
              <Image source={{ uri: coverPhoto }} style={styles.uploadedPhoto} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera-outline" size={40} color="#a3b18a" />
                <Text style={styles.photoText}>Tap to Upload Cover</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Additional Photos</Text>
            <Text style={styles.photoCount}>{additionalPhotos.length}/5</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.additionalPhotosScroll}>
            {additionalPhotos.map((uri, idx) => (
              <View key={idx} style={styles.additionalPhotoWrapper}>
                <Image source={{ uri }} style={styles.additionalPhoto} />
                <TouchableOpacity style={styles.removePhotoBtn} onPress={() => removeAdditionalPhoto(idx)}>
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {additionalPhotos.length < 5 && (
              <TouchableOpacity style={styles.addMorePhotoBtn} onPress={pickAdditionalPhotos}>
                <Ionicons name="add" size={30} color="#a3b18a" />
              </TouchableOpacity>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Submit Attraction</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#dad7cd" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 30,
    paddingBottom: 15,
    backgroundColor: "#dad7cd",
    borderBottomWidth: 1,
    borderBottomColor: "#a3b18a",
  },
  backButton: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#344e41" },
  scroll: { padding: 20, paddingBottom: 60 },
  card: { backgroundColor: "#ffffff", borderRadius: 24, padding: 24, borderWidth: 1, borderColor: "#a3b18a" },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#344e41", marginBottom: 16, marginTop: 10 },
  fieldWrapper: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "700", color: "#588157", marginBottom: 6, textTransform: "uppercase" },
  input: { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#a3b18a", borderRadius: 12, padding: 14, color: "#344e41", fontSize: 16 },
  textArea: { height: 100, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 10 },
  choiceButton: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#a3b18a", alignItems: "center" },
  choiceButtonActive: { backgroundColor: "#3a5a40", borderColor: "#3a5a40" },
  choiceText: { color: "#588157", fontWeight: "600" },
  choiceTextActive: { color: "#ffffff" },
  photoUpload: { height: 200, borderRadius: 16, borderWidth: 2, borderColor: "#a3b18a", borderStyle: "dashed", overflow: "hidden", marginBottom: 16 },
  photoPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8f9fa" },
  photoText: { marginTop: 8, color: "#588157", fontWeight: "600" },
  uploadedPhoto: { width: "100%", height: "100%", resizeMode: "cover" },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  photoCount: { fontSize: 14, color: "#588157", fontWeight: "700" },
  additionalPhotosScroll: { paddingBottom: 24, gap: 12 },
  additionalPhotoWrapper: { width: 100, height: 100, borderRadius: 12, overflow: "hidden", position: "relative" },
  additionalPhoto: { width: "100%", height: "100%", resizeMode: "cover" },
  removePhotoBtn: { position: "absolute", top: 4, right: 4, backgroundColor: "rgba(0,0,0,0.5)", width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  addMorePhotoBtn: { width: 100, height: 100, borderRadius: 12, borderWidth: 2, borderColor: "#a3b18a", borderStyle: "dashed", justifyContent: "center", alignItems: "center", backgroundColor: "#f8f9fa" },
  primaryButton: { backgroundColor: "#3a5a40", borderRadius: 14, padding: 16, alignItems: "center" },
  primaryButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
});
