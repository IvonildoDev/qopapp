import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    FlatList,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { formatDate } from '../utils/dateUtils';
import { useUser } from '../context/UserContext';
import DatabaseService from '../services/database';
import SyncStatus from '../components/SyncStatus';

const ReportScreen = ({ route, navigation }) => {
    const { checklistData } = route.params || {};
    const { user } = useUser();
    const [isGenerating, setIsGenerating] = useState(false);
    const [savedChecklists, setSavedChecklists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Recarregar sempre que a tela receber foco
    useFocusEffect(
        React.useCallback(() => {
            loadSavedChecklists();
        }, [])
    );

    const loadSavedChecklists = async () => {
        try {
            const checklists = await DatabaseService.getAllChecklists();
            setSavedChecklists(checklists);
        } catch (error) {
            console.error('Erro ao carregar checklists salvos:', error);
            Alert.alert('Erro', 'Não foi possível carregar os checklists salvos.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadSavedChecklists();
    };

    const generatePDF = async (reportData) => {
        try {
            setIsGenerating(true);

            // Preparar seção de fotos se houver
            let photosSection = '';
            if (reportData.photos && reportData.photos.length > 0) {
                // Usar URLs do servidor se disponíveis, senão usar URIs locais
                const imageSources = reportData.photoUrls && reportData.photoUrls.length > 0
                    ? reportData.photoUrls
                    : reportData.photos;

                const photoElements = imageSources.map((imageSrc, index) =>
                    `<div class="photo-item">
                        <p class="photo-label">Foto ${index + 1}</p>
                        <img src="${imageSrc}" alt="Foto ${index + 1}" class="photo-img" />
                    </div>`
                ).join('');

                const uploadStatus = reportData.uploadStatus === 'uploaded' ? ' (Enviadas)' :
                    reportData.uploadStatus === 'pending' ? ' (Pendentes de envio)' : '';

                photosSection = `<div class="photos-section">
                    <h3>Fotos Anexadas (${reportData.photos.length})${uploadStatus}</h3>
                    <div class="photos-grid">${photoElements}</div>
                </div>`;
            }

            const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #007AFF;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #007AFF;
            margin: 0;
        }
        .user-info {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .checklist-info {
            background-color: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .answers-section {
            margin-bottom: 20px;
        }
        .answer-item {
            padding: 10px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
        }
        .answer-yes {
            color: #4CAF50;
            font-weight: bold;
        }
        .answer-no {
            color: #F44336;
            font-weight: bold;
        }
        .observations {
            background-color: #fff3e0;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .photos-section {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .photos-section h3 {
            color: #007AFF;
            margin-top: 0;
        }
        .photos-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 15px;
        }
        .photo-item {
            text-align: center;
        }
        .photo-label {
            font-weight: bold;
            color: #666;
            margin-bottom: 8px;
        }
        .photo-img {
            width: 100%;
            max-width: 250px;
            height: auto;
            border-radius: 8px;
            border: 2px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Relatório de Checklist</h1>
        <h2>${reportData.checklistTitle}</h2>
        <p>Gerado em: ${formatDate(new Date())}</p>
    </div>
    
    <div class="user-info">
        <h3>Informações do Usuário</h3>
        <p><strong>Nome:</strong> ${reportData.userName || user?.name || 'N/A'}</p>
        <p><strong>Matrícula:</strong> ${user?.registration || 'N/A'}</p>
        <p><strong>Unidade:</strong> ${user?.unit || 'N/A'}</p>
    </div>
    
    <div class="checklist-info">
        <h3>Informações do Checklist</h3>
        <p><strong>Tipo:</strong> ${reportData.checklistTitle}</p>
        <p><strong>Data de Realização:</strong> ${formatDate(reportData.completedAt)}</p>
        ${reportData.createdAt ? `<p><strong>Data de Salvamento:</strong> ${formatDate(reportData.createdAt)}</p>` : ''}
        <p><strong>Total de Perguntas:</strong> ${reportData.answers.length}</p>
    </div>
    
    <div class="answers-section">
        <h3>Respostas</h3>
        ${reportData.answers.map((answer, index) =>
                `<div class="answer-item">
                <span><strong>${index + 1}.</strong> ${answer.question}</span>
                <span class="answer-${answer.answer === 'SIM' ? 'yes' : 'no'}">${answer.answer}</span>
            </div>`
            ).join('')}
    </div>
    
    ${reportData.observations ? `
        <div class="observations">
            <h3>Observações</h3>
            <p>${reportData.observations}</p>
        </div>
    ` : ''}
</body>
</html>`;

            const { uri } = await Print.printToFileAsync({
                html: htmlContent,
                base64: false,
            });

            await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: `Compartilhar ${reportData.checklistTitle}`,
            });

        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            Alert.alert('Erro', 'Não foi possível gerar o PDF. Tente novamente.');
        } finally {
            setIsGenerating(false);
        }
    };

    const deleteChecklist = async (checklistId) => {
        Alert.alert(
            'Confirmar Exclusão',
            'Tem certeza que deseja excluir este checklist?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await DatabaseService.deleteChecklist(checklistId);
                            loadSavedChecklists();
                        } catch (error) {
                            console.error('Erro ao excluir checklist:', error);
                            Alert.alert('Erro', 'Não foi possível excluir o checklist.');
                        }
                    }
                }
            ]
        );
    };

    const renderChecklistCard = ({ item }) => {
        const getChecklistIcon = (checklistId) => {
            switch (checklistId) {
                case 'pre_operacional':
                    return 'checkmark-circle';
                case 'carga':
                    return 'cube';
                case 'caminhao':
                    return 'car';
                default:
                    return 'clipboard';
            }
        };

        const totalAnswers = item.answers.length;
        const yesAnswers = item.answers.filter(a => a.answer === 'SIM').length;
        const noAnswers = item.answers.filter(a => a.answer === 'NÃO').length;

        return (
            <View style={styles.checklistCard}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons
                            name={getChecklistIcon(item.checklistId)}
                            size={24}
                            color="#007AFF"
                        />
                        <Text style={styles.cardTitle}>{item.checklistTitle}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => deleteChecklist(item.id)}
                        style={styles.deleteButton}
                    >
                        <Ionicons name="trash" size={20} color="#dc3545" />
                    </TouchableOpacity>
                </View>

                <View style={styles.cardInfo}>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color="#666" />
                        <Text style={styles.cardDate}>
                            Realizado em: {formatDate(item.completedAt)}
                        </Text>
                    </View>
                    {item.createdAt && (
                        <View style={styles.infoRow}>
                            <Ionicons name="time-outline" size={16} color="#666" />
                            <Text style={styles.cardDate}>
                                Salvo em: {formatDate(item.createdAt)}
                            </Text>
                        </View>
                    )}
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={16} color="#666" />
                        <Text style={styles.cardUser}>
                            {item.userName || user?.name || 'N/A'}
                        </Text>
                    </View>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{totalAnswers}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{yesAnswers}</Text>
                        <Text style={styles.statLabel}>Sim</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: '#F44336' }]}>{noAnswers}</Text>
                        <Text style={styles.statLabel}>Não</Text>
                    </View>
                </View>

                {item.observations && (
                    <View style={styles.observationPreview}>
                        <Text style={styles.observationLabel}>Observações:</Text>
                        <Text style={styles.observationText} numberOfLines={2}>
                            {item.observations}
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    style={styles.shareButton}
                    onPress={() => generatePDF(item)}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <Ionicons name="share-outline" size={20} color="#fff" />
                            <Text style={styles.shareButtonText}>Compartilhar PDF</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Carregando relatórios...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {checklistData && (
                <View style={styles.successMessage}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    <Text style={styles.successText}>
                        Checklist salvo com sucesso!
                    </Text>
                </View>
            )}

            <View style={styles.syncStatusContainer}>
                <SyncStatus />
            </View>

            <FlatList
                data={savedChecklists}
                renderItem={renderChecklistCard}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>Nenhum checklist salvo</Text>
                        <Text style={styles.emptySubtext}>
                            Complete um checklist para visualizar os relatórios aqui
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
        backgroundColor: '#f5f5f5',
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
    successMessage: {
        backgroundColor: '#d4edda',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        marginHorizontal: 15,
        marginTop: 15,
        borderRadius: 8,
        borderColor: '#c3e6cb',
        borderWidth: 1,
    },
    successText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#155724',
        fontWeight: '500',
    },
    listContainer: {
        padding: 15,
        paddingBottom: 100,
    },
    checklistCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    deleteButton: {
        padding: 5,
    },
    cardInfo: {
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    cardDate: {
        fontSize: 13,
        color: '#666',
        marginLeft: 6,
    },
    cardUser: {
        fontSize: 13,
        color: '#666',
        marginLeft: 6,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    observationPreview: {
        backgroundColor: '#fff3e0',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
    },
    observationLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#e65100',
        marginBottom: 5,
    },
    observationText: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    shareButton: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
    },
    shareButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 50,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ccc',
        marginTop: 15,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 20,
    },
    syncStatusContainer: {
        marginHorizontal: 15,
        marginTop: 10,
        marginBottom: 5,
    },
});

export default ReportScreen;