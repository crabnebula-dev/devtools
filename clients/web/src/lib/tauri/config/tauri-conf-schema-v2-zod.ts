import { z } from "zod";
export type TauriConfigV2 = z.infer<typeof tauriConfigSchemaV2>;

export const tauriConfigSchemaV2 = z
  .object({
    $schema: z
      .union([
        z.string().describe("The JSON schema for the Tauri config."),
        z.null().describe("The JSON schema for the Tauri config."),
      ])
      .describe("The JSON schema for the Tauri config.")
      .optional(),
    productName: z
      .union([
        z.string().regex(new RegExp('^[^/\\:*?"<>|]+$')).describe("App name."),
        z.null().describe("App name."),
      ])
      .describe("App name.")
      .optional(),
    version: z
      .union([
        z
          .string()
          .describe(
            "App version. It is a semver version number or a path to a `package.json` file containing the `version` field. If removed the version number from `Cargo.toml` is used.",
          ),
        z
          .null()
          .describe(
            "App version. It is a semver version number or a path to a `package.json` file containing the `version` field. If removed the version number from `Cargo.toml` is used.",
          ),
      ])
      .describe(
        "App version. It is a semver version number or a path to a `package.json` file containing the `version` field. If removed the version number from `Cargo.toml` is used.",
      )
      .optional(),
    identifier: z
      .string()
      .describe(
        "The application identifier in reverse domain name notation (e.g. `com.tauri.example`). This string must be unique across applications since it is used in system configurations like the bundle ID and path to the webview data directory. This string must contain only alphanumeric characters (A–Z, a–z, and 0–9), hyphens (-), and periods (.).",
      )
      .default(""),
    app: z
      .object({
        windows: z
          .array(
            z
              .object({
                label: z
                  .string()
                  .describe("The window identifier. It must be alphanumeric.")
                  .default("main"),
                url: z
                  .union([
                    z
                      .string()
                      .url()
                      .describe(
                        "An external URL. Must use either the `http` or `https` schemes.",
                      ),
                    z
                      .string()
                      .describe(
                        "The path portion of an app URL. For instance, to load `tauri://localhost/users/john`, you can simply provide `users/john` in this configuration.",
                      ),
                    z
                      .string()
                      .url()
                      .describe(
                        "A custom protocol url, for example, `doom://index.html`",
                      ),
                  ])
                  .describe("An URL to open on a Tauri webview window.")
                  .describe("The window webview URL.")
                  .default("index.html"),
                userAgent: z
                  .union([
                    z.string().describe("The user agent for the webview"),
                    z.null().describe("The user agent for the webview"),
                  ])
                  .describe("The user agent for the webview")
                  .optional(),
                fileDropEnabled: z
                  .boolean()
                  .describe(
                    "Whether the file drop is enabled or not on the webview. By default it is enabled.\n\nDisabling it is required to use drag and drop on the frontend on Windows.",
                  )
                  .default(true),
                center: z
                  .boolean()
                  .describe("Whether or not the window starts centered or not.")
                  .default(false),
                x: z
                  .union([
                    z
                      .number()
                      .describe(
                        "The horizontal position of the window's top left corner",
                      ),
                    z
                      .null()
                      .describe(
                        "The horizontal position of the window's top left corner",
                      ),
                  ])
                  .describe(
                    "The horizontal position of the window's top left corner",
                  )
                  .optional(),
                y: z
                  .union([
                    z
                      .number()
                      .describe(
                        "The vertical position of the window's top left corner",
                      ),
                    z
                      .null()
                      .describe(
                        "The vertical position of the window's top left corner",
                      ),
                  ])
                  .describe(
                    "The vertical position of the window's top left corner",
                  )
                  .optional(),
                width: z.number().describe("The window width.").default(800),
                height: z.number().describe("The window height.").default(600),
                minWidth: z
                  .union([
                    z.number().describe("The min window width."),
                    z.null().describe("The min window width."),
                  ])
                  .describe("The min window width.")
                  .optional(),
                minHeight: z
                  .union([
                    z.number().describe("The min window height."),
                    z.null().describe("The min window height."),
                  ])
                  .describe("The min window height.")
                  .optional(),
                maxWidth: z
                  .union([
                    z.number().describe("The max window width."),
                    z.null().describe("The max window width."),
                  ])
                  .describe("The max window width.")
                  .optional(),
                maxHeight: z
                  .union([
                    z.number().describe("The max window height."),
                    z.null().describe("The max window height."),
                  ])
                  .describe("The max window height.")
                  .optional(),
                resizable: z
                  .boolean()
                  .describe(
                    "Whether the window is resizable or not. When resizable is set to false, native window's maximize button is automatically disabled.",
                  )
                  .default(true),
                maximizable: z
                  .boolean()
                  .describe(
                    'Whether the window\'s native maximize button is enabled or not. If resizable is set to false, this setting is ignored.\n\n## Platform-specific\n\n- **macOS:** Disables the "zoom" button in the window titlebar, which is also used to enter fullscreen mode. - **Linux / iOS / Android:** Unsupported.',
                  )
                  .default(true),
                minimizable: z
                  .boolean()
                  .describe(
                    "Whether the window's native minimize button is enabled or not.\n\n## Platform-specific\n\n- **Linux / iOS / Android:** Unsupported.",
                  )
                  .default(true),
                closable: z
                  .boolean()
                  .describe(
                    'Whether the window\'s native close button is enabled or not.\n\n## Platform-specific\n\n- **Linux:** "GTK+ will do its best to convince the window manager not to show a close button. Depending on the system, this function may not have any effect when called on a window that is already visible" - **iOS / Android:** Unsupported.',
                  )
                  .default(true),
                title: z
                  .string()
                  .describe("The window title.")
                  .default("Tauri App"),
                fullscreen: z
                  .boolean()
                  .describe("Whether the window starts as fullscreen or not.")
                  .default(false),
                focus: z
                  .boolean()
                  .describe(
                    "Whether the window will be initially focused or not.",
                  )
                  .default(true),
                transparent: z
                  .boolean()
                  .describe(
                    "Whether the window is transparent or not.\n\nNote that on `macOS` this requires the `macos-private-api` feature flag, enabled under `tauri > macOSPrivateApi`. WARNING: Using private APIs on `macOS` prevents your application from being accepted to the `App Store`.",
                  )
                  .default(false),
                maximized: z
                  .boolean()
                  .describe("Whether the window is maximized or not.")
                  .default(false),
                visible: z
                  .boolean()
                  .describe("Whether the window is visible or not.")
                  .default(true),
                decorations: z
                  .boolean()
                  .describe("Whether the window should have borders and bars.")
                  .default(true),
                alwaysOnBottom: z
                  .boolean()
                  .describe(
                    "Whether the window should always be below other windows.",
                  )
                  .default(false),
                alwaysOnTop: z
                  .boolean()
                  .describe(
                    "Whether the window should always be on top of other windows.",
                  )
                  .default(false),
                visibleOnAllWorkspaces: z
                  .boolean()
                  .describe(
                    "Whether the window should be visible on all workspaces or virtual desktops.\n\n## Platform-specific\n\n- **Windows / iOS / Android:** Unsupported.",
                  )
                  .default(false),
                contentProtected: z
                  .boolean()
                  .describe(
                    "Prevents the window contents from being captured by other apps.",
                  )
                  .default(false),
                skipTaskbar: z
                  .boolean()
                  .describe(
                    "If `true`, hides the window icon from the taskbar on Windows and Linux.",
                  )
                  .default(false),
                theme: z
                  .union([
                    z
                      .any()
                      .superRefine((x, ctx) => {
                        const schemas = [
                          z.literal("Light").describe("Light theme."),
                          z.literal("Dark").describe("Dark theme."),
                        ];
                        const errors = schemas.reduce(
                          (errors: z.ZodError[], schema) =>
                            ((result) =>
                              "error" in result
                                ? [...errors, result.error]
                                : errors)(schema.safeParse(x)),
                          [],
                        );
                        if (schemas.length - errors.length !== 1) {
                          ctx.addIssue({
                            path: ctx.path,
                            code: "invalid_union",
                            unionErrors: errors,
                            message: "Invalid input: Should pass single schema",
                          });
                        }
                      })
                      .describe("System theme."),
                    z.null(),
                  ])
                  .describe(
                    "The initial window theme. Defaults to the system theme. Only implemented on Windows and macOS 10.14+.",
                  )
                  .optional(),
                titleBarStyle: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [
                      z.literal("Visible").describe("A normal title bar."),
                      z
                        .literal("Transparent")
                        .describe(
                          "Makes the title bar transparent, so the window background color is shown instead.\n\nUseful if you don't need to have actual HTML under the title bar. This lets you avoid the caveats of using `TitleBarStyle::Overlay`. Will be more useful when Tauri lets you set a custom window background color.",
                        ),
                      z
                        .literal("Overlay")
                        .describe(
                          "Shows the title bar as a transparent overlay over the window's content.\n\nKeep in mind: - The height of the title bar is different on different OS versions, which can lead to window the controls and title not being where you don't expect. - You need to define a custom drag region to make your window draggable, however due to a limitation you can't drag the window when it's not in focus <https://github.com/tauri-apps/tauri/issues/4316>. - The color of the window title depends on the system theme.",
                        ),
                    ];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      [],
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "How the window title bar should be displayed on macOS.",
                  )
                  .describe("The style of the macOS title bar.")
                  .default("Visible"),
                hiddenTitle: z
                  .boolean()
                  .describe(
                    "If `true`, sets the window title to be hidden on macOS.",
                  )
                  .default(false),
                acceptFirstMouse: z
                  .boolean()
                  .describe(
                    "Whether clicking an inactive window also clicks through to the webview on macOS.",
                  )
                  .default(false),
                tabbingIdentifier: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Defines the window [tabbing identifier] for macOS.\n\nWindows with matching tabbing identifiers will be grouped together. If the tabbing identifier is not set, automatic tabbing will be disabled.\n\n[tabbing identifier]: <https://developer.apple.com/documentation/appkit/nswindow/1644704-tabbingidentifier>",
                      ),
                    z
                      .null()
                      .describe(
                        "Defines the window [tabbing identifier] for macOS.\n\nWindows with matching tabbing identifiers will be grouped together. If the tabbing identifier is not set, automatic tabbing will be disabled.\n\n[tabbing identifier]: <https://developer.apple.com/documentation/appkit/nswindow/1644704-tabbingidentifier>",
                      ),
                  ])
                  .describe(
                    "Defines the window [tabbing identifier] for macOS.\n\nWindows with matching tabbing identifiers will be grouped together. If the tabbing identifier is not set, automatic tabbing will be disabled.\n\n[tabbing identifier]: <https://developer.apple.com/documentation/appkit/nswindow/1644704-tabbingidentifier>",
                  )
                  .optional(),
                additionalBrowserArgs: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Defines additional browser arguments on Windows. By default wry passes `--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection` so if you use this method, you also need to disable these components by yourself if you want.",
                      ),
                    z
                      .null()
                      .describe(
                        "Defines additional browser arguments on Windows. By default wry passes `--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection` so if you use this method, you also need to disable these components by yourself if you want.",
                      ),
                  ])
                  .describe(
                    "Defines additional browser arguments on Windows. By default wry passes `--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection` so if you use this method, you also need to disable these components by yourself if you want.",
                  )
                  .optional(),
                shadow: z
                  .boolean()
                  .describe(
                    "Whether or not the window has shadow.\n\n## Platform-specific\n\n- **Windows:** - `false` has no effect on decorated window, shadow are always ON. - `true` will make ndecorated window have a 1px white border, and on Windows 11, it will have a rounded corners. - **Linux:** Unsupported.",
                  )
                  .default(true),
                windowEffects: z
                  .union([
                    z
                      .object({
                        effects: z
                          .array(
                            z
                              .any()
                              .superRefine((x, ctx) => {
                                const schemas = [
                                  z
                                    .literal("appearanceBased")
                                    .describe(
                                      "A default material appropriate for the view's effectiveAppearance. **macOS 10.14-**",
                                    ),
                                  z
                                    .literal("light")
                                    .describe("*macOS 10.14-**"),
                                  z.literal("dark").describe("*macOS 10.14-**"),
                                  z
                                    .literal("mediumLight")
                                    .describe("*macOS 10.14-**"),
                                  z
                                    .literal("ultraDark")
                                    .describe("*macOS 10.14-**"),
                                  z
                                    .literal("titlebar")
                                    .describe("*macOS 10.10+**"),
                                  z
                                    .literal("selection")
                                    .describe("*macOS 10.10+**"),
                                  z.literal("menu").describe("*macOS 10.11+**"),
                                  z
                                    .literal("popover")
                                    .describe("*macOS 10.11+**"),
                                  z
                                    .literal("sidebar")
                                    .describe("*macOS 10.11+**"),
                                  z
                                    .literal("headerView")
                                    .describe("*macOS 10.14+**"),
                                  z
                                    .literal("sheet")
                                    .describe("*macOS 10.14+**"),
                                  z
                                    .literal("windowBackground")
                                    .describe("*macOS 10.14+**"),
                                  z
                                    .literal("hudWindow")
                                    .describe("*macOS 10.14+**"),
                                  z
                                    .literal("fullScreenUI")
                                    .describe("*macOS 10.14+**"),
                                  z
                                    .literal("tooltip")
                                    .describe("*macOS 10.14+**"),
                                  z
                                    .literal("contentBackground")
                                    .describe("*macOS 10.14+**"),
                                  z
                                    .literal("underWindowBackground")
                                    .describe("*macOS 10.14+**"),
                                  z
                                    .literal("underPageBackground")
                                    .describe("*macOS 10.14+**"),
                                  z
                                    .literal("mica")
                                    .describe(
                                      "Mica effect that matches the system dark perefence **Windows 11 Only**",
                                    ),
                                  z
                                    .literal("micaDark")
                                    .describe(
                                      "Mica effect with dark mode but only if dark mode is enabled on the system **Windows 11 Only**",
                                    ),
                                  z
                                    .literal("micaLight")
                                    .describe(
                                      "Mica effect with light mode **Windows 11 Only**",
                                    ),
                                  z
                                    .literal("tabbed")
                                    .describe(
                                      "Tabbed effect that matches the system dark perefence **Windows 11 Only**",
                                    ),
                                  z
                                    .literal("tabbedDark")
                                    .describe(
                                      "Tabbed effect with dark mode but only if dark mode is enabled on the system **Windows 11 Only**",
                                    ),
                                  z
                                    .literal("tabbedLight")
                                    .describe(
                                      "Tabbed effect with light mode **Windows 11 Only**",
                                    ),
                                  z
                                    .literal("blur")
                                    .describe(
                                      "**Windows 7/10/11(22H1) Only**\n\n## Notes\n\nThis effect has bad performance when resizing/dragging the window on Windows 11 build 22621.",
                                    ),
                                  z
                                    .literal("acrylic")
                                    .describe(
                                      "**Windows 10/11 Only**\n\n## Notes\n\nThis effect has bad performance when resizing/dragging the window on Windows 10 v1903+ and Windows 11 build 22000.",
                                    ),
                                ];
                                const errors = schemas.reduce(
                                  (errors: z.ZodError[], schema) =>
                                    ((result) =>
                                      "error" in result
                                        ? [...errors, result.error]
                                        : errors)(schema.safeParse(x)),
                                  [],
                                );
                                if (schemas.length - errors.length !== 1) {
                                  ctx.addIssue({
                                    path: ctx.path,
                                    code: "invalid_union",
                                    unionErrors: errors,
                                    message:
                                      "Invalid input: Should pass single schema",
                                  });
                                }
                              })
                              .describe("Platform-specific window effects"),
                          )
                          .describe(
                            "List of Window effects to apply to the Window. Conflicting effects will apply the first one and ignore the rest.",
                          ),
                        state: z
                          .union([
                            z
                              .any()
                              .superRefine((x, ctx) => {
                                const schemas = [
                                  z
                                    .literal("followsWindowActiveState")
                                    .describe(
                                      "Make window effect state follow the window's active state",
                                    ),
                                  z
                                    .literal("active")
                                    .describe(
                                      "Make window effect state always active",
                                    ),
                                  z
                                    .literal("inactive")
                                    .describe(
                                      "Make window effect state always inactive",
                                    ),
                                ];
                                const errors = schemas.reduce(
                                  (errors: z.ZodError[], schema) =>
                                    ((result) =>
                                      "error" in result
                                        ? [...errors, result.error]
                                        : errors)(schema.safeParse(x)),
                                  [],
                                );
                                if (schemas.length - errors.length !== 1) {
                                  ctx.addIssue({
                                    path: ctx.path,
                                    code: "invalid_union",
                                    unionErrors: errors,
                                    message:
                                      "Invalid input: Should pass single schema",
                                  });
                                }
                              })
                              .describe(
                                "Window effect state **macOS only**\n\n<https://developer.apple.com/documentation/appkit/nsvisualeffectview/state>",
                              ),
                            z.null(),
                          ])
                          .describe("Window effect state **macOS Only**")
                          .optional(),
                        radius: z
                          .union([
                            z
                              .number()
                              .describe(
                                "Window effect corner radius **macOS Only**",
                              ),
                            z
                              .null()
                              .describe(
                                "Window effect corner radius **macOS Only**",
                              ),
                          ])
                          .describe(
                            "Window effect corner radius **macOS Only**",
                          )
                          .optional(),
                        color: z
                          .union([
                            z
                              .tuple([
                                z.number().int().gte(0),
                                z.number().int().gte(0),
                                z.number().int().gte(0),
                                z.number().int().gte(0),
                              ])
                              .describe(
                                "a tuple struct of RGBA colors. Each value has minimum of 0 and maximum of 255.",
                              ),
                            z.null(),
                          ])
                          .describe(
                            "Window effect color. Affects [`WindowEffect::Blur`] and [`WindowEffect::Acrylic`] only on Windows 10 v1903+. Doesn't have any effect on Windows 7 or Windows 11.",
                          )
                          .optional(),
                      })
                      .strict()
                      .describe("The window effects configuration object"),
                    z.null(),
                  ])
                  .describe(
                    "Window effects.\n\nRequires the window to be transparent.\n\n## Platform-specific:\n\n- **Windows**: If using decorations or shadows, you may want to try this workaround <https://github.com/tauri-apps/tao/issues/72#issuecomment-975607891> - **Linux**: Unsupported",
                  )
                  .optional(),
                incognito: z
                  .boolean()
                  .describe(
                    "Whether or not the webview should be launched in incognito  mode.\n\n## Platform-specific:\n\n- **Android**: Unsupported.",
                  )
                  .default(false),
                parent: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Sets the window associated with this label to be the parent of the window to be created.\n\n## Platform-specific\n\n- **Windows**: This sets the passed parent as an owner window to the window to be created. From [MSDN owned windows docs](https://docs.microsoft.com/en-us/windows/win32/winmsg/window-features#owned-windows): - An owned window is always above its owner in the z-order. - The system automatically destroys an owned window when its owner is destroyed. - An owned window is hidden when its owner is minimized. - **Linux**: This makes the new window transient for parent, see <https://docs.gtk.org/gtk3/method.Window.set_transient_for.html> - **macOS**: This adds the window as a child of parent, see <https://developer.apple.com/documentation/appkit/nswindow/1419152-addchildwindow?language=objc>",
                      ),
                    z
                      .null()
                      .describe(
                        "Sets the window associated with this label to be the parent of the window to be created.\n\n## Platform-specific\n\n- **Windows**: This sets the passed parent as an owner window to the window to be created. From [MSDN owned windows docs](https://docs.microsoft.com/en-us/windows/win32/winmsg/window-features#owned-windows): - An owned window is always above its owner in the z-order. - The system automatically destroys an owned window when its owner is destroyed. - An owned window is hidden when its owner is minimized. - **Linux**: This makes the new window transient for parent, see <https://docs.gtk.org/gtk3/method.Window.set_transient_for.html> - **macOS**: This adds the window as a child of parent, see <https://developer.apple.com/documentation/appkit/nswindow/1419152-addchildwindow?language=objc>",
                      ),
                  ])
                  .describe(
                    "Sets the window associated with this label to be the parent of the window to be created.\n\n## Platform-specific\n\n- **Windows**: This sets the passed parent as an owner window to the window to be created. From [MSDN owned windows docs](https://docs.microsoft.com/en-us/windows/win32/winmsg/window-features#owned-windows): - An owned window is always above its owner in the z-order. - The system automatically destroys an owned window when its owner is destroyed. - An owned window is hidden when its owner is minimized. - **Linux**: This makes the new window transient for parent, see <https://docs.gtk.org/gtk3/method.Window.set_transient_for.html> - **macOS**: This adds the window as a child of parent, see <https://developer.apple.com/documentation/appkit/nswindow/1419152-addchildwindow?language=objc>",
                  )
                  .optional(),
                proxyUrl: z
                  .union([
                    z
                      .string()
                      .url()
                      .describe(
                        "The proxy URL for the WebView for all network requests.\n\nMust be either a `http://` or a `socks5://` URL.\n\n## Platform-specific\n\n- **macOS**: Requires the `macos-proxy` feature flag and only compiles for macOS 14+.",
                      ),
                    z
                      .null()
                      .describe(
                        "The proxy URL for the WebView for all network requests.\n\nMust be either a `http://` or a `socks5://` URL.\n\n## Platform-specific\n\n- **macOS**: Requires the `macos-proxy` feature flag and only compiles for macOS 14+.",
                      ),
                  ])
                  .describe(
                    "The proxy URL for the WebView for all network requests.\n\nMust be either a `http://` or a `socks5://` URL.\n\n## Platform-specific\n\n- **macOS**: Requires the `macos-proxy` feature flag and only compiles for macOS 14+.",
                  )
                  .optional(),
              })
              .strict()
              .describe(
                "The window configuration object.\n\nSee more: <https://tauri.app/v1/api/config#windowconfig>",
              ),
          )
          .describe("The windows configuration.")
          .default([]),
        security: z
          .object({
            csp: z
              .union([
                z
                  .union([
                    z
                      .string()
                      .describe(
                        "The entire CSP policy in a single text string.",
                      ),
                    z
                      .record(
                        z
                          .union([
                            z
                              .string()
                              .describe(
                                "An inline list of CSP sources. Same as [`Self::List`], but concatenated with a space separator.",
                              ),
                            z
                              .array(z.string())
                              .describe(
                                "A list of CSP sources. The collection will be concatenated with a space separator for the CSP string.",
                              ),
                          ])
                          .describe(
                            "A Content-Security-Policy directive source list. See <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#sources>.",
                          ),
                      )
                      .describe(
                        "An object mapping a directive with its sources values as a list of strings.",
                      ),
                  ])
                  .describe(
                    "A Content-Security-Policy definition. See <https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP>.",
                  ),
                z.null(),
              ])
              .describe(
                "The Content Security Policy that will be injected on all HTML files on the built application. If [`dev_csp`](#SecurityConfig.devCsp) is not specified, this value is also injected on dev.\n\nThis is a really important part of the configuration since it helps you ensure your WebView is secured. See <https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP>.",
              )
              .optional(),
            devCsp: z
              .union([
                z
                  .union([
                    z
                      .string()
                      .describe(
                        "The entire CSP policy in a single text string.",
                      ),
                    z
                      .record(
                        z
                          .union([
                            z
                              .string()
                              .describe(
                                "An inline list of CSP sources. Same as [`Self::List`], but concatenated with a space separator.",
                              ),
                            z
                              .array(z.string())
                              .describe(
                                "A list of CSP sources. The collection will be concatenated with a space separator for the CSP string.",
                              ),
                          ])
                          .describe(
                            "A Content-Security-Policy directive source list. See <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#sources>.",
                          ),
                      )
                      .describe(
                        "An object mapping a directive with its sources values as a list of strings.",
                      ),
                  ])
                  .describe(
                    "A Content-Security-Policy definition. See <https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP>.",
                  ),
                z.null(),
              ])
              .describe(
                "The Content Security Policy that will be injected on all HTML files on development.\n\nThis is a really important part of the configuration since it helps you ensure your WebView is secured. See <https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP>.",
              )
              .optional(),
            freezePrototype: z
              .boolean()
              .describe(
                "Freeze the `Object.prototype` when using the custom protocol.",
              )
              .default(false),
            dangerousDisableAssetCspModification: z
              .union([
                z
                  .boolean()
                  .describe(
                    "If `true`, disables all CSP modification. `false` is the default value and it configures Tauri to control the CSP.",
                  ),
                z
                  .array(z.string())
                  .describe(
                    "Disables the given list of CSP directives modifications.",
                  ),
              ])
              .describe(
                "The possible values for the `dangerous_disable_asset_csp_modification` config option.",
              )
              .describe(
                "Disables the Tauri-injected CSP sources.\n\nAt compile time, Tauri parses all the frontend assets and changes the Content-Security-Policy to only allow loading of your own scripts and styles by injecting nonce and hash sources. This stricts your CSP, which may introduce issues when using along with other flexing sources.\n\nThis configuration option allows both a boolean and a list of strings as value. A boolean instructs Tauri to disable the injection for all CSP injections, and a list of strings indicates the CSP directives that Tauri cannot inject.\n\n**WARNING:** Only disable this if you know what you are doing and have properly configured the CSP. Your application might be vulnerable to XSS attacks without this Tauri protection.",
              )
              .default(false),
            assetProtocol: z
              .object({
                scope: z
                  .union([
                    z
                      .array(z.string())
                      .describe(
                        "A list of paths that are allowed by this scope.",
                      ),
                    z
                      .object({
                        allow: z
                          .array(z.string())
                          .describe(
                            "A list of paths that are allowed by this scope.",
                          )
                          .default([]),
                        deny: z
                          .array(z.string())
                          .describe(
                            "A list of paths that are not allowed by this scope. This gets precedence over the [`Self::Scope::allow`] list.",
                          )
                          .default([]),
                        requireLiteralLeadingDot: z
                          .union([
                            z
                              .boolean()
                              .describe(
                                "Whether or not paths that contain components that start with a `.` will require that `.` appears literally in the pattern; `*`, `?`, `**`, or `[...]` will not match. This is useful because such files are conventionally considered hidden on Unix systems and it might be desirable to skip them when listing files.\n\nDefaults to `true` on Unix systems and `false` on Windows",
                              ),
                            z
                              .null()
                              .describe(
                                "Whether or not paths that contain components that start with a `.` will require that `.` appears literally in the pattern; `*`, `?`, `**`, or `[...]` will not match. This is useful because such files are conventionally considered hidden on Unix systems and it might be desirable to skip them when listing files.\n\nDefaults to `true` on Unix systems and `false` on Windows",
                              ),
                          ])
                          .describe(
                            "Whether or not paths that contain components that start with a `.` will require that `.` appears literally in the pattern; `*`, `?`, `**`, or `[...]` will not match. This is useful because such files are conventionally considered hidden on Unix systems and it might be desirable to skip them when listing files.\n\nDefaults to `true` on Unix systems and `false` on Windows",
                          )
                          .optional(),
                      })
                      .describe("A complete scope configuration."),
                  ])
                  .describe(
                    "Protocol scope definition. It is a list of glob patterns that restrict the API access from the webview.\n\nEach pattern can start with a variable that resolves to a system base directory. The variables are: `$AUDIO`, `$CACHE`, `$CONFIG`, `$DATA`, `$LOCALDATA`, `$DESKTOP`, `$DOCUMENT`, `$DOWNLOAD`, `$EXE`, `$FONT`, `$HOME`, `$PICTURE`, `$PUBLIC`, `$RUNTIME`, `$TEMPLATE`, `$VIDEO`, `$RESOURCE`, `$APP`, `$LOG`, `$TEMP`, `$APPCONFIG`, `$APPDATA`, `$APPLOCALDATA`, `$APPCACHE`, `$APPLOG`.",
                  )
                  .describe("The access scope for the asset protocol.")
                  .default([]),
                enable: z
                  .boolean()
                  .describe("Enables the asset protocol.")
                  .default(false),
              })
              .strict()
              .describe(
                "Config for the asset custom protocol.\n\nSee more: <https://tauri.app/v1/api/config#assetprotocolconfig>",
              )
              .describe("Custom protocol config.")
              .default({ enable: false, scope: [] }),
            pattern: z
              .any()
              .superRefine((x, ctx) => {
                const schemas = [
                  z
                    .object({ use: z.literal("brownfield") })
                    .describe("Brownfield pattern."),
                  z
                    .object({
                      use: z.literal("isolation"),
                      options: z.object({
                        dir: z
                          .string()
                          .describe(
                            "The dir containing the index.html file that contains the secure isolation application.",
                          ),
                      }),
                    })
                    .describe(
                      "Isolation pattern. Recommended for security purposes.",
                    ),
                ];
                const errors = schemas.reduce(
                  (errors: z.ZodError[], schema) =>
                    ((result) =>
                      "error" in result ? [...errors, result.error] : errors)(
                      schema.safeParse(x),
                    ),
                  [],
                );
                if (schemas.length - errors.length !== 1) {
                  ctx.addIssue({
                    path: ctx.path,
                    code: "invalid_union",
                    unionErrors: errors,
                    message: "Invalid input: Should pass single schema",
                  });
                }
              })
              .describe("The application pattern.")
              .describe("The pattern to use.")
              .default({ use: "brownfield" }),
            capabilities: z
              .array(
                z
                  .union([
                    z
                      .object({
                        identifier: z
                          .string()
                          .describe("Identifier of the capability."),
                        description: z
                          .string()
                          .describe("Description of the capability.")
                          .default(""),
                        remote: z
                          .union([
                            z
                              .object({
                                urls: z
                                  .array(z.string())
                                  .describe(
                                    "Remote domains this capability refers to. Can use glob patterns.",
                                  ),
                              })
                              .describe(
                                "Configuration for remote URLs that are associated with the capability.",
                              ),
                            z.null(),
                          ])
                          .describe(
                            "Configure remote URLs that can use the capability permissions.",
                          )
                          .optional(),
                        local: z
                          .boolean()
                          .describe(
                            "Whether this capability is enabled for local app URLs or not. Defaults to `true`.",
                          )
                          .default(true),
                        windows: z
                          .array(z.string())
                          .describe(
                            "List of windows that uses this capability. Can be a glob pattern.\n\nOn multiwebview windows, prefer [`Self::webviews`] for a fine grained access control.",
                          ),
                        webviews: z
                          .array(z.string())
                          .describe(
                            "List of webviews that uses this capability. Can be a glob pattern.\n\nThis is only required when using on multiwebview contexts, by default all child webviews of a window that matches [`Self::windows`] are linked.",
                          )
                          .optional(),
                        permissions: z
                          .array(
                            z
                              .union([
                                z
                                  .string()
                                  .describe(
                                    "Reference a permission or permission set by identifier.",
                                  ),
                                z
                                  .object({
                                    identifier: z
                                      .string()
                                      .describe(
                                        "Identifier of the permission or permission set.",
                                      ),
                                    allow: z
                                      .union([
                                        z
                                          .array(
                                            z
                                              .union([
                                                z
                                                  .null()
                                                  .describe(
                                                    "Represents a null JSON value.",
                                                  ),
                                                z
                                                  .boolean()
                                                  .describe(
                                                    "Represents a [`bool`].",
                                                  ),
                                                z
                                                  .union([
                                                    z
                                                      .number()
                                                      .int()
                                                      .describe(
                                                        "Represents an [`i64`].",
                                                      ),
                                                    z
                                                      .number()
                                                      .describe(
                                                        "Represents a [`f64`].",
                                                      ),
                                                  ])
                                                  .describe(
                                                    "A valid ACL number.",
                                                  )
                                                  .describe(
                                                    "Represents a valid ACL [`Number`].",
                                                  ),
                                                z
                                                  .string()
                                                  .describe(
                                                    "Represents a [`String`].",
                                                  ),
                                                z
                                                  .array(z.any())
                                                  .describe(
                                                    "Represents a list of other [`Value`]s.",
                                                  ),
                                                z
                                                  .record(z.any())
                                                  .describe(
                                                    "Represents a map of [`String`] keys to [`Value`]s.",
                                                  ),
                                              ])
                                              .describe(
                                                "All supported ACL values.",
                                              ),
                                          )
                                          .describe(
                                            "Data that defines what is allowed by the scope.",
                                          ),
                                        z
                                          .null()
                                          .describe(
                                            "Data that defines what is allowed by the scope.",
                                          ),
                                      ])
                                      .describe(
                                        "Data that defines what is allowed by the scope.",
                                      )
                                      .optional(),
                                    deny: z
                                      .union([
                                        z
                                          .array(
                                            z
                                              .union([
                                                z
                                                  .null()
                                                  .describe(
                                                    "Represents a null JSON value.",
                                                  ),
                                                z
                                                  .boolean()
                                                  .describe(
                                                    "Represents a [`bool`].",
                                                  ),
                                                z
                                                  .union([
                                                    z
                                                      .number()
                                                      .int()
                                                      .describe(
                                                        "Represents an [`i64`].",
                                                      ),
                                                    z
                                                      .number()
                                                      .describe(
                                                        "Represents a [`f64`].",
                                                      ),
                                                  ])
                                                  .describe(
                                                    "A valid ACL number.",
                                                  )
                                                  .describe(
                                                    "Represents a valid ACL [`Number`].",
                                                  ),
                                                z
                                                  .string()
                                                  .describe(
                                                    "Represents a [`String`].",
                                                  ),
                                                z
                                                  .array(z.any())
                                                  .describe(
                                                    "Represents a list of other [`Value`]s.",
                                                  ),
                                                z
                                                  .record(z.any())
                                                  .describe(
                                                    "Represents a map of [`String`] keys to [`Value`]s.",
                                                  ),
                                              ])
                                              .describe(
                                                "All supported ACL values.",
                                              ),
                                          )
                                          .describe(
                                            "Data that defines what is denied by the scope.",
                                          ),
                                        z
                                          .null()
                                          .describe(
                                            "Data that defines what is denied by the scope.",
                                          ),
                                      ])
                                      .describe(
                                        "Data that defines what is denied by the scope.",
                                      )
                                      .optional(),
                                  })
                                  .describe(
                                    "Reference a permission or permission set by identifier and extends its scope.",
                                  ),
                              ])
                              .describe(
                                "An entry for a permission value in a [`Capability`] can be either a raw permission [`Identifier`] or an object that references a permission and extends its scope.",
                              ),
                          )
                          .describe(
                            "List of permissions attached to this capability. Must include the plugin name as prefix in the form of `${plugin-name}:${permission-name}`.",
                          ),
                        platforms: z
                          .array(
                            z
                              .any()
                              .superRefine((x, ctx) => {
                                const schemas = [
                                  z.literal("macOS").describe("MacOS."),
                                  z.literal("windows").describe("Windows."),
                                  z.literal("linux").describe("Linux."),
                                  z.literal("android").describe("Android."),
                                  z.literal("iOS").describe("iOS."),
                                ];
                                const errors = schemas.reduce(
                                  (errors: z.ZodError[], schema) =>
                                    ((result) =>
                                      "error" in result
                                        ? [...errors, result.error]
                                        : errors)(schema.safeParse(x)),
                                  [],
                                );
                                if (schemas.length - errors.length !== 1) {
                                  ctx.addIssue({
                                    path: ctx.path,
                                    code: "invalid_union",
                                    unionErrors: errors,
                                    message:
                                      "Invalid input: Should pass single schema",
                                  });
                                }
                              })
                              .describe("Platform target."),
                          )
                          .describe(
                            "Target platforms this capability applies. By default all platforms are affected by this capability.",
                          )
                          .default([
                            "linux",
                            "macOS",
                            "windows",
                            "android",
                            "iOS",
                          ]),
                      })
                      .describe(
                        "a grouping and boundary mechanism developers can use to separate windows or plugins functionality from each other at runtime.\n\nIf a window is not matching any capability then it has no access to the IPC layer at all.\n\nThis can be done to create trust groups and reduce impact of vulnerabilities in certain plugins or windows. Windows can be added to a capability by exact name or glob patterns like *, admin-* or main-window.",
                      )
                      .describe("An inlined capability."),
                    z
                      .string()
                      .describe("Reference to a capability identifier."),
                  ])
                  .describe(
                    "A capability entry which can be either an inlined capability or a reference to a capability defined on its own file.",
                  ),
              )
              .describe(
                "List of capabilities that are enabled on the application.\n\nIf the list is empty, all capabilities are included.",
              )
              .default([]),
          })
          .strict()
          .describe(
            "Security configuration.\n\nSee more: <https://tauri.app/v1/api/config#securityconfig>",
          )
          .describe("Security configuration.")
          .default({
            assetProtocol: { enable: false, scope: [] },
            capabilities: [],
            dangerousDisableAssetCspModification: false,
            freezePrototype: false,
            pattern: { use: "brownfield" },
          }),
        trayIcon: z
          .union([
            z
              .object({
                id: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Set an id for this tray icon so you can reference it later, defaults to `main`.",
                      ),
                    z
                      .null()
                      .describe(
                        "Set an id for this tray icon so you can reference it later, defaults to `main`.",
                      ),
                  ])
                  .describe(
                    "Set an id for this tray icon so you can reference it later, defaults to `main`.",
                  )
                  .optional(),
                iconPath: z
                  .string()
                  .describe(
                    "Path to the default icon to use for the tray icon.",
                  ),
                iconAsTemplate: z
                  .boolean()
                  .describe(
                    "A Boolean value that determines whether the image represents a [template](https://developer.apple.com/documentation/appkit/nsimage/1520017-template?language=objc) image on macOS.",
                  )
                  .default(false),
                menuOnLeftClick: z
                  .boolean()
                  .describe(
                    "A Boolean value that determines whether the menu should appear when the tray icon receives a left click on macOS.",
                  )
                  .default(true),
                title: z
                  .union([
                    z.string().describe("Title for MacOS tray"),
                    z.null().describe("Title for MacOS tray"),
                  ])
                  .describe("Title for MacOS tray")
                  .optional(),
                tooltip: z
                  .union([
                    z
                      .string()
                      .describe("Tray icon tooltip on Windows and macOS"),
                    z.null().describe("Tray icon tooltip on Windows and macOS"),
                  ])
                  .describe("Tray icon tooltip on Windows and macOS")
                  .optional(),
              })
              .strict()
              .describe(
                "Configuration for application tray icon.\n\nSee more: <https://tauri.app/v1/api/config#trayiconconfig>",
              ),
            z.null(),
          ])
          .describe("Configuration for app tray icon.")
          .optional(),
        macOSPrivateApi: z
          .boolean()
          .describe(
            "MacOS private API configuration. Enables the transparent background API and sets the `fullScreenEnabled` preference to `true`.",
          )
          .default(false),
        withGlobalTauri: z
          .boolean()
          .describe(
            "Whether we should inject the Tauri API on `window.__TAURI__` or not.",
          )
          .default(false),
      })
      .strict()
      .describe(
        "The App configuration object.\n\nSee more: <https://tauri.app/v1/api/config#appconfig>",
      )
      .describe("The App configuration.")
      .default({
        macOSPrivateApi: false,
        security: {
          assetProtocol: { enable: false, scope: [] },
          capabilities: [],
          dangerousDisableAssetCspModification: false,
          freezePrototype: false,
          pattern: { use: "brownfield" },
        },
        windows: [],
        withGlobalTauri: false,
      }),
    build: z
      .object({
        runner: z
          .union([
            z
              .string()
              .describe("The binary used to build and run the application."),
            z
              .null()
              .describe("The binary used to build and run the application."),
          ])
          .describe("The binary used to build and run the application.")
          .optional(),
        devUrl: z
          .union([
            z
              .string()
              .url()
              .describe(
                "The URL to load in development.\n\nThis is usually an URL to a dev server, which serves your application assets with hot-reload and HMR. Most modern JavaScript bundlers like [vite](https://vitejs.dev/guide/) provides a way to start a dev server by default.\n\nIf you don't have a dev server or don't want to use one, ignore this option and use [`frontendDist`](BuildConfig::frontend_dist) and point to a web assets directory, and Tauri CLI will run its built-in dev server and provide a simple hot-reload experience.",
              ),
            z
              .null()
              .describe(
                "The URL to load in development.\n\nThis is usually an URL to a dev server, which serves your application assets with hot-reload and HMR. Most modern JavaScript bundlers like [vite](https://vitejs.dev/guide/) provides a way to start a dev server by default.\n\nIf you don't have a dev server or don't want to use one, ignore this option and use [`frontendDist`](BuildConfig::frontend_dist) and point to a web assets directory, and Tauri CLI will run its built-in dev server and provide a simple hot-reload experience.",
              ),
          ])
          .describe(
            "The URL to load in development.\n\nThis is usually an URL to a dev server, which serves your application assets with hot-reload and HMR. Most modern JavaScript bundlers like [vite](https://vitejs.dev/guide/) provides a way to start a dev server by default.\n\nIf you don't have a dev server or don't want to use one, ignore this option and use [`frontendDist`](BuildConfig::frontend_dist) and point to a web assets directory, and Tauri CLI will run its built-in dev server and provide a simple hot-reload experience.",
          )
          .optional(),
        frontendDist: z
          .union([
            z
              .union([
                z
                  .string()
                  .url()
                  .describe(
                    "An external URL that should be used as the default application URL.",
                  ),
                z
                  .string()
                  .describe(
                    "Path to a directory containing the frontend dist assets.",
                  ),
                z
                  .array(z.string())
                  .describe("An array of files to embed on the app."),
              ])
              .describe(
                "Defines the URL or assets to embed in the application.",
              ),
            z.null(),
          ])
          .describe(
            "The path to the application assets (usually the `dist` folder of your javascript bundler) or a URL that could be either a custom protocol registered in the tauri app (for example: `myprotocol://`) or a remote URL (for example: `https://site.com/app`).\n\nWhen a path relative to the configuration file is provided, it is read recursively and all files are embedded in the application binary. Tauri then looks for an `index.html` and serves it as the default entry point for your application.\n\nYou can also provide a list of paths to be embedded, which allows granular control over what files are added to the binary. In this case, all files are added to the root and you must reference it that way in your HTML files.\n\nWhen a URL is provided, the application won't have bundled assets and the application will load that URL by default.",
          )
          .optional(),
        beforeDevCommand: z
          .union([
            z
              .union([
                z
                  .string()
                  .describe("Run the given script with the default options."),
                z
                  .object({
                    script: z.string().describe("The script to execute."),
                    cwd: z
                      .union([
                        z.string().describe("The current working directory."),
                        z.null().describe("The current working directory."),
                      ])
                      .describe("The current working directory.")
                      .optional(),
                    wait: z
                      .boolean()
                      .describe(
                        "Whether `tauri dev` should wait for the command to finish or not. Defaults to `false`.",
                      )
                      .default(false),
                  })
                  .describe("Run the given script with custom options."),
              ])
              .describe(
                "Describes the shell command to run before `tauri dev`.",
              ),
            z.null(),
          ])
          .describe(
            "A shell command to run before `tauri dev` kicks in.\n\nThe TAURI_ENV_PLATFORM, TAURI_ENV_ARCH, TAURI_ENV_FAMILY, TAURI_ENV_PLATFORM_VERSION, TAURI_ENV_PLATFORM_TYPE and TAURI_ENV_DEBUG environment variables are set if you perform conditional compilation.",
          )
          .optional(),
        beforeBuildCommand: z
          .union([
            z
              .union([
                z
                  .string()
                  .describe("Run the given script with the default options."),
                z
                  .object({
                    script: z.string().describe("The script to execute."),
                    cwd: z
                      .union([
                        z.string().describe("The current working directory."),
                        z.null().describe("The current working directory."),
                      ])
                      .describe("The current working directory.")
                      .optional(),
                  })
                  .describe("Run the given script with custom options."),
              ])
              .describe(
                "Describes a shell command to be executed when a CLI hook is triggered.",
              ),
            z.null(),
          ])
          .describe(
            "A shell command to run before `tauri build` kicks in.\n\nThe TAURI_ENV_PLATFORM, TAURI_ENV_ARCH, TAURI_ENV_FAMILY, TAURI_ENV_PLATFORM_VERSION, TAURI_ENV_PLATFORM_TYPE and TAURI_ENV_DEBUG environment variables are set if you perform conditional compilation.",
          )
          .optional(),
        beforeBundleCommand: z
          .union([
            z
              .union([
                z
                  .string()
                  .describe("Run the given script with the default options."),
                z
                  .object({
                    script: z.string().describe("The script to execute."),
                    cwd: z
                      .union([
                        z.string().describe("The current working directory."),
                        z.null().describe("The current working directory."),
                      ])
                      .describe("The current working directory.")
                      .optional(),
                  })
                  .describe("Run the given script with custom options."),
              ])
              .describe(
                "Describes a shell command to be executed when a CLI hook is triggered.",
              ),
            z.null(),
          ])
          .describe(
            "A shell command to run before the bundling phase in `tauri build` kicks in.\n\nThe TAURI_ENV_PLATFORM, TAURI_ENV_ARCH, TAURI_ENV_FAMILY, TAURI_ENV_PLATFORM_VERSION, TAURI_ENV_PLATFORM_TYPE and TAURI_ENV_DEBUG environment variables are set if you perform conditional compilation.",
          )
          .optional(),
        features: z
          .union([
            z
              .array(z.string())
              .describe("Features passed to `cargo` commands."),
            z.null().describe("Features passed to `cargo` commands."),
          ])
          .describe("Features passed to `cargo` commands.")
          .optional(),
      })
      .strict()
      .describe(
        "The Build configuration object.\n\nSee more: <https://tauri.app/v1/api/config#buildconfig>",
      )
      .describe("The build configuration.")
      .default({}),
    bundle: z
      .object({
        active: z
          .boolean()
          .describe(
            "Whether Tauri should bundle your application or just output the executable.",
          )
          .default(false),
        targets: z
          .union([
            z.literal("all").describe("Bundle all targets."),
            z
              .array(
                z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [
                      z.literal("deb").describe("The debian bundle (.deb)."),
                      z.literal("rpm").describe("The RPM bundle (.rpm)."),
                      z
                        .literal("appimage")
                        .describe("The AppImage bundle (.appimage)."),
                      z
                        .literal("msi")
                        .describe("The Microsoft Installer bundle (.msi)."),
                      z.literal("nsis").describe("The NSIS bundle (.exe)."),
                      z
                        .literal("app")
                        .describe("The macOS application bundle (.app)."),
                      z
                        .literal("dmg")
                        .describe("The Apple Disk Image bundle (.dmg)."),
                      z
                        .literal("updater")
                        .describe("The Tauri updater bundle."),
                    ];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      [],
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe("A bundle referenced by tauri-bundler."),
              )
              .describe("A list of bundle targets."),
            z
              .any()
              .superRefine((x, ctx) => {
                const schemas = [
                  z.literal("deb").describe("The debian bundle (.deb)."),
                  z.literal("rpm").describe("The RPM bundle (.rpm)."),
                  z
                    .literal("appimage")
                    .describe("The AppImage bundle (.appimage)."),
                  z
                    .literal("msi")
                    .describe("The Microsoft Installer bundle (.msi)."),
                  z.literal("nsis").describe("The NSIS bundle (.exe)."),
                  z
                    .literal("app")
                    .describe("The macOS application bundle (.app)."),
                  z
                    .literal("dmg")
                    .describe("The Apple Disk Image bundle (.dmg)."),
                  z.literal("updater").describe("The Tauri updater bundle."),
                ];
                const errors = schemas.reduce(
                  (errors: z.ZodError[], schema) =>
                    ((result) =>
                      "error" in result ? [...errors, result.error] : errors)(
                      schema.safeParse(x),
                    ),
                  [],
                );
                if (schemas.length - errors.length !== 1) {
                  ctx.addIssue({
                    path: ctx.path,
                    code: "invalid_union",
                    unionErrors: errors,
                    message: "Invalid input: Should pass single schema",
                  });
                }
              })
              .describe("A bundle referenced by tauri-bundler.")
              .describe("A single bundle target."),
          ])
          .describe("Targets to bundle. Each value is case insensitive.")
          .describe(
            'The bundle targets, currently supports ["deb", "rpm", "appimage", "nsis", "msi", "app", "dmg", "updater"] or "all".',
          )
          .default("all"),
        publisher: z
          .union([
            z
              .string()
              .describe(
                "The application's publisher. Defaults to the second element in the identifier string. Currently maps to the Manufacturer property of the Windows Installer.",
              ),
            z
              .null()
              .describe(
                "The application's publisher. Defaults to the second element in the identifier string. Currently maps to the Manufacturer property of the Windows Installer.",
              ),
          ])
          .describe(
            "The application's publisher. Defaults to the second element in the identifier string. Currently maps to the Manufacturer property of the Windows Installer.",
          )
          .optional(),
        icon: z.array(z.string()).describe("The app's icons").default([]),
        resources: z
          .union([
            z
              .union([
                z.array(z.string()).describe("A list of paths to include."),
                z
                  .record(z.string())
                  .describe("A map of source to target paths."),
              ])
              .describe(
                "Definition for bundle resources. Can be either a list of paths to include or a map of source to target paths.",
              ),
            z.null(),
          ])
          .describe(
            "App resources to bundle. Each resource is a path to a file or directory. Glob patterns are supported.",
          )
          .optional(),
        copyright: z
          .union([
            z
              .string()
              .describe("A copyright string associated with your application."),
            z
              .null()
              .describe("A copyright string associated with your application."),
          ])
          .describe("A copyright string associated with your application.")
          .optional(),
        license: z
          .union([
            z
              .string()
              .describe(
                "The package's license identifier to be included in the appropriate bundles. If not set, defaults to the license from the Cargo.toml file.",
              ),
            z
              .null()
              .describe(
                "The package's license identifier to be included in the appropriate bundles. If not set, defaults to the license from the Cargo.toml file.",
              ),
          ])
          .describe(
            "The package's license identifier to be included in the appropriate bundles. If not set, defaults to the license from the Cargo.toml file.",
          )
          .optional(),
        licenseFile: z
          .union([
            z
              .string()
              .describe(
                "The path to the license file to be included in the appropriate bundles.",
              ),
            z
              .null()
              .describe(
                "The path to the license file to be included in the appropriate bundles.",
              ),
          ])
          .describe(
            "The path to the license file to be included in the appropriate bundles.",
          )
          .optional(),
        category: z
          .union([
            z
              .string()
              .describe(
                "The application kind.\n\nShould be one of the following: Business, DeveloperTool, Education, Entertainment, Finance, Game, ActionGame, AdventureGame, ArcadeGame, BoardGame, CardGame, CasinoGame, DiceGame, EducationalGame, FamilyGame, KidsGame, MusicGame, PuzzleGame, RacingGame, RolePlayingGame, SimulationGame, SportsGame, StrategyGame, TriviaGame, WordGame, GraphicsAndDesign, HealthcareAndFitness, Lifestyle, Medical, Music, News, Photography, Productivity, Reference, SocialNetworking, Sports, Travel, Utility, Video, Weather.",
              ),
            z
              .null()
              .describe(
                "The application kind.\n\nShould be one of the following: Business, DeveloperTool, Education, Entertainment, Finance, Game, ActionGame, AdventureGame, ArcadeGame, BoardGame, CardGame, CasinoGame, DiceGame, EducationalGame, FamilyGame, KidsGame, MusicGame, PuzzleGame, RacingGame, RolePlayingGame, SimulationGame, SportsGame, StrategyGame, TriviaGame, WordGame, GraphicsAndDesign, HealthcareAndFitness, Lifestyle, Medical, Music, News, Photography, Productivity, Reference, SocialNetworking, Sports, Travel, Utility, Video, Weather.",
              ),
          ])
          .describe(
            "The application kind.\n\nShould be one of the following: Business, DeveloperTool, Education, Entertainment, Finance, Game, ActionGame, AdventureGame, ArcadeGame, BoardGame, CardGame, CasinoGame, DiceGame, EducationalGame, FamilyGame, KidsGame, MusicGame, PuzzleGame, RacingGame, RolePlayingGame, SimulationGame, SportsGame, StrategyGame, TriviaGame, WordGame, GraphicsAndDesign, HealthcareAndFitness, Lifestyle, Medical, Music, News, Photography, Productivity, Reference, SocialNetworking, Sports, Travel, Utility, Video, Weather.",
          )
          .optional(),
        fileAssociations: z
          .union([
            z
              .array(
                z
                  .object({
                    ext: z
                      .array(
                        z
                          .string()
                          .describe(
                            "An extension for a [`FileAssociation`].\n\nA leading `.` is automatically stripped.",
                          ),
                      )
                      .describe(
                        "File extensions to associate with this app. e.g. 'png'",
                      ),
                    name: z
                      .union([
                        z
                          .string()
                          .describe(
                            "The name. Maps to `CFBundleTypeName` on macOS. Default to `ext[0]`",
                          ),
                        z
                          .null()
                          .describe(
                            "The name. Maps to `CFBundleTypeName` on macOS. Default to `ext[0]`",
                          ),
                      ])
                      .describe(
                        "The name. Maps to `CFBundleTypeName` on macOS. Default to `ext[0]`",
                      )
                      .optional(),
                    description: z
                      .union([
                        z
                          .string()
                          .describe(
                            "The association description. Windows-only. It is displayed on the `Type` column on Windows Explorer.",
                          ),
                        z
                          .null()
                          .describe(
                            "The association description. Windows-only. It is displayed on the `Type` column on Windows Explorer.",
                          ),
                      ])
                      .describe(
                        "The association description. Windows-only. It is displayed on the `Type` column on Windows Explorer.",
                      )
                      .optional(),
                    role: z
                      .any()
                      .superRefine((x, ctx) => {
                        const schemas = [
                          z
                            .literal("Editor")
                            .describe(
                              "CFBundleTypeRole.Editor. Files can be read and edited.",
                            ),
                          z
                            .literal("Viewer")
                            .describe(
                              "CFBundleTypeRole.Viewer. Files can be read.",
                            ),
                          z.literal("Shell").describe("CFBundleTypeRole.Shell"),
                          z
                            .literal("QLGenerator")
                            .describe("CFBundleTypeRole.QLGenerator"),
                          z.literal("None").describe("CFBundleTypeRole.None"),
                        ];
                        const errors = schemas.reduce(
                          (errors: z.ZodError[], schema) =>
                            ((result) =>
                              "error" in result
                                ? [...errors, result.error]
                                : errors)(schema.safeParse(x)),
                          [],
                        );
                        if (schemas.length - errors.length !== 1) {
                          ctx.addIssue({
                            path: ctx.path,
                            code: "invalid_union",
                            unionErrors: errors,
                            message: "Invalid input: Should pass single schema",
                          });
                        }
                      })
                      .describe("macOS-only. Corresponds to CFBundleTypeRole")
                      .describe(
                        "The app's role with respect to the type. Maps to `CFBundleTypeRole` on macOS.",
                      )
                      .default("Editor"),
                    mimeType: z
                      .union([
                        z
                          .string()
                          .describe(
                            "The mime-type e.g. 'image/png' or 'text/plain'. Linux-only.",
                          ),
                        z
                          .null()
                          .describe(
                            "The mime-type e.g. 'image/png' or 'text/plain'. Linux-only.",
                          ),
                      ])
                      .describe(
                        "The mime-type e.g. 'image/png' or 'text/plain'. Linux-only.",
                      )
                      .optional(),
                  })
                  .strict()
                  .describe("File association"),
              )
              .describe("File associations to application."),
            z.null().describe("File associations to application."),
          ])
          .describe("File associations to application.")
          .optional(),
        shortDescription: z
          .union([
            z.string().describe("A short description of your application."),
            z.null().describe("A short description of your application."),
          ])
          .describe("A short description of your application.")
          .optional(),
        longDescription: z
          .union([
            z
              .string()
              .describe("A longer, multi-line description of the application."),
            z
              .null()
              .describe("A longer, multi-line description of the application."),
          ])
          .describe("A longer, multi-line description of the application.")
          .optional(),
        externalBin: z
          .union([
            z
              .array(z.string())
              .describe(
                'A list of—either absolute or relative—paths to binaries to embed with your application.\n\nNote that Tauri will look for system-specific binaries following the pattern "binary-name{-target-triple}{.system-extension}".\n\nE.g. for the external binary "my-binary", Tauri looks for:\n\n- "my-binary-x86_64-pc-windows-msvc.exe" for Windows - "my-binary-x86_64-apple-darwin" for macOS - "my-binary-x86_64-unknown-linux-gnu" for Linux\n\nso don\'t forget to provide binaries for all targeted platforms.',
              ),
            z
              .null()
              .describe(
                'A list of—either absolute or relative—paths to binaries to embed with your application.\n\nNote that Tauri will look for system-specific binaries following the pattern "binary-name{-target-triple}{.system-extension}".\n\nE.g. for the external binary "my-binary", Tauri looks for:\n\n- "my-binary-x86_64-pc-windows-msvc.exe" for Windows - "my-binary-x86_64-apple-darwin" for macOS - "my-binary-x86_64-unknown-linux-gnu" for Linux\n\nso don\'t forget to provide binaries for all targeted platforms.',
              ),
          ])
          .describe(
            'A list of—either absolute or relative—paths to binaries to embed with your application.\n\nNote that Tauri will look for system-specific binaries following the pattern "binary-name{-target-triple}{.system-extension}".\n\nE.g. for the external binary "my-binary", Tauri looks for:\n\n- "my-binary-x86_64-pc-windows-msvc.exe" for Windows - "my-binary-x86_64-apple-darwin" for macOS - "my-binary-x86_64-unknown-linux-gnu" for Linux\n\nso don\'t forget to provide binaries for all targeted platforms.',
          )
          .optional(),
        windows: z
          .object({
            digestAlgorithm: z
              .union([
                z
                  .string()
                  .describe(
                    "Specifies the file digest algorithm to use for creating file signatures. Required for code signing. SHA-256 is recommended.",
                  ),
                z
                  .null()
                  .describe(
                    "Specifies the file digest algorithm to use for creating file signatures. Required for code signing. SHA-256 is recommended.",
                  ),
              ])
              .describe(
                "Specifies the file digest algorithm to use for creating file signatures. Required for code signing. SHA-256 is recommended.",
              )
              .optional(),
            certificateThumbprint: z
              .union([
                z
                  .string()
                  .describe(
                    "Specifies the SHA1 hash of the signing certificate.",
                  ),
                z
                  .null()
                  .describe(
                    "Specifies the SHA1 hash of the signing certificate.",
                  ),
              ])
              .describe("Specifies the SHA1 hash of the signing certificate.")
              .optional(),
            timestampUrl: z
              .union([
                z.string().describe("Server to use during timestamping."),
                z.null().describe("Server to use during timestamping."),
              ])
              .describe("Server to use during timestamping.")
              .optional(),
            tsp: z
              .boolean()
              .describe(
                "Whether to use Time-Stamp Protocol (TSP, a.k.a. RFC 3161) for the timestamp server. Your code signing provider may use a TSP timestamp server, like e.g. SSL.com does. If so, enable TSP by setting to true.",
              )
              .default(false),
            webviewInstallMode: z
              .any()
              .superRefine((x, ctx) => {
                const schemas = [
                  z
                    .object({ type: z.literal("skip") })
                    .strict()
                    .describe(
                      "Do not install the Webview2 as part of the Windows Installer.",
                    ),
                  z
                    .object({
                      type: z.literal("downloadBootstrapper"),
                      silent: z
                        .boolean()
                        .describe(
                          "Instructs the installer to run the bootstrapper in silent mode. Defaults to `true`.",
                        )
                        .default(true),
                    })
                    .strict()
                    .describe(
                      "Download the bootstrapper and run it. Requires an internet connection. Results in a smaller installer size, but is not recommended on Windows 7.",
                    ),
                  z
                    .object({
                      type: z.literal("embedBootstrapper"),
                      silent: z
                        .boolean()
                        .describe(
                          "Instructs the installer to run the bootstrapper in silent mode. Defaults to `true`.",
                        )
                        .default(true),
                    })
                    .strict()
                    .describe(
                      "Embed the bootstrapper and run it. Requires an internet connection. Increases the installer size by around 1.8MB, but offers better support on Windows 7.",
                    ),
                  z
                    .object({
                      type: z.literal("offlineInstaller"),
                      silent: z
                        .boolean()
                        .describe(
                          "Instructs the installer to run the installer in silent mode. Defaults to `true`.",
                        )
                        .default(true),
                    })
                    .strict()
                    .describe(
                      "Embed the offline installer and run it. Does not require an internet connection. Increases the installer size by around 127MB.",
                    ),
                  z
                    .object({
                      type: z.literal("fixedRuntime"),
                      path: z
                        .string()
                        .describe(
                          "The path to the fixed runtime to use.\n\nThe fixed version can be downloaded [on the official website](https://developer.microsoft.com/en-us/microsoft-edge/webview2/#download-section). The `.cab` file must be extracted to a folder and this folder path must be defined on this field.",
                        ),
                    })
                    .strict()
                    .describe(
                      "Embed a fixed webview2 version and use it at runtime. Increases the installer size by around 180MB.",
                    ),
                ];
                const errors = schemas.reduce(
                  (errors: z.ZodError[], schema) =>
                    ((result) =>
                      "error" in result ? [...errors, result.error] : errors)(
                      schema.safeParse(x),
                    ),
                  [],
                );
                if (schemas.length - errors.length !== 1) {
                  ctx.addIssue({
                    path: ctx.path,
                    code: "invalid_union",
                    unionErrors: errors,
                    message: "Invalid input: Should pass single schema",
                  });
                }
              })
              .describe(
                "Install modes for the Webview2 runtime. Note that for the updater bundle [`Self::DownloadBootstrapper`] is used.\n\nFor more information see <https://tauri.app/v1/guides/building/windows>.",
              )
              .describe("The installation mode for the Webview2 runtime.")
              .default({ silent: true, type: "downloadBootstrapper" }),
            webviewFixedRuntimePath: z
              .union([
                z
                  .string()
                  .describe(
                    "Path to the webview fixed runtime to use. Overwrites [`Self::webview_install_mode`] if set.\n\nWill be removed in v2, prefer the [`Self::webview_install_mode`] option.\n\nThe fixed version can be downloaded [on the official website](https://developer.microsoft.com/en-us/microsoft-edge/webview2/#download-section). The `.cab` file must be extracted to a folder and this folder path must be defined on this field.",
                  ),
                z
                  .null()
                  .describe(
                    "Path to the webview fixed runtime to use. Overwrites [`Self::webview_install_mode`] if set.\n\nWill be removed in v2, prefer the [`Self::webview_install_mode`] option.\n\nThe fixed version can be downloaded [on the official website](https://developer.microsoft.com/en-us/microsoft-edge/webview2/#download-section). The `.cab` file must be extracted to a folder and this folder path must be defined on this field.",
                  ),
              ])
              .describe(
                "Path to the webview fixed runtime to use. Overwrites [`Self::webview_install_mode`] if set.\n\nWill be removed in v2, prefer the [`Self::webview_install_mode`] option.\n\nThe fixed version can be downloaded [on the official website](https://developer.microsoft.com/en-us/microsoft-edge/webview2/#download-section). The `.cab` file must be extracted to a folder and this folder path must be defined on this field.",
              )
              .optional(),
            allowDowngrades: z
              .boolean()
              .describe(
                "Validates a second app installation, blocking the user from installing an older version if set to `false`.\n\nFor instance, if `1.2.1` is installed, the user won't be able to install app version `1.2.0` or `1.1.5`.\n\nThe default value of this flag is `true`.",
              )
              .default(true),
            wix: z
              .union([
                z
                  .object({
                    language: z
                      .union([
                        z
                          .string()
                          .describe(
                            "A single language to build, without configuration.",
                          ),
                        z
                          .array(z.string())
                          .describe(
                            "A list of languages to build, without configuration.",
                          ),
                        z
                          .record(
                            z
                              .object({
                                localePath: z
                                  .union([
                                    z
                                      .string()
                                      .describe(
                                        "The path to a locale (`.wxl`) file. See <https://wixtoolset.org/documentation/manual/v3/howtos/ui_and_localization/build_a_localized_version.html>.",
                                      ),
                                    z
                                      .null()
                                      .describe(
                                        "The path to a locale (`.wxl`) file. See <https://wixtoolset.org/documentation/manual/v3/howtos/ui_and_localization/build_a_localized_version.html>.",
                                      ),
                                  ])
                                  .describe(
                                    "The path to a locale (`.wxl`) file. See <https://wixtoolset.org/documentation/manual/v3/howtos/ui_and_localization/build_a_localized_version.html>.",
                                  )
                                  .optional(),
                              })
                              .strict()
                              .describe(
                                "Configuration for a target language for the WiX build.\n\nSee more: <https://tauri.app/v1/api/config#wixlanguageconfig>",
                              ),
                          )
                          .describe(
                            "A map of languages and its configuration.",
                          ),
                      ])
                      .describe("The languages to build using WiX.")
                      .describe(
                        "The installer languages to build. See <https://docs.microsoft.com/en-us/windows/win32/msi/localizing-the-error-and-actiontext-tables>.",
                      )
                      .default("en-US"),
                    template: z
                      .union([
                        z.string().describe("A custom .wxs template to use."),
                        z.null().describe("A custom .wxs template to use."),
                      ])
                      .describe("A custom .wxs template to use.")
                      .optional(),
                    fragmentPaths: z
                      .array(z.string())
                      .describe(
                        "A list of paths to .wxs files with WiX fragments to use.",
                      )
                      .default([]),
                    componentGroupRefs: z
                      .array(z.string())
                      .describe(
                        "The ComponentGroup element ids you want to reference from the fragments.",
                      )
                      .default([]),
                    componentRefs: z
                      .array(z.string())
                      .describe(
                        "The Component element ids you want to reference from the fragments.",
                      )
                      .default([]),
                    featureGroupRefs: z
                      .array(z.string())
                      .describe(
                        "The FeatureGroup element ids you want to reference from the fragments.",
                      )
                      .default([]),
                    featureRefs: z
                      .array(z.string())
                      .describe(
                        "The Feature element ids you want to reference from the fragments.",
                      )
                      .default([]),
                    mergeRefs: z
                      .array(z.string())
                      .describe(
                        "The Merge element ids you want to reference from the fragments.",
                      )
                      .default([]),
                    skipWebviewInstall: z
                      .boolean()
                      .describe(
                        "Disables the Webview2 runtime installation after app install.\n\nWill be removed in v2, prefer the [`WindowsConfig::webview_install_mode`] option.",
                      )
                      .default(false),
                    enableElevatedUpdateTask: z
                      .boolean()
                      .describe(
                        "Create an elevated update task within Windows Task Scheduler.",
                      )
                      .default(false),
                    bannerPath: z
                      .union([
                        z
                          .string()
                          .describe(
                            "Path to a bitmap file to use as the installation user interface banner. This bitmap will appear at the top of all but the first page of the installer.\n\nThe required dimensions are 493px × 58px.",
                          ),
                        z
                          .null()
                          .describe(
                            "Path to a bitmap file to use as the installation user interface banner. This bitmap will appear at the top of all but the first page of the installer.\n\nThe required dimensions are 493px × 58px.",
                          ),
                      ])
                      .describe(
                        "Path to a bitmap file to use as the installation user interface banner. This bitmap will appear at the top of all but the first page of the installer.\n\nThe required dimensions are 493px × 58px.",
                      )
                      .optional(),
                    dialogImagePath: z
                      .union([
                        z
                          .string()
                          .describe(
                            "Path to a bitmap file to use on the installation user interface dialogs. It is used on the welcome and completion dialogs. The required dimensions are 493px × 312px.",
                          ),
                        z
                          .null()
                          .describe(
                            "Path to a bitmap file to use on the installation user interface dialogs. It is used on the welcome and completion dialogs. The required dimensions are 493px × 312px.",
                          ),
                      ])
                      .describe(
                        "Path to a bitmap file to use on the installation user interface dialogs. It is used on the welcome and completion dialogs. The required dimensions are 493px × 312px.",
                      )
                      .optional(),
                  })
                  .strict()
                  .describe(
                    "Configuration for the MSI bundle using WiX.\n\nSee more: <https://tauri.app/v1/api/config#wixconfig>",
                  ),
                z.null(),
              ])
              .describe("Configuration for the MSI generated with WiX.")
              .optional(),
            nsis: z
              .union([
                z
                  .object({
                    template: z
                      .union([
                        z.string().describe("A custom .nsi template to use."),
                        z.null().describe("A custom .nsi template to use."),
                      ])
                      .describe("A custom .nsi template to use.")
                      .optional(),
                    headerImage: z
                      .union([
                        z
                          .string()
                          .describe(
                            "The path to a bitmap file to display on the header of installers pages.\n\nThe recommended dimensions are 150px x 57px.",
                          ),
                        z
                          .null()
                          .describe(
                            "The path to a bitmap file to display on the header of installers pages.\n\nThe recommended dimensions are 150px x 57px.",
                          ),
                      ])
                      .describe(
                        "The path to a bitmap file to display on the header of installers pages.\n\nThe recommended dimensions are 150px x 57px.",
                      )
                      .optional(),
                    sidebarImage: z
                      .union([
                        z
                          .string()
                          .describe(
                            "The path to a bitmap file for the Welcome page and the Finish page.\n\nThe recommended dimensions are 164px x 314px.",
                          ),
                        z
                          .null()
                          .describe(
                            "The path to a bitmap file for the Welcome page and the Finish page.\n\nThe recommended dimensions are 164px x 314px.",
                          ),
                      ])
                      .describe(
                        "The path to a bitmap file for the Welcome page and the Finish page.\n\nThe recommended dimensions are 164px x 314px.",
                      )
                      .optional(),
                    installerIcon: z
                      .union([
                        z
                          .string()
                          .describe(
                            "The path to an icon file used as the installer icon.",
                          ),
                        z
                          .null()
                          .describe(
                            "The path to an icon file used as the installer icon.",
                          ),
                      ])
                      .describe(
                        "The path to an icon file used as the installer icon.",
                      )
                      .optional(),
                    installMode: z
                      .any()
                      .superRefine((x, ctx) => {
                        const schemas = [
                          z
                            .literal("currentUser")
                            .describe(
                              "Default mode for the installer.\n\nInstall the app by default in a directory that doesn't require Administrator access.\n\nInstaller metadata will be saved under the `HKCU` registry path.",
                            ),
                          z
                            .literal("perMachine")
                            .describe(
                              "Install the app by default in the `Program Files` folder directory requires Administrator access for the installation.\n\nInstaller metadata will be saved under the `HKLM` registry path.",
                            ),
                          z
                            .literal("both")
                            .describe(
                              "Combines both modes and allows the user to choose at install time whether to install for the current user or per machine. Note that this mode will require Administrator access even if the user wants to install it for the current user only.\n\nInstaller metadata will be saved under the `HKLM` or `HKCU` registry path based on the user's choice.",
                            ),
                        ];
                        const errors = schemas.reduce(
                          (errors: z.ZodError[], schema) =>
                            ((result) =>
                              "error" in result
                                ? [...errors, result.error]
                                : errors)(schema.safeParse(x)),
                          [],
                        );
                        if (schemas.length - errors.length !== 1) {
                          ctx.addIssue({
                            path: ctx.path,
                            code: "invalid_union",
                            unionErrors: errors,
                            message: "Invalid input: Should pass single schema",
                          });
                        }
                      })
                      .describe("Install Modes for the NSIS installer.")
                      .describe(
                        "Whether the installation will be for all users or just the current user.",
                      )
                      .default("currentUser"),
                    languages: z
                      .union([
                        z
                          .array(z.string())
                          .describe(
                            "A list of installer languages. By default the OS language is used. If the OS language is not in the list of languages, the first language will be used. To allow the user to select the language, set `display_language_selector` to `true`.\n\nSee <https://github.com/kichik/nsis/tree/9465c08046f00ccb6eda985abbdbf52c275c6c4d/Contrib/Language%20files> for the complete list of languages.",
                          ),
                        z
                          .null()
                          .describe(
                            "A list of installer languages. By default the OS language is used. If the OS language is not in the list of languages, the first language will be used. To allow the user to select the language, set `display_language_selector` to `true`.\n\nSee <https://github.com/kichik/nsis/tree/9465c08046f00ccb6eda985abbdbf52c275c6c4d/Contrib/Language%20files> for the complete list of languages.",
                          ),
                      ])
                      .describe(
                        "A list of installer languages. By default the OS language is used. If the OS language is not in the list of languages, the first language will be used. To allow the user to select the language, set `display_language_selector` to `true`.\n\nSee <https://github.com/kichik/nsis/tree/9465c08046f00ccb6eda985abbdbf52c275c6c4d/Contrib/Language%20files> for the complete list of languages.",
                      )
                      .optional(),
                    customLanguageFiles: z
                      .union([
                        z
                          .record(z.string())
                          .describe(
                            "A key-value pair where the key is the language and the value is the path to a custom `.nsh` file that holds the translated text for tauri's custom messages.\n\nSee <https://github.com/tauri-apps/tauri/blob/dev/tooling/bundler/src/bundle/windows/templates/nsis-languages/English.nsh> for an example `.nsh` file.\n\n**Note**: the key must be a valid NSIS language and it must be added to [`NsisConfig`] languages array,",
                          ),
                        z
                          .null()
                          .describe(
                            "A key-value pair where the key is the language and the value is the path to a custom `.nsh` file that holds the translated text for tauri's custom messages.\n\nSee <https://github.com/tauri-apps/tauri/blob/dev/tooling/bundler/src/bundle/windows/templates/nsis-languages/English.nsh> for an example `.nsh` file.\n\n**Note**: the key must be a valid NSIS language and it must be added to [`NsisConfig`] languages array,",
                          ),
                      ])
                      .describe(
                        "A key-value pair where the key is the language and the value is the path to a custom `.nsh` file that holds the translated text for tauri's custom messages.\n\nSee <https://github.com/tauri-apps/tauri/blob/dev/tooling/bundler/src/bundle/windows/templates/nsis-languages/English.nsh> for an example `.nsh` file.\n\n**Note**: the key must be a valid NSIS language and it must be added to [`NsisConfig`] languages array,",
                      )
                      .optional(),
                    displayLanguageSelector: z
                      .boolean()
                      .describe(
                        "Whether to display a language selector dialog before the installer and uninstaller windows are rendered or not. By default the OS language is selected, with a fallback to the first language in the `languages` array.",
                      )
                      .default(false),
                    compression: z
                      .union([
                        z
                          .any()
                          .superRefine((x, ctx) => {
                            const schemas = [
                              z
                                .literal("zlib")
                                .describe(
                                  "ZLIB uses the deflate algorithm, it is a quick and simple method. With the default compression level it uses about 300 KB of memory.",
                                ),
                              z
                                .literal("bzip2")
                                .describe(
                                  "BZIP2 usually gives better compression ratios than ZLIB, but it is a bit slower and uses more memory. With the default compression level it uses about 4 MB of memory.",
                                ),
                              z
                                .literal("lzma")
                                .describe(
                                  "LZMA (default) is a new compression method that gives very good compression ratios. The decompression speed is high (10-20 MB/s on a 2 GHz CPU), the compression speed is lower. The memory size that will be used for decompression is the dictionary size plus a few KBs, the default is 8 MB.",
                                ),
                            ];
                            const errors = schemas.reduce(
                              (errors: z.ZodError[], schema) =>
                                ((result) =>
                                  "error" in result
                                    ? [...errors, result.error]
                                    : errors)(schema.safeParse(x)),
                              [],
                            );
                            if (schemas.length - errors.length !== 1) {
                              ctx.addIssue({
                                path: ctx.path,
                                code: "invalid_union",
                                unionErrors: errors,
                                message:
                                  "Invalid input: Should pass single schema",
                              });
                            }
                          })
                          .describe(
                            "Compression algorithms used in the NSIS installer.\n\nSee <https://nsis.sourceforge.io/Reference/SetCompressor>",
                          ),
                        z.null(),
                      ])
                      .describe(
                        "Set the compression algorithm used to compress files in the installer.\n\nSee <https://nsis.sourceforge.io/Reference/SetCompressor>",
                      )
                      .optional(),
                  })
                  .strict()
                  .describe(
                    "Configuration for the Installer bundle using NSIS.",
                  ),
                z.null(),
              ])
              .describe("Configuration for the installer generated with NSIS.")
              .optional(),
          })
          .strict()
          .describe(
            "Windows bundler configuration.\n\nSee more: <https://tauri.app/v1/api/config#windowsconfig>",
          )
          .describe("Configuration for the Windows bundles.")
          .default({
            allowDowngrades: true,
            certificateThumbprint: null,
            digestAlgorithm: null,
            nsis: null,
            timestampUrl: null,
            tsp: false,
            webviewFixedRuntimePath: null,
            webviewInstallMode: { silent: true, type: "downloadBootstrapper" },
            wix: null,
          }),
        linux: z
          .object({
            appimage: z
              .object({
                bundleMediaFramework: z
                  .boolean()
                  .describe(
                    "Include additional gstreamer dependencies needed for audio and video playback. This increases the bundle size by ~15-35MB depending on your build system.",
                  )
                  .default(false),
                files: z
                  .record(z.string())
                  .describe("The files to include in the Appimage Binary.")
                  .default({}),
              })
              .strict()
              .describe(
                "Configuration for AppImage bundles.\n\nSee more: <https://tauri.app/v1/api/config#appimageconfig>",
              )
              .describe("Configuration for the AppImage bundle.")
              .default({ bundleMediaFramework: false, files: {} }),
            deb: z
              .object({
                depends: z
                  .union([
                    z
                      .array(z.string())
                      .describe(
                        "The list of deb dependencies your application relies on.",
                      ),
                    z
                      .null()
                      .describe(
                        "The list of deb dependencies your application relies on.",
                      ),
                  ])
                  .describe(
                    "The list of deb dependencies your application relies on.",
                  )
                  .optional(),
                files: z
                  .record(z.string())
                  .describe("The files to include on the package.")
                  .default({}),
                desktopTemplate: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Path to a custom desktop file Handlebars template.\n\nAvailable variables: `categories`, `comment` (optional), `exec`, `icon` and `name`.",
                      ),
                    z
                      .null()
                      .describe(
                        "Path to a custom desktop file Handlebars template.\n\nAvailable variables: `categories`, `comment` (optional), `exec`, `icon` and `name`.",
                      ),
                  ])
                  .describe(
                    "Path to a custom desktop file Handlebars template.\n\nAvailable variables: `categories`, `comment` (optional), `exec`, `icon` and `name`.",
                  )
                  .optional(),
                section: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Define the section in Debian Control file. See : https://www.debian.org/doc/debian-policy/ch-archive.html#s-subsections",
                      ),
                    z
                      .null()
                      .describe(
                        "Define the section in Debian Control file. See : https://www.debian.org/doc/debian-policy/ch-archive.html#s-subsections",
                      ),
                  ])
                  .describe(
                    "Define the section in Debian Control file. See : https://www.debian.org/doc/debian-policy/ch-archive.html#s-subsections",
                  )
                  .optional(),
                priority: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Change the priority of the Debian Package. By default, it is set to `optional`. Recognized Priorities as of now are :  `required`, `important`, `standard`, `optional`, `extra`",
                      ),
                    z
                      .null()
                      .describe(
                        "Change the priority of the Debian Package. By default, it is set to `optional`. Recognized Priorities as of now are :  `required`, `important`, `standard`, `optional`, `extra`",
                      ),
                  ])
                  .describe(
                    "Change the priority of the Debian Package. By default, it is set to `optional`. Recognized Priorities as of now are :  `required`, `important`, `standard`, `optional`, `extra`",
                  )
                  .optional(),
                changelog: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Path of the uncompressed Changelog file, to be stored at /usr/share/doc/package-name/changelog.gz. See https://www.debian.org/doc/debian-policy/ch-docs.html#changelog-files-and-release-notes",
                      ),
                    z
                      .null()
                      .describe(
                        "Path of the uncompressed Changelog file, to be stored at /usr/share/doc/package-name/changelog.gz. See https://www.debian.org/doc/debian-policy/ch-docs.html#changelog-files-and-release-notes",
                      ),
                  ])
                  .describe(
                    "Path of the uncompressed Changelog file, to be stored at /usr/share/doc/package-name/changelog.gz. See https://www.debian.org/doc/debian-policy/ch-docs.html#changelog-files-and-release-notes",
                  )
                  .optional(),
              })
              .strict()
              .describe(
                "Configuration for Debian (.deb) bundles.\n\nSee more: <https://tauri.app/v1/api/config#debconfig>",
              )
              .describe("Configuration for the Debian bundle.")
              .default({ files: {} }),
            rpm: z
              .object({
                depends: z
                  .union([
                    z
                      .array(z.string())
                      .describe(
                        "The list of RPM dependencies your application relies on.",
                      ),
                    z
                      .null()
                      .describe(
                        "The list of RPM dependencies your application relies on.",
                      ),
                  ])
                  .describe(
                    "The list of RPM dependencies your application relies on.",
                  )
                  .optional(),
                release: z
                  .string()
                  .describe("The RPM release tag.")
                  .default("1"),
                epoch: z
                  .number()
                  .int()
                  .gte(0)
                  .describe("The RPM epoch.")
                  .default(0),
                files: z
                  .record(z.string())
                  .describe("The files to include on the package.")
                  .default({}),
                desktopTemplate: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Path to a custom desktop file Handlebars template.\n\nAvailable variables: `categories`, `comment` (optional), `exec`, `icon` and `name`.",
                      ),
                    z
                      .null()
                      .describe(
                        "Path to a custom desktop file Handlebars template.\n\nAvailable variables: `categories`, `comment` (optional), `exec`, `icon` and `name`.",
                      ),
                  ])
                  .describe(
                    "Path to a custom desktop file Handlebars template.\n\nAvailable variables: `categories`, `comment` (optional), `exec`, `icon` and `name`.",
                  )
                  .optional(),
              })
              .strict()
              .describe("Configuration for RPM bundles.")
              .describe("Configuration for the RPM bundle.")
              .default({ epoch: 0, files: {}, release: "1" }),
          })
          .strict()
          .describe(
            "Configuration for Linux bundles.\n\nSee more: <https://tauri.app/v1/api/config#linuxconfig>",
          )
          .describe("Configuration for the Linux bundles.")
          .default({
            appimage: { bundleMediaFramework: false, files: {} },
            deb: { files: {} },
            rpm: { epoch: 0, files: {}, release: "1" },
          }),
        macOS: z
          .object({
            frameworks: z
              .union([
                z
                  .array(z.string())
                  .describe(
                    'A list of strings indicating any macOS X frameworks that need to be bundled with the application.\n\nIf a name is used, ".framework" must be omitted and it will look for standard install locations. You may also use a path to a specific framework.',
                  ),
                z
                  .null()
                  .describe(
                    'A list of strings indicating any macOS X frameworks that need to be bundled with the application.\n\nIf a name is used, ".framework" must be omitted and it will look for standard install locations. You may also use a path to a specific framework.',
                  ),
              ])
              .describe(
                'A list of strings indicating any macOS X frameworks that need to be bundled with the application.\n\nIf a name is used, ".framework" must be omitted and it will look for standard install locations. You may also use a path to a specific framework.',
              )
              .optional(),
            files: z
              .record(z.string())
              .describe(
                "The files to include in the application relative to the Contents directory.",
              )
              .default({}),
            minimumSystemVersion: z
              .union([
                z
                  .string()
                  .describe(
                    "A version string indicating the minimum macOS X version that the bundled application supports. Defaults to `10.13`.\n\nSetting it to `null` completely removes the `LSMinimumSystemVersion` field on the bundle's `Info.plist` and the `MACOSX_DEPLOYMENT_TARGET` environment variable.\n\nAn empty string is considered an invalid value so the default value is used.",
                  )
                  .default("10.13"),
                z
                  .null()
                  .describe(
                    "A version string indicating the minimum macOS X version that the bundled application supports. Defaults to `10.13`.\n\nSetting it to `null` completely removes the `LSMinimumSystemVersion` field on the bundle's `Info.plist` and the `MACOSX_DEPLOYMENT_TARGET` environment variable.\n\nAn empty string is considered an invalid value so the default value is used.",
                  )
                  .default("10.13"),
              ])
              .describe(
                "A version string indicating the minimum macOS X version that the bundled application supports. Defaults to `10.13`.\n\nSetting it to `null` completely removes the `LSMinimumSystemVersion` field on the bundle's `Info.plist` and the `MACOSX_DEPLOYMENT_TARGET` environment variable.\n\nAn empty string is considered an invalid value so the default value is used.",
              )
              .default("10.13"),
            exceptionDomain: z
              .union([
                z
                  .string()
                  .describe(
                    "Allows your application to communicate with the outside world. It should be a lowercase, without port and protocol domain name.",
                  ),
                z
                  .null()
                  .describe(
                    "Allows your application to communicate with the outside world. It should be a lowercase, without port and protocol domain name.",
                  ),
              ])
              .describe(
                "Allows your application to communicate with the outside world. It should be a lowercase, without port and protocol domain name.",
              )
              .optional(),
            signingIdentity: z
              .union([
                z.string().describe("Identity to use for code signing."),
                z.null().describe("Identity to use for code signing."),
              ])
              .describe("Identity to use for code signing.")
              .optional(),
            providerShortName: z
              .union([
                z.string().describe("Provider short name for notarization."),
                z.null().describe("Provider short name for notarization."),
              ])
              .describe("Provider short name for notarization.")
              .optional(),
            entitlements: z
              .union([
                z.string().describe("Path to the entitlements file."),
                z.null().describe("Path to the entitlements file."),
              ])
              .describe("Path to the entitlements file.")
              .optional(),
            dmg: z
              .object({
                background: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Image to use as the background in dmg file. Accepted formats: `png`/`jpg`/`gif`.",
                      ),
                    z
                      .null()
                      .describe(
                        "Image to use as the background in dmg file. Accepted formats: `png`/`jpg`/`gif`.",
                      ),
                  ])
                  .describe(
                    "Image to use as the background in dmg file. Accepted formats: `png`/`jpg`/`gif`.",
                  )
                  .optional(),
                windowPosition: z
                  .union([
                    z
                      .object({
                        x: z.number().int().gte(0).describe("X coordinate."),
                        y: z.number().int().gte(0).describe("Y coordinate."),
                      })
                      .strict()
                      .describe("Position coordinates struct."),
                    z.null(),
                  ])
                  .describe("Position of volume window on screen.")
                  .optional(),
                windowSize: z
                  .object({
                    width: z
                      .number()
                      .int()
                      .gte(0)
                      .describe("Width of the window."),
                    height: z
                      .number()
                      .int()
                      .gte(0)
                      .describe("Height of the window."),
                  })
                  .strict()
                  .describe("Size of the window.")
                  .describe("Size of volume window.")
                  .default({ height: 400, width: 660 }),
                appPosition: z
                  .object({
                    x: z.number().int().gte(0).describe("X coordinate."),
                    y: z.number().int().gte(0).describe("Y coordinate."),
                  })
                  .strict()
                  .describe("Position coordinates struct.")
                  .describe("Position of app file on window.")
                  .default({ x: 180, y: 170 }),
                applicationFolderPosition: z
                  .object({
                    x: z.number().int().gte(0).describe("X coordinate."),
                    y: z.number().int().gte(0).describe("Y coordinate."),
                  })
                  .strict()
                  .describe("Position coordinates struct.")
                  .describe("Position of application folder on window.")
                  .default({ x: 480, y: 170 }),
              })
              .strict()
              .describe(
                "Configuration for Apple Disk Image (.dmg) bundles.\n\nSee more: <https://tauri.app/v1/api/config#dmgconfig>",
              )
              .describe("DMG-specific settings.")
              .default({
                appPosition: { x: 180, y: 170 },
                applicationFolderPosition: { x: 480, y: 170 },
                windowSize: { height: 400, width: 660 },
              }),
          })
          .strict()
          .describe(
            "Configuration for the macOS bundles.\n\nSee more: <https://tauri.app/v1/api/config#macconfig>",
          )
          .describe("Configuration for the macOS bundles.")
          .default({
            dmg: {
              appPosition: { x: 180, y: 170 },
              applicationFolderPosition: { x: 480, y: 170 },
              windowSize: { height: 400, width: 660 },
            },
            files: {},
            minimumSystemVersion: "10.13",
          }),
        iOS: z
          .object({
            developmentTeam: z
              .union([
                z
                  .string()
                  .describe(
                    "The development team. This value is required for iOS development because code signing is enforced. The `APPLE_DEVELOPMENT_TEAM` environment variable can be set to overwrite it.",
                  ),
                z
                  .null()
                  .describe(
                    "The development team. This value is required for iOS development because code signing is enforced. The `APPLE_DEVELOPMENT_TEAM` environment variable can be set to overwrite it.",
                  ),
              ])
              .describe(
                "The development team. This value is required for iOS development because code signing is enforced. The `APPLE_DEVELOPMENT_TEAM` environment variable can be set to overwrite it.",
              )
              .optional(),
          })
          .strict()
          .describe("General configuration for the iOS target.")
          .describe("iOS configuration.")
          .default({}),
        android: z
          .object({
            minSdkVersion: z
              .number()
              .int()
              .gte(0)
              .describe(
                "The minimum API level required for the application to run. The Android system will prevent the user from installing the application if the system's API level is lower than the value specified.",
              )
              .default(24),
          })
          .strict()
          .describe("General configuration for the iOS target.")
          .describe("Android configuration.")
          .default({ minSdkVersion: 24 }),
      })
      .strict()
      .describe(
        "Configuration for tauri-bundler.\n\nSee more: <https://tauri.app/v1/api/config#bundleconfig>",
      )
      .describe("The bundler configuration.")
      .default({
        active: false,
        android: { minSdkVersion: 24 },
        iOS: {},
        icon: [],
        linux: {
          appimage: { bundleMediaFramework: false, files: {} },
          deb: { files: {} },
          rpm: { epoch: 0, files: {}, release: "1" },
        },
        macOS: {
          dmg: {
            appPosition: { x: 180, y: 170 },
            applicationFolderPosition: { x: 480, y: 170 },
            windowSize: { height: 400, width: 660 },
          },
          files: {},
          minimumSystemVersion: "10.13",
        },
        targets: "all",
        windows: {
          allowDowngrades: true,
          certificateThumbprint: null,
          digestAlgorithm: null,
          nsis: null,
          timestampUrl: null,
          tsp: false,
          webviewFixedRuntimePath: null,
          webviewInstallMode: { silent: true, type: "downloadBootstrapper" },
          wix: null,
        },
      }),
    plugins: z
      .record(z.any())
      .describe(
        "The plugin configs holds a HashMap mapping a plugin name to its configuration object.\n\nSee more: <https://tauri.app/v1/api/config#pluginconfig>",
      )
      .describe("The plugins config.")
      .default({}),
  })
  .strict()
  .describe(
    'The Tauri configuration object. It is read from a file where you can define your frontend assets, configure the bundler and define a tray icon.\n\nThe configuration file is generated by the [`tauri init`](https://tauri.app/v1/api/cli#init) command that lives in your Tauri application source directory (src-tauri).\n\nOnce generated, you may modify it at will to customize your Tauri application.\n\n## File Formats\n\nBy default, the configuration is defined as a JSON file named `tauri.conf.json`.\n\nTauri also supports JSON5 and TOML files via the `config-json5` and `config-toml` Cargo features, respectively. The JSON5 file name must be either `tauri.conf.json` or `tauri.conf.json5`. The TOML file name is `Tauri.toml`.\n\n## Platform-Specific Configuration\n\nIn addition to the default configuration file, Tauri can read a platform-specific configuration from `tauri.linux.conf.json`, `tauri.windows.conf.json`, `tauri.macos.conf.json`, `tauri.android.conf.json` and `tauri.ios.conf.json` (or `Tauri.linux.toml`, `Tauri.windows.toml`, `Tauri.macos.toml`, `Tauri.android.toml` and `Tauri.ios.toml` if the `Tauri.toml` format is used), which gets merged with the main configuration object.\n\n## Configuration Structure\n\nThe configuration is composed of the following objects:\n\n- [`app`](#appconfig): The Tauri configuration - [`build`](#buildconfig): The build configuration - [`bundle`](#bundleconfig): The bundle configurations - [`plugins`](#pluginconfig): The plugins configuration\n\n```json title="Example tauri.config.json file" { "productName": "tauri-app", "version": "0.1.0" "build": { "beforeBuildCommand": "", "beforeDevCommand": "", "devUrl": "../dist", "frontendDist": "../dist" }, "app": { "security": { "csp": null }, "windows": [ { "fullscreen": false, "height": 600, "resizable": true, "title": "Tauri App", "width": 800 } ] }, "bundle": {}, "plugins": {} } ```',
  );
