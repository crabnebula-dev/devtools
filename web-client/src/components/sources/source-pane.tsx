import { UnknownView } from "~/components/sources/unknown-view.tsx";
import { ImageView } from "~/components/sources/image-view.tsx";
import { Match, Show, Suspense, Switch } from "solid-js";
import { useParams, useSearchParams } from "@solidjs/router";
import { encodeFileName, guessContentType } from "~/lib/sources/file-entries";
import CodeView from "~/components/sources/code-view";
import { Loader } from "~/components/loader";
import { HighlighterLang } from "~/lib/sources/code-highlight";

export function SourcePane() {
  const params = useParams<Record<"source", string>>();
  const filename = () => encodeFileName(params.source);
  const [searchParams] = useSearchParams();

  const contentType = () => guessContentType(filename());
  const sizeHint = () => parseInt(searchParams.sizeHint);

  return (
    <Show when={params.source} keyed>
      <Suspense fallback={<Loader />}>
        <Switch fallback={<UnknownView path={filename()} />}>
          <Match when={contentType()?.startsWith("code/")} keyed>
            <CodeView
              path={filename()}
              size={sizeHint()}
              lang={contentType()!.replace("code/", "") as HighlighterLang}
            />
          </Match>
          <Match when={contentType()?.startsWith("image/")} keyed>
            <ImageView
              path={params.source}
              size={sizeHint()}
              type={contentType()!.replace("image/", "")}
            />
          </Match>
        </Switch>
      </Suspense>
    </Show>
  );
}
