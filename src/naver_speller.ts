import { load as loadCheerio } from "cheerio";
import { Agent } from "node:https";

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

export class NaverSpellChecker {
  private readonly httpsAgent: Agent;

  constructor() {
    this.httpsAgent = new Agent({});
  }

  async correctText(text: string): Promise<string | null> {
    // TODO: Implement the logic to correct the text
    return text;
  }
}
