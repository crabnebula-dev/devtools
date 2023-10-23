export function UnknownView(props: { path: string }) {
    return <div class={'h-full flex items-center justify-center'}>Can't open unknown or binary file <code>{props.path}</code></div>
}
