import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";

export default defineConfig([
	{
		files: ["**/*.js"],
        languageOptions: {
            globals: {
                ...globals.browser
            }
        },
		plugins: {
			js,
		},
		extends: ["js/recommended"],
		rules: {
            "no-empty": ["error", {"allowEmptyCatch": true}],
			"no-unused-vars": "warn",
			"no-undef": "warn",
		},
	},
]);
