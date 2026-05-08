export default {
  paths: ['features/**/*.feature'],
  import: ['features/support/**/*.ts', 'features/step-definitions/**/*.ts'],
  format: ['progress'],
  publishQuiet: true,
  strict: true,
};
