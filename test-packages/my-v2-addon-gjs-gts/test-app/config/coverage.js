module.exports = {
  excludes: [
    // Configuration modules
    '*/config/**/*',
  ],
  reporters: ['json', 'lcov', 'html'],
  useBabelInstrumenter: true,
};
