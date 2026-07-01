const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname, {
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'cjs', 'json', 'd.ts'],
    unstable_enablePackageExports: true,
});

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
