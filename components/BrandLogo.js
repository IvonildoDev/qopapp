import React from 'react';
import { Image, StyleSheet } from 'react-native';

// Logo da empresa (assets/logo.png) em quadrado com cantos arredondados
const BrandLogo = ({ size = 32, style }) => (
    <Image
        source={require('../assets/logo.png')}
        style={[styles.logo, { width: size, height: size, borderRadius: size * 0.22 }, style]}
        accessibilityLabel="Logo"
    />
);

const styles = StyleSheet.create({
    logo: { backgroundColor: '#1A89FD' },
});

export default BrandLogo;
