import * as Location from 'expo-location';

const APPROXIMATION_DECIMALS = 3;

export type ApproximateLocation = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

export async function requestApproximateLocation(): Promise<ApproximateLocation | null> {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (permission.status !== 'granted') {
    return null;
  }

  const currentLocation = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: roundCoordinate(currentLocation.coords.latitude),
    longitude: roundCoordinate(currentLocation.coords.longitude),
    accuracy: currentLocation.coords.accuracy,
  };
}

function roundCoordinate(value: number) {
  return Number(value.toFixed(APPROXIMATION_DECIMALS));
}

