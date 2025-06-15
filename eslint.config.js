import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // Console statements - disabled
      "no-console": "off",
      
      // Unused variables - handled by TypeScript ESLint
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_" 
      }],
      
      // Allow any type in test files and generated files
      "@typescript-eslint/no-explicit-any": ["error", {
        "ignoreRestArgs": true
      }],
      
      // Allow empty object types for interfaces
      "@typescript-eslint/no-empty-object-type": ["error", {
        "allowInterfaces": "always"
      }],
      
      // Disable triple slash reference for .d.ts files
      "@typescript-eslint/triple-slash-reference": "off",
      
      // Allow useless catch in some cases
      "no-useless-catch": "warn",
      
      // React hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    },
  },
  {
    // Specific rules for test files
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "**/test/**/*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    // Specific rules for generated files and .astro files
    files: ["**/.astro/**/*", "**/astro.config.*", "**/env.d.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/triple-slash-reference": "off",
    },
  }
);
