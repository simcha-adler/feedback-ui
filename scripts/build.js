import * as esbuild from 'esbuild';
import { copyFile, mkdir } from 'node:fs/promises';

await mkdir('dist', { recursive: true });

await Promise.all([
    esbuild.build({
        entryPoints: ['src/feedback.js'],
        bundle: true,
        format: 'esm',
        minify: true,
        sourcemap: true,
        outfile: 'dist/feedback.js',
        target: ['es2022'],
    }),
    esbuild.build({
        entryPoints: ['src/feedback.iife.js'],
        bundle: true,
        format: 'iife',
        minify: true,
        sourcemap: true,
        outfile: 'dist/feedback.min.js',
        target: ['es2022'],
    }),
    esbuild.build({
        entryPoints: ['src/feedback.css'],
        bundle: true,
        minify: true,
        outfile: 'dist/feedback.css',
    }),
    copyFile('src/feedback.d.ts', 'dist/feedback.d.ts'),
    copyFile('src/feedback.locales.js', 'dist/feedback.locales.js'),
    copyFile('src/feedback.locales.d.ts', 'dist/feedback.locales.d.ts'),
]);
