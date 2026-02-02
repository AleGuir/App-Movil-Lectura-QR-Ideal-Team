import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

export default function LoginScreen({ navigation }) {
  const [siteUrl, setSiteUrl] = useState('https://your-wordpress-site.com');
  // For MVP, we might just store the URL. Real auth would need more fields.
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    // Remove trailing slash
    const cleanUrl = siteUrl.replace(/\/$/, "");
    
    try {
      // Check health endpoint
      const response = await axios.get(`${cleanUrl}/wp-json/et/v1/health`);
      if (response.status === 200) {
         navigation.replace('Scanner', { siteUrl: cleanUrl });
      } else {
        Alert.alert('Error', 'No se pudo conectar con el plugin en esa URL.');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Validador de Eventos</Text>
      <Text style={styles.label}>URL del Sitio Web con el Plugin:</Text>
      <TextInput
        style={styles.input}
        value={siteUrl}
        onChangeText={setSiteUrl}
        autoCapitalize="none"
        keyboardType="url"
      />
      
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Conectando...' : 'Iniciar'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#1E1E1E',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: 'bold',
  },
  label: {
    color: '#ccc',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
