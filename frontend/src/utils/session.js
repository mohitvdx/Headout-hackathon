// Simple no-login session using a cookie

const COOKIE_NAME = 'campus_session';
const COOKIE_TTL_DAYS = 365;

const generateId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

const makeDisplayName = (id) => {
    const suffix = id.replace(/[^a-f0-9]/gi, '').slice(-4).toUpperCase();
    return `Student-${suffix}`;
};

export const ensureSession = () => {
    const existing = getCookie(COOKIE_NAME);
    if (existing) {
        return JSON.parse(decodeURIComponent(existing));
    }
    const id = generateId();
    const displayName = makeDisplayName(id);
    const payload = { id, displayName };
    setCookie(COOKIE_NAME, encodeURIComponent(JSON.stringify(payload)), COOKIE_TTL_DAYS);
    return payload;
};

export const getSession = () => {
    const existing = getCookie(COOKIE_NAME);
    if (!existing) return null;
    try {
        return JSON.parse(decodeURIComponent(existing));
    } catch (_e) {
        return null;
    }
};

function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + d.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
}

function getCookie(name) {
    const cname = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(cname) === 0) {
            return c.substring(cname.length, c.length);
        }
    }
    return '';
}


