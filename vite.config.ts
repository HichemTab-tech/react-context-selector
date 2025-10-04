import { defineConfig } from 'vite';
import banner from 'vite-plugin-banner';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import tailwindcss from '@tailwindcss/vite';


const version = require('./package.json').version;
const bannerContent = `/*!
* react-ctx-selector v${version}
* (c) Hichem Taboukouyout
* Released under the MIT License.
* Github: github.com/HichemTab-tech/react-context-selector
*/
   `;

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'), // Library entry point
            name: 'ReactContextSelector',
            fileName: (format: string) => `main${format === 'es' ? '.esm' : '.min'}.js`,
            formats: ['es', 'umd']
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'react/jsx-runtime'], // Mark React, ReactDOM as external
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'react/jsx-runtime': 'jsxRuntime'
                }
            }
        },
        terserOptions: {
            // @ts-ignore
            format: {
                comments: false
            }
        }
    },
    plugins: [
        tailwindcss(),
        react(),
        banner(bannerContent),
        cssInjectedByJsPlugin(),
        dts({
            entryRoot: 'src',
            outDir: 'dist',
            insertTypesEntry: true,
            exclude: ['node_modules', 'dist'],
        })

    ]
});
