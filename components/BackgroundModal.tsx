import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Button, Text } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface BackgroundOption {
  id: string | number;
  name: string;
  value: any;
  type: "default" | "custom";
}

interface BackgroundModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (background: BackgroundOption) => void;
  language: string;
}

const BACKGROUND_KEY = "selectedBackground";
const CUSTOM_IMAGE_KEY = "customBackgroundImage";

// Pre-defined background options
const backgroundOptions: BackgroundOption[] = [
  {
    id: 1,
    name: "Bricks",
    value: require("@/assets/images/bricks.jpeg"),
    type: "default",
  },
  {
    id: 2,
    name: "Kotel",
    value: require("@/assets/images/kotel.jpg"),
    type: "default",
  },
  {
    id: 3,
    name: "bc1",
    value: require("@/assets/images/bc1.jpeg"),
    type: "default",
  },
  {
    id: 4,
    name: "bc2",
    value: require("@/assets/images/bc2.jpeg"),
    type: "default",
  },
  {
    id: 5,
    name: "bc3",
    value: require("@/assets/images/bc3.jpeg"),
    type: "default",
  },
  {
    id: 6,
    name: "bc4",
    value: require("@/assets/images/bc4.jpeg"),
    type: "default",
  },
  {
    id: 7,
    name: "bc5",
    value: require("@/assets/images/bc5.jpeg"),
    type: "default",
  },
  {
    id: 8,
    name: "bc6",
    value: require("@/assets/images/bc6.jpeg"),
    type: "default",
  },
];

const BackgroundModal = ({
  visible,
  onClose,
  onSelect,
  language,
}: BackgroundModalProps) => {
  const [customImage, setCustomImage] = useState<string | null>(null);
  const windowHeight = Dimensions.get("window").height;
  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        language === "en" ? "Permission Required" : "נדרשת הרשאה",
        language === "en"
          ? "Please grant access to your photo library to select custom backgrounds."
          : "אנא אשר גישה לספריית התמונות שלך כדי לבחור רקעים מותאמים אישית.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images", // Use string 'Images' as a fallback
        quality: 0.8,
        allowsEditing: true,
        aspect: [16, 9],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        const customBackground: BackgroundOption = {
          id: "custom",
          name: "Custom Background",
          value: selectedImage.uri,
          type: "custom",
        };

        // Save the custom image URI
        await AsyncStorage.setItem(CUSTOM_IMAGE_KEY, selectedImage.uri);
        setCustomImage(selectedImage.uri);
        onSelect(customBackground);
        onClose();
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        language === "en" ? "Error" : "שגיאה",
        language === "en"
          ? "Failed to load image. Please try again."
          : "טעינת התמונה נכשלה. אנא נסה שוב.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.modalContainer}>
          <View
            style={[styles.modalContent, { maxHeight: windowHeight * 0.9 }]}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              bounces={false}
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.modalTitle}>
                {language === "en" ? "Select Background" : "בחר רקע"}
              </Text>

              <Button
                mode="contained"
                onPress={pickImage}
                style={styles.customButton}
              >
                {language === "en" ? "Choose from Device" : "בחר מהמכשיר"}
              </Button>

              <Text style={styles.sectionTitle}>
                {language === "en" ? "Default Backgrounds" : "רקעים מובנים"}
              </Text>

              <View style={styles.imageGrid}>
                {backgroundOptions.map((bg) => (
                  <TouchableOpacity
                    key={bg.id}
                    style={styles.imageOption}
                    onPress={() => {
                      onSelect(bg);
                      onClose();
                    }}
                  >
                    <Image source={bg.value} style={styles.thumbnailImage} />
                    <Text style={styles.imageName}>{bg.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Button
                mode="outlined"
                onPress={onClose}
                style={styles.cancelButton}
              >
                {language === "en" ? "Cancel" : "ביטול"}
              </Button>
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  scrollContent: {
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    marginVertical: 10,
    textAlign: "left",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  imageOption: {
    width: "45%",
    margin: 5,
    alignItems: "center",
  },
  thumbnailImage: {
    width: "100%",
    height: 100,
    borderRadius: 5,
  },
  imageName: {
    marginTop: 5,
    textAlign: "center",
  },
  customButton: {
    marginBottom: 15,
  },
  cancelButton: {
    marginTop: 15,
  },
});

export { BackgroundModal, backgroundOptions, BACKGROUND_KEY, CUSTOM_IMAGE_KEY };
