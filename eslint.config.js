import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReactRefresh from "eslint-plugin-react-refresh";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "cypress/screenshots/**",
      "cypress/videos/**",
      "cypress/downloads/**",
      "coverage/**",
      ".netlify/**",
      "build/**",
      "*.min.js",
      "temp.json",
      "nul",
      "*.log",
      "*.tgz",
      "*.tar.gz",
      // More lenient for test files
      "cypress/support/step_definitions/**/*.ts",
      "cucumber-steps.ts",
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        jsx: true,
      },
    },
    settings: {
      react: {
        version: "detect",
        runtime: "automatic",
      },
    },
    plugins: {
      react: pluginReactConfig.plugins.react,
      "react-hooks": pluginReactHooks,
      "react-refresh": pluginReactRefresh,
    },
    rules: {
      ...pluginReactConfig.rules,
      ...pluginReactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
  // Separate config for Cypress files with more lenient rules
  {
    files: ["cypress/**/*.ts", "cypress/**/*.js"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
    },
  },
];