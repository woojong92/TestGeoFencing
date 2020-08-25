import React, {useEffect, useState, useRef} from 'react';
import {AppState, View, Text, Platform} from 'react-native';
import Boundary, {Events} from 'react-native-boundary';
import Geolocation from 'react-native-geolocation-service';

Boundary.on(Events.ENTER, (id) => {
  // Prints 'Get out of my Chipotle!!'
  console.log(`Get out of my ${id}!!`);
});

Boundary.on(Events.EXIT, (id) => {
  // Prints 'Ya! You better get out of my Chipotle!!'
  console.log(`Ya! You better get out of my ${id}!!`);
});

function App() {
  const [location, setLocation] = useState();
  const [boundaryStatus, setBoundaryStatus] = useState(0);

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    AppState.addEventListener('change', _handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', _handleAppStateChange);
    };
  }, []);

  const _handleAppStateChange = (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App has come to the foreground!');
    }

    appState.current = nextAppState;
    setAppStateVisible(appState.current);
    console.log('AppState', appState.current);
  };

  useEffect(() => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization('always');
    }
  }, []);

  useEffect(() => {
    Boundary.add({
      lat: 37.785834,
      lng: -122.406417,
      radius: 50, // in meters
      id: 'Chipotle',
    })
      .then(() => console.log('success!'))
      .catch((e) => console.error('error :(', e));

    return () => {
      // Remove the events
      Boundary.off(Events.ENTER);
      Boundary.off(Events.EXIT);

      // Remove the boundary from native API´s
      Boundary.remove('Chipotle')
        .then(() => console.log('Goodbye Chipotle :('))
        .catch((e) => console.log('Failed to delete Chipotle :)', e));
    };
  }, [boundaryStatus]);

  useEffect(() => {
    Geolocation.getCurrentPosition(
      (position) => {
        const {latitude, longitude} = position.coords;
        setLocation({
          latitude,
          longitude,
        });
      },
      (error) => {
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  });

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>{location?.latitude}</Text>
      <Text>{location?.longitude}</Text>
    </View>
  );
}

export default App;
