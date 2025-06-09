import { ScreenBackground } from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";
import { AuthService } from "@/features/auth/services";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserStore } from "@/stores/userStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Profile() {
  const { colorScheme } = useTheme();
  const { user, setUser } = useUserStore();
  const { t } = useTranslation();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(t("auth.logout"), t("pages.profile.logoutConfirm"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("auth.logout"),
        style: "destructive",
        onPress: async () => {
          await AuthService.signOut();
          setUser(null);
          router.replace("/(auth)/login" as any);
        },
      },
    ]);
  };

  const handleAccountSettings = () => {
    router.push("/account-settings" as any);
  };

  const handleAppSettings = () => {
    router.push("/app-settings" as any);
  };

  const menuItems = [
    {
      icon: "person-outline" as const,
      title: t("pages.profile.accountSettings"),
      subtitle: t("pages.profile.manageAccount"),
      onPress: handleAccountSettings,
    },
    {
      icon: "settings-outline" as const,
      title: t("pages.profile.appSettings"),
      subtitle:
        t("pages.profile.themeSettings") +
        " · " +
        t("pages.profile.languageSettings"),
      onPress: handleAppSettings,
    },
    {
      icon: "notifications-outline" as const,
      title: t("pages.profile.notifications"),
      subtitle: t("pages.profile.manageNotifications"),
      onPress: () => {
        // TODO: 알림 설정 화면으로 이동
      },
    },
    {
      icon: "shield-checkmark-outline" as const,
      title: t("pages.profile.privacy"),
      subtitle: t("pages.profile.privacySettings"),
      onPress: () => {
        // TODO: 개인정보 설정 화면으로 이동
      },
    },
    {
      icon: "help-circle-outline" as const,
      title: t("pages.profile.help"),
      subtitle: t("pages.profile.help"),
      onPress: () => {
        // TODO: 도움말 화면으로 이동
      },
    },
  ];

  // Theme styles
  const styles = {
    scrollContainer: {
      flex: 1,
    },
    content: {
      padding: 24,
    },
    profileHeader: {
      alignItems: "center" as const,
      paddingVertical: 32,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(156, 163, 175, 0.3)",
      marginBottom: 32,
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: "rgba(75, 85, 99, 0.6)",
      justifyContent: "center" as const,
      alignItems: "center" as const,
      marginBottom: 16,
    },
    profileName: {
      fontSize: 24,
      fontWeight: "bold" as const,
      color: "#ffffff",
      marginBottom: 8,
    },
    profileEmail: {
      fontSize: 16,
      color: "#d1d5db",
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600" as const,
      color: "#f3f4f6",
      marginBottom: 16,
    },
    menuItem: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: "rgba(31, 41, 55, 0.6)",
      borderRadius: 8,
      marginBottom: 8,
    },
    menuText: {
      fontSize: 16,
      color: "#e5e7eb",
      marginLeft: 12,
      flex: 1,
    },
    menuSubtext: {
      fontSize: 14,
      color: "#9ca3af",
      marginTop: 2,
      marginLeft: 12,
    },
    logoutButton: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      paddingVertical: 16,
      paddingHorizontal: 24,
      backgroundColor: "#dc2626",
      borderRadius: 8,
      marginTop: 32,
    },
    logoutButtonText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "600" as const,
      marginLeft: 8,
    },
  };

  return (
    <ScreenBackground variant="animated" isActive={true}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.profileImage}>
              <Ionicons name="person" size={50} color="#d1d5db" />
            </View>
            <Text style={styles.profileName}>
              {user?.email?.split("@")[0] || t("common.user")}
            </Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>

          {/* Menu Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("pages.profile.menuTitle")}
            </Text>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <Ionicons name={item.icon} size={24} color="#d1d5db" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.menuText}>{item.title}</Text>
                  <Text style={styles.menuSubtext}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ffffff" />
            <Text style={styles.logoutButtonText}>{t("auth.logout")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}
