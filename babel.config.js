module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo", "nativewind/babel"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./",
            "@/components": "./components",
            "@/features": "./features",
            "@/lib": "./lib",
            "@/stores": "./stores",
            "@/styles": "./styles",
            "@/config": "./config",
            "@/constants": "./constants",
            "@/types": "./types",
            "@/api": "./api",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
