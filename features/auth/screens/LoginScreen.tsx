import { Button, Input, ScreenBackground } from "@/components/common";
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
      Alert.alert(t("auth.error"), t("auth.fillAllFields"));
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.signIn(email, password);
      if (result.user) {
        setUser(result.user);
        router.replace("/(main)/" as any);
      } else {
        Alert.alert(
          t("auth.error"),
          result.error || t("auth.invalidCredentials")
        );
      }
    } catch (error) {
      Alert.alert(t("auth.error"), t("auth.loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  // Theme styles
  const styles = {
    content: {
      flex: 1,
      justifyContent: "center" as const,
      paddingHorizontal: 24,
      paddingVertical: 32,
    },
    title: {
      fontSize: 30,
      fontWeight: "bold" as const,
      textAlign: "center" as const,
      marginBottom: 32,
      color: "#ffffff",
    },
    tagline: {
      fontSize: 18,
      textAlign: "center" as const,
      marginBottom: 32,
      color: "#e5e7eb",
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
    <ScreenBackground variant="gradient" includeSafeArea={false}>
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
    </ScreenBackground>
  );
};
