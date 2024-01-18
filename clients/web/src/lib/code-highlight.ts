import { Highlighter, Lang, getHighlighter, setCDN, setWasm } from "shiki";
import { SourcesClient } from "~/lib/proto/sources.client";
import { getEntryBytes } from "~/lib/sources/file-entries";

type HighlighterCodeParamsForSources = Readonly<
  [string, Highlighter, HighlighterLang, number?]
>;

type HighlighterCodeParamsForSpans = Readonly<{
  lang: HighlighterLang;
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
] satisfies Lang[];

type LangList = typeof SUPPORTED_LANGS;
export type HighlighterLang = LangList[number];

interface CodeToHtmlOptions {
  lang?: HighlighterLang;
  lineOptions?: LineOption[];
}

interface LineOption {
  /**
   * 1-based line number.
   */
  line: number;
  classes?: string[];
}

// Initializing a TextDecoder is expensive plus they can be reused,
// so we create a global instance
const TEXT_DECODER = new TextDecoder();

export function bytesToText(bytes: Uint8Array | undefined): string {
  return TEXT_DECODER.decode(bytes);
}

export function textToHtml(
  text: string,
  highlighter: Highlighter | undefined,
  lang: HighlighterLang,
  highlightedLine?: number
) {
  if (!highlighter) return "";

  const options: CodeToHtmlOptions = { lang };

  if (highlightedLine)
    options.lineOptions = [
      {
        line: highlightedLine,
        classes: ["highlighted bg-slate-800"],
      },
    ];

  return highlighter.codeToHtml(text, options);
}

export async function createHighlighter() {
  setCDN("/app/shiki/");
  const responseWasm = await fetch("/app/shiki/onig.wasm");
  setWasm(responseWasm);

  return await getHighlighter({
    theme: "material-theme-ocean",
    langs: SUPPORTED_LANGS,
    paths: { wasm: "dist/" },
  });
}
export async function getText(
  sourcesClient: SourcesClient,
  path: string,
  size: number
) {
  const bytes = await getEntryBytes(sourcesClient, path, size);

  const text = bytesToText(bytes);
  return text;
}

export function getHighlightedCode(
  sourcesArg: HighlighterCodeParamsForSources
): string;
export function getHighlightedCode(
  spansArg: HighlighterCodeParamsForSpans
): (code: string) => string;
export function getHighlightedCode(
  arg: HighlighterCodeParamsForSources | HighlighterCodeParamsForSpans
) {
  if ("lang" in arg) {
    const { lang, highlighter } = arg;
    return (code: string) => highlighter.codeToHtml(code, { lang });
  }

  const [text, highlighter, lang, highlightedLine] = arg;
  const code = textToHtml(text, highlighter, lang, highlightedLine);
  return code;
}
