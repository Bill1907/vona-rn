import { HamburgerMenu } from "@/components/common/HamburgerMenu";
import { ThemeWrapper } from "@/components/common/ThemeWrapper";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import React from "react";

export default function MainLayout() {
  const { colorScheme } = useTheme();

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
      >
        <Drawer.Screen
          name="index"
          options={{
            title: "Home",
            headerTitle: "Vona",
            drawerLabel: "홈",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="search"
          options={{
            title: "Search",
            headerTitle: "검색",
            drawerLabel: "검색",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="search" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="schedule"
          options={{
            title: "Schedule",
            headerTitle: "일정",
            drawerLabel: "일정",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: "Settings",
            headerTitle: "설정",
            drawerLabel: "설정",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
          }}
        />
      </Drawer>
    </ThemeWrapper>
  );
}
