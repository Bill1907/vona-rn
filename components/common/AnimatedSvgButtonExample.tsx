import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { AnimatedSvgButton, SmartText } from "./";

export const AnimatedSvgButtonExample: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [likes, setLikes] = useState(0);

  const handlePlayPress = () => {
    setIsPlaying(!isPlaying);
    Alert.alert("재생", isPlaying ? "일시정지" : "재생");
  };

  const handleLikePress = () => {
    setLikes((prev) => prev + 1);
  };

  const handleMicPress = () => {
    Alert.alert("마이크", "음성 녹음 시작");
  };

  return (
    <View style={styles.container}>
      <SmartText weight="bold" style={styles.title}>
        AnimatedSvgButton 예시
      </SmartText>

      {/* 기본 버튼들 */}
      <View style={styles.section}>
        <SmartText weight="medium" style={styles.sectionTitle}>
          기본 버튼들
        </SmartText>
        <View style={styles.row}>
          <AnimatedSvgButton
            icon={isPlaying ? "pause" : "play"}
            size={60}
            backgroundColor="#3b82f6"
            animation="scale"
            onPress={handlePlayPress}
          />
          <AnimatedSvgButton
            icon="heart"
            size={60}
            backgroundColor="#ef4444"
            animation="pulse"
            animationRepeat={true}
            onPress={handleLikePress}
          />
          <AnimatedSvgButton
            icon="mic"
            size={60}
            backgroundColor="#10b981"
            animation="bounce"
            onPress={handleMicPress}
          />
        </View>
      </View>

      {/* 다양한 애니메이션 */}
      <View style={styles.section}>
        <SmartText weight="medium" style={styles.sectionTitle}>
          다양한 애니메이션
        </SmartText>
        <View style={styles.row}>
          <AnimatedSvgButton
            icon="star"
            size={50}
            backgroundColor="#f59e0b"
            animation="rotate"
            onPress={() => Alert.alert("회전", "별 회전!")}
          />
          <AnimatedSvgButton
            icon="check"
            size={50}
            backgroundColor="#059669"
            animation="shake"
            onPress={() => Alert.alert("체크", "흔들기!")}
          />
          <AnimatedSvgButton
            icon="close"
            size={50}
            backgroundColor="#dc2626"
            animation="fade"
            onPress={() => Alert.alert("닫기", "페이드 효과!")}
          />
        </View>
      </View>

      {/* 슬라이드 애니메이션 */}
      <View style={styles.section}>
        <SmartText weight="medium" style={styles.sectionTitle}>
          슬라이드 애니메이션
        </SmartText>
        <View style={styles.row}>
          <AnimatedSvgButton
            icon="arrow-up"
            size={45}
            backgroundColor="#8b5cf6"
            animation="slide-up"
            onPress={() => Alert.alert("위로", "슬라이드 업!")}
          />
          <AnimatedSvgButton
            icon="arrow-down"
            size={45}
            backgroundColor="#06b6d4"
            animation="slide-down"
            onPress={() => Alert.alert("아래로", "슬라이드 다운!")}
          />
          <AnimatedSvgButton
            icon="arrow-left"
            size={45}
            backgroundColor="#f97316"
            animation="slide-left"
            onPress={() => Alert.alert("왼쪽", "슬라이드 왼쪽!")}
          />
          <AnimatedSvgButton
            icon="arrow-right"
            size={45}
            backgroundColor="#84cc16"
            animation="slide-right"
            onPress={() => Alert.alert("오른쪽", "슬라이드 오른쪽!")}
          />
        </View>
      </View>

      {/* 특수 버튼들 */}
      <View style={styles.section}>
        <SmartText weight="medium" style={styles.sectionTitle}>
          특수 효과
        </SmartText>
        <View style={styles.row}>
          <AnimatedSvgButton
            icon="loading"
            size={55}
            backgroundColor="#6366f1"
            animation="rotate"
            animationRepeat={true}
            animationDuration={1000}
            onPress={() => Alert.alert("로딩", "계속 회전 중...")}
          />
          <AnimatedSvgButton
            icon="pulse"
            size={55}
            backgroundColor="#ec4899"
            animation="pulse"
            animationRepeat={true}
            animationDuration={800}
            onPress={() => Alert.alert("펄스", "계속 펄스 중...")}
          />
          <AnimatedSvgButton
            icon="plus"
            size={55}
            backgroundColor="transparent"
            borderColor="#64748b"
            borderWidth={2}
            animation="scale"
            onPress={() => Alert.alert("추가", "투명 배경 버튼!")}
          />
        </View>
      </View>

      {/* 상태 정보 */}
      <View style={styles.info}>
        <SmartText style={styles.infoText}>
          좋아요: {likes}개 | 상태: {isPlaying ? "재생 중" : "정지"}
        </SmartText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 30,
    color: "#1e293b",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
    color: "#334155",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  info: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
  },
  infoText: {
    textAlign: "center",
    fontSize: 16,
    color: "#475569",
  },
});
