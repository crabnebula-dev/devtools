import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import compress from 'astro-compress'
import {writeFileSync} from 'fs'
import path from 'path'

writeFileSync(
    path.resolve('./src/styles/_env.scss'),
    `$TAURI_PLATFORM: '${process.env.TAURI_PLATFORM}';
  $TAURI_ARCH: '${process.env.TAURI_ARCH}';
  $TAURI_FAMILY: '${process.env.TAURI_FAMILY}';
  $TAURI_PLATFORM_VERSION: '${process.env.TAURI_PLATFORM_VERSION}';
  $TAURI_PLATFORM_TYPE: '${process.env.TAURI_PLATFORM_TYPE}';
  $TAURI_DEBUG: '${process.env.TAURI_DEBUG}';
  `,
  )

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
