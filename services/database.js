import * as SQLite from 'expo-sqlite';

class DatabaseService {
    constructor() {
        this.db = null;
        this.initPromise = null;
    }

    async init() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = (async () => {
            try {
                this.db = await SQLite.openDatabaseAsync('qopapp.db');
                await this.createTables();
                console.log('Database initialized successfully');
            } catch (error) {
                console.error('Error initializing database:', error);
                throw error;
            }
        })();

        return this.initPromise;
    }

    async ensureInitialized() {
        if (!this.db) {
            console.log('Database not initialized, initializing...');
            await this.init();
        }

        // Verificar se o banco está realmente disponível
        if (!this.db) {
            throw new Error('Database initialization failed');
        }
    }

    async createTables() {
        try {
            // Tabela de checklists salvos
            await this.db.execAsync(`
                CREATE TABLE IF NOT EXISTS saved_checklists (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    checklist_id TEXT NOT NULL,
                    checklist_title TEXT NOT NULL,
                    answers TEXT NOT NULL, -- JSON string
                    observations TEXT,
                    photos TEXT, -- JSON string array (URIs locais)
                    completed_at TEXT NOT NULL,
                    user_name TEXT,
                    user_email TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // Verificar se as novas colunas existem e adicioná-las se necessário
            await this.migrateDatabase();

            console.log('Tables created successfully');
        } catch (error) {
            console.error('Error creating tables:', error);
            throw error;
        }
    }

    async migrateDatabase() {
        try {
            // Verificar se a coluna photo_urls existe
            const tableInfo = await this.db.getAllAsync("PRAGMA table_info(saved_checklists)");
            const hasPhotoUrls = tableInfo.some(column => column.name === 'photo_urls');
            const hasUploadStatus = tableInfo.some(column => column.name === 'upload_status');

            // Se nenhuma das colunas existe, recriar a tabela
            if (!hasPhotoUrls && !hasUploadStatus) {
                console.log('Recreating table with new columns...');
                await this.recreateTableWithNewColumns();
            } else {
                // Adicionar coluna photo_urls se não existir
                if (!hasPhotoUrls) {
                    await this.db.execAsync(`
                        ALTER TABLE saved_checklists 
                        ADD COLUMN photo_urls TEXT DEFAULT '[]'
                    `);
                    console.log('Added photo_urls column');
                }

                // Adicionar coluna upload_status se não existir
                if (!hasUploadStatus) {
                    await this.db.execAsync(`
                        ALTER TABLE saved_checklists 
                        ADD COLUMN upload_status TEXT DEFAULT 'pending'
                    `);
                    console.log('Added upload_status column');
                }
            }

            console.log('Database migration completed');
        } catch (error) {
            console.error('Error during database migration:', error);
            // Não falhar se a migração der erro (pode ser que as colunas já existam)
        }
    }

    async recreateTableWithNewColumns() {
        try {
            // Fazer backup dos dados existentes
            const existingData = await this.db.getAllAsync('SELECT * FROM saved_checklists');

            // Dropar a tabela antiga
            await this.db.execAsync('DROP TABLE IF EXISTS saved_checklists');

            // Criar nova tabela com todas as colunas
            await this.db.execAsync(`
                CREATE TABLE saved_checklists (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    checklist_id TEXT NOT NULL,
                    checklist_title TEXT NOT NULL,
                    answers TEXT NOT NULL,
                    observations TEXT,
                    photos TEXT,
                    photo_urls TEXT DEFAULT '[]',
                    upload_status TEXT DEFAULT 'pending',
                    completed_at TEXT NOT NULL,
                    user_name TEXT,
                    user_email TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // Restaurar dados existentes
            for (const row of existingData) {
                await this.db.runAsync(`
                    INSERT INTO saved_checklists 
                    (id, checklist_id, checklist_title, answers, observations, photos, completed_at, user_name, user_email, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    row.id,
                    row.checklist_id,
                    row.checklist_title,
                    row.answers,
                    row.observations,
                    row.photos,
                    row.completed_at,
                    row.user_name,
                    row.user_email,
                    row.created_at
                ]);
            }

            console.log('Table recreated with new columns and data restored');
        } catch (error) {
            console.error('Error recreating table:', error);
            throw error;
        }
    }

    async saveChecklist(checklistData) {
        try {
            await this.ensureInitialized();

            if (!this.db) {
                throw new Error('Database not available');
            }

            // Verificar se as novas colunas existem
            const tableInfo = await this.db.getAllAsync("PRAGMA table_info(saved_checklists)");
            const hasPhotoUrls = tableInfo.some(column => column.name === 'photo_urls');
            const hasUploadStatus = tableInfo.some(column => column.name === 'upload_status');

            let sql, params;

            if (hasPhotoUrls && hasUploadStatus) {
                // Usar todas as colunas
                sql = `INSERT INTO saved_checklists 
                       (checklist_id, checklist_title, answers, observations, photos, photo_urls, upload_status, completed_at, user_name, user_email) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                params = [
                    checklistData.checklistId,
                    checklistData.checklistTitle,
                    JSON.stringify(checklistData.answers),
                    checklistData.observations || '',
                    JSON.stringify(checklistData.photos || []),
                    JSON.stringify(checklistData.photoUrls || []),
                    checklistData.uploadStatus || 'pending',
                    checklistData.completedAt,
                    checklistData.userName || '',
                    checklistData.userEmail || ''
                ];
            } else {
                // Usar apenas colunas antigas
                sql = `INSERT INTO saved_checklists 
                       (checklist_id, checklist_title, answers, observations, photos, completed_at, user_name, user_email) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                params = [
                    checklistData.checklistId,
                    checklistData.checklistTitle,
                    JSON.stringify(checklistData.answers),
                    checklistData.observations || '',
                    JSON.stringify(checklistData.photos || []),
                    checklistData.completedAt,
                    checklistData.userName || '',
                    checklistData.userEmail || ''
                ];
            }

            const result = await this.db.runAsync(sql, params);

            console.log('Checklist saved with ID:', result.lastInsertRowId);
            return result.lastInsertRowId;
        } catch (error) {
            console.error('Error saving checklist:', error);
            throw error;
        }
    }

    async getAllChecklists() {
        try {
            await this.ensureInitialized();

            if (!this.db) {
                throw new Error('Database not available');
            }

            const result = await this.db.getAllAsync(`
                SELECT * FROM saved_checklists 
                ORDER BY created_at DESC
            `);

            return result.map(row => ({
                id: row.id,
                checklistId: row.checklist_id,
                checklistTitle: row.checklist_title,
                answers: JSON.parse(row.answers),
                observations: row.observations,
                photos: JSON.parse(row.photos),
                photoUrls: row.photo_urls ? JSON.parse(row.photo_urls) : [],
                uploadStatus: row.upload_status || 'pending',
                completedAt: row.completed_at,
                userName: row.user_name,
                userEmail: row.user_email,
                createdAt: row.created_at
            }));
        } catch (error) {
            console.error('Error getting all checklists:', error);
            throw error;
        }
    }

    async getChecklistById(id) {
        try {
            await this.ensureInitialized();

            const result = await this.db.getFirstAsync(
                `SELECT * FROM saved_checklists WHERE id = ?`,
                [id]
            );

            if (!result) return null;

            return {
                id: result.id,
                checklistId: result.checklist_id,
                checklistTitle: result.checklist_title,
                answers: JSON.parse(result.answers),
                observations: result.observations,
                photos: JSON.parse(result.photos),
                completedAt: result.completed_at,
                userName: result.user_name,
                userEmail: result.user_email,
                createdAt: result.created_at
            };
        } catch (error) {
            console.error('Error getting checklist by ID:', error);
            throw error;
        }
    }

    async deleteChecklist(id) {
        try {
            await this.ensureInitialized();

            await this.db.runAsync(
                `DELETE FROM saved_checklists WHERE id = ?`,
                [id]
            );
            console.log('Checklist deleted with ID:', id);
        } catch (error) {
            console.error('Error deleting checklist:', error);
            throw error;
        }
    }

    async getChecklistsByType(checklistId) {
        try {
            await this.ensureInitialized();

            const result = await this.db.getAllAsync(
                `SELECT * FROM saved_checklists WHERE checklist_id = ? ORDER BY created_at DESC`,
                [checklistId]
            );

            return result.map(row => ({
                id: row.id,
                checklistId: row.checklist_id,
                checklistTitle: row.checklist_title,
                answers: JSON.parse(row.answers),
                observations: row.observations,
                photos: JSON.parse(row.photos),
                photoUrls: row.photo_urls ? JSON.parse(row.photo_urls) : [],
                uploadStatus: row.upload_status || 'pending',
                completedAt: row.completed_at,
                userName: row.user_name,
                userEmail: row.user_email,
                createdAt: row.created_at
            }));
        } catch (error) {
            console.error('Error getting checklists by type:', error);
            throw error;
        }
    }

    // Atualizar URLs das imagens após upload
    async updatePhotoUrls(checklistId, photoUrls, uploadStatus = 'uploaded') {
        try {
            await this.ensureInitialized();

            if (!this.db) {
                console.log('Database not available, skipping photo URL update');
                return;
            }

            // Verificar se as colunas existem
            const tableInfo = await this.db.getAllAsync("PRAGMA table_info(saved_checklists)");
            const hasPhotoUrls = tableInfo.some(column => column.name === 'photo_urls');
            const hasUploadStatus = tableInfo.some(column => column.name === 'upload_status');

            if (hasPhotoUrls && hasUploadStatus) {
                await this.db.runAsync(
                    `UPDATE saved_checklists 
                    SET photo_urls = ?, upload_status = ? 
                    WHERE id = ?`,
                    [JSON.stringify(photoUrls), uploadStatus, checklistId]
                );
            } else {
                console.log('Columns not available for update, skipping...');
            }

            console.log('Photo URLs updated for checklist:', checklistId);
        } catch (error) {
            console.error('Error updating photo URLs:', error);
            throw error;
        }
    }

    // Buscar checklists pendentes de upload
    async getPendingUploads() {
        try {
            await this.ensureInitialized();

            if (!this.db) {
                console.log('Database not available, returning empty array');
                return [];
            }

            // Verificar se a coluna upload_status existe
            const tableInfo = await this.db.getAllAsync("PRAGMA table_info(saved_checklists)");
            const hasUploadStatus = tableInfo.some(column => column.name === 'upload_status');

            let result;
            if (hasUploadStatus) {
                result = await this.db.getAllAsync(
                    `SELECT * FROM saved_checklists 
                    WHERE upload_status = 'pending' AND photos != '[]'
                    ORDER BY created_at ASC`
                );
            } else {
                // Se não tem a coluna, buscar todos os checklists com fotos
                result = await this.db.getAllAsync(
                    `SELECT * FROM saved_checklists 
                    WHERE photos != '[]'
                    ORDER BY created_at ASC`
                );
            }

            return result.map(row => ({
                id: row.id,
                checklistId: row.checklist_id,
                checklistTitle: row.checklist_title,
                answers: JSON.parse(row.answers),
                observations: row.observations,
                photos: JSON.parse(row.photos),
                photoUrls: row.photo_urls ? JSON.parse(row.photo_urls) : [],
                uploadStatus: row.upload_status || 'pending',
                completedAt: row.completed_at,
                userName: row.user_name,
                userEmail: row.user_email,
                createdAt: row.created_at
            }));
        } catch (error) {
            console.error('Error getting pending uploads:', error);
            throw error;
        }
    }

    // Método para testar se a migração funcionou
    async testMigration() {
        try {
            await this.ensureInitialized();

            if (!this.db) {
                console.log('Database not available for migration test');
                return { hasPhotoUrls: false, hasUploadStatus: false };
            }

            const tableInfo = await this.db.getAllAsync("PRAGMA table_info(saved_checklists)");
            console.log('Table columns:', tableInfo.map(col => col.name));

            const hasPhotoUrls = tableInfo.some(column => column.name === 'photo_urls');
            const hasUploadStatus = tableInfo.some(column => column.name === 'upload_status');

            console.log('Has photo_urls:', hasPhotoUrls);
            console.log('Has upload_status:', hasUploadStatus);

            return { hasPhotoUrls, hasUploadStatus };
        } catch (error) {
            console.error('Error testing migration:', error);
            return { hasPhotoUrls: false, hasUploadStatus: false };
        }
    }

    // Método para reinicializar o banco se necessário
    async reinitialize() {
        try {
            console.log('Reinitializing database...');
            this.db = null;
            this.initPromise = null;
            await this.init();
            console.log('Database reinitialized successfully');
        } catch (error) {
            console.error('Error reinitializing database:', error);
            throw error;
        }
    }
}

export default new DatabaseService();