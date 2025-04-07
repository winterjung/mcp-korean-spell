#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { NaverSpellChecker } from "./naver_speller.js";

const spellChecker = new NaverSpellChecker();

const server = new McpServer({
  name: "Korean Spell Checker",
  version: "1.0.0",
});

server.tool(
  "fix_korean_spell",
  "한국어 맞춤법(오탈자, 띄어쓰기, 문법)을 검사하고 교정합니다.",
  {
    text: z.string().describe("맞춤법 검사 할 한국어 텍스트"),
  },
  async ({ text }: { text: string }) => {
    try {
      const correctedText = await spellChecker.correctText(text);
      if (!correctedText) {
        return {
          content: [
            {
              type: "text",
              text: "맞춤법 검사 중 오류가 발생했습니다.",
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: correctedText,
          },
        ],
      };
    } catch (error) {
      console.error("맞춤법 검사 중 오류 발생:", error);
      return {
        content: [
          {
            type: "text",
            text: "맞춤법 검사 중 오류가 발생했습니다.",
          },
        ],
        isError: true,
      };
    }
  },
);

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Korean Spell Checker MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
