const fs = require("fs");
const https = require("https");
const path = require("path");

// 폰트 다운로드 URLs
const FONTS = {
  pretendard: {
    "Pretendard-Light.ttf":
      "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff2/Pretendard-Light.woff2",
    "Pretendard-Regular.ttf":
      "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff2/Pretendard-Regular.woff2",
    "Pretendard-Medium.ttf":
      "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff2/Pretendard-Medium.woff2",
    "Pretendard-SemiBold.ttf":
      "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff2/Pretendard-SemiBold.woff2",
    "Pretendard-Bold.ttf":
      "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff2/Pretendard-Bold.woff2",
    "Pretendard-ExtraBold.ttf":
      "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff2/Pretendard-ExtraBold.woff2",
  },
  poppins: {
    "Poppins-Light.ttf":
      "https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLDz8Z1xlFQ.woff2",
    "Poppins-Regular.ttf":
      "https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecg.woff2",
    "Poppins-Medium.ttf":
      "https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLGT9Z1xlFQ.woff2",
    "Poppins-SemiBold.ttf":
      "https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLEj6Z1xlFQ.woff2",
    "Poppins-Bold.ttf":
      "https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLCz7Z1xlFQ.woff2",
    "Poppins-ExtraBold.ttf":
      "https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLDD4Z1xlFQ.woff2",
  },
};

const FONTS_DIR = path.join(__dirname, "..", "assets", "fonts");

// Create fonts directory if it doesn't exist
if (!fs.existsSync(FONTS_DIR)) {
  fs.mkdirSync(FONTS_DIR, { recursive: true });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);

    https
      .get(url, (response) => {
        // Handle redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          return downloadFile(response.headers.location, destPath)
            .then(resolve)
            .catch(reject);
        }

        if (response.statusCode !== 200) {
          reject(
            new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`)
          );
          return;
        }

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          resolve();
        });

        file.on("error", (err) => {
          fs.unlink(destPath, () => {}); // Delete the file async
          reject(err);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

async function downloadFonts() {
  console.log("📁 Creating fonts directory...");

  const allFonts = { ...FONTS.pretendard, ...FONTS.poppins };
  const totalFonts = Object.keys(allFonts).length;
  let downloaded = 0;

  console.log(`🔽 Downloading ${totalFonts} font files...`);

  for (const [filename, url] of Object.entries(allFonts)) {
    const destPath = path.join(FONTS_DIR, filename);

    // Skip if file already exists
    if (fs.existsSync(destPath)) {
      console.log(`⏭️  Skipping ${filename} (already exists)`);
      downloaded++;
      continue;
    }

    try {
      console.log(`⬇️  Downloading ${filename}...`);
      await downloadFile(url, destPath);
      downloaded++;
      console.log(`✅ Downloaded ${filename} (${downloaded}/${totalFonts})`);
    } catch (error) {
      console.error(`❌ Failed to download ${filename}:`, error.message);
    }
  }

  console.log(
    `\n🎉 Font download complete! ${downloaded}/${totalFonts} files downloaded.`
  );
  console.log(`📂 Fonts saved to: ${FONTS_DIR}`);

  // Create a simple README for manual download instructions
  const readmePath = path.join(FONTS_DIR, "README.md");
  const readmeContent = `# 폰트 파일 설치 안내

이 폴더에는 다음 폰트 파일들이 필요합니다:

## Pretendard 폰트
- Pretendard-Light.ttf
- Pretendard-Regular.ttf  
- Pretendard-Medium.ttf
- Pretendard-SemiBold.ttf
- Pretendard-Bold.ttf
- Pretendard-ExtraBold.ttf

다운로드: https://github.com/orioncactus/pretendard/releases

## Poppins 폰트
- Poppins-Light.ttf
- Poppins-Regular.ttf
- Poppins-Medium.ttf
- Poppins-SemiBold.ttf
- Poppins-Bold.ttf
- Poppins-ExtraBold.ttf

다운로드: https://fonts.google.com/specimen/Poppins

## 자동 다운로드
\`npm run download-fonts\` 명령어를 실행하여 자동으로 다운로드할 수 있습니다.
`;

  fs.writeFileSync(readmePath, readmeContent);
  console.log(`📄 Created README.md with manual download instructions`);
}

// Run the script
downloadFonts().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
