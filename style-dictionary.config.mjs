/** @type {import('style-dictionary').Config} */
export default {
  source: ['tokens/source/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'src/styles/generated/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            selector: ':root',
            outputReferences: true,
          },
        },
      ],
    },
  },
};
