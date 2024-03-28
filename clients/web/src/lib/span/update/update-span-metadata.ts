import { Metadata } from "~/lib/proto/common";
import { Update as InstrumentUpdate } from "~/lib/proto/instrument";

export function updateSpanMetadata(
  currentMeta: Map<bigint, Metadata>,
  update: InstrumentUpdate,
) {
  return new Map([
    ...(currentMeta || []),
    ...update.newMetadata.map((new_metadata) => {
      /**
       * protobuf generated types have these as optional.
       */
      //  eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const id = new_metadata.id!;
      //  eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const metadata = new_metadata.metadata!;

      return [id, metadata] as const;
    }),
  ]);
}
