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
import { AVPlaybackSource, Audio } from "expo-av";
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


const EventModal: React.FC<EventModalProps> = ({ visible, onClose }) => {
  const { language } = useContext(LanguageContext);
  const isHebrew = language === "he";
  const [title, setTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [selectedSound, setSelectedSound] = useState<number>(1);
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
                onValueChange={(value) => {
                  setSelectedSound(value);
                  playSound(value);
                }}
              >
                {sounds.map((s) => (
                  <Picker.Item key={s.id} label={s.name} value={s.id} />
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
