import path from "path"
import tailwindcss from "@tailwindcss/vite"
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: true,
        port: 8080,
        proxy: {
            "/api/v1": {
                target: "localhost:8888",
                changeOrigin: true,
                rewrite: path => path.replace(new RegExp('^' + "/api/v1"), '/v1'),
            },
        },
    },
})
