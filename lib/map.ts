import { Driver, MarkerData } from "@/types/type";

const directionsAPI = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

export const generateMarkersFromData = ({
  data,
  userLatitude,
  userLongitude,
}: {
  data: Driver[];
  userLatitude: number;
  userLongitude: number;
}): MarkerData[] => {
  return data.map((driver, index) => {
    const latOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005
    const lngOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005

    return {
      latitude: userLatitude + latOffset,
      longitude: userLongitude + lngOffset,
      title: `${driver.first_name} ${driver.last_name}`,
      id: driver.driver_id || index + 1, // Fallback to index + 1 if driver_id is undefined
      first_name: driver.first_name,
      last_name: driver.last_name,
      profile_image_url: driver.profile_image_url,
      car_image_url: driver.car_image_url,
      car_seats: driver.car_seats,
      rating: driver.rating,
    };
  });
};

export const calculateRegion = ({
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
}) => {
  if (!userLatitude || !userLongitude) {
    return {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  if (!destinationLatitude || !destinationLongitude) {
    return {
      latitude: userLatitude,
      longitude: userLongitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  const minLat = Math.min(userLatitude, destinationLatitude);
  const maxLat = Math.max(userLatitude, destinationLatitude);
  const minLng = Math.min(userLongitude, destinationLongitude);
  const maxLng = Math.max(userLongitude, destinationLongitude);

  const latitudeDelta = (maxLat - minLat) * 1.3; // Adding some padding
  const longitudeDelta = (maxLng - minLng) * 1.3; // Adding some padding

  const latitude = (userLatitude + destinationLatitude) / 2;
  const longitude = (userLongitude + destinationLongitude) / 2;

  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta,
  };
};

export const calculateDriverTimes = async ({
  markers,
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  markers: MarkerData[];
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
}) => {
  if (
    !userLatitude ||
    !userLongitude ||
    !destinationLatitude ||
    !destinationLongitude
  )
    return;

  try {
    const timesPromises = markers.map(async (marker) => {
      try {
        // Calculate time from driver to user
        const responseToUser = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${marker.latitude},${marker.longitude}&destination=${userLatitude},${userLongitude}&key=${directionsAPI}`,
        );
        const dataToUser = await responseToUser.json();
        
        let timeToUser: number;
        // Check if the response is valid and contains routes
        if (dataToUser.status !== 'OK' || !dataToUser.routes || dataToUser.routes.length === 0) {
          console.warn(`No route found from driver to user: ${dataToUser.status}`);
          // Use a default time if no route is found
          timeToUser = 300; // 5 minutes default
        } else {
          timeToUser = dataToUser.routes[0].legs[0].duration.value; // Time in seconds
        }

        // Calculate time from user to destination
        const responseToDestination = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${userLatitude},${userLongitude}&destination=${destinationLatitude},${destinationLongitude}&key=${directionsAPI}`,
        );
        const dataToDestination = await responseToDestination.json();
        
        let timeToDestination: number;
        // Check if the response is valid and contains routes
        if (dataToDestination.status !== 'OK' || !dataToDestination.routes || dataToDestination.routes.length === 0) {
          console.warn(`No route found from user to destination: ${dataToDestination.status}`);
          // Use a default time if no route is found
          timeToDestination = 600; // 10 minutes default
        } else {
          timeToDestination = dataToDestination.routes[0].legs[0].duration.value; // Time in seconds
        }

        const totalTime = (timeToUser + timeToDestination) / 60; // Total time in minutes
        const price = (totalTime * 0.5).toFixed(2); // Calculate price based on time

        return { ...marker, time: totalTime, price };
      } catch (error) {
        console.error(`Error calculating times for driver ${marker.id}:`, error);
        // Return driver with default values if calculation fails
        return { 
          ...marker, 
          time: 15, // 15 minutes default
          price: "7.50" // Default price
        };
      }
    });

    return await Promise.all(timesPromises);
  } catch (error) {
    console.error("Error calculating driver times:", error);
    // Return original markers with default values if all calculations fail
    return markers.map(marker => ({
      ...marker,
      time: 15, // 15 minutes default
      price: "7.50" // Default price
    }));
  }
};
