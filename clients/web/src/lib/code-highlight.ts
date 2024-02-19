import {
  BundledTheme,
  CodeToHastOptions,
  Highlighter,
  getHighlighter,
} from "shiki";
import { transformerCompactLineOptions } from "@shikijs/transformers";
import { type BundledLanguage } from "shiki/langs";
import { SourcesClient } from "~/lib/proto/sources.client";
import { getEntryBytes } from "~/lib/sources/file-entries";

type HighlighterCodeParamsForSources = Readonly<
  [string, Highlighter, BundledLanguage, number?]
>;

type HighlighterCodeParamsForSpans = Readonly<{
  lang: BundledLanguage;
  highlighter: Highlighter;
}>;

export const SUPPORTED_LANGS = [
  "js",
  "rust",
  "toml",
  "html",
  "json",
  "md",
  "yaml",
] satisfies BundledLanguage[];

const TEXT_DECODER = new TextDecoder();

export function bytesToText(bytes: Uint8Array | undefined): string {
  return TEXT_DECODER.decode(bytes);
}

export function textToHtml(
  text: string,
  highlighter: Highlighter | undefined,
  lang: BundledLanguage,
  highlightedLine?: number,
) {
  if (!highlighter) return "";

  const options: CodeToHastOptions<BundledLanguage, BundledTheme> = {
    lang,
    theme: "material-theme-ocean",
  };

  if (highlightedLine) {
    options.transformers = [
      transformerCompactLineOptions([
        {
          line: highlightedLine,
          classes: ["highlighted bg-slate-800"],
        },
      ]),
    ];
  }

  return highlighter.codeToHtml(text, options);
}

export async function createHighlighter() {
  return await getHighlighter({
    themes: ["material-theme-ocean"],
    langs: SUPPORTED_LANGS,
  });
}
export async function getText(
  sourcesClient: SourcesClient,
  path: string,
  size: number,
) {
  const bytes = await getEntryBytes(sourcesClient, path, size);

  const text = bytesToText(bytes);
  return text;
}

export function getHighlightedCode(
  sourcesArg: HighlighterCodeParamsForSources,
): string;
export function getHighlightedCode(
  spansArg: HighlighterCodeParamsForSpans,
): (code: string) => string;
export function getHighlightedCode(
  arg: HighlighterCodeParamsForSources | HighlighterCodeParamsForSpans,
) {
  if ("lang" in arg) {
    const { lang } = arg;
    return (code: string) =>
      highlighter.codeToHtml(code, { lang, theme: "material-theme-ocean" });
  }

  const [text, highlighter, lang, highlightedLine] = arg;
  const code = textToHtml(text, highlighter, lang, highlightedLine);
  return code;
}
