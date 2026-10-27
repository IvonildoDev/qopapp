import React from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

// Diálogo de confirmação centralizado, no lugar do Alert nativo
const ConfirmDialog = ({
    visible,
    icon = 'help-circle',
    destructive = false,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    onConfirm,
    onCancel,
}) => {
    const tint = destructive ? colors.dangerTint : colors.primaryTint;
    const ink = destructive ? colors.danger : colors.primary;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
            statusBarTranslucent
        >
            <Pressable style={styles.backdrop} onPress={onCancel}>
                <Pressable style={styles.card} onPress={() => {}}>
                    <View style={[styles.iconCircle, { backgroundColor: tint }]}>
                        <Ionicons name={icon} size={32} color={ink} />
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    {message ? <Text style={styles.message}>{message}</Text> : null}

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onCancel}
                            activeOpacity={0.8}
                            accessibilityRole="button"
                        >
                            <Text style={styles.cancelText}>{cancelLabel}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: destructive ? colors.danger : colors.primary }]}
                            onPress={onConfirm}
                            activeOpacity={0.85}
                            accessibilityRole="button"
                        >
                            <Text style={styles.confirmText}>{confirmLabel}</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 28,
        backgroundColor: 'rgba(14,26,43,0.55)',
    },
    card: {
        width: '100%',
        maxWidth: 360,
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 20,
        shadowColor: colors.ink,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 28,
        elevation: 12,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: { fontSize: 20, fontWeight: '800', color: colors.ink, textAlign: 'center' },
    message: {
        fontSize: 15,
        lineHeight: 22,
        color: colors.muted,
        textAlign: 'center',
        marginTop: 8,
    },
    actions: { flexDirection: 'row', gap: 12, marginTop: 24, alignSelf: 'stretch' },
    button: {
        flex: 1,
        height: 52,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: { backgroundColor: colors.chip },
    cancelText: { fontSize: 16, fontWeight: '700', color: colors.inkSoft },
    confirmText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

export default ConfirmDialog;
