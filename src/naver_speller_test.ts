import { NaverSpellChecker } from "./naver_speller";

async function runTest() {
  const checker = new NaverSpellChecker();
  const textToCorrect = "이 글은 맛춤뻡 검사를 위함 글임니다.";
  console.log(`원본 텍스트: "${textToCorrect}"`);

  try {
    const correctedText = await checker.correctText(textToCorrect);
    console.log(`교정된 텍스트: "${correctedText}"`);
  } catch (error) {
    console.error("맞춤법 검사 중 오류 발생:", error);
  }
}

runTest();
