import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import compress from 'astro-compress'

import { writeFileSync } from 'fs'
import path from 'path'

writeFileSync(
    path.resolve('./src/styles/_env.scss'),
    `$PLATFORM: '${process.env.TAURI_PLATFORM}';
    `,
    // $ARCH: '${process.env.TAURI_ARCH}';
    // $FAMILY: '${process.env.TAURI_FAMILY}';
    // $PLATFORM_VERSION: '${process.env.TAURI_PLATFORM_VERSION}';
    // $PLATFORM_TYPE: '${process.env.TAURI_PLATFORM_TYPE}';
    // $DEBUG: '${process.env.TAURI_DEBUG}';
)

// https://astro.build/config
export default defineConfig({
    // Enable Solid to support Solid JSX components.
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
