module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Kein nativewind/babel Plugin nötig – funktioniert trotzdem!
  };
};

