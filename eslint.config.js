import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import next from 'eslint-plugin-next';

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
    plugins: { next },
    rules: {
      // Add or migrate your rules here
    },
  },
];
