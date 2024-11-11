import React, { useEffect, useState } from "react";
import { fetchUserLocation } from "@/utils/locationUtils";
import { calculateShabbatTimes } from "@/utils/shabbatCalc";
import { ShabbatTime } from "@/utils/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  ImageBackground,
} from "react-native";
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
import { Audio } from "expo-av";
import Parasha from "@/components/Parasha";

const SHABBAT_TIMES_KEY = "shabbatTimes";
const SHABBAT_TIMES_EXPIRY = 2; // 2 days

const HomeScreen = () => {
  const [shabbatDetails, setShabbatDetails] = useState<ShabbatTime | null>(null);
  const [activeComponent, setActiveComponent] = useState<"Parasha" | "TitleCard">("Parasha");
  const [visible, setVisible] = useState(false);
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  useEffect(() => {
    const fetchShabbatTimes = async () => {
      try {
        const cachedShabbatTimes = await AsyncStorage.getItem(SHABBAT_TIMES_KEY);

        if (cachedShabbatTimes) {
          const { data, timestamp } = JSON.parse(cachedShabbatTimes);
          const now = new Date().getTime();
          const expirationTime = timestamp + SHABBAT_TIMES_EXPIRY * 24 * 60 * 60 * 1000;
          if (now < expirationTime) {
            setShabbatDetails(
              data.find(
                (time: { date: string | number | Date }) =>
                  new Date(time.date) >= new Date()
              )
            );
            return;
          }
        }

        const { latitude, longitude, city } = await fetchUserLocation();
        const shabbatTimes = await calculateShabbatTimes(latitude, longitude, city);
        const nextShabbat = shabbatTimes?.find(
          (time: { date: string | number | Date }) =>
            new Date(time.date) >= new Date()
        ) || null;
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
        setShowLanguageModal(true);
        break;
      default:
        break;
    }
  };

  return (
    <PaperProvider>
      <ImageBackground 
        source={require('@/assets/images/bricks.jpeg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
      <View style={styles.container}>
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
              title="Add Alert"
            />
            <Menu.Item
              onPress={() => handleMenuItemPress("Add Event")}
              title="Add Event"
            />
            <Menu.Item
              onPress={() => handleMenuItemPress("Change Language")}
              title="Change Language"
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
            <ShabbatDetailsCard shabbatDetails={shabbatDetails} />
          </View>
        </View>

        {/* Modals */}
        <AlarmModal
          visible={showAlarmModal}
          onClose={() => setShowAlarmModal(false)}
        />
        <EventModal
          visible={showEventModal}
          onClose={() => setShowEventModal(false)}
        />
        <LanguageModal
          visible={showLanguageModal}
          onClose={() => setShowLanguageModal(false)}
        />
      </View>
      </ImageBackground>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftColumn: {
    flex: 1,
    padding: 16,
  },
  rightColumn: {
    flex: 1,
    padding: 16,
  },
});

export default HomeScreen;