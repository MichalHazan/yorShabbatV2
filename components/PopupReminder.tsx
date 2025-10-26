import React, { useEffect, useState } from "react";
import { View, Text, Modal, Button, StyleSheet } from "react-native";
import { AVPlaybackSource, Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEvents } from "@/context/EventsContext";
// Define sounds with proper require statements
type SoundItem = {
  id: number;
  name: string;
  file: number; // require() returns a numeric asset ID in React Native
};

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



const PopupReminder = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [alarmTime, setAlarmTime] = useState<Date | null>(null);
  const [selectedSound, setSelectedSound] = useState<number>(1);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const { events } = useEvents();
  const [titlePopup, setTitlePopup] = useState("שבת נכנסת בקרוב");


  useEffect(() => {
    // Load alarm details from AsyncStorage when component mounts
    const loadAlarmDetails = async () => {
      try {
        const alarmData = await AsyncStorage.getItem("shabbatAlarm");
        if (alarmData) {
          const { time, sound, notify } = JSON.parse(alarmData);
          const alertTime = new Date(time);
          // const testTime = "2024-11-13T12:15:00.000Z";
          setAlarmTime(new Date(alertTime));
          setSelectedSound(sound);
        }
      } catch (error) {
        console.error("Failed to load alarm details:", error);
      }
    };
    
    loadAlarmDetails();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (alarmTime) {
        if (
          now.getDate() == alarmTime.getDate() &&
          now.getMonth() == alarmTime.getMonth() &&
          now.getHours() == alarmTime.getHours() &&
          now.getMinutes() == alarmTime.getMinutes()
        ) {
         // console.log("now: ", now.getHours());
          //console.log("alarmTime: ", alarmTime.getHours());
          // Show the pop-up and play the sound
          setModalVisible(true);
          playSound(selectedSound);
          // Clear the interval to stop checking
          clearInterval(interval);
          setAlarmTime(null);
        }
      }
      if (events.length > 0) {
       // console.log("events: ", events)
        for (let i = 0; i < events.length; i++) {
          const event = events[i];
          const eventTime = event.time ? new Date(event.time) : null;
          if (
            eventTime&&
            now.getDate() == eventTime.getDate() &&
            now.getMonth() == eventTime.getMonth() &&
            now.getHours() == eventTime.getHours()  &&
            now.getMinutes() == eventTime.getMinutes() 
          ) {
            setTitlePopup(event.title)
            // Show the pop-up and play the sound
            setModalVisible(true);
            playSound(event.sound);
            // Clear the interval to stop checking
            clearInterval(interval);
            setAlarmTime(null);
          }
          
        }
      }
    }, 40000); // Check every 40 second

    return () => clearInterval(interval);
  }, [alarmTime, selectedSound, events]);

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

  const handleCloseModal = () => {
    setModalVisible(false);
    stopSound();
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>{titlePopup}</Text>
          <Button title="Close" onPress={handleCloseModal} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
  },
  modalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
});

export default PopupReminder;
