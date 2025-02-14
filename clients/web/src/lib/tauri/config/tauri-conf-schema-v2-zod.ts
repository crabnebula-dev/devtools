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
    mainBinaryName: z
      .union([
        z
          .string()
          .describe(
            "App main binary filename. Defaults to the name of your cargo crate.",
          ),
        z
          .null()
          .describe(
            "App main binary filename. Defaults to the name of your cargo crate.",
          ),
      ])
      .describe(
        "App main binary filename. Defaults to the name of your cargo crate.",
      )
      .optional(),
    version: z
      .union([
        z
          .string()
          .describe(
            "App version. It is a semver version number or a path to a `package.json` file containing the `version` field. If removed the version number from `Cargo.toml` is used.\n\n By default version 1.0 is used on Android.",
          ),
        z
          .null()
          .describe(
            "App version. It is a semver version number or a path to a `package.json` file containing the `version` field. If removed the version number from `Cargo.toml` is used.\n\n By default version 1.0 is used on Android.",
          ),
      ])
      .describe(
        "App version. It is a semver version number or a path to a `package.json` file containing the `version` field. If removed the version number from `Cargo.toml` is used.\n\n By default version 1.0 is used on Android.",
      )
      .optional(),
    identifier: z
      .string()
      .describe(
        "The application identifier in reverse domain name notation (e.g. `com.tauri.example`).\n This string must be unique across applications since it is used in system configurations like\n the bundle ID and path to the webview data directory.\n This string must contain only alphanumeric characters (A-Z, a-z, and 0-9), hyphens (-),\n and periods (.).",
      ),
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
                create: z
                  .boolean()
                  .describe(
                    "Whether Tauri should create this window at app startup or not.\n\n When this is set to `false` you must manually grab the config object via `app.config().app.windows`\n and create it with [`WebviewWindowBuilder::from_config`](https://docs.rs/tauri/2.0.0-rc/tauri/webview/struct.WebviewWindowBuilder.html#method.from_config).",
                  )
                  .default(true),
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
                        "The path portion of an app URL.\n For instance, to load `tauri://localhost/users/john`,\n you can simply provide `users/john` in this configuration.",
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
                dragDropEnabled: z
                  .boolean()
                  .describe(
                    "Whether the drag and drop is enabled or not on the webview. By default it is enabled.\n\n Disabling it is required to use HTML5 drag and drop on the frontend on Windows.",
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
                    'Whether the window\'s native maximize button is enabled or not.\n If resizable is set to false, this setting is ignored.\n\n ## Platform-specific\n\n - **macOS:** Disables the "zoom" button in the window titlebar, which is also used to enter fullscreen mode.\n - **Linux / iOS / Android:** Unsupported.',
                  )
                  .default(true),
                minimizable: z
                  .boolean()
                  .describe(
                    "Whether the window's native minimize button is enabled or not.\n\n ## Platform-specific\n\n - **Linux / iOS / Android:** Unsupported.",
                  )
                  .default(true),
                closable: z
                  .boolean()
                  .describe(
                    'Whether the window\'s native close button is enabled or not.\n\n ## Platform-specific\n\n - **Linux:** "GTK+ will do its best to convince the window manager not to show a close button.\n   Depending on the system, this function may not have any effect when called on a window that is already visible"\n - **iOS / Android:** Unsupported.',
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
                    "Whether the window is transparent or not.\n\n Note that on `macOS` this requires the `macos-private-api` feature flag, enabled under `tauri > macOSPrivateApi`.\n WARNING: Using private APIs on `macOS` prevents your application from being accepted to the `App Store`.",
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
                    "Whether the window should be visible on all workspaces or virtual desktops.\n\n ## Platform-specific\n\n - **Windows / iOS / Android:** Unsupported.",
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
                windowClassname: z
                  .union([
                    z
                      .string()
                      .describe(
                        "The name of the window class created on Windows to create the window. **Windows only**.",
                      ),
                    z
                      .null()
                      .describe(
                        "The name of the window class created on Windows to create the window. **Windows only**.",
                      ),
                  ])
                  .describe(
                    "The name of the window class created on Windows to create the window. **Windows only**.",
                  )
                  .optional(),
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
                          "Makes the title bar transparent, so the window background color is shown instead.\n\n Useful if you don't need to have actual HTML under the title bar. This lets you avoid the caveats of using `TitleBarStyle::Overlay`. Will be more useful when Tauri lets you set a custom window background color.",
                        ),
                      z
                        .literal("Overlay")
                        .describe(
                          "Shows the title bar as a transparent overlay over the window's content.\n\n Keep in mind:\n - The height of the title bar is different on different OS versions, which can lead to window the controls and title not being where you don't expect.\n - You need to define a custom drag region to make your window draggable, however due to a limitation you can't drag the window when it's not in focus <https://github.com/tauri-apps/tauri/issues/4316>.\n - The color of the window title depends on the system theme.",
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
                        "Defines the window [tabbing identifier] for macOS.\n\n Windows with matching tabbing identifiers will be grouped together.\n If the tabbing identifier is not set, automatic tabbing will be disabled.\n\n [tabbing identifier]: <https://developer.apple.com/documentation/appkit/nswindow/1644704-tabbingidentifier>",
                      ),
                    z
                      .null()
                      .describe(
                        "Defines the window [tabbing identifier] for macOS.\n\n Windows with matching tabbing identifiers will be grouped together.\n If the tabbing identifier is not set, automatic tabbing will be disabled.\n\n [tabbing identifier]: <https://developer.apple.com/documentation/appkit/nswindow/1644704-tabbingidentifier>",
                      ),
                  ])
                  .describe(
                    "Defines the window [tabbing identifier] for macOS.\n\n Windows with matching tabbing identifiers will be grouped together.\n If the tabbing identifier is not set, automatic tabbing will be disabled.\n\n [tabbing identifier]: <https://developer.apple.com/documentation/appkit/nswindow/1644704-tabbingidentifier>",
                  )
                  .optional(),
                additionalBrowserArgs: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Defines additional browser arguments on Windows. By default wry passes `--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection`\n so if you use this method, you also need to disable these components by yourself if you want.",
                      ),
                    z
                      .null()
                      .describe(
                        "Defines additional browser arguments on Windows. By default wry passes `--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection`\n so if you use this method, you also need to disable these components by yourself if you want.",
                      ),
                  ])
                  .describe(
                    "Defines additional browser arguments on Windows. By default wry passes `--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection`\n so if you use this method, you also need to disable these components by yourself if you want.",
                  )
                  .optional(),
                shadow: z
                  .boolean()
                  .describe(
                    "Whether or not the window has shadow.\n\n ## Platform-specific\n\n - **Windows:**\n   - `false` has no effect on decorated window, shadow are always ON.\n   - `true` will make undecorated window have a 1px white border,\n and on Windows 11, it will have a rounded corners.\n - **Linux:** Unsupported.",
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
                                    .describe("**macOS 10.14-**"),
                                  z
                                    .literal("dark")
                                    .describe("**macOS 10.14-**"),
                                  z
                                    .literal("mediumLight")
                                    .describe("**macOS 10.14-**"),
                                  z
                                    .literal("ultraDark")
                                    .describe("**macOS 10.14-**"),
                                  z
                                    .literal("titlebar")
                                    .describe("**macOS 10.10+**"),
                                  z
                                    .literal("selection")
                                    .describe("**macOS 10.10+**"),
                                  z
                                    .literal("menu")
                                    .describe("**macOS 10.11+**"),
                                  z
                                    .literal("popover")
                                    .describe("**macOS 10.11+**"),
                                  z
                                    .literal("sidebar")
                                    .describe("**macOS 10.11+**"),
                                  z
                                    .literal("headerView")
                                    .describe("**macOS 10.14+**"),
                                  z
                                    .literal("sheet")
                                    .describe("**macOS 10.14+**"),
                                  z
                                    .literal("windowBackground")
                                    .describe("**macOS 10.14+**"),
                                  z
                                    .literal("hudWindow")
                                    .describe("**macOS 10.14+**"),
                                  z
                                    .literal("fullScreenUI")
                                    .describe("**macOS 10.14+**"),
                                  z
                                    .literal("tooltip")
                                    .describe("**macOS 10.14+**"),
                                  z
                                    .literal("contentBackground")
                                    .describe("**macOS 10.14+**"),
                                  z
                                    .literal("underWindowBackground")
                                    .describe("**macOS 10.14+**"),
                                  z
                                    .literal("underPageBackground")
                                    .describe("**macOS 10.14+**"),
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
                                      "**Windows 7/10/11(22H1) Only**\n\n ## Notes\n\n This effect has bad performance when resizing/dragging the window on Windows 11 build 22621.",
                                    ),
                                  z
                                    .literal("acrylic")
                                    .describe(
                                      "**Windows 10/11 Only**\n\n ## Notes\n\n This effect has bad performance when resizing/dragging the window on Windows 10 v1903+ and Windows 11 build 22000.",
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
                            "List of Window effects to apply to the Window.\n Conflicting effects will apply the first one and ignore the rest.",
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
                                "Window effect state **macOS only**\n\n <https://developer.apple.com/documentation/appkit/nsvisualeffectview/state>",
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
                            z.union([
                              z
                                .string()
                                .regex(
                                  new RegExp(
                                    "^#?([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$",
                                  ),
                                )
                                .describe(
                                  "Color hex string, for example: #fff, #ffffff, or #ffffffff.",
                                ),
                              z
                                .tuple([
                                  z.number().int().gte(0),
                                  z.number().int().gte(0),
                                  z.number().int().gte(0),
                                ])
                                .describe(
                                  "Array of RGB colors. Each value has minimum of 0 and maximum of 255.",
                                ),
                              z
                                .tuple([
                                  z.number().int().gte(0),
                                  z.number().int().gte(0),
                                  z.number().int().gte(0),
                                  z.number().int().gte(0),
                                ])
                                .describe(
                                  "Array of RGBA colors. Each value has minimum of 0 and maximum of 255.",
                                ),
                              z
                                .object({
                                  red: z.number().int().gte(0),
                                  green: z.number().int().gte(0),
                                  blue: z.number().int().gte(0),
                                  alpha: z.number().int().gte(0).default(255),
                                })
                                .describe(
                                  "Object of red, green, blue, alpha color values. Each value has minimum of 0 and maximum of 255.",
                                ),
                            ]),
                            z.null(),
                          ])
                          .describe(
                            "Window effect color. Affects [`WindowEffect::Blur`] and [`WindowEffect::Acrylic`] only\n on Windows 10 v1903+. Doesn't have any effect on Windows 7 or Windows 11.",
                          )
                          .optional(),
                      })
                      .strict()
                      .describe("The window effects configuration object"),
                    z.null(),
                  ])
                  .describe(
                    "Window effects.\n\n Requires the window to be transparent.\n\n ## Platform-specific:\n\n - **Windows**: If using decorations or shadows, you may want to try this workaround <https://github.com/tauri-apps/tao/issues/72#issuecomment-975607891>\n - **Linux**: Unsupported",
                  )
                  .optional(),
                incognito: z
                  .boolean()
                  .describe(
                    "Whether or not the webview should be launched in incognito  mode.\n\n  ## Platform-specific:\n\n  - **Android**: Unsupported.",
                  )
                  .default(false),
                parent: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Sets the window associated with this label to be the parent of the window to be created.\n\n ## Platform-specific\n\n - **Windows**: This sets the passed parent as an owner window to the window to be created.\n   From [MSDN owned windows docs](https://docs.microsoft.com/en-us/windows/win32/winmsg/window-features#owned-windows):\n     - An owned window is always above its owner in the z-order.\n     - The system automatically destroys an owned window when its owner is destroyed.\n     - An owned window is hidden when its owner is minimized.\n - **Linux**: This makes the new window transient for parent, see <https://docs.gtk.org/gtk3/method.Window.set_transient_for.html>\n - **macOS**: This adds the window as a child of parent, see <https://developer.apple.com/documentation/appkit/nswindow/1419152-addchildwindow?language=objc>",
                      ),
                    z
                      .null()
                      .describe(
                        "Sets the window associated with this label to be the parent of the window to be created.\n\n ## Platform-specific\n\n - **Windows**: This sets the passed parent as an owner window to the window to be created.\n   From [MSDN owned windows docs](https://docs.microsoft.com/en-us/windows/win32/winmsg/window-features#owned-windows):\n     - An owned window is always above its owner in the z-order.\n     - The system automatically destroys an owned window when its owner is destroyed.\n     - An owned window is hidden when its owner is minimized.\n - **Linux**: This makes the new window transient for parent, see <https://docs.gtk.org/gtk3/method.Window.set_transient_for.html>\n - **macOS**: This adds the window as a child of parent, see <https://developer.apple.com/documentation/appkit/nswindow/1419152-addchildwindow?language=objc>",
                      ),
                  ])
                  .describe(
                    "Sets the window associated with this label to be the parent of the window to be created.\n\n ## Platform-specific\n\n - **Windows**: This sets the passed parent as an owner window to the window to be created.\n   From [MSDN owned windows docs](https://docs.microsoft.com/en-us/windows/win32/winmsg/window-features#owned-windows):\n     - An owned window is always above its owner in the z-order.\n     - The system automatically destroys an owned window when its owner is destroyed.\n     - An owned window is hidden when its owner is minimized.\n - **Linux**: This makes the new window transient for parent, see <https://docs.gtk.org/gtk3/method.Window.set_transient_for.html>\n - **macOS**: This adds the window as a child of parent, see <https://developer.apple.com/documentation/appkit/nswindow/1419152-addchildwindow?language=objc>",
                  )
                  .optional(),
                proxyUrl: z
                  .union([
                    z
                      .string()
                      .url()
                      .describe(
                        "The proxy URL for the WebView for all network requests.\n\n Must be either a `http://` or a `socks5://` URL.\n\n ## Platform-specific\n\n - **macOS**: Requires the `macos-proxy` feature flag and only compiles for macOS 14+.",
                      ),
                    z
                      .null()
                      .describe(
                        "The proxy URL for the WebView for all network requests.\n\n Must be either a `http://` or a `socks5://` URL.\n\n ## Platform-specific\n\n - **macOS**: Requires the `macos-proxy` feature flag and only compiles for macOS 14+.",
                      ),
                  ])
                  .describe(
                    "The proxy URL for the WebView for all network requests.\n\n Must be either a `http://` or a `socks5://` URL.\n\n ## Platform-specific\n\n - **macOS**: Requires the `macos-proxy` feature flag and only compiles for macOS 14+.",
                  )
                  .optional(),
                zoomHotkeysEnabled: z
                  .boolean()
                  .describe(
                    "Whether page zooming by hotkeys is enabled\n\n ## Platform-specific:\n\n - **Windows**: Controls WebView2's [`IsZoomControlEnabled`](https://learn.microsoft.com/en-us/microsoft-edge/webview2/reference/winrt/microsoft_web_webview2_core/corewebview2settings?view=webview2-winrt-1.0.2420.47#iszoomcontrolenabled) setting.\n - **MacOS / Linux**: Injects a polyfill that zooms in and out with `ctrl/command` + `-/=`,\n 20% in each step, ranging from 20% to 1000%. Requires `webview:allow-set-webview-zoom` permission\n\n - **Android / iOS**: Unsupported.",
                  )
                  .default(false),
                browserExtensionsEnabled: z
                  .boolean()
                  .describe(
                    "Whether browser extensions can be installed for the webview process\n\n ## Platform-specific:\n\n - **Windows**: Enables the WebView2 environment's [`AreBrowserExtensionsEnabled`](https://learn.microsoft.com/en-us/microsoft-edge/webview2/reference/winrt/microsoft_web_webview2_core/corewebview2environmentoptions?view=webview2-winrt-1.0.2739.15#arebrowserextensionsenabled)\n - **MacOS / Linux / iOS / Android** - Unsupported.",
                  )
                  .default(false),
                useHttpsScheme: z
                  .boolean()
                  .describe(
                    "Sets whether the custom protocols should use `https://<scheme>.localhost` instead of the default `http://<scheme>.localhost` on Windows and Android. Defaults to `false`.\n\n ## Note\n\n Using a `https` scheme will NOT allow mixed content when trying to fetch `http` endpoints and therefore will not match the behavior of the `<scheme>://localhost` protocols used on macOS and Linux.\n\n ## Warning\n\n Changing this value between releases will change the IndexedDB, cookies and localstorage location and your app will not be able to access the old data.",
                  )
                  .default(false),
                devtools: z
                  .union([
                    z
                      .boolean()
                      .describe(
                        "Enable web inspector which is usually called browser devtools. Enabled by default.\n\n This API works in **debug** builds, but requires `devtools` feature flag to enable it in **release** builds.\n\n ## Platform-specific\n\n - macOS: This will call private functions on **macOS**.\n - Android: Open `chrome://inspect/#devices` in Chrome to get the devtools window. Wry's `WebView` devtools API isn't supported on Android.\n - iOS: Open Safari > Develop > [Your Device Name] > [Your WebView] to get the devtools window.",
                      ),
                    z
                      .null()
                      .describe(
                        "Enable web inspector which is usually called browser devtools. Enabled by default.\n\n This API works in **debug** builds, but requires `devtools` feature flag to enable it in **release** builds.\n\n ## Platform-specific\n\n - macOS: This will call private functions on **macOS**.\n - Android: Open `chrome://inspect/#devices` in Chrome to get the devtools window. Wry's `WebView` devtools API isn't supported on Android.\n - iOS: Open Safari > Develop > [Your Device Name] > [Your WebView] to get the devtools window.",
                      ),
                  ])
                  .describe(
                    "Enable web inspector which is usually called browser devtools. Enabled by default.\n\n This API works in **debug** builds, but requires `devtools` feature flag to enable it in **release** builds.\n\n ## Platform-specific\n\n - macOS: This will call private functions on **macOS**.\n - Android: Open `chrome://inspect/#devices` in Chrome to get the devtools window. Wry's `WebView` devtools API isn't supported on Android.\n - iOS: Open Safari > Develop > [Your Device Name] > [Your WebView] to get the devtools window.",
                  )
                  .optional(),
                backgroundColor: z
                  .union([
                    z.union([
                      z
                        .string()
                        .regex(
                          new RegExp(
                            "^#?([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$",
                          ),
                        )
                        .describe(
                          "Color hex string, for example: #fff, #ffffff, or #ffffffff.",
                        ),
                      z
                        .tuple([
                          z.number().int().gte(0),
                          z.number().int().gte(0),
                          z.number().int().gte(0),
                        ])
                        .describe(
                          "Array of RGB colors. Each value has minimum of 0 and maximum of 255.",
                        ),
                      z
                        .tuple([
                          z.number().int().gte(0),
                          z.number().int().gte(0),
                          z.number().int().gte(0),
                          z.number().int().gte(0),
                        ])
                        .describe(
                          "Array of RGBA colors. Each value has minimum of 0 and maximum of 255.",
                        ),
                      z
                        .object({
                          red: z.number().int().gte(0),
                          green: z.number().int().gte(0),
                          blue: z.number().int().gte(0),
                          alpha: z.number().int().gte(0).default(255),
                        })
                        .describe(
                          "Object of red, green, blue, alpha color values. Each value has minimum of 0 and maximum of 255.",
                        ),
                    ]),
                    z.null(),
                  ])
                  .describe(
                    "Set the window and webview background color.\n\n ## Platform-specific:\n\n - **Windows**: alpha channel is ignored for the window layer.\n - **Windows**: On Windows 7, alpha channel is ignored for the webview layer.\n - **Windows**: On Windows 8 and newer, if alpha channel is not `0`, it will be ignored for the webview layer.",
                  )
                  .optional(),
                backgroundThrottling: z
                  .union([
                    z
                      .any()
                      .superRefine((x, ctx) => {
                        const schemas = [
                          z
                            .literal("disabled")
                            .describe(
                              "A policy where background throttling is disabled",
                            ),
                          z
                            .literal("suspend")
                            .describe(
                              "A policy where a web view that’s not in a window fully suspends tasks. This is usually the default behavior in case no policy is set.",
                            ),
                          z
                            .literal("throttle")
                            .describe(
                              "A policy where a web view that’s not in a window limits processing, but does not fully suspend tasks.",
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
                      .describe("Background throttling policy."),
                    z.null(),
                  ])
                  .describe(
                    "Change the default background throttling behaviour.\n\n By default, browsers use a suspend policy that will throttle timers and even unload\n the whole tab (view) to free resources after roughly 5 minutes when a view became\n minimized or hidden. This will pause all tasks until the documents visibility state\n changes back from hidden to visible by bringing the view back to the foreground.\n\n ## Platform-specific\n\n - **Linux / Windows / Android**: Unsupported. Workarounds like a pending WebLock transaction might suffice.\n - **iOS**: Supported since version 17.0+.\n - **macOS**: Supported since version 14.0+.\n\n see https://github.com/tauri-apps/tauri/issues/5250#issuecomment-2569380578",
                  )
                  .optional(),
              })
              .strict()
              .describe(
                "The window configuration object.\n\n See more: <https://v2.tauri.app/reference/config/#windowconfig>",
              ),
          )
          .describe("The app windows configuration.")
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
                            "A Content-Security-Policy directive source list.\n See <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#sources>.",
                          ),
                      )
                      .describe(
                        "An object mapping a directive with its sources values as a list of strings.",
                      ),
                  ])
                  .describe(
                    "A Content-Security-Policy definition.\n See <https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP>.",
                  ),
                z.null(),
              ])
              .describe(
                "The Content Security Policy that will be injected on all HTML files on the built application.\n If [`dev_csp`](#SecurityConfig.devCsp) is not specified, this value is also injected on dev.\n\n This is a really important part of the configuration since it helps you ensure your WebView is secured.\n See <https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP>.",
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
                            "A Content-Security-Policy directive source list.\n See <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#sources>.",
                          ),
                      )
                      .describe(
                        "An object mapping a directive with its sources values as a list of strings.",
                      ),
                  ])
                  .describe(
                    "A Content-Security-Policy definition.\n See <https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP>.",
                  ),
                z.null(),
              ])
              .describe(
                "The Content Security Policy that will be injected on all HTML files on development.\n\n This is a really important part of the configuration since it helps you ensure your WebView is secured.\n See <https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP>.",
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
                    "If `true`, disables all CSP modification.\n `false` is the default value and it configures Tauri to control the CSP.",
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
                "Disables the Tauri-injected CSP sources.\n\n At compile time, Tauri parses all the frontend assets and changes the Content-Security-Policy\n to only allow loading of your own scripts and styles by injecting nonce and hash sources.\n This stricts your CSP, which may introduce issues when using along with other flexing sources.\n\n This configuration option allows both a boolean and a list of strings as value.\n A boolean instructs Tauri to disable the injection for all CSP injections,\n and a list of strings indicates the CSP directives that Tauri cannot inject.\n\n **WARNING:** Only disable this if you know what you are doing and have properly configured the CSP.\n Your application might be vulnerable to XSS attacks without this Tauri protection.",
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
                            "A list of paths that are not allowed by this scope.\n This gets precedence over the [`Self::Scope::allow`] list.",
                          )
                          .default([]),
                        requireLiteralLeadingDot: z
                          .union([
                            z
                              .boolean()
                              .describe(
                                "Whether or not paths that contain components that start with a `.`\n will require that `.` appears literally in the pattern; `*`, `?`, `**`,\n or `[...]` will not match. This is useful because such files are\n conventionally considered hidden on Unix systems and it might be\n desirable to skip them when listing files.\n\n Defaults to `true` on Unix systems and `false` on Windows",
                              ),
                            z
                              .null()
                              .describe(
                                "Whether or not paths that contain components that start with a `.`\n will require that `.` appears literally in the pattern; `*`, `?`, `**`,\n or `[...]` will not match. This is useful because such files are\n conventionally considered hidden on Unix systems and it might be\n desirable to skip them when listing files.\n\n Defaults to `true` on Unix systems and `false` on Windows",
                              ),
                          ])
                          .describe(
                            "Whether or not paths that contain components that start with a `.`\n will require that `.` appears literally in the pattern; `*`, `?`, `**`,\n or `[...]` will not match. This is useful because such files are\n conventionally considered hidden on Unix systems and it might be\n desirable to skip them when listing files.\n\n Defaults to `true` on Unix systems and `false` on Windows",
                          )
                          .optional(),
                      })
                      .describe("A complete scope configuration."),
                  ])
                  .describe(
                    "Protocol scope definition.\n It is a list of glob patterns that restrict the API access from the webview.\n\n Each pattern can start with a variable that resolves to a system base directory.\n The variables are: `$AUDIO`, `$CACHE`, `$CONFIG`, `$DATA`, `$LOCALDATA`, `$DESKTOP`,\n `$DOCUMENT`, `$DOWNLOAD`, `$EXE`, `$FONT`, `$HOME`, `$PICTURE`, `$PUBLIC`, `$RUNTIME`,\n `$TEMPLATE`, `$VIDEO`, `$RESOURCE`, `$APP`, `$LOG`, `$TEMP`, `$APPCONFIG`, `$APPDATA`,\n `$APPLOCALDATA`, `$APPCACHE`, `$APPLOG`.",
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
                "Config for the asset custom protocol.\n\n See more: <https://v2.tauri.app/reference/config/#assetprotocolconfig>",
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
                          .describe(
                            "Identifier of the capability.\n\n ## Example\n\n `main-user-files-write`",
                          ),
                        description: z
                          .string()
                          .describe(
                            "Description of what the capability is intended to allow on associated windows.\n\n It should contain a description of what the grouped permissions should allow.\n\n ## Example\n\n This capability allows the `main` window access to `filesystem` write related\n commands and `dialog` commands to enable programatic access to files selected by the user.",
                          )
                          .default(""),
                        remote: z
                          .union([
                            z
                              .object({
                                urls: z
                                  .array(z.string())
                                  .describe(
                                    'Remote domains this capability refers to using the [URLPattern standard](https://urlpattern.spec.whatwg.org/).\n\n ## Examples\n\n - "https://*.mydomain.dev": allows subdomains of mydomain.dev\n - "https://mydomain.dev/api/*": allows any subpath of mydomain.dev/api',
                                  ),
                              })
                              .describe(
                                "Configuration for remote URLs that are associated with the capability.",
                              ),
                            z.null(),
                          ])
                          .describe(
                            'Configure remote URLs that can use the capability permissions.\n\n This setting is optional and defaults to not being set, as our\n default use case is that the content is served from our local application.\n\n :::caution\n Make sure you understand the security implications of providing remote\n sources with local system access.\n :::\n\n ## Example\n\n ```json\n {\n   "urls": ["https://*.mydomain.dev"]\n }\n ```',
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
                            'List of windows that are affected by this capability. Can be a glob pattern.\n\n On multiwebview windows, prefer [`Self::webviews`] for a fine grained access control.\n\n ## Example\n\n `["main"]`',
                          )
                          .optional(),
                        webviews: z
                          .array(z.string())
                          .describe(
                            'List of webviews that are affected by this capability. Can be a glob pattern.\n\n This is only required when using on multiwebview contexts, by default\n all child webviews of a window that matches [`Self::windows`] are linked.\n\n ## Example\n\n `["sub-webview-one", "sub-webview-two"]`',
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
                                            "Data that defines what is denied by the scope. This should be prioritized by validation logic.",
                                          ),
                                        z
                                          .null()
                                          .describe(
                                            "Data that defines what is denied by the scope. This should be prioritized by validation logic.",
                                          ),
                                      ])
                                      .describe(
                                        "Data that defines what is denied by the scope. This should be prioritized by validation logic.",
                                      )
                                      .optional(),
                                  })
                                  .describe(
                                    "Reference a permission or permission set by identifier and extends its scope.",
                                  ),
                              ])
                              .describe(
                                "An entry for a permission value in a [`Capability`] can be either a raw permission [`Identifier`]\n or an object that references a permission and extends its scope.",
                              ),
                          )
                          .describe(
                            'List of permissions attached to this capability.\n\n Must include the plugin name as prefix in the form of `${plugin-name}:${permission-name}`.\n For commands directly implemented in the application itself only `${permission-name}`\n is required.\n\n ## Example\n\n ```json\n [\n   "core:default",\n   "shell:allow-open",\n   "dialog:open",\n   {\n     "identifier": "fs:allow-write-text-file",\n     "allow": [{ "path": "$HOME/test.txt" }]\n   }\n ]\n ```',
                          ),
                        platforms: z
                          .union([
                            z
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
                                'Limit which target platforms this capability applies to.\n\n By default all platforms are targeted.\n\n ## Example\n\n `["macOS","windows"]`',
                              ),
                            z
                              .null()
                              .describe(
                                'Limit which target platforms this capability applies to.\n\n By default all platforms are targeted.\n\n ## Example\n\n `["macOS","windows"]`',
                              ),
                          ])
                          .describe(
                            'Limit which target platforms this capability applies to.\n\n By default all platforms are targeted.\n\n ## Example\n\n `["macOS","windows"]`',
                          )
                          .optional(),
                      })
                      .describe(
                        'A grouping and boundary mechanism developers can use to isolate access to the IPC layer.\n\n It controls application windows fine grained access to the Tauri core, application, or plugin commands.\n If a window is not matching any capability then it has no access to the IPC layer at all.\n\n This can be done to create groups of windows, based on their required system access, which can reduce\n impact of frontend vulnerabilities in less privileged windows.\n Windows can be added to a capability by exact name (e.g. `main-window`) or glob patterns like `*` or `admin-*`.\n A Window can have none, one, or multiple associated capabilities.\n\n ## Example\n\n ```json\n {\n   "identifier": "main-user-files-write",\n   "description": "This capability allows the `main` window on macOS and Windows access to `filesystem` write related commands and `dialog` commands to enable programatic access to files selected by the user.",\n   "windows": [\n     "main"\n   ],\n   "permissions": [\n     "core:default",\n     "dialog:open",\n     {\n       "identifier": "fs:allow-write-text-file",\n       "allow": [{ "path": "$HOME/test.txt" }]\n     },\n   ],\n   "platforms": ["macOS","windows"]\n }\n ```',
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
                "List of capabilities that are enabled on the application.\n\n If the list is empty, all capabilities are included.",
              )
              .default([]),
            headers: z
              .union([
                z
                  .object({
                    "Access-Control-Allow-Credentials": z
                      .union([
                        z
                          .union([
                            z
                              .string()
                              .describe("string version of the header Value"),
                            z
                              .array(z.string())
                              .describe(
                                'list version of the header value. Item are joined by "," for the real header value',
                              ),
                            z
                              .record(z.string())
                              .describe(
                                '(Rust struct | Json | JavaScript Object) equivalent of the header value. Items are composed from: key + space + value. Item are then joined by ";" for the real header value',
                              ),
                          ])
                          .describe(
                            "definition of a header source\n\n The header value to a header name",
                          ),
                        z.null(),
                      ])
                      .describe(
                        "The Access-Control-Allow-Credentials response header tells browsers whether the\n server allows cross-origin HTTP requests to include credentials.\n\n See <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials>",
                      )
                      .optional(),
                    "Access-Control-Allow-Headers": z
                      .union([
                        z
                          .union([
                            z
                              .string()
                              .describe("string version of the header Value"),
                            z
                              .array(z.string())
                              .describe(
                                'list version of the header value. Item are joined by "," for the real header value',
                              ),
                            z
                              .record(z.string())
                              .describe(
                                '(Rust struct | Json | JavaScript Object) equivalent of the header value. Items are composed from: key + space + value. Item are then joined by ";" for the real header value',
                              ),
                          ])
                          .describe(
                            "definition of a header source\n\n The header value to a header name",
                          ),
                        z.null(),
                      ])
                      .describe(
                        "The Access-Control-Allow-Headers response header is used in response\n to a preflight request which includes the Access-Control-Request-Headers\n to indicate which HTTP headers can be used during the actual request.\n\n This header is required if the request has an Access-Control-Request-Headers header.\n\n See <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers>",
                      )
                      .optional(),
                    "Access-Control-Allow-Methods": z
                      .union([
                        z
                          .union([
                            z
                              .string()
                              .describe("string version of the header Value"),
                            z
                              .array(z.string())
                              .describe(
                                'list version of the header value. Item are joined by "," for the real header value',
                              ),
                            z
                              .record(z.string())
                              .describe(
                                '(Rust struct | Json | JavaScript Object) equivalent of the header value. Items are composed from: key + space + value. Item are then joined by ";" for the real header value',
                              ),
                          ])
                          .describe(
                            "definition of a header source\n\n The header value to a header name",
                          ),
                        z.null(),
                      ])
                      .describe(
                        "The Access-Control-Allow-Methods response header specifies one or more methods\n allowed when accessing a resource in response to a preflight request.\n\n See <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Methods>",
                      )
                      .optional(),
                    "Access-Control-Expose-Headers": z
                      .union([
                        z
                          .union([
                            z
                              .string()
                              .describe("string version of the header Value"),
                            z
                              .array(z.string())
                              .describe(
                                'list version of the header value. Item are joined by "," for the real header value',
                              ),
                            z
                              .record(z.string())
                              .describe(
                                '(Rust struct | Json | JavaScript Object) equivalent of the header value. Items are composed from: key + space + value. Item are then joined by ";" for the real header value',
                              ),
                          ])
                          .describe(
                            "definition of a header source\n\n The header value to a header name",
                          ),
                        z.null(),
                      ])
                      .describe(
                        "The Access-Control-Expose-Headers response header allows a server to indicate\n which response headers should be made available to scripts running in the browser,\n in response to a cross-origin request.\n\n See <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers>",
                      )
                      .optional(),
                    "Access-Control-Max-Age": z
                      .union([
                        z
                          .union([
                            z
                              .string()
                              .describe("string version of the header Value"),
                            z
                              .array(z.string())
                              .describe(
                                'list version of the header value. Item are joined by "," for the real header value',
                              ),
                            z
                              .record(z.string())
                              .describe(
                                '(Rust struct | Json | JavaScript Object) equivalent of the header value. Items are composed from: key + space + value. Item are then joined by ";" for the real header value',
                              ),
                          ])
                          .describe(
                            "definition of a header source\n\n The header value to a header name",
                          ),
                        z.null(),
                      ])
                      .describe(
                        "The Access-Control-Max-Age response header indicates how long the results of a\n preflight request (that is the information contained in the\n Access-Control-Allow-Methods and Access-Control-Allow-Headers headers) can\n be cached.\n\n See <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Max-Age>",
                      )
                      .optional(),
                    "Cross-Origin-Embedder-Policy": z
                      .union([
                        z
                          .union([
                            z
                              .string()
                              .describe("string version of the header Value"),
                            z
                              .array(z.string())
                              .describe(
                                'list version of the header value. Item are joined by "," for the real header value',
                              ),
                            z
                              .record(z.string())
                              .describe(
                                '(Rust struct | Json | JavaScript Object) equivalent of the header value. Items are composed from: key + space + value. Item are then joined by ";" for the real header value',
                              ),
                          ])
                          .describe(
                            "definition of a header source\n\n The header value to a header name",
                          ),
                        z.null(),
                      ])
                      .describe(
                        "The HTTP Cross-Origin-Embedder-Policy (COEP) response header configures embedding\n cross-origin resources into the document.\n\n See <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy>",
                      )
                      .optional(),
                    "Cross-Origin-Opener-Policy": z
                      .union([
                        z
                          .union([
                            z
                              .string()
                              .describe("string version of the header Value"),
                            z
                              .array(z.string())
                              .describe(
                                'list version of the header value. Item are joined by "," for the real header value',
                              ),
                            z
                              .record(z.string())
                              .describe(
                                '(Rust struct | Json | JavaScript Object) equivalent of the header value. Items are composed from: key + space + value. Item are then joined by ";" for the real header value',
                              ),
                          ])
                          .describe(
                            "definition of a header source\n\n The header value to a header name",
                          ),
                        z.null(),
                      ])
                      .describe(
                        "The HTTP Cross-Origin-Opener-Policy (COOP) response header allows you to ensure a\n top-level document does not share a browsing context group with cross-origin documents.\n COOP will process-isolate your document and potential attackers can't access your global\n object if they were to open it in a popup, preventing a set of cross-origin attacks dubbed XS-Leaks.\n\n See <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy>",
                      )
                      .optional(),
                    "Cross-Origin-Resource-Policy": z
                      .union([
                        z
                          .union([
                            z
                              .string()
                              .describe("string version of the header Value"),
                            z
                              .array(z.string())
                              .describe(
                                'list version of the header value. Item are joined by "," for the real header value',
                              ),
                            z
                              .record(z.string())
                              .describe(
                                '(Rust struct | Json | JavaScript Object) equivalent of the header value. Items are composed from: key + space + value. Item are then joined by ";" for the real header value',
                              ),
                          ])
                          .describe(
                            "definition of a header source\n\n The header value to a header name",
                          ),
                        z.null(),
                      ])
                      .describe(
                        "The HTTP Cross-Origin-Resource-Policy response header conveys a desire that the\n browser blocks no-cors cross-origin/cross-site requests to the given resource.\n\n See <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy>",
                      )
                      .optional(),
                    "Permissions-Policy": z
                      .union([
                        z
                          .union([
                            z
                              .string()
                              .describe("string version of the header Value"),
                            z
                              .array(z.string())
                              .describe(
                                'list version of the header value. Item are joined by "," for the real header value',
                              ),
                            z
                              .record(z.string())
                              .describe(
                                '(Rust struct | Json | JavaScript Object) equivalent of the header value. Items are composed from: key + space + value. Item are then joined by ";" for the real header value',
                              ),
                          ])
                          .describe(
                            "definition of a header source\n\n The header value to a header name",
                          ),
                        z.null(),
                      ])
                      .describe(
                        "The HTTP Permissions-Policy header provides a mechanism to allow and deny the\n use of browser features in a document or within any \\<iframe\\> elements in the document.\n\n See <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy>",
                      )
                      .optional(),
                    "Timing-Allow-Origin": z
                      .union([
                        z
                          .union([
                            z
                              .string()
                              .describe("string version of the header Value"),
                            z
                              .array(z.string())
                              .describe(
                                'list version of the header value. Item are joined by "," for the real header value',
                              ),
                            z
                              .record(z.string())
                              .describe(
                                '(Rust struct | Json | JavaScript Object) equivalent of the header value. Items are composed from: key + space + value. Item are then joined by ";" for the real header value',
                              ),
                          ])
                          .describe(
                            "definition of a header source\n\n The header value to a header name",
                          ),
                        z.null(),
                      ])
                      .describe(
                        "The Timing-Allow-Origin response header specifies origins that are allowed to see values\n of attributes retrieved via features of the Resource Timing API, which would otherwise be\n reported as zero due to cross-origin restrictions.\n\n See <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Timing-Allow-Origin>",
                      )
                      .optional(),
                    "X-Content-Type-Options": z
                      .union([
                        z
                          .union([
                            z
                              .string()
                              .describe("string version of the header Value"),
                            z
                              .array(z.string())
                              .describe(
                                'list version of the header value. Item are joined by "," for the real header value',
                              ),
                            z
                              .record(z.string())
                              .describe(
                                '(Rust struct | Json | JavaScript Object) equivalent of the header value. Items are composed from: key + space + value. Item are then joined by ";" for the real header value',
                              ),
                          ])
                          .describe(
                            "definition of a header source\n\n The header value to a header name",
                          ),
                        z.null(),
                      ])
                      .describe(
                        "The X-Content-Type-Options response HTTP header is a marker used by the server to indicate\n that the MIME types advertised in the Content-Type headers should be followed and not be\n changed. The header allows you to avoid MIME type sniffing by saying that the MIME types\n are deliberately configured.\n\n See <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options>",
                      )
                      .optional(),
                    "Tauri-Custom-Header": z
                      .union([
                        z
                          .union([
                            z
                              .string()
                              .describe("string version of the header Value"),
                            z
                              .array(z.string())
                              .describe(
                                'list version of the header value. Item are joined by "," for the real header value',
                              ),
                            z
                              .record(z.string())
                              .describe(
                                '(Rust struct | Json | JavaScript Object) equivalent of the header value. Items are composed from: key + space + value. Item are then joined by ";" for the real header value',
                              ),
                          ])
                          .describe(
                            "definition of a header source\n\n The header value to a header name",
                          ),
                        z.null(),
                      ])
                      .describe(
                        "A custom header field Tauri-Custom-Header, don't use it.\n Remember to set Access-Control-Expose-Headers accordingly\n\n **NOT INTENDED FOR PRODUCTION USE**",
                      )
                      .optional(),
                  })
                  .strict()
                  .describe(
                    'A struct, where the keys are some specific http header names.\n If the values to those keys are defined, then they will be send as part of a response message.\n This does not include error messages and ipc messages\n\n ## Example configuration\n ```javascript\n {\n  //..\n   app:{\n     //..\n     security: {\n       headers: {\n         "Cross-Origin-Opener-Policy": "same-origin",\n         "Cross-Origin-Embedder-Policy": "require-corp",\n         "Timing-Allow-Origin": [\n           "https://developer.mozilla.org",\n           "https://example.com",\n         ],\n         "Access-Control-Expose-Headers": "Tauri-Custom-Header",\n         "Tauri-Custom-Header": {\n           "key1": "\'value1\' \'value2\'",\n           "key2": "\'value3\'"\n         }\n       },\n       csp: "default-src \'self\'; connect-src ipc: http://ipc.localhost",\n     }\n     //..\n   }\n  //..\n }\n ```\n In this example `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` are set to allow for the use of [`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer).\n The result is, that those headers are then set on every response sent via the `get_response` function in crates/tauri/src/protocol/tauri.rs.\n The Content-Security-Policy header is defined separately, because it is also handled separately.\n\n For the helloworld example, this config translates into those response headers:\n ```http\n access-control-allow-origin:  http://tauri.localhost\n access-control-expose-headers: Tauri-Custom-Header\n content-security-policy: default-src \'self\'; connect-src ipc: http://ipc.localhost; script-src \'self\' \'sha256-Wjjrs6qinmnr+tOry8x8PPwI77eGpUFR3EEGZktjJNs=\'\n content-type: text/html\n cross-origin-embedder-policy: require-corp\n cross-origin-opener-policy: same-origin\n tauri-custom-header: key1 \'value1\' \'value2\'; key2 \'value3\'\n timing-allow-origin: https://developer.mozilla.org, https://example.com\n ```\n Since the resulting header values are always \'string-like\'. So depending on the what data type the HeaderSource is, they need to be converted.\n  - `String`(JS/Rust): stay the same for the resulting header value\n  - `Array`(JS)/`Vec\\<String\\>`(Rust): Item are joined by ", " for the resulting header value\n  - `Object`(JS)/ `Hashmap\\<String,String\\>`(Rust): Items are composed from: key + space + value. Item are then joined by "; " for the resulting header value',
                  ),
                z.null(),
              ])
              .describe(
                "The headers, which are added to every http response from tauri to the web view\n This doesn't include IPC Messages and error responses",
              )
              .optional(),
          })
          .strict()
          .describe(
            "Security configuration.\n\n See more: <https://v2.tauri.app/reference/config/#securityconfig>",
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
                    "Path to the default icon to use for the tray icon.\n\n Note: this stores the image in raw pixels to the final binary,\n so keep the icon size (width and height) small\n or else it's going to bloat your final executable",
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
                    "A Boolean value that determines whether the menu should appear when the tray icon receives a left click.\n\n ## Platform-specific:\n\n - **Linux**: Unsupported.",
                  )
                  .default(true),
                showMenuOnLeftClick: z
                  .boolean()
                  .describe(
                    "A Boolean value that determines whether the menu should appear when the tray icon receives a left click.\n\n ## Platform-specific:\n\n - **Linux**: Unsupported.",
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
                "Configuration for application tray icon.\n\n See more: <https://v2.tauri.app/reference/config/#trayiconconfig>",
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
        enableGTKAppId: z
          .boolean()
          .describe(
            'If set to true "identifier" will be set as GTK app ID (on systems that use GTK).',
          )
          .default(false),
      })
      .strict()
      .describe(
        "The App configuration object.\n\n See more: <https://v2.tauri.app/reference/config/#appconfig>",
      )
      .describe("The App configuration.")
      .default({
        enableGTKAppId: false,
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
                "The URL to load in development.\n\n This is usually an URL to a dev server, which serves your application assets with hot-reload and HMR.\n Most modern JavaScript bundlers like [vite](https://vitejs.dev/guide/) provides a way to start a dev server by default.\n\n If you don't have a dev server or don't want to use one, ignore this option and use [`frontendDist`](BuildConfig::frontend_dist)\n and point to a web assets directory, and Tauri CLI will run its built-in dev server and provide a simple hot-reload experience.",
              ),
            z
              .null()
              .describe(
                "The URL to load in development.\n\n This is usually an URL to a dev server, which serves your application assets with hot-reload and HMR.\n Most modern JavaScript bundlers like [vite](https://vitejs.dev/guide/) provides a way to start a dev server by default.\n\n If you don't have a dev server or don't want to use one, ignore this option and use [`frontendDist`](BuildConfig::frontend_dist)\n and point to a web assets directory, and Tauri CLI will run its built-in dev server and provide a simple hot-reload experience.",
              ),
          ])
          .describe(
            "The URL to load in development.\n\n This is usually an URL to a dev server, which serves your application assets with hot-reload and HMR.\n Most modern JavaScript bundlers like [vite](https://vitejs.dev/guide/) provides a way to start a dev server by default.\n\n If you don't have a dev server or don't want to use one, ignore this option and use [`frontendDist`](BuildConfig::frontend_dist)\n and point to a web assets directory, and Tauri CLI will run its built-in dev server and provide a simple hot-reload experience.",
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
            "The path to the application assets (usually the `dist` folder of your javascript bundler)\n or a URL that could be either a custom protocol registered in the tauri app (for example: `myprotocol://`)\n or a remote URL (for example: `https://site.com/app`).\n\n When a path relative to the configuration file is provided,\n it is read recursively and all files are embedded in the application binary.\n Tauri then looks for an `index.html` and serves it as the default entry point for your application.\n\n You can also provide a list of paths to be embedded, which allows granular control over what files are added to the binary.\n In this case, all files are added to the root and you must reference it that way in your HTML files.\n\n When a URL is provided, the application won't have bundled assets\n and the application will load that URL by default.",
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
            "A shell command to run before `tauri dev` kicks in.\n\n The TAURI_ENV_PLATFORM, TAURI_ENV_ARCH, TAURI_ENV_FAMILY, TAURI_ENV_PLATFORM_VERSION, TAURI_ENV_PLATFORM_TYPE and TAURI_ENV_DEBUG environment variables are set if you perform conditional compilation.",
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
            "A shell command to run before `tauri build` kicks in.\n\n The TAURI_ENV_PLATFORM, TAURI_ENV_ARCH, TAURI_ENV_FAMILY, TAURI_ENV_PLATFORM_VERSION, TAURI_ENV_PLATFORM_TYPE and TAURI_ENV_DEBUG environment variables are set if you perform conditional compilation.",
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
            "A shell command to run before the bundling phase in `tauri build` kicks in.\n\n The TAURI_ENV_PLATFORM, TAURI_ENV_ARCH, TAURI_ENV_FAMILY, TAURI_ENV_PLATFORM_VERSION, TAURI_ENV_PLATFORM_TYPE and TAURI_ENV_DEBUG environment variables are set if you perform conditional compilation.",
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
        "The Build configuration object.\n\n See more: <https://v2.tauri.app/reference/config/#buildconfig>",
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
            'The bundle targets, currently supports ["deb", "rpm", "appimage", "nsis", "msi", "app", "dmg"] or "all".',
          )
          .default("all"),
        createUpdaterArtifacts: z
          .union([
            z
              .literal("v1Compatible")
              .describe("Generates legacy zipped v1 compatible updaters")
              .describe("Generates legacy zipped v1 compatible updaters")
              .describe("Generates legacy zipped v1 compatible updaters"),
            z
              .boolean()
              .describe("Produce updaters and their signatures or not"),
          ])
          .describe("Updater type")
          .describe("Produce updaters and their signatures or not")
          .default(false),
        publisher: z
          .union([
            z
              .string()
              .describe(
                "The application's publisher. Defaults to the second element in the identifier string.\n\n Currently maps to the Manufacturer property of the Windows Installer\n and the Maintainer field of debian packages if the Cargo.toml does not have the authors field.",
              ),
            z
              .null()
              .describe(
                "The application's publisher. Defaults to the second element in the identifier string.\n\n Currently maps to the Manufacturer property of the Windows Installer\n and the Maintainer field of debian packages if the Cargo.toml does not have the authors field.",
              ),
          ])
          .describe(
            "The application's publisher. Defaults to the second element in the identifier string.\n\n Currently maps to the Manufacturer property of the Windows Installer\n and the Maintainer field of debian packages if the Cargo.toml does not have the authors field.",
          )
          .optional(),
        homepage: z
          .union([
            z
              .string()
              .describe(
                "A url to the home page of your application. If unset, will\n fallback to `homepage` defined in `Cargo.toml`.\n\n Supported bundle targets: `deb`, `rpm`, `nsis` and `msi`.",
              ),
            z
              .null()
              .describe(
                "A url to the home page of your application. If unset, will\n fallback to `homepage` defined in `Cargo.toml`.\n\n Supported bundle targets: `deb`, `rpm`, `nsis` and `msi`.",
              ),
          ])
          .describe(
            "A url to the home page of your application. If unset, will\n fallback to `homepage` defined in `Cargo.toml`.\n\n Supported bundle targets: `deb`, `rpm`, `nsis` and `msi`.",
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
                "Definition for bundle resources.\n Can be either a list of paths to include or a map of source to target paths.",
              ),
            z.null(),
          ])
          .describe(
            "App resources to bundle.\n Each resource is a path to a file or directory.\n Glob patterns are supported.",
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
                "The package's license identifier to be included in the appropriate bundles.\n If not set, defaults to the license from the Cargo.toml file.",
              ),
            z
              .null()
              .describe(
                "The package's license identifier to be included in the appropriate bundles.\n If not set, defaults to the license from the Cargo.toml file.",
              ),
          ])
          .describe(
            "The package's license identifier to be included in the appropriate bundles.\n If not set, defaults to the license from the Cargo.toml file.",
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
                "The application kind.\n\n Should be one of the following:\n Business, DeveloperTool, Education, Entertainment, Finance, Game, ActionGame, AdventureGame, ArcadeGame, BoardGame, CardGame, CasinoGame, DiceGame, EducationalGame, FamilyGame, KidsGame, MusicGame, PuzzleGame, RacingGame, RolePlayingGame, SimulationGame, SportsGame, StrategyGame, TriviaGame, WordGame, GraphicsAndDesign, HealthcareAndFitness, Lifestyle, Medical, Music, News, Photography, Productivity, Reference, SocialNetworking, Sports, Travel, Utility, Video, Weather.",
              ),
            z
              .null()
              .describe(
                "The application kind.\n\n Should be one of the following:\n Business, DeveloperTool, Education, Entertainment, Finance, Game, ActionGame, AdventureGame, ArcadeGame, BoardGame, CardGame, CasinoGame, DiceGame, EducationalGame, FamilyGame, KidsGame, MusicGame, PuzzleGame, RacingGame, RolePlayingGame, SimulationGame, SportsGame, StrategyGame, TriviaGame, WordGame, GraphicsAndDesign, HealthcareAndFitness, Lifestyle, Medical, Music, News, Photography, Productivity, Reference, SocialNetworking, Sports, Travel, Utility, Video, Weather.",
              ),
          ])
          .describe(
            "The application kind.\n\n Should be one of the following:\n Business, DeveloperTool, Education, Entertainment, Finance, Game, ActionGame, AdventureGame, ArcadeGame, BoardGame, CardGame, CasinoGame, DiceGame, EducationalGame, FamilyGame, KidsGame, MusicGame, PuzzleGame, RacingGame, RolePlayingGame, SimulationGame, SportsGame, StrategyGame, TriviaGame, WordGame, GraphicsAndDesign, HealthcareAndFitness, Lifestyle, Medical, Music, News, Photography, Productivity, Reference, SocialNetworking, Sports, Travel, Utility, Video, Weather.",
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
                            "An extension for a [`FileAssociation`].\n\n A leading `.` is automatically stripped.",
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
        useLocalToolsDir: z
          .boolean()
          .describe(
            "Whether to use the project's `target` directory, for caching build tools (e.g., Wix and NSIS) when building this application. Defaults to `false`.\n\n If true, tools will be cached in `target/.tauri/`.\n If false, tools will be cached in the current user's platform-specific cache directory.\n\n An example where it can be appropriate to set this to `true` is when building this application as a Windows System user (e.g., AWS EC2 workloads),\n because the Window system's app data directory is restricted.",
          )
          .default(false),
        externalBin: z
          .union([
            z
              .array(z.string())
              .describe(
                'A list of—either absolute or relative—paths to binaries to embed with your application.\n\n Note that Tauri will look for system-specific binaries following the pattern "binary-name{-target-triple}{.system-extension}".\n\n E.g. for the external binary "my-binary", Tauri looks for:\n\n - "my-binary-x86_64-pc-windows-msvc.exe" for Windows\n - "my-binary-x86_64-apple-darwin" for macOS\n - "my-binary-x86_64-unknown-linux-gnu" for Linux\n\n so don\'t forget to provide binaries for all targeted platforms.',
              ),
            z
              .null()
              .describe(
                'A list of—either absolute or relative—paths to binaries to embed with your application.\n\n Note that Tauri will look for system-specific binaries following the pattern "binary-name{-target-triple}{.system-extension}".\n\n E.g. for the external binary "my-binary", Tauri looks for:\n\n - "my-binary-x86_64-pc-windows-msvc.exe" for Windows\n - "my-binary-x86_64-apple-darwin" for macOS\n - "my-binary-x86_64-unknown-linux-gnu" for Linux\n\n so don\'t forget to provide binaries for all targeted platforms.',
              ),
          ])
          .describe(
            'A list of—either absolute or relative—paths to binaries to embed with your application.\n\n Note that Tauri will look for system-specific binaries following the pattern "binary-name{-target-triple}{.system-extension}".\n\n E.g. for the external binary "my-binary", Tauri looks for:\n\n - "my-binary-x86_64-pc-windows-msvc.exe" for Windows\n - "my-binary-x86_64-apple-darwin" for macOS\n - "my-binary-x86_64-unknown-linux-gnu" for Linux\n\n so don\'t forget to provide binaries for all targeted platforms.',
          )
          .optional(),
        windows: z
          .object({
            digestAlgorithm: z
              .union([
                z
                  .string()
                  .describe(
                    "Specifies the file digest algorithm to use for creating file signatures.\n Required for code signing. SHA-256 is recommended.",
                  ),
                z
                  .null()
                  .describe(
                    "Specifies the file digest algorithm to use for creating file signatures.\n Required for code signing. SHA-256 is recommended.",
                  ),
              ])
              .describe(
                "Specifies the file digest algorithm to use for creating file signatures.\n Required for code signing. SHA-256 is recommended.",
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
                "Whether to use Time-Stamp Protocol (TSP, a.k.a. RFC 3161) for the timestamp server. Your code signing provider may\n use a TSP timestamp server, like e.g. SSL.com does. If so, enable TSP by setting to true.",
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
                      "Download the bootstrapper and run it.\n Requires an internet connection.\n Results in a smaller installer size, but is not recommended on Windows 7.",
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
                      "Embed the bootstrapper and run it.\n Requires an internet connection.\n Increases the installer size by around 1.8MB, but offers better support on Windows 7.",
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
                      "Embed the offline installer and run it.\n Does not require an internet connection.\n Increases the installer size by around 127MB.",
                    ),
                  z
                    .object({
                      type: z.literal("fixedRuntime"),
                      path: z
                        .string()
                        .describe(
                          "The path to the fixed runtime to use.\n\n The fixed version can be downloaded [on the official website](https://developer.microsoft.com/en-us/microsoft-edge/webview2/#download-section).\n The `.cab` file must be extracted to a folder and this folder path must be defined on this field.",
                        ),
                    })
                    .strict()
                    .describe(
                      "Embed a fixed webview2 version and use it at runtime.\n Increases the installer size by around 180MB.",
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
                "Install modes for the Webview2 runtime.\n Note that for the updater bundle [`Self::DownloadBootstrapper`] is used.\n\n For more information see <https://v2.tauri.app/distribute/windows-installer/#webview2-installation-options>.",
              )
              .describe("The installation mode for the Webview2 runtime.")
              .default({ silent: true, type: "downloadBootstrapper" }),
            allowDowngrades: z
              .boolean()
              .describe(
                "Validates a second app installation, blocking the user from installing an older version if set to `false`.\n\n For instance, if `1.2.1` is installed, the user won't be able to install app version `1.2.0` or `1.1.5`.\n\n The default value of this flag is `true`.",
              )
              .default(true),
            wix: z
              .union([
                z
                  .object({
                    version: z
                      .union([
                        z
                          .string()
                          .describe(
                            "MSI installer version in the format `major.minor.patch.build` (build is optional).\n\n Because a valid version is required for MSI installer, it will be derived from [`Config::version`] if this field is not set.\n\n The first field is the major version and has a maximum value of 255. The second field is the minor version and has a maximum value of 255.\n The third and foruth fields have a maximum value of 65,535.\n\n See <https://learn.microsoft.com/en-us/windows/win32/msi/productversion> for more info.",
                          ),
                        z
                          .null()
                          .describe(
                            "MSI installer version in the format `major.minor.patch.build` (build is optional).\n\n Because a valid version is required for MSI installer, it will be derived from [`Config::version`] if this field is not set.\n\n The first field is the major version and has a maximum value of 255. The second field is the minor version and has a maximum value of 255.\n The third and foruth fields have a maximum value of 65,535.\n\n See <https://learn.microsoft.com/en-us/windows/win32/msi/productversion> for more info.",
                          ),
                      ])
                      .describe(
                        "MSI installer version in the format `major.minor.patch.build` (build is optional).\n\n Because a valid version is required for MSI installer, it will be derived from [`Config::version`] if this field is not set.\n\n The first field is the major version and has a maximum value of 255. The second field is the minor version and has a maximum value of 255.\n The third and foruth fields have a maximum value of 65,535.\n\n See <https://learn.microsoft.com/en-us/windows/win32/msi/productversion> for more info.",
                      )
                      .optional(),
                    upgradeCode: z
                      .union([
                        z
                          .string()
                          .uuid()
                          .describe(
                            "A GUID upgrade code for MSI installer. This code **_must stay the same across all of your updates_**,\n otherwise, Windows will treat your update as a different app and your users will have duplicate versions of your app.\n\n By default, tauri generates this code by generating a Uuid v5 using the string `<productName>.exe.app.x64` in the DNS namespace.\n You can use Tauri's CLI to generate and print this code for you, run `tauri inspect wix-upgrade-code`.\n\n It is recommended that you set this value in your tauri config file to avoid accidental changes in your upgrade code\n whenever you want to change your product name.",
                          ),
                        z
                          .null()
                          .describe(
                            "A GUID upgrade code for MSI installer. This code **_must stay the same across all of your updates_**,\n otherwise, Windows will treat your update as a different app and your users will have duplicate versions of your app.\n\n By default, tauri generates this code by generating a Uuid v5 using the string `<productName>.exe.app.x64` in the DNS namespace.\n You can use Tauri's CLI to generate and print this code for you, run `tauri inspect wix-upgrade-code`.\n\n It is recommended that you set this value in your tauri config file to avoid accidental changes in your upgrade code\n whenever you want to change your product name.",
                          ),
                      ])
                      .describe(
                        "A GUID upgrade code for MSI installer. This code **_must stay the same across all of your updates_**,\n otherwise, Windows will treat your update as a different app and your users will have duplicate versions of your app.\n\n By default, tauri generates this code by generating a Uuid v5 using the string `<productName>.exe.app.x64` in the DNS namespace.\n You can use Tauri's CLI to generate and print this code for you, run `tauri inspect wix-upgrade-code`.\n\n It is recommended that you set this value in your tauri config file to avoid accidental changes in your upgrade code\n whenever you want to change your product name.",
                      )
                      .optional(),
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
                                "Configuration for a target language for the WiX build.\n\n See more: <https://v2.tauri.app/reference/config/#wixlanguageconfig>",
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
                            "Path to a bitmap file to use as the installation user interface banner.\n This bitmap will appear at the top of all but the first page of the installer.\n\n The required dimensions are 493px × 58px.",
                          ),
                        z
                          .null()
                          .describe(
                            "Path to a bitmap file to use as the installation user interface banner.\n This bitmap will appear at the top of all but the first page of the installer.\n\n The required dimensions are 493px × 58px.",
                          ),
                      ])
                      .describe(
                        "Path to a bitmap file to use as the installation user interface banner.\n This bitmap will appear at the top of all but the first page of the installer.\n\n The required dimensions are 493px × 58px.",
                      )
                      .optional(),
                    dialogImagePath: z
                      .union([
                        z
                          .string()
                          .describe(
                            "Path to a bitmap file to use on the installation user interface dialogs.\n It is used on the welcome and completion dialogs.\n\n The required dimensions are 493px × 312px.",
                          ),
                        z
                          .null()
                          .describe(
                            "Path to a bitmap file to use on the installation user interface dialogs.\n It is used on the welcome and completion dialogs.\n\n The required dimensions are 493px × 312px.",
                          ),
                      ])
                      .describe(
                        "Path to a bitmap file to use on the installation user interface dialogs.\n It is used on the welcome and completion dialogs.\n\n The required dimensions are 493px × 312px.",
                      )
                      .optional(),
                  })
                  .strict()
                  .describe(
                    "Configuration for the MSI bundle using WiX.\n\n See more: <https://v2.tauri.app/reference/config/#wixconfig>",
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
                            "The path to a bitmap file to display on the header of installers pages.\n\n The recommended dimensions are 150px x 57px.",
                          ),
                        z
                          .null()
                          .describe(
                            "The path to a bitmap file to display on the header of installers pages.\n\n The recommended dimensions are 150px x 57px.",
                          ),
                      ])
                      .describe(
                        "The path to a bitmap file to display on the header of installers pages.\n\n The recommended dimensions are 150px x 57px.",
                      )
                      .optional(),
                    sidebarImage: z
                      .union([
                        z
                          .string()
                          .describe(
                            "The path to a bitmap file for the Welcome page and the Finish page.\n\n The recommended dimensions are 164px x 314px.",
                          ),
                        z
                          .null()
                          .describe(
                            "The path to a bitmap file for the Welcome page and the Finish page.\n\n The recommended dimensions are 164px x 314px.",
                          ),
                      ])
                      .describe(
                        "The path to a bitmap file for the Welcome page and the Finish page.\n\n The recommended dimensions are 164px x 314px.",
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
                              "Default mode for the installer.\n\n Install the app by default in a directory that doesn't require Administrator access.\n\n Installer metadata will be saved under the `HKCU` registry path.",
                            ),
                          z
                            .literal("perMachine")
                            .describe(
                              "Install the app by default in the `Program Files` folder directory requires Administrator\n access for the installation.\n\n Installer metadata will be saved under the `HKLM` registry path.",
                            ),
                          z
                            .literal("both")
                            .describe(
                              "Combines both modes and allows the user to choose at install time\n whether to install for the current user or per machine. Note that this mode\n will require Administrator access even if the user wants to install it for the current user only.\n\n Installer metadata will be saved under the `HKLM` or `HKCU` registry path based on the user's choice.",
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
                            "A list of installer languages.\n By default the OS language is used. If the OS language is not in the list of languages, the first language will be used.\n To allow the user to select the language, set `display_language_selector` to `true`.\n\n See <https://github.com/kichik/nsis/tree/9465c08046f00ccb6eda985abbdbf52c275c6c4d/Contrib/Language%20files> for the complete list of languages.",
                          ),
                        z
                          .null()
                          .describe(
                            "A list of installer languages.\n By default the OS language is used. If the OS language is not in the list of languages, the first language will be used.\n To allow the user to select the language, set `display_language_selector` to `true`.\n\n See <https://github.com/kichik/nsis/tree/9465c08046f00ccb6eda985abbdbf52c275c6c4d/Contrib/Language%20files> for the complete list of languages.",
                          ),
                      ])
                      .describe(
                        "A list of installer languages.\n By default the OS language is used. If the OS language is not in the list of languages, the first language will be used.\n To allow the user to select the language, set `display_language_selector` to `true`.\n\n See <https://github.com/kichik/nsis/tree/9465c08046f00ccb6eda985abbdbf52c275c6c4d/Contrib/Language%20files> for the complete list of languages.",
                      )
                      .optional(),
                    customLanguageFiles: z
                      .union([
                        z
                          .record(z.string())
                          .describe(
                            "A key-value pair where the key is the language and the\n value is the path to a custom `.nsh` file that holds the translated text for tauri's custom messages.\n\n See <https://github.com/tauri-apps/tauri/blob/dev/crates/tauri-bundler/src/bundle/windows/nsis/languages/English.nsh> for an example `.nsh` file.\n\n **Note**: the key must be a valid NSIS language and it must be added to [`NsisConfig`] languages array,",
                          ),
                        z
                          .null()
                          .describe(
                            "A key-value pair where the key is the language and the\n value is the path to a custom `.nsh` file that holds the translated text for tauri's custom messages.\n\n See <https://github.com/tauri-apps/tauri/blob/dev/crates/tauri-bundler/src/bundle/windows/nsis/languages/English.nsh> for an example `.nsh` file.\n\n **Note**: the key must be a valid NSIS language and it must be added to [`NsisConfig`] languages array,",
                          ),
                      ])
                      .describe(
                        "A key-value pair where the key is the language and the\n value is the path to a custom `.nsh` file that holds the translated text for tauri's custom messages.\n\n See <https://github.com/tauri-apps/tauri/blob/dev/crates/tauri-bundler/src/bundle/windows/nsis/languages/English.nsh> for an example `.nsh` file.\n\n **Note**: the key must be a valid NSIS language and it must be added to [`NsisConfig`] languages array,",
                      )
                      .optional(),
                    displayLanguageSelector: z
                      .boolean()
                      .describe(
                        "Whether to display a language selector dialog before the installer and uninstaller windows are rendered or not.\n By default the OS language is selected, with a fallback to the first language in the `languages` array.",
                      )
                      .default(false),
                    compression: z
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
                          z.literal("none").describe("Disable compression"),
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
                        "Compression algorithms used in the NSIS installer.\n\n See <https://nsis.sourceforge.io/Reference/SetCompressor>",
                      )
                      .describe(
                        "Set the compression algorithm used to compress files in the installer.\n\n See <https://nsis.sourceforge.io/Reference/SetCompressor>",
                      )
                      .default("lzma"),
                    startMenuFolder: z
                      .union([
                        z
                          .string()
                          .describe(
                            "Set the folder name for the start menu shortcut.\n\n Use this option if you have multiple apps and wish to group their shortcuts under one folder\n or if you generally prefer to set your shortcut inside a folder.\n\n Examples:\n - `AwesomePublisher`, shortcut will be placed in `%AppData%\\Microsoft\\Windows\\Start Menu\\Programs\\AwesomePublisher\\<your-app>.lnk`\n - If unset, shortcut will be placed in `%AppData%\\Microsoft\\Windows\\Start Menu\\Programs\\<your-app>.lnk`",
                          ),
                        z
                          .null()
                          .describe(
                            "Set the folder name for the start menu shortcut.\n\n Use this option if you have multiple apps and wish to group their shortcuts under one folder\n or if you generally prefer to set your shortcut inside a folder.\n\n Examples:\n - `AwesomePublisher`, shortcut will be placed in `%AppData%\\Microsoft\\Windows\\Start Menu\\Programs\\AwesomePublisher\\<your-app>.lnk`\n - If unset, shortcut will be placed in `%AppData%\\Microsoft\\Windows\\Start Menu\\Programs\\<your-app>.lnk`",
                          ),
                      ])
                      .describe(
                        "Set the folder name for the start menu shortcut.\n\n Use this option if you have multiple apps and wish to group their shortcuts under one folder\n or if you generally prefer to set your shortcut inside a folder.\n\n Examples:\n - `AwesomePublisher`, shortcut will be placed in `%AppData%\\Microsoft\\Windows\\Start Menu\\Programs\\AwesomePublisher\\<your-app>.lnk`\n - If unset, shortcut will be placed in `%AppData%\\Microsoft\\Windows\\Start Menu\\Programs\\<your-app>.lnk`",
                      )
                      .optional(),
                    installerHooks: z
                      .union([
                        z
                          .string()
                          .describe(
                            'A path to a `.nsh` file that contains special NSIS macros to be hooked into the\n main installer.nsi script.\n\n Supported hooks are:\n - `NSIS_HOOK_PREINSTALL`: This hook runs before copying files, setting registry key values and creating shortcuts.\n - `NSIS_HOOK_POSTINSTALL`: This hook runs after the installer has finished copying all files, setting the registry keys and created shortcuts.\n - `NSIS_HOOK_PREUNINSTALL`: This hook runs before removing any files, registry keys and shortcuts.\n - `NSIS_HOOK_POSTUNINSTALL`: This hook runs after files, registry keys and shortcuts have been removed.\n\n\n ### Example\n\n ```nsh\n !macro NSIS_HOOK_PREINSTALL\n   MessageBox MB_OK "PreInstall"\n !macroend\n\n !macro NSIS_HOOK_POSTINSTALL\n   MessageBox MB_OK "PostInstall"\n !macroend\n\n !macro NSIS_HOOK_PREUNINSTALL\n   MessageBox MB_OK "PreUnInstall"\n !macroend\n\n !macro NSIS_HOOK_POSTUNINSTALL\n   MessageBox MB_OK "PostUninstall"\n !macroend\n\n ```',
                          ),
                        z
                          .null()
                          .describe(
                            'A path to a `.nsh` file that contains special NSIS macros to be hooked into the\n main installer.nsi script.\n\n Supported hooks are:\n - `NSIS_HOOK_PREINSTALL`: This hook runs before copying files, setting registry key values and creating shortcuts.\n - `NSIS_HOOK_POSTINSTALL`: This hook runs after the installer has finished copying all files, setting the registry keys and created shortcuts.\n - `NSIS_HOOK_PREUNINSTALL`: This hook runs before removing any files, registry keys and shortcuts.\n - `NSIS_HOOK_POSTUNINSTALL`: This hook runs after files, registry keys and shortcuts have been removed.\n\n\n ### Example\n\n ```nsh\n !macro NSIS_HOOK_PREINSTALL\n   MessageBox MB_OK "PreInstall"\n !macroend\n\n !macro NSIS_HOOK_POSTINSTALL\n   MessageBox MB_OK "PostInstall"\n !macroend\n\n !macro NSIS_HOOK_PREUNINSTALL\n   MessageBox MB_OK "PreUnInstall"\n !macroend\n\n !macro NSIS_HOOK_POSTUNINSTALL\n   MessageBox MB_OK "PostUninstall"\n !macroend\n\n ```',
                          ),
                      ])
                      .describe(
                        'A path to a `.nsh` file that contains special NSIS macros to be hooked into the\n main installer.nsi script.\n\n Supported hooks are:\n - `NSIS_HOOK_PREINSTALL`: This hook runs before copying files, setting registry key values and creating shortcuts.\n - `NSIS_HOOK_POSTINSTALL`: This hook runs after the installer has finished copying all files, setting the registry keys and created shortcuts.\n - `NSIS_HOOK_PREUNINSTALL`: This hook runs before removing any files, registry keys and shortcuts.\n - `NSIS_HOOK_POSTUNINSTALL`: This hook runs after files, registry keys and shortcuts have been removed.\n\n\n ### Example\n\n ```nsh\n !macro NSIS_HOOK_PREINSTALL\n   MessageBox MB_OK "PreInstall"\n !macroend\n\n !macro NSIS_HOOK_POSTINSTALL\n   MessageBox MB_OK "PostInstall"\n !macroend\n\n !macro NSIS_HOOK_PREUNINSTALL\n   MessageBox MB_OK "PreUnInstall"\n !macroend\n\n !macro NSIS_HOOK_POSTUNINSTALL\n   MessageBox MB_OK "PostUninstall"\n !macroend\n\n ```',
                      )
                      .optional(),
                    minimumWebview2Version: z
                      .union([
                        z
                          .string()
                          .describe(
                            "Try to ensure that the WebView2 version is equal to or newer than this version,\n if the user's WebView2 is older than this version,\n the installer will try to trigger a WebView2 update.",
                          ),
                        z
                          .null()
                          .describe(
                            "Try to ensure that the WebView2 version is equal to or newer than this version,\n if the user's WebView2 is older than this version,\n the installer will try to trigger a WebView2 update.",
                          ),
                      ])
                      .describe(
                        "Try to ensure that the WebView2 version is equal to or newer than this version,\n if the user's WebView2 is older than this version,\n the installer will try to trigger a WebView2 update.",
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
            signCommand: z
              .union([
                z
                  .union([
                    z
                      .string()
                      .describe(
                        "A string notation of the script to execute.\n\n \"%1\" will be replaced with the path to the binary to be signed.\n\n This is a simpler notation for the command.\n Tauri will split the string with `' '` and use the first element as the command name and the rest as arguments.\n\n If you need to use whitespace in the command or arguments, use the object notation [`Self::ScriptWithOptions`].",
                      ),
                    z
                      .object({
                        cmd: z
                          .string()
                          .describe("The command to run to sign the binary."),
                        args: z
                          .array(z.string())
                          .describe(
                            'The arguments to pass to the command.\n\n "%1" will be replaced with the path to the binary to be signed.',
                          ),
                      })
                      .strict()
                      .describe(
                        "An object notation of the command.\n\n This is more complex notation for the command but\n this allows you to use whitespace in the command and arguments.",
                      ),
                  ])
                  .describe("Custom Signing Command configuration."),
                z.null(),
              ])
              .describe(
                "Specify a custom command to sign the binaries.\n This command needs to have a `%1` in args which is just a placeholder for the binary path,\n which we will detect and replace before calling the command.\n\n By Default we use `signtool.exe` which can be found only on Windows so\n if you are on another platform and want to cross-compile and sign you will\n need to use another tool like `osslsigncode`.",
              )
              .optional(),
          })
          .strict()
          .describe(
            "Windows bundler configuration.\n\n See more: <https://v2.tauri.app/reference/config/#windowsconfig>",
          )
          .describe("Configuration for the Windows bundles.")
          .default({
            allowDowngrades: true,
            certificateThumbprint: null,
            digestAlgorithm: null,
            nsis: null,
            signCommand: null,
            timestampUrl: null,
            tsp: false,
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
                    "Include additional gstreamer dependencies needed for audio and video playback.\n This increases the bundle size by ~15-35MB depending on your build system.",
                  )
                  .default(false),
                files: z
                  .record(z.string())
                  .describe("The files to include in the Appimage Binary.")
                  .default({}),
              })
              .strict()
              .describe(
                "Configuration for AppImage bundles.\n\n See more: <https://v2.tauri.app/reference/config/#appimageconfig>",
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
                recommends: z
                  .union([
                    z
                      .array(z.string())
                      .describe(
                        "The list of deb dependencies your application recommends.",
                      ),
                    z
                      .null()
                      .describe(
                        "The list of deb dependencies your application recommends.",
                      ),
                  ])
                  .describe(
                    "The list of deb dependencies your application recommends.",
                  )
                  .optional(),
                provides: z
                  .union([
                    z
                      .array(z.string())
                      .describe(
                        "The list of dependencies the package provides.",
                      ),
                    z
                      .null()
                      .describe(
                        "The list of dependencies the package provides.",
                      ),
                  ])
                  .describe("The list of dependencies the package provides.")
                  .optional(),
                conflicts: z
                  .union([
                    z
                      .array(z.string())
                      .describe("The list of package conflicts."),
                    z.null().describe("The list of package conflicts."),
                  ])
                  .describe("The list of package conflicts.")
                  .optional(),
                replaces: z
                  .union([
                    z
                      .array(z.string())
                      .describe("The list of package replaces."),
                    z.null().describe("The list of package replaces."),
                  ])
                  .describe("The list of package replaces.")
                  .optional(),
                files: z
                  .record(z.string())
                  .describe("The files to include on the package.")
                  .default({}),
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
                        "Change the priority of the Debian Package. By default, it is set to `optional`.\n Recognized Priorities as of now are :  `required`, `important`, `standard`, `optional`, `extra`",
                      ),
                    z
                      .null()
                      .describe(
                        "Change the priority of the Debian Package. By default, it is set to `optional`.\n Recognized Priorities as of now are :  `required`, `important`, `standard`, `optional`, `extra`",
                      ),
                  ])
                  .describe(
                    "Change the priority of the Debian Package. By default, it is set to `optional`.\n Recognized Priorities as of now are :  `required`, `important`, `standard`, `optional`, `extra`",
                  )
                  .optional(),
                changelog: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Path of the uncompressed Changelog file, to be stored at /usr/share/doc/package-name/changelog.gz. See\n <https://www.debian.org/doc/debian-policy/ch-docs.html#changelog-files-and-release-notes>",
                      ),
                    z
                      .null()
                      .describe(
                        "Path of the uncompressed Changelog file, to be stored at /usr/share/doc/package-name/changelog.gz. See\n <https://www.debian.org/doc/debian-policy/ch-docs.html#changelog-files-and-release-notes>",
                      ),
                  ])
                  .describe(
                    "Path of the uncompressed Changelog file, to be stored at /usr/share/doc/package-name/changelog.gz. See\n <https://www.debian.org/doc/debian-policy/ch-docs.html#changelog-files-and-release-notes>",
                  )
                  .optional(),
                desktopTemplate: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Path to a custom desktop file Handlebars template.\n\n Available variables: `categories`, `comment` (optional), `exec`, `icon` and `name`.",
                      ),
                    z
                      .null()
                      .describe(
                        "Path to a custom desktop file Handlebars template.\n\n Available variables: `categories`, `comment` (optional), `exec`, `icon` and `name`.",
                      ),
                  ])
                  .describe(
                    "Path to a custom desktop file Handlebars template.\n\n Available variables: `categories`, `comment` (optional), `exec`, `icon` and `name`.",
                  )
                  .optional(),
                preInstallScript: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Path to script that will be executed before the package is unpacked. See\n <https://www.debian.org/doc/debian-policy/ch-maintainerscripts.html>",
                      ),
                    z
                      .null()
                      .describe(
                        "Path to script that will be executed before the package is unpacked. See\n <https://www.debian.org/doc/debian-policy/ch-maintainerscripts.html>",
                      ),
                  ])
                  .describe(
                    "Path to script that will be executed before the package is unpacked. See\n <https://www.debian.org/doc/debian-policy/ch-maintainerscripts.html>",
                  )
                  .optional(),
                postInstallScript: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Path to script that will be executed after the package is unpacked. See\n <https://www.debian.org/doc/debian-policy/ch-maintainerscripts.html>",
                      ),
                    z
                      .null()
                      .describe(
                        "Path to script that will be executed after the package is unpacked. See\n <https://www.debian.org/doc/debian-policy/ch-maintainerscripts.html>",
                      ),
                  ])
                  .describe(
                    "Path to script that will be executed after the package is unpacked. See\n <https://www.debian.org/doc/debian-policy/ch-maintainerscripts.html>",
                  )
                  .optional(),
                preRemoveScript: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Path to script that will be executed before the package is removed. See\n <https://www.debian.org/doc/debian-policy/ch-maintainerscripts.html>",
                      ),
                    z
                      .null()
                      .describe(
                        "Path to script that will be executed before the package is removed. See\n <https://www.debian.org/doc/debian-policy/ch-maintainerscripts.html>",
                      ),
                  ])
                  .describe(
                    "Path to script that will be executed before the package is removed. See\n <https://www.debian.org/doc/debian-policy/ch-maintainerscripts.html>",
                  )
                  .optional(),
                postRemoveScript: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Path to script that will be executed after the package is removed. See\n <https://www.debian.org/doc/debian-policy/ch-maintainerscripts.html>",
                      ),
                    z
                      .null()
                      .describe(
                        "Path to script that will be executed after the package is removed. See\n <https://www.debian.org/doc/debian-policy/ch-maintainerscripts.html>",
                      ),
                  ])
                  .describe(
                    "Path to script that will be executed after the package is removed. See\n <https://www.debian.org/doc/debian-policy/ch-maintainerscripts.html>",
                  )
                  .optional(),
              })
              .strict()
              .describe(
                "Configuration for Debian (.deb) bundles.\n\n See more: <https://v2.tauri.app/reference/config/#debconfig>",
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
                recommends: z
                  .union([
                    z
                      .array(z.string())
                      .describe(
                        "The list of RPM dependencies your application recommends.",
                      ),
                    z
                      .null()
                      .describe(
                        "The list of RPM dependencies your application recommends.",
                      ),
                  ])
                  .describe(
                    "The list of RPM dependencies your application recommends.",
                  )
                  .optional(),
                provides: z
                  .union([
                    z
                      .array(z.string())
                      .describe(
                        "The list of RPM dependencies your application provides.",
                      ),
                    z
                      .null()
                      .describe(
                        "The list of RPM dependencies your application provides.",
                      ),
                  ])
                  .describe(
                    "The list of RPM dependencies your application provides.",
                  )
                  .optional(),
                conflicts: z
                  .union([
                    z
                      .array(z.string())
                      .describe(
                        "The list of RPM dependencies your application conflicts with. They must not be present\n in order for the package to be installed.",
                      ),
                    z
                      .null()
                      .describe(
                        "The list of RPM dependencies your application conflicts with. They must not be present\n in order for the package to be installed.",
                      ),
                  ])
                  .describe(
                    "The list of RPM dependencies your application conflicts with. They must not be present\n in order for the package to be installed.",
                  )
                  .optional(),
                obsoletes: z
                  .union([
                    z
                      .array(z.string())
                      .describe(
                        'The list of RPM dependencies your application supersedes - if this package is installed,\n packages listed as "obsoletes" will be automatically removed (if they are present).',
                      ),
                    z
                      .null()
                      .describe(
                        'The list of RPM dependencies your application supersedes - if this package is installed,\n packages listed as "obsoletes" will be automatically removed (if they are present).',
                      ),
                  ])
                  .describe(
                    'The list of RPM dependencies your application supersedes - if this package is installed,\n packages listed as "obsoletes" will be automatically removed (if they are present).',
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
                        "Path to a custom desktop file Handlebars template.\n\n Available variables: `categories`, `comment` (optional), `exec`, `icon` and `name`.",
                      ),
                    z
                      .null()
                      .describe(
                        "Path to a custom desktop file Handlebars template.\n\n Available variables: `categories`, `comment` (optional), `exec`, `icon` and `name`.",
                      ),
                  ])
                  .describe(
                    "Path to a custom desktop file Handlebars template.\n\n Available variables: `categories`, `comment` (optional), `exec`, `icon` and `name`.",
                  )
                  .optional(),
                preInstallScript: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Path to script that will be executed before the package is unpacked. See\n <http://ftp.rpm.org/max-rpm/s1-rpm-inside-scripts.html>",
                      ),
                    z
                      .null()
                      .describe(
                        "Path to script that will be executed before the package is unpacked. See\n <http://ftp.rpm.org/max-rpm/s1-rpm-inside-scripts.html>",
                      ),
                  ])
                  .describe(
                    "Path to script that will be executed before the package is unpacked. See\n <http://ftp.rpm.org/max-rpm/s1-rpm-inside-scripts.html>",
                  )
                  .optional(),
                postInstallScript: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Path to script that will be executed after the package is unpacked. See\n <http://ftp.rpm.org/max-rpm/s1-rpm-inside-scripts.html>",
                      ),
                    z
                      .null()
                      .describe(
                        "Path to script that will be executed after the package is unpacked. See\n <http://ftp.rpm.org/max-rpm/s1-rpm-inside-scripts.html>",
                      ),
                  ])
                  .describe(
                    "Path to script that will be executed after the package is unpacked. See\n <http://ftp.rpm.org/max-rpm/s1-rpm-inside-scripts.html>",
                  )
                  .optional(),
                preRemoveScript: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Path to script that will be executed before the package is removed. See\n <http://ftp.rpm.org/max-rpm/s1-rpm-inside-scripts.html>",
                      ),
                    z
                      .null()
                      .describe(
                        "Path to script that will be executed before the package is removed. See\n <http://ftp.rpm.org/max-rpm/s1-rpm-inside-scripts.html>",
                      ),
                  ])
                  .describe(
                    "Path to script that will be executed before the package is removed. See\n <http://ftp.rpm.org/max-rpm/s1-rpm-inside-scripts.html>",
                  )
                  .optional(),
                postRemoveScript: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Path to script that will be executed after the package is removed. See\n <http://ftp.rpm.org/max-rpm/s1-rpm-inside-scripts.html>",
                      ),
                    z
                      .null()
                      .describe(
                        "Path to script that will be executed after the package is removed. See\n <http://ftp.rpm.org/max-rpm/s1-rpm-inside-scripts.html>",
                      ),
                  ])
                  .describe(
                    "Path to script that will be executed after the package is removed. See\n <http://ftp.rpm.org/max-rpm/s1-rpm-inside-scripts.html>",
                  )
                  .optional(),
                compression: z
                  .union([
                    z
                      .any()
                      .superRefine((x, ctx) => {
                        const schemas = [
                          z
                            .object({
                              type: z.literal("gzip"),
                              level: z
                                .number()
                                .int()
                                .gte(0)
                                .describe("Gzip compression level"),
                            })
                            .strict()
                            .describe("Gzip compression"),
                          z
                            .object({
                              type: z.literal("zstd"),
                              level: z
                                .number()
                                .int()
                                .describe("Zstd compression level"),
                            })
                            .strict()
                            .describe("Zstd compression"),
                          z
                            .object({
                              type: z.literal("xz"),
                              level: z
                                .number()
                                .int()
                                .gte(0)
                                .describe("Xz compression level"),
                            })
                            .strict()
                            .describe("Xz compression"),
                          z
                            .object({
                              type: z.literal("bzip2"),
                              level: z
                                .number()
                                .int()
                                .gte(0)
                                .describe("Bzip2 compression level"),
                            })
                            .strict()
                            .describe("Bzip2 compression"),
                          z
                            .object({ type: z.literal("none") })
                            .strict()
                            .describe("Disable compression"),
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
                        "Compression algorithms used when bundling RPM packages.",
                      ),
                    z.null(),
                  ])
                  .describe(
                    "Compression algorithm and level. Defaults to `Gzip` with level 6.",
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
            "Configuration for Linux bundles.\n\n See more: <https://v2.tauri.app/reference/config/#linuxconfig>",
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
                    'A list of strings indicating any macOS X frameworks that need to be bundled with the application.\n\n If a name is used, ".framework" must be omitted and it will look for standard install locations. You may also use a path to a specific framework.',
                  ),
                z
                  .null()
                  .describe(
                    'A list of strings indicating any macOS X frameworks that need to be bundled with the application.\n\n If a name is used, ".framework" must be omitted and it will look for standard install locations. You may also use a path to a specific framework.',
                  ),
              ])
              .describe(
                'A list of strings indicating any macOS X frameworks that need to be bundled with the application.\n\n If a name is used, ".framework" must be omitted and it will look for standard install locations. You may also use a path to a specific framework.',
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
                    "A version string indicating the minimum macOS X version that the bundled application supports. Defaults to `10.13`.\n\n Setting it to `null` completely removes the `LSMinimumSystemVersion` field on the bundle's `Info.plist`\n and the `MACOSX_DEPLOYMENT_TARGET` environment variable.\n\n An empty string is considered an invalid value so the default value is used.",
                  )
                  .default("10.13"),
                z
                  .null()
                  .describe(
                    "A version string indicating the minimum macOS X version that the bundled application supports. Defaults to `10.13`.\n\n Setting it to `null` completely removes the `LSMinimumSystemVersion` field on the bundle's `Info.plist`\n and the `MACOSX_DEPLOYMENT_TARGET` environment variable.\n\n An empty string is considered an invalid value so the default value is used.",
                  )
                  .default("10.13"),
              ])
              .describe(
                "A version string indicating the minimum macOS X version that the bundled application supports. Defaults to `10.13`.\n\n Setting it to `null` completely removes the `LSMinimumSystemVersion` field on the bundle's `Info.plist`\n and the `MACOSX_DEPLOYMENT_TARGET` environment variable.\n\n An empty string is considered an invalid value so the default value is used.",
              )
              .default("10.13"),
            exceptionDomain: z
              .union([
                z
                  .string()
                  .describe(
                    "Allows your application to communicate with the outside world.\n It should be a lowercase, without port and protocol domain name.",
                  ),
                z
                  .null()
                  .describe(
                    "Allows your application to communicate with the outside world.\n It should be a lowercase, without port and protocol domain name.",
                  ),
              ])
              .describe(
                "Allows your application to communicate with the outside world.\n It should be a lowercase, without port and protocol domain name.",
              )
              .optional(),
            signingIdentity: z
              .union([
                z.string().describe("Identity to use for code signing."),
                z.null().describe("Identity to use for code signing."),
              ])
              .describe("Identity to use for code signing.")
              .optional(),
            hardenedRuntime: z
              .boolean()
              .describe(
                "Whether the codesign should enable [hardened runtime] (for executables) or not.\n\n [hardened runtime]: <https://developer.apple.com/documentation/security/hardened_runtime>",
              )
              .default(true),
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
                "Configuration for Apple Disk Image (.dmg) bundles.\n\n See more: <https://v2.tauri.app/reference/config/#dmgconfig>",
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
            "Configuration for the macOS bundles.\n\n See more: <https://v2.tauri.app/reference/config/#macconfig>",
          )
          .describe("Configuration for the macOS bundles.")
          .default({
            dmg: {
              appPosition: { x: 180, y: 170 },
              applicationFolderPosition: { x: 480, y: 170 },
              windowSize: { height: 400, width: 660 },
            },
            files: {},
            hardenedRuntime: true,
            minimumSystemVersion: "10.13",
          }),
        iOS: z
          .object({
            template: z
              .union([
                z
                  .string()
                  .describe(
                    "A custom [XcodeGen] project.yml template to use.\n\n [XcodeGen]: <https://github.com/yonaskolb/XcodeGen>",
                  ),
                z
                  .null()
                  .describe(
                    "A custom [XcodeGen] project.yml template to use.\n\n [XcodeGen]: <https://github.com/yonaskolb/XcodeGen>",
                  ),
              ])
              .describe(
                "A custom [XcodeGen] project.yml template to use.\n\n [XcodeGen]: <https://github.com/yonaskolb/XcodeGen>",
              )
              .optional(),
            frameworks: z
              .union([
                z
                  .array(z.string())
                  .describe(
                    "A list of strings indicating any iOS frameworks that need to be bundled with the application.\n\n Note that you need to recreate the iOS project for the changes to be applied.",
                  ),
                z
                  .null()
                  .describe(
                    "A list of strings indicating any iOS frameworks that need to be bundled with the application.\n\n Note that you need to recreate the iOS project for the changes to be applied.",
                  ),
              ])
              .describe(
                "A list of strings indicating any iOS frameworks that need to be bundled with the application.\n\n Note that you need to recreate the iOS project for the changes to be applied.",
              )
              .optional(),
            developmentTeam: z
              .union([
                z
                  .string()
                  .describe(
                    "The development team. This value is required for iOS development because code signing is enforced.\n The `APPLE_DEVELOPMENT_TEAM` environment variable can be set to overwrite it.",
                  ),
                z
                  .null()
                  .describe(
                    "The development team. This value is required for iOS development because code signing is enforced.\n The `APPLE_DEVELOPMENT_TEAM` environment variable can be set to overwrite it.",
                  ),
              ])
              .describe(
                "The development team. This value is required for iOS development because code signing is enforced.\n The `APPLE_DEVELOPMENT_TEAM` environment variable can be set to overwrite it.",
              )
              .optional(),
            minimumSystemVersion: z
              .string()
              .describe(
                "A version string indicating the minimum iOS version that the bundled application supports. Defaults to `13.0`.\n\n Maps to the IPHONEOS_DEPLOYMENT_TARGET value.",
              )
              .default("13.0"),
          })
          .strict()
          .describe("General configuration for the iOS target.")
          .describe("iOS configuration.")
          .default({ minimumSystemVersion: "13.0" }),
        android: z
          .object({
            minSdkVersion: z
              .number()
              .int()
              .gte(0)
              .describe(
                "The minimum API level required for the application to run.\n The Android system will prevent the user from installing the application if the system's API level is lower than the value specified.",
              )
              .default(24),
            versionCode: z
              .union([
                z
                  .number()
                  .int()
                  .gte(1)
                  .lte(2100000000)
                  .describe(
                    "The version code of the application.\n It is limited to 2,100,000,000 as per Google Play Store requirements.\n\n By default we use your configured version and perform the following math:\n versionCode = version.major * 1000000 + version.minor * 1000 + version.patch",
                  ),
                z
                  .null()
                  .describe(
                    "The version code of the application.\n It is limited to 2,100,000,000 as per Google Play Store requirements.\n\n By default we use your configured version and perform the following math:\n versionCode = version.major * 1000000 + version.minor * 1000 + version.patch",
                  ),
              ])
              .describe(
                "The version code of the application.\n It is limited to 2,100,000,000 as per Google Play Store requirements.\n\n By default we use your configured version and perform the following math:\n versionCode = version.major * 1000000 + version.minor * 1000 + version.patch",
              )
              .optional(),
          })
          .strict()
          .describe("General configuration for the Android target.")
          .describe("Android configuration.")
          .default({ minSdkVersion: 24 }),
      })
      .strict()
      .describe(
        "Configuration for tauri-bundler.\n\n See more: <https://v2.tauri.app/reference/config/#bundleconfig>",
      )
      .describe("The bundler configuration.")
      .default({
        active: false,
        android: { minSdkVersion: 24 },
        createUpdaterArtifacts: false,
        iOS: { minimumSystemVersion: "13.0" },
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
          hardenedRuntime: true,
          minimumSystemVersion: "10.13",
        },
        targets: "all",
        useLocalToolsDir: false,
        windows: {
          allowDowngrades: true,
          certificateThumbprint: null,
          digestAlgorithm: null,
          nsis: null,
          signCommand: null,
          timestampUrl: null,
          tsp: false,
          webviewInstallMode: { silent: true, type: "downloadBootstrapper" },
          wix: null,
        },
      }),
    plugins: z
      .record(z.any())
      .describe(
        "The plugin configs holds a HashMap mapping a plugin name to its configuration object.\n\n See more: <https://v2.tauri.app/reference/config/#pluginconfig>",
      )
      .describe("The plugins config.")
      .default({}),
  })
  .strict()
  .describe(
    'The Tauri configuration object.\n It is read from a file where you can define your frontend assets,\n configure the bundler and define a tray icon.\n\n The configuration file is generated by the\n [`tauri init`](https://v2.tauri.app/reference/cli/#init) command that lives in\n your Tauri application source directory (src-tauri).\n\n Once generated, you may modify it at will to customize your Tauri application.\n\n ## File Formats\n\n By default, the configuration is defined as a JSON file named `tauri.conf.json`.\n\n Tauri also supports JSON5 and TOML files via the `config-json5` and `config-toml` Cargo features, respectively.\n The JSON5 file name must be either `tauri.conf.json` or `tauri.conf.json5`.\n The TOML file name is `Tauri.toml`.\n\n ## Platform-Specific Configuration\n\n In addition to the default configuration file, Tauri can\n read a platform-specific configuration from `tauri.linux.conf.json`,\n `tauri.windows.conf.json`, `tauri.macos.conf.json`, `tauri.android.conf.json` and `tauri.ios.conf.json`\n (or `Tauri.linux.toml`, `Tauri.windows.toml`, `Tauri.macos.toml`, `Tauri.android.toml` and `Tauri.ios.toml` if the `Tauri.toml` format is used),\n which gets merged with the main configuration object.\n\n ## Configuration Structure\n\n The configuration is composed of the following objects:\n\n - [`app`](#appconfig): The Tauri configuration\n - [`build`](#buildconfig): The build configuration\n - [`bundle`](#bundleconfig): The bundle configurations\n - [`plugins`](#pluginconfig): The plugins configuration\n\n Example tauri.config.json file:\n\n ```json\n {\n   "productName": "tauri-app",\n   "version": "0.1.0",\n   "build": {\n     "beforeBuildCommand": "",\n     "beforeDevCommand": "",\n     "devUrl": "http://localhost:3000",\n     "frontendDist": "../dist"\n   },\n   "app": {\n     "security": {\n       "csp": null\n     },\n     "windows": [\n       {\n         "fullscreen": false,\n         "height": 600,\n         "resizable": true,\n         "title": "Tauri App",\n         "width": 800\n       }\n     ]\n   },\n   "bundle": {},\n   "plugins": {}\n }\n ```',
  );
