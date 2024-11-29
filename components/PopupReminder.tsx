import React, { useEffect, useState } from "react";
import { View, Text, Modal, Button, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEvents } from "@/context/EventsContext";

const sounds = [
  { id: 1, name: "Sound 1", value: require("@/assets/sounds/sound1.mp3") },
  { id: 2, name: "Sound 2", value: require("@/assets/sounds/sound2.mp3") },
  { id: 3, name: "Sound 3", value: require("@/assets/sounds/sound3.mp3") },
  { id: 4, name: "Sound 4", value: require("@/assets/sounds/sound4.mp3") },
  { id: 5, name: "Sound 5", value: require("@/assets/sounds/sound5.mp3") },
  { id: 6, name: "Sound 6", value: require("@/assets/sounds/sound6.mp3") },
  { id: 7, name: "Sound 7", value: require("@/assets/sounds/sound7.mp3") },
];

const PopupReminder = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [alarmTime, setAlarmTime] = useState<Date | null>(null);
  const [selectedSound, setSelectedSound] = useState(sounds[0].value); // Default to first sound
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
