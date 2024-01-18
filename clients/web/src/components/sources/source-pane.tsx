import { UnknownView } from "~/components/sources/unknown-view.tsx";
import { ImageView } from "~/components/sources/image-view.tsx";
import { Match, Show, Suspense, Switch } from "solid-js";
import { useParams, useSearchParams } from "@solidjs/router";
import { decodeFileName, guessContentType } from "~/lib/sources/file-entries";
import { CodeView } from "~/components/sources/code-view";
import { Loader } from "~/components/loader";
import { HighlighterLang } from "~/lib/code-highlight";

export function SourcePane() {
  const params = useParams<Record<"source", string>>();
  const filename = () => decodeFileName(params.source);
  const [searchParams] = useSearchParams();

  const contentType = () => guessContentType(filename());
  const sizeHint = () => parseInt(searchParams.sizeHint);

  return (
    <Show when={params.source} keyed>
      <Suspense fallback={<Loader />}>
        <Show when={contentType()}>
          {(resolvedContentType) => (
            <Switch fallback={<UnknownView path={filename()} />}>
              <Match when={resolvedContentType().startsWith("code/")} keyed>
                <CodeView
                  path={filename()}
                  size={sizeHint()}
                  lang={
                    resolvedContentType().replace(
                      "code/",
                      ""
                    ) as HighlighterLang
                  }
                />
              </Match>
              <Match when={resolvedContentType().startsWith("image/")} keyed>
                <ImageView
                  path={params.source}
                  size={sizeHint()}
                  type={resolvedContentType().replace("image/", "")}
                />
              </Match>
            </Switch>
          )}
        </Show>
      </Suspense>
    </Show>
  );
}
