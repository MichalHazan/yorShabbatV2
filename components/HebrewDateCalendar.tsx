import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { toJewishDate, formatJewishDateInHebrew } from "jewish-date";
import { LanguageContext } from "@/context/LanguageContext";

interface HebrewDateCalendarProps {
  selectedDate?: Date | null;
  onDateChange: (date: Date) => void;
}

const HebrewDateCalendar: React.FC<HebrewDateCalendarProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const { language } = useContext(LanguageContext);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();
  const isHebrew = language === "he";

  const monthNamesHe = [
    "ינואר",
    "פברואר",
    "מרץ",
    "אפריל",
    "מאי",
    "יוני",
    "יולי",
    "אוגוסט",
    "ספטמבר",
    "אוקטובר",
    "נובמבר",
    "דצמבר",
  ];

  // Get the days of the current month and their English and Hebrew dates
  const getDaysInMonth = (month: number, year: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      const englishDate = new Date(date);
      const hebrewDate = toJewishDate(englishDate);
      const hebrewDateFormatted = formatJewishDateInHebrew(hebrewDate);
      days.push({
        englishDate,
        hebrewDateFormatted,
        hebrewDate: `${hebrewDate.monthName.toString()} ${hebrewDate.day.toString()} `,
      });
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const days = getDaysInMonth(
    currentMonth.getMonth(),
    currentMonth.getFullYear()
  );

  const daysOfWeekHe = [
    "יום ראשון",
    "יום שני",
    "יום שלישי",
    "יום רביעי",
    "יום חמישי",
    "יום שישי",
    "שבת",
  ];
  const daysOfWeekEn = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const handleDateClick = (day: {
    englishDate: Date;
    hebrewDateFormatted: string;
    hebrewDate: string;
  }) => {
    if (day.englishDate >= today) {
      onDateChange(day.englishDate);
    }
  };

  const getMonthTitle = () => {
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();
    if (isHebrew) {
      return `${monthNamesHe[month]} ${year}`;
    }
    return currentMonth.toLocaleString("en", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <ScrollView nestedScrollEnabled={true} style={{ flex: 1 }}>
      <View
        style={[
          styles.calendarContainer,
          { direction: isHebrew ? "rtl" : "ltr" },
        ]}
      >
        <View
          style={[
            styles.calendarHeader,
            { flexDirection: isHebrew ? "row-reverse" : "row" },
          ]}
        >
          <TouchableOpacity
            onPress={() =>
              setCurrentMonth(
                new Date(currentMonth.setMonth(currentMonth.getMonth() - 1))
              )
            }
            style={styles.navigationButton}
          >
            <Text style={styles.navigationText}>
              {isHebrew ? "הקודם" : "Previous"}
            </Text>
          </TouchableOpacity>
          <Text style={styles.calendarTitle}>{getMonthTitle()}</Text>
          <TouchableOpacity
            onPress={() =>
              setCurrentMonth(
                new Date(currentMonth.setMonth(currentMonth.getMonth() + 1))
              )
            }
            style={styles.navigationButton}
          >
            <Text style={styles.navigationText}>
              {isHebrew ? "הבא" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.daysOfWeek,
            { flexDirection: isHebrew ? "row-reverse" : "row" },
          ]}
        >
          {(isHebrew ? daysOfWeekHe : daysOfWeekEn).map((day, index) => (
            <View key={index} style={styles.dayHeader}>
              <Text style={styles.dayHeaderText}>{day}</Text>
            </View>
          ))}
        </View>

        <View
          style={[
            styles.calendarGrid,
            { flexDirection: isHebrew ? "row-reverse" : "row" },
          ]}
        >
          {days.map((day, index) => {
            const isPastDate = day.englishDate < today;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  isPastDate ? styles.pastDate : null,
                  selectedDate?.getTime() === day.englishDate.getTime()
                    ? styles.selected
                    : null,
                ]}
                onPress={() => handleDateClick(day)}
                disabled={isPastDate}
              >
                <Text style={styles.dateText}>
                  {day.englishDate.getDate()}.{day.englishDate.getMonth() + 1}
                </Text>
                <Text style={styles.hebrewDateText}>
                  {isHebrew ? day.hebrewDateFormatted : day.hebrewDate}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  calendarContainer: {
    paddingBottom: 16,
    paddingHorizontal: 8,
  },
  calendarHeader: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  navigationButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
  },
  navigationText: {
    fontSize: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    minWidth: 150,
  },
  daysOfWeek: {
    justifyContent: "space-around",
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    alignItems: "center",
  },
  dayHeaderText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  calendarGrid: {
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  calendarDay: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    margin: 4,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 16,
    marginBottom: 4,
  },
  hebrewDateText: {
    fontSize: 14,
    color: "#666",
  },
  selected: {
    backgroundColor: "#f0f8ff",
    borderColor: "#007bff",
    borderWidth: 2,
  },
  pastDate: {
    backgroundColor: "#f5f5f5",
    opacity: 0.7,
  },
});

export default HebrewDateCalendar;
