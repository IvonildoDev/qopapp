# Q&OP - Checklist Application

Aplicativo de checklists para operações logísticas desenvolvido em React Native.

## Desenvolvido por

**Ivonildo Lima** - Desenvolvedor Full Stack

## Descrição

Q&OP é um aplicativo móvel para realizar checklists operacionais de veículos e cargas, com funcionalidades de:

- Preenchimento de checklists (Pré-Operacional, Carga, Caminhão)
- Armazenamento local em SQLite
- Geração de relatórios em PDF
- Compartilhamento de relatórios
- Histórico completo com filtros por data
- Interface intuitiva e fácil de usar
- Funciona completamente offline

## Tecnologias Utilizadas

- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **SQLite** - Banco de dados local
- **React Navigation** - Navegação entre telas
- **Expo Print** - Geração de PDFs
- **Expo Sharing** - Compartilhamento de arquivos

## Instalação

```bash
# Instalar dependências
npm install

# Executar no Android
npm run android

# Executar no iOS
npm run ios

# Executar no Expo Go
npm start
```

## Scripts Disponíveis

### Limpeza de Arquivos

Para limpar arquivos de build, cache e temporários:

```powershell
# PowerShell (Windows)
.\clean.ps1
```

Este script remove:

- Arquivos de build do Android (`android/build`, `android/app/build`)
- Cache do Expo (`.expo`)
- Arquivos do Metro bundler
- Logs (`*.log`, `npm-debug.log`, etc)
- Arquivos temporários (`*.tmp`, `*.temp`, `*.cache`)
- Pods do iOS (`ios/Pods`, `ios/build`)

### Limpeza Completa (com node_modules)

```powershell
Remove-Item -Path node_modules -Recurse -Force
npm install
```

## Estrutura do Projeto

```
qopapp/
├── android/              # Código nativo Android
├── ios/                  # Código nativo iOS
├── components/           # Componentes reutilizáveis
├── context/              # Context API (UserContext)
├── screens/              # Telas do aplicativo
│   ├── AboutScreen.js
│   ├── ChecklistsScreen.js
│   ├── ChecklistTakingScreen.js
│   ├── HistoryScreen.js
│   ├── HistoryDetailScreen.js
│   ├── LoginScreen.js
│   └── ReportScreen.js
├── services/             # Serviços (Database, Sync)
├── utils/                # Utilitários (checklistData, dateUtils)
├── App.js               # Componente principal
├── clean.ps1            # Script de limpeza
└── package.json         # Dependências
```

## Funcionalidades

### 1. Login

- Nome do usuário
- Matrícula
- E-mail
- Unidade

### 2. Checklists

- **Pré-Operacional**: Verificações antes de iniciar operação
- **Carga**: Checklist de carregamento
- **Caminhão**: Inspeção do veículo

### 3. Preenchimento

- Respostas SIM/NÃO para cada item
- Campo de observações
- Salvamento local automático

### 4. Relatórios

- Visualização de checklists salvos
- Estatísticas (Total, Sim, Não)
- Geração de PDF
- Compartilhamento
- Exclusão de checklists

### 5. Histórico

- Lista de todos os checklists realizados
- Filtros por data
- Visualização de detalhes
- Estatísticas por checklist

### 6. Sobre

- Como usar o aplicativo
- Principais recursos
- Tecnologias utilizadas
- Informações do usuário logado
- Botão de logout

## Banco de Dados

O aplicativo utiliza SQLite para armazenamento local com a seguinte estrutura:

**Tabela: saved_checklists**

- `id` - INTEGER PRIMARY KEY
- `checklist_id` - TEXT (tipo do checklist)
- `checklist_title` - TEXT (título)
- `answers` - TEXT (JSON com respostas)
- `observations` - TEXT (observações)
- `photos` - TEXT (JSON - desabilitado)
- `completed_at` - DATETIME (data de conclusão)
- `user_name` - TEXT (nome do usuário)
- `user_email` - TEXT (e-mail do usuário)
- `created_at` - DATETIME (data de criação)

## Versão

**1.0.0** - Versão inicial

## Licença

© 2025 Q&OP - Todos os direitos reservados
Desenvolvido por Ivonildo Lima
