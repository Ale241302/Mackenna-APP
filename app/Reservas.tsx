import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { DataTable, useTheme, IconButton } from 'react-native-paper';  // Importar IconButton
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';  // Importar useNavigation

export default function Reservas() {
  const { colors, dark } = useTheme(); 
  const [reservas, setReservas] = useState([]); 
  const navigation = useNavigation();  // Inicializar el hook de navegación

  // Función para obtener las reservas desde la API
  const fetchReservas = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken'); 
      const userId = await AsyncStorage.getItem('userId'); // Obtener el userId almacenado
      
      if (!userId) {
        Alert.alert('Error', 'No se pudo obtener el usuario');
        return;
      }

      const response = await axios.get(`http://192.168.0.129:8000/api/reservas/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setReservas(response.data.reservas); 
    } catch (error) {
      console.error('Error al obtener las reservas', error);
      Alert.alert('Error', 'No se pudieron obtener las reservas');
    }
  };

  useEffect(() => {
    fetchReservas();  
  }, []);

  // Función para manejar la acción de editar
  const handleEdit = (reservaId) => {
    navigation.navigate('ReservasFormEdit', { reservaId });  // Navegar al formulario de edición
  };

  // Función para manejar la acción de eliminar
  const handleDelete = async (reservaId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.delete(`http://192.168.0.129:8000/api/reservas/${reservaId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      Alert.alert('Éxito', 'Reserva eliminada correctamente');
      fetchReservas();  // Refrescar la lista de reservas después de eliminar
    } catch (error) {
      console.error('Error al eliminar la reserva', error);
      Alert.alert('Error', 'No se pudo eliminar la reserva');
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title="Nueva Reserva"
        onPress={() => navigation.navigate('ReservasForm')}  // Navegar al formulario de nueva reserva
      />

      <ScrollView horizontal>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title style={styles.column2} textStyle={styles.tableText}>Vehículo</DataTable.Title>
            <DataTable.Title style={styles.column2} textStyle={styles.tableText}>Usuario</DataTable.Title>
           
            <DataTable.Title style={styles.column2} textStyle={styles.tableText}>Sucursal</DataTable.Title>
            <DataTable.Title style={styles.column2} textStyle={styles.tableText}>Fecha</DataTable.Title>
            <DataTable.Title style={styles.column2} textStyle={styles.tableText}>Acciones</DataTable.Title>
          </DataTable.Header>

          {reservas.map((reserva) => (
            <DataTable.Row key={reserva.id}>
              <DataTable.Cell style={styles.column} textStyle={styles.tableText}>{reserva.vehiculo.placa}</DataTable.Cell>
              <DataTable.Cell style={styles.column} textStyle={styles.tableText}>{reserva.usuario.name}</DataTable.Cell>
              
              <DataTable.Cell style={styles.column} textStyle={styles.tableText}>{reserva.sucursal.nombre}</DataTable.Cell>
              <DataTable.Cell style={styles.column} textStyle={styles.tableText}>{reserva.fechar}</DataTable.Cell>

              {/* Iconos de editar y eliminar */}
              <DataTable.Cell style={styles.column}>
                <IconButton
                  icon="trash-can"
                  size={20}
                  color="red"
                  onPress={() => handleDelete(reserva.id)}  // Acción de eliminar
                />
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  column: {
    flex: 2,  // Ajustar el ancho de cada columna
    paddingHorizontal: 8,  // Añadir espacio horizontal entre columnas
  },
  column2: {
    flex: 2,  // Ajustar el ancho de cada columna
    paddingHorizontal: 1,  // Añadir espacio horizontal entre columnas
  },
  actionColumn: {
    flex: 1,  // Menor ancho para la columna de acciones
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableText: {
    fontSize: 16, // Ajustar el tamaño de texto para dispositivos móviles
    color: 'black',
  },
});
