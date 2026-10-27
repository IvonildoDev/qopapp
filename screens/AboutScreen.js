import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AboutScreen = () => {
    const openLink = (url) => {
        Linking.openURL(url).catch(err => console.error('Erro ao abrir link:', err));
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Header */}
            <View style={styles.header}>
                <Ionicons name="information-circle" size={80} color="#0B3A8F" />
                <Text style={styles.appName}>Q&OP</Text>
                <Text style={styles.version}>Versão 1.0.0</Text>
            </View>

            {/* Desenvolvedor
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="person" size={24} color="#0B3A8F" />
                    <Text style={styles.sectionTitle}>Desenvolvedor</Text>
                </View>
                <View style={styles.developerCard}>
                    <Text style={styles.developerName}>Ivonildo Lima</Text>
                    <Text style={styles.developerRole}>Desenvolvedor Full Stack</Text>
                </View>
            </View> */}

            {/* Como Usar */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="book" size={24} color="#0B3A8F" />
                    <Text style={styles.sectionTitle}>Como Usar</Text>
                </View>

                <View style={styles.instructionCard}>
                    <View style={styles.instructionItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>1</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Fazer Login</Text>
                            <Text style={styles.stepDescription}>
                                Acesse o aplicativo com suas credenciais (nome, matrícula, e-mail e unidade).
                            </Text>
                        </View>
                    </View>

                    <View style={styles.instructionItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>2</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Escolher Checklist</Text>
                            <Text style={styles.stepDescription}>
                                Na aba "Checklists", selecione o tipo de checklist que deseja preencher (Pré-Operacional, Carga ou Caminhão).
                            </Text>
                        </View>
                    </View>

                    <View style={styles.instructionItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>3</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Responder Perguntas</Text>
                            <Text style={styles.stepDescription}>
                                Responda cada pergunta tocando em Conforme, N/C (não conforme) ou N/A (não se aplica). Adicione observações se necessário.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.instructionItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>4</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Salvar Checklist</Text>
                            <Text style={styles.stepDescription}>
                                Após responder todas as perguntas, toque em "Salvar" para gravar o checklist no dispositivo.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.instructionItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>5</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Gerar Relatório</Text>
                            <Text style={styles.stepDescription}>
                                Na aba "Relatórios", visualize todos os checklists salvos e compartilhe em formato PDF.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.instructionItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>6</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Ver Histórico</Text>
                            <Text style={styles.stepDescription}>
                                Na aba "Histórico", consulte todos os checklists realizados, filtre por data e veja os detalhes de cada um.
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Recursos */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="star" size={24} color="#0B3A8F" />
                    <Text style={styles.sectionTitle}>Principais Recursos</Text>
                </View>

                <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={styles.featureText}>Checklists personalizados por tipo</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={styles.featureText}>Armazenamento local seguro (SQLite)</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={styles.featureText}>Geração de relatórios em PDF</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={styles.featureText}>Compartilhamento de relatórios</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={styles.featureText}>Histórico completo com filtros</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={styles.featureText}>Interface intuitiva e fácil de usar</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={styles.featureText}>Funciona offline</Text>
                    </View>
                </View>
            </View>

            {/* Informações Técnicas */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="code-slash" size={24} color="#0B3A8F" />
                    <Text style={styles.sectionTitle}>Tecnologias</Text>
                </View>
                <View style={styles.techList}>
                    <Text style={styles.techItem}>• React Native & Expo</Text>
                    <Text style={styles.techItem}>• SQLite Database</Text>
                    <Text style={styles.techItem}>• React Navigation</Text>
                    <Text style={styles.techItem}>• Expo Print & Sharing</Text>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>© 2025 Q&OP</Text>
                <Text style={styles.footerText}>Desenvolvido  por Ivonildo Lima</Text>
                <Text style={styles.footerSubtext}>Todos os direitos reservados</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F5F8',
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: '#fff',
        borderRadius: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#0B3A8F',
        marginTop: 15,
    },
    version: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    section: {
        marginBottom: 25,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    developerCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    developerName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0B3A8F',
        marginBottom: 5,
    },
    developerRole: {
        fontSize: 16,
        color: '#666',
    },
    instructionCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    instructionItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    stepNumber: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#0B3A8F',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    stepNumberText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    stepDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    featuresList: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    featureText: {
        fontSize: 15,
        color: '#333',
        marginLeft: 10,
    },
    techList: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    techItem: {
        fontSize: 15,
        color: '#333',
        marginBottom: 8,
        lineHeight: 22,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 20,
        marginTop: 10,
    },
    footerText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    footerSubtext: {
        fontSize: 12,
        color: '#999',
        marginTop: 5,
    },
});

export default AboutScreen;
