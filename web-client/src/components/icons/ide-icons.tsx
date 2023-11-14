import { getIconForFile, getIconForFolder } from "@crabnebula/file-icons";
import { Show } from "solid-js";

type Props = Record<"path", string>;

const GenericFolderIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden={true}
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M2 11.5C2 11.7761 2.22386 12 2.5 12H12.5C12.7761 12 13 11.7761 13 11.5V5C13 4.72386 12.7761 4.5 12.5 4.5H9.5H7.83333C7.50878 4.5 7.19298 4.39473 6.93333 4.2L5.33333 3H2.5C2.22386 3 2 3.22386 2 3.5L2 6.5L2 11.5ZM2.5 13C1.67157 13 1 12.3284 1 11.5L1 6.5L1 3.5C1 2.67157 1.67157 2 2.5 2H5.41667C5.57894 2 5.73684 2.05263 5.86667 2.15L7.53333 3.4C7.61988 3.46491 7.72515 3.5 7.83333 3.5H9.5H12.5C13.3284 3.5 14 4.17157 14 5V11.5C14 12.3284 13.3284 13 12.5 13H2.5Z"
      fill="currentColor"
    />
  </svg>
);

export function FolderIcon(props: Props) {
  const icon = () => getIconForFolder(props.path);

  return (
    <Show when={typeof icon() === "string"} fallback={<GenericFolderIcon />}>
      {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
      <img src={icon()!} aria-hidden={true} alt={""} />
    </Show>
  );
}

const GenericFileIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden={true}
  >
    <path
      d="M3.5 2C3.22386 2 3 2.22386 3 2.5V12.5C3 12.7761 3.22386 13 3.5 13H11.5C11.7761 13 12 12.7761 12 12.5V6H8.5C8.22386 6 8 5.77614 8 5.5V2H3.5ZM9 2.70711L11.2929 5H9V2.70711ZM2 2.5C2 1.67157 2.67157 1 3.5 1H8.5C8.63261 1 8.75979 1.05268 8.85355 1.14645L12.8536 5.14645C12.9473 5.24021 13 5.36739 13 5.5V12.5C13 13.3284 12.3284 14 11.5 14H3.5C2.67157 14 2 13.3284 2 12.5V2.5Z"
      fill="currentColor"
      fill-rule="evenodd"
      clip-rule="evenodd"
    />
  </svg>
);

export function FileIcon(props: Props) {
  const icon = () => getIconForFile(props.path);

  return (
    <Show when={typeof icon() === "string"} fallback={<GenericFileIcon />}>
      {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
      <img src={icon()!} aria-hidden={true} alt={""} />
    </Show>
  );
}
