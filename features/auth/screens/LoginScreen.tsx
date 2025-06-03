import { Button, Input } from "@/components/common";
import { strings } from "@/constants/strings";
import { useTheme } from "@/contexts/ThemeContext";
import { AuthService } from "@/features/auth/services";
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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("오류", "이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const { user, error } = await AuthService.signIn(email, password);

      if (error) {
        Alert.alert("로그인 실패", error);
      } else if (user) {
        setUser(user);
        router.replace("/(main)/" as any);
      }
    } catch (error) {
      Alert.alert("오류", "네트워크 오류가 발생했습니다.");
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
        <Text style={styles.title}>{strings.app.name}</Text>

        <Text style={styles.tagline}>{strings.app.tagline}</Text>

        <View style={styles.inputContainer}>
          <Input
            label={strings.auth.email}
            placeholder="example@email.com"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainerLast}>
          <Input
            label={strings.auth.password}
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={strings.auth.login}
            onPress={handleLogin}
            loading={loading}
          />
        </View>

        <Button
          title={strings.auth.register}
          onPress={() => {
            // Navigate to register screen
            Alert.alert("알림", "회원가입 화면으로 이동합니다.");
          }}
          variant="outline"
        />
      </View>
    </View>
  );
};
