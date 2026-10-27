import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAvailableChecklists } from '../utils/checklistData';
import { useUser } from '../context/UserContext';
import AboutButton from '../components/AboutButton';
import Avatar from '../components/Avatar';
import BrandLogo from '../components/BrandLogo';
import ActionSheet from '../components/ActionSheet';
import PhotoService from '../services/photoService';
import DatabaseService from '../services/database';
import { colors, radius, cardShadow, getChecklistMeta } from '../theme';

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia,';
    if (hour < 18) return 'Boa tarde,';
    return 'Boa noite,';
};

const isToday = (iso) => {
    const date = new Date(iso);
    const now = new Date();
    return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
    );
};

const ChecklistsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user, avatarUri, updateAvatar } = useUser();
    const isFocused = useIsFocused();
    const [avatarSheet, setAvatarSheet] = useState(false);

    const chooseAvatar = (source) => {
        setAvatarSheet(false);
        // Aguarda o painel fechar antes de abrir câmera/galeria (necessário no iOS)
        setTimeout(async () => {
            try {
                const uri = await PhotoService.pick(source, { square: true });
                if (uri) await updateAvatar(uri);
            } catch (error) {
                console.error('Erro ao alterar avatar:', error);
                Alert.alert('Erro', 'Não foi possível alterar a foto. Tente novamente.');
            }
        }, 350);
    };

    const avatarOptions = [
        {
            icon: 'camera',
            tint: colors.primaryTint,
            ink: colors.primary,
            title: 'Tirar foto',
            subtitle: 'Usar a câmera agora',
            onPress: () => chooseAvatar('camera'),
        },
        {
            icon: 'images',
            tint: colors.successTint,
            ink: colors.success,
            title: 'Escolher da galeria',
            subtitle: 'Selecionar uma foto existente',
            onPress: () => chooseAvatar('library'),
        },
        ...(avatarUri
            ? [
                  {
                      icon: 'trash',
                      tint: colors.dangerTint,
                      ink: colors.danger,
                      title: 'Remover foto',
                      subtitle: 'Voltar a mostrar as iniciais',
                      destructive: true,
                      onPress: () => {
                          setAvatarSheet(false);
                          updateAvatar(null);
                      },
                  },
              ]
            : []),
    ];
    const checklists = useMemo(() => getAvailableChecklists(), []);
    const [stats, setStats] = useState({ today: 0, total: 0 });

    useFocusEffect(
        useCallback(() => {
            let active = true;
            DatabaseService.getAllChecklists()
                .then((saved) => {
                    if (!active) return;
                    setStats({
                        today: saved.filter((item) => isToday(item.completedAt)).length,
                        total: saved.length,
                    });
                })
                .catch((error) => console.error('Erro ao carregar resumo:', error));
            return () => {
                active = false;
            };
        }, [])
    );

    const handleChecklistPress = (checklist) => {
        navigation.navigate('ChecklistTaking', {
            checklistId: checklist.id,
            checklistName: checklist.name,
        });
    };

    const renderItem = ({ item }) => {
        const meta = getChecklistMeta(item.id);
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => handleChecklistPress(item)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}, ${item.questionCount} perguntas`}
            >
                <View style={[styles.cardIcon, { backgroundColor: meta.tint }]}>
                    <Ionicons name={meta.icon} size={28} color={meta.ink} />
                </View>
                <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{item.name.replace('Checklist ', '')}</Text>
                    <Text style={styles.cardSub}>{item.questionCount} perguntas</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7788" />
            </TouchableOpacity>
        );
    };

    const header = (
        <View>
            <View style={[styles.hero, { paddingTop: insets.top + 16 }]}>
                <View style={styles.brandRow}>
                    <BrandLogo size={32} />
                    <Text style={styles.brandName}>Q&OP</Text>
                    <AboutButton style={styles.logout} />
                </View>

                <View style={styles.userRow}>
                    <Avatar
                        name={user?.name}
                        uri={avatarUri}
                        size={48}
                        onPress={() => setAvatarSheet(true)}
                    />
                    <View style={styles.userInfo}>
                        <Text style={styles.greeting}>{getGreeting()}</Text>
                        <Text style={styles.userName} numberOfLines={1}>{user?.name}</Text>
                    </View>
                    <View style={styles.unitChip}>
                        <View style={styles.unitDot} />
                        <Text style={styles.unitText}>{user?.unit}</Text>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{stats.today}</Text>
                        <Text style={styles.statLabel}>feitos hoje</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{stats.total}</Text>
                        <Text style={styles.statLabel}>salvos no aparelho</Text>
                    </View>
                </View>
            </View>
            <Text style={styles.sectionTitle}>Iniciar um checklist</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {isFocused && <StatusBar style="light" />}
            <FlatList
                data={checklists}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={header}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <ActionSheet
                visible={avatarSheet}
                title="Foto do perfil"
                subtitle="Aparece no topo da tela inicial"
                options={avatarOptions}
                onClose={() => setAvatarSheet(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    listContent: { paddingBottom: 24 },
    hero: {
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        paddingBottom: 28,
        borderBottomLeftRadius: radius.xl,
        borderBottomRightRadius: radius.xl,
        gap: 20,
    },
    userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    brandName: { flex: 1, fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
    userInfo: { flex: 1, minWidth: 0 },
    greeting: { fontSize: 13, color: colors.onPrimaryMuted, fontWeight: '500' },
    userName: { fontSize: 18, fontWeight: '700', color: '#fff' },
    unitChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        height: 32,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.14)',
    },
    logout: { marginRight: -10 },
    unitDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#5EE0A0' },
    unitText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    statsRow: { flexDirection: 'row', gap: 10 },
    stat: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: radius.md,
        paddingVertical: 12,
        paddingHorizontal: 14,
    },
    statValue: { fontSize: 26, fontWeight: '800', color: '#fff', lineHeight: 30 },
    statLabel: { fontSize: 12, color: colors.onPrimaryMuted, marginTop: 4, fontWeight: '500' },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.ink,
        marginTop: 24,
        marginBottom: 12,
        marginHorizontal: 20,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 12,
        ...cardShadow,
    },
    cardIcon: {
        width: 52,
        height: 52,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardText: { flex: 1, minWidth: 0 },
    cardTitle: { fontSize: 17, fontWeight: '700', color: colors.ink },
    cardSub: { fontSize: 13, color: colors.muted, marginTop: 2, fontWeight: '500' },
});

export default ChecklistsScreen;
