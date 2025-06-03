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

  // 사용자 이름을 이메일에서 추출
  const userName = user?.email?.split("@")[0] || t("common.user");

  // Theme styles
  const styles = {
    container: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? "#111827" : "#ffffff",
    },
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
      borderBottomColor: colorScheme === "dark" ? "#374151" : "#e5e7eb",
      marginBottom: 32,
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colorScheme === "dark" ? "#4b5563" : "#d1d5db",
      justifyContent: "center" as const,
      alignItems: "center" as const,
      marginBottom: 16,
    },
    profileName: {
      fontSize: 24,
      fontWeight: "bold" as const,
      color: colorScheme === "dark" ? "#ffffff" : "#1f2937",
      marginBottom: 8,
    },
    profileEmail: {
      fontSize: 16,
      color: colorScheme === "dark" ? "#9ca3af" : "#6b7280",
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600" as const,
      color: colorScheme === "dark" ? "#d1d5db" : "#374151",
      marginBottom: 16,
    },
    menuItem: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: colorScheme === "dark" ? "#1f2937" : "#f9fafb",
      borderRadius: 8,
      marginBottom: 8,
    },
    menuText: {
      fontSize: 16,
      color: colorScheme === "dark" ? "#d1d5db" : "#374151",
      marginLeft: 12,
      flex: 1,
    },
    logoutButton: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      paddingVertical: 16,
      paddingHorizontal: 24,
      backgroundColor: colorScheme === "dark" ? "#dc2626" : "#ef4444",
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
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          {/* 프로필 헤더 */}
          <View style={styles.profileHeader}>
            <View style={styles.profileImage}>
              <Ionicons
                name="person"
                size={50}
                color={colorScheme === "dark" ? "#9ca3af" : "#6b7280"}
              />
            </View>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>

          {/* 계정 설정 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("pages.profile.accountSettings")}
            </Text>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons
                name="person-outline"
                size={20}
                color={colorScheme === "dark" ? "#9ca3af" : "#6b7280"}
              />
              <Text style={styles.menuText}>
                {t("pages.profile.editProfile")}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colorScheme === "dark" ? "#6b7280" : "#9ca3af"}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons
                name="key-outline"
                size={20}
                color={colorScheme === "dark" ? "#9ca3af" : "#6b7280"}
              />
              <Text style={styles.menuText}>
                {t("pages.profile.changePassword")}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colorScheme === "dark" ? "#6b7280" : "#9ca3af"}
              />
            </TouchableOpacity>
          </View>

          {/* 앱 설정 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("pages.profile.appSettings")}
            </Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/(main)/settings" as any)}
            >
              <Ionicons
                name="settings-outline"
                size={20}
                color={colorScheme === "dark" ? "#9ca3af" : "#6b7280"}
              />
              <Text style={styles.menuText}>
                {t("pages.profile.preferences")}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colorScheme === "dark" ? "#6b7280" : "#9ca3af"}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons
                name="help-circle-outline"
                size={20}
                color={colorScheme === "dark" ? "#9ca3af" : "#6b7280"}
              />
              <Text style={styles.menuText}>{t("pages.profile.help")}</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colorScheme === "dark" ? "#6b7280" : "#9ca3af"}
              />
            </TouchableOpacity>
          </View>

          {/* 로그아웃 버튼 */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#ffffff" />
            <Text style={styles.logoutButtonText}>{t("auth.logout")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
