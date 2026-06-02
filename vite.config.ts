import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

// Automatic helper to discover any local logo.jpeg or similar and copy to public/logo.jpeg
function copyLogoIfFound() {
  try {
    const possiblePaths = [
      'logo.jpeg', 'logo.jpg', 'logo.png',
      'src/logo.jpeg', 'src/logo.jpg', 'src/logo.png',
      'src/components/logo.jpeg', 'src/components/logo.jpg', 'src/components/logo.png',
    ];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        if (!fs.existsSync('public')) {
          fs.mkdirSync('public');
        }
        fs.copyFileSync(p, 'public/logo.jpeg');
        console.log(`[Vite Logo Copy] Successfully copied ${p} to public/logo.jpeg`);
        break;
      }
    }
  } catch (err) {
    console.error('[Vite Logo Copy] Error:', err);
  }
}
copyLogoIfFound();

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
});
