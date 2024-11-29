import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ShabbatTime } from "@/utils/types";
import { LanguageContext } from "@/context/LanguageContext";
interface ShabbatDetailsCardProps {
  shabbatDetails: ShabbatTime | null;
}

const Parasha = ({ shabbatDetails }: ShabbatDetailsCardProps) => {
  const { language } = useContext(LanguageContext);
  return (
    <View style={styles.shabbatContainer}>
      {shabbatDetails && (
        <>
          <View style={styles.shabbatTimes}>
            <Text style={[{ fontFamily: "ShmulikCLMMedium" }, styles.title]}>
              {language === "en" ? "Parasha" : "פרשת השבוע"}
            </Text>
            <Text style={[{ fontFamily: "ShmulikCLMMedium" }, styles.content]}>
              {language === "en"
                ? shabbatDetails.torah_en
                : shabbatDetails.torah_hw}
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  shabbatContainer: {
    flex: 2,
    alignItems: "center",
    overflow: "hidden",
    justifyContent: "center",
  },
  shabbatTimes: {
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 36,
    textAlign: "center",
    marginBottom: 15,
  },
  content: {
    fontSize: 24,
  },
});

export default Parasha;
