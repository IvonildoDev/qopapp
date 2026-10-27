import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PhotoService from '../services/photoService';

const UserContext = createContext();

// A foto do avatar fica guardada por matrícula, então sobrevive a sair e entrar de novo
const avatarKey = (registration) => `@avatar:${registration}`;

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [avatarUri, setAvatarUri] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    useEffect(() => {
        if (!user?.registration) {
            setAvatarUri(null);
            return;
        }
        AsyncStorage.getItem(avatarKey(user.registration))
            .then((uri) => setAvatarUri(uri || null))
            .catch((error) => console.error('Erro ao carregar avatar:', error));
    }, [user?.registration]);

    const loadUser = async () => {
        try {
            const userData = await AsyncStorage.getItem('@user_data');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (name, registration, unit) => {
        try {
            const userData = { name, registration, unit };
            await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
            setUser(userData);
            return true;
        } catch (error) {
            console.error('Erro ao salvar dados do usuário:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('@user_data');
            setUser(null);
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    // uri = nova foto; null = remover a foto atual
    const updateAvatar = async (uri) => {
        if (!user?.registration) return;
        try {
            const previous = avatarUri;
            if (uri) {
                await AsyncStorage.setItem(avatarKey(user.registration), uri);
            } else {
                await AsyncStorage.removeItem(avatarKey(user.registration));
            }
            setAvatarUri(uri || null);
            if (previous && previous !== uri) PhotoService.remove([previous]);
        } catch (error) {
            console.error('Erro ao salvar avatar:', error);
        }
    };

    return (
        <UserContext.Provider value={{ user, avatarUri, isLoading, login, logout, updateAvatar }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser deve ser usado dentro de um UserProvider');
    }
    return context;
};
