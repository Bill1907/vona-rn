const fs = require("fs");
const path = require("path");

console.log("🔍 WebRTC 설정 확인 중...\n");

let hasErrors = false;

// 1. 필수 패키지 확인
console.log("📦 패키지 설치 확인:");
const packageJson = require("../package.json");
const requiredPackages = [
  "react-native-webrtc",
  "@config-plugins/react-native-webrtc",
  "expo-av",
  "expo-media-library",
];

requiredPackages.forEach((pkg) => {
  if (packageJson.dependencies[pkg] || packageJson.devDependencies[pkg]) {
    console.log(`   ✅ ${pkg}`);
  } else {
    console.log(`   ❌ ${pkg} - 설치 필요`);
    hasErrors = true;
  }
});

// 2. app.json 설정 확인
console.log("\n⚙️ app.json 설정 확인:");
const appJson = require("../app.json");
const plugins = appJson.expo.plugins || [];

// WebRTC 플러그인 확인
const hasWebRTCPlugin = plugins.some(
  (plugin) =>
    plugin === "@config-plugins/react-native-webrtc" ||
    (Array.isArray(plugin) &&
      plugin[0] === "@config-plugins/react-native-webrtc")
);

if (hasWebRTCPlugin) {
  console.log("   ✅ @config-plugins/react-native-webrtc 플러그인");
} else {
  console.log("   ❌ @config-plugins/react-native-webrtc 플러그인 누락");
  hasErrors = true;
}

// expo-av 플러그인 확인
const hasAVPlugin = plugins.some(
  (plugin) =>
    plugin === "expo-av" || (Array.isArray(plugin) && plugin[0] === "expo-av")
);

if (hasAVPlugin) {
  console.log("   ✅ expo-av 플러그인");
} else {
  console.log("   ❌ expo-av 플러그인 누락");
  hasErrors = true;
}

// iOS 권한 확인
const iosPermissions = appJson.expo.ios?.infoPlist;
if (iosPermissions?.NSMicrophoneUsageDescription) {
  console.log("   ✅ iOS 마이크 권한 설정");
} else {
  console.log("   ❌ iOS 마이크 권한 설정 누락");
  hasErrors = true;
}

// Android 권한 확인
const androidPermissions = appJson.expo.android?.permissions || [];
if (androidPermissions.includes("android.permission.RECORD_AUDIO")) {
  console.log("   ✅ Android 마이크 권한 설정");
} else {
  console.log("   ❌ Android 마이크 권한 설정 누락");
  hasErrors = true;
}

// 3. Supabase Edge Functions 확인
console.log("\n🔧 Supabase Edge Functions 확인:");
const functionsDir = path.join(__dirname, "../supabase/functions");
const requiredFunctions = [
  "create-voice-session",
  "end-voice-session",
  "get-voice-session-status",
  "get-user-voice-sessions",
];

requiredFunctions.forEach((func) => {
  const funcPath = path.join(functionsDir, func, "index.ts");
  if (fs.existsSync(funcPath)) {
    console.log(`   ✅ ${func}`);
  } else {
    console.log(`   ❌ ${func} - 함수 파일 누락`);
    hasErrors = true;
  }
});

// 4. 마이그레이션 파일 확인
console.log("\n🗄️ 데이터베이스 마이그레이션 확인:");
const migrationPath = path.join(
  __dirname,
  "../supabase/migrations/001_voice_sessions.sql"
);
if (fs.existsSync(migrationPath)) {
  console.log("   ✅ voice_sessions 테이블 마이그레이션");
} else {
  console.log("   ❌ voice_sessions 테이블 마이그레이션 누락");
  hasErrors = true;
}

// 5. 환경 변수 예시 파일 확인
console.log("\n🔐 환경 변수 설정 확인:");
const envExamplePath = path.join(__dirname, "../env.example");
if (fs.existsSync(envExamplePath)) {
  console.log("   ✅ env.example 파일");
} else {
  console.log("   ❌ env.example 파일 누락");
  hasErrors = true;
}

// 6. 타입 정의 파일 확인
console.log("\n📝 타입 정의 확인:");
const webrtcTypesPath = path.join(__dirname, "../types/webrtc.d.ts");
if (fs.existsSync(webrtcTypesPath)) {
  console.log("   ✅ WebRTC 타입 정의");
} else {
  console.log("   ❌ WebRTC 타입 정의 누락");
  hasErrors = true;
}

// 7. 권한 유틸리티 확인
console.log("\n🔑 권한 유틸리티 확인:");
const permissionsPath = path.join(__dirname, "../lib/permissions.ts");
if (fs.existsSync(permissionsPath)) {
  console.log("   ✅ 권한 요청 유틸리티");
} else {
  console.log("   ❌ 권한 요청 유틸리티 누락");
  hasErrors = true;
}

// 결과 출력
console.log("\n" + "=".repeat(50));
if (hasErrors) {
  console.log(
    "❌ WebRTC 설정에 문제가 있습니다. 위의 누락된 항목들을 확인해주세요."
  );
  console.log(
    "\n📖 자세한 설정 가이드는 docs/VOICE_ASSISTANT_SETUP.md 를 참고하세요."
  );
  process.exit(1);
} else {
  console.log("✅ WebRTC 설정이 완료되었습니다!");
  console.log("\n🚀 다음 단계:");
  console.log("   1. .env 파일을 생성하고 필요한 환경 변수를 설정하세요");
  console.log(
    "   2. npx supabase functions deploy 로 Edge Functions을 배포하세요"
  );
  console.log("   3. npx supabase db push 로 마이그레이션을 실행하세요");
  console.log(
    "   4. npx expo run:ios 또는 npx expo run:android 로 개발 빌드를 생성하세요"
  );
  console.log(
    "\n⚠️  주의: WebRTC는 Expo Go에서 지원되지 않으므로 반드시 개발 빌드를 사용해야 합니다."
  );
}
