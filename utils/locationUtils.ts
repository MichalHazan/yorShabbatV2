// app/utils/locationUtils.ts
// import axios from "axios";

// export const fetchUserLocation = async () => {
//   try {
//     const response = await axios.get("https://ipapi.co/json/");
//     const { latitude, longitude, city } = response.data;

//     if (latitude && longitude) {
//       return { latitude, longitude, city };
//     }
//     throw new Error("Location not found");
//   } catch (error) {
//     console.log(error)
//     console.warn("Using default location: Jerusalem");
//     return {
//       latitude: 31.7683,
//       longitude: 35.2137,
//       city: "Jerusalem",
//     };
//   }
// };
import * as Location from "expo-location";

export async function fetchUserLocation() {
  try {
    // Request permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Permission to access location was denied");
    }

    // Get current location
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest, // Use high accuracy for GPS
    });

    const { latitude, longitude } = location.coords;

    // Attempt to get city name (requires internet for reverse geocoding)
    let city = "Unknown";
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      console.log("inside fetch location latitude: ", latitude);
      console.log("inside fetch location longitude: ", longitude);
      if (reverseGeocode.length > 0) {
        city = reverseGeocode[0].city || "Unknown";
      }
      console.log("city: ", city);
    } catch {
      console.log("Could not fetch city name; returning coordinates only.");
    }
    if (longitude < 1 || latitude < 1) {
      console.error("unknown Error fetching location return jerusalem");
      return { latitude: 31.7683, longitude: 35.2137, city: "Jerusalem" };
    }

    return { latitude, longitude, city };
  } catch (error) {
    console.error("Error fetching location:", error);
    return { latitude: 31.7683, longitude: 35.2137, city: "Jerusalem" };
  }
}
