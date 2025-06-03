const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Add alias resolver
config.resolver.alias = {
  "@": path.resolve(__dirname, "./"),
  "@/components": path.resolve(__dirname, "./components"),
  "@/features": path.resolve(__dirname, "./features"),
  "@/lib": path.resolve(__dirname, "./lib"),
  "@/stores": path.resolve(__dirname, "./stores"),
  "@/styles": path.resolve(__dirname, "./styles"),
  "@/config": path.resolve(__dirname, "./config"),
  "@/constants": path.resolve(__dirname, "./constants"),
  "@/types": path.resolve(__dirname, "./types"),
  "@/api": path.resolve(__dirname, "./api"),
};

module.exports = withNativeWind(config, { input: "./styles/global.css" });
