import { useParams } from "@solidjs/router";
import { useConfiguration } from "~/components/tauri/configuration-context";
import { useMonitor } from "~/context/monitor-provider";
import { findLineNumberByNestedKeyInSource } from "./find-line-number-by-nested-key-in-source";
import { retrieveConfigurationByKey } from "./config/retrieve-configurations";
import { buildSchemaMap } from "./build-schema-map";

export function getDescriptionByKey(key: string) {
  const {
    descriptions: { descriptions },
  } = useConfiguration();
  return descriptions().has(key) ? descriptions().get(key) : undefined;
}

export function generateDescriptions(key: string, data: object) {
  const { monitorData } = useMonitor();

  const {
    descriptions: { setDescriptions },
  } = useConfiguration();

  setDescriptions(
    buildSchemaMap(monitorData.schema ?? {}, {
      [key]: data,
    }),
  );
}

export function scrollToHighlighted() {
  const highlightedLine = document.querySelector(".line.highlighted");

  if (!highlightedLine) return;

  highlightedLine.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function findLineNumberByKey(key: string) {
  const params = useParams<{ config: string }>();
  const config = retrieveConfigurationByKey(params.config);
  return findLineNumberByNestedKeyInSource(config?.raw ?? "", key);
}
