import { formatSpansForUi } from "./formatSpansForUi";

type ColumnName = keyof ReturnType<typeof formatSpansForUi>[-1];

export function resolveColumnAlias(columnName: ColumnName): ColumnName {
    if (columnName === "waterfall") {
        return "start"
    }

    return columnName
}