let config = {
    collectCoverage: true,
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js'],
    coverageThreshold: {
        global: {
            lines: 80,
        },
    },
    rootDir: '../../',
    coverageDirectory: '<rootDir>/_tests/_coverage',
    setupFilesAfterEnv: ['<rootDir>/_tests/_config/_setup.ts'],
    collectCoverageFrom: ['<rootDir>/**/*.*', '!<rootDir>/_tests/**', '!<rootDir>/**/_tests/**'],
    cacheDirectory: '<rootDir>/_tests/_cache/',
    preset: '',
};

module.exports = config;