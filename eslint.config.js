import js from "@eslint/js";
import globals from "globals";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      'node_modules',
      'public',
      '.next',
      'out',
      // add any other patterns you previously had in .eslintignore
    ],
  },
  {
    // Next.js flat config not available; add rules here as needed
    rules: {
      // Add or migrate your rules here
    },
  },
];
