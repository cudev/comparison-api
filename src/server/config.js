let config; // eslint-disable-line

if (typeof window === 'undefined' && typeof process !== 'undefined') {
  config = {
    host: process.env.VIRTUAL_HOST || '127.0.0.1',
    port: process.env.VIRTUAL_PORT || 3000,
    assets: process.env.NODE_ENV === 'development' ? 'http://localhost:3004' : '',
    mongoPort: process.env.VIRTUAL_MONGO_PORT || 27017
  };
} else {
  config = window.config;
}

export default config;
