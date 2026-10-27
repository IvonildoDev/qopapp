import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

const getInitials = (name = '') =>
    name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');

// Avatar redondo com a foto do usuário (ou as iniciais). Com onPress, mostra o selo de câmera
const Avatar = ({ name, uri, size = 44, onPress }) => {
    const radius = size / 2;
    const content = uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: radius }} />
    ) : (
        <View style={[styles.initials, { width: size, height: size, borderRadius: radius }]}>
            <Text style={[styles.initialsText, { fontSize: size * 0.36 }]}>{getInitials(name)}</Text>
        </View>
    );

    if (!onPress) return content;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Alterar foto do perfil"
        >
            {content}
            <View style={styles.badge}>
                <Ionicons name="camera" size={11} color={colors.primary} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    initials: {
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    initialsText: { color: colors.primary, fontWeight: '800' },
    badge: {
        position: 'absolute',
        right: -2,
        bottom: -2,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Avatar;
