// Dados dos checklists do sistema QOP
export const checklistData = {
    pre_operacional: [
        { number: 1, text: "Esta Operação é Rotineira?" },
        { number: 2, text: "Superfícies de trabalho estão secas ou então são antiderrapantes." },
        { number: 3, text: "Existe padrão para executar a tarefa?" },
        { number: 4, text: "Não se percebem odores estranhos ou contaminantes aéreos visíveis (poeiras, fumaça, névoas, vapores) na área de trabalho." },
        { number: 5, text: "Todos os Executantes foram treinados no padrão?" },
        { number: 6, text: "Sinalizar a área com cones e fita zebrada." },
        { number: 7, text: "As válvulas do poço estão operacionais em bom estado." },
        { number: 8, text: "As conexões de poço estão sem desgaste, em conformidade." },
        { number: 9, text: "Existe conhecimento de pressão máxima que poderia ocorrer durante a operação?" },
        { number: 10, text: "Todos os dispositivos de medição, monitoramento e controle estão instalados e disponíveis?" },
        { number: 11, text: "Os empregados estão usando corretamente os EPI's e estes são apropriados a tarefa." },
        { number: 12, text: "Foi verificado todos os componentes (Valvulas, manômetros, conexões, etc.) das instalações existentes são compatíveis em pressões maximas?" },
        { number: 13, text: "As mangueiras do sistema hidraulico estão em conformidade sem vazamentos." },
        { number: 14, text: "Espaço adequado em torno do poço para permitir operação e movimentação segura de materiais e pessoas." },
        { number: 15, text: "Sistema Hidraulico da unidade não apresenta vazamentos de óleo." },
        { number: 16, text: "Foi verificado todos os componentes (Valvulas, manômetros, conexões, etc.) das instalações temporárias são compatíveis em pressões maximas?" },
        { number: 17, text: "Se a operação for de TESTE DE COLUNA, verificar posicionamento das valvulas" },
        { number: 18, text: "Se a operação for CIRCULAÇÃO, verificar posicionamento de válvulas." },
        { number: 19, text: "Todos os dispositivos de medição, monitoramento e controle (manômetros, sensores de pressão, registradores, PSV, etc) estão calibrados e compatíveis com as pressões que irão ocorrer?" },
        { number: 20, text: "O sistema de bombeio é recomendado para a operação a ser realizada?" },
        { number: 21, text: "Os instrumentos de medição estão calibrados e em bom estado." },
        { number: 22, text: "As inspeções dos componentes das INSTALAÇÕES TEMPORÁRIAS estão atualizadas?" },
        { number: 23, text: "Todas as tubulações, conexões, instrumentos, etc. Das INSTALAÇÕES TEMPORÁRIAS apresentam-se bom estado e sem danos ou desgastes visuais?" },
        { number: 24, text: "No caso de TESTE HIDROSTATICO, o sistema foi totalmente preenchido com água, ou seja: todo ar foi removido?" },
        { number: 25, text: "Foi definida uma valvula segura para operação?" },
        { number: 26, text: "As INSTALAÇÕES TEMPORÁRIAS estão devidamente montadas e apoiadas?" },
        { number: 27, text: "Foi medido o nível de H2S?" }
    ],
    caminhao: [
        { number: 1, text: "Freios" },
        { number: 2, text: "Nível de líquido de arrefecimento" },
        { number: 3, text: "Nível de Óleo da Direção Hidraulica" },
        { number: 4, text: "Nível de Óleo Lubrificante do Motor" },
        { number: 5, text: "Nível de Óleo do Sistema Hidraulico" },
        { number: 6, text: "Pneus / Step" },
        { number: 7, text: "Retrovisores" },
        { number: 8, text: "Sistema de direção" },
        { number: 9, text: "Tacografo" },
        { number: 10, text: "Vazamentos de Ar" },
        { number: 11, text: "Funcionamento do motor" },
        { number: 12, text: "Lubrificação Geral" },
        { number: 13, text: "Nível de Combustível" },
        { number: 14, text: "Vazamentos de òleo" },
        { number: 15, text: "Extintor de incêndio" },
        { number: 16, text: "Estribos" },
        { number: 17, text: "Parachoque" },
        { number: 18, text: "Velocimetro" },
        { number: 19, text: "Farois / Lanternas dianteiras e Traseiras" },
        { number: 20, text: "Buzina" },
        { number: 21, text: "Limpador de Parabrisas / Esguicho d'água" },
        { number: 22, text: "Painel de Instrumentos" },
        { number: 23, text: "Pisca alertas / Setas de Direção" },
        { number: 24, text: "Stop de freio" },
        { number: 25, text: "Luz alta, baixa e alarme de ré" },
        { number: 26, text: "Luz traseira e lâmpada de placa" },
        { number: 27, text: "Identificação de Capacidade de carga" },
        { number: 28, text: "Macaco / Chave de roda" },
        { number: 29, text: "Trincos das Portas" }
    ],
    carga: [
        { number: 1.1, text: "Foi realizado inspeção visual dos olhais de ancoragem da plataforma de trabalho?" },
        { number: 1.2, text: "Foi realizado inspeção visual na cinta de amarração tipo catraca?" },
        { number: 1.3, text: "A catraca da cinta de amarração está operacional?" },
        { number: 1.4, text: "Foi verificado a integridade do suporte ancoragem do lubrificador?" },
        { number: 2.1, text: "Os acessórios utilizados para amarração da carga são adequados?" },
        { number: 2.2, text: "Foi verificado a tensão da cinta após amarração da carga para garantir a qualidade da amarração?" },
        { number: 2.4, text: "Foi verificado o fechamento e o travamento do suporte do lubrificador após acondicionamento da carga?" },
        { number: 2.5, text: "A amarração tem 4 pontos de ancoragem?" },
        { number: 3.1, text: "Todos os executantes envolvidos na atividade foram treinados e estão cientes sobre os riscos envolvidos e os cuidados a serem adotados?" },
        { number: 4.1, text: "O equipamento que fará o transporte está íntegro?" }
    ]
};

// Função para obter as perguntas de um tipo específico de checklist
export const getChecklistQuestions = (checklistType) => {
    return checklistData[checklistType] || [];
};

// Função para obter informações básicas dos checklists disponíveis
export const getAvailableChecklists = () => {
    return [
        { id: 'pre_operacional', name: 'Checklist Pré-Operacional', questionCount: checklistData.pre_operacional.length },
        { id: 'caminhao', name: 'Checklist Caminhão', questionCount: checklistData.caminhao.length },
        { id: 'carga', name: 'Checklist Carga', questionCount: checklistData.carga.length },
    ];
};