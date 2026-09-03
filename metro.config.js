const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro needs package exports so `@google/generative-ai` and Supabase resolve
 * their ESM entry points correctly under Hermes.
 */
const config = {
  resolver: {
    unstable_enablePackageExports: true,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
