class ApiConfig {
  constructor() {
    this.baseUrl = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return this.baseUrl;

    const possiblePorts = [3000, 3001, 3002, 3003, 3004, 3005, 3010, 3020, 3030, 3040, 3050, 3060, 3070, 3080, 3090, 3100];
    
    for (const port of possiblePorts) {
      try {
        const testUrl = `http://localhost:${port}/api/characters`;
        const response = await fetch(testUrl, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(1000)
        });
        
        if (response.ok || response.status === 405) {
          this.baseUrl = `http://localhost:${port}`;
          this.initialized = true;
          console.log(`API detected at port ${port}`);
          return this.baseUrl;
        }
      } catch (error) {
        continue;
      }
    }
    
    this.baseUrl = 'http://localhost:3000';
    this.initialized = true;
    console.warn('Could not detect API port, using default 3000');
    return this.baseUrl;
  }

  getUrl(endpoint = '') {
    if (!this.initialized)
      throw new Error('ApiConfig not initialized. Call initialize() first.');

    return `${this.baseUrl}${endpoint}`;
  }

  getApiUrl(endpoint) {
    return this.getUrl(`/api${endpoint}`);
  }

  getOverlayUrl(id) {
    return this.getUrl(`/overlay/${id}`);
  }

  getUploadUrl(filename) {
    const url = this.getUrl(`/uploads/${filename}`);
    console.log(`Generated upload URL: ${url} for filename: ${filename}`);
    return url;
  }
}

const apiConfig = new ApiConfig();

export default apiConfig;