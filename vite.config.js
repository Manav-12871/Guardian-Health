import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    base: '/Guardian-Health/',
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
            },
            manifest: {
                name: 'Guardian Health',
                short_name: 'Guardian',
                description: 'Real-time healthcare discovery platform',
                theme_color: '#0a0a0a',
                background_color: '#0a0a0a',
                display: 'standalone',
                icons: [
                    {
                        src: 'guardian-icon.svg',
                        sizes: '192x192 512x512',
                        type: 'image/svg+xml',
                        purpose: 'any maskable'
                    }
                ]
            }
        })
    ],

})

