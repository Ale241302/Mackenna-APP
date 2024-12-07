import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';  // Importar Picker desde el nuevo paquete
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PerfilForm() {
  const [userData, setUserData] = useState({
    name: '',
    apellido: '',
    numero_documento: '',
    numero_telefonico: '',
    tipo_documento_id: '',
    email: ''
  });
  const [tipoDocumentos, setTipoDocumentos] = useState([]); // Para almacenar los tipos de documento
  const [userId, setUserId] = useState(null);  // Para almacenar el ID del usuario
  const [successMessage, setSuccessMessage] = useState(''); // Estado para el mensaje de éxito

  // Obtener el ID del usuario al cargar el componente
  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('userId'); // Obtener el ID del usuario almacenado
      if (storedUserId) {
        setUserId(storedUserId);
      }
    };
    fetchUserId();
  }, []);

  // Obtener los datos del usuario por su ID
  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        try {
          const response = await axios.get(`http://192.168.0.129:8000/api/perfil/${userId}`);  // Llamada a la API con el ID
          const user = response.data.data;
          setUserData({
            name: user.name,
            apellido: user.apellido,
            numero_documento: user.numero_documento,
            numero_telefonico: user.numero_telefonico,
            tipo_documento_id: user.tipo_documento.id,  // Usamos el id del tipo_documento
            email: user.email
          });
        } catch (error) {
          console.error('Error al obtener los datos del perfil', error);
          Alert.alert('Error', 'No se pudo obtener el perfil del usuario');
        }
      }
    };

    fetchUserData();
  }, [userId]);

  // Obtener los tipos de documento disponibles
  useEffect(() => {
    const fetchTipoDocumentos = async () => {
      try {
        const response = await axios.get('http://192.168.0.129:8000/api/tipo-documentos');  // API para obtener tipos de documento
        setTipoDocumentos(response.data.tipo_documentos);
      } catch (error) {
        console.error('Error al obtener los tipos de documento', error);
        Alert.alert('Error', 'No se pudieron obtener los tipos de documento');
      }
    };

    fetchTipoDocumentos();
  }, []);

  // Función para manejar la actualización del perfil
  const handleSubmit = async () => {
    try {
      await axios.put(`http://192.168.0.129:8000/api/perfil/${userId}`, userData);  // API para actualizar los datos del perfil
      setSuccessMessage('Perfil actualizado correctamente'); // Mostrar mensaje de éxito

      // Ocultar el mensaje después de 3 segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (error) {
      console.error('Error al actualizar el perfil', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { textAlign: 'center' }]}>Perfil del Usuario</Text>
      
      {/* Mostrar el mensaje de éxito si existe */}
      {successMessage ? <Text style={styles.successMessage}>{successMessage}</Text> : null}

      <Text>Nombre</Text>
      <TextInput
        style={styles.input}
        value={userData.name}
        onChangeText={(text) => setUserData({ ...userData, name: text })}
      />

      <Text>Apellido</Text>
      <TextInput
        style={styles.input}
        value={userData.apellido}
        onChangeText={(text) => setUserData({ ...userData, apellido: text })}
      />

      <Text>Correo Electrónico</Text>
      <TextInput
        style={styles.input}
        value={userData.email}
        editable={false}  // Deshabilitamos la edición del correo electrónico
      />

      <Text>Tipo de Documento</Text>
      <Picker
        selectedValue={userData.tipo_documento_id}
        style={styles.picker}
        onValueChange={(itemValue) => setUserData({ ...userData, tipo_documento_id: itemValue })}
      >
        <Picker.Item label="Seleccione un tipo de documento" value="" />
        {tipoDocumentos.map((tipo) => (
          <Picker.Item key={tipo.id} label={tipo.nombre} value={tipo.id} />
        ))}
      </Picker>

      <Text>Número de Documento</Text>
      <TextInput
        style={styles.input}
        value={userData.numero_documento}
        onChangeText={(text) => setUserData({ ...userData, numero_documento: text })}
      />

      <Text>Número Telefónico</Text>
      <TextInput
        style={styles.input}
        value={userData.numero_telefonico}
        onChangeText={(text) => setUserData({ ...userData, numero_telefonico: text })}
      />

      <Button title="Actualizar Perfil" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '100%',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
  successMessage: {
    color: 'green',
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
  },
});
