// AlarmModal.js
import React, { useState, useEffect, useContext } from "react";
import { Modal, View, Text, Button, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { ShabbatTime } from "@/utils/types";
import { LanguageContext } from "@/context/LanguageContext";

type AlarmModalProps = {
  visible: boolean;
  onClose: () => void;
  shabbatDetails: ShabbatTime | null;
};

// Define sounds with proper require statements
const sounds = [
  { id: 1, name: "Sound 1", value: require("@/assets/sounds/sound1.mp3") },
  { id: 2, name: "Sound 2", value: require("@/assets/sounds/sound2.mp3") },
  { id: 3, name: "Sound 3", value: require("@/assets/sounds/sound3.mp3") },
  { id: 4, name: "Sound 4", value: require("@/assets/sounds/sound4.mp3") },
  { id: 5, name: "Sound 5", value: require("@/assets/sounds/sound5.mp3") },
  { id: 6, name: "Sound 6", value: require("@/assets/sounds/sound6.mp3") },
  { id: 7, name: "Sound 7", value: require("@/assets/sounds/sound7.mp3") },
];

const AlarmModal: React.FC<AlarmModalProps> = ({
  visible,
  onClose,
  shabbatDetails,
}) => {
  const [selectedTime, setSelectedTime] = useState<number>(10); // Default to 10 minutes
  const [selectedSound, setSelectedSound] = useState(sounds[0].value); // Default to first sound
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const { language } = useContext(LanguageContext);
  
  const playSound = async (soundIndex: any) => {
    // If a sound is already loaded, stop and unload it before playing a new one
    if (sound) {
      try {
        await stopSound();
      } catch (e) {
        console.error("Error stopping sound:", e);
      }
    }

    try {
      const { sound: newSound } = await Audio.Sound.createAsync(soundIndex);
      setSound(newSound);
      await newSound.playAsync();
    } catch (e) {
      console.error("Error play sound:", e);
    }
  };
  const stopSound = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync(); // Free up the resource after stopping
        setSound(null); // Clear the sound state
      } catch (error) {
        console.error("Error stopping sound:", error);
      }
    }
  };

  const handleSaveAlarm = async () => {
    // If shabbatDetails or candle lighting time is not loaded, exit early
    if (!shabbatDetails || !shabbatDetails.candle_lighting) {
      console.error("Shabbat details are not loaded");
      stopSound();
      onClose();
      return;
    }

    // Convert candle lighting time from string to Date
    console.log("shabbatDetails.: ", shabbatDetails);
    // Create candleLightingTime in local time using today's date
    const [hours, minutes] = shabbatDetails.candle_lighting
      .split(":")
      .map(Number);

    const candleLightingTime = new Date(shabbatDetails.date); // Start with current local time
    candleLightingTime.setDate(candleLightingTime.getDate() - 1);

    // Set to today's date and shabbat candle lighting hours/minutes
    candleLightingTime.setHours(hours);
    candleLightingTime.setMinutes(minutes);
    candleLightingTime.setSeconds(0);
    candleLightingTime.setMilliseconds(0);
    console.log("Local candleLightingTime:", candleLightingTime);
    // Set the alarm time to the chosen minutes before candle lighting
    const alarmTime = new Date(
      candleLightingTime.getTime() - selectedTime * 60 * 1000
    );
    console.log("alarmTime: ", alarmTime);
    console.log("selectedSound: ", selectedSound);

    // Save the alarm details to AsyncStorage
    try {
      await AsyncStorage.setItem(
        "shabbatAlarm",
        JSON.stringify({ time: alarmTime, sound: selectedSound, notify: false })
      );
    } catch (error) {
      console.error(" Save the alarm Failed: ", error);
    }

    // Set the alarm
    stopSound();
    onClose();
  };

  const handlClose = () => {
    stopSound();
    onClose();
  };

  const handleSelectSound = (soundIndex: any) => {
    setSelectedSound(soundIndex);
    playSound(soundIndex); // Play selected sound
  };

  React.useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <Modal visible={visible} transparent onRequestClose={handlClose}>
      <View style={styles.centerView}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{language === "en" ? "Set Alarm" : "יצירת התראה"}</Text>
          {!shabbatDetails ? (
            <Text>Loading Shabbat details...</Text>
          ) : (
            <>
              <Text >{language === "en" ? "Select Time Before Candle Lighting" : " בחר זמן התראה טרם כניסת שבת"}</Text>
              <Picker
                selectedValue={selectedTime}
                onValueChange={(value) => setSelectedTime(value as number)}
              >
                {[5, 10, 15, 20, 30, 45, 60].map((time) => (
                  <Picker.Item
                    key={time}
                    label={`${time} minutes`}
                    value={time}
                  />
                ))}
              </Picker>

              <Text> {language === "en" ? "Sound" : "צליל"}</Text>
              <Picker
                selectedValue={selectedSound}
                onValueChange={(value) => handleSelectSound(value)}
              >
                {sounds.map((sound) => (
                  <Picker.Item
                    key={sound.id}
                    label={sound.name}
                    value={sound.value}
                  />
                ))}
              </Picker>
            </>
          )}
            <View style={styles.fixToText}>
            <Button
            title={language === "en" ? "Save" : "שמור"}
            onPress={handleSaveAlarm}
            color="#febd59"
          />
          <Button title={language === "en" ? "Close" : "סגור"} onPress={handlClose} color="#febd59" />
            </View>
         
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
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  centerView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
