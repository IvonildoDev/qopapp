import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Ícone no topo das telas que abre a tela Sobre
const AboutButton = ({ color = '#FFFFFF', style }) => {
    const navigation = useNavigation();

    return (
        <TouchableOpacity
            style={[styles.button, style]}
            onPress={() => navigation.navigate('About')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Sobre o aplicativo"
        >
            <Ionicons name="information-circle-outline" size={26} color={color} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default AboutButton;
