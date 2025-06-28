import { View, Image, TextInput, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";

import { icons } from "@/constants";
import { GoogleInputProps } from "@/types/type";

const googlePlacesApiKey = process.env.EXPO_PUBLIC_PLACES_API_KEY;

const GoogleTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}: GoogleInputProps) => {
  const [searchText, setSearchText] = useState(initialLocation || "");
  const [GooglePlacesAutocomplete, setGooglePlacesAutocomplete] = useState<any>(null);

  useEffect(() => {
    if (googlePlacesApiKey) {
      // Only import if API key is available
      import("react-native-google-places-autocomplete").then((module) => {
        setGooglePlacesAutocomplete(() => module.default);
      }).catch(() => {
        console.warn("Failed to load GooglePlacesAutocomplete");
      });
    }
  }, [googlePlacesApiKey]);

  const handleSearch = () => {
    if (searchText.trim()) {
      // Use mock coordinates for demonstration
      handlePress({
        latitude: 37.7749,
        longitude: -122.4194,
        address: searchText,
      });
    }
  };

  // Always render the simple TextInput version
  return (
    <View
      className={`flex flex-row items-center justify-center relative z-50 rounded-xl ${containerStyle}`}
    >
      <View className="flex-1 flex-row items-center bg-white rounded-xl p-4 mx-5">
        <Image
          source={icon ? icon : icons.search}
          className="w-6 h-6 mr-3"
          resizeMode="contain"
        />
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder={initialLocation ?? "Where do you want to go?"}
          placeholderTextColor="gray"
          className="flex-1 text-base font-semibold"
          onSubmitEditing={handleSearch}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Image
              source={icons.close}
              className="w-4 h-4"
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default GoogleTextInput;
