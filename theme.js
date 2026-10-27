export const colors = {
    primary: '#0B3A8F',
    primaryTint: '#E4EDFF',
    onPrimaryMuted: '#C9D8F5',
    background: '#F3F5F8',
    surface: '#FFFFFF',
    ink: '#0E1A2B',
    inkSoft: '#3B4A5F',
    muted: '#4F5E73',
    line: '#E1E6EE',
    border: '#D5DBE5',
    chip: '#EDF0F5',
    success: '#1B7F4B',
    successTint: '#DDF3E8',
    successInk: '#10613A',
    danger: '#C62828',
    dangerTint: '#FDECEC',
    dangerBorder: '#E7A3A3',
    dangerInk: '#8E1B1B',
    warnTint: '#FFF1D6',
    warnInk: '#6B4200',
};

export const radius = { sm: 12, md: 16, lg: 20, xl: 28 };

export const cardShadow = {
    shadowColor: '#0E1A2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
};

export const checklistMeta = {
    pre_operacional: { icon: 'clipboard-outline', tint: '#E4EDFF', ink: '#0B3A8F' },
    caminhao: { icon: 'bus-outline', tint: '#FFF1D6', ink: '#8A5300' },
    carga: { icon: 'cube-outline', tint: '#DDF3E8', ink: '#1B7F4B' },
};

export const getChecklistMeta = (id) =>
    checklistMeta[id] || { icon: 'checkbox-outline', tint: colors.primaryTint, ink: colors.primary };

export const stackScreenOptions = {
    headerStyle: { backgroundColor: colors.primary },
    headerTintColor: '#FFFFFF',
    headerTitleStyle: { fontWeight: '700' },
};
