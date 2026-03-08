import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import solid from "eslint-plugin-solid";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "src/lib/proto/**/*",
      "dist/**/*",
      "src/lib/console/fixtures/monitor-data.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  solid.configs["flat/recommended"],
  prettierConfig,
  {
    rules: {
      "no-unassigned-vars": "off",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
);
