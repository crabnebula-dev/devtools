import { Highlighter, Lang, getHighlighter, setCDN, setWasm } from "shiki";
import { SourcesClient } from "~/lib/proto/sources.client";
import { getEntryBytes } from "~/lib/sources/file-entries";

type HighlighterCodeParamsForSources = Readonly<
  [SourcesClient, string, number, HighlighterLang]
>;

type HighlighterCodeParamsForSpans = Readonly<{
  lang: HighlighterLang;
}>

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

// Initializing a TextDecoder is expensive plus they can be reused,
// so we create a global instance
const TEXT_DECODER = new TextDecoder();

export function bytesToHtml(
  bytes: Uint8Array | undefined,
  lang: HighlighterLang,
  highlighter: Highlighter | undefined
) {
  if (!bytes || !highlighter) return;

  const text = TEXT_DECODER.decode(bytes);

  return highlighter.codeToHtml(text, { lang });
}

export async function getHighlightedCode(sourcesArg: HighlighterCodeParamsForSources): Promise<string | undefined>;
export async function getHighlightedCode(spansArg: HighlighterCodeParamsForSpans): Promise<(code: string) => string>
export async function getHighlightedCode(arg: HighlighterCodeParamsForSources | HighlighterCodeParamsForSpans) {
  setCDN("/shiki/");
  const responseWasm = await fetch("/shiki/onig.wasm");
  setWasm(responseWasm);

  const highlighter = await getHighlighter({
    theme: "material-theme-ocean",
    langs: SUPPORTED_LANGS,
    paths: { wasm: "dist/" },
  });

  if ("lang" in arg) {
    const { lang } = arg;
    return (code: string) => highlighter.codeToHtml(code, { lang })
  }

  const [sourcesClient, path, size, lang] = arg;
  const bytes = await getEntryBytes(sourcesClient, path, size);
  const code = bytesToHtml(bytes, lang, highlighter);
  return code;
}
