import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    TextInput,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getChecklistQuestions } from '../utils/checklistData';
import { useUser } from '../context/UserContext';
import DatabaseService from '../services/database';

const ChecklistTakingScreen = ({ route, navigation }) => {
    const { checklistId, checklistName } = route.params;
    const { user } = useUser();
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [observations, setObservations] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Carregar perguntas do checklist
        const checklistQuestions = getChecklistQuestions(checklistId);
        setQuestions(checklistQuestions);

        // Inicializar respostas
        const initialAnswers = {};
        checklistQuestions.forEach(question => {
            initialAnswers[question.number] = null; // null = não respondida, true = sim, false = não
        });
        setAnswers(initialAnswers);
        setLoading(false);

        // Configurar header
        navigation.setOptions({
            title: checklistName,
            headerRight: () => (
                <TouchableOpacity
                    onPress={handleSubmit}
                    style={styles.headerButton}
                >
                    <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                </TouchableOpacity>
            ),
        });
    }, [checklistId, checklistName]);

    const handleAnswer = (questionNumber, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionNumber]: answer
        }));
    };

    const handleSubmit = () => {
        // Verificar se todas as perguntas foram respondidas
        const unanswered = Object.values(answers).filter(answer => answer === null);
        if (unanswered.length > 0) {
            Alert.alert(
                'Perguntas não respondidas',
                `Você tem ${unanswered.length} pergunta(s) não respondida(s). Deseja continuar mesmo assim?`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Continuar', onPress: saveChecklist }
                ]
            );
        } else {
            saveChecklist();
        }
    };

    const saveChecklist = async () => {
        try {
            setSaving(true);

            // Preparar dados para salvar no banco
            const answersArray = questions.map(question => ({
                question: question.text,
                answer: answers[question.number] === true ? 'SIM' : answers[question.number] === false ? 'NÃO' : 'NÃO RESPONDIDO',
            }));

            const checklistData = {
                checklistId: checklistId,
                checklistTitle: checklistName,
                answers: answersArray,
                observations: observations,
                photos: [], // Fotos removidas
                photoUrls: [],
                uploadStatus: 'completed',
                completedAt: new Date().toISOString(),
                userName: user?.name || '',
                userEmail: user?.email || ''
            };

            // Salvar no banco de dados local
            const savedId = await DatabaseService.saveChecklist(checklistData);

            // Adicionar o ID do banco aos dados
            const savedChecklistData = {
                ...checklistData,
                id: savedId
            };

            setSaving(false);

            // Upload de imagens desabilitado - funcionalidade opcional que requer servidor
            // Se você configurar um servidor, descomente as linhas abaixo:
            /*
            if (photos.length > 0) {
                await uploadImages(savedId);
            }
            */

            Alert.alert(
                'Sucesso!',
                'Checklist salvo com sucesso!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Navegar para aba de relatórios
                            navigation.getParent()?.navigate('Reports', {
                                screen: 'ReportMain',
                                params: { checklistData: savedChecklistData }
                            });
                        }
                    }
                ]
            );

        } catch (error) {
            setSaving(false);
            console.error('Erro ao salvar checklist:', error);
            Alert.alert(
                'Erro',
                'Não foi possível salvar o checklist. Tente novamente.',
                [{ text: 'OK' }]
            );
        }
    };

    // Função de upload de imagens DESABILITADA
    // Esta função requer um servidor backend configurado
    // Para habilitar: configure um servidor e descomente o código abaixo
    /*
    const uploadImages = async (checklistId) => {
        if (photos.length === 0) return;

        try {
            setUploading(true);

            // Verificar conectividade
            const isOnline = await ImageUploadService.checkConnectivity();

            if (isOnline) {
                // Upload imediato
                const imageUris = photos.map(p => p.uri);
                const uploadResults = await ImageUploadService.uploadImages(
                    imageUris,
                    checklistId,
                    user?.id || 'unknown'
                );

                // Extrair URLs bem-sucedidas
                const successfulUrls = uploadResults
                    .filter(result => result.serverUrl)
                    .map(result => result.serverUrl);

                // Atualizar banco com URLs
                if (successfulUrls.length > 0) {
                    await DatabaseService.updatePhotoUrls(checklistId, successfulUrls, 'uploaded');
                }

            } else {
                // Adicionar à fila para upload posterior
                await ImageUploadService.queueForUpload(checklistId, photos.map(p => p.uri), user?.id || 'unknown');
                console.log('Imagens adicionadas à fila de upload offline');
            }

        } catch (error) {
            console.error('Erro no upload das imagens:', error);
            // Adicionar à fila mesmo em caso de erro
            await ImageUploadService.queueForUpload(checklistId, photos.map(p => p.uri), user?.id || 'unknown');
        } finally {
            setUploading(false);
        }
    };
    */

    const submitChecklist = () => {
        // Esta função mantida para compatibilidade, mas redirecionará para saveChecklist
        saveChecklist();
    };

    const renderQuestion = ({ item }) => {
        const currentAnswer = answers[item.number];

        return (
            <View style={styles.questionContainer}>
                <Text style={styles.questionNumber}>{item.number}.</Text>
                <Text style={styles.questionText}>{item.text}</Text>

                <View style={styles.answerButtons}>
                    <TouchableOpacity
                        style={[
                            styles.answerButton,
                            currentAnswer === true && styles.answerButtonSelected
                        ]}
                        onPress={() => handleAnswer(item.number, true)}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={currentAnswer === true ? "checkmark-circle" : "checkmark-circle-outline"}
                            size={20}
                            color={currentAnswer === true ? "#4CAF50" : "#666"}
                        />
                        <Text style={[
                            styles.answerText,
                            currentAnswer === true && styles.answerTextSelected
                        ]}>
                            Sim
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.answerButton,
                            currentAnswer === false && styles.answerButtonSelected
                        ]}
                        onPress={() => handleAnswer(item.number, false)}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={currentAnswer === false ? "close-circle" : "close-circle-outline"}
                            size={20}
                            color={currentAnswer === false ? "#F44336" : "#666"}
                        />
                        <Text style={[
                            styles.answerText,
                            currentAnswer === false && styles.answerTextSelected
                        ]}>
                            Não
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Carregando checklist...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <FlatList
                    data={questions}
                    renderItem={renderQuestion}
                    keyExtractor={(item) => item.number.toString()}
                    style={styles.questionsList}
                    keyboardShouldPersistTaps="always"
                    nestedScrollEnabled={true}
                    contentContainerStyle={styles.listContent}
                    ListFooterComponent={
                        <View style={styles.footer}>
                            <Text style={styles.observationsTitle}>Observações (opcional)</Text>
                            <TextInput
                                style={styles.observationsInput}
                                multiline
                                numberOfLines={4}
                                placeholder="Adicione suas observações aqui..."
                                value={observations}
                                onChangeText={setObservations}
                                textAlignVertical="top"
                                returnKeyType="default"
                                blurOnSubmit={false}
                                keyboardType="default"
                            />

                            <TouchableOpacity
                                style={[styles.submitButton, saving && styles.submitButtonDisabled]}
                                onPress={handleSubmit}
                                disabled={saving}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={saving ? "hourglass" : "save"}
                                    size={20}
                                    color="#fff"
                                />
                                <Text style={styles.submitButtonText}>
                                    {saving ? 'Salvando...' : 'Salvar Checklist'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
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
    questionsList: {
        flex: 1,
        padding: 15,
    },
    listContent: {
        paddingBottom: 50,
    },
    questionContainer: {
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
    questionNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 5,
    },
    questionText: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 15,
        color: '#333',
    },
    answerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    answerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f9f9f9',
        minWidth: 100,
        justifyContent: 'center',
    },
    answerButtonSelected: {
        backgroundColor: '#e3f2fd',
        borderColor: '#007AFF',
    },
    answerText: {
        fontSize: 16,
        marginLeft: 8,
        color: '#666',
    },
    answerTextSelected: {
        color: '#007AFF',
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 20,
        marginBottom: 100,
        paddingBottom: 20,
    },
    observationsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    observationsInput: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    submitButton: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    submitButtonDisabled: {
        backgroundColor: '#999',
        opacity: 0.6,
    },
    headerButton: {
        marginRight: 15,
    },
});

export default ChecklistTakingScreen;