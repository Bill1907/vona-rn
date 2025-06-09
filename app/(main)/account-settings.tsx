import { ScreenBackground } from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserStore } from "@/stores/userStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AccountSettings() {
  const { colorScheme } = useTheme();
  const { user, setUser } = useUserStore();
  const { t } = useTranslation();
  const router = useRouter();

  const [displayName, setDisplayName] = useState(
    user?.email?.split("@")[0] || ""
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert(t("common.error"), t("errors.requiredField"));
      return;
    }

    setIsUpdatingProfile(true);
    try {
      // 실제 프로필 업데이트 로직 구현
      // AuthService.updateProfile({ displayName });
      Alert.alert(t("common.success"), t("pages.profile.profileUpdated"));
    } catch (error) {
      Alert.alert(t("common.error"), t("pages.profile.profileUpdateFailed"));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert(t("common.error"), t("errors.requiredField"));
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert(t("common.error"), t("pages.profile.passwordMismatch"));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t("common.error"), t("pages.profile.weakPassword"));
      return;
    }

    setIsUpdatingPassword(true);
    try {
      // 실제 비밀번호 업데이트 로직 구현
      // await AuthService.updatePassword(currentPassword, newPassword);
      Alert.alert(t("common.success"), t("pages.profile.passwordUpdated"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      Alert.alert(t("common.error"), t("pages.profile.passwordUpdateFailed"));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Theme styles
  const styles = {
    scrollContainer: {
      flex: 1,
    },
    content: {
      padding: 24,
    },
    header: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      marginBottom: 32,
    },
    backButton: {
      padding: 8,
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold" as const,
      color: "#ffffff",
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600" as const,
      color: "#f3f4f6",
      marginBottom: 16,
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      color: "#d1d5db",
      marginBottom: 8,
    },
    input: {
      backgroundColor: "rgba(31, 41, 55, 0.6)",
      borderWidth: 1,
      borderColor: "rgba(156, 163, 175, 0.3)",
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: "#ffffff",
    },
    button: {
      backgroundColor: "#3b82f6",
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: "center" as const,
      flexDirection: "row" as const,
      justifyContent: "center" as const,
    },
    buttonDisabled: {
      backgroundColor: "#6b7280",
    },
    buttonText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "600" as const,
    },
    profileImageContainer: {
      alignItems: "center" as const,
      marginBottom: 24,
    },
    profileImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "rgba(75, 85, 99, 0.6)",
      justifyContent: "center" as const,
      alignItems: "center" as const,
      marginBottom: 12,
    },
    changePhotoButton: {
      backgroundColor: "rgba(59, 130, 246, 0.2)",
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: "#3b82f6",
    },
    changePhotoButtonText: {
      color: "#3b82f6",
      fontSize: 14,
      fontWeight: "500" as const,
    },
  };

  return (
    <ScreenBackground variant="animated" isActive={true}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {t("pages.profile.accountSettings")}
            </Text>
          </View>

          {/* Profile Picture Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("pages.profile.profilePicture")}
            </Text>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <Ionicons name="person" size={40} color="#d1d5db" />
              </View>
              <TouchableOpacity style={styles.changePhotoButton}>
                <Text style={styles.changePhotoButtonText}>
                  {t("common.edit")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("pages.profile.editProfile")}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {t("pages.profile.displayName")}
              </Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder={t("pages.profile.displayName")}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t("auth.email")}</Text>
              <TextInput
                style={[styles.input, { opacity: 0.6 }]}
                value={user?.email || ""}
                editable={false}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                isUpdatingProfile && styles.buttonDisabled,
              ]}
              onPress={handleUpdateProfile}
              disabled={isUpdatingProfile}
            >
              <Text style={styles.buttonText}>
                {isUpdatingProfile
                  ? t("common.loading")
                  : t("pages.profile.updateProfile")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Password Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("pages.profile.changePassword")}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {t("pages.profile.currentPassword")}
              </Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder={t("pages.profile.currentPassword")}
                placeholderTextColor="#9ca3af"
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {t("pages.profile.newPassword")}
              </Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder={t("pages.profile.newPassword")}
                placeholderTextColor="#9ca3af"
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {t("pages.profile.confirmNewPassword")}
              </Text>
              <TextInput
                style={styles.input}
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                placeholder={t("pages.profile.confirmNewPassword")}
                placeholderTextColor="#9ca3af"
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                isUpdatingPassword && styles.buttonDisabled,
              ]}
              onPress={handleUpdatePassword}
              disabled={isUpdatingPassword}
            >
              <Text style={styles.buttonText}>
                {isUpdatingPassword
                  ? t("common.loading")
                  : t("pages.profile.updatePassword")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}
