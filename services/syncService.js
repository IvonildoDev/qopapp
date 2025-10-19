import { AppState } from 'react-native';
import ImageUploadService from './imageUploadService';
import DatabaseService from './database';

class SyncService {
    constructor() {
        this.isProcessing = false;
        this.syncInterval = null;
        this.appState = AppState.currentState;

        // Configurar listeners
        this.setupAppStateListener();
    }

    setupAppStateListener() {
        AppState.addEventListener('change', (nextAppState) => {
            if (this.appState.match(/inactive|background/) && nextAppState === 'active') {
                // App voltou ao foreground, tentar sincronizar
                this.processPendingUploads();
            }
            this.appState = nextAppState;
        });
    }

    // Iniciar sincronização automática
    startAutoSync(intervalMinutes = 5) {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        this.syncInterval = setInterval(() => {
            this.processPendingUploads();
        }, intervalMinutes * 60 * 1000);

        console.log(`Auto-sync iniciado: ${intervalMinutes} minutos`);
    }

    // Parar sincronização automática
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        console.log('Auto-sync parado');
    }

    // Processar uploads pendentes
    async processPendingUploads() {
        if (this.isProcessing) {
            console.log('Sync já em andamento, pulando...');
            return;
        }

        try {
            this.isProcessing = true;
            console.log('Iniciando processamento de uploads pendentes...');

            // Verificar conectividade
            const isOnline = await ImageUploadService.checkConnectivity();
            if (!isOnline) {
                console.log('Sem conectividade, pulando sync');
                return;
            }

            // Buscar checklists pendentes
            const pendingChecklists = await DatabaseService.getPendingUploads();

            if (!pendingChecklists || pendingChecklists.length === 0) {
                console.log('Nenhum checklist pendente encontrado');
                return;
            }

            console.log(`Encontrados ${pendingChecklists.length} checklists pendentes`);

            // Processar cada checklist
            for (const checklist of pendingChecklists) {
                await this.processChecklistUpload(checklist);
            }

            // Processar fila de upload do ImageUploadService
            await ImageUploadService.processUploadQueue();

        } catch (error) {
            console.error('Erro no processamento de uploads:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    // Processar upload de um checklist específico
    async processChecklistUpload(checklist) {
        try {
            console.log(`Processando upload do checklist ${checklist.id}...`);

            if (!checklist.photos || checklist.photos.length === 0) {
                // Sem fotos, marcar como uploaded
                await DatabaseService.updatePhotoUrls(checklist.id, [], 'uploaded');
                return;
            }

            // Fazer upload das imagens
            const uploadResults = await ImageUploadService.uploadImages(
                checklist.photos,
                checklist.id,
                checklist.userName || 'unknown'
            );

            // Extrair URLs bem-sucedidas
            const successfulUrls = uploadResults
                .filter(result => result.serverUrl)
                .map(result => result.serverUrl);

            // Atualizar status no banco
            const uploadStatus = successfulUrls.length === checklist.photos.length ? 'uploaded' : 'partial';
            await DatabaseService.updatePhotoUrls(checklist.id, successfulUrls, uploadStatus);

            console.log(`Checklist ${checklist.id} processado: ${successfulUrls.length}/${checklist.photos.length} imagens enviadas`);

        } catch (error) {
            console.error(`Erro no upload do checklist ${checklist.id}:`, error);

            // Marcar como falha se necessário
            try {
                await DatabaseService.updatePhotoUrls(checklist.id, [], 'failed');
            } catch (dbError) {
                console.error('Erro ao atualizar status de falha:', dbError);
            }
        }
    }

    // Sincronização manual
    async manualSync() {
        console.log('Iniciando sincronização manual...');
        await this.processPendingUploads();
    }

    // Verificar status de sincronização
    async getSyncStatus() {
        try {
            const pendingChecklists = await DatabaseService.getPendingUploads();
            const queueLength = ImageUploadService.uploadQueue ? ImageUploadService.uploadQueue.length : 0;

            return {
                pendingChecklists: pendingChecklists ? pendingChecklists.length : 0,
                queueLength,
                isProcessing: this.isProcessing,
                isOnline: await ImageUploadService.checkConnectivity()
            };
        } catch (error) {
            console.error('Erro ao obter status de sync:', error);
            return {
                pendingChecklists: 0,
                queueLength: 0,
                isProcessing: false,
                isOnline: false
            };
        }
    }

    // Limpar dados antigos (opcional)
    async cleanupOldData(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            // Aqui você pode implementar limpeza de dados antigos
            console.log(`Limpeza de dados anteriores a ${cutoffDate.toISOString()}`);

        } catch (error) {
            console.error('Erro na limpeza de dados:', error);
        }
    }

    // Configurar URL do servidor
    setServerUrl(url) {
        ImageUploadService.setBaseUrl(url);
    }

    // Destruir serviço
    destroy() {
        this.stopAutoSync();
        // Remover listeners se necessário
    }
}

export default new SyncService();
