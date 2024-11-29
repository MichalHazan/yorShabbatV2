import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { EventsProvider } from "@/context/EventsContext";
import { LanguageProvider } from '@/context/LanguageContext';
export default function TabLayout() {
  const colorScheme = useColorScheme();
  useEffect(() => {
    // Lock the screen orientation to landscape globally
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);
  return (
    <LanguageProvider>
    <EventsProvider>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarStyle: { display: 'none' }
      }}> 
    </Tabs>
    </EventsProvider>
    </LanguageProvider>
  );
}
