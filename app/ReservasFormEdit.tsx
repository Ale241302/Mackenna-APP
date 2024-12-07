import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';  // Para navegación y obtener parámetros

export default function ReservasFormEdit() {
  const navigation = useNavigation();  // Hook de navegación
  const route = useRoute();  // Hook para obtener el id de la reserva pasada
  const { reservaId } = route.params;  // Obtener reservaId de los parámetros de navegación

  const [vehiculos, setVehiculos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [vehiculoid, setVehiculoid] = useState('');
  const [fechar, setFechar] = useState(null);  // Inicializamos como null para evitar problemas
  const [showPicker, setShowPicker] = useState(false);
  const [sucursalid, setSucursalid] = useState('');
  const [userId, setUserId] = useState(null);

  // Obtener el ID del usuario al cargar el componente
  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      setUserId(storedUserId);
    };
    fetchUserId();
  }, []);

  // Obtener la reserva y cargar los datos
  useEffect(() => {
    const fetchReserva = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await axios.get(`http://192.168.0.129:8000/api/reservas/${reservaId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const reserva = response.data;

        // Setear los campos con los datos de la reserva
        setVehiculoid(reserva.vehiculoid);
        const reservaDate = new Date(reserva.fechar);
        if (!isNaN(reservaDate)) {
          setFechar(reservaDate);  // Solo seteamos si es una fecha válida
        } else {
          setFechar(new Date());  // Si no es válida, seteamos la fecha actual
        }
        setSucursalid(reserva.sucursalid);
      } catch (error) {
        console.error('Error al obtener la reserva', error);
        Alert.alert('Error', 'No se pudo cargar la reserva');
      }
    };

    fetchReserva();
  }, [reservaId]);

  // Obtener vehículos libres
  useEffect(() => {
    axios.get('http://192.168.0.129:8000/api/vehiculos-libres')
      .then(response => {
        setVehiculos(response.data.vehiculos);

        // Verificar si el valor actual de vehiculoid existe en la lista de vehículos
        if (!response.data.vehiculos.some(v => v.id === vehiculoid)) {
          setVehiculoid('');  // Resetear si el id no existe
        }
      })
      .catch(error => {
        console.error('Error al obtener los vehículos', error);
        Alert.alert('Error', 'No se pudieron obtener los vehículos');
      });
  }, [vehiculoid]);

  // Obtener sucursales
  useEffect(() => {
    axios.get('http://192.168.0.129:8000/api/sucursales')
      .then(response => {
        setSucursales(response.data.sucursales);

        // Verificar si el valor actual de sucursalid existe en la lista de sucursales
        if (!response.data.sucursales.some(s => s.id === sucursalid)) {
          setSucursalid('');  // Resetear si el id no existe
        }
      })
      .catch(error => {
        console.error('Error al obtener las sucursales', error);
        Alert.alert('Error', 'No se pudieron obtener las sucursales');
      });
  }, [sucursalid]);

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
      fechar: fechar instanceof Date && !isNaN(fechar) ? fechar.toISOString().split('T')[0] : '',  // Solo la fecha en formato ISO
      sucursalid,
      userId  // Incluir el ID del usuario en la petición
    };

    axios.put(`http://192.168.0.129:8000/api/reservas/${reservaId}`, data)  // Actualizar la reserva
      .then(response => {
        Alert.alert('Éxito', 'Reserva actualizada correctamente');
        navigation.navigate('Reservas');  // Redirigir a la pantalla de Reservas
      })
      .catch(error => {
        console.error('Error al actualizar la reserva', error);
        Alert.alert('Error', 'No se pudo actualizar la reserva');
      });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { textAlign: 'center' }]}>Editar Reserva</Text>

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
          value={fechar instanceof Date && !isNaN(fechar) ? fechar.toISOString().split('T')[0] : ''}
          editable={false}
        />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={fechar || new Date()}
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
      <Button title="Actualizar Reserva" onPress={handleSubmit} />
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
