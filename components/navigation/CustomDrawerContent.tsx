import { useTheme } from "@/contexts/ThemeContext";
import { AuthService } from "@/features/auth/services";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserStore } from "@/stores/userStore";
import { Ionicons } from "@expo/vector-icons";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (
  props
) => {
  const { colorScheme } = useTheme();
  const { user, setUser } = useUserStore();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleLogout = async () => {
    await AuthService.signOut();
    setUser(null);
    router.replace("/(auth)/login" as any);
  };

  // 메인 메뉴 항목들 (상단에 위치)
  const mainMenuItems = [
    {
      label: t("navigation.home"),
      routeName: "index",
      icon: "home" as const,
    },
    {
      label: t("navigation.conversations"),
      routeName: "conversations",
      icon: "chatbox" as const,
    },
    {
      label: t("voice.assistant"),
      routeName: "voice-assistant",
      icon: "mic" as const,
    },
    {
      label: t("navigation.searchHistory"),
      routeName: "search-history",
      icon: "search" as const,
    },
    {
      label: t("navigation.schedule"),
      routeName: "schedule",
      icon: "calendar" as const,
    },
  ];

  const styles = {
    container: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? "#1f2937" : "#ffffff",
    },
    mainMenuContainer: {
      flex: 1,
      paddingTop: 20,
    },
    profileContainer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colorScheme === "dark" ? "#374151" : "#e5e7eb",
      marginBottom: insets.bottom,
    },
    profileSection: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
    },
    profileImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colorScheme === "dark" ? "#4b5563" : "#d1d5db",
      marginRight: 12,
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: colorScheme === "dark" ? "#ffffff" : "#1f2937",
      marginBottom: 2,
    },
    profileEmail: {
      fontSize: 14,
      color: colorScheme === "dark" ? "#9ca3af" : "#6b7280",
    },
  };

  // 사용자 이름을 이메일에서 추출, 기본값으로 번역된 "사용자" 사용
  const userName = user?.email?.split("@")[0] || t("common.user");

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} style={styles.mainMenuContainer}>
        {mainMenuItems.map((item) => (
          <DrawerItem
            key={item.routeName}
            label={item.label}
            icon={({ color, size }) => (
              <Ionicons name={item.icon} size={size} color={color} />
            )}
            activeTintColor="#2563eb"
            inactiveTintColor={colorScheme === "dark" ? "#9ca3af" : "#6b7280"}
            labelStyle={{
              fontSize: 16,
              fontWeight: "500",
            }}
            onPress={() => props.navigation.navigate(item.routeName)}
            focused={
              props.state.index ===
              props.state.routes.findIndex(
                (route) => route.name === item.routeName
              )
            }
          />
        ))}
      </DrawerContentScrollView>

      {/* 프로필 섹션 (하단 고정) */}
      <View style={styles.profileContainer}>
        <TouchableOpacity
          style={styles.profileSection}
          onPress={() => props.navigation.navigate("profile")}
        >
          {/* 프로필 이미지 (기본 아바타) */}
          <View style={styles.profileImage}>
            <Ionicons
              name="person"
              size={30}
              color={colorScheme === "dark" ? "#9ca3af" : "#6b7280"}
              style={{
                alignSelf: "center",
                marginTop: 10,
              }}
            />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
