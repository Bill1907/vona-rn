import { HamburgerMenu } from "@/components/common/HamburgerMenu";
import { ThemeWrapper } from "@/components/common/ThemeWrapper";
import { CustomDrawerContent } from "@/components/navigation/CustomDrawerContent";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import { Ionicons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import React from "react";

export default function MainLayout() {
  const { colorScheme } = useTheme();
  const { t } = useTranslation();

  return (
    <ThemeWrapper>
      <Drawer
        screenOptions={({ navigation }) => ({
          headerShown: true,
          headerStyle: {
            backgroundColor: colorScheme === "dark" ? "#1f2937" : "#ffffff",
          },
          headerTintColor: colorScheme === "dark" ? "#ffffff" : "#1f2937",
          headerTitleStyle: {
            fontWeight: "600",
          },
          headerLeft: () => (
            <HamburgerMenu onPress={() => navigation.openDrawer()} />
          ),
          drawerPosition: "left",
          drawerType: "slide",
          drawerStyle: {
            backgroundColor: colorScheme === "dark" ? "#1f2937" : "#ffffff",
            width: 280,
          },
          drawerActiveTintColor: "#2563eb",
          drawerInactiveTintColor:
            colorScheme === "dark" ? "#9ca3af" : "#6b7280",
          drawerLabelStyle: {
            fontSize: 16,
            fontWeight: "500",
          },
          swipeEnabled: true,
          swipeEdgeWidth: 50,
        })}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: t("navigation.home"),
            headerTitle: "Vona",
            drawerLabel: t("navigation.home"),
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="conversations"
          options={{
            title: t("navigation.conversations"),
            headerTitle: t("navigation.conversations"),
            drawerLabel: t("navigation.conversations"),
            drawerIcon: ({ color, size }) => (
              <Ionicons name="chatbox" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="search-history"
          options={{
            title: t("navigation.searchHistory"),
            headerTitle: t("navigation.searchHistory"),
            drawerLabel: t("navigation.searchHistory"),
            drawerIcon: ({ color, size }) => (
              <Ionicons name="search" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="schedule"
          options={{
            title: t("navigation.schedule"),
            headerTitle: t("navigation.schedule"),
            drawerLabel: t("navigation.schedule"),
            drawerIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name="profile"
          options={{
            title: t("navigation.profile"),
            headerTitle: t("navigation.profile"),
            drawerLabel: t("navigation.profile"),
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: t("common.settings"),
            headerTitle: t("common.settings"),
            drawerLabel: t("common.settings"),
            drawerIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
            drawerItemStyle: { display: "none" },
          }}
        />
        <Drawer.Screen
          name="search"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />
      </Drawer>
    </ThemeWrapper>
  );
}
