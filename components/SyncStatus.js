import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SyncService from '../services/syncService';

const SyncStatus = ({ style }) => {
    const [syncStatus, setSyncStatus] = useState({
        pendingChecklists: 0,
        queueLength: 0,
        isProcessing: false,
        isOnline: false
    });

    useEffect(() => {
        loadSyncStatus();

        // Atualizar status a cada 30 segundos
        const interval = setInterval(loadSyncStatus, 30000);

        return () => clearInterval(interval);
    }, []);

    const loadSyncStatus = async () => {
        try {
            const status = await SyncService.getSyncStatus();
            if (status) {
                setSyncStatus(status);
            }
        } catch (error) {
            console.error('Erro ao carregar status de sync:', error);
            // Manter status atual em caso de erro
        }
    };

    const handleManualSync = async () => {
        try {
            await SyncService.manualSync();
            await loadSyncStatus();
            Alert.alert('Sucesso', 'Sincronização iniciada!');
        } catch (error) {
            Alert.alert('Erro', 'Falha na sincronização manual');
        }
    };

    const getStatusColor = () => {
        if (!syncStatus.isOnline) return '#F44336';
        if (syncStatus.isProcessing) return '#FF9800';
        if (syncStatus.pendingChecklists > 0 || syncStatus.queueLength > 0) return '#FF9800';
        return '#4CAF50';
    };

    const getStatusText = () => {
        if (!syncStatus.isOnline) return 'Offline';
        if (syncStatus.isProcessing) return 'Sincronizando...';
        if (syncStatus.pendingChecklists > 0) return `${syncStatus.pendingChecklists} pendente(s)`;
        if (syncStatus.queueLength > 0) return `${syncStatus.queueLength} na fila`;
        return 'Sincronizado';
    };

    const getStatusIcon = () => {
        if (!syncStatus.isOnline) return 'cloud-offline';
        if (syncStatus.isProcessing) return 'sync';
        if (syncStatus.pendingChecklists > 0 || syncStatus.queueLength > 0) return 'cloud-upload';
        return 'cloud-done';
    };

    return (
        <View style={[styles.container, style]}>
            <View style={styles.statusInfo}>
                <Ionicons
                    name={getStatusIcon()}
                    size={16}
                    color={getStatusColor()}
                />
                <Text style={[styles.statusText, { color: getStatusColor() }]}>
                    {getStatusText()}
                </Text>
            </View>

            {(syncStatus.pendingChecklists > 0 || syncStatus.queueLength > 0) && (
                <TouchableOpacity
                    style={styles.syncButton}
                    onPress={handleManualSync}
                    disabled={syncStatus.isProcessing}
                >
                    <Ionicons
                        name="refresh"
                        size={14}
                        color="#007AFF"
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: '#f8f9fa',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    statusInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 12,
        marginLeft: 5,
        fontWeight: '500',
    },
    syncButton: {
        padding: 5,
        borderRadius: 10,
        backgroundColor: '#e3f2fd',
    },
});

export default SyncStatus;
