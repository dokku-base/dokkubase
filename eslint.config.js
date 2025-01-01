import js from "@eslint/js";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import astroParser from "astro-eslint-parser";

export default [
    // Base config for TypeScript files
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: "./tsconfig.json",
            },
            globals: {
                ...globals.node
            },
        },
        plugins: {
            "@typescript-eslint": tsPlugin
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            "no-console": ["warn", { allow: ["warn", "error"] }],
        }
    },

    // Astro specific config
    {
        files: ["**/*.astro"],
        languageOptions: {
            parser: astroParser,
            parserOptions: {
                parser: tsParser,
                extraFileExtensions: [".astro"],
            }
        },
        rules: {
            // Add any Astro-specific rules here
        }
    },

    // Ignore patterns
    {
        ignores: [
            "dist/**",
            "node_modules/**",
            ".astro/**",
            "*.db",
            "*.db-journal"
        ]
    }
]; 