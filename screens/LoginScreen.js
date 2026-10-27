import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import BrandLogo from '../components/BrandLogo';
import { colors, radius } from '../theme';

const Field = React.forwardRef(({ label, icon, style, ...inputProps }, ref) => {
    const [focused, setFocused] = useState(false);
    return (
        <View style={[styles.field, style]}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputBox, focused && styles.inputBoxFocused]}>
                <Ionicons name={icon} size={20} color={focused ? colors.primary : colors.muted} />
                <TextInput
                    ref={ref}
                    style={styles.input}
                    placeholderTextColor="#6B7788"
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    {...inputProps}
                />
            </View>
        </View>
    );
});

const LoginScreen = () => {
    const insets = useSafeAreaInsets();
    const [name, setName] = useState('');
    const [registration, setRegistration] = useState('');
    const [unit, setUnit] = useState('');
    const registrationRef = useRef(null);
    const unitRef = useRef(null);
    const { login } = useUser();

    const handleLogin = async () => {
        if (!name.trim() || !registration.trim() || !unit.trim()) {
            Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
            return;
        }

        const success = await login(name.trim(), registration.trim(), unit.trim().toUpperCase());
        if (!success) {
            Alert.alert('Erro', 'Não foi possível fazer o login. Tente novamente.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.hero, { paddingTop: insets.top + 40 }]}>
                    <BrandLogo size={72} style={styles.logo} />
                    <Text style={styles.title}>Q&OP</Text>
                    <Text style={styles.subtitle}>Inspeções e checklists operacionais</Text>
                </View>

                <View style={styles.card}>
                    <Field
                        label="Nome completo"
                        icon="person-outline"
                        placeholder="Como aparece no crachá"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        returnKeyType="next"
                        onSubmitEditing={() => registrationRef.current?.focus()}
                    />

                    <View style={styles.row}>
                        <Field
                            ref={registrationRef}
                            style={styles.half}
                            label="Matrícula"
                            icon="card-outline"
                            placeholder="000000"
                            value={registration}
                            onChangeText={setRegistration}
                            keyboardType="numeric"
                            returnKeyType="next"
                            onSubmitEditing={() => unitRef.current?.focus()}
                        />
                        <Field
                            ref={unitRef}
                            style={styles.half}
                            label="Unidade"
                            icon="business-outline"
                            placeholder="USL-15"
                            value={unit}
                            onChangeText={setUnit}
                            autoCapitalize="characters"
                            returnKeyType="done"
                            onSubmitEditing={handleLogin}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleLogin}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                    >
                        <Text style={styles.buttonText}>Entrar</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
                    <View style={styles.dot} />
                    <Text style={styles.footerText}>Funciona offline · v1.0.0</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1 },
    hero: {
        backgroundColor: colors.primary,
        paddingHorizontal: 28,
        paddingBottom: 84,
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
    },
    logo: { marginBottom: 20 },
    subtitle: { fontSize: 16, lineHeight: 23, color: colors.onPrimaryMuted, marginTop: 8 },
    title: { fontSize: 34, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
    card: {
        marginTop: -56,
        marginHorizontal: 20,
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: 24,
        gap: 18,
        shadowColor: colors.ink,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 32,
        elevation: 6,
    },
    row: { flexDirection: 'row', gap: 12 },
    half: { flex: 1, minWidth: 0 },
    field: { gap: 6 },
    label: { fontSize: 13, fontWeight: '600', color: colors.inkSoft },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        height: 52,
        paddingHorizontal: 14,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: radius.md - 2,
        backgroundColor: '#F8FAFC',
    },
    inputBoxFocused: { borderColor: colors.primary, backgroundColor: '#fff' },
    input: { flex: 1, minWidth: 0, fontSize: 16, fontWeight: '500', color: colors.ink },
    button: {
        height: 56,
        borderRadius: radius.md,
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 4,
    },
    buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
    footer: {
        flex: 1,
        justifyContent: 'flex-end',
        flexDirection: 'row',
        alignItems: 'flex-end',
        alignSelf: 'center',
        gap: 8,
        paddingTop: 32,
    },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, marginBottom: 5 },
    footerText: { fontSize: 13, fontWeight: '500', color: colors.muted },
});

export default LoginScreen;
