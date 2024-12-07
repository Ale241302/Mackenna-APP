import React, { useState, useEffect } from 'react';
import { Image, View, TextInput, TouchableOpacity, StyleSheet, Text, useColorScheme, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import axios from 'axios'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useNavigation } from '@react-navigation/native'; 

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(true); // Para manejar el estado de carga inicial
  const navigation = useNavigation(); 
  const colorScheme = useColorScheme();

  // Función para verificar si el usuario ya está autenticado
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');
        
        if (userToken && userId) {
          // Si hay un token y un ID almacenado, navega a Home
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        } else {
          // Si no hay token o ID, deja que el usuario inicie sesión
          setLoading(false);
        }
      } catch (error) {
        console.error('Error al verificar el estado de autenticación', error);
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://192.168.0.129:8000/api/login', {
        email: email,
        password: password,
      });
      const token = response.data.token;
      const userId = response.data.user.id; 

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userId', String(userId));  
      console.log('Login exitoso!');

      // Navegar a la pantalla de inicio después del login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });

    } catch (error) {
      console.error('Error en el login', error);
      Alert.alert('Error', 'Credenciales incorrectas o error en el servidor');
    }
  };

  // Estilos dinámicos según el modo oscuro o claro
  const dynamicStyles = {
    text: {
      color: colorScheme === 'dark' ? '#FFF' : '#000', 
    },
    input: {
      color: colorScheme === 'dark' ? '#FFF' : '#000', 
      backgroundColor: colorScheme === 'dark' ? '#333' : '#FFF', 
    },
  };

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('./assets/logo.jpg')} 
        style={styles.titleImage}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, dynamicStyles.input]}
          placeholder="Correo Electrónico"
          placeholderTextColor={colorScheme === 'dark' ? '#AAA' : '#555'} 
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, dynamicStyles.input]}
          placeholder="Contraseña"
          placeholderTextColor={colorScheme === 'dark' ? '#AAA' : '#555'} 
          value={password}
          secureTextEntry={!isPasswordVisible} 
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.icon}>
          <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color="gray" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={[styles.buttonText, dynamicStyles.text]}>Ingresar</Text>
      </TouchableOpacity>
    </View>
  );
}

// Estilos del componente
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleImage: {
    width: 200,
    height: 100,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
  },
  icon: {
    padding: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
});
