import { defineConfig } from "vite";
import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'
import vue from "@vitejs/plugin-vue";

const { version } = JSON.parse(
    readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf-8')
);

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        {
            name: 'inject-app-version',
            transformIndexHtml(html) {
                return html.replace(/%APP_VERSION%/g, version);
            },
        },
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src/renderer', import.meta.url)),
        },
    },
});
