import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Reservas from './Reservas';
import Logout from './Logout';
import PerfilForm from './PerfilForm';
import ReservasForm from './ReservasForm';
import IndexScreen from './(tabs)/index';

function ProtectedPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bienvenido a Mackenna</Text>
    </View>
  );
}


function Profile() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Perfil</Text>
    </View>
  );
}


const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <Drawer.Navigator initialRouteName="ProtectedPage">
      <Drawer.Screen name="Home" component={ProtectedPage} />
      <Drawer.Screen name="Reservas" component={Reservas} />
      <Drawer.Screen name="Perfil" component={PerfilForm} />
      <Drawer.Screen name="Cerrar Sesión" component={Logout} />
      <Drawer.Screen
  name="index"
  component={IndexScreen}
  options={{
    drawerItemStyle: { display: 'none' }  // Oculta el elemento del drawer
  }}
/>

    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
