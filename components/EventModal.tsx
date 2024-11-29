// EventModal.js
import React, { useState, useEffect, useContext } from "react";
import {
  Modal,
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Audio } from "expo-av";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import HebrewDateCalendar from "./HebrewDateCalendar";
import { useEvents } from "@/context/EventsContext";
import { LanguageContext } from "@/context/LanguageContext";

type EventModalProps = {
  visible: boolean;
  onClose: () => void;
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

const EventModal: React.FC<EventModalProps> = ({ visible, onClose }) => {
  const { language } = useContext(LanguageContext);
  const isHebrew = language === "he";
  const [title, setTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [selectedSound, setSelectedSound] = useState(sounds[0].value); // Default to first sound
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const { addEvent, events } = useEvents();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);

  // Filter events whenever the selected date changes
  useEffect(() => {
    if (selectedDate) {
      const filtered = events.filter((event) => {
        const eventDate = new Date(event.time);
        return (
          eventDate.getFullYear() === selectedDate.getFullYear() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getDate() === selectedDate.getDate()
        );
      });
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents([]);
    }
  }, [selectedDate, events]);

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

  const handleSaveEvent = async () => {
    if (selectedTime) {
      const combinedDateTime = new Date(
        selectedTime.getFullYear(),
        selectedTime.getMonth(),
        selectedTime.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes()
      );
      setSelectedTime(combinedDateTime);

      const newEvent = {
        title,
        time: selectedTime,
        sound: selectedSound,
      };
      addEvent(newEvent);
    }

    stopSound();
    handlClose();
  };

  const handlClose = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setTitle("");
    stopSound();
    onClose();
  };

  const handleSelectSound = (soundIndex: any) => {
    setSelectedSound(soundIndex);
    playSound(soundIndex); // Play selected sound
  };
  const handleDateChange = (date: Date) => {
    setShowDatePicker(false);
    setSelectedDate(date);
    if (selectedTime) {
      const combinedDateTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes()
      );
      setSelectedTime(combinedDateTime);
    } else {
      setSelectedTime(date);
    }
  };
  const handleTimeChange = (event: any, time: Date | undefined) => {
    setShowTimePicker(false);
    if (time) {
      if (selectedDate) {
        const combinedDateTime = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          time.getHours(),
          time.getMinutes()
        );
        setSelectedTime(combinedDateTime);
      } else {
        setSelectedTime(time);
      }
    }
  };

  React.useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);
  const handleTitlePress = () => {
    setIsEditing(true); // Enable editing mode when title is pressed
  };

  const handleTitleChange = (text: React.SetStateAction<string>) => {
    setTitle(text); // Update the title as user types
  };

  const handleEndEditing = () => {
    setIsEditing(false); // Disable editing mode when user finishes editing
  };

  return (
    <Modal visible={visible} transparent onRequestClose={handlClose}>
      <ScrollView nestedScrollEnabled={true} style={{ flex: 1 }}>
        <View style={styles.centerView}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>
              {language === "en" ? "Set Event" : "יצירת אירוע"}
            </Text>
            {isEditing ? (
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={handleTitleChange}
                onEndEditing={handleEndEditing}
                autoFocus={true}
              />
            ) : (
              <TouchableOpacity onPress={handleTitlePress}>
                <Text style={styles.title}>
                  {title
                    ? title
                    : language === "en"
                    ? "Click to edit"
                    : "לחץ לערוך כותרת"}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Text>
                {selectedTime
                  ? selectedTime.toLocaleDateString()
                  : "Select Date"}
              </Text>
            </TouchableOpacity>
            <View style={styles.calendar}>
              <HebrewDateCalendar
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
              />
            </View>
           

            <TouchableOpacity onPress={() => setShowTimePicker(true)}>
              <Text>
                Hour:{" "}
                {selectedTime
                  ? `${selectedTime
                      .getHours()
                      .toString()
                      .padStart(2, "0")}:${selectedTime
                      .getMinutes()
                      .toString()
                      .padStart(2, "0")}`
                  : language === "en"
                  ? "Click to select hour"
                  : "לחץ לבחירת שעה"}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={selectedTime || new Date()}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}

            <Text>{language === "en" ? "Select Sound" : "צליל"}</Text>
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
             {/* Display events for the selected date */}
             <View>
              {filteredEvents.length > 0 ? (
                <>
                  <Text style={styles.existingEventsTitle}>
                    {language === "en"
                      ? "There are existing events on this day:"
                      : "ישנם אירועים קיימים בתאריך זה:"}
                  </Text>
                  {filteredEvents.map((event, index) => (
                    <Text key={index} style={styles.eventText}>
                      {`${event.title} - ${new Date(event.time)
                        .getHours()
                        .toString()
                        .padStart(2, "0")}:${new Date(event.time)
                        .getMinutes()
                        .toString()
                        .padStart(2, "0")}`}
                    </Text>
                  ))}
                </>
              ) : (
                <Text style={styles.noEventsText}>
                  {language === "en"
                    ? "No events for this day"
                    : "אין אירועים ליום זה"}
                </Text>
              )}
            </View>
            <View style={styles.fixToText}>
              <Button
                title={language === "en" ? "Save" : "שמור "}
                onPress={handleSaveEvent}
                color="#a36b15"
              />
              <Button
                title={language === "en" ? "Close" : "סגור "}
                onPress={handlClose}
                color="#a36b15"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

export default EventModal;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
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
  titleInput: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    textAlign: "center",
  },
  calendar: {
    height: 150, // Set desired height
    width: "100%", // Adjust width if needed
    marginVertical: 20, // Optional margin for spacing
  },
  eventText: {
    fontSize: 16,
    marginVertical: 5,
    color: "#333",
  },
  noEventsText: {
    fontSize: 16,
    marginVertical: 5,
    color: "#888",
    fontStyle: "italic",
  },
  existingEventsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#a36b15", // Or any preferred color
    marginBottom: 10,
  },
});
