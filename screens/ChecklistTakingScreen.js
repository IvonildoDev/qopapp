import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    View,
    Image,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getChecklistQuestions } from '../utils/checklistData';
import { useUser } from '../context/UserContext';
import DatabaseService from '../services/database';
import DraftService from '../services/draftService';
import PhotoService, { MAX_PHOTOS_PER_QUESTION } from '../services/photoService';
import AboutButton from '../components/AboutButton';
import ActionSheet from '../components/ActionSheet';
import { formatDate } from '../utils/dateUtils';
import { colors, radius, cardShadow } from '../theme';

const ANSWER_KINDS = {
    yes: {
        icon: 'checkmark',
        label: 'Conforme',
        tone: { border: colors.success, bg: colors.successTint, ink: colors.successInk },
    },
    no: {
        icon: 'close',
        label: 'N/C',
        tone: { border: colors.danger, bg: colors.dangerTint, ink: colors.dangerInk },
    },
    na: {
        icon: 'warning-outline',
        label: 'N/A',
        tone: { border: '#6B7685', bg: '#E6E9EE', ink: '#3B4A5F' },
    },
};

const AnswerButton = ({ kind, selected, onPress }) => {
    const { icon, label, tone } = ANSWER_KINDS[kind];

    return (
        <TouchableOpacity
            style={[
                styles.answerButton,
                selected && { borderColor: tone.border, backgroundColor: tone.bg, borderWidth: 2 },
            ]}
            onPress={onPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected }}
        >
            <Ionicons
                name={icon}
                size={20}
                color={selected ? tone.ink : colors.inkSoft}
            />
            <Text style={[styles.answerText, selected && { color: tone.ink }]}>{label}</Text>
        </TouchableOpacity>
    );
};

const PhotoStrip = ({ photos = [], onAdd, onRemove }) => {
    const canAdd = photos.length < MAX_PHOTOS_PER_QUESTION;
    return (
        <View style={styles.photoRow}>
            {photos.map((uri) => (
                <View key={uri} style={styles.thumbBox}>
                    <Image source={{ uri }} style={styles.thumb} />
                    <TouchableOpacity
                        style={styles.thumbRemove}
                        onPress={() => onRemove(uri)}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="Remover foto"
                    >
                        <Ionicons name="close" size={14} color="#fff" />
                    </TouchableOpacity>
                </View>
            ))}
            {canAdd && (
                <TouchableOpacity
                    style={styles.addPhoto}
                    onPress={onAdd}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Adicionar foto"
                >
                    <Ionicons name="camera-outline" size={18} color={colors.primary} />
                    <Text style={styles.addPhotoText}>
                        Anexar foto ({photos.length}/{MAX_PHOTOS_PER_QUESTION})
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const QuestionItem = React.memo(({ question, answer, note, photos, onAnswer, onNote, onAddPhoto, onRemovePhoto }) => (
    <View style={styles.questionCard}>
        <View style={styles.questionHeader}>
            <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{question.number}</Text>
            </View>
            <Text style={styles.questionText}>{question.text}</Text>
        </View>

        <View style={styles.answerRow}>
            <AnswerButton kind="yes" selected={answer === true} onPress={() => onAnswer(question.number, true)} />
            <AnswerButton kind="no" selected={answer === false} onPress={() => onAnswer(question.number, false)} />
            <AnswerButton kind="na" selected={answer === 'na'} onPress={() => onAnswer(question.number, 'na')} />
        </View>

        {answer === false && (
            <TextInput
                style={styles.noteInput}
                placeholder="Descreva o problema (opcional)"
                placeholderTextColor={colors.dangerInk}
                value={note}
                onChangeText={(text) => onNote(question.number, text)}
                multiline
            />
        )}

        {answer === false && (
            <PhotoStrip
                photos={photos}
                onAdd={() => onAddPhoto(question.number)}
                onRemove={(uri) => onRemovePhoto(question.number, uri)}
            />
        )}
    </View>
));

const ChecklistTakingScreen = ({ route, navigation }) => {
    const { checklistId, checklistName, editId } = route.params;
    const isEditing = Boolean(editId);
    const { user } = useUser();
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();
    const questions = useMemo(() => getChecklistQuestions(checklistId), [checklistId]);
    const [answers, setAnswers] = useState({});
    const [notes, setNotes] = useState({});
    const [observations, setObservations] = useState('');
    const [saving, setSaving] = useState(false);
    const [draftLoaded, setDraftLoaded] = useState(false);
    const [restored, setRestored] = useState(false);
    const [originalDate, setOriginalDate] = useState(null);
    const [photos, setPhotos] = useState({});
    const [photoBusy, setPhotoBusy] = useState(false);
    const [sheetFor, setSheetFor] = useState(null);
    // Em edição, fotos removidas só são apagadas do disco depois de salvar
    const removedPhotos = useRef([]);
    const photosRef = useRef({});
    photosRef.current = photos;
    const registration = user?.registration;

    // Modo edição: carregar as respostas já salvas
    useEffect(() => {
        if (!isEditing) return;
        let active = true;
        DatabaseService.getChecklistById(editId)
            .then((saved) => {
                if (!active || !saved) return;
                const loadedAnswers = {};
                const loadedNotes = {};
                const loadedPhotos = {};
                questions.forEach((question, index) => {
                    const entry =
                        saved.answers.find((a) => a.question === question.text) || saved.answers[index];
                    if (entry?.photos?.length) loadedPhotos[question.number] = entry.photos;
                    if (entry?.answer === 'SIM') loadedAnswers[question.number] = true;
                    if (entry?.answer === 'N/A') loadedAnswers[question.number] = 'na';
                    if (entry?.answer === 'NÃO') {
                        loadedAnswers[question.number] = false;
                        if (entry.note) loadedNotes[question.number] = entry.note;
                    }
                });
                setAnswers(loadedAnswers);
                setNotes(loadedNotes);
                setPhotos(loadedPhotos);
                setObservations(saved.observations || '');
                setOriginalDate(saved.completedAt);
                setDraftLoaded(true);
            })
            .catch((error) => {
                console.error('Erro ao carregar checklist para edição:', error);
                Alert.alert('Erro', 'Não foi possível carregar o checklist para edição.');
                navigation.goBack();
            });
        return () => {
            active = false;
        };
    }, [isEditing, editId, questions, navigation]);

    // Restaurar rascunho ao abrir a tela
    useEffect(() => {
        if (isEditing) return;
        let active = true;
        DraftService.load(registration, checklistId).then((draft) => {
            if (!active) return;
            if (draft) {
                setAnswers(draft.answers || {});
                setNotes(draft.notes || {});
                setPhotos(draft.photos || {});
                setObservations(draft.observations || '');
                setRestored(
                    Object.keys(draft.answers || {}).length > 0 ||
                    Object.keys(draft.photos || {}).length > 0
                );
            }
            setDraftLoaded(true);
        });
        return () => {
            active = false;
        };
    }, [registration, checklistId, isEditing]);

    // Salvar rascunho automaticamente a cada mudança
    useEffect(() => {
        if (isEditing || !draftLoaded || saving) return;
        const hasContent =
            Object.keys(answers).length > 0 ||
            observations.trim().length > 0 ||
            Object.values(photos).some((list) => list.length > 0);
        const timer = setTimeout(() => {
            if (hasContent) {
                DraftService.save(registration, checklistId, { answers, notes, photos, observations });
            } else {
                DraftService.clear(registration, checklistId);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [answers, notes, photos, observations, draftLoaded, saving, registration, checklistId, isEditing]);

    const restartDraft = () => {
        Alert.alert('Recomeçar checklist', 'Apagar as respostas já preenchidas?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Apagar',
                style: 'destructive',
                onPress: () => {
                    PhotoService.remove(Object.values(photos).flat());
                    setAnswers({});
                    setNotes({});
                    setPhotos({});
                    setObservations('');
                    setRestored(false);
                },
            },
        ]);
    };

    const addPhotoFrom = useCallback(async (number, source) => {
        try {
            setPhotoBusy(true);
            const uri = await PhotoService.pick(source);
            if (!uri) return;
            setPhotos((prev) => {
                const current = prev[number] || [];
                if (current.length >= MAX_PHOTOS_PER_QUESTION) {
                    PhotoService.remove([uri]);
                    return prev;
                }
                return { ...prev, [number]: [...current, uri] };
            });
        } catch (error) {
            console.error('Erro ao adicionar foto:', error);
            Alert.alert('Erro', 'Não foi possível adicionar a foto. Tente novamente.');
        } finally {
            setPhotoBusy(false);
        }
    }, []);

    const handleAddPhoto = useCallback(
        (number) => {
            if (photoBusy) return;
            setSheetFor(number);
        },
        [photoBusy]
    );

    const chooseSource = (source) => {
        const number = sheetFor;
        setSheetFor(null);
        // Aguarda o modal fechar antes de abrir câmera/galeria (necessário no iOS)
        setTimeout(() => addPhotoFrom(number, source), 350);
    };

    const handleRemovePhoto = useCallback(
        (number, uri) => {
            setPhotos((prev) => ({ ...prev, [number]: (prev[number] || []).filter((p) => p !== uri) }));
            if (isEditing) {
                removedPhotos.current.push(uri);
            } else {
                PhotoService.remove([uri]);
            }
        },
        [isEditing]
    );

    const total = questions.length;
    const answeredCount = Object.keys(answers).length;
    const remaining = total - answeredCount;
    const progress = total ? answeredCount / total : 0;
    const title = checklistName.replace('Checklist ', '');

    // Fotos só existem para respostas "N/C"; ao mudar a resposta elas são descartadas
    const handleAnswer = useCallback((number, value) => {
        setAnswers((prev) => ({ ...prev, [number]: value }));
        if (value !== false) {
            const discarded = photosRef.current[number] || [];
            if (discarded.length) {
                setPhotos((prev) => ({ ...prev, [number]: [] }));
                if (isEditing) {
                    removedPhotos.current.push(...discarded);
                } else {
                    PhotoService.remove(discarded);
                }
            }
        }
    }, [isEditing]);

    const handleNote = useCallback((number, text) => {
        setNotes((prev) => ({ ...prev, [number]: text }));
    }, []);

    const saveChecklist = async () => {
        try {
            setSaving(true);

            const answersArray = questions.map((question) => {
                const value = answers[question.number];
                const entry = {
                    question: question.text,
                    answer: value === true
                        ? 'SIM'
                        : value === false
                            ? 'NÃO'
                            : value === 'na'
                                ? 'N/A'
                                : 'NÃO RESPONDIDO',
                };
                if (value === false && notes[question.number]?.trim()) {
                    entry.note = notes[question.number].trim();
                }
                if (value === false && photos[question.number]?.length) {
                    entry.photos = photos[question.number];
                }
                return entry;
            });

            if (isEditing) {
                // A data original (completed_at) é preservada; só registra a data da edição
                await DatabaseService.updateChecklist(editId, {
                    answers: answersArray,
                    observations,
                    editedAt: new Date().toISOString(),
                });
                PhotoService.remove(removedPhotos.current);
                removedPhotos.current = [];
                setSaving(false);
                Alert.alert('Sucesso!', 'Checklist atualizado com sucesso!', [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.popToTop();
                            navigation.getParent()?.navigate('Reports', {
                                screen: 'ReportMain',
                                params: { updated: Date.now() },
                            });
                        },
                    },
                ]);
                return;
            }

            const checklistData = {
                checklistId,
                checklistTitle: checklistName,
                answers: answersArray,
                observations,
                photos: [],
                photoUrls: [],
                uploadStatus: 'completed',
                completedAt: new Date().toISOString(),
                userName: user?.name || '',
                userEmail: user?.email || '',
                userRegistration: user?.registration || '',
                userUnit: user?.unit || '',
            };

            const savedId = await DatabaseService.saveChecklist(checklistData);
            await DraftService.clear(registration, checklistId);
            const savedChecklistData = { ...checklistData, id: savedId };

            // Zerar o formulário para que o autosave não recrie o rascunho
            setAnswers({});
            setNotes({});
            setPhotos({});
            setObservations('');
            setRestored(false);
            setSaving(false);

            Alert.alert('Sucesso!', 'Checklist salvo com sucesso!', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.popToTop();
                        navigation.getParent()?.navigate('Reports', {
                            screen: 'ReportMain',
                            params: { checklistData: savedChecklistData },
                        });
                    },
                },
            ]);
        } catch (error) {
            setSaving(false);
            console.error('Erro ao salvar checklist:', error);
            Alert.alert('Erro', 'Não foi possível salvar o checklist. Tente novamente.');
        }
    };

    const handleSubmit = () => {
        if (remaining > 0) {
            Alert.alert(
                'Perguntas não respondidas',
                `Você tem ${remaining} pergunta(s) não respondida(s). Deseja continuar mesmo assim?`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Continuar', onPress: saveChecklist },
                ]
            );
        } else {
            saveChecklist();
        }
    };

    const renderQuestion = useCallback(
        ({ item }) => (
            <QuestionItem
                question={item}
                answer={answers[item.number]}
                note={notes[item.number]}
                photos={photos[item.number]}
                onAnswer={handleAnswer}
                onNote={handleNote}
                onAddPhoto={handleAddPhoto}
                onRemovePhoto={handleRemovePhoto}
            />
        ),
        [answers, notes, photos, handleAnswer, handleNote, handleAddPhoto, handleRemovePhoto]
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {isFocused && <StatusBar style="dark" />}
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        accessibilityRole="button"
                        accessibilityLabel="Voltar"
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.ink} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleBox}>
                        <Text style={styles.headerTitle} numberOfLines={1}>
                            {isEditing ? `Editar ${title}` : title}
                        </Text>
                        <Text style={styles.headerSub}>
                            {isEditing
                                ? `Realizado em ${formatDate(originalDate)}`
                                : 'Rascunho salvo automaticamente'}
                        </Text>
                    </View>
                    <Text style={styles.counter}>{answeredCount} / {total}</Text>
                    <AboutButton color={colors.ink} style={styles.logout} />
                </View>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
                </View>
            </View>

            {restored && (
                <View style={styles.restoredBanner}>
                    <Ionicons name="save-outline" size={18} color={colors.primary} />
                    <Text style={styles.restoredText}>Rascunho restaurado</Text>
                    <TouchableOpacity onPress={restartDraft} hitSlop={10} accessibilityRole="button">
                        <Text style={styles.restoredAction}>Recomeçar</Text>
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={questions}
                renderItem={renderQuestion}
                keyExtractor={(item) => item.number.toString()}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={
                    <View style={styles.observationsBox}>
                        <Text style={styles.observationsTitle}>Observações gerais</Text>
                        <TextInput
                            style={styles.observationsInput}
                            multiline
                            placeholder="Adicione suas observações aqui (opcional)"
                            placeholderTextColor="#6B7788"
                            value={observations}
                            onChangeText={setObservations}
                            textAlignVertical="top"
                        />
                    </View>
                }
            />

            <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
                <Text style={styles.footerHint}>
                    {remaining === 0
                        ? 'Tudo respondido'
                        : `${remaining} ${remaining === 1 ? 'pergunta restante' : 'perguntas restantes'}`}
                </Text>
                <TouchableOpacity
                    style={[styles.submitButton, saving && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={saving}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                >
                    <Ionicons name={saving ? 'hourglass-outline' : 'checkmark'} size={20} color="#fff" />
                    <Text style={styles.submitText}>
                        {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Finalizar checklist'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ActionSheet
                visible={sheetFor !== null}
                title="Anexar foto"
                subtitle={`Pergunta ${sheetFor} · até ${MAX_PHOTOS_PER_QUESTION} fotos`}
                onClose={() => setSheetFor(null)}
                options={[
                    {
                        icon: 'camera',
                        tint: colors.primaryTint,
                        ink: colors.primary,
                        title: 'Tirar foto',
                        subtitle: 'Usar a câmera agora',
                        onPress: () => chooseSource('camera'),
                    },
                    {
                        icon: 'images',
                        tint: colors.successTint,
                        ink: colors.success,
                        title: 'Escolher da galeria',
                        subtitle: 'Selecionar uma foto existente',
                        onPress: () => chooseSource('library'),
                    },
                ]}
            />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        backgroundColor: colors.surface,
        paddingHorizontal: 20,
        paddingBottom: 16,
        gap: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
    },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    backButton: {
        width: 44,
        height: 44,
        marginLeft: -10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleBox: { flex: 1, minWidth: 0 },
    headerTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
    headerSub: { fontSize: 12, color: colors.muted, fontWeight: '500' },
    counter: { fontSize: 14, fontWeight: '800', color: colors.primary },
    logout: { marginRight: -10 },
    progressTrack: { height: 8, borderRadius: 4, backgroundColor: colors.line, overflow: 'hidden' },
    progressFill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
    restoredBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: colors.primaryTint,
    },
    restoredText: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.primary },
    restoredAction: { fontSize: 13, fontWeight: '800', color: colors.primary },
    listContent: { padding: 20, paddingBottom: 8, gap: 12 },
    questionCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: 16,
        gap: 14,
        ...cardShadow,
    },
    questionHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    numberBadge: {
        minWidth: 28,
        height: 28,
        paddingHorizontal: 6,
        borderRadius: 14,
        backgroundColor: colors.primaryTint,
        alignItems: 'center',
        justifyContent: 'center',
    },
    numberText: { fontSize: 13, fontWeight: '800', color: colors.primary },
    questionText: { flex: 1, fontSize: 16, lineHeight: 22, fontWeight: '600', color: colors.ink, paddingTop: 3 },
    answerRow: { flexDirection: 'row', gap: 10 },
    answerButton: {
        flex: 1,
        height: 64,
        borderRadius: radius.md - 2,
        borderWidth: 1.5,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    answerText: { fontSize: 14, fontWeight: '700', color: colors.inkSoft },
    noteInput: {
        minHeight: 48,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: radius.md - 2,
        backgroundColor: colors.dangerTint,
        borderWidth: 1.5,
        borderColor: colors.dangerBorder,
        color: colors.dangerInk,
        fontSize: 14,
        fontWeight: '600',
    },
    photoRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
    thumbBox: { width: 48, height: 48 },
    thumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: colors.chip },
    thumbRemove: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.danger,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addPhoto: {
        height: 36,
        paddingHorizontal: 12,
        borderRadius: 18,
        backgroundColor: colors.primaryTint,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    addPhotoText: { fontSize: 13, fontWeight: '700', color: colors.primary },
    observationsBox: { marginTop: 8, gap: 10 },
    observationsTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
    observationsInput: {
        minHeight: 96,
        backgroundColor: colors.surface,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: radius.md - 2,
        padding: 14,
        fontSize: 16,
        color: colors.ink,
    },
    footer: {
        paddingHorizontal: 20,
        paddingTop: 12,
        gap: 8,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.line,
    },
    footerHint: { fontSize: 12, color: colors.muted, fontWeight: '600', textAlign: 'center' },
    submitButton: {
        height: 56,
        borderRadius: radius.md,
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    submitButtonDisabled: { opacity: 0.6 },
    submitText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});

export default ChecklistTakingScreen;
