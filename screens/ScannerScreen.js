import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Dimensions, Alert, Modal, TouchableOpacity } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import axios from 'axios';

export default function ScannerScreen({ route, navigation }) {
    const { siteUrl } = route.params;
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        getPermissions();
    }, []);

    const handleBarCodeScanned = async ({ type, data }) => {
        setScanned(true);
        // Data should be the hash
        validateTicket(data);
    };

    const validateTicket = async (hash) => {
        setLoading(true);
        try {
            const response = await axios.post(`${siteUrl}/wp-json/et/v1/validate-ticket`, {
                qr_hash: hash
            });

            if (response.data && response.data.valid) {
                setResult({ status: 'valid', message: response.data.message, data: response.data.ticket });
            } else {
                setResult({ status: 'invalid', message: 'Ticket inválido o no encontrado.' });
            }
        } catch (error) {
            // Handle 404/403/500
            setResult({ status: 'error', message: 'Error validando ticket' });
        } finally {
            setLoading(false);
        }
    };

    if (hasPermission === null) {
        return <Text>Solicitando permiso de cámara...</Text>;
    }
    if (hasPermission === false) {
        return <Text>Sin acceso a la cámara</Text>;
    }

    const getStatusColor = () => {
        if (!result) return '#333';
        if (result.status === 'valid') return '#28a745';
        if (result.status === 'invalid') return '#dc3545';
        return '#ffc107';
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            />

            {scanned && !result && (
                <View style={styles.overlay}>
                    <Text style={styles.processingText}>Validando...</Text>
                </View>
            )}

            {scanned && result && (
                <Modal transparent={true} animationType="slide" visible={!!result}>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { borderColor: getStatusColor() }]}>
                            <Text style={[styles.statusTitle, { color: getStatusColor() }]}>
                                {result.status === 'valid' ? 'ACCESO PERMITIDO' : 'DENEGADO'}
                            </Text>

                            <Text style={styles.message}>{result.message}</Text>

                            {result.data && (
                                <View style={styles.details}>
                                    <Text style={styles.detailText}>Evento: {result.data.event_name}</Text>
                                    <Text style={styles.detailText}>Asistente: {result.data.attendee}</Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={[styles.closeButton, { backgroundColor: getStatusColor() }]}
                                onPress={() => {
                                    setScanned(false);
                                    setResult(null);
                                }}>
                                <Text style={styles.buttonText}>Escanear Nuevo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: 'black'
    },
    overlay: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    processingText: {
        color: 'white',
        fontSize: 20,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
        borderRadius: 5
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 25,
        alignItems: 'center',
        borderWidth: 4
    },
    statusTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10
    },
    message: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center'
    },
    details: {
        marginBottom: 20,
        alignItems: 'center'
    },
    detailText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 5
    },
    closeButton: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginTop: 10
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    }
});
