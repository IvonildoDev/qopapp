import AsyncStorage from '@react-native-async-storage/async-storage';

const draftKey = (registration, checklistId) => `@draft:${registration || 'anon'}:${checklistId}`;

const DraftService = {
    async load(registration, checklistId) {
        try {
            const raw = await AsyncStorage.getItem(draftKey(registration, checklistId));
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.error('Erro ao carregar rascunho:', error);
            return null;
        }
    },

    async save(registration, checklistId, draft) {
        try {
            await AsyncStorage.setItem(
                draftKey(registration, checklistId),
                JSON.stringify({ ...draft, updatedAt: new Date().toISOString() })
            );
        } catch (error) {
            console.error('Erro ao salvar rascunho:', error);
        }
    },

    async clear(registration, checklistId) {
        try {
            await AsyncStorage.removeItem(draftKey(registration, checklistId));
        } catch (error) {
            console.error('Erro ao limpar rascunho:', error);
        }
    },
};

export default DraftService;
