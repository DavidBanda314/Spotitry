const STORAGE_KEY = 'spotitry-theme';
const DEFAULT_THEME = 'dark';

export const getTheme = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === 'light' || stored === 'dark' ? stored : DEFAULT_THEME;
    } catch (e) {
        return DEFAULT_THEME;
    }
};

export const applyTheme = (theme) => {
    const next = theme === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    return next;
};

export const setTheme = (theme) => {
    const next = theme === 'light' ? 'light' : 'dark';
    try {
        localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
        /* ignore storage errors (e.g. private mode) */
    }
    return applyTheme(next);
};

export const toggleTheme = () => {
    const next = getTheme() === 'light' ? 'dark' : 'light';
    return setTheme(next);
};

export const initTheme = () => applyTheme(getTheme());
