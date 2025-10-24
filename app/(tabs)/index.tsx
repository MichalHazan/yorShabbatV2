import React, { useContext, useEffect, useState } from "react";
import { fetchUserLocation } from "@/utils/locationUtils";
import { calculateShabbatTimes } from "@/utils/shabbatCalc";
import { ShabbatTime } from "@/utils/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, StyleSheet, Text, ImageBackground } from "react-native";
import {
  Button,
  Menu,
  Divider,
  PaperProvider,
  IconButton,
} from "react-native-paper";
import ShabbatDetailsCard from "@/components/ShabbatDetailsCard";
import TitleCard from "@/components/TitleCard";
import AlarmModal from "@/components/AlarmModal";
import EventModal from "@/components/EventModal";
import LanguageModal from "@/components/LanguageModal";
import Parasha from "@/components/Parasha";
import PopupReminder from "@/components/PopupReminder";
import { useEvents } from "@/context/EventsContext";
import { LanguageContext } from "@/context/LanguageContext";
import {
  BackgroundOption,
  BackgroundModal,
  backgroundOptions,
  BACKGROUND_KEY,
} from "@/components/BackgroundModal";

const SHABBAT_TIMES_KEY = "shabbatTimes";
const SHABBAT_TIMES_EXPIRY = 2; // 2 days
const LOCATION_KEY = "location";
// Define sounds with proper require statements

const HomeScreen = () => {
  const { language, setLanguage } = useContext(LanguageContext);
  const [shabbatDetails, setShabbatDetails] = useState<ShabbatTime | null>(
    null
  );
  const [activeComponent, setActiveComponent] = useState<
    "Parasha" | "TitleCard"
  >("Parasha");
  const [visible, setVisible] = useState(false);
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const { events } = useEvents();
  const [todayEvent, setTodayEvent] = useState("");
  const [selectedBackground, setSelectedBackground] =
    useState<BackgroundOption>(backgroundOptions[0]);
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [locationFetched, setLocationFetched] = useState(false); // Track if location is fetched

  //background
  const handleBackgroundSelect = async (background: BackgroundOption) => {
    try {
      await AsyncStorage.setItem(BACKGROUND_KEY, JSON.stringify(background));
      setSelectedBackground(background);
    } catch (error) {
      console.error("Error saving background preference:", error);
    }
  };

  const clearStorage = async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`${key} successfully removed!`);
    } catch (e) {
      console.error(`Error removing ${key}:`, e);
    }
  };
  const handleLanguageChange = () => {
    setLanguage(language === "en" ? "he" : "en");
  };
  useEffect(() => {
    clearStorage(SHABBAT_TIMES_KEY)
    const fetchShabbatTimes = async () => {
      setLocationFetched(false);
      try {
        const today = new Date();
        const todayDayOfWeek = today.getDay(); // 5 = Friday, 6 = Saturday
        const cachedShabbatTimes = await AsyncStorage.getItem(
          SHABBAT_TIMES_KEY
        );
        // Retrieve cached location to check its validity
        const cachedLocation = await AsyncStorage.getItem(LOCATION_KEY);
        // // Check network status
        // const netInfo = await NetInfo.fetch();
        // if (!netInfo.isConnected) {
        //   // User is offline
        if (cachedLocation) {
          const {
            data: { latitude, longitude },
          } = JSON.parse(cachedLocation);

          // Skip using cached data if latitude or longitude is invalid
          if (latitude <= 1 || longitude <= 1) {
            console.log("Invalid cached location data. Clearing storage...");

            await clearStorage(SHABBAT_TIMES_KEY);
          } else if (cachedShabbatTimes) {
            const { data, timestamp } = JSON.parse(cachedShabbatTimes);
            const now = new Date().getTime();
            const expirationTime =
              timestamp + SHABBAT_TIMES_EXPIRY * 24 * 60 * 60 * 1000;
            if (now < expirationTime) {
              setShabbatDetails(
                data.find((time: { date: string | number | Date }) => {
                  const shabbatDate = new Date(time.date);

                  // Check if the Shabbat date is today or in the future
                  if (shabbatDate.toDateString() === today.toDateString()) {
                    // Keep the current Shabbat if today is Friday or Saturday
                    return todayDayOfWeek === 5 || todayDayOfWeek === 6;
                  }

                  // Otherwise, find the next Shabbat in the future
                  return shabbatDate >= today;
                })
              );
              return;
            }
          }
        }

        // }
        let latitude, longitude, city;
        // Only fetch location once
        if (!locationFetched ) {
          clearStorage(SHABBAT_TIMES_KEY);
          setLocationFetched(true); // Set flag to true once location is fetched
          ({ latitude, longitude, city } = await fetchUserLocation());
          await AsyncStorage.setItem(
            LOCATION_KEY,
            JSON.stringify({
              data: { latitude, longitude },
              timestamp: new Date().getTime(),
            })
          );
        }
        const shabbatTimes = await calculateShabbatTimes(latitude, longitude, city);
        // Find the next Shabbat, including today if it's Friday or Saturday
        const nextShabbat =
          shabbatTimes?.find((time: { date: string | number | Date }) => {
            const shabbatDate = new Date(time.date);

            // Check if the Shabbat date is today or in the future
            if (shabbatDate.toDateString() === today.toDateString()) {
              // Keep the current Shabbat if today is Friday or Saturday
              return todayDayOfWeek === 5 || todayDayOfWeek === 6;
            }

            // Otherwise, find the next Shabbat in the future
            return shabbatDate >= today;
          }) || null;
        setShabbatDetails(nextShabbat);
        await AsyncStorage.setItem(
          SHABBAT_TIMES_KEY,
          JSON.stringify({
            data: shabbatTimes,
            timestamp: new Date().getTime(),
          })
        );
      } catch (error) {
        console.error("Error fetching Shabbat times:", error);
      }
    };

    fetchShabbatTimes();
  }, []);
  //events check
  useEffect(() => {
    const now = new Date();
    const todaysEvents: string[] = []; // Explicitly define the array type // Array to collect today's event titles

    if (events.length > 0) {
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        const eventTime = event.time ? new Date(event.time) : null;

        if (
          eventTime &&
          now.getDate() === eventTime.getDate() &&
          now.getMonth() === eventTime.getMonth()
        ) {
          todaysEvents.push(event.title); // Add event title to the array
        }
      }

      // If there are events today, join them; otherwise, set an empty string
      setTodayEvent(todaysEvents.length > 0 ? todaysEvents.join(", ") : "");
    } else {
      setTodayEvent(""); // Ensure it's empty if there are no events at all
    }
  }, [events]);

  const handleMenuItemPress = (option: string) => {
    setVisible(false);
    switch (option) {
      case "Add Alert":
        setShowAlarmModal(true);
        break;
      case "Add Event":
        setShowEventModal(true);
        break;
      case "Change Language":
        handleLanguageChange();
        break;
      default:
        break;
    }
  };

  return (
    <PaperProvider>
      <ImageBackground
        source={
          selectedBackground.type === "custom"
            ? { uri: selectedBackground.value }
            : selectedBackground.value
        }
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.container}>
          {/* PopupReminder to handle scheduled pop-ups and sound */}
          <View style={{ height: 0, overflow: "hidden" }}>
            <PopupReminder />
          </View>
          {/* Menu positioned absolutely in top-right corner */}
          <View style={styles.menuContainer}>
            <Menu
              visible={visible}
              onDismiss={() => setVisible(false)}
              anchor={
                <IconButton
                  icon="menu"
                  size={30}
                  onPress={() => setVisible(true)}
                />
              }
            >
              <Menu.Item
                onPress={() => handleMenuItemPress("Add Alert")}
                title={language === "en" ? "Add alert" : "הוסף התראה"}
              />
              <Menu.Item
                onPress={() => handleMenuItemPress("Add Event")}
                title={language === "en" ? "Add Event" : "הוסף אירוע"}
              />
              <Menu.Item
                onPress={() => handleMenuItemPress("Change Language")}
                title={language === "en" ? "Hebrew" : "אנגלית"}
              />
              <Menu.Item
                onPress={() => {
                  setVisible(false);
                  setShowBackgroundModal(true);
                }}
                title={language === "en" ? "Change Background" : "שנה רקע"}
              />
            </Menu>
          </View>

          {/* Main content */}
          <View style={styles.contentContainer}>
            <View style={styles.leftColumn}>
              {activeComponent === "Parasha" ? (
                <Parasha shabbatDetails={shabbatDetails} />
              ) : (
                <TitleCard />
              )}
              <Button
                icon="arrow-left-right-bold"
                onPress={() =>
                  setActiveComponent(
                    activeComponent === "Parasha" ? "TitleCard" : "Parasha"
                  )
                }
                children={undefined}
              ></Button>
            </View>
            <View style={styles.rightColumn}>
              <ShabbatDetailsCard
                shabbatDetails={shabbatDetails}
                selectedBackground={selectedBackground}
              />
            </View>
          </View>
          {/* Event */}
          <View style={styles.eventContainer}>
            <Text
              style={[styles.eventText, { fontFamily: "ShmulikCLMMedium" }]}
            >
              {todayEvent}
            </Text>
          </View>

          {/* Modals */}
          <AlarmModal
            visible={showAlarmModal}
            onClose={() => setShowAlarmModal(false)}
            shabbatDetails={shabbatDetails}
          />
          <EventModal
            visible={showEventModal}
            onClose={() => setShowEventModal(false)}
          />
          <LanguageModal
            visible={showLanguageModal}
            onClose={() => setShowLanguageModal(false)}
          />
          <BackgroundModal
            visible={showBackgroundModal}
            onClose={() => setShowBackgroundModal(false)}
            onSelect={handleBackgroundSelect}
            language={language}
          />
        </View>
      </ImageBackground>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
  },
  menuContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 1,
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  leftColumn: {
    flex: 1,
    padding: 16,
  },
  rightColumn: {
    flex: 1,
    padding: 16,
  },
  eventContainer: {
    position: "absolute",
    top: 0,
    right: "40%",
    zIndex: 1,
    padding: 8,
  },
  eventText: {
    fontSize: 20,
  },
});

export default HomeScreen;
