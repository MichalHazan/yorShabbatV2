import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { IconButton } from "react-native-paper";

const MenuWithLabel = ({ language, onSelect }) => {
  const [visible, setVisible] = useState(false);

  const handleSelect = (key) => {
    setVisible(false);        // close the menu
    onSelect(key);            // call HomeScreen's handler
  };

  return (
    <View style={styles.container}>
      {/* Menu Button */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <IconButton icon="menu" size={28} />
        <Text style={styles.menuText}>
          {language === "en" ? "Menu" : "תפריט"}
        </Text>
      </TouchableOpacity>

      {/* Modal Menu */}
      <Modal transparent visible={visible} animationType="fade">
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPressOut={() => setVisible(false)}
        >
          <View style={styles.menuBox}>
            {[
              { key: "Add Alert", he: "הוסף התראה", en: "Add alert" },
              { key: "Add Event", he: "הוסף אירוע", en: "Add Event" },
              { key: "Change Language", he: "אנגלית", en: "Hebrew" },
              { key: "Change Background", he: "שנה רקע", en: "Change Background" },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                onPress={() => handleSelect(item.key)}
                style={styles.item}
              >
                <Text style={styles.itemText}>
                  {language === "en" ? item.en : item.he}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignSelf: "flex-end", padding: 8 },
  menuButton: { flexDirection: "row", alignItems: "center" },
  menuText: { fontSize: 18, color: "black" },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    zIndex: 9999,
    elevation: 9999,
  },
  menuBox: {
    marginTop: 60,
    marginRight: 15,
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 8,
    minWidth: 180,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
  },
  item: { paddingVertical: 10, paddingHorizontal: 15 },
  itemText: { fontSize: 16 },
});

export default MenuWithLabel;
