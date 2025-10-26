// AlarmModal.js
import React, { useState, useEffect, useContext } from "react";
import { Modal, View, Text, Button, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { ShabbatTime } from "@/utils/types";
import { LanguageContext } from "@/context/LanguageContext";
import sound1 from "@/assets/sounds/אשת חיל- סגנון אלרם.mp3";
import sound2 from "@/assets/sounds/אשת חיל- סגנון בארי.mp3";
import sound3 from "@/assets/sounds/אשת חיל- סגנון בניהו.mp3";
import sound4 from "@/assets/sounds/אשת חיל- סגנון טוהר.mp3";
import sound5 from "@/assets/sounds/אשת חיל- סגנון יהלי.mp3";
import sound6 from "@/assets/sounds/אשת חיל- סגנון ירין.mp3";
import sound7 from "@/assets/sounds/אשת חיל- סגנון רומי.mp3";
import sound8 from "@/assets/sounds/אשת חיל- סגנון תאיר.mp3";
import sound9 from "@/assets/sounds/כי אשמרה- סגנון איילה.mp3";
import sound10 from "@/assets/sounds/כי אשמרה- סגנון אסתר.mp3";
import sound11 from "@/assets/sounds/כי אשמרה- סגנון קורל.mp3";
import sound12 from "@/assets/sounds/כי אשמרה-סגנון חסדיה.mp3";
import sound13 from "@/assets/sounds/כי אשמרה-סגנון ליה.mp3";
import sound14 from "@/assets/sounds/לכה דודי- סגנון אורי.mp3";
import sound15 from "@/assets/sounds/לכה דודי- סגנון אריאל.mp3";
import sound16 from "@/assets/sounds/לְכָה דוֹדִי- סגנון חסדיה.mp3";
import sound17 from "@/assets/sounds/לכה דודי- סגנון לינוי.mp3";
import sound18 from "@/assets/sounds/שלום עליכם- סגנון גאיה.mp3";
import sound19 from "@/assets/sounds/שלום עליכם- סגנון דריה.mp3";
import sound20 from "@/assets/sounds/שלום עליכם- סגנון הדר.mp3";
import sound21 from "@/assets/sounds/שלום עליכם- סגנון יובל.mp3";
import sound22 from "@/assets/sounds/שלום עליכם- סגנון לביא.mp3";
import sound23 from "@/assets/sounds/שלום עליכם- סגנון נווה.mp3";
import sound24 from "@/assets/sounds/שלום עליכם- סגנון רואי.mp3";
import sound25 from "@/assets/sounds/שלום עליכם-סגנון אייחל.mp3";
import sound26 from "@/assets/sounds/שלום עליכם-סגנון שירה.mp3";


type AlarmModalProps = {
  visible: boolean;
  onClose: () => void;
  shabbatDetails: ShabbatTime | null;
};

// Define sounds with proper require statements
const sounds = [
  { id: 1, name: "אשת חיל- סגנון אלרם", value: sound1 },
  { id: 2, name: "אשת חיל- סגנון בארי", value: sound2 },
  { id: 3, name: "אשת חיל- סגנון בניהו", value: sound3 },
  { id: 4, name: "אשת חיל- סגנון טוהר", value: sound4 },
  { id: 5, name: "אשת חיל- סגנון יהלי", value: sound5 },
  { id: 6, name: "אשת חיל- סגנון ירין", value: sound6 },
  { id: 7, name: "אשת חיל- סגנון רומי", value: sound7 },
  { id: 8, name: "אשת חיל- סגנון תאיר", value: sound8 },
  { id: 9, name: "כי אשמרה- סגנון איילה", value: sound9 },
  { id: 10, name: "כי אשמרה- סגנון אסתר", value: sound10 },
  { id: 11, name: "כי אשמרה- סגנון קורל", value: sound11 },
  { id: 12, name: "כי אשמרה-סגנון חסדיה", value: sound12 },
  { id: 13, name: "כי אשמרה-סגנון ליה", value: sound13 },
  { id: 14, name: "לכה דודי- סגנון אורי", value: sound14 },
  { id: 15, name: "לכה דודי- סגנון אריאל", value: sound15 },
  { id: 16, name: "לְכָה דוֹדִי- סגנון חסדיה", value: sound16 },
  { id: 17, name: "לכה דודי- סגנון לינוי", value: sound17 },
  { id: 18, name: "שלום עליכם- סגנון גאיה", value: sound18 },
  { id: 19, name: "שלום עליכם- סגנון דריה", value: sound19 },
  { id: 20, name: "שלום עליכם- סגנון הדר", value: sound20 },
  { id: 21, name: "שלום עליכם- סגנון יובל", value: sound21 },
  { id: 22, name: "שלום עליכם- סגנון לביא", value: sound22 },
  { id: 23, name: "שלום עליכם- סגנון נווה", value: sound23 },
  { id: 24, name: "שלום עליכם- סגנון רואי", value: sound24 },
  { id: 25, name: "שלום עליכם-סגנון אייחל", value: sound25 },
  { id: 26, name: "שלום עליכם-סגנון שירה", value: sound26 },
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
