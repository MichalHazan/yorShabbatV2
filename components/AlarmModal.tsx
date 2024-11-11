// AlarmModal.js
import React, { useState, useEffect } from "react";
import { Modal, View, Text, Button, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

type AlarmModalProps = {
  visible: boolean;
  onClose: () => void;
};

// Define sounds with proper require statements
const sounds = [
  { name: "Sound 1", value: require("@/assets/sounds/sound1.mp3") },
  { name: "Sound 2", value: require("@/assets/sounds/sound2.mp3") },
  { name: "Sound 3", value: require("@/assets/sounds/sound3.mp3") },
  { name: "Sound 4", value: require("@/assets/sounds/sound4.mp3") },
  { name: "Sound 5", value: require("@/assets/sounds/sound5.mp3") },
  { name: "Sound 6", value: require("@/assets/sounds/sound6.mp3") },
  { name: "Sound 7", value: require("@/assets/sounds/sound7.mp3") },
];

const AlarmModal: React.FC<AlarmModalProps> = ({ visible, onClose }) => {
  const [selectedTime, setSelectedTime] = useState<number>(10); // Default to 10 minutes
  const [selectedSound, setSelectedSound] = useState(sounds[0].value); // Default to first sound
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const playSound = async (soundUri: any) => {
    const { sound } = await Audio.Sound.createAsync(soundUri);
    setSound(sound);
    await sound.playAsync();
  };
  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync(); // Free up the resource after stopping
      setSound(null); // Clear the sound state
    }
  };

  const handleSaveAlarm = async () => {
    await AsyncStorage.setItem(
      "shabbatAlarm",
      JSON.stringify({ time: selectedTime, sound: selectedSound })
    );
    stopSound();
    onClose();
  };

  const handlClose = () => {
    stopSound();
    onClose();
  };

  const handleSelectSound = (soundUri: any) => {
    setSelectedSound(soundUri);
    playSound(soundUri); // Play selected sound
  };

  React.useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <View style={styles.centerView}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Set Alarm</Text>
          <Text>Select Time Before Candle Lighting</Text>
          <Picker
            selectedValue={selectedTime}
            onValueChange={(value) => setSelectedTime(value as number)}
          >
            {[5, 10, 15, 20, 30, 45, 60].map((time) => (
              <Picker.Item key={time} label={`${time} minutes`} value={time} />
            ))}
          </Picker>
          <Text>Select Sound</Text>
          <Picker
            selectedValue={selectedSound}
            onValueChange={handleSelectSound}
          >
            {sounds.map((sound, index) => (
              <Picker.Item key={index} label={sound.name} value={sound.value} />
            ))}
          </Picker>
          <Button title="Save Alarm" onPress={handleSaveAlarm} />
          <Button title="Close" onPress={handlClose} />
        </View>
      </View>
    </Modal>
  );
};

export default AlarmModal;

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    padding: 35,
    borderRadius: 20,
    shadowColor: "#000",
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  centerView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
