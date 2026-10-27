import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { UserProvider, useUser } from './context/UserContext';
import LoginScreen from './screens/LoginScreen';
import ChecklistsScreen from './screens/ChecklistsScreen';
import HistoryScreen from './screens/HistoryScreen';
import HistoryDetailScreen from './screens/HistoryDetailScreen';
import ChecklistTakingScreen from './screens/ChecklistTakingScreen';
import ReportScreen from './screens/ReportScreen';
import AboutScreen from './screens/AboutScreen';
import DatabaseService from './services/database';
import SyncService from './services/syncService';
import AboutButton from './components/AboutButton';
import BrandLogo from './components/BrandLogo';
import ConfirmDialog from './components/ConfirmDialog';
import { colors, stackScreenOptions } from './theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const hidden = { headerShown: false };
const headerRight = () => <AboutButton />;
const headerLeft = () => <BrandLogo size={30} style={styles.headerLogo} />;

const ChecklistsStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="ChecklistsMain" component={ChecklistsScreen} options={hidden} />
    <Stack.Screen name="ChecklistTaking" component={ChecklistTakingScreen} options={hidden} />
  </Stack.Navigator>
);

const ReportStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="ReportMain" component={ReportScreen} options={{ title: 'Relatórios', headerRight, headerLeft }} />
  </Stack.Navigator>
);

const HistoryStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="HistoryMain" component={HistoryScreen} options={hidden} />
    <Stack.Screen
      name="HistoryDetail"
      component={HistoryDetailScreen}
      options={{ title: 'Detalhes do Checklist', headerRight }}
    />
  </Stack.Navigator>
);

const TAB_ICONS = {
  Checklists: ['checkbox', 'checkbox-outline'],
  Reports: ['document-text', 'document-text-outline'],
  History: ['time', 'time-outline'],
  Logout: ['log-out', 'log-out-outline'],
};

const TabIcon = ({ route, focused }) => {
  const [filled, outline] = TAB_ICONS[route.name];
  return (
    <View style={[styles.tabPill, focused && styles.tabPillActive]}>
      <Ionicons
        name={focused ? filled : outline}
        size={22}
        color={focused ? colors.primary : colors.muted}
      />
    </View>
  );
};

// A aba "Sair" não tem tela: o toque abre a confirmação em vez de navegar
const EmptyScreen = () => null;

const MainTabs = () => {
  const insets = useSafeAreaInsets();
  const { logout } = useUser();
  const [logoutVisible, setLogoutVisible] = React.useState(false);

  const confirmLogout = () => setLogoutVisible(true);

  const handleLogout = () => {
    setLogoutVisible(false);
    logout();
  };

  return (
    <>
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom + 6,
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
        },
        tabBarIcon: ({ focused }) => <TabIcon route={route} focused={focused} />,
      })}
    >
      <Tab.Screen name="Checklists" component={ChecklistsStack} options={{ tabBarLabel: 'Checklists' }} />
      <Tab.Screen name="Reports" component={ReportStack} options={{ tabBarLabel: 'Relatórios' }} />
      <Tab.Screen name="History" component={HistoryStack} options={{ tabBarLabel: 'Histórico' }} />
      <Tab.Screen
        name="Logout"
        component={EmptyScreen}
        options={{ tabBarLabel: 'Sair' }}
        listeners={{
          tabPress: (event) => {
            event.preventDefault();
            confirmLogout();
          },
        }}
      />
    </Tab.Navigator>

    <ConfirmDialog
      visible={logoutVisible}
      icon="log-out-outline"
      destructive
      title="Sair do aplicativo?"
      message="Você precisará entrar novamente com seu nome, matrícula e unidade. Os checklists salvos neste aparelho continuam guardados."
      confirmLabel="Sair"
      onConfirm={handleLogout}
      onCancel={() => setLogoutVisible(false)}
    />
    </>
  );
};

// Componente Principal que verifica login
const MainApp = () => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Tabs" component={MainTabs} options={hidden} />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: 'Sobre' }} />
    </Stack.Navigator>
  );
};

export default function App() {
  useEffect(() => {
    // Inicializar banco de dados e serviços
    const initDatabase = async () => {
      try {
        await DatabaseService.init();

        // Testar migração do banco
        const migrationResult = await DatabaseService.testMigration();
        console.log('Migration test result:', migrationResult);

        // Se a migração falhou, tentar reinicializar
        if (!migrationResult.hasPhotoUrls || !migrationResult.hasUploadStatus) {
          console.log('Migration failed, attempting to reinitialize database...');
          try {
            await DatabaseService.reinitialize();
            const retryResult = await DatabaseService.testMigration();
            console.log('Retry migration result:', retryResult);
          } catch (reinitError) {
            console.error('Failed to reinitialize database:', reinitError);
          }
        }

        // Configurar URL do servidor (substitua pela sua URL)
        SyncService.setServerUrl('https://seu-servidor.com/api');

        // Iniciar sincronização automática (a cada 5 minutos)
        SyncService.startAutoSync(5);

        console.log('Database and sync services initialized in App.js');
      } catch (error) {
        console.error('Failed to initialize database:', error);
        Alert.alert('Erro', 'Não foi possível inicializar o banco de dados.');
      }
    };

    initDatabase();
  }, []);

  return (
    <SafeAreaProvider>
      <UserProvider>
        <NavigationContainer>
          <MainApp />
          <StatusBar style="light" />
        </NavigationContainer>
      </UserProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.muted,
  },
  headerLogo: {
    marginLeft: 16,
  },
  tabPill: {
    width: 56,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPillActive: {
    backgroundColor: colors.primaryTint,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
});
