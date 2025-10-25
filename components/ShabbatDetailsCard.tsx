import React, { useContext, useEffect } from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { ShabbatTime } from "@/utils/types";
import { toJewishDate, formatJewishDateInHebrew } from "jewish-date";
import { LanguageContext } from "@/context/LanguageContext";
import { BackgroundOption } from "./BackgroundModal";
interface ShabbatDetailsCardProps {
  shabbatDetails: ShabbatTime | null;
  selectedBackground: BackgroundOption | null;
}

const ShabbatDetailsCard = ({
  shabbatDetails,
  selectedBackground,
}: ShabbatDetailsCardProps) => {
  const { language } = useContext(LanguageContext);
  const isBrickBackground = selectedBackground?.name === "Bricks";
  const isHebrew = language === "he";
  const gregorianDate = new Date(); // Use the current date or pass a custom one
  const jewishDate = toJewishDate(gregorianDate); // Converts the Gregorian date to a Jewish date
  const jewishDateInHebrew = formatJewishDateInHebrew(jewishDate); // Formats the Jewish date in Hebrew
  const today = new Date();
  const todayDate =
    language === "en"
      ? today.toLocaleDateString("en-GB", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
      : today.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        });
  const heDay = `יום ${
    ["ראשון", "שני", "שלישי'", "רביעי", "חמישי'", "שישי", "שבת"][today.getDay()]
  }`;

  const isShabbatPeriod = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 5 = Friday, 6 = Saturday
    if (dayOfWeek === 5) {
      return true;
    }
    if (dayOfWeek === 6) {
      if (shabbatDetails) {
        // Shabbat ends on Saturday at havdalah time
        const saturdayEnd = new Date(
          `${shabbatDetails.date}T${shabbatDetails.havdalah}:00`
        );
        saturdayEnd.setDate(saturdayEnd.getDate() + 1); // Move to Saturday

        // Check if current time is between Friday and Saturday Havdalah
        if (now.getHours() <= saturdayEnd.getHours()) {
          return true;
        }
      }
    }
    return false;
  };

  const getMessageByDayAndTime = () => {
    const day = new Date().getDay();
    const now = new Date();
    if (shabbatDetails) {
      const candleLightingTime = new Date(shabbatDetails.candle_lighting);
      const havdalahTime = new Date(shabbatDetails.havdalah);

      if (day == 5 && now.getHours() - 2 >= candleLightingTime.getHours())
        return {
          he: "שבת שלום וסוף שבוע מבורך, מלא בחוויות נעימות ומרגיעות",
          en: "Shabbat Shalom and blessed weekend, full of pleasant and relaxing experiences",
          color: "#b84b4b",
        };
      if (day == 6 && now.getHours() > havdalahTime.getHours())
        return {
          he: "שיהיה שבוע טוב מלא באור, שמחה והצלחה",
          en: "Have a good week full of light, joy and success",
          color: "#F5A623",
        };

      switch (day) {
        case 0:
          return {
            he: "שיהיה יום נפלא, מלא בהזדמנויות חדשות והגשמה עצמית",
            en: "Have a wonderful day, full of new opportunities and self-fulfillment",
            color: "#0097b2",
          };
        case 1:
          return {
            he: "שהיום הזה יביא איתו רק בשורות טובות ורגעים מתוקים",
            en: "May this day bring only good news and sweet moments",
            color: "#ff3131",
          };
        case 2:
          return {
            he: "שיהיה יום קסום, מלא באנרגיות טובות והישגים משמחים",
            en: "Have a magical day, full of good energies and joyful achievements",
            color: "#8c52ff",
          };
        case 3:
          return {
            he: "שיהיה יום פורה ומוצלח, עם המון סיבות לחייך",
            en: "Have a productive and successful day, with lots of reasons to smile",
            color: "#568916",
          };
        case 4:
          return {
            he: "שהיום הזה יהיה מלא בהפתעות נעימות ורגעים בלתי נשכחים",
            en: "May this day be full of pleasant surprises and unforgettable moments",
            color: "#9d3896",
          };

        default:
          return { he: "", en: "", color: "#000000" };
      }
    }
    return { he: "", en: "", color: "#000000" };
  };

  return (
    <View style={styles.shabbatContainer}>
      {shabbatDetails && (
        <>
          <View
            style={[
              styles.orangeWave,
              { backgroundColor: isBrickBackground ? undefined : "#fafcff" },
            ]}
          >
            <View style={styles.waveContent}>
              <View style={styles.shabbatTimes}>
                <Text
                  style={[
                    styles.jewishDate,
                    { fontFamily: "ShmulikCLMMedium" },
                  ]}
                >
                  <Text
                    style={[
                      styles.jewishDate,
                      { fontFamily: "ShmulikCLMMedium" },
                    ]}
                  >
                    {isHebrew
                      ? `${heDay}\n${jewishDateInHebrew}`
                      : `${jewishDate.monthName.toString()} ${jewishDate.day.toString()}`}
                  </Text>
                  , {todayDate}
                </Text>

                <Text
                  style={[
                    styles.candleLighting,
                    { fontFamily: "ShmulikCLMMedium" },
                  ]}
                >
                  {language === "en"
                    ? `Shabbat Candle Lighting${
                        !isShabbatPeriod() ? " (upcoming)" : ""
                      }: ${shabbatDetails.candle_lighting}`
                    : `כניסת שבת${!isShabbatPeriod() ? " הקרובה" : ""}: ${
                        shabbatDetails.candle_lighting
                      }`}
                </Text>
                <Text
                  style={[styles.havdalah, { fontFamily: "ShmulikCLMMedium" }]}
                >
                  {language === "en"
                    ? `End of Shabbat${
                        !isShabbatPeriod() ? " (upcoming)" : ""
                      }: ${shabbatDetails.havdalah}`
                    : `יציאת שבת${!isShabbatPeriod() ? " הקרובה" : ""}: ${
                        shabbatDetails.havdalah
                      }`}
                </Text>
              </View>
              <View style={styles.shabbatPrayer}>
                <Text
                  style={[
                    styles.shabbatPrayerText,
                    { fontFamily: "ShmulikCLMMedium" },
                  ]}
                >
                  {isShabbatPeriod()
                    ? language === "en"
                      ? '"Baruch ata Adonai, Eloheinu Melech ha-olam, A-sher Ki-de-sha-nu Be-mitz-vo-tav Ve-tzi-va-nu Le-had-lik Ner Shel Sha-bbat."'
                      : '"ברוּךְ אַתָּה יי אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו וְצִוָּנוּ לְהַדְלִיק נֵר שֶׁל שַׁבָּת"'
                    : ""}
                  {!isShabbatPeriod() && (
                    <Text style={{ color: getMessageByDayAndTime()?.color }}>
                      {language === "en"
                        ? getMessageByDayAndTime()?.en
                        : getMessageByDayAndTime()?.he}
                    </Text>
                  )}
                </Text>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  shabbatContainer: {
    flex: 1,
    alignItems: "center",
    overflow: "hidden",
    justifyContent: "center",
  },
  orangeWave: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    // backgroundColor: "#febd59",
    // backgroundColor: "#fafcff",
    borderTopLeftRadius: 60, // Top-left corner radius
    borderTopRightRadius: 40, // Top-right corner radius
    borderBottomLeftRadius: 80, // Bottom-left corner radius
    borderBottomRightRadius: 80, // Bottom-right corner radius
    height: 300,
    zIndex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  waveContent: {
    position: "relative",
    zIndex: 2,
    width: "95%",
    marginLeft: "auto",
    padding: 5,
    color: "#000000",
    textAlign: "right",
    alignItems: "center",
  },
  shabbatTimes: {
    marginBottom: 10,
    alignItems: "center",
  },
  jewishDate: {
    fontSize: 16,
    textAlign: "center",
    padding: 3,
  },
  errorMessage: {
    color: "red",
    fontSize: 14,
  },
  candleLighting: {
    fontSize: 16,
    textAlign: "center",
    padding: 3,
  },
  havdalah: {
    fontSize: 16,
    textAlign: "center",
    padding: 3,
  },
  shabbatPrayer: {
    marginTop: 20,
    alignItems: "center",
  },
  shabbatPrayerText: {
    fontSize: 17,
    textAlign: "center",
  },
});

export default ShabbatDetailsCard;
