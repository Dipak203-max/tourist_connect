const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const BASE_URL = API_BASE_URL.replace('/api', '');

export const config = {
    API_BASE_URL,
    BASE_URL,
};

export const getMediaUrl = (path) => {
    if (!path || path === 'null' || path === 'undefined') return null;
    if (path.startsWith('http')) return path;
    
    // Normalize path: replace backslashes with forward slashes and ensure leading slash
    const normalizedPath = path.replace(/\\/g, '/');
    const pathWithSlash = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
    
    return `${BASE_URL}${pathWithSlash}`;
};


