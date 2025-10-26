// AlarmModal.js
import React, { useState, useEffect, useContext } from "react";
import { Modal, View, Text, Button, StyleSheet } from "react-native";
import { AVPlaybackSource, Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { ShabbatTime } from "@/utils/types";
import { LanguageContext } from "@/context/LanguageContext";


type AlarmModalProps = {
  visible: boolean;
  onClose: () => void;
  shabbatDetails: ShabbatTime | null;
};
type SoundItem = {
  id: number;
  name: string;
  file: number; // require() returns a number in RN bundle
};

// Define sounds with unique IDs and references
const sounds: SoundItem[] = [
  { id: 1,  name: "אשת חיל- סגנון אלרם",      file: require("@/assets/sounds/אשת חיל- סגנון אלרם.mp3") },
  { id: 2,  name: "אשת חיל- סגנון בארי",      file: require("@/assets/sounds/אשת חיל- סגנון בארי.mp3") },
  { id: 3,  name: "אשת חיל- סגנון בניהו",     file: require("@/assets/sounds/אשת חיל- סגנון בניהו.mp3") },
  { id: 4,  name: "אשת חיל- סגנון טוהר",      file: require("@/assets/sounds/אשת חיל- סגנון טוהר.mp3") },
  { id: 5,  name: "אשת חיל- סגנון יהלי",      file: require("@/assets/sounds/אשת חיל- סגנון יהלי.mp3") },
  { id: 6,  name: "אשת חיל- סגנון ירין",      file: require("@/assets/sounds/אשת חיל- סגנון ירין.mp3") },
  { id: 7,  name: "אשת חיל- סגנון רומי",      file: require("@/assets/sounds/אשת חיל- סגנון רומי.mp3") },
  { id: 8,  name: "אשת חיל- סגנון תאיר",      file: require("@/assets/sounds/אשת חיל- סגנון תאיר.mp3") },
  { id: 9,  name: "כי אשמרה- סגנון איילה",    file: require("@/assets/sounds/כי אשמרה- סגנון איילה.mp3") },
  { id: 10, name: "כי אשמרה- סגנון אסתר",     file: require("@/assets/sounds/כי אשמרה- סגנון אסתר.mp3") },
  { id: 11, name: "כי אשמרה- סגנון קורל",     file: require("@/assets/sounds/כי אשמרה- סגנון קורל.mp3") },
  { id: 12, name: "כי אשמרה-סגנון חסדיה",     file: require("@/assets/sounds/כי אשמרה-סגנון חסדיה.mp3") },
  { id: 13, name: "כי אשמרה-סגנון ליה",       file: require("@/assets/sounds/כי אשמרה-סגנון ליה.mp3") },
  { id: 14, name: "לכה דודי- סגנון אורי",     file: require("@/assets/sounds/לכה דודי- סגנון אורי.mp3") },
  { id: 15, name: "לכה דודי- סגנון אריאל",    file: require("@/assets/sounds/לכה דודי- סגנון אריאל.mp3") },
  { id: 16, name: "לְכָה דוֹדִי- סגנון חסדיה", file: require("@/assets/sounds/לְכָה דוֹדִי- סגנון חסדיה.mp3") },
  { id: 17, name: "לכה דודי- סגנון לינוי",    file: require("@/assets/sounds/לכה דודי- סגנון לינוי.mp3") },
  { id: 18, name: "שלום עליכם- סגנון גאיה",   file: require("@/assets/sounds/שלום עליכם- סגנון גאיה.mp3") },
  { id: 19, name: "שלום עליכם- סגנון דריה",   file: require("@/assets/sounds/שלום עליכם- סגנון דריה.mp3") },
  { id: 20, name: "שלום עליכם- סגנון הדר",    file: require("@/assets/sounds/שלום עליכם- סגנון הדר.mp3") },
  { id: 21, name: "שלום עליכם- סגנון יובל",   file: require("@/assets/sounds/שלום עליכם- סגנון יובל.mp3") },
  { id: 22, name: "שלום עליכם- סגנון לביא",   file: require("@/assets/sounds/שלום עליכם- סגנון לביא.mp3") },
  { id: 23, name: "שלום עליכם- סגנון נווה",   file: require("@/assets/sounds/שלום עליכם- סגנון נווה.mp3") },
  { id: 24, name: "שלום עליכם- סגנון רואי",   file: require("@/assets/sounds/שלום עליכם- סגנון רואי.mp3") },
  { id: 25, name: "שלום עליכם-סגנון אייחל",   file: require("@/assets/sounds/שלום עליכם-סגנון אייחל.mp3") },
];

const AlarmModal: React.FC<AlarmModalProps> = ({ visible, onClose, shabbatDetails }) => {
  const [selectedTime, setSelectedTime] = useState<number>(10);
  const [selectedSoundId, setSelectedSoundId] = useState<number>(1);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const { language } = useContext(LanguageContext);

  const stopSound = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      } catch (error) {
        console.error("Error stopping sound:", error);
      }
    }
  };

  const playSound = async (soundId: number) => {
    const selected = sounds.find((s) => s.id === soundId);
    if (!selected) return;
  
    await stopSound();
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound: newSound } = await Audio.Sound.createAsync(
        selected.file as AVPlaybackSource // 👈 explicitly typed
      );
      setSound(newSound);
      await newSound.playAsync();
    } catch (e) {
      console.error("Error playing sound:", e);
    }
  };
  

  const handleSaveAlarm = async () => {
    if (!shabbatDetails || !shabbatDetails.candle_lighting) {
      console.error("Shabbat details not loaded");
      stopSound();
      onClose();
      return;
    }

    const [hours, minutes] = shabbatDetails.candle_lighting.split(":").map(Number);
    const candleLightingTime = new Date(shabbatDetails.date);
    candleLightingTime.setDate(candleLightingTime.getDate() - 1);
    candleLightingTime.setHours(hours, minutes, 0, 0);

    const alarmTime = new Date(candleLightingTime.getTime() - selectedTime * 60 * 1000);

    try {
      await AsyncStorage.setItem(
        "shabbatAlarm",
        JSON.stringify({ time: alarmTime, soundId: selectedSoundId, notify: false })
      );
    } catch (error) {
      console.error("Failed to save alarm:", error);
    }

    stopSound();
    onClose();
  };

  const handleClose = () => {
    stopSound();
    onClose();
  };

  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  return (
    <Modal visible={visible} transparent onRequestClose={handleClose}>
      <View style={styles.centerView}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>
            {language === "en" ? "Set Alarm" : "יצירת התראה"}
          </Text>

          {!shabbatDetails ? (
            <Text>Loading Shabbat details...</Text>
          ) : (
            <>
              <Text>
                {language === "en"
                  ? "Select Time Before Candle Lighting"
                  : "בחר זמן התראה טרם כניסת שבת"}
              </Text>
              <Picker
                selectedValue={selectedTime}
                onValueChange={(value) => setSelectedTime(value as number)}
              >
                {[5, 10, 15, 20, 30, 45, 60].map((time) => (
                  <Picker.Item key={time} label={`${time} דקות`} value={time} />
                ))}
              </Picker>

              <Text>{language === "en" ? "Sound" : "צליל"}</Text>
              <Picker
                selectedValue={selectedSoundId}
                onValueChange={(value) => {
                  setSelectedSoundId(value);
                  playSound(value);
                }}
              >
                {sounds.map((s) => (
                  <Picker.Item key={s.id} label={s.name} value={s.id} />
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
            <Button
              title={language === "en" ? "Close" : "סגור"}
              onPress={handleClose}
              color="#febd59"
            />
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
    flexDirection: "row",
    justifyContent: "space-between",
  },
  centerView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
