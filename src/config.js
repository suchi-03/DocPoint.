// Single source of truth for backend base URL in production
const BASE_URL = 'https://docpoint-backend-kb9f.onrender.com';
export default BASE_URL;
// Normalize and enforce correct behavior across environments
// - In development: fallback to localhost:2000
// - In production: DO NOT fallback silently; require VITE_BACKEND_URL
// Note: If you want environment-based config later, we can reintroduce
// a normalized resolver. For now, we hardcode to ensure production works.
