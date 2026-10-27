import AsyncStorage from '@react-native-async-storage/async-storage';

class ImageUploadService {
    constructor() {
        this.baseUrl = 'https://seu-servidor.com/api'; // Substitua pela sua API
        this.uploadQueue = [];
        this.isUploading = false;
    }

    // Configurar URL do servidor
    setBaseUrl(url) {
        this.baseUrl = url;
    }

    // Upload de uma imagem
    async uploadImage(imageUri, checklistId, userId) {
        try {
            const formData = new FormData();

            // Usar a nova API do expo-file-system com classe File
            const file = new File([imageUri], `checklist_${checklistId}_${Date.now()}.jpg`, {
                type: 'image/jpeg'
            });

            formData.append('image', {
                uri: imageUri,
                type: 'image/jpeg',
                name: `checklist_${checklistId}_${Date.now()}.jpg`
            });
            formData.append('checklistId', checklistId);
            formData.append('userId', userId);
            formData.append('timestamp', new Date().toISOString());

            const response = await fetch(`${this.baseUrl}/upload-image`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
            }

            const result = await response.json();
            return result.imageUrl; // URL da imagem no servidor

        } catch (error) {
            console.error('Erro no upload da imagem:', error);
            throw error;
        }
    }

    // Upload de múltiplas imagens
    async uploadImages(imageUris, checklistId, userId) {
        const uploadPromises = imageUris.map(async (uri, index) => {
            try {
                const imageUrl = await this.uploadImage(uri, checklistId, userId);
                return { originalUri: uri, serverUrl: imageUrl, index };
            } catch (error) {
                console.error(`Erro no upload da imagem ${index + 1}:`, error);
                return { originalUri: uri, serverUrl: null, index, error };
            }
        });

        return await Promise.all(uploadPromises);
    }

    // Adicionar à fila de upload (para modo offline)
    async queueForUpload(checklistId, imageUris, userId) {
        const queueItem = {
            id: Date.now(),
            checklistId,
            imageUris,
            userId,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        this.uploadQueue.push(queueItem);
        await this.saveQueueToStorage();
        return queueItem.id;
    }

    // Processar fila de upload
    async processUploadQueue() {
        if (this.isUploading || this.uploadQueue.length === 0) {
            return;
        }

        this.isUploading = true;

        try {
            const pendingItems = this.uploadQueue.filter(item => item.status === 'pending');

            for (const item of pendingItems) {
                try {
                    const results = await this.uploadImages(item.imageUris, item.checklistId, item.userId);

                    // Atualizar status
                    item.status = 'completed';
                    item.results = results;

                    // Atualizar banco de dados local com URLs do servidor
                    await this.updateLocalDatabase(item.checklistId, results);

                } catch (error) {
                    item.status = 'failed';
                    item.error = error.message;
                }
            }

            // Remover itens completados da fila
            this.uploadQueue = this.uploadQueue.filter(item => item.status !== 'completed');
            await this.saveQueueToStorage();

        } finally {
            this.isUploading = false;
        }
    }

    // Salvar fila no armazenamento local
    async saveQueueToStorage() {
        try {
            await AsyncStorage.setItem('uploadQueue', JSON.stringify(this.uploadQueue));
        } catch (error) {
            console.error('Erro ao salvar fila de upload:', error);
        }
    }

    // Carregar fila do armazenamento local
    async loadQueueFromStorage() {
        try {
            const queueData = await AsyncStorage.getItem('uploadQueue');
            if (queueData) {
                this.uploadQueue = JSON.parse(queueData);
            }
        } catch (error) {
            console.error('Erro ao carregar fila de upload:', error);
        }
    }

    // Atualizar banco de dados local com URLs do servidor
    async updateLocalDatabase(checklistId, uploadResults) {
        // Esta função seria implementada para atualizar o banco local
        // com as URLs das imagens no servidor
        console.log('Atualizando banco local com URLs do servidor:', uploadResults);
    }

    // Verificar conectividade
    async checkConnectivity() {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // Upload com retry automático
    async uploadWithRetry(imageUri, checklistId, userId, maxRetries = 3) {
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await this.uploadImage(imageUri, checklistId, userId);
            } catch (error) {
                lastError = error;
                console.log(`Tentativa ${attempt} falhou:`, error.message);

                if (attempt < maxRetries) {
                    // Aguardar antes da próxima tentativa
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
            }
        }

        throw lastError;
    }

    // Compressão de imagem antes do upload
    async compressImage(imageUri, quality = 0.8) {
        try {
            // Aqui você pode implementar compressão usando expo-image-manipulator
            // ou outra biblioteca de compressão
            // Retornando o URI original por enquanto
            return imageUri;
        } catch (error) {
            console.error('Erro na compressão:', error);
            return imageUri; // Retornar original se falhar
        }
    }
}

export default new ImageUploadService();

