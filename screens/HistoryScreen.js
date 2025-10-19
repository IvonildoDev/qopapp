import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { formatDate } from '../utils/dateUtils';
import DatabaseService from '../services/database';

const HistoryScreen = ({ navigation }) => {
    const [history, setHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('');

    // Recarregar sempre que a tela receber foco
    useFocusEffect(
        React.useCallback(() => {
            loadHistoryData();
        }, [])
    );

    useEffect(() => {
        // Aplicar filtros sempre que os dados ou filtros mudarem
        applyFilters();
    }, [history, selectedDate]);

    const loadHistoryData = async () => {
        try {
            setLoading(true);
            // Carregar checklists salvos do banco de dados
            const checklists = await DatabaseService.getAllChecklists();

            // Transformar para o formato esperado pelo histórico
            const historyData = checklists.map(checklist => ({
                id: checklist.id,
                quiz_type: checklist.checklistId,
                quiz_description: checklist.checklistTitle,
                question_count: checklist.answers.length,
                last_attempt: checklist.completedAt,
                created_at: checklist.createdAt,
                userName: checklist.userName,
                observations: checklist.observations
            }));

            setHistory(historyData);
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
            Alert.alert('Erro', 'Não foi possível carregar o histórico.');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...history];

        if (selectedDate) {
            const selected = parseBrazilianDate(selectedDate);
            if (selected) {
                const nextDay = new Date(selected);
                nextDay.setDate(nextDay.getDate() + 1);

                // Filtrar itens da data selecionada
                filtered = filtered.filter(item => {
                    const itemDate = new Date(item.last_attempt);
                    return itemDate >= selected && itemDate < nextDay;
                });
            }
        }

        // Ordenar por data mais recente
        filtered.sort((a, b) => new Date(b.last_attempt) - new Date(a.last_attempt));

        setFilteredHistory(filtered);
    };

    const parseBrazilianDate = (dateString) => {
        // Converte DD/MM/AAAA para Date object
        const match = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (match) {
            const [, day, month, year] = match;
            return new Date(year, month - 1, day);
        }
        return null;
    };

    const setTodayFilter = () => {
        const today = new Date();
        const todayString = today.toLocaleDateString('pt-BR');
        setSelectedDate(todayString);
    };

    const clearFilters = () => {
        setSelectedDate('');
    };

    const handleHistoryItemPress = (item) => {
        // Navegar para a tela de detalhes do checklist
        navigation.navigate('HistoryDetail', { checklistId: item.id });
    };

    const renderHistoryItem = ({ item }) => {
        const getIconName = (type) => {
            switch (type) {
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
                style={styles.historyItem}
                onPress={() => handleHistoryItemPress(item)}
            >
                <View style={styles.historyContent}>
                    <Ionicons name={getIconName(item.quiz_type)} size={24} color="#007AFF" style={styles.historyIcon} />
                    <View style={styles.historyText}>
                        <Text style={styles.quizType}>{item.quiz_description}</Text>
                        <Text style={styles.details}>
                            Perguntas: {item.question_count} | Data: {formatDate(item.last_attempt)}
                        </Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Carregando histórico...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Histórico de Checklists</Text>

            {/* Filtros por data */}
            <View style={styles.filtersContainer}>
                <Text style={styles.filtersTitle}>Filtrar por Data</Text>

                <View style={styles.dateInputGroup}>
                    <Text style={styles.dateLabel}>Data:</Text>
                    <TextInput
                        style={styles.dateInput}
                        placeholder="DD/MM/AAAA"
                        value={selectedDate}
                        onChangeText={setSelectedDate}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.filterButtonsContainer}>
                    <TouchableOpacity
                        style={[styles.filterButton, styles.todayButton]}
                        onPress={setTodayFilter}
                    >
                        <Ionicons name="today" size={16} color="#007AFF" />
                        <Text style={styles.todayButtonText}>Hoje</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.filterButton, styles.clearButton]}
                        onPress={clearFilters}
                    >
                        <Ionicons name="refresh" size={16} color="#666" />
                        <Text style={styles.clearButtonText}>Limpar</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={filteredHistory}
                renderItem={renderHistoryItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.list}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>
                            {history.length === 0 ? 'Nenhum checklist encontrado' : 'Nenhum checklist corresponde aos filtros'}
                        </Text>
                    </View>
                )}
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
    historyItem: {
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
    historyContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    historyIcon: {
        marginRight: 15,
    },
    historyText: {
        flex: 1,
    },
    quizType: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    details: {
        fontSize: 14,
        color: '#666',
    },
    filtersContainer: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        marginVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    filtersTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    dateInputGroup: {
        marginBottom: 15,
    },
    dateLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        marginBottom: 4,
    },
    dateInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    filterButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 6,
        flex: 1,
        marginHorizontal: 5,
        justifyContent: 'center',
    },
    todayButton: {
        backgroundColor: '#e3f2fd',
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    todayButtonText: {
        fontSize: 14,
        color: '#007AFF',
        marginLeft: 4,
        fontWeight: '500',
    },
    clearButton: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    clearButtonText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
});

export default HistoryScreen;