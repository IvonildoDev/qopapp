import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SectionList,
    TouchableOpacity,
    Alert,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { formatDate } from '../utils/dateUtils';
import DatabaseService from '../services/database';
import AboutButton from '../components/AboutButton';
import BrandLogo from '../components/BrandLogo';
import { colors, radius, cardShadow } from '../theme';

const FILTERS = [
    { key: 'all', label: 'Todos' },
    { key: 'today', label: 'Hoje' },
    { key: 'issues', label: 'Com problemas' },
];

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getDayLabel = (iso) => {
    const day = startOfDay(new Date(iso));
    const today = startOfDay(new Date());
    const diff = Math.round((today - day) / 86400000);
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Ontem';
    return formatDate(iso);
};

const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

const Badge = ({ label, tint, ink }) => (
    <View style={[styles.badge, { backgroundColor: tint }]}>
        <Text style={[styles.badgeText, { color: ink }]}>{label}</Text>
    </View>
);

const HistoryItem = React.memo(({ item, onPress }) => {
    const hasIssues = item.issues > 0;
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress(item)}
            activeOpacity={0.8}
            accessibilityRole="button"
        >
            <View style={[styles.stripe, { backgroundColor: hasIssues ? colors.danger : colors.success }]} />
            <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.title.replace('Checklist ', '')}
                    </Text>
                    <Text style={styles.cardTime}>{formatTime(item.completedAt)}</Text>
                </View>
                <View style={styles.badges}>
                    {hasIssues ? (
                        <Badge
                            label={`${item.issues} ${item.issues === 1 ? 'resposta "Não"' : 'respostas "Não"'}`}
                            tint={colors.dangerTint}
                            ink={colors.dangerInk}
                        />
                    ) : (
                        <Badge label="Tudo conforme" tint={colors.successTint} ink={colors.successInk} />
                    )}
                    <Badge label={`${item.questionCount} perguntas`} tint={colors.primaryTint} ink={colors.primary} />
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7788" />
        </TouchableOpacity>
    );
});

const HistoryScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('all');

    const loadHistoryData = useCallback(async () => {
        try {
            const checklists = await DatabaseService.getAllChecklists();
            setHistory(
                checklists.map((checklist) => ({
                    id: checklist.id,
                    title: checklist.checklistTitle,
                    questionCount: checklist.answers.length,
                    issues: checklist.answers.filter((a) => a.answer === 'NÃO').length,
                    completedAt: checklist.completedAt,
                }))
            );
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
            Alert.alert('Erro', 'Não foi possível carregar o histórico.');
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadHistoryData();
        }, [loadHistoryData])
    );

    const sections = useMemo(() => {
        const term = query.trim().toLowerCase();
        const todayStart = startOfDay(new Date());

        const filtered = history
            .filter((item) => {
                if (filter === 'issues' && item.issues === 0) return false;
                if (filter === 'today' && new Date(item.completedAt) < todayStart) return false;
                if (!term) return true;
                return (
                    item.title.toLowerCase().includes(term) ||
                    formatDate(item.completedAt).includes(term)
                );
            })
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

        const groups = [];
        filtered.forEach((item) => {
            const label = getDayLabel(item.completedAt);
            const last = groups[groups.length - 1];
            if (last && last.title === label) {
                last.data.push(item);
            } else {
                groups.push({ title: label, data: [item] });
            }
        });
        return groups;
    }, [history, query, filter]);

    const handlePress = useCallback(
        (item) => navigation.navigate('HistoryDetail', { checklistId: item.id }),
        [navigation]
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {isFocused && <StatusBar style="dark" />}
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <View style={styles.titleRow}>
                    <BrandLogo size={32} />
                    <Text style={styles.title}>Histórico</Text>
                    <AboutButton color={colors.ink} style={styles.logout} />
                </View>
                <View style={styles.search}>
                    <Ionicons name="search" size={20} color={colors.muted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar por checklist ou data"
                        placeholderTextColor={colors.muted}
                        value={query}
                        onChangeText={setQuery}
                        returnKeyType="search"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity
                            onPress={() => setQuery('')}
                            hitSlop={12}
                            accessibilityLabel="Limpar busca"
                        >
                            <Ionicons name="close-circle" size={20} color={colors.muted} />
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.chips}>
                    {FILTERS.map(({ key, label }) => {
                        const active = filter === key;
                        return (
                            <TouchableOpacity
                                key={key}
                                style={[styles.chip, active && styles.chipActive]}
                                onPress={() => setFilter(key)}
                                accessibilityRole="button"
                                accessibilityState={{ selected: active }}
                            >
                                <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <HistoryItem item={item} onPress={handlePress} />}
                renderSectionHeader={({ section }) => (
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                )}
                stickySectionHeadersEnabled={false}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="document-text-outline" size={48} color={colors.border} />
                        <Text style={styles.emptyText}>
                            {history.length === 0
                                ? 'Nenhum checklist encontrado'
                                : 'Nenhum checklist corresponde aos filtros'}
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
    header: {
        backgroundColor: colors.surface,
        paddingHorizontal: 20,
        paddingBottom: 16,
        gap: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    logout: { marginRight: -10 },
    title: { flex: 1, fontSize: 26, fontWeight: '800', color: colors.ink },
    search: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        height: 48,
        paddingHorizontal: 14,
        borderRadius: radius.sm + 2,
        backgroundColor: colors.background,
    },
    searchInput: { flex: 1, fontSize: 15, fontWeight: '500', color: colors.ink },
    chips: { flexDirection: 'row', gap: 8 },
    chip: {
        height: 36,
        paddingHorizontal: 16,
        borderRadius: 18,
        backgroundColor: colors.chip,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipActive: { backgroundColor: colors.primary },
    chipText: { fontSize: 13, fontWeight: '600', color: colors.inkSoft },
    chipTextActive: { color: '#fff', fontWeight: '700' },
    listContent: { padding: 20, paddingTop: 8, paddingBottom: 24 },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.muted,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        marginTop: 12,
        marginBottom: 10,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: 16,
        marginBottom: 10,
        ...cardShadow,
    },
    stripe: { width: 6, alignSelf: 'stretch', borderRadius: 3 },
    cardBody: { flex: 1, minWidth: 0, gap: 8 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    cardTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.ink },
    cardTime: { fontSize: 13, color: colors.muted, fontWeight: '500' },
    badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    badge: { height: 26, paddingHorizontal: 10, borderRadius: 13, justifyContent: 'center' },
    badgeText: { fontSize: 12, fontWeight: '700' },
    empty: { alignItems: 'center', paddingVertical: 48, gap: 10 },
    emptyText: { fontSize: 16, color: colors.muted, textAlign: 'center' },
});

export default HistoryScreen;
