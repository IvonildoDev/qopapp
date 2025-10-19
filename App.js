import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
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

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Componente de Header com Avatar e Informações do Usuário
const UserHeader = () => {
  const { user } = useUser();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.avatarContainer}>
        <Ionicons name="person-circle" size={40} color="#fff" />
      </View>
      <View style={styles.headerInfo}>
        <Text style={styles.headerName}>{user?.name}</Text>
        <Text style={styles.headerDetails}>Mat. {user?.registration} | {user?.unit}</Text>
      </View>
    </View>
  );
};

const ChecklistsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="ChecklistsMain"
        component={ChecklistsScreen}
        options={{
          title: 'Checklists',
          headerRight: () => <UserHeader />,
        }}
      />
      <Stack.Screen
        name="ChecklistTaking"
        component={ChecklistTakingScreen}
        options={{
          title: 'Responder Checklist',
          headerRight: () => <UserHeader />,
        }}
      />
    </Stack.Navigator>
  );
};

const ReportStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="ReportMain"
        component={ReportScreen}
        options={{
          title: 'Relatórios',
          headerRight: () => <UserHeader />,
        }}
      />
    </Stack.Navigator>
  );
};

const HistoryStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="HistoryMain"
        component={HistoryScreen}
        options={{
          title: 'Histórico',
          headerRight: () => <UserHeader />,
        }}
      />
      <Stack.Screen
        name="HistoryDetail"
        component={HistoryDetailScreen}
        options={{
          title: 'Detalhes do Checklist',
          headerRight: () => <UserHeader />,
        }}
      />
    </Stack.Navigator>
  );
};

const AboutStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="AboutMain"
        component={AboutScreen}
        options={{
          title: 'Sobre',
          headerRight: () => <UserHeader />,
        }}
      />
    </Stack.Navigator>
  );
};

// Componente Principal que verifica login
const MainApp = () => {
  const { user, isLoading, logout } = useUser();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Checklists"
        component={ChecklistsStack}
        options={{
          title: 'Checklists',
          tabBarLabel: 'Checklists',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox-outline" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportStack}
        options={{
          title: 'Relatórios',
          tabBarLabel: 'Relatórios',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryStack}
        options={{
          title: 'Histórico',
          tabBarLabel: 'Histórico',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={AboutStack}
        options={{
          title: 'Sobre',
          tabBarLabel: 'Sobre',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="information-circle-outline" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  const [dbReady, setDbReady] = React.useState(false);

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

        setDbReady(true);
        console.log('Database and sync services initialized in App.js');
      } catch (error) {
        console.error('Failed to initialize database:', error);
        Alert.alert('Erro', 'Não foi possível inicializar o banco de dados.');
      }
    };

    initDatabase();
  }, []);

  return (
    <UserProvider>
      <NavigationContainer>
        <MainApp />
        <StatusBar style="auto" />
      </NavigationContainer>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarContainer: {
    marginRight: 8,
  },
  headerInfo: {
    alignItems: 'flex-end',
  },
  headerName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerDetails: {
    color: '#fff',
    fontSize: 11,
    opacity: 0.9,
  },
});
