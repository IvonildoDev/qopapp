import React from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

// Painel que sobe da parte de baixo da tela com uma lista de ações
// options: [{ icon, tint, ink, title, subtitle, onPress }]
const ActionSheet = ({ visible, title, subtitle, options, onClose }) => {
    const insets = useSafeAreaInsets();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]} onPress={() => {}}>
                    <View style={styles.handle} />
                    <Text style={styles.title}>{title}</Text>
                    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

                    {options.map((option) => (
                        <TouchableOpacity
                            key={option.title}
                            style={styles.option}
                            onPress={option.onPress}
                            activeOpacity={0.8}
                            accessibilityRole="button"
                        >
                            <View style={[styles.icon, { backgroundColor: option.tint }]}>
                                <Ionicons name={option.icon} size={24} color={option.ink} />
                            </View>
                            <View style={styles.optionText}>
                                <Text style={[styles.optionTitle, option.destructive && styles.destructive]}>
                                    {option.title}
                                </Text>
                                {option.subtitle ? (
                                    <Text style={styles.optionSub}>{option.subtitle}</Text>
                                ) : null}
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#6B7788" />
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        style={styles.cancel}
                        onPress={onClose}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                    >
                        <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(14,26,43,0.5)',
    },
    sheet: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        paddingHorizontal: 20,
        paddingTop: 12,
        gap: 12,
    },
    handle: {
        alignSelf: 'center',
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.border,
        marginBottom: 8,
    },
    title: { fontSize: 20, fontWeight: '800', color: colors.ink },
    subtitle: { fontSize: 13, fontWeight: '500', color: colors.muted, marginTop: -8, marginBottom: 4 },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 14,
        borderRadius: radius.lg,
        borderWidth: 1.5,
        borderColor: colors.line,
        backgroundColor: colors.surface,
    },
    icon: {
        width: 48,
        height: 48,
        borderRadius: radius.md - 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionText: { flex: 1, minWidth: 0 },
    optionTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
    destructive: { color: colors.dangerInk },
    optionSub: { fontSize: 13, fontWeight: '500', color: colors.muted, marginTop: 2 },
    cancel: {
        height: 52,
        borderRadius: radius.md,
        backgroundColor: colors.chip,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    cancelText: { fontSize: 16, fontWeight: '700', color: colors.inkSoft },
});

export default ActionSheet;
