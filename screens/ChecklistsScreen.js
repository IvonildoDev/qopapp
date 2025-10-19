import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAvailableChecklists } from '../utils/checklistData';

const ChecklistsScreen = ({ navigation }) => {
    const [checklists, setChecklists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Carregar checklists disponíveis
        const availableChecklists = getAvailableChecklists();
        setChecklists(availableChecklists);
        setLoading(false);
    }, []);

    const handleChecklistPress = (checklist) => {
        // Navegar para a tela de checklist
        navigation.navigate('ChecklistTaking', {
            checklistId: checklist.id,
            checklistName: checklist.name,
        });
    };

    const renderChecklistItem = ({ item }) => {
        const getIconName = (id) => {
            switch (id) {
                case 'pre_operacional':
                    return 'car-outline';
                case 'caminhao':
                    return 'bus-outline';
                case 'carga':
                    return 'cube-outline';
                default:
                    return 'checkbox-outline';
            }
        };

        return (
            <TouchableOpacity
                style={styles.checklistItem}
                onPress={() => handleChecklistPress(item)}
            >
                <View style={styles.checklistContent}>
                    <Ionicons name={getIconName(item.id)} size={24} color="#007AFF" style={styles.checklistIcon} />
                    <View style={styles.checklistText}>
                        <Text style={styles.checklistName}>{item.name}</Text>
                        <Text style={styles.checklistCount}>{item.questionCount} perguntas</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Carregando checklists...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Checklists Disponíveis</Text>
            <FlatList
                data={checklists}
                renderItem={renderChecklistItem}
                keyExtractor={(item) => item.id}
                style={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    list: {
        flex: 1,
    },
    checklistItem: {
        backgroundColor: '#fff',
        padding: 15,
        marginVertical: 5,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    checklistContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    checklistIcon: {
        marginRight: 15,
    },
    checklistText: {
        flex: 1,
    },
    checklistName: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 2,
    },
    checklistCount: {
        fontSize: 14,
        color: '#666',
    },
});

export default ChecklistsScreen;