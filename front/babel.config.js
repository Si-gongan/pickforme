
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      require.resolve("expo-router/babel"),
      ["module:react-native-dotenv"],
      [
        'module-resolver',
        {
          alias: {
            "@constants": "./constants/index",
            "@components": "./components/index",
            "@hooks": "./hooks/index",
            "@stores": "./stores/index",
          },
        },
      ],
    ],
  };
};
