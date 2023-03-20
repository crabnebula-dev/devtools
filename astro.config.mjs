import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import compress from 'astro-compress'

// https://astro.build/config
export default defineConfig({
    integrations: [svelte(), compress()],
    vite: {
        envPrefix: ['VITE_', 'TAURI_'],
        build: {
            // Tauri uses chromium on windows and Webkit on macOS and Safari
            target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome107' : 'safari13',
            // don't minify for debug builds
            minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
            // produce sourcemaps for debug builds
            sourcemap: !!process.env.TAURI_DEBUG,
        },
        server: {
            strictPort: true,
            watch: {
                ignored: ['**/target/**']
            }
        }
    }
});
