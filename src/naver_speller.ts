import { load as loadCheerio } from "cheerio";

const SPELLER_PROVIDER_URL =
  "https://m.search.naver.com/search.naver?query=%EB%A7%9E%EC%B6%A4%EB%B2%95%EA%B2%80%EC%82%AC%EA%B8%B0";
const PASSPORT_KEY_REGEX = /SpellerProxy\?passportKey=([a-zA-Z0-9]+)/;
const SPELLER_API_URL_BASE =
  "https://m.search.naver.com/p/csearch/ocontent/util/SpellerProxy?passportKey=";

interface NaverSpellerResponse {
  message: {
    result: {
      html: string;
      errata_count: number;
      origin_html: string;
      notag_html: string;
    };
    error?: string;
  };
}
function simpleHtmlUnescape(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<br>/g, "\n")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export class NaverSpellChecker {
  private spellerApiUrl: string | null = null;

  private async fetchPassportKey(): Promise<string> {
    const response = await fetch(SPELLER_PROVIDER_URL);
    const html = await response.text();
    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}, response: ${html}`,
      );
    }

    let passportKey: string | undefined;
    const $ = loadCheerio(html);
    $("script").each((_, element) => {
      const scriptContent = $(element).html();
      const match = scriptContent?.match(PASSPORT_KEY_REGEX);
      if (match?.[1]) {
        passportKey = match[1];
        return false;
      }
    });

    if (!passportKey) {
      throw new Error("Passport key not found in the HTML content.");
    }
    return passportKey;
  }

  private async updateSpellerApiUrl(): Promise<void> {
    const passportKey = await this.fetchPassportKey();
    this.spellerApiUrl = `${SPELLER_API_URL_BASE}${passportKey}&color_blindness=0&q=`;
  }

  async correctText(text: string): Promise<string> {
    if (!this.spellerApiUrl) {
      await this.updateSpellerApiUrl();
      if (!this.spellerApiUrl) {
        throw new Error(
          "Failed to initialize Speller API URL. Cannot proceed.",
        );
      }
    }

    const encodedText = encodeURIComponent(text);
    const url = this.spellerApiUrl + encodedText;

    const response = await fetch(url);
    const html = await response.text();
    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}, response: ${html}`,
      );
    }

    const data: NaverSpellerResponse = await response.json();

    if (data.message.error) {
      if (data.message.error === "유효한 키가 아닙니다.") {
        this.spellerApiUrl = null;
        throw new Error("Try again with a new passport key.");
      }
      throw new Error(`failed to check spelling: ${data.message.error}`);
    }

    return simpleHtmlUnescape(data.message.result.notag_html);
  }
}
