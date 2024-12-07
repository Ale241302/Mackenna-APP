import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';  // Para navegar después de guardar

export default function ReservasForm() {
  const navigation = useNavigation();  // Hook de navegación para redirigir después de guardar
  const [vehiculos, setVehiculos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [vehiculoid, setVehiculoid] = useState('');
  const [fechar, setFechar] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [sucursalid, setSucursalid] = useState('');
  const [userId, setUserId] = useState(null);  // Estado para almacenar el ID del usuario

  // Obtener el ID del usuario al cargar el componente
  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      setUserId(storedUserId);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    axios.get('http://192.168.0.129:8000/api/vehiculos-libres')
      .then(response => {
        setVehiculos(response.data.vehiculos);
      })
      .catch(error => {
        console.error('Error al obtener los vehículos', error);
        Alert.alert('Error', 'No se pudieron obtener los vehículos');
      });
  }, []);

  useEffect(() => {
    axios.get('http://192.168.0.129:8000/api/sucursales')
      .then(response => {
        const sucursalesFiltradas = response.data.sucursales.filter(sucursal => sucursal.id !== 13);
        setSucursales(sucursalesFiltradas);
      })
      .catch(error => {
        console.error('Error al obtener las sucursales', error);
        Alert.alert('Error', 'No se pudieron obtener las sucursales');
      });
  }, []);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || fechar;
    setShowPicker(Platform.OS === 'ios');
    if (currentDate >= new Date()) {
      setFechar(currentDate);
    } else {
      Alert.alert('Error', 'No puedes seleccionar una fecha pasada.');
    }
  };

  const openDatePicker = () => {
    setShowPicker(true);
  };

  const handleSubmit = () => {
    if (!vehiculoid || !fechar || !sucursalid || !userId) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    const data = {
      vehiculoid,
      fechar: fechar.toISOString().split('T')[0],  // Solo la fecha en formato ISO
      sucursalid,
      userId  // Incluir el ID del usuario en la petición
    };

    axios.post('http://192.168.0.129:8000/api/reservas', data)
      .then(response => {
        Alert.alert('Éxito', 'Reserva creada correctamente');
        navigation.navigate('Reservas');  // Redirigir a la pantalla de Reservas
      })
      .catch(error => {
        console.error('Error al crear la reserva', error);
        Alert.alert('Error', 'No se pudo crear la reserva');
      });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { textAlign: 'center' }]}>Nueva Reserva</Text>

      {/* Select de Vehículos */}
      <Text>Vehículo</Text>
      <Picker
        selectedValue={vehiculoid}
        style={styles.picker}
        onValueChange={(itemValue) => setVehiculoid(itemValue)}
      >
        <Picker.Item label="Seleccione un vehículo" value="" />
        {vehiculos.map((vehiculo) => (
          <Picker.Item key={vehiculo.id} label={`${vehiculo.placa} - ${vehiculo.marca} - ${vehiculo.modelo}`} value={vehiculo.id} />
        ))}
      </Picker>

      {/* Campo de Fecha y Hora */}
      <Text>Fecha de Reserva</Text>
      <TouchableOpacity onPress={openDatePicker}>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={fechar.toISOString().split('T')[0]}
          editable={false}
        />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={fechar}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Select de Sucursales */}
      <Text>Sucursal</Text>
      <Picker
        selectedValue={sucursalid}
        style={styles.picker}
        onValueChange={(itemValue) => setSucursalid(itemValue)}
      >
        <Picker.Item label="Seleccione una sucursal" value="" />
        {sucursales.map((sucursal) => (
          <Picker.Item key={sucursal.id} label={sucursal.nombre} value={sucursal.id} />
        ))}
      </Picker>

      {/* Botón para Enviar el Formulario */}
      <Button title="Crear Reserva" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
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
});
