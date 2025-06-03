import { Button, Input } from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";
import { AuthService } from "@/features/auth/services";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useUserStore();
  const router = useRouter();
  const { colorScheme } = useTheme();
  const { t } = useTranslation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t("common.error"), t("pages.login.fillAllFields"));
      return;
    }

    setLoading(true);
    try {
      const { user, error } = await AuthService.signIn(email, password);

      if (error) {
        Alert.alert(t("pages.login.loginFailed"), error);
      } else if (user) {
        setUser(user);
        router.replace("/(main)/" as any);
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("messages.networkError"));
    } finally {
      setLoading(false);
    }
  };

  // Theme styles
  const styles = {
    container: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? "#111827" : "#ffffff",
      paddingHorizontal: 24,
      paddingVertical: 32,
    },
    content: {
      flex: 1,
      justifyContent: "center" as const,
    },
    title: {
      fontSize: 30,
      fontWeight: "bold" as const,
      textAlign: "center" as const,
      marginBottom: 32,
      color: colorScheme === "dark" ? "#ffffff" : "#1f2937",
    },
    tagline: {
      fontSize: 18,
      textAlign: "center" as const,
      marginBottom: 32,
      color: colorScheme === "dark" ? "#d1d5db" : "#4b5563",
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputContainerLast: {
      marginBottom: 24,
    },
    buttonContainer: {
      marginBottom: 16,
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t("pages.login.appName")}</Text>

        <Text style={styles.tagline}>{t("pages.login.tagline")}</Text>

        <View style={styles.inputContainer}>
          <Input
            label={t("auth.email")}
            placeholder="example@email.com"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainerLast}>
          <Input
            label={t("auth.password")}
            placeholder={t("pages.login.passwordPlaceholder")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={t("auth.login")}
            onPress={handleLogin}
            loading={loading}
          />
        </View>

        <Button
          title={t("auth.register")}
          onPress={() => {
            Alert.alert(
              t("pages.login.notice"),
              t("pages.login.registerNotice")
            );
          }}
          variant="outline"
        />
      </View>
    </View>
  );
};
