import { z } from "zod";
export type TauriConfigV1 = z.infer<typeof tauriConfigSchemaV1>;
export const tauriConfigSchemaV1 = z
  .object({
    $schema: z
      .union([
        z.string().describe("The JSON schema for the Tauri config."),
        z.null().describe("The JSON schema for the Tauri config."),
      ])
      .describe("The JSON schema for the Tauri config.")
      .optional(),
    package: z
      .object({
        productName: z
          .union([
            z
              .string()
              .regex(new RegExp('^[^/\\:*?"<>|]+$'))
              .describe("App name."),
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
      })
      .strict()
      .describe(
        "The package configuration.\n\nSee more: https://tauri.app/v1/api/config#packageconfig",
      )
      .describe("Package settings.")
      .default({ productName: null, version: null }),
    tauri: z
      .object({
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
                    z.string().url().describe("An external URL."),
                    z
                      .string()
                      .describe(
                        "The path portion of an app URL. For instance, to load `tauri://localhost/users/john`, you can simply provide `users/john` in this configuration.",
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
                alwaysOnTop: z
                  .boolean()
                  .describe(
                    "Whether the window should always be on top of other windows.",
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
                          "Shows the title bar as a transparent overlay over the window's content.\n\nKeep in mind: - The height of the title bar is different on different OS versions, which can lead to the window controls and title not being where you expect them to be. - You need to define a custom drag region to make your window draggable, however due to a limitation you can't drag the window when it's not in focus <https://github.com/tauri-apps/tauri/issues/4316>. - The color of the window title depends on the system theme.",
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
              })
              .strict()
              .describe(
                "The window configuration object.\n\nSee more: https://tauri.app/v1/api/config#windowconfig",
              ),
          )
          .describe("The windows configuration.")
          .default([]),
        cli: z
          .union([
            z
              .object({
                description: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Command description which will be shown on the help information.",
                      ),
                    z
                      .null()
                      .describe(
                        "Command description which will be shown on the help information.",
                      ),
                  ])
                  .describe(
                    "Command description which will be shown on the help information.",
                  )
                  .optional(),
                longDescription: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Command long description which will be shown on the help information.",
                      ),
                    z
                      .null()
                      .describe(
                        "Command long description which will be shown on the help information.",
                      ),
                  ])
                  .describe(
                    "Command long description which will be shown on the help information.",
                  )
                  .optional(),
                beforeHelp: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Adds additional help information to be displayed in addition to auto-generated help. This information is displayed before the auto-generated help information. This is often used for header information.",
                      ),
                    z
                      .null()
                      .describe(
                        "Adds additional help information to be displayed in addition to auto-generated help. This information is displayed before the auto-generated help information. This is often used for header information.",
                      ),
                  ])
                  .describe(
                    "Adds additional help information to be displayed in addition to auto-generated help. This information is displayed before the auto-generated help information. This is often used for header information.",
                  )
                  .optional(),
                afterHelp: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Adds additional help information to be displayed in addition to auto-generated help. This information is displayed after the auto-generated help information. This is often used to describe how to use the arguments, or caveats to be noted.",
                      ),
                    z
                      .null()
                      .describe(
                        "Adds additional help information to be displayed in addition to auto-generated help. This information is displayed after the auto-generated help information. This is often used to describe how to use the arguments, or caveats to be noted.",
                      ),
                  ])
                  .describe(
                    "Adds additional help information to be displayed in addition to auto-generated help. This information is displayed after the auto-generated help information. This is often used to describe how to use the arguments, or caveats to be noted.",
                  )
                  .optional(),
                args: z
                  .union([
                    z
                      .array(
                        z
                          .object({
                            short: z
                              .union([
                                z
                                  .string()
                                  .min(1)
                                  .max(1)
                                  .describe(
                                    "The short version of the argument, without the preceding -.\n\nNOTE: Any leading `-` characters will be stripped, and only the first non-character will be used as the short version.",
                                  ),
                                z
                                  .null()
                                  .describe(
                                    "The short version of the argument, without the preceding -.\n\nNOTE: Any leading `-` characters will be stripped, and only the first non-character will be used as the short version.",
                                  ),
                              ])
                              .describe(
                                "The short version of the argument, without the preceding -.\n\nNOTE: Any leading `-` characters will be stripped, and only the first non-character will be used as the short version.",
                              )
                              .optional(),
                            name: z
                              .string()
                              .describe("The unique argument name"),
                            description: z
                              .union([
                                z
                                  .string()
                                  .describe(
                                    "The argument description which will be shown on the help information. Typically, this is a short (one line) description of the arg.",
                                  ),
                                z
                                  .null()
                                  .describe(
                                    "The argument description which will be shown on the help information. Typically, this is a short (one line) description of the arg.",
                                  ),
                              ])
                              .describe(
                                "The argument description which will be shown on the help information. Typically, this is a short (one line) description of the arg.",
                              )
                              .optional(),
                            longDescription: z
                              .union([
                                z
                                  .string()
                                  .describe(
                                    "The argument long description which will be shown on the help information. Typically this a more detailed (multi-line) message that describes the argument.",
                                  ),
                                z
                                  .null()
                                  .describe(
                                    "The argument long description which will be shown on the help information. Typically this a more detailed (multi-line) message that describes the argument.",
                                  ),
                              ])
                              .describe(
                                "The argument long description which will be shown on the help information. Typically this a more detailed (multi-line) message that describes the argument.",
                              )
                              .optional(),
                            takesValue: z
                              .boolean()
                              .describe(
                                "Specifies that the argument takes a value at run time.\n\nNOTE: values for arguments may be specified in any of the following methods - Using a space such as -o value or --option value - Using an equals and no space such as -o=value or --option=value - Use a short and no space such as -ovalue",
                              )
                              .default(false),
                            multiple: z
                              .boolean()
                              .describe(
                                "Specifies that the argument may have an unknown number of multiple values. Without any other settings, this argument may appear only once.\n\nFor example, --opt val1 val2 is allowed, but --opt val1 val2 --opt val3 is not.\n\nNOTE: Setting this requires `takes_value` to be set to true.",
                              )
                              .default(false),
                            multipleOccurrences: z
                              .boolean()
                              .describe(
                                "Specifies that the argument may appear more than once. For flags, this results in the number of occurrences of the flag being recorded. For example -ddd or -d -d -d would count as three occurrences. For options or arguments that take a value, this does not affect how many values they can accept. (i.e. only one at a time is allowed)\n\nFor example, --opt val1 --opt val2 is allowed, but --opt val1 val2 is not.",
                              )
                              .default(false),
                            numberOfValues: z
                              .union([
                                z
                                  .number()
                                  .int()
                                  .gte(0)
                                  .describe(
                                    "Specifies how many values are required to satisfy this argument. For example, if you had a `-f <file>` argument where you wanted exactly 3 'files' you would set `number_of_values = 3`, and this argument wouldn't be satisfied unless the user provided 3 and only 3 values.\n\n**NOTE:** Does *not* require `multiple_occurrences = true` to be set. Setting `multiple_occurrences = true` would allow `-f <file> <file> <file> -f <file> <file> <file>` where as *not* setting it would only allow one occurrence of this argument.\n\n**NOTE:** implicitly sets `takes_value = true` and `multiple_values = true`.",
                                  ),
                                z
                                  .null()
                                  .describe(
                                    "Specifies how many values are required to satisfy this argument. For example, if you had a `-f <file>` argument where you wanted exactly 3 'files' you would set `number_of_values = 3`, and this argument wouldn't be satisfied unless the user provided 3 and only 3 values.\n\n**NOTE:** Does *not* require `multiple_occurrences = true` to be set. Setting `multiple_occurrences = true` would allow `-f <file> <file> <file> -f <file> <file> <file>` where as *not* setting it would only allow one occurrence of this argument.\n\n**NOTE:** implicitly sets `takes_value = true` and `multiple_values = true`.",
                                  ),
                              ])
                              .describe(
                                "Specifies how many values are required to satisfy this argument. For example, if you had a `-f <file>` argument where you wanted exactly 3 'files' you would set `number_of_values = 3`, and this argument wouldn't be satisfied unless the user provided 3 and only 3 values.\n\n**NOTE:** Does *not* require `multiple_occurrences = true` to be set. Setting `multiple_occurrences = true` would allow `-f <file> <file> <file> -f <file> <file> <file>` where as *not* setting it would only allow one occurrence of this argument.\n\n**NOTE:** implicitly sets `takes_value = true` and `multiple_values = true`.",
                              )
                              .optional(),
                            possibleValues: z
                              .union([
                                z
                                  .array(z.string())
                                  .describe(
                                    "Specifies a list of possible values for this argument. At runtime, the CLI verifies that only one of the specified values was used, or fails with an error message.",
                                  ),
                                z
                                  .null()
                                  .describe(
                                    "Specifies a list of possible values for this argument. At runtime, the CLI verifies that only one of the specified values was used, or fails with an error message.",
                                  ),
                              ])
                              .describe(
                                "Specifies a list of possible values for this argument. At runtime, the CLI verifies that only one of the specified values was used, or fails with an error message.",
                              )
                              .optional(),
                            minValues: z
                              .union([
                                z
                                  .number()
                                  .int()
                                  .gte(0)
                                  .describe(
                                    "Specifies the minimum number of values for this argument. For example, if you had a -f `<file>` argument where you wanted at least 2 'files', you would set `minValues: 2`, and this argument would be satisfied if the user provided, 2 or more values.",
                                  ),
                                z
                                  .null()
                                  .describe(
                                    "Specifies the minimum number of values for this argument. For example, if you had a -f `<file>` argument where you wanted at least 2 'files', you would set `minValues: 2`, and this argument would be satisfied if the user provided, 2 or more values.",
                                  ),
                              ])
                              .describe(
                                "Specifies the minimum number of values for this argument. For example, if you had a -f `<file>` argument where you wanted at least 2 'files', you would set `minValues: 2`, and this argument would be satisfied if the user provided, 2 or more values.",
                              )
                              .optional(),
                            maxValues: z
                              .union([
                                z
                                  .number()
                                  .int()
                                  .gte(0)
                                  .describe(
                                    "Specifies the maximum number of values are for this argument. For example, if you had a -f `<file>` argument where you wanted up to 3 'files', you would set .max_values(3), and this argument would be satisfied if the user provided, 1, 2, or 3 values.",
                                  ),
                                z
                                  .null()
                                  .describe(
                                    "Specifies the maximum number of values are for this argument. For example, if you had a -f `<file>` argument where you wanted up to 3 'files', you would set .max_values(3), and this argument would be satisfied if the user provided, 1, 2, or 3 values.",
                                  ),
                              ])
                              .describe(
                                "Specifies the maximum number of values are for this argument. For example, if you had a -f `<file>` argument where you wanted up to 3 'files', you would set .max_values(3), and this argument would be satisfied if the user provided, 1, 2, or 3 values.",
                              )
                              .optional(),
                            required: z
                              .boolean()
                              .describe(
                                "Sets whether or not the argument is required by default.\n\n- Required by default means it is required, when no other conflicting rules have been evaluated - Conflicting rules take precedence over being required.",
                              )
                              .default(false),
                            requiredUnlessPresent: z
                              .union([
                                z
                                  .string()
                                  .describe(
                                    "Sets an arg that override this arg's required setting i.e. this arg will be required unless this other argument is present.",
                                  ),
                                z
                                  .null()
                                  .describe(
                                    "Sets an arg that override this arg's required setting i.e. this arg will be required unless this other argument is present.",
                                  ),
                              ])
                              .describe(
                                "Sets an arg that override this arg's required setting i.e. this arg will be required unless this other argument is present.",
                              )
                              .optional(),
                            requiredUnlessPresentAll: z
                              .union([
                                z
                                  .array(z.string())
                                  .describe(
                                    "Sets args that override this arg's required setting i.e. this arg will be required unless all these other arguments are present.",
                                  ),
                                z
                                  .null()
                                  .describe(
                                    "Sets args that override this arg's required setting i.e. this arg will be required unless all these other arguments are present.",
                                  ),
                              ])
                              .describe(
                                "Sets args that override this arg's required setting i.e. this arg will be required unless all these other arguments are present.",
                              )
                              .optional(),
                            requiredUnlessPresentAny: z
                              .union([
                                z
                                  .array(z.string())
                                  .describe(
                                    "Sets args that override this arg's required setting i.e. this arg will be required unless at least one of these other arguments are present.",
                                  ),
                                z
                                  .null()
                                  .describe(
                                    "Sets args that override this arg's required setting i.e. this arg will be required unless at least one of these other arguments are present.",
                                  ),
                              ])
                              .describe(
                                "Sets args that override this arg's required setting i.e. this arg will be required unless at least one of these other arguments are present.",
                              )
                              .optional(),
                            conflictsWith: z
                              .union([
                                z
                                  .string()
                                  .describe(
                                    "Sets a conflicting argument by name i.e. when using this argument, the following argument can't be present and vice versa.",
                                  ),
                                z
                                  .null()
                                  .describe(
                                    "Sets a conflicting argument by name i.e. when using this argument, the following argument can't be present and vice versa.",
                                  ),
                              ])
                              .describe(
                                "Sets a conflicting argument by name i.e. when using this argument, the following argument can't be present and vice versa.",
                              )
                              .optional(),
                            conflictsWithAll: z
                              .union([
                                z
                                  .array(z.string())
                                  .describe(
                                    "The same as conflictsWith but allows specifying multiple two-way conflicts per argument.",
                                  ),
                                z
                                  .null()
                                  .describe(
                                    "The same as conflictsWith but allows specifying multiple two-way conflicts per argument.",
                                  ),
                              ])
                              .describe(
                                "The same as conflictsWith but allows specifying multiple two-way conflicts per argument.",
                              )
                              .optional(),
                            requires: z
                              .union([
                                z
                                  .string()
                                  .describe(
                                    "Tets an argument by name that is required when this one is present i.e. when using this argument, the following argument must be present.",
                                  ),
                                z
                                  .null()
                                  .describe(
                                    "Tets an argument by name that is required when this one is present i.e. when using this argument, the following argument must be present.",
                                  ),
                              ])
                              .describe(
                                "Tets an argument by name that is required when this one is present i.e. when using this argument, the following argument must be present.",
                              )
                              .optional(),
                            requiresAll: z
                              .union([
                                z
                                  .array(z.string())
                                  .describe(
                                    "Sts multiple arguments by names that are required when this one is present i.e. when using this argument, the following arguments must be present.",
                                  ),
                                z
                                  .null()
                                  .describe(
                                    "Sts multiple arguments by names that are required when this one is present i.e. when using this argument, the following arguments must be present.",
                                  ),
                              ])
                              .describe(
                                "Sts multiple arguments by names that are required when this one is present i.e. when using this argument, the following arguments must be present.",
                              )
                              .optional(),
                            requiresIf: z
                              .union([
                                z
                                  .array(z.string())
                                  .describe(
                                    "Allows a conditional requirement with the signature [arg, value] the requirement will only become valid if `arg`'s value equals `${value}`.",
                                  ),
                                z
                                  .null()
                                  .describe(
                                    "Allows a conditional requirement with the signature [arg, value] the requirement will only become valid if `arg`'s value equals `${value}`.",
                                  ),
                              ])
                              .describe(
                                "Allows a conditional requirement with the signature [arg, value] the requirement will only become valid if `arg`'s value equals `${value}`.",
                              )
                              .optional(),
                            requiredIfEq: z
                              .union([
                                z
                                  .array(z.string())
                                  .describe(
                                    "Allows specifying that an argument is required conditionally with the signature [arg, value] the requirement will only become valid if the `arg`'s value equals `${value}`.",
                                  ),
                                z
                                  .null()
                                  .describe(
                                    "Allows specifying that an argument is required conditionally with the signature [arg, value] the requirement will only become valid if the `arg`'s value equals `${value}`.",
                                  ),
                              ])
                              .describe(
                                "Allows specifying that an argument is required conditionally with the signature [arg, value] the requirement will only become valid if the `arg`'s value equals `${value}`.",
                              )
                              .optional(),
                            requireEquals: z
                              .union([
                                z
                                  .boolean()
                                  .describe(
                                    "Requires that options use the --option=val syntax i.e. an equals between the option and associated value.",
                                  ),
                                z
                                  .null()
                                  .describe(
                                    "Requires that options use the --option=val syntax i.e. an equals between the option and associated value.",
                                  ),
                              ])
                              .describe(
                                "Requires that options use the --option=val syntax i.e. an equals between the option and associated value.",
                              )
                              .optional(),
                            index: z
                              .union([
                                z
                                  .number()
                                  .int()
                                  .gte(1)
                                  .describe(
                                    "The positional argument index, starting at 1.\n\nThe index refers to position according to other positional argument. It does not define position in the argument list as a whole. When utilized with multiple=true, only the last positional argument may be defined as multiple (i.e. the one with the highest index).",
                                  ),
                                z
                                  .null()
                                  .describe(
                                    "The positional argument index, starting at 1.\n\nThe index refers to position according to other positional argument. It does not define position in the argument list as a whole. When utilized with multiple=true, only the last positional argument may be defined as multiple (i.e. the one with the highest index).",
                                  ),
                              ])
                              .describe(
                                "The positional argument index, starting at 1.\n\nThe index refers to position according to other positional argument. It does not define position in the argument list as a whole. When utilized with multiple=true, only the last positional argument may be defined as multiple (i.e. the one with the highest index).",
                              )
                              .optional(),
                          })
                          .strict()
                          .describe("A CLI argument definition."),
                      )
                      .describe("List of arguments for the command"),
                    z.null().describe("List of arguments for the command"),
                  ])
                  .describe("List of arguments for the command")
                  .optional(),
                subcommands: z
                  .union([
                    z
                      .record(z.any())
                      .describe("List of subcommands of this command"),
                    z.null().describe("List of subcommands of this command"),
                  ])
                  .describe("List of subcommands of this command")
                  .optional(),
              })
              .strict()
              .describe(
                "describes a CLI configuration\n\nSee more: https://tauri.app/v1/api/config#cliconfig",
              ),
            z.null(),
          ])
          .describe("The CLI configuration.")
          .optional(),
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
                          z
                            .literal("deb")
                            .describe("The debian bundle (.deb)."),
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
                  .describe("A bundle referenced by tauri-bundler.")
                  .describe("A single bundle target."),
              ])
              .describe("Targets to bundle. Each value is case insensitive.")
              .describe(
                'The bundle targets, currently supports ["deb", "rpm", "appimage", "nsis", "msi", "app", "dmg", "updater"] or "all".',
              )
              .default("all"),
            identifier: z
              .string()
              .describe(
                "The application identifier in reverse domain name notation (e.g. `com.tauri.example`). This string must be unique across applications since it is used in system configurations like the bundle ID and path to the webview data directory. This string must contain only alphanumeric characters (A-Z, a-z, and 0-9), hyphens (-), and periods (.).",
              ),
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
                  .describe(
                    "A copyright string associated with your application.",
                  ),
                z
                  .null()
                  .describe(
                    "A copyright string associated with your application.",
                  ),
              ])
              .describe("A copyright string associated with your application.")
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
                  .describe(
                    "A longer, multi-line description of the application.",
                  ),
                z
                  .null()
                  .describe(
                    "A longer, multi-line description of the application.",
                  ),
              ])
              .describe("A longer, multi-line description of the application.")
              .optional(),
            useLocalToolsDir: z
              .boolean()
              .describe(
                "Whether to use the project's `target` directory, for caching build tools (e.g., Wix and NSIS) when building this application. Defaults to `false`.\n\nIf true, tools will be cached in `target\\.tauri-tools`. If false, tools will be cached in the current user's platform-specific cache directory.\n\nAn example where it can be appropriate to set this to `true` is when building this application as a Windows System user (e.g., AWS EC2 workloads), because the Window system's app data directory is restricted.",
              )
              .default(false),
            appimage: z
              .object({
                bundleMediaFramework: z
                  .boolean()
                  .describe(
                    "Include additional gstreamer dependencies needed for audio and video playback. This increases the bundle size by ~15-35MB depending on your build system.",
                  )
                  .default(false),
              })
              .strict()
              .describe(
                "Configuration for AppImage bundles.\n\nSee more: https://tauri.app/v1/api/config#appimageconfig",
              )
              .describe("Configuration for the AppImage bundle.")
              .default({ bundleMediaFramework: false }),
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
                "Configuration for Debian (.deb) bundles.\n\nSee more: https://tauri.app/v1/api/config#debconfig",
              )
              .describe("Configuration for the Debian bundle.")
              .default({ files: {} }),
            rpm: z
              .object({
                license: z
                  .union([
                    z
                      .string()
                      .describe(
                        "The package's license identifier. If not set, defaults to the license from the Cargo.toml file.",
                      ),
                    z
                      .null()
                      .describe(
                        "The package's license identifier. If not set, defaults to the license from the Cargo.toml file.",
                      ),
                  ])
                  .describe(
                    "The package's license identifier. If not set, defaults to the license from the Cargo.toml file.",
                  )
                  .optional(),
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
                        "The list of RPM dependencies your application conflicts with. They must not be present in order for the package to be installed.",
                      ),
                    z
                      .null()
                      .describe(
                        "The list of RPM dependencies your application conflicts with. They must not be present in order for the package to be installed.",
                      ),
                  ])
                  .describe(
                    "The list of RPM dependencies your application conflicts with. They must not be present in order for the package to be installed.",
                  )
                  .optional(),
                obsoletes: z
                  .union([
                    z
                      .array(z.string())
                      .describe(
                        'The list of RPM dependencies your application supersedes - if this package is installed, packages listed as "obsoletes" will be automatically removed (if they are present).',
                      ),
                    z
                      .null()
                      .describe(
                        'The list of RPM dependencies your application supersedes - if this package is installed, packages listed as "obsoletes" will be automatically removed (if they are present).',
                      ),
                  ])
                  .describe(
                    'The list of RPM dependencies your application supersedes - if this package is installed, packages listed as "obsoletes" will be automatically removed (if they are present).',
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
                "Configuration for Apple Disk Image (.dmg) bundles.\n\nSee more: https://tauri.app/v1/api/config#dmgconfig",
              )
              .describe("DMG-specific settings.")
              .default({
                appPosition: { x: 180, y: 170 },
                applicationFolderPosition: { x: 480, y: 170 },
                windowSize: { height: 400, width: 660 },
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
                license: z
                  .union([
                    z
                      .string()
                      .describe(
                        "The path to the license file to add to the DMG bundle.",
                      ),
                    z
                      .null()
                      .describe(
                        "The path to the license file to add to the DMG bundle.",
                      ),
                  ])
                  .describe(
                    "The path to the license file to add to the DMG bundle.",
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
                    "Whether the codesign should enable [hardened runtime] (for executables) or not.\n\n[hardened runtime]: <https://developer.apple.com/documentation/security/hardened_runtime>",
                  )
                  .default(true),
                providerShortName: z
                  .union([
                    z
                      .string()
                      .describe("Provider short name for notarization."),
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
              })
              .strict()
              .describe(
                "Configuration for the macOS bundles.\n\nSee more: https://tauri.app/v1/api/config#macconfig",
              )
              .describe("Configuration for the macOS bundles.")
              .default({
                hardenedRuntime: true,
                minimumSystemVersion: "10.13",
              }),
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
                  .describe(
                    "Specifies the SHA1 hash of the signing certificate.",
                  )
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
                                    "Configuration for a target language for the WiX build.\n\nSee more: https://tauri.app/v1/api/config#wixlanguageconfig",
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
                            z
                              .string()
                              .describe("A custom .wxs template to use."),
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
                        license: z
                          .union([
                            z
                              .string()
                              .describe(
                                "The path to the license file to render on the installer.\n\nMust be an RTF file, so if a different extension is provided, we convert it to the RTF format.",
                              ),
                            z
                              .null()
                              .describe(
                                "The path to the license file to render on the installer.\n\nMust be an RTF file, so if a different extension is provided, we convert it to the RTF format.",
                              ),
                          ])
                          .describe(
                            "The path to the license file to render on the installer.\n\nMust be an RTF file, so if a different extension is provided, we convert it to the RTF format.",
                          )
                          .optional(),
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
                                "Path to a bitmap file to use on the installation user interface dialogs. It is used on the welcome and completion dialogs.\n\nThe required dimensions are 493px × 312px.",
                              ),
                            z
                              .null()
                              .describe(
                                "Path to a bitmap file to use on the installation user interface dialogs. It is used on the welcome and completion dialogs.\n\nThe required dimensions are 493px × 312px.",
                              ),
                          ])
                          .describe(
                            "Path to a bitmap file to use on the installation user interface dialogs. It is used on the welcome and completion dialogs.\n\nThe required dimensions are 493px × 312px.",
                          )
                          .optional(),
                      })
                      .strict()
                      .describe(
                        "Configuration for the MSI bundle using WiX.\n\nSee more: https://tauri.app/v1/api/config#wixconfig",
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
                            z
                              .string()
                              .describe("A custom .nsi template to use."),
                            z.null().describe("A custom .nsi template to use."),
                          ])
                          .describe("A custom .nsi template to use.")
                          .optional(),
                        license: z
                          .union([
                            z
                              .string()
                              .describe(
                                "The path to the license file to render on the installer.",
                              ),
                            z
                              .null()
                              .describe(
                                "The path to the license file to render on the installer.",
                              ),
                          ])
                          .describe(
                            "The path to the license file to render on the installer.",
                          )
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
                                message:
                                  "Invalid input: Should pass single schema",
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
                  .describe(
                    "Configuration for the installer generated with NSIS.",
                  )
                  .optional(),
                signCommand: z
                  .union([
                    z
                      .string()
                      .describe(
                        "Specify a custom command to sign the binaries. This command needs to have a `%1` in it which is just a placeholder for the binary path, which we will detect and replace before calling the command.\n\nExample: ```text sign-cli --arg1 --arg2 %1 ```\n\nBy Default we use `signtool.exe` which can be found only on Windows so if you are on another platform and want to cross-compile and sign you will need to use another tool like `osslsigncode`.",
                      ),
                    z
                      .null()
                      .describe(
                        "Specify a custom command to sign the binaries. This command needs to have a `%1` in it which is just a placeholder for the binary path, which we will detect and replace before calling the command.\n\nExample: ```text sign-cli --arg1 --arg2 %1 ```\n\nBy Default we use `signtool.exe` which can be found only on Windows so if you are on another platform and want to cross-compile and sign you will need to use another tool like `osslsigncode`.",
                      ),
                  ])
                  .describe(
                    "Specify a custom command to sign the binaries. This command needs to have a `%1` in it which is just a placeholder for the binary path, which we will detect and replace before calling the command.\n\nExample: ```text sign-cli --arg1 --arg2 %1 ```\n\nBy Default we use `signtool.exe` which can be found only on Windows so if you are on another platform and want to cross-compile and sign you will need to use another tool like `osslsigncode`.",
                  )
                  .optional(),
              })
              .strict()
              .describe(
                "Windows bundler configuration.\n\nSee more: https://tauri.app/v1/api/config#windowsconfig",
              )
              .describe("Configuration for the Windows bundle.")
              .default({
                allowDowngrades: true,
                certificateThumbprint: null,
                digestAlgorithm: null,
                nsis: null,
                signCommand: null,
                timestampUrl: null,
                tsp: false,
                webviewFixedRuntimePath: null,
                webviewInstallMode: {
                  silent: true,
                  type: "downloadBootstrapper",
                },
                wix: null,
              }),
          })
          .strict()
          .describe(
            "Configuration for tauri-bundler.\n\nSee more: https://tauri.app/v1/api/config#bundleconfig",
          )
          .describe("The bundler configuration.")
          .default({
            active: false,
            appimage: { bundleMediaFramework: false },
            deb: { files: {} },
            dmg: {
              appPosition: { x: 180, y: 170 },
              applicationFolderPosition: { x: 480, y: 170 },
              windowSize: { height: 400, width: 660 },
            },
            icon: [],
            identifier: "",
            macOS: { hardenedRuntime: true, minimumSystemVersion: "10.13" },
            rpm: { epoch: 0, files: {}, release: "1" },
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
              webviewFixedRuntimePath: null,
              webviewInstallMode: {
                silent: true,
                type: "downloadBootstrapper",
              },
              wix: null,
            },
          }),
        allowlist: z
          .object({
            all: z
              .boolean()
              .describe("Use this flag to enable all API features.")
              .default(false),
            fs: z
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
                    "Filesystem scope definition. It is a list of glob patterns that restrict the API access from the webview.\n\nEach pattern can start with a variable that resolves to a system base directory. The variables are: `$AUDIO`, `$CACHE`, `$CONFIG`, `$DATA`, `$LOCALDATA`, `$DESKTOP`, `$DOCUMENT`, `$DOWNLOAD`, `$EXE`, `$FONT`, `$HOME`, `$PICTURE`, `$PUBLIC`, `$RUNTIME`, `$TEMPLATE`, `$VIDEO`, `$RESOURCE`, `$APP`, `$LOG`, `$TEMP`, `$APPCONFIG`, `$APPDATA`, `$APPLOCALDATA`, `$APPCACHE`, `$APPLOG`.",
                  )
                  .describe("The access scope for the filesystem APIs.")
                  .default([]),
                all: z
                  .boolean()
                  .describe(
                    "Use this flag to enable all file system API features.",
                  )
                  .default(false),
                readFile: z
                  .boolean()
                  .describe("Read file from local filesystem.")
                  .default(false),
                writeFile: z
                  .boolean()
                  .describe("Write file to local filesystem.")
                  .default(false),
                readDir: z
                  .boolean()
                  .describe("Read directory from local filesystem.")
                  .default(false),
                copyFile: z
                  .boolean()
                  .describe("Copy file from local filesystem.")
                  .default(false),
                createDir: z
                  .boolean()
                  .describe("Create directory from local filesystem.")
                  .default(false),
                removeDir: z
                  .boolean()
                  .describe("Remove directory from local filesystem.")
                  .default(false),
                removeFile: z
                  .boolean()
                  .describe("Remove file from local filesystem.")
                  .default(false),
                renameFile: z
                  .boolean()
                  .describe("Rename file from local filesystem.")
                  .default(false),
                exists: z
                  .boolean()
                  .describe("Check if path exists on the local filesystem.")
                  .default(false),
              })
              .strict()
              .describe(
                "Allowlist for the file system APIs.\n\nSee more: https://tauri.app/v1/api/config#fsallowlistconfig",
              )
              .describe("File system API allowlist.")
              .default({
                all: false,
                copyFile: false,
                createDir: false,
                exists: false,
                readDir: false,
                readFile: false,
                removeDir: false,
                removeFile: false,
                renameFile: false,
                scope: [],
                writeFile: false,
              }),
            window: z
              .object({
                all: z
                  .boolean()
                  .describe("Use this flag to enable all window API features.")
                  .default(false),
                create: z
                  .boolean()
                  .describe("Allows dynamic window creation.")
                  .default(false),
                center: z
                  .boolean()
                  .describe("Allows centering the window.")
                  .default(false),
                requestUserAttention: z
                  .boolean()
                  .describe("Allows requesting user attention on the window.")
                  .default(false),
                setResizable: z
                  .boolean()
                  .describe("Allows setting the resizable flag of the window.")
                  .default(false),
                setMaximizable: z
                  .boolean()
                  .describe(
                    "Allows setting whether the window's native maximize button is enabled or not.",
                  )
                  .default(false),
                setMinimizable: z
                  .boolean()
                  .describe(
                    "Allows setting whether the window's native minimize button is enabled or not.",
                  )
                  .default(false),
                setClosable: z
                  .boolean()
                  .describe(
                    "Allows setting whether the window's native close button is enabled or not.",
                  )
                  .default(false),
                setTitle: z
                  .boolean()
                  .describe("Allows changing the window title.")
                  .default(false),
                maximize: z
                  .boolean()
                  .describe("Allows maximizing the window.")
                  .default(false),
                unmaximize: z
                  .boolean()
                  .describe("Allows unmaximizing the window.")
                  .default(false),
                minimize: z
                  .boolean()
                  .describe("Allows minimizing the window.")
                  .default(false),
                unminimize: z
                  .boolean()
                  .describe("Allows unminimizing the window.")
                  .default(false),
                show: z
                  .boolean()
                  .describe("Allows showing the window.")
                  .default(false),
                hide: z
                  .boolean()
                  .describe("Allows hiding the window.")
                  .default(false),
                close: z
                  .boolean()
                  .describe("Allows closing the window.")
                  .default(false),
                setDecorations: z
                  .boolean()
                  .describe(
                    "Allows setting the decorations flag of the window.",
                  )
                  .default(false),
                setAlwaysOnTop: z
                  .boolean()
                  .describe(
                    "Allows setting the always_on_top flag of the window.",
                  )
                  .default(false),
                setContentProtected: z
                  .boolean()
                  .describe(
                    "Allows preventing the window contents from being captured by other apps.",
                  )
                  .default(false),
                setSize: z
                  .boolean()
                  .describe("Allows setting the window size.")
                  .default(false),
                setMinSize: z
                  .boolean()
                  .describe("Allows setting the window minimum size.")
                  .default(false),
                setMaxSize: z
                  .boolean()
                  .describe("Allows setting the window maximum size.")
                  .default(false),
                setPosition: z
                  .boolean()
                  .describe("Allows changing the position of the window.")
                  .default(false),
                setFullscreen: z
                  .boolean()
                  .describe("Allows setting the fullscreen flag of the window.")
                  .default(false),
                setFocus: z
                  .boolean()
                  .describe("Allows focusing the window.")
                  .default(false),
                setIcon: z
                  .boolean()
                  .describe("Allows changing the window icon.")
                  .default(false),
                setSkipTaskbar: z
                  .boolean()
                  .describe(
                    "Allows setting the skip_taskbar flag of the window.",
                  )
                  .default(false),
                setCursorGrab: z
                  .boolean()
                  .describe("Allows grabbing the cursor.")
                  .default(false),
                setCursorVisible: z
                  .boolean()
                  .describe("Allows setting the cursor visibility.")
                  .default(false),
                setCursorIcon: z
                  .boolean()
                  .describe("Allows changing the cursor icon.")
                  .default(false),
                setCursorPosition: z
                  .boolean()
                  .describe("Allows setting the cursor position.")
                  .default(false),
                setIgnoreCursorEvents: z
                  .boolean()
                  .describe("Allows ignoring cursor events.")
                  .default(false),
                startDragging: z
                  .boolean()
                  .describe("Allows start dragging on the window.")
                  .default(false),
                print: z
                  .boolean()
                  .describe(
                    "Allows opening the system dialog to print the window content.",
                  )
                  .default(false),
              })
              .strict()
              .describe(
                "Allowlist for the window APIs.\n\nSee more: https://tauri.app/v1/api/config#windowallowlistconfig",
              )
              .describe("Window API allowlist.")
              .default({
                all: false,
                center: false,
                close: false,
                create: false,
                hide: false,
                maximize: false,
                minimize: false,
                print: false,
                requestUserAttention: false,
                setAlwaysOnTop: false,
                setClosable: false,
                setContentProtected: false,
                setCursorGrab: false,
                setCursorIcon: false,
                setCursorPosition: false,
                setCursorVisible: false,
                setDecorations: false,
                setFocus: false,
                setFullscreen: false,
                setIcon: false,
                setIgnoreCursorEvents: false,
                setMaxSize: false,
                setMaximizable: false,
                setMinSize: false,
                setMinimizable: false,
                setPosition: false,
                setResizable: false,
                setSize: false,
                setSkipTaskbar: false,
                setTitle: false,
                show: false,
                startDragging: false,
                unmaximize: false,
                unminimize: false,
              }),
            shell: z
              .object({
                scope: z
                  .array(
                    z
                      .object({
                        name: z
                          .string()
                          .describe(
                            "The name for this allowed shell command configuration.\n\nThis name will be used inside of the webview API to call this command along with any specified arguments.",
                          ),
                        cmd: z
                          .string()
                          .describe(
                            "The command name. It can start with a variable that resolves to a system base directory. The variables are: `$AUDIO`, `$CACHE`, `$CONFIG`, `$DATA`, `$LOCALDATA`, `$DESKTOP`, `$DOCUMENT`, `$DOWNLOAD`, `$EXE`, `$FONT`, `$HOME`, `$PICTURE`, `$PUBLIC`, `$RUNTIME`, `$TEMPLATE`, `$VIDEO`, `$RESOURCE`, `$APP`, `$LOG`, `$TEMP`, `$APPCONFIG`, `$APPDATA`, `$APPLOCALDATA`, `$APPCACHE`, `$APPLOG`.",
                          )
                          .default(""),
                        args: z
                          .union([
                            z
                              .boolean()
                              .describe(
                                "Use a simple boolean to allow all or disable all arguments to this command configuration.",
                              ),
                            z
                              .array(
                                z
                                  .union([
                                    z
                                      .string()
                                      .describe(
                                        "A non-configurable argument that is passed to the command in the order it was specified.",
                                      ),
                                    z
                                      .object({
                                        validator: z
                                          .string()
                                          .describe(
                                            "[regex] validator to require passed values to conform to an expected input.\n\nThis will require the argument value passed to this variable to match the `validator` regex before it will be executed.\n\n[regex]: https://docs.rs/regex/latest/regex/#syntax",
                                          ),
                                      })
                                      .strict()
                                      .describe(
                                        "A variable that is set while calling the command from the webview API.",
                                      ),
                                  ])
                                  .describe(
                                    "A command argument allowed to be executed by the webview API.",
                                  ),
                              )
                              .describe(
                                "A specific set of [`ShellAllowedArg`] that are valid to call for the command configuration.",
                              ),
                          ])
                          .describe(
                            "A set of command arguments allowed to be executed by the webview API.\n\nA value of `true` will allow any arguments to be passed to the command. `false` will disable all arguments. A list of [`ShellAllowedArg`] will set those arguments as the only valid arguments to be passed to the attached command configuration.",
                          )
                          .describe(
                            "The allowed arguments for the command execution.",
                          )
                          .default(false),
                        sidecar: z
                          .boolean()
                          .describe("If this command is a sidecar command.")
                          .default(false),
                      })
                      .describe(
                        "A command allowed to be executed by the webview API.",
                      ),
                  )
                  .describe(
                    "Shell scope definition. It is a list of command names and associated CLI arguments that restrict the API access from the webview.",
                  )
                  .describe(
                    "Access scope for the binary execution APIs. Sidecars are automatically enabled.",
                  )
                  .default([]),
                all: z
                  .boolean()
                  .describe("Use this flag to enable all shell API features.")
                  .default(false),
                execute: z
                  .boolean()
                  .describe("Enable binary execution.")
                  .default(false),
                sidecar: z
                  .boolean()
                  .describe(
                    "Enable sidecar execution, allowing the JavaScript layer to spawn a sidecar command, an executable that is shipped with the application. For more information see <https://tauri.app/v1/guides/building/sidecar>.",
                  )
                  .default(false),
                open: z
                  .union([
                    z
                      .boolean()
                      .describe(
                        "If the shell open API should be enabled.\n\nIf enabled, the default validation regex (`^((mailto:\\w+)|(tel:\\w+)|(https?://\\w+)).+`) is used.",
                      ),
                    z
                      .string()
                      .describe(
                        "Enable the shell open API, with a custom regex that the opened path must match against.\n\nIf using a custom regex to support a non-http(s) schema, care should be used to prevent values that allow flag-like strings to pass validation. e.g. `--enable-debugging`, `-i`, `/R`.",
                      ),
                  ])
                  .describe("Defines the `shell > open` api scope.")
                  .describe("Open URL with the user's default application.")
                  .default(false),
              })
              .strict()
              .describe(
                "Allowlist for the shell APIs.\n\nSee more: https://tauri.app/v1/api/config#shellallowlistconfig",
              )
              .describe("Shell API allowlist.")
              .default({
                all: false,
                execute: false,
                open: false,
                scope: [],
                sidecar: false,
              }),
            dialog: z
              .object({
                all: z
                  .boolean()
                  .describe("Use this flag to enable all dialog API features.")
                  .default(false),
                open: z
                  .boolean()
                  .describe(
                    "Allows the API to open a dialog window to pick files.",
                  )
                  .default(false),
                save: z
                  .boolean()
                  .describe(
                    "Allows the API to open a dialog window to pick where to save files.",
                  )
                  .default(false),
                message: z
                  .boolean()
                  .describe("Allows the API to show a message dialog window.")
                  .default(false),
                ask: z
                  .boolean()
                  .describe(
                    "Allows the API to show a dialog window with Yes/No buttons.",
                  )
                  .default(false),
                confirm: z
                  .boolean()
                  .describe(
                    "Allows the API to show a dialog window with Ok/Cancel buttons.",
                  )
                  .default(false),
              })
              .strict()
              .describe(
                "Allowlist for the dialog APIs.\n\nSee more: https://tauri.app/v1/api/config#dialogallowlistconfig",
              )
              .describe("Dialog API allowlist.")
              .default({
                all: false,
                ask: false,
                confirm: false,
                message: false,
                open: false,
                save: false,
              }),
            http: z
              .object({
                scope: z
                  .array(z.string().url())
                  .describe(
                    'HTTP API scope definition. It is a list of URLs that can be accessed by the webview when using the HTTP APIs. The scoped URL is matched against the request URL using a glob pattern.\n\nExamples: - "https://*": allows all HTTPS urls - "https://*.github.com/tauri-apps/tauri": allows any subdomain of "github.com" with the "tauri-apps/api" path - "https://myapi.service.com/users/*": allows access to any URLs that begins with "https://myapi.service.com/users/"',
                  )
                  .describe("The access scope for the HTTP APIs.")
                  .default([]),
                all: z
                  .boolean()
                  .describe("Use this flag to enable all HTTP API features.")
                  .default(false),
                request: z
                  .boolean()
                  .describe("Allows making HTTP requests.")
                  .default(false),
              })
              .strict()
              .describe(
                "Allowlist for the HTTP APIs.\n\nSee more: https://tauri.app/v1/api/config#httpallowlistconfig",
              )
              .describe("HTTP API allowlist.")
              .default({ all: false, request: false, scope: [] }),
            notification: z
              .object({
                all: z
                  .boolean()
                  .describe(
                    "Use this flag to enable all notification API features.",
                  )
                  .default(false),
              })
              .strict()
              .describe(
                "Allowlist for the notification APIs.\n\nSee more: https://tauri.app/v1/api/config#notificationallowlistconfig",
              )
              .describe("Notification API allowlist.")
              .default({ all: false }),
            globalShortcut: z
              .object({
                all: z
                  .boolean()
                  .describe(
                    "Use this flag to enable all global shortcut API features.",
                  )
                  .default(false),
              })
              .strict()
              .describe(
                "Allowlist for the global shortcut APIs.\n\nSee more: https://tauri.app/v1/api/config#globalshortcutallowlistconfig",
              )
              .describe("Global shortcut API allowlist.")
              .default({ all: false }),
            os: z
              .object({
                all: z
                  .boolean()
                  .describe("Use this flag to enable all OS API features.")
                  .default(false),
              })
              .strict()
              .describe(
                "Allowlist for the OS APIs.\n\nSee more: https://tauri.app/v1/api/config#osallowlistconfig",
              )
              .describe("OS allowlist.")
              .default({ all: false }),
            path: z
              .object({
                all: z
                  .boolean()
                  .describe("Use this flag to enable all path API features.")
                  .default(false),
              })
              .strict()
              .describe(
                "Allowlist for the path APIs.\n\nSee more: https://tauri.app/v1/api/config#pathallowlistconfig",
              )
              .describe("Path API allowlist.")
              .default({ all: false }),
            protocol: z
              .object({
                assetScope: z
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
                    "Filesystem scope definition. It is a list of glob patterns that restrict the API access from the webview.\n\nEach pattern can start with a variable that resolves to a system base directory. The variables are: `$AUDIO`, `$CACHE`, `$CONFIG`, `$DATA`, `$LOCALDATA`, `$DESKTOP`, `$DOCUMENT`, `$DOWNLOAD`, `$EXE`, `$FONT`, `$HOME`, `$PICTURE`, `$PUBLIC`, `$RUNTIME`, `$TEMPLATE`, `$VIDEO`, `$RESOURCE`, `$APP`, `$LOG`, `$TEMP`, `$APPCONFIG`, `$APPDATA`, `$APPLOCALDATA`, `$APPCACHE`, `$APPLOG`.",
                  )
                  .describe("The access scope for the asset protocol.")
                  .default([]),
                all: z
                  .boolean()
                  .describe("Use this flag to enable all custom protocols.")
                  .default(false),
                asset: z
                  .boolean()
                  .describe("Enables the asset protocol.")
                  .default(false),
              })
              .strict()
              .describe(
                "Allowlist for the custom protocols.\n\nSee more: https://tauri.app/v1/api/config#protocolallowlistconfig",
              )
              .describe("Custom protocol allowlist.")
              .default({ all: false, asset: false, assetScope: [] }),
            process: z
              .object({
                all: z
                  .boolean()
                  .describe("Use this flag to enable all process APIs.")
                  .default(false),
                relaunch: z
                  .boolean()
                  .describe("Enables the relaunch API.")
                  .default(false),
                relaunchDangerousAllowSymlinkMacos: z
                  .boolean()
                  .describe(
                    "Dangerous option that allows macOS to relaunch even if the binary contains a symlink.\n\nThis is due to macOS having less symlink protection. Highly recommended to not set this flag unless you have a very specific reason too, and understand the implications of it.",
                  )
                  .default(false),
                exit: z
                  .boolean()
                  .describe("Enables the exit API.")
                  .default(false),
              })
              .strict()
              .describe(
                "Allowlist for the process APIs.\n\nSee more: https://tauri.app/v1/api/config#processallowlistconfig",
              )
              .describe("Process API allowlist.")
              .default({
                all: false,
                exit: false,
                relaunch: false,
                relaunchDangerousAllowSymlinkMacos: false,
              }),
            clipboard: z
              .object({
                all: z
                  .boolean()
                  .describe("Use this flag to enable all clipboard APIs.")
                  .default(false),
                writeText: z
                  .boolean()
                  .describe("Enables the clipboard's `writeText` API.")
                  .default(false),
                readText: z
                  .boolean()
                  .describe("Enables the clipboard's `readText` API.")
                  .default(false),
              })
              .strict()
              .describe(
                "Allowlist for the clipboard APIs.\n\nSee more: https://tauri.app/v1/api/config#clipboardallowlistconfig",
              )
              .describe("Clipboard APIs allowlist.")
              .default({ all: false, readText: false, writeText: false }),
            app: z
              .object({
                all: z
                  .boolean()
                  .describe("Use this flag to enable all app APIs.")
                  .default(false),
                show: z
                  .boolean()
                  .describe("Enables the app's `show` API.")
                  .default(false),
                hide: z
                  .boolean()
                  .describe("Enables the app's `hide` API.")
                  .default(false),
              })
              .strict()
              .describe(
                "Allowlist for the app APIs.\n\nSee more: https://tauri.app/v1/api/config#appallowlistconfig",
              )
              .describe("App APIs allowlist.")
              .default({ all: false, hide: false, show: false }),
          })
          .strict()
          .describe(
            'Allowlist configuration. The allowlist is a translation of the [Cargo allowlist features](https://docs.rs/tauri/latest/tauri/#cargo-allowlist-features).\n\n# Notes\n\n- Endpoints that don\'t have their own allowlist option are enabled by default. - There is only "opt-in", no "opt-out". Setting an option to `false` has no effect.\n\n# Examples\n\n- * [`"app-all": true`](https://tauri.app/v1/api/config/#appallowlistconfig.all) will make the [hide](https://tauri.app/v1/api/js/app#hide) endpoint be available regardless of whether `hide` is set to `false` or `true` in the allowlist.',
          )
          .describe("The allowlist configuration.")
          .default({
            all: false,
            app: { all: false, hide: false, show: false },
            clipboard: { all: false, readText: false, writeText: false },
            dialog: {
              all: false,
              ask: false,
              confirm: false,
              message: false,
              open: false,
              save: false,
            },
            fs: {
              all: false,
              copyFile: false,
              createDir: false,
              exists: false,
              readDir: false,
              readFile: false,
              removeDir: false,
              removeFile: false,
              renameFile: false,
              scope: [],
              writeFile: false,
            },
            globalShortcut: { all: false },
            http: { all: false, request: false, scope: [] },
            notification: { all: false },
            os: { all: false },
            path: { all: false },
            process: {
              all: false,
              exit: false,
              relaunch: false,
              relaunchDangerousAllowSymlinkMacos: false,
            },
            protocol: { all: false, asset: false, assetScope: [] },
            shell: {
              all: false,
              execute: false,
              open: false,
              scope: [],
              sidecar: false,
            },
            window: {
              all: false,
              center: false,
              close: false,
              create: false,
              hide: false,
              maximize: false,
              minimize: false,
              print: false,
              requestUserAttention: false,
              setAlwaysOnTop: false,
              setClosable: false,
              setContentProtected: false,
              setCursorGrab: false,
              setCursorIcon: false,
              setCursorPosition: false,
              setCursorVisible: false,
              setDecorations: false,
              setFocus: false,
              setFullscreen: false,
              setIcon: false,
              setIgnoreCursorEvents: false,
              setMaxSize: false,
              setMaximizable: false,
              setMinSize: false,
              setMinimizable: false,
              setPosition: false,
              setResizable: false,
              setSize: false,
              setSkipTaskbar: false,
              setTitle: false,
              show: false,
              startDragging: false,
              unmaximize: false,
              unminimize: false,
            },
          }),
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
            dangerousRemoteDomainIpcAccess: z
              .array(
                z
                  .object({
                    scheme: z
                      .union([
                        z
                          .string()
                          .describe(
                            "The URL scheme to allow. By default, all schemas are allowed.",
                          ),
                        z
                          .null()
                          .describe(
                            "The URL scheme to allow. By default, all schemas are allowed.",
                          ),
                      ])
                      .describe(
                        "The URL scheme to allow. By default, all schemas are allowed.",
                      )
                      .optional(),
                    domain: z.string().describe("The domain to allow."),
                    windows: z
                      .array(z.string())
                      .describe(
                        "The list of window labels this scope applies to.",
                      ),
                    plugins: z
                      .array(z.string())
                      .describe(
                        'The list of plugins that are allowed in this scope. The names should be without the `tauri-plugin-` prefix, for example `"store"` for `tauri-plugin-store`.',
                      )
                      .default([]),
                    enableTauriAPI: z
                      .boolean()
                      .describe("Enables access to the Tauri API.")
                      .default(false),
                  })
                  .strict()
                  .describe("External command access definition."),
              )
              .describe(
                "Allow external domains to send command to Tauri.\n\nBy default, external domains do not have access to `window.__TAURI__`, which means they cannot communicate with the commands defined in Rust. This prevents attacks where an externally loaded malicious or compromised sites could start executing commands on the user's device.\n\nThis configuration allows a set of external domains to have access to the Tauri commands. When you configure a domain to be allowed to access the IPC, all subpaths are allowed. Subdomains are not allowed.\n\n**WARNING:** Only use this option if you either have internal checks against malicious external sites or you can trust the allowed external sites. You application might be vulnerable to dangerous Tauri command related attacks otherwise.",
              )
              .default([]),
            dangerousUseHttpScheme: z
              .boolean()
              .describe(
                "Sets whether the custom protocols should use `http://<scheme>.localhost` instead of the default `https://<scheme>.localhost` on Windows.\n\n**WARNING:** Using a `http` scheme will allow mixed content when trying to fetch `http` endpoints and is therefore less secure but will match the behavior of the `<scheme>://localhost` protocols used on macOS and Linux.",
              )
              .default(false),
          })
          .strict()
          .describe(
            "Security configuration.\n\nSee more: https://tauri.app/v1/api/config#securityconfig",
          )
          .describe("Security configuration.")
          .default({
            dangerousDisableAssetCspModification: false,
            dangerousRemoteDomainIpcAccess: [],
            dangerousUseHttpScheme: false,
            freezePrototype: false,
          }),
        updater: z
          .object({
            active: z
              .boolean()
              .describe("Whether the updater is active or not.")
              .default(false),
            dialog: z
              .boolean()
              .describe(
                "Display built-in dialog or use event system if disabled.",
              )
              .default(true),
            endpoints: z
              .union([
                z
                  .array(
                    z
                      .string()
                      .url()
                      .describe(
                        "A URL to an updater server.\n\nThe URL must use the `https` scheme on production.",
                      ),
                  )
                  .describe(
                    'The updater endpoints. TLS is enforced on production.\n\nThe updater URL can contain the following variables: - {{current_version}}: The version of the app that is requesting the update - {{target}}: The operating system name (one of `linux`, `windows` or `darwin`). - {{arch}}: The architecture of the machine (one of `x86_64`, `i686`, `aarch64` or `armv7`).\n\n# Examples - "https://my.cdn.com/latest.json": a raw JSON endpoint that returns the latest version and download links for each platform. - "https://updates.app.dev/{{target}}?version={{current_version}}&arch={{arch}}": a dedicated API with positional and query string arguments.',
                  ),
                z
                  .null()
                  .describe(
                    'The updater endpoints. TLS is enforced on production.\n\nThe updater URL can contain the following variables: - {{current_version}}: The version of the app that is requesting the update - {{target}}: The operating system name (one of `linux`, `windows` or `darwin`). - {{arch}}: The architecture of the machine (one of `x86_64`, `i686`, `aarch64` or `armv7`).\n\n# Examples - "https://my.cdn.com/latest.json": a raw JSON endpoint that returns the latest version and download links for each platform. - "https://updates.app.dev/{{target}}?version={{current_version}}&arch={{arch}}": a dedicated API with positional and query string arguments.',
                  ),
              ])
              .describe(
                'The updater endpoints. TLS is enforced on production.\n\nThe updater URL can contain the following variables: - {{current_version}}: The version of the app that is requesting the update - {{target}}: The operating system name (one of `linux`, `windows` or `darwin`). - {{arch}}: The architecture of the machine (one of `x86_64`, `i686`, `aarch64` or `armv7`).\n\n# Examples - "https://my.cdn.com/latest.json": a raw JSON endpoint that returns the latest version and download links for each platform. - "https://updates.app.dev/{{target}}?version={{current_version}}&arch={{arch}}": a dedicated API with positional and query string arguments.',
              )
              .optional(),
            pubkey: z.string().describe("Signature public key.").default(""),
            windows: z
              .object({
                installerArgs: z
                  .array(z.string())
                  .describe(
                    "Additional arguments given to the NSIS or WiX installer.",
                  )
                  .default([]),
                installMode: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [
                      z
                        .literal("basicUi")
                        .describe(
                          "Specifies there's a basic UI during the installation process, including a final dialog box at the end.",
                        ),
                      z
                        .literal("quiet")
                        .describe(
                          "The quiet mode means there's no user interaction required. Requires admin privileges if the installer does.",
                        ),
                      z
                        .literal("passive")
                        .describe(
                          "Specifies unattended mode, which means the installation only shows a progress bar.",
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
                  .describe("Install modes for the Windows update.")
                  .describe(
                    "The installation mode for the update on Windows. Defaults to `passive`.",
                  )
                  .default("passive"),
              })
              .strict()
              .describe(
                "The updater configuration for Windows.\n\nSee more: https://tauri.app/v1/api/config#updaterwindowsconfig",
              )
              .describe("The Windows configuration for the updater.")
              .default({ installMode: "passive", installerArgs: [] }),
          })
          .strict()
          .describe(
            "The Updater configuration object.\n\nSee more: https://tauri.app/v1/api/config#updaterconfig",
          )
          .describe("The updater configuration.")
          .default({
            active: false,
            dialog: true,
            pubkey: "",
            windows: { installMode: "passive", installerArgs: [] },
          }),
        systemTray: z
          .union([
            z
              .object({
                iconPath: z
                  .string()
                  .describe(
                    "Path to the default icon to use on the system tray.",
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
              })
              .strict()
              .describe(
                "Configuration for application system tray icon.\n\nSee more: https://tauri.app/v1/api/config#systemtrayconfig",
              ),
            z.null(),
          ])
          .describe("Configuration for app system tray.")
          .optional(),
        macOSPrivateApi: z
          .boolean()
          .describe(
            "MacOS private API configuration. Enables the transparent background API and sets the `fullScreenEnabled` preference to `true`.",
          )
          .default(false),
      })
      .strict()
      .describe(
        "The Tauri configuration object.\n\nSee more: https://tauri.app/v1/api/config#tauriconfig",
      )
      .describe("The Tauri configuration.")
      .default({
        allowlist: {
          all: false,
          app: { all: false, hide: false, show: false },
          clipboard: { all: false, readText: false, writeText: false },
          dialog: {
            all: false,
            ask: false,
            confirm: false,
            message: false,
            open: false,
            save: false,
          },
          fs: {
            all: false,
            copyFile: false,
            createDir: false,
            exists: false,
            readDir: false,
            readFile: false,
            removeDir: false,
            removeFile: false,
            renameFile: false,
            scope: [],
            writeFile: false,
          },
          globalShortcut: { all: false },
          http: { all: false, request: false, scope: [] },
          notification: { all: false },
          os: { all: false },
          path: { all: false },
          process: {
            all: false,
            exit: false,
            relaunch: false,
            relaunchDangerousAllowSymlinkMacos: false,
          },
          protocol: { all: false, asset: false, assetScope: [] },
          shell: {
            all: false,
            execute: false,
            open: false,
            scope: [],
            sidecar: false,
          },
          window: {
            all: false,
            center: false,
            close: false,
            create: false,
            hide: false,
            maximize: false,
            minimize: false,
            print: false,
            requestUserAttention: false,
            setAlwaysOnTop: false,
            setClosable: false,
            setContentProtected: false,
            setCursorGrab: false,
            setCursorIcon: false,
            setCursorPosition: false,
            setCursorVisible: false,
            setDecorations: false,
            setFocus: false,
            setFullscreen: false,
            setIcon: false,
            setIgnoreCursorEvents: false,
            setMaxSize: false,
            setMaximizable: false,
            setMinSize: false,
            setMinimizable: false,
            setPosition: false,
            setResizable: false,
            setSize: false,
            setSkipTaskbar: false,
            setTitle: false,
            show: false,
            startDragging: false,
            unmaximize: false,
            unminimize: false,
          },
        },
        bundle: {
          active: false,
          appimage: { bundleMediaFramework: false },
          deb: { files: {} },
          dmg: {
            appPosition: { x: 180, y: 170 },
            applicationFolderPosition: { x: 480, y: 170 },
            windowSize: { height: 400, width: 660 },
          },
          icon: [],
          identifier: "",
          macOS: { hardenedRuntime: true, minimumSystemVersion: "10.13" },
          rpm: { epoch: 0, files: {}, release: "1" },
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
            webviewFixedRuntimePath: null,
            webviewInstallMode: { silent: true, type: "downloadBootstrapper" },
            wix: null,
          },
        },
        macOSPrivateApi: false,
        pattern: { use: "brownfield" },
        security: {
          dangerousDisableAssetCspModification: false,
          dangerousRemoteDomainIpcAccess: [],
          dangerousUseHttpScheme: false,
          freezePrototype: false,
        },
        updater: {
          active: false,
          dialog: true,
          pubkey: "",
          windows: { installMode: "passive", installerArgs: [] },
        },
        windows: [],
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
        devPath: z
          .union([
            z
              .union([
                z.string().url().describe("An external URL."),
                z
                  .string()
                  .describe(
                    "The path portion of an app URL. For instance, to load `tauri://localhost/users/john`, you can simply provide `users/john` in this configuration.",
                  ),
              ])
              .describe("An URL to open on a Tauri webview window.")
              .describe(
                "The app's external URL, or the path to the directory containing the app assets.",
              ),
            z
              .array(z.string())
              .describe("An array of files to embed on the app."),
          ])
          .describe("Defines the URL or assets to embed in the application.")
          .describe(
            "The path to the application assets or URL to load in development.\n\nThis is usually an URL to a dev server, which serves your application assets with live reloading. Most modern JavaScript bundlers provides a way to start a dev server by default.\n\nSee [vite](https://vitejs.dev/guide/), [Webpack DevServer](https://webpack.js.org/configuration/dev-server/) and [sirv](https://github.com/lukeed/sirv) for examples on how to set up a dev server.",
          )
          .default("http://localhost:8080/"),
        distDir: z
          .union([
            z
              .union([
                z.string().url().describe("An external URL."),
                z
                  .string()
                  .describe(
                    "The path portion of an app URL. For instance, to load `tauri://localhost/users/john`, you can simply provide `users/john` in this configuration.",
                  ),
              ])
              .describe("An URL to open on a Tauri webview window.")
              .describe(
                "The app's external URL, or the path to the directory containing the app assets.",
              ),
            z
              .array(z.string())
              .describe("An array of files to embed on the app."),
          ])
          .describe("Defines the URL or assets to embed in the application.")
          .describe(
            "The path to the application assets or URL to load in production.\n\nWhen a path relative to the configuration file is provided, it is read recursively and all files are embedded in the application binary. Tauri then looks for an `index.html` file unless you provide a custom window URL.\n\nYou can also provide a list of paths to be embedded, which allows granular control over what files are added to the binary. In this case, all files are added to the root and you must reference it that way in your HTML files.\n\nWhen an URL is provided, the application won't have bundled assets and the application will load that URL by default.",
          )
          .default("../dist"),
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
            "A shell command to run before `tauri dev` kicks in.\n\nThe TAURI_PLATFORM, TAURI_ARCH, TAURI_FAMILY, TAURI_PLATFORM_VERSION, TAURI_PLATFORM_TYPE and TAURI_DEBUG environment variables are set if you perform conditional compilation.",
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
            "A shell command to run before `tauri build` kicks in.\n\nThe TAURI_PLATFORM, TAURI_ARCH, TAURI_FAMILY, TAURI_PLATFORM_VERSION, TAURI_PLATFORM_TYPE and TAURI_DEBUG environment variables are set if you perform conditional compilation.",
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
            "A shell command to run before the bundling phase in `tauri build` kicks in.\n\nThe TAURI_PLATFORM, TAURI_ARCH, TAURI_FAMILY, TAURI_PLATFORM_VERSION, TAURI_PLATFORM_TYPE and TAURI_DEBUG environment variables are set if you perform conditional compilation.",
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
        withGlobalTauri: z
          .boolean()
          .describe(
            "Whether we should inject the Tauri API on `window.__TAURI__` or not.",
          )
          .default(false),
      })
      .strict()
      .describe(
        "The Build configuration object.\n\nSee more: https://tauri.app/v1/api/config#buildconfig",
      )
      .describe("The build configuration.")
      .default({
        devPath: "http://localhost:8080/",
        distDir: "../dist",
        withGlobalTauri: false,
      }),
    plugins: z
      .record(z.any())
      .describe(
        "The plugin configs holds a HashMap mapping a plugin name to its configuration object.\n\nSee more: https://tauri.app/v1/api/config#pluginconfig",
      )
      .describe("The plugins config.")
      .default({}),
  })
  .strict()
  .describe(
    'The Tauri configuration object. It is read from a file where you can define your frontend assets, configure the bundler, enable the app updater, define a system tray, enable APIs via the allowlist and more.\n\nThe configuration file is generated by the [`tauri init`](https://tauri.app/v1/api/cli#init) command that lives in your Tauri application source directory (src-tauri).\n\nOnce generated, you may modify it at will to customize your Tauri application.\n\n## File Formats\n\nBy default, the configuration is defined as a JSON file named `tauri.conf.json`.\n\nTauri also supports JSON5 and TOML files via the `config-json5` and `config-toml` Cargo features, respectively. The JSON5 file name must be either `tauri.conf.json` or `tauri.conf.json5`. The TOML file name is `Tauri.toml`.\n\n## Platform-Specific Configuration\n\nIn addition to the default configuration file, Tauri can read a platform-specific configuration from `tauri.linux.conf.json`, `tauri.windows.conf.json`, and `tauri.macos.conf.json` (or `Tauri.linux.toml`, `Tauri.windows.toml` and `Tauri.macos.toml` if the `Tauri.toml` format is used), which gets merged with the main configuration object.\n\n## Configuration Structure\n\nThe configuration is composed of the following objects:\n\n- [`package`](#packageconfig): Package settings - [`tauri`](#tauriconfig): The Tauri config - [`build`](#buildconfig): The build configuration - [`plugins`](#pluginconfig): The plugins config\n\nExample tauri.config.json file:\n\n```json { "build": { "beforeBuildCommand": "", "beforeDevCommand": "", "devPath": "../dist", "distDir": "../dist" }, "package": { "productName": "tauri-app", "version": "0.1.0" }, "tauri": { "allowlist": { "all": true }, "bundle": {}, "security": { "csp": null }, "updater": { "active": false }, "windows": [ { "fullscreen": false, "height": 600, "resizable": true, "title": "Tauri App", "width": 800 } ] } } ```',
  );
