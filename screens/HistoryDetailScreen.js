import React, { useState, useEffect } from 'react';
import { View, Text, Image, Modal, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DatabaseService from '../services/database';
import { formatDate, formatDateTime } from '../utils/dateUtils';

const HistoryDetailScreen = ({ route, navigation }) => {
    const { checklistId } = route.params;
    const [checklist, setChecklist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [previewUri, setPreviewUri] = useState(null);

    useEffect(() => {
        loadChecklistDetails();
    }, [checklistId]);

    const loadChecklistDetails = async () => {
        try {
            setLoading(true);
            const data = await DatabaseService.getChecklistById(checklistId);
            if (data) {
                setChecklist(data);
            } else {
                Alert.alert('Erro', 'Checklist não encontrado.');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Erro ao carregar detalhes:', error);
            Alert.alert('Erro', 'Não foi possível carregar os detalhes do checklist.');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const renderAnswer = (answer, index) => {
        const getAnswerStyle = (value) => {
            const upperValue = value.toUpperCase();
            if (upperValue === 'SIM') return styles.answerYes;
            if (upperValue === 'NÃO') return styles.answerNo;
            return styles.answerNA;
        };

        const getAnswerText = (value) => {
            // Garantir que o valor está em maiúsculas
            const upperValue = value.toUpperCase();
            if (upperValue === 'NÃO RESPONDIDO') return 'N/A';
            return upperValue;
        };

        const getAnswerIcon = (value) => {
            const upperValue = value.toUpperCase();
            if (upperValue === 'SIM') return 'checkmark-circle';
            if (upperValue === 'NÃO') return 'close-circle';
            return 'help-circle';
        };

        return (
            <View key={index} style={styles.answerItem}>
                <View style={styles.answerRow}>
                    <View style={styles.questionContainer}>
                        <Text style={styles.questionNumber}>{index + 1}.</Text>
                        <Text style={styles.questionText}>{answer.question}</Text>
                    </View>
                    <View style={styles.answerContainer}>
                        <View style={[styles.answerBadge, getAnswerStyle(answer.answer)]}>
                            <Ionicons
                                name={getAnswerIcon(answer.answer)}
                                size={16}
                                color="#333"
                                style={styles.answerIcon}
                            />
                            <Text style={styles.answerText}>{getAnswerText(answer.answer)}</Text>
                        </View>
                    </View>
                </View>
                {answer.note ? (
                    <View style={styles.noteBox}>
                        <Ionicons name="chatbox-ellipses-outline" size={16} color="#8E1B1B" />
                        <Text style={styles.noteText}>{answer.note}</Text>
                    </View>
                ) : null}
                {answer.photos?.length ? (
                    <View style={styles.photoRow}>
                        {answer.photos.map((uri) => (
                            <TouchableOpacity
                                key={uri}
                                onPress={() => setPreviewUri(uri)}
                                accessibilityRole="button"
                                accessibilityLabel="Ampliar foto"
                            >
                                <Image source={{ uri }} style={styles.photoThumb} />
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : null}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0B3A8F" />
                <Text style={styles.loadingText}>Carregando detalhes...</Text>
            </View>
        );
    }

    if (!checklist) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="document-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>Checklist não encontrado</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Header com informações do checklist */}
                <View style={styles.header}>
                    <Text style={styles.title}>{checklist.checklistTitle}</Text>
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>{checklist.userName}</Text>
                    </View>
                    {checklist.userRegistration ? (
                        <View style={styles.infoRow}>
                            <Ionicons name="card-outline" size={16} color="#666" />
                            <Text style={styles.infoText}>Matrícula {checklist.userRegistration}</Text>
                        </View>
                    ) : null}
                    {checklist.userUnit ? (
                        <View style={styles.infoRow}>
                            <Ionicons name="business-outline" size={16} color="#666" />
                            <Text style={styles.infoText}>Unidade {checklist.userUnit}</Text>
                        </View>
                    ) : null}
                    {checklist.userEmail ? (
                        <View style={styles.infoRow}>
                            <Ionicons name="mail-outline" size={16} color="#666" />
                            <Text style={styles.infoText}>{checklist.userEmail}</Text>
                        </View>
                    ) : null}
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>
                            Completado em: {formatDate(checklist.completedAt)}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>
                            Criado em: {formatDate(checklist.createdAt)}
                        </Text>
                    </View>
                    {checklist.editedAt ? (
                        <View style={styles.infoRow}>
                            <Ionicons name="create-outline" size={16} color="#666" />
                            <Text style={styles.infoText}>
                                Editado em: {formatDateTime(checklist.editedAt)}
                            </Text>
                        </View>
                    ) : null}
                </View>

                {/* Estatísticas */}
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{checklist.answers.length}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={[styles.statNumber, styles.statYes]}>
                            {checklist.answers.filter(a => a.answer.toUpperCase() === 'SIM').length}
                        </Text>
                        <Text style={styles.statLabel}>Sim</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={[styles.statNumber, styles.statNo]}>
                            {checklist.answers.filter(a => a.answer.toUpperCase() === 'NÃO').length}
                        </Text>
                        <Text style={styles.statLabel}>Não</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={[styles.statNumber, styles.statNA]}>
                            {checklist.answers.filter(a => {
                                const ans = a.answer.toUpperCase();
                                return ans === 'N/A' || ans === 'NÃO RESPONDIDO';
                            }).length}
                        </Text>
                        <Text style={styles.statLabel}>N/A</Text>
                    </View>
                </View>

                {/* Respostas */}
                <View style={styles.answersSection}>
                    <Text style={styles.sectionTitle}>Respostas</Text>
                    {checklist.answers.map((answer, index) => renderAnswer(answer, index))}
                </View>

                {/* Observações */}
                {checklist.observations ? (
                    <View style={styles.observationsSection}>
                        <Text style={styles.sectionTitle}>Observações</Text>
                        <View style={styles.observationsBox}>
                            <Text style={styles.observationsText}>{checklist.observations}</Text>
                        </View>
                    </View>
                ) : null}
            </ScrollView>

            <Modal visible={Boolean(previewUri)} transparent animationType="fade" onRequestClose={() => setPreviewUri(null)}>
                <View style={styles.previewBackdrop}>
                    {previewUri ? (
                        <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="contain" />
                    ) : null}
                    <TouchableOpacity
                        style={styles.previewClose}
                        onPress={() => setPreviewUri(null)}
                        accessibilityRole="button"
                        accessibilityLabel="Fechar"
                    >
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F5F8',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F5F8',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F5F8',
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    statBox: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0B3A8F',
    },
    statYes: {
        color: '#4CAF50',
    },
    statNo: {
        color: '#F44336',
    },
    statNA: {
        color: '#FF9800',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    answersSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    answerItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    answerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    photoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    photoThumb: {
        width: 84,
        height: 84,
        borderRadius: 10,
        backgroundColor: '#EDF0F5',
    },
    previewBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.92)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewImage: {
        width: '100%',
        height: '80%',
    },
    previewClose: {
        position: 'absolute',
        top: 48,
        right: 20,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noteBox: {
        flexDirection: 'row',
        gap: 8,
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#FDECEC',
    },
    noteText: {
        flex: 1,
        fontSize: 14,
        color: '#8E1B1B',
        lineHeight: 20,
    },
    questionContainer: {
        flex: 1,
        flexDirection: 'row',
        marginRight: 10,
    },
    questionNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0B3A8F',
        marginRight: 8,
    },
    questionText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    answerContainer: {
        justifyContent: 'center',
    },
    answerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        minWidth: 70,
        justifyContent: 'center',
    },
    answerIcon: {
        marginRight: 4,
    },
    answerYes: {
        backgroundColor: '#E8F5E9',
    },
    answerNo: {
        backgroundColor: '#FFEBEE',
    },
    answerNA: {
        backgroundColor: '#FFF3E0',
    },
    answerText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
    },
    observationsSection: {
        marginBottom: 20,
    },
    observationsBox: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#0B3A8F',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    observationsText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
});

export default HistoryDetailScreen;
