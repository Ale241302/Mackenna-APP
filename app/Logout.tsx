import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function Logout() {
  const navigation = useNavigation();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        // Clear all user-related data
        await AsyncStorage.clear(); 

        // Reset navigation to the login or index screen, completely removing drawer navigation
        navigation.reset({
          index: 0,
          routes: [{ name: 'index' }],  // Replace 'index' with the correct name for your initial screen (e.g., login screen)
        });
      } catch (error) {
        console.error('Error al cerrar sesión', error);
      }
    };

    logoutUser();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Cerrando sesión...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: 'gray',
  },
});
