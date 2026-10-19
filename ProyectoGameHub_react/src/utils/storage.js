export function readStorage(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
        console.error(`Could not read "${key}" from storage:`, error);
        return fallback;
    }
}

export function writeStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Could not write "${key}" to storage:`, error);
    }
}

export function removeStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Could not remove "${key}" from storage:`, error);
    }
}
