import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const findApiPort = async () => {
  const possiblePorts = [3000, 3001, 3002, 3003, 3004, 3005, 3010, 3020, 3030, 3040, 3050, 3060, 3070, 3080, 3090, 3100];
  
  for (const port of possiblePorts) {
    try {
      const response = await fetch(`http://localhost:${port}/api/characters`, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(500)
      });
      if (response.ok || response.status === 405)
        return port;

    } catch {
      continue;
    }
  }
  
  return 3000
};

// Verifica se está rodando no Electron
const isElectron = process.env.ELECTRON === 'true' || process.env.NODE_ENV === 'electron';

// https://vite.dev/config/
export default defineConfig(async () => {
  const apiPort = await findApiPort();
  const target = `http://localhost:${apiPort}`;
  
  console.log(`Vite proxy configured for API server at ${target}`);
  
  return {
    plugins: [react()],
    base: './', // Importante para Electron
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          // Melhor compatibilidade com Electron
          format: 'es'
        }
      }
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
        },
        '/socket.io': {
          target,
          ws: true,
        },
        '/uploads': {
          target,
          changeOrigin: true,
        },
        '/overlay': {
          target,
          changeOrigin: true,
        }
      }
    },
    // Configurações específicas para desenvolvimento no Electron
    define: {
      __IS_ELECTRON__: isElectron
    }
  };
});
