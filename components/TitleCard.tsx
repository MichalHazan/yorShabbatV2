import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ImageSourcePropType,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import the images using require()
const candleImage = require("@/assets/images/candle.png");

const TitleCard = () => {
  const [title, setTitle] = useState("Click to edit title");
  const [isEditing, setIsEditing] = useState(false);
  const [imageUri, setImageUri] = useState<string | ImageSourcePropType>(
    candleImage
  );

  useEffect(() => {
    setImageUri(candleImage);
    const loadData = async () => {
      const storedTitle = await AsyncStorage.getItem("title");
      const storedImageUri = await AsyncStorage.getItem("imageUri");
      if (storedTitle) setTitle(storedTitle);
      if (storedImageUri) setImageUri(storedImageUri); // Set image URI if one is stored
    };
    loadData();
  }, []);

  // Save the title to AsyncStorage whenever it changes
  useEffect(() => {
    AsyncStorage.setItem("title", title);
  }, [title]);

  // Save image URI to AsyncStorage whenever it changes
  useEffect(() => {
    if (typeof imageUri === "string") {
      AsyncStorage.setItem("imageUri", imageUri);
    }
  }, [imageUri]);

  const handleTitlePress = () => {
    setIsEditing(true); // Enable editing mode when title is pressed
  };

  const handleTitleChange = (text: React.SetStateAction<string>) => {
    setTitle(text); // Update the title as user types
  };

  const handleEndEditing = () => {
    setIsEditing(false); // Disable editing mode when user finishes editing
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access the gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.leftColumn}>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={typeof imageUri === "string" ? { uri: imageUri } : imageUri} // Check if imageUri is a string or asset
          style={styles.circleImage}
        />
      </TouchableOpacity>
      {isEditing ? (
        <TextInput
          style={[styles.titleInput, { fontFamily: "ShmulikCLMMedium" },]}
          value={title}
          onChangeText={handleTitleChange}
          onEndEditing={handleEndEditing}
          autoFocus={true}
        />
      ) : (
        <TouchableOpacity onPress={handleTitlePress}>
          <Text style={[styles.title, { fontFamily: "ShmulikCLMMedium" },]}>{title}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  leftColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  circleImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  title: {
    marginTop: 11,
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center",
  },
  titleInput: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    textAlign: "center",
  },
});

export default TitleCard;
