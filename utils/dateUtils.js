// Utilitários comuns para o app

// O SQLite grava CURRENT_TIMESTAMP em UTC como "AAAA-MM-DD HH:MM:SS", sem indicar o fuso.
// Sem tratamento, o JavaScript lê esse texto como horário local e a data pode
// aparecer um dia à frente (ex.: 21h no Brasil = 00h UTC do dia seguinte).
const parseDate = (dateString) => {
    if (dateString instanceof Date) return dateString;
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
        return new Date(`${dateString.replace(' ', 'T')}Z`);
    }
    return new Date(dateString);
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    return parseDate(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

export const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return parseDate(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
