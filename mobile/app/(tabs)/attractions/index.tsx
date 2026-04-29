import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  Platform,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getAttractions } from "../../../src/services/attractionService";
import { API_BASE_URL } from "../../../src/config/apiConfig";

export default function AttractionsList() {
  const router = useRouter();
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchDistrict, setSearchDistrict] = useState("");

  const fetchAttractions = async (district = "") => {
    setLoading(true);
    try {
      const data = await getAttractions(district);
      setAttractions(data.data || []);
    } catch (error) {
      console.error("Failed to fetch attractions:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAttractions(searchDistrict);
    }, [])
  );

  const handleSearch = () => {
    fetchAttractions(searchDistrict);
  };

  const renderItem = ({ item }) => {
    const photoUrl = item.coverPhoto.startsWith("http")
      ? item.coverPhoto
      : `${API_BASE_URL}${item.coverPhoto}`;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(tabs)/attractions/${item._id}`)}
      >
        <Image source={{ uri: photoUrl }} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardDistrict}>
            <Ionicons name="location" size={14} color="#588157" /> {item.district}
          </Text>
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, styles[`badge${item.difficultyLevel}`]]}>
              <Text style={styles.badgeText}>{item.difficultyLevel}</Text>
            </View>
            {item.entryFee > 0 && (
              <View style={[styles.badge, styles.badgeFee]}>
                <Text style={styles.badgeText}>Rs {item.entryFee}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#344e41" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attractions</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(tabs)/attractions/submit")}
        >
          <Ionicons name="add" size={24} color="#344e41" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Filter by District (e.g. Kandy)"
          placeholderTextColor="#a3b18a"
          value={searchDistrict}
          onChangeText={setSearchDistrict}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3a5a40" />
        </View>
      ) : attractions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="leaf-outline" size={64} color="#a3b18a" />
          <Text style={styles.emptyText}>No attractions found.</Text>
        </View>
      ) : (
        <FlatList
          data={attractions}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
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
  addButton: { width: 40, height: 40, justifyContent: "center", alignItems: "flex-end" },
  searchContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#a3b18a",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    color: "#344e41",
    fontWeight: "500",
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: "#3a5a40",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  emptyText: { marginTop: 16, fontSize: 16, color: "#588157", fontWeight: "600" },
  listContainer: { padding: 16, gap: 16 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#a3b18a",
    shadowColor: "#344e41",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImage: { width: "100%", height: 180, resizeMode: "cover" },
  cardContent: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: "800", color: "#344e41", marginBottom: 4 },
  cardDistrict: { fontSize: 14, color: "#588157", fontWeight: "600", marginBottom: 12 },
  badgeContainer: { flexDirection: "row", gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeEasy: { backgroundColor: "#d1fae5" }, // Light green
  badgeModerate: { backgroundColor: "#fef3c7" }, // Light yellow
  badgeHard: { backgroundColor: "#fee2e2" }, // Light red
  badgeFee: { backgroundColor: "#e0e7ff" }, // Light blue
  badgeText: { fontSize: 12, fontWeight: "700", color: "#344e41" },
});
