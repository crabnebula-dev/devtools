import { describe } from "vitest";
import { normalizeSpans } from "../normalizeSpans";
import { spans } from "./fixtures/spans";

describe("normalizeSpans", () => {
    it("should accept an array of time ranges and return an array of normalized time ranges", () => {
        expect(normalizeSpans(spans)).toMatchInlineSnapshot(`
          [
            {
              "children": [
                {
                  "children": [
                    {
                      "children": [
                        {
                          "children": [
                            {
                              "children": [],
                              "createdAt": {
                                "nanos": 893712833,
                                "seconds": 1699978193n,
                              },
                              "enteredAt": {
                                "nanos": 893730500,
                                "seconds": 1699978193n,
                              },
                              "exitedAt": {
                                "nanos": 893802916,
                                "seconds": 1699978193n,
                              },
                              "fields": [
                                {
                                  "metadataId": 4355177280n,
                                  "name": "id",
                                  "value": {
                                    "oneofKind": "u64Val",
                                    "u64Val": 429419170381812416n,
                                  },
                                },
                                {
                                  "metadataId": 4355177280n,
                                  "name": "response",
                                  "value": {
                                    "oneofKind": "strVal",
                                    "strVal": "Ok(Bool(false))",
                                  },
                                },
                              ],
                              "id": 274877906945n,
                              "metadataId": 4355177280n,
                            },
                            {
                              "children": [],
                              "createdAt": {
                                "nanos": 893712833,
                                "seconds": 1699978193n,
                              },
                              "fields": [
                                {
                                  "metadataId": 4355177280n,
                                  "name": "id",
                                  "value": {
                                    "oneofKind": "u64Val",
                                    "u64Val": 429419170381812416n,
                                  },
                                },
                                {
                                  "metadataId": 4355177280n,
                                  "name": "response",
                                  "value": {
                                    "oneofKind": "strVal",
                                    "strVal": "Ok(Bool(false))",
                                  },
                                },
                              ],
                              "id": 274877906945n,
                              "metadataId": 4355177280n,
                            },
                          ],
                          "createdAt": {
                            "nanos": 893303458,
                            "seconds": 1699978193n,
                          },
                          "enteredAt": {
                            "nanos": 893827166,
                            "seconds": 1699978193n,
                          },
                          "exitedAt": {
                            "nanos": 893828416,
                            "seconds": 1699978193n,
                          },
                          "fields": [
                            {
                              "metadataId": 4355176888n,
                              "name": "id",
                              "value": {
                                "oneofKind": "u64Val",
                                "u64Val": 429419170381812416n,
                              },
                            },
                          ],
                          "id": 4503599627370500n,
                          "metadataId": 4355176888n,
                        },
                        {
                          "children": [],
                          "createdAt": {
                            "nanos": 893303458,
                            "seconds": 1699978193n,
                          },
                          "fields": [
                            {
                              "metadataId": 4355176888n,
                              "name": "id",
                              "value": {
                                "oneofKind": "u64Val",
                                "u64Val": 429419170381812416n,
                              },
                            },
                          ],
                          "id": 4503599627370500n,
                          "metadataId": 4355176888n,
                        },
                      ],
                      "createdAt": {
                        "nanos": 893129041,
                        "seconds": 1699978193n,
                      },
                      "enteredAt": {
                        "nanos": 893131750,
                        "seconds": 1699978193n,
                      },
                      "exitedAt": {
                        "nanos": 893599208,
                        "seconds": 1699978193n,
                      },
                      "fields": [
                        {
                          "metadataId": 4355177584n,
                          "name": "id",
                          "value": {
                            "oneofKind": "u64Val",
                            "u64Val": 429419170381812416n,
                          },
                        },
                        {
                          "metadataId": 4355177584n,
                          "name": "cmd",
                          "value": {
                            "oneofKind": "strVal",
                            "strVal": "tauri",
                          },
                        },
                      ],
                      "id": 2251799813685249n,
                      "metadataId": 4355177584n,
                    },
                    {
                      "children": [],
                      "createdAt": {
                        "nanos": 893129041,
                        "seconds": 1699978193n,
                      },
                      "fields": [
                        {
                          "metadataId": 4355177584n,
                          "name": "id",
                          "value": {
                            "oneofKind": "u64Val",
                            "u64Val": 429419170381812416n,
                          },
                        },
                        {
                          "metadataId": 4355177584n,
                          "name": "cmd",
                          "value": {
                            "oneofKind": "strVal",
                            "strVal": "tauri",
                          },
                        },
                      ],
                      "id": 2251799813685249n,
                      "metadataId": 4355177584n,
                    },
                  ],
                  "createdAt": {
                    "nanos": 893004458,
                    "seconds": 1699978193n,
                  },
                  "enteredAt": {
                    "nanos": 893009708,
                    "seconds": 1699978193n,
                  },
                  "exitedAt": {
                    "nanos": 893601500,
                    "seconds": 1699978193n,
                  },
                  "fields": [
                    {
                      "metadataId": 4355177432n,
                      "name": "id",
                      "value": {
                        "oneofKind": "u64Val",
                        "u64Val": 429419170381812416n,
                      },
                    },
                    {
                      "metadataId": 4355177432n,
                      "name": "kind",
                      "value": {
                        "oneofKind": "strVal",
                        "strVal": "post-message",
                      },
                    },
                  ],
                  "id": 6755399441055746n,
                  "metadataId": 4355177432n,
                },
                {
                  "children": [],
                  "createdAt": {
                    "nanos": 893004458,
                    "seconds": 1699978193n,
                  },
                  "fields": [
                    {
                      "metadataId": 4355177432n,
                      "name": "id",
                      "value": {
                        "oneofKind": "u64Val",
                        "u64Val": 429419170381812416n,
                      },
                    },
                    {
                      "metadataId": 4355177432n,
                      "name": "kind",
                      "value": {
                        "oneofKind": "strVal",
                        "strVal": "post-message",
                      },
                    },
                  ],
                  "id": 6755399441055746n,
                  "metadataId": 4355177432n,
                },
              ],
              "createdAt": {
                "nanos": 892960958,
                "seconds": 1699978193n,
              },
              "enteredAt": {
                "nanos": 892967541,
                "seconds": 1699978193n,
              },
              "exitedAt": {
                "nanos": 893603083,
                "seconds": 1699978193n,
              },
              "fields": [],
              "id": 4503599627370499n,
              "marginLeft": 6.575572574072218,
              "metadataId": 4355189520n,
              "width": 25.642879272952595,
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "children": [
                        {
                          "children": [],
                          "createdAt": {
                            "nanos": 893708916,
                            "seconds": 1699978193n,
                          },
                          "enteredAt": {
                            "nanos": 893711250,
                            "seconds": 1699978193n,
                          },
                          "exitedAt": {
                            "nanos": 893717666,
                            "seconds": 1699978193n,
                          },
                          "fields": [
                            {
                              "metadataId": 4355178072n,
                              "name": "name",
                              "value": {
                                "oneofKind": "strVal",
                                "strVal": "probe",
                              },
                            },
                          ],
                          "id": 8n,
                          "metadataId": 4355178072n,
                        },
                        {
                          "children": [],
                          "createdAt": {
                            "nanos": 893708916,
                            "seconds": 1699978193n,
                          },
                          "fields": [
                            {
                              "metadataId": 4355178072n,
                              "name": "name",
                              "value": {
                                "oneofKind": "strVal",
                                "strVal": "probe",
                              },
                            },
                          ],
                          "id": 8n,
                          "metadataId": 4355178072n,
                        },
                      ],
                      "createdAt": {
                        "nanos": 893658208,
                        "seconds": 1699978193n,
                      },
                      "enteredAt": {
                        "nanos": 893660416,
                        "seconds": 1699978193n,
                      },
                      "exitedAt": {
                        "nanos": 893725958,
                        "seconds": 1699978193n,
                      },
                      "fields": [
                        {
                          "metadataId": 4355177584n,
                          "name": "id",
                          "value": {
                            "oneofKind": "u64Val",
                            "u64Val": 11569623516352671744n,
                          },
                        },
                        {
                          "metadataId": 4355177584n,
                          "name": "cmd",
                          "value": {
                            "oneofKind": "strVal",
                            "strVal": "__initialized",
                          },
                        },
                      ],
                      "id": 7n,
                      "metadataId": 4355177584n,
                    },
                    {
                      "children": [],
                      "createdAt": {
                        "nanos": 893658208,
                        "seconds": 1699978193n,
                      },
                      "fields": [
                        {
                          "metadataId": 4355177584n,
                          "name": "id",
                          "value": {
                            "oneofKind": "u64Val",
                            "u64Val": 11569623516352671744n,
                          },
                        },
                        {
                          "metadataId": 4355177584n,
                          "name": "cmd",
                          "value": {
                            "oneofKind": "strVal",
                            "strVal": "__initialized",
                          },
                        },
                      ],
                      "id": 7n,
                      "metadataId": 4355177584n,
                    },
                  ],
                  "createdAt": {
                    "nanos": 893644208,
                    "seconds": 1699978193n,
                  },
                  "enteredAt": {
                    "nanos": 893647000,
                    "seconds": 1699978193n,
                  },
                  "exitedAt": {
                    "nanos": 893728666,
                    "seconds": 1699978193n,
                  },
                  "fields": [
                    {
                      "metadataId": 4355177432n,
                      "name": "id",
                      "value": {
                        "oneofKind": "u64Val",
                        "u64Val": 11569623516352671744n,
                      },
                    },
                    {
                      "metadataId": 4355177432n,
                      "name": "kind",
                      "value": {
                        "oneofKind": "strVal",
                        "strVal": "post-message",
                      },
                    },
                  ],
                  "id": 6n,
                  "metadataId": 4355177432n,
                },
                {
                  "children": [],
                  "createdAt": {
                    "nanos": 893644208,
                    "seconds": 1699978193n,
                  },
                  "fields": [
                    {
                      "metadataId": 4355177432n,
                      "name": "id",
                      "value": {
                        "oneofKind": "u64Val",
                        "u64Val": 11569623516352671744n,
                      },
                    },
                    {
                      "metadataId": 4355177432n,
                      "name": "kind",
                      "value": {
                        "oneofKind": "strVal",
                        "strVal": "post-message",
                      },
                    },
                  ],
                  "id": 6n,
                  "metadataId": 4355177432n,
                },
              ],
              "createdAt": {
                "nanos": 893632666,
                "seconds": 1699978193n,
              },
              "enteredAt": {
                "nanos": 893634791,
                "seconds": 1699978193n,
              },
              "exitedAt": {
                "nanos": 893732125,
                "seconds": 1699978193n,
              },
              "fields": [],
              "id": 5n,
              "marginLeft": 0.17410540758376766,
              "metadataId": 4355189520n,
              "width": 3.9244035939275017,
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "children": [
                        {
                          "children": [
                            {
                              "children": [],
                              "createdAt": {
                                "nanos": 441073416,
                                "seconds": 1699978195n,
                              },
                              "enteredAt": {
                                "nanos": 113892041,
                                "seconds": 1699978201n,
                              },
                              "exitedAt": {
                                "nanos": 113896041,
                                "seconds": 1699978201n,
                              },
                              "fields": [
                                {
                                  "metadataId": 4354778704n,
                                  "name": "id",
                                  "value": {
                                    "oneofKind": "u64Val",
                                    "u64Val": 1066188670690238080n,
                                  },
                                },
                              ],
                              "id": 9n,
                              "metadataId": 4354778704n,
                            },
                            {
                              "children": [
                                {
                                  "children": [],
                                  "createdAt": {
                                    "nanos": 114651666,
                                    "seconds": 1699978201n,
                                  },
                                  "enteredAt": {
                                    "nanos": 114678958,
                                    "seconds": 1699978201n,
                                  },
                                  "exitedAt": {
                                    "nanos": 117655291,
                                    "seconds": 1699978201n,
                                  },
                                  "fields": [
                                    {
                                      "metadataId": 4355177280n,
                                      "name": "id",
                                      "value": {
                                        "oneofKind": "u64Val",
                                        "u64Val": 1066188670690238080n,
                                      },
                                    },
                                    {
                                      "metadataId": 4355177280n,
                                      "name": "response",
                                      "value": {
                                        "oneofKind": "strVal",
                                        "strVal": "Ok(String(\\"<!doctype html>\\\\n<html lang=\\\\\\"en-US\\\\\\">\\\\n  <head>\\\\n    <meta charset=\\\\\\"utf-8\\\\\\">\\\\n    <title>\\\\n            Rust Programming Language\\\\n        </title>\\\\n    <meta name=\\\\\\"viewport\\\\\\" content=\\\\\\"width=device-width,initial-scale=1.0\\\\\\">\\\\n    <meta name=\\\\\\"description\\\\\\" content=\\\\\\"A language empowering everyone to build reliable and efficient software.\\\\\\">\\\\n\\\\n    <!-- Twitter card -->\\\\n    <meta name=\\\\\\"twitter:card\\\\\\" content=\\\\\\"summary\\\\\\">\\\\n    <meta name=\\\\\\"twitter:site\\\\\\" content=\\\\\\"@rustlang\\\\\\">\\\\n    <meta name=\\\\\\"twitter:creator\\\\\\" content=\\\\\\"@rustlang\\\\\\">\\\\n    <meta name=\\\\\\"twitter:title\\\\\\" content=\\\\\\"\\\\\\">\\\\n    <meta name=\\\\\\"twitter:description\\\\\\" content=\\\\\\"A language empowering everyone to build reliable and efficient software.\\\\\\">\\\\n    <meta name=\\\\\\"twitter:image\\\\\\" content=\\\\\\"https://www.rust-lang.org/static/images/rust-social.jpg\\\\\\">\\\\n\\\\n    <!-- Facebook OpenGraph -->\\\\n    <meta property=\\\\\\"og:title\\\\\\" content=\\\\\\"\\\\\\" />\\\\n    <meta property=\\\\\\"og:description\\\\\\" content=\\\\\\"A language empowering everyone to build reliable and efficient software.\\\\\\">\\\\n    <meta property=\\\\\\"og:image\\\\\\" content=\\\\\\"https://www.rust-lang.org/static/images/rust-social-wide.jpg\\\\\\" />\\\\n    <meta property=\\\\\\"og:type\\\\\\" content=\\\\\\"website\\\\\\" />\\\\n    <meta property=\\\\\\"og:locale\\\\\\" content=\\\\\\"en_US\\\\\\" />\\\\n\\\\n    <!-- styles -->\\\\n    <link rel=\\\\\\"stylesheet\\\\\\" href=\\\\\\"/static/styles/a11y-dark.css\\\\\\"/>\\\\n    <link rel=\\\\\\"stylesheet\\\\\\" href=\\\\\\"/static/styles/vendor_10880690442070639967.css\\\\\\"/>\\\\n    <link rel=\\\\\\"stylesheet\\\\\\" href=\\\\\\"/static/styles/fonts_8049871103083011125.css\\\\\\"/>\\\\n    <link rel=\\\\\\"stylesheet\\\\\\" href=\\\\\\"/static/styles/app_14658805106732275902.css\\\\\\"/>\\\\n\\\\n    <!-- favicon -->\\\\n    <link rel=\\\\\\"apple-touch-icon\\\\\\" sizes=\\\\\\"180x180\\\\\\" href=\\\\\\"/static/images/apple-touch-icon.png?v=ngJW8jGAmR\\\\\\">\\\\n    <link rel=\\\\\\"icon\\\\\\" sizes=\\\\\\"16x16\\\\\\" type=\\\\\\"image/png\\\\\\" href=\\\\\\"/static/images/favicon-16x16.png\\\\\\">\\\\n    <link rel=\\\\\\"icon\\\\\\" sizes=\\\\\\"32x32\\\\\\" type=\\\\\\"image/png\\\\\\" href=\\\\\\"/static/images/favicon-32x32.png\\\\\\">\\\\n    <link rel=\\\\\\"icon\\\\\\" type=\\\\\\"image/svg+xml\\\\\\" href=\\\\\\"/static/images/favicon.svg\\\\\\">\\\\n    <link rel=\\\\\\"manifest\\\\\\" href=\\\\\\"/static/images/site.webmanifest?v=ngJW8jGAmR\\\\\\">\\\\n    <link rel=\\\\\\"mask-icon\\\\\\" href=\\\\\\"/static/images/safari-pinned-tab.svg?v=ngJW8jGAmR\\\\\\" color=\\\\\\"#000000\\\\\\">\\\\n    <meta name=\\\\\\"msapplication-TileColor\\\\\\" content=\\\\\\"#ffffff\\\\\\">\\\\n    <meta name=\\\\\\"msapplication-config\\\\\\" content=\\\\\\"/static/images/browserconfig.xml?v=ngJW8jGAmR\\\\\\">\\\\n    <meta name=\\\\\\"theme-color\\\\\\" content=\\\\\\"#ffffff\\\\\\">\\\\n\\\\n        <!-- locales -->\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/en-US\\\\\\" hreflang=\\\\\\"en-US\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/es\\\\\\" hreflang=\\\\\\"es\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/fr\\\\\\" hreflang=\\\\\\"fr\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/it\\\\\\" hreflang=\\\\\\"it\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/ja\\\\\\" hreflang=\\\\\\"ja\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/pt-BR\\\\\\" hreflang=\\\\\\"pt-BR\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/ru\\\\\\" hreflang=\\\\\\"ru\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/tr\\\\\\" hreflang=\\\\\\"tr\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/zh-CN\\\\\\" hreflang=\\\\\\"zh-CN\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/zh-TW\\\\\\" hreflang=\\\\\\"zh-TW\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/\\\\\\" hreflang=\\\\\\"x-default\\\\\\">\\\\n\\\\n    <!-- Custom Highlight pack with: Rust, Markdown, TOML, Bash, JSON, YAML,\\\\n         and plaintext. -->\\\\n    <script src=\\\\\\"/static/scripts/highlight.pack.js\\\\\\" defer></script>\\\\n    <script src=\\\\\\"/static/scripts/init.js\\\\\\" defer></script>\\\\n  </head>\\\\n  <body>\\\\n    <nav class=\\\\\\"flex flex-row justify-center justify-end-l items-center flex-wrap ph2 pl3-ns pr3-ns pb3\\\\\\">\\\\n      <div class=\\\\\\"brand flex-auto w-100 w-auto-l self-start tc tl-l\\\\\\">\\\\n        <a href=\\\\\\"/\\\\\\" class=\\\\\\"brand\\\\\\">\\\\n          <img class=\\\\\\"v-mid ml0-l\\\\\\" alt=\\\\\\"Rust Logo\\\\\\" src=\\\\\\"/static/images/rust-logo-blk.svg\\\\\\">\\\\n    </a>\\\\n      </div>\\\\n    \\\\n      <ul class=\\\\\\"nav list w-100 w-auto-l flex flex-none flex-row flex-wrap justify-center justify-end-l items-center pv2 ph0 ph4-ns\\\\\\">\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/tools/install\\\\\\">Install</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/learn\\\\\\">Learn</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"https://play.rust-lang.org/\\\\\\">Playground</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/tools\\\\\\">Tools</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/governance\\\\\\">Governance</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/community\\\\\\">Community</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"https://blog.rust-lang.org/\\\\\\">Blog</a></li>\\\\n      </ul>\\\\n    \\\\n      <div class=\\\\\\" w-100 w-auto-l flex-none flex justify-center pv4 pv-0-l languages\\\\\\">\\\\n        <div class=\\\\\\"select\\\\\\">\\\\n          <label for=\\\\\\"language-nav\\\\\\" class=\\\\\\"hidden\\\\\\">Language</label>\\\\n          <select id=\\\\\\"language-nav\\\\\\" data-current-lang=\\\\\\"en-US\\\\\\">\\\\n            <option title=\\\\\\"English (en-US)\\\\\\" value=\\\\\\"en-US\\\\\\">English (en-US)</option>\\\\n<option title=\\\\\\"Español (es)\\\\\\" value=\\\\\\"es\\\\\\">Español (es)</option>\\\\n<option title=\\\\\\"Français (fr)\\\\\\" value=\\\\\\"fr\\\\\\">Français (fr)</option>\\\\n<option title=\\\\\\"Italiano (it)\\\\\\" value=\\\\\\"it\\\\\\">Italiano (it)</option>\\\\n<option title=\\\\\\"日本語 (ja)\\\\\\" value=\\\\\\"ja\\\\\\">日本語 (ja)</option>\\\\n<option title=\\\\\\"Português (pt-BR)\\\\\\" value=\\\\\\"pt-BR\\\\\\">Português (pt-BR)</option>\\\\n<option title=\\\\\\"Русский (ru)\\\\\\" value=\\\\\\"ru\\\\\\">Русский (ru)</option>\\\\n<option title=\\\\\\"Türkçe (tr)\\\\\\" value=\\\\\\"tr\\\\\\">Türkçe (tr)</option>\\\\n<option title=\\\\\\"简体中文 (zh-CN)\\\\\\" value=\\\\\\"zh-CN\\\\\\">简体中文 (zh-CN)</option>\\\\n<option title=\\\\\\"正體中文 (zh-TW)\\\\\\" value=\\\\\\"zh-TW\\\\\\">正體中文 (zh-TW)</option>\\\\n      </select>\\\\n        </div>\\\\n      </div>\\\\n    \\\\n    </nav>\\\\n    <main><header class=\\\\\\"mt3 mb6 w-100 mw-none ph3 mw8-m mw9-l center\\\\\\">\\\\n  <div class=\\\\\\"flex flex-column flex-row-l\\\\\\">\\\\n    <div class=\\\\\\"w-70-l mw8-l\\\\\\">\\\\n      <h1>Rust</h1>\\\\n      <h2 class=\\\\\\"mt4 mb0 f2 f1-ns\\\\\\">\\\\n        A language empowering everyone <br class='dn db-ns'> to build reliable and efficient software.\\\\n      </h2>\\\\n    </div>\\\\n    <div class=\\\\\\"w-30-l flex-column pl0-l pr0-l pl3 pr3\\\\\\">\\\\n      <a class=\\\\\\"button button-download ph4 mt0 w-100\\\\\\" href=\\\\\\"/learn/get-started\\\\\\">\\\\n        Get Started\\\\n      </a>\\\\n      <p class=\\\\\\"tc f3 f2-l mt3\\\\\\">\\\\n        <a href=\\\\\\"https://blog.rust-lang.org/2023/10/05/Rust-1.73.0.html\\\\\\" class=\\\\\\"download-link\\\\\\">Version 1.73.0</a>\\\\n      </p>\\\\n    </div>\\\\n  </div>\\\\n</header>\\\\n\\\\n<section id=\\\\\\"language-values\\\\\\" class=\\\\\\"green\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center f3\\\\\\">\\\\n    <header class=\\\\\\"pb0\\\\\\">\\\\n      <h2>\\\\n        Why Rust?\\\\n      </h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n    <div class=\\\\\\"flex-none flex-l\\\\\\">\\\\n      <section class=\\\\\\"w-100 pv2 pv0-l mt4\\\\\\">\\\\n        <h3 class=\\\\\\"f2 f1-l\\\\\\">Performance</h3>\\\\n        <p class=\\\\\\"f3 lh-copy\\\\\\">\\\\n          Rust is blazingly fast and memory-efficient: with no runtime or\\\\ngarbage collector, it can power performance-critical services, run on\\\\nembedded devices, and easily integrate with other languages.\\\\n        </p>\\\\n      </section>\\\\n      <section class=\\\\\\"w-100 pv2 pv0-l mt4 mh5-l\\\\\\">\\\\n        <h3 class=\\\\\\"f2 f1-l\\\\\\">Reliability</h3>\\\\n        <p class=\\\\\\"f3 lh-copy\\\\\\">\\\\n          Rust’s rich type system and ownership model guarantee memory-safety\\\\nand thread-safety &mdash; enabling you to eliminate many classes of\\\\nbugs at compile-time.\\\\n        </p>\\\\n      </section>\\\\n      <section class=\\\\\\"w-100 pv2 pv0-l mt4\\\\\\">\\\\n        <h3 class=\\\\\\"f2 f1-l\\\\\\">Productivity</h3>\\\\n        <p class=\\\\\\"f3 lh-copy\\\\\\">\\\\n          Rust has great documentation, a friendly compiler with useful error\\\\nmessages, and top-notch tooling &mdash; an integrated package manager\\\\nand build tool, smart multi-editor support with auto-completion and\\\\ntype inspections, an auto-formatter, and more.\\\\n        </p>\\\\n      </section>\\\\n\\\\n    </div>\\\\n  </div>\\\\n</section>\\\\n<section class=\\\\\\"purple\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center f3\\\\\\">\\\\n    <header>\\\\n      <h2>\\\\n        Build it in Rust\\\\n      </h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n\\\\n    <div class=\\\\\\"flex-none flex-l flex-row\\\\\\">\\\\n      <p class=\\\\\\"flex-grow-1 pb2\\\\\\">\\\\n        In 2018, the Rust community decided to improve the programming experience\\\\nfor a few distinct domains (see <a\\\\nhref=\\\\\\"https://blog.rust-lang.org/2018/03/12/roadmap.html\\\\\\">the 2018\\\\nroadmap</a>). For these, you can find many high-quality crates and some\\\\nawesome guides on how to get started.\\\\n      </p>\\\\n    </div>\\\\n\\\\n    <div class=\\\\\\"flex-none flex-l flex-row\\\\\\">\\\\n      <div class=\\\\\\"flex flex-row flex-column-l justify-between-l mw8 measure-wide-l w-100 mt5 mt2-l\\\\\\">\\\\n        <div class=\\\\\\"v-top tc-l\\\\\\">\\\\n          <img src=\\\\\\"/static/images/cli.svg\\\\\\" alt=\\\\\\"terminal\\\\\\"\\\\n               class=\\\\\\"mw3 mw4-ns\\\\\\"/>\\\\n        </div>\\\\n        <div class=\\\\\\"v-top pl4 pl0-l pt0 pt3-l measure-wide-l flex-l flex-column-l flex-auto-l justify-between-l\\\\\\">\\\\n          <h3 class=\\\\\\"tc-l\\\\\\">\\\\n            Command Line\\\\n          </h3>\\\\n          <p class=\\\\\\"flex-grow-1\\\\\\">\\\\n            Whip up a CLI tool quickly with Rust’s robust ecosystem.\\\\nRust helps you maintain your app with confidence and distribute it with ease.\\\\n          </p>\\\\n          <a href=\\\\\\"/what/cli\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Building Tools</a>\\\\n        </div>\\\\n      </div>\\\\n\\\\n      <div class=\\\\\\"flex flex-row flex-column-l justify-between-l mw8 measure-wide-l w-100 mt5 mt2-l pl4-l\\\\\\">\\\\n        <div class=\\\\\\"v-top tc-l\\\\\\">\\\\n          <img src=\\\\\\"/static/images/webassembly.svg\\\\\\" alt=\\\\\\"gear with puzzle piece elements\\\\\\"\\\\n               class=\\\\\\"mw3 mw4-ns\\\\\\"/>\\\\n        </div>\\\\n        <div class=\\\\\\"v-top pl4 pl0-l pt0 pt3-l measure-wide-l flex-l flex-column-l flex-auto-l justify-between-l\\\\\\">\\\\n          <h3 class=\\\\\\"tc-l\\\\\\">\\\\n            WebAssembly\\\\n          </h3>\\\\n          <p class=\\\\\\"flex-grow-1\\\\\\">\\\\n          Use Rust to supercharge your JavaScript, one module at a time.\\\\nPublish to npm, bundle with webpack, and you’re off to the races.\\\\n          </p>\\\\n          <a href=\\\\\\"/what/wasm\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Writing Web Apps</a>\\\\n        </div>\\\\n      </div>\\\\n\\\\n      <div class=\\\\\\"flex flex-row flex-column-l justify-between-l mw8 measure-wide-l w-100 mt5 mt2-l pl4-l\\\\\\">\\\\n        <div class=\\\\\\"v-top tc-l\\\\\\">\\\\n          <img src=\\\\\\"/static/images/networking.svg\\\\\\" alt=\\\\\\"a cloud with nodes\\\\\\"\\\\n               class=\\\\\\"mw3 mw4-ns\\\\\\"/>\\\\n        </div>\\\\n        <div class=\\\\\\"v-top pl4 pl0-l pt0 pt3-l measure-wide-l flex-l flex-column-l flex-auto-l justify-between-l\\\\\\">\\\\n          <h3 class=\\\\\\"tc-l\\\\\\">\\\\n            Networking\\\\n          </h3>\\\\n          <p class=\\\\\\"flex-grow-1\\\\\\">\\\\n            Predictable performance. Tiny resource footprint. Rock-solid reliability.\\\\nRust is great for network services.\\\\n          </p>\\\\n          <a href=\\\\\\"/what/networking\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Working On Servers</a>\\\\n        </div>\\\\n      </div>\\\\n\\\\n      <div class=\\\\\\"flex flex-row flex-column-l justify-between-l mw8 measure-wide-l w-100 mt5 mt2-l pl4-l\\\\\\">\\\\n        <div class=\\\\\\"v-top tc-l\\\\\\">\\\\n          <img src=\\\\\\"/static/images/embedded.svg\\\\\\" alt=\\\\\\"an embedded device chip\\\\\\"\\\\n               class=\\\\\\"mw3 mw4-ns\\\\\\"/>\\\\n        </div>\\\\n        <div class=\\\\\\"v-top pl4 pl0-l pt0 pt3-l measure-wide-l flex-l flex-column-l flex-auto-l justify-between-l\\\\\\">\\\\n          <h3 class=\\\\\\"tc-l\\\\\\">\\\\n            Embedded\\\\n          </h3>\\\\n          <p class=\\\\\\"flex-grow-1\\\\\\">\\\\n            Targeting low-resource devices?\\\\nNeed low-level control without giving up high-level conveniences?\\\\nRust has you covered.\\\\n          </p>\\\\n          <a href=\\\\\\"/what/embedded\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Starting With Embedded</a>\\\\n        </div>\\\\n      </div>\\\\n    </div>\\\\n  </div>\\\\n</section>\\\\n<section class=\\\\\\"white production\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center\\\\\\">\\\\n    <header>\\\\n      <h2>Rust in production</h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n    <div class=\\\\\\"description\\\\\\">\\\\n      <p class=\\\\\\"lh-copy f2\\\\\\">\\\\n        Hundreds of companies around the world are using Rust in production\\\\ntoday for fast, low-resource, cross-platform solutions. Software you know\\\\nand love, like <a href=\\\\\\"https://hacks.mozilla.org/2017/08/inside-a-super-fast-css-engine-quantum-css-aka-stylo/\\\\\\">Firefox</a>,\\\\n<a href=\\\\\\"https://blogs.dropbox.com/tech/2016/06/lossless-compression-with-brotli/\\\\\\">Dropbox</a>,\\\\nand <a href=\\\\\\"https://blog.cloudflare.com/cloudflare-workers-as-a-serverless-rust-platform/\\\\\\">Cloudflare</a>,\\\\nuses Rust. <strong>From startups to large\\\\ncorporations, from embedded devices to scalable web services, Rust is a great fit.</strong>\\\\n      </p>\\\\n    </div>\\\\n    <div class=\\\\\\"testimonials\\\\\\">\\\\n      <div class=\\\\\\"testimonial flex-none flex-l\\\\\\">\\\\n        <div class=\\\\\\"w-100 w-70-l\\\\\\" id=\\\\\\"npm-testimonial\\\\\\">\\\\n          <blockquote class=\\\\\\"lh-title-ns\\\\\\">\\\\n            My biggest compliment to Rust is that it's boring, and this is an amazing compliment.\\\\n          </blockquote>\\\\n          <p class=\\\\\\"attribution\\\\\\">&ndash; Chris Dickinson, Engineer at npm, Inc</p>\\\\n        </div>\\\\n        <div class=\\\\\\"w-100 w-30-l tc\\\\\\">\\\\n          <a href=\\\\\\"https://www.npmjs.com/\\\\\\">\\\\n            <img src=\\\\\\"/static/images/user-logos/npm.svg\\\\\\" alt=\\\\\\"npm Logo\\\\\\" class=\\\\\\"w-33 w-60-ns h-auto\\\\\\" />\\\\n          </a>\\\\n        </div>\\\\n      </div>\\\\n      <hr/>\\\\n      <div class=\\\\\\"testimonial flex-none flex-l\\\\\\">\\\\n        <div class=\\\\\\"w-100 w-30-l tc\\\\\\">\\\\n          <a href=\\\\\\"https://www.youtube.com/watch?v=u6ZbF4apABk\\\\\\"><img src=\\\\\\"/static/images/user-logos/yelp.png\\\\\\" alt=\\\\\\"Yelp Logo\\\\\\" class=\\\\\\"w-80\\\\\\" /></a>\\\\n        </div>\\\\n        <div class=\\\\\\"w-100 w-70-l\\\\\\" id=\\\\\\"yelp-testimonial\\\\\\">\\\\n          <blockquote>\\\\n            All the documentation, the tooling, the community is great - you have all the tools to succeed in writing Rust code.\\\\n          </blockquote>\\\\n          <p class=\\\\\\"attribution\\\\\\">&ndash; Antonio Verardi, Infrastructure Engineer</p>\\\\n        </div>\\\\n      </div>\\\\n    </div>\\\\n    <a href=\\\\\\"/production\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Learn More</a>\\\\n  </div>\\\\n</section>\\\\n<section class=\\\\\\"get-involved red\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center f3\\\\\\">\\\\n    <header>\\\\n      <h2>Get involved</h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n    <div class=\\\\\\"flex flex-column flex-row-l\\\\\\">\\\\n      <div id=\\\\\\"read-rust\\\\\\" class=\\\\\\"mw-50-l mr4-l pt0 flex flex-column justify-between-l\\\\\\">\\\\n        <h3>Read Rust</h3>\\\\n        <p class=\\\\\\"flex-grow-1\\\\\\">We love documentation! Take a look at the books available online, as well as key blog posts and user guides.</p>\\\\n        <a href=\\\\\\"learn\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Read the book</a>\\\\n      </div>\\\\n      <div id=\\\\\\"watch-rust\\\\\\" class=\\\\\\"mw-50-l pt3 pt0-l flex flex-column justify-between-l\\\\\\">\\\\n        <h3>Watch Rust</h3>\\\\n        <p class=\\\\\\"flex-grow-1\\\\\\">The Rust community has a dedicated YouTube channel collecting a huge range of presentations and\\\\ntutorials.</p>\\\\n        <a href=\\\\\\"https://www.youtube.com/channel/UCaYhcUwRBNscFNUKTjgPFiA\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Watch the Videos</a>\\\\n      </div>\\\\n    </div>\\\\n    <div class=\\\\\\"pt3\\\\\\">\\\\n      <h3>Contribute code</h3>\\\\n      <p>\\\\n      Rust is truly a community effort, and we welcome contribution from hobbyists and production users, from\\\\nnewcomers and seasoned professionals. Come help us make the Rust experience even better!\\\\n      </p>\\\\n      <a href=\\\\\\"https://rustc-dev-guide.rust-lang.org/getting-started.html\\\\\\" class=\\\\\\"button button-secondary\\\\\\">\\\\n        Read Contribution Guide\\\\n      </a>\\\\n    </div>\\\\n  </div>\\\\n</section>\\\\n<section class=\\\\\\"white thanks\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center\\\\\\">\\\\n    <header>\\\\n      <h2>Thanks</h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n    <div class=\\\\\\"description\\\\\\">\\\\n      <p class=\\\\\\"lh-copy f2\\\\\\">\\\\n        Rust would not exist without the generous contributions of time, work, and resources from individuals and companies. We are very grateful for the support!\\\\n      </p>\\\\n    </div>\\\\n    <div class=\\\\\\"flex flex-column flex-row-l\\\\\\">\\\\n      <div id=\\\\\\"individual-code\\\\\\" class=\\\\\\"mw-50-l mr4-l pt0 flex flex-column justify-between-l\\\\\\">\\\\n        <h3>Individuals</h3>\\\\n        <p class=\\\\\\"flex-grow-1\\\\\\">Rust is a community project and is very thankful for the many community contributions it receives.</p>\\\\n        <a href=\\\\\\"https://thanks.rust-lang.org/\\\\\\" class=\\\\\\"button button-secondary\\\\\\">See individual contributors</a>\\\\n      </div>\\\\n      <div id=\\\\\\"company-sponsorships\\\\\\" class=\\\\\\"mw-50-l pt3 pt0-l flex flex-column justify-between-l\\\\\\">\\\\n        <h3>Corporate sponsors</h3>\\\\n        <p class=\\\\\\"flex-grow-1\\\\\\">The Rust project receives support from companies through the Rust Foundation.</p>\\\\n        <a href=\\\\\\"https://foundation.rust-lang.org/members\\\\\\" class=\\\\\\"button button-secondary\\\\\\">See Foundation members</a>\\\\n      </div>\\\\n    </div>\\\\n  </div>\\\\n</section>\\\\n\\\\n    </main>\\\\n    <footer>\\\\n      <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center f3\\\\\\">\\\\n        <div class=\\\\\\"flex flex-column flex-row-ns pv0-l\\\\\\">\\\\n          <div class=\\\\\\"flex flex-column mw8 w-100 measure-wide-l pv2 pv5-m pv2-ns ph4-m ph4-l\\\\\\" id=\\\\\\"get-help\\\\\\">\\\\n            <h4>Get help!</h4>\\\\n            <ul>\\\\n              <li><a href=\\\\\\"/learn\\\\\\">Documentation</a></li>\\\\n              <li><a href=\\\\\\"http://forge.rust-lang.org\\\\\\">Rust Forge (Contributor Documentation)</a></li>\\\\n              <li><a href=\\\\\\"https://users.rust-lang.org\\\\\\">Ask a Question on the Users Forum</a></li>\\\\n            </ul>\\\\n            <div class=\\\\\\"languages\\\\\\">\\\\n              <div class=\\\\\\"select\\\\\\">\\\\n                <label for=\\\\\\"language-footer\\\\\\" class=\\\\\\"hidden\\\\\\">Language</label>\\\\n                <select id=\\\\\\"language-footer\\\\\\">\\\\n                  <option title=\\\\\\"English (en-US)\\\\\\" value=\\\\\\"en-US\\\\\\">English (en-US)</option>\\\\n<option title=\\\\\\"Español (es)\\\\\\" value=\\\\\\"es\\\\\\">Español (es)</option>\\\\n<option title=\\\\\\"Français (fr)\\\\\\" value=\\\\\\"fr\\\\\\">Français (fr)</option>\\\\n<option title=\\\\\\"Italiano (it)\\\\\\" value=\\\\\\"it\\\\\\">Italiano (it)</option>\\\\n<option title=\\\\\\"日本語 (ja)\\\\\\" value=\\\\\\"ja\\\\\\">日本語 (ja)</option>\\\\n<option title=\\\\\\"Português (pt-BR)\\\\\\" value=\\\\\\"pt-BR\\\\\\">Português (pt-BR)</option>\\\\n<option title=\\\\\\"Русский (ru)\\\\\\" value=\\\\\\"ru\\\\\\">Русский (ru)</option>\\\\n<option title=\\\\\\"Türkçe (tr)\\\\\\" value=\\\\\\"tr\\\\\\">Türkçe (tr)</option>\\\\n<option title=\\\\\\"简体中文 (zh-CN)\\\\\\" value=\\\\\\"zh-CN\\\\\\">简体中文 (zh-CN)</option>\\\\n<option title=\\\\\\"正體中文 (zh-TW)\\\\\\" value=\\\\\\"zh-TW\\\\\\">正體中文 (zh-TW)</option>\\\\n            </select>\\\\n              </div>\\\\n            </div>\\\\n          </div>\\\\n          <div class=\\\\\\"flex flex-column mw8 w-100 measure-wide-l pv2 pv5-m pv2-ns ph4-m ph4-l\\\\\\">\\\\n            <h4>Terms and policies</h4>\\\\n            <ul>\\\\n              <li><a href=\\\\\\"/policies/code-of-conduct\\\\\\">Code of Conduct</a></li>\\\\n              <li><a href=\\\\\\"/policies/licenses\\\\\\">Licenses</a></li>\\\\n              <li><a href=\\\\\\"https://foundation.rust-lang.org/policies/logo-policy-and-media-guide/\\\\\\">Logo Policy and Media Guide</a></li>\\\\n              <li><a href=\\\\\\"/policies/security\\\\\\">Security Disclosures</a></li>\\\\n              <li><a href=\\\\\\"https://foundation.rust-lang.org/policies/privacy-policy/\\\\\\">Privacy Notice</a></li>\\\\n              <li><a href=\\\\\\"/policies\\\\\\">All Policies</a></li>\\\\n            </ul>\\\\n          </div>\\\\n          <div class=\\\\\\"flex flex-column mw8 w-100 measure-wide-l pv2 pv5-m pv2-ns ph4-m ph4-l\\\\\\">\\\\n            <h4>Social</h4>\\\\n            <div class=\\\\\\"flex flex-row flex-wrap items-center\\\\\\">\\\\n              <a rel=\\\\\\"me\\\\\\" href=\\\\\\"https://social.rust-lang.org/@rust\\\\\\" target=\\\\\\"_blank\\\\\\"><img src=\\\\\\"/static/images/mastodon.svg\\\\\\" alt=\\\\\\"Mastodon\\\\\\" title=\\\\\\"Mastodon\\\\\\" /></a>\\\\n              <a href=\\\\\\"https://twitter.com/rustlang\\\\\\" target=\\\\\\"_blank\\\\\\"><img src=\\\\\\"/static/images/twitter.svg\\\\\\" alt=\\\\\\"twitter logo\\\\\\" title=\\\\\\"Twitter\\\\\\"/></a>\\\\n              <a href=\\\\\\"https://www.youtube.com/channel/UCaYhcUwRBNscFNUKTjgPFiA\\\\\\" target=\\\\\\"_blank\\\\\\"><img class=\\\\\\"pv2\\\\\\" src=\\\\\\"/static/images/youtube.svg\\\\\\" alt=\\\\\\"youtube logo\\\\\\" title=\\\\\\"YouTube\\\\\\"/></a>\\\\n              <a href=\\\\\\"https://discord.gg/rust-lang\\\\\\" target=\\\\\\"_blank\\\\\\"><img src=\\\\\\"/static/images/discord.svg\\\\\\" alt=\\\\\\"discord logo\\\\\\" title=\\\\\\"Discord\\\\\\"/></a>\\\\n              <a href=\\\\\\"https://github.com/rust-lang\\\\\\" target=\\\\\\"_blank\\\\\\"><img src=\\\\\\"/static/images/github.svg\\\\\\" alt=\\\\\\"github logo\\\\\\" title=\\\\\\"GitHub\\\\\\"/></a>\\\\n            </div>\\\\n          </div>\\\\n    \\\\n        </div>\\\\n        <div class=\\\\\\"attribution\\\\\\">\\\\n          <p>\\\\n            Maintained by the Rust Team. See a bug?\\\\n<a href=\\\\\\"https://github.com/rust-lang/www.rust-lang.org/issues/new/choose\\\\\\">File an issue!</a>\\\\n          </p>\\\\n          <p>Looking for the <a href=\\\\\\"https://prev.rust-lang.org\\\\\\">previous website</a>?</p>\\\\n        </div>\\\\n      </div>\\\\n    </footer>\\\\n    <script src=\\\\\\"/static/scripts/languages.js\\\\\\"></script>\\\\n  </body>\\\\n</html>\\\\n\\"))",
                                      },
                                    },
                                  ],
                                  "id": 1099511627777n,
                                  "metadataId": 4355177280n,
                                },
                                {
                                  "children": [],
                                  "createdAt": {
                                    "nanos": 114651666,
                                    "seconds": 1699978201n,
                                  },
                                  "fields": [
                                    {
                                      "metadataId": 4355177280n,
                                      "name": "id",
                                      "value": {
                                        "oneofKind": "u64Val",
                                        "u64Val": 1066188670690238080n,
                                      },
                                    },
                                    {
                                      "metadataId": 4355177280n,
                                      "name": "response",
                                      "value": {
                                        "oneofKind": "strVal",
                                        "strVal": "Ok(String(\\"<!doctype html>\\\\n<html lang=\\\\\\"en-US\\\\\\">\\\\n  <head>\\\\n    <meta charset=\\\\\\"utf-8\\\\\\">\\\\n    <title>\\\\n            Rust Programming Language\\\\n        </title>\\\\n    <meta name=\\\\\\"viewport\\\\\\" content=\\\\\\"width=device-width,initial-scale=1.0\\\\\\">\\\\n    <meta name=\\\\\\"description\\\\\\" content=\\\\\\"A language empowering everyone to build reliable and efficient software.\\\\\\">\\\\n\\\\n    <!-- Twitter card -->\\\\n    <meta name=\\\\\\"twitter:card\\\\\\" content=\\\\\\"summary\\\\\\">\\\\n    <meta name=\\\\\\"twitter:site\\\\\\" content=\\\\\\"@rustlang\\\\\\">\\\\n    <meta name=\\\\\\"twitter:creator\\\\\\" content=\\\\\\"@rustlang\\\\\\">\\\\n    <meta name=\\\\\\"twitter:title\\\\\\" content=\\\\\\"\\\\\\">\\\\n    <meta name=\\\\\\"twitter:description\\\\\\" content=\\\\\\"A language empowering everyone to build reliable and efficient software.\\\\\\">\\\\n    <meta name=\\\\\\"twitter:image\\\\\\" content=\\\\\\"https://www.rust-lang.org/static/images/rust-social.jpg\\\\\\">\\\\n\\\\n    <!-- Facebook OpenGraph -->\\\\n    <meta property=\\\\\\"og:title\\\\\\" content=\\\\\\"\\\\\\" />\\\\n    <meta property=\\\\\\"og:description\\\\\\" content=\\\\\\"A language empowering everyone to build reliable and efficient software.\\\\\\">\\\\n    <meta property=\\\\\\"og:image\\\\\\" content=\\\\\\"https://www.rust-lang.org/static/images/rust-social-wide.jpg\\\\\\" />\\\\n    <meta property=\\\\\\"og:type\\\\\\" content=\\\\\\"website\\\\\\" />\\\\n    <meta property=\\\\\\"og:locale\\\\\\" content=\\\\\\"en_US\\\\\\" />\\\\n\\\\n    <!-- styles -->\\\\n    <link rel=\\\\\\"stylesheet\\\\\\" href=\\\\\\"/static/styles/a11y-dark.css\\\\\\"/>\\\\n    <link rel=\\\\\\"stylesheet\\\\\\" href=\\\\\\"/static/styles/vendor_10880690442070639967.css\\\\\\"/>\\\\n    <link rel=\\\\\\"stylesheet\\\\\\" href=\\\\\\"/static/styles/fonts_8049871103083011125.css\\\\\\"/>\\\\n    <link rel=\\\\\\"stylesheet\\\\\\" href=\\\\\\"/static/styles/app_14658805106732275902.css\\\\\\"/>\\\\n\\\\n    <!-- favicon -->\\\\n    <link rel=\\\\\\"apple-touch-icon\\\\\\" sizes=\\\\\\"180x180\\\\\\" href=\\\\\\"/static/images/apple-touch-icon.png?v=ngJW8jGAmR\\\\\\">\\\\n    <link rel=\\\\\\"icon\\\\\\" sizes=\\\\\\"16x16\\\\\\" type=\\\\\\"image/png\\\\\\" href=\\\\\\"/static/images/favicon-16x16.png\\\\\\">\\\\n    <link rel=\\\\\\"icon\\\\\\" sizes=\\\\\\"32x32\\\\\\" type=\\\\\\"image/png\\\\\\" href=\\\\\\"/static/images/favicon-32x32.png\\\\\\">\\\\n    <link rel=\\\\\\"icon\\\\\\" type=\\\\\\"image/svg+xml\\\\\\" href=\\\\\\"/static/images/favicon.svg\\\\\\">\\\\n    <link rel=\\\\\\"manifest\\\\\\" href=\\\\\\"/static/images/site.webmanifest?v=ngJW8jGAmR\\\\\\">\\\\n    <link rel=\\\\\\"mask-icon\\\\\\" href=\\\\\\"/static/images/safari-pinned-tab.svg?v=ngJW8jGAmR\\\\\\" color=\\\\\\"#000000\\\\\\">\\\\n    <meta name=\\\\\\"msapplication-TileColor\\\\\\" content=\\\\\\"#ffffff\\\\\\">\\\\n    <meta name=\\\\\\"msapplication-config\\\\\\" content=\\\\\\"/static/images/browserconfig.xml?v=ngJW8jGAmR\\\\\\">\\\\n    <meta name=\\\\\\"theme-color\\\\\\" content=\\\\\\"#ffffff\\\\\\">\\\\n\\\\n        <!-- locales -->\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/en-US\\\\\\" hreflang=\\\\\\"en-US\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/es\\\\\\" hreflang=\\\\\\"es\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/fr\\\\\\" hreflang=\\\\\\"fr\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/it\\\\\\" hreflang=\\\\\\"it\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/ja\\\\\\" hreflang=\\\\\\"ja\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/pt-BR\\\\\\" hreflang=\\\\\\"pt-BR\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/ru\\\\\\" hreflang=\\\\\\"ru\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/tr\\\\\\" hreflang=\\\\\\"tr\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/zh-CN\\\\\\" hreflang=\\\\\\"zh-CN\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/zh-TW\\\\\\" hreflang=\\\\\\"zh-TW\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/\\\\\\" hreflang=\\\\\\"x-default\\\\\\">\\\\n\\\\n    <!-- Custom Highlight pack with: Rust, Markdown, TOML, Bash, JSON, YAML,\\\\n         and plaintext. -->\\\\n    <script src=\\\\\\"/static/scripts/highlight.pack.js\\\\\\" defer></script>\\\\n    <script src=\\\\\\"/static/scripts/init.js\\\\\\" defer></script>\\\\n  </head>\\\\n  <body>\\\\n    <nav class=\\\\\\"flex flex-row justify-center justify-end-l items-center flex-wrap ph2 pl3-ns pr3-ns pb3\\\\\\">\\\\n      <div class=\\\\\\"brand flex-auto w-100 w-auto-l self-start tc tl-l\\\\\\">\\\\n        <a href=\\\\\\"/\\\\\\" class=\\\\\\"brand\\\\\\">\\\\n          <img class=\\\\\\"v-mid ml0-l\\\\\\" alt=\\\\\\"Rust Logo\\\\\\" src=\\\\\\"/static/images/rust-logo-blk.svg\\\\\\">\\\\n    </a>\\\\n      </div>\\\\n    \\\\n      <ul class=\\\\\\"nav list w-100 w-auto-l flex flex-none flex-row flex-wrap justify-center justify-end-l items-center pv2 ph0 ph4-ns\\\\\\">\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/tools/install\\\\\\">Install</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/learn\\\\\\">Learn</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"https://play.rust-lang.org/\\\\\\">Playground</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/tools\\\\\\">Tools</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/governance\\\\\\">Governance</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/community\\\\\\">Community</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"https://blog.rust-lang.org/\\\\\\">Blog</a></li>\\\\n      </ul>\\\\n    \\\\n      <div class=\\\\\\" w-100 w-auto-l flex-none flex justify-center pv4 pv-0-l languages\\\\\\">\\\\n        <div class=\\\\\\"select\\\\\\">\\\\n          <label for=\\\\\\"language-nav\\\\\\" class=\\\\\\"hidden\\\\\\">Language</label>\\\\n          <select id=\\\\\\"language-nav\\\\\\" data-current-lang=\\\\\\"en-US\\\\\\">\\\\n            <option title=\\\\\\"English (en-US)\\\\\\" value=\\\\\\"en-US\\\\\\">English (en-US)</option>\\\\n<option title=\\\\\\"Español (es)\\\\\\" value=\\\\\\"es\\\\\\">Español (es)</option>\\\\n<option title=\\\\\\"Français (fr)\\\\\\" value=\\\\\\"fr\\\\\\">Français (fr)</option>\\\\n<option title=\\\\\\"Italiano (it)\\\\\\" value=\\\\\\"it\\\\\\">Italiano (it)</option>\\\\n<option title=\\\\\\"日本語 (ja)\\\\\\" value=\\\\\\"ja\\\\\\">日本語 (ja)</option>\\\\n<option title=\\\\\\"Português (pt-BR)\\\\\\" value=\\\\\\"pt-BR\\\\\\">Português (pt-BR)</option>\\\\n<option title=\\\\\\"Русский (ru)\\\\\\" value=\\\\\\"ru\\\\\\">Русский (ru)</option>\\\\n<option title=\\\\\\"Türkçe (tr)\\\\\\" value=\\\\\\"tr\\\\\\">Türkçe (tr)</option>\\\\n<option title=\\\\\\"简体中文 (zh-CN)\\\\\\" value=\\\\\\"zh-CN\\\\\\">简体中文 (zh-CN)</option>\\\\n<option title=\\\\\\"正體中文 (zh-TW)\\\\\\" value=\\\\\\"zh-TW\\\\\\">正體中文 (zh-TW)</option>\\\\n      </select>\\\\n        </div>\\\\n      </div>\\\\n    \\\\n    </nav>\\\\n    <main><header class=\\\\\\"mt3 mb6 w-100 mw-none ph3 mw8-m mw9-l center\\\\\\">\\\\n  <div class=\\\\\\"flex flex-column flex-row-l\\\\\\">\\\\n    <div class=\\\\\\"w-70-l mw8-l\\\\\\">\\\\n      <h1>Rust</h1>\\\\n      <h2 class=\\\\\\"mt4 mb0 f2 f1-ns\\\\\\">\\\\n        A language empowering everyone <br class='dn db-ns'> to build reliable and efficient software.\\\\n      </h2>\\\\n    </div>\\\\n    <div class=\\\\\\"w-30-l flex-column pl0-l pr0-l pl3 pr3\\\\\\">\\\\n      <a class=\\\\\\"button button-download ph4 mt0 w-100\\\\\\" href=\\\\\\"/learn/get-started\\\\\\">\\\\n        Get Started\\\\n      </a>\\\\n      <p class=\\\\\\"tc f3 f2-l mt3\\\\\\">\\\\n        <a href=\\\\\\"https://blog.rust-lang.org/2023/10/05/Rust-1.73.0.html\\\\\\" class=\\\\\\"download-link\\\\\\">Version 1.73.0</a>\\\\n      </p>\\\\n    </div>\\\\n  </div>\\\\n</header>\\\\n\\\\n<section id=\\\\\\"language-values\\\\\\" class=\\\\\\"green\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center f3\\\\\\">\\\\n    <header class=\\\\\\"pb0\\\\\\">\\\\n      <h2>\\\\n        Why Rust?\\\\n      </h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n    <div class=\\\\\\"flex-none flex-l\\\\\\">\\\\n      <section class=\\\\\\"w-100 pv2 pv0-l mt4\\\\\\">\\\\n        <h3 class=\\\\\\"f2 f1-l\\\\\\">Performance</h3>\\\\n        <p class=\\\\\\"f3 lh-copy\\\\\\">\\\\n          Rust is blazingly fast and memory-efficient: with no runtime or\\\\ngarbage collector, it can power performance-critical services, run on\\\\nembedded devices, and easily integrate with other languages.\\\\n        </p>\\\\n      </section>\\\\n      <section class=\\\\\\"w-100 pv2 pv0-l mt4 mh5-l\\\\\\">\\\\n        <h3 class=\\\\\\"f2 f1-l\\\\\\">Reliability</h3>\\\\n        <p class=\\\\\\"f3 lh-copy\\\\\\">\\\\n          Rust’s rich type system and ownership model guarantee memory-safety\\\\nand thread-safety &mdash; enabling you to eliminate many classes of\\\\nbugs at compile-time.\\\\n        </p>\\\\n      </section>\\\\n      <section class=\\\\\\"w-100 pv2 pv0-l mt4\\\\\\">\\\\n        <h3 class=\\\\\\"f2 f1-l\\\\\\">Productivity</h3>\\\\n        <p class=\\\\\\"f3 lh-copy\\\\\\">\\\\n          Rust has great documentation, a friendly compiler with useful error\\\\nmessages, and top-notch tooling &mdash; an integrated package manager\\\\nand build tool, smart multi-editor support with auto-completion and\\\\ntype inspections, an auto-formatter, and more.\\\\n        </p>\\\\n      </section>\\\\n\\\\n    </div>\\\\n  </div>\\\\n</section>\\\\n<section class=\\\\\\"purple\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center f3\\\\\\">\\\\n    <header>\\\\n      <h2>\\\\n        Build it in Rust\\\\n      </h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n\\\\n    <div class=\\\\\\"flex-none flex-l flex-row\\\\\\">\\\\n      <p class=\\\\\\"flex-grow-1 pb2\\\\\\">\\\\n        In 2018, the Rust community decided to improve the programming experience\\\\nfor a few distinct domains (see <a\\\\nhref=\\\\\\"https://blog.rust-lang.org/2018/03/12/roadmap.html\\\\\\">the 2018\\\\nroadmap</a>). For these, you can find many high-quality crates and some\\\\nawesome guides on how to get started.\\\\n      </p>\\\\n    </div>\\\\n\\\\n    <div class=\\\\\\"flex-none flex-l flex-row\\\\\\">\\\\n      <div class=\\\\\\"flex flex-row flex-column-l justify-between-l mw8 measure-wide-l w-100 mt5 mt2-l\\\\\\">\\\\n        <div class=\\\\\\"v-top tc-l\\\\\\">\\\\n          <img src=\\\\\\"/static/images/cli.svg\\\\\\" alt=\\\\\\"terminal\\\\\\"\\\\n               class=\\\\\\"mw3 mw4-ns\\\\\\"/>\\\\n        </div>\\\\n        <div class=\\\\\\"v-top pl4 pl0-l pt0 pt3-l measure-wide-l flex-l flex-column-l flex-auto-l justify-between-l\\\\\\">\\\\n          <h3 class=\\\\\\"tc-l\\\\\\">\\\\n            Command Line\\\\n          </h3>\\\\n          <p class=\\\\\\"flex-grow-1\\\\\\">\\\\n            Whip up a CLI tool quickly with Rust’s robust ecosystem.\\\\nRust helps you maintain your app with confidence and distribute it with ease.\\\\n          </p>\\\\n          <a href=\\\\\\"/what/cli\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Building Tools</a>\\\\n        </div>\\\\n      </div>\\\\n\\\\n      <div class=\\\\\\"flex flex-row flex-column-l justify-between-l mw8 measure-wide-l w-100 mt5 mt2-l pl4-l\\\\\\">\\\\n        <div class=\\\\\\"v-top tc-l\\\\\\">\\\\n          <img src=\\\\\\"/static/images/webassembly.svg\\\\\\" alt=\\\\\\"gear with puzzle piece elements\\\\\\"\\\\n               class=\\\\\\"mw3 mw4-ns\\\\\\"/>\\\\n        </div>\\\\n        <div class=\\\\\\"v-top pl4 pl0-l pt0 pt3-l measure-wide-l flex-l flex-column-l flex-auto-l justify-between-l\\\\\\">\\\\n          <h3 class=\\\\\\"tc-l\\\\\\">\\\\n            WebAssembly\\\\n          </h3>\\\\n          <p class=\\\\\\"flex-grow-1\\\\\\">\\\\n          Use Rust to supercharge your JavaScript, one module at a time.\\\\nPublish to npm, bundle with webpack, and you’re off to the races.\\\\n          </p>\\\\n          <a href=\\\\\\"/what/wasm\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Writing Web Apps</a>\\\\n        </div>\\\\n      </div>\\\\n\\\\n      <div class=\\\\\\"flex flex-row flex-column-l justify-between-l mw8 measure-wide-l w-100 mt5 mt2-l pl4-l\\\\\\">\\\\n        <div class=\\\\\\"v-top tc-l\\\\\\">\\\\n          <img src=\\\\\\"/static/images/networking.svg\\\\\\" alt=\\\\\\"a cloud with nodes\\\\\\"\\\\n               class=\\\\\\"mw3 mw4-ns\\\\\\"/>\\\\n        </div>\\\\n        <div class=\\\\\\"v-top pl4 pl0-l pt0 pt3-l measure-wide-l flex-l flex-column-l flex-auto-l justify-between-l\\\\\\">\\\\n          <h3 class=\\\\\\"tc-l\\\\\\">\\\\n            Networking\\\\n          </h3>\\\\n          <p class=\\\\\\"flex-grow-1\\\\\\">\\\\n            Predictable performance. Tiny resource footprint. Rock-solid reliability.\\\\nRust is great for network services.\\\\n          </p>\\\\n          <a href=\\\\\\"/what/networking\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Working On Servers</a>\\\\n        </div>\\\\n      </div>\\\\n\\\\n      <div class=\\\\\\"flex flex-row flex-column-l justify-between-l mw8 measure-wide-l w-100 mt5 mt2-l pl4-l\\\\\\">\\\\n        <div class=\\\\\\"v-top tc-l\\\\\\">\\\\n          <img src=\\\\\\"/static/images/embedded.svg\\\\\\" alt=\\\\\\"an embedded device chip\\\\\\"\\\\n               class=\\\\\\"mw3 mw4-ns\\\\\\"/>\\\\n        </div>\\\\n        <div class=\\\\\\"v-top pl4 pl0-l pt0 pt3-l measure-wide-l flex-l flex-column-l flex-auto-l justify-between-l\\\\\\">\\\\n          <h3 class=\\\\\\"tc-l\\\\\\">\\\\n            Embedded\\\\n          </h3>\\\\n          <p class=\\\\\\"flex-grow-1\\\\\\">\\\\n            Targeting low-resource devices?\\\\nNeed low-level control without giving up high-level conveniences?\\\\nRust has you covered.\\\\n          </p>\\\\n          <a href=\\\\\\"/what/embedded\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Starting With Embedded</a>\\\\n        </div>\\\\n      </div>\\\\n    </div>\\\\n  </div>\\\\n</section>\\\\n<section class=\\\\\\"white production\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center\\\\\\">\\\\n    <header>\\\\n      <h2>Rust in production</h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n    <div class=\\\\\\"description\\\\\\">\\\\n      <p class=\\\\\\"lh-copy f2\\\\\\">\\\\n        Hundreds of companies around the world are using Rust in production\\\\ntoday for fast, low-resource, cross-platform solutions. Software you know\\\\nand love, like <a href=\\\\\\"https://hacks.mozilla.org/2017/08/inside-a-super-fast-css-engine-quantum-css-aka-stylo/\\\\\\">Firefox</a>,\\\\n<a href=\\\\\\"https://blogs.dropbox.com/tech/2016/06/lossless-compression-with-brotli/\\\\\\">Dropbox</a>,\\\\nand <a href=\\\\\\"https://blog.cloudflare.com/cloudflare-workers-as-a-serverless-rust-platform/\\\\\\">Cloudflare</a>,\\\\nuses Rust. <strong>From startups to large\\\\ncorporations, from embedded devices to scalable web services, Rust is a great fit.</strong>\\\\n      </p>\\\\n    </div>\\\\n    <div class=\\\\\\"testimonials\\\\\\">\\\\n      <div class=\\\\\\"testimonial flex-none flex-l\\\\\\">\\\\n        <div class=\\\\\\"w-100 w-70-l\\\\\\" id=\\\\\\"npm-testimonial\\\\\\">\\\\n          <blockquote class=\\\\\\"lh-title-ns\\\\\\">\\\\n            My biggest compliment to Rust is that it's boring, and this is an amazing compliment.\\\\n          </blockquote>\\\\n          <p class=\\\\\\"attribution\\\\\\">&ndash; Chris Dickinson, Engineer at npm, Inc</p>\\\\n        </div>\\\\n        <div class=\\\\\\"w-100 w-30-l tc\\\\\\">\\\\n          <a href=\\\\\\"https://www.npmjs.com/\\\\\\">\\\\n            <img src=\\\\\\"/static/images/user-logos/npm.svg\\\\\\" alt=\\\\\\"npm Logo\\\\\\" class=\\\\\\"w-33 w-60-ns h-auto\\\\\\" />\\\\n          </a>\\\\n        </div>\\\\n      </div>\\\\n      <hr/>\\\\n      <div class=\\\\\\"testimonial flex-none flex-l\\\\\\">\\\\n        <div class=\\\\\\"w-100 w-30-l tc\\\\\\">\\\\n          <a href=\\\\\\"https://www.youtube.com/watch?v=u6ZbF4apABk\\\\\\"><img src=\\\\\\"/static/images/user-logos/yelp.png\\\\\\" alt=\\\\\\"Yelp Logo\\\\\\" class=\\\\\\"w-80\\\\\\" /></a>\\\\n        </div>\\\\n        <div class=\\\\\\"w-100 w-70-l\\\\\\" id=\\\\\\"yelp-testimonial\\\\\\">\\\\n          <blockquote>\\\\n            All the documentation, the tooling, the community is great - you have all the tools to succeed in writing Rust code.\\\\n          </blockquote>\\\\n          <p class=\\\\\\"attribution\\\\\\">&ndash; Antonio Verardi, Infrastructure Engineer</p>\\\\n        </div>\\\\n      </div>\\\\n    </div>\\\\n    <a href=\\\\\\"/production\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Learn More</a>\\\\n  </div>\\\\n</section>\\\\n<section class=\\\\\\"get-involved red\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center f3\\\\\\">\\\\n    <header>\\\\n      <h2>Get involved</h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n    <div class=\\\\\\"flex flex-column flex-row-l\\\\\\">\\\\n      <div id=\\\\\\"read-rust\\\\\\" class=\\\\\\"mw-50-l mr4-l pt0 flex flex-column justify-between-l\\\\\\">\\\\n        <h3>Read Rust</h3>\\\\n        <p class=\\\\\\"flex-grow-1\\\\\\">We love documentation! Take a look at the books available online, as well as key blog posts and user guides.</p>\\\\n        <a href=\\\\\\"learn\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Read the book</a>\\\\n      </div>\\\\n      <div id=\\\\\\"watch-rust\\\\\\" class=\\\\\\"mw-50-l pt3 pt0-l flex flex-column justify-between-l\\\\\\">\\\\n        <h3>Watch Rust</h3>\\\\n        <p class=\\\\\\"flex-grow-1\\\\\\">The Rust community has a dedicated YouTube channel collecting a huge range of presentations and\\\\ntutorials.</p>\\\\n        <a href=\\\\\\"https://www.youtube.com/channel/UCaYhcUwRBNscFNUKTjgPFiA\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Watch the Videos</a>\\\\n      </div>\\\\n    </div>\\\\n    <div class=\\\\\\"pt3\\\\\\">\\\\n      <h3>Contribute code</h3>\\\\n      <p>\\\\n      Rust is truly a community effort, and we welcome contribution from hobbyists and production users, from\\\\nnewcomers and seasoned professionals. Come help us make the Rust experience even better!\\\\n      </p>\\\\n      <a href=\\\\\\"https://rustc-dev-guide.rust-lang.org/getting-started.html\\\\\\" class=\\\\\\"button button-secondary\\\\\\">\\\\n        Read Contribution Guide\\\\n      </a>\\\\n    </div>\\\\n  </div>\\\\n</section>\\\\n<section class=\\\\\\"white thanks\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center\\\\\\">\\\\n    <header>\\\\n      <h2>Thanks</h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n    <div class=\\\\\\"description\\\\\\">\\\\n      <p class=\\\\\\"lh-copy f2\\\\\\">\\\\n        Rust would not exist without the generous contributions of time, work, and resources from individuals and companies. We are very grateful for the support!\\\\n      </p>\\\\n    </div>\\\\n    <div class=\\\\\\"flex flex-column flex-row-l\\\\\\">\\\\n      <div id=\\\\\\"individual-code\\\\\\" class=\\\\\\"mw-50-l mr4-l pt0 flex flex-column justify-between-l\\\\\\">\\\\n        <h3>Individuals</h3>\\\\n        <p class=\\\\\\"flex-grow-1\\\\\\">Rust is a community project and is very thankful for the many community contributions it receives.</p>\\\\n        <a href=\\\\\\"https://thanks.rust-lang.org/\\\\\\" class=\\\\\\"button button-secondary\\\\\\">See individual contributors</a>\\\\n      </div>\\\\n      <div id=\\\\\\"company-sponsorships\\\\\\" class=\\\\\\"mw-50-l pt3 pt0-l flex flex-column justify-between-l\\\\\\">\\\\n        <h3>Corporate sponsors</h3>\\\\n        <p class=\\\\\\"flex-grow-1\\\\\\">The Rust project receives support from companies through the Rust Foundation.</p>\\\\n        <a href=\\\\\\"https://foundation.rust-lang.org/members\\\\\\" class=\\\\\\"button button-secondary\\\\\\">See Foundation members</a>\\\\n      </div>\\\\n    </div>\\\\n  </div>\\\\n</section>\\\\n\\\\n    </main>\\\\n    <footer>\\\\n      <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center f3\\\\\\">\\\\n        <div class=\\\\\\"flex flex-column flex-row-ns pv0-l\\\\\\">\\\\n          <div class=\\\\\\"flex flex-column mw8 w-100 measure-wide-l pv2 pv5-m pv2-ns ph4-m ph4-l\\\\\\" id=\\\\\\"get-help\\\\\\">\\\\n            <h4>Get help!</h4>\\\\n            <ul>\\\\n              <li><a href=\\\\\\"/learn\\\\\\">Documentation</a></li>\\\\n              <li><a href=\\\\\\"http://forge.rust-lang.org\\\\\\">Rust Forge (Contributor Documentation)</a></li>\\\\n              <li><a href=\\\\\\"https://users.rust-lang.org\\\\\\">Ask a Question on the Users Forum</a></li>\\\\n            </ul>\\\\n            <div class=\\\\\\"languages\\\\\\">\\\\n              <div class=\\\\\\"select\\\\\\">\\\\n                <label for=\\\\\\"language-footer\\\\\\" class=\\\\\\"hidden\\\\\\">Language</label>\\\\n                <select id=\\\\\\"language-footer\\\\\\">\\\\n                  <option title=\\\\\\"English (en-US)\\\\\\" value=\\\\\\"en-US\\\\\\">English (en-US)</option>\\\\n<option title=\\\\\\"Español (es)\\\\\\" value=\\\\\\"es\\\\\\">Español (es)</option>\\\\n<option title=\\\\\\"Français (fr)\\\\\\" value=\\\\\\"fr\\\\\\">Français (fr)</option>\\\\n<option title=\\\\\\"Italiano (it)\\\\\\" value=\\\\\\"it\\\\\\">Italiano (it)</option>\\\\n<option title=\\\\\\"日本語 (ja)\\\\\\" value=\\\\\\"ja\\\\\\">日本語 (ja)</option>\\\\n<option title=\\\\\\"Português (pt-BR)\\\\\\" value=\\\\\\"pt-BR\\\\\\">Português (pt-BR)</option>\\\\n<option title=\\\\\\"Русский (ru)\\\\\\" value=\\\\\\"ru\\\\\\">Русский (ru)</option>\\\\n<option title=\\\\\\"Türkçe (tr)\\\\\\" value=\\\\\\"tr\\\\\\">Türkçe (tr)</option>\\\\n<option title=\\\\\\"简体中文 (zh-CN)\\\\\\" value=\\\\\\"zh-CN\\\\\\">简体中文 (zh-CN)</option>\\\\n<option title=\\\\\\"正體中文 (zh-TW)\\\\\\" value=\\\\\\"zh-TW\\\\\\">正體中文 (zh-TW)</option>\\\\n            </select>\\\\n              </div>\\\\n            </div>\\\\n          </div>\\\\n          <div class=\\\\\\"flex flex-column mw8 w-100 measure-wide-l pv2 pv5-m pv2-ns ph4-m ph4-l\\\\\\">\\\\n            <h4>Terms and policies</h4>\\\\n            <ul>\\\\n              <li><a href=\\\\\\"/policies/code-of-conduct\\\\\\">Code of Conduct</a></li>\\\\n              <li><a href=\\\\\\"/policies/licenses\\\\\\">Licenses</a></li>\\\\n              <li><a href=\\\\\\"https://foundation.rust-lang.org/policies/logo-policy-and-media-guide/\\\\\\">Logo Policy and Media Guide</a></li>\\\\n              <li><a href=\\\\\\"/policies/security\\\\\\">Security Disclosures</a></li>\\\\n              <li><a href=\\\\\\"https://foundation.rust-lang.org/policies/privacy-policy/\\\\\\">Privacy Notice</a></li>\\\\n              <li><a href=\\\\\\"/policies\\\\\\">All Policies</a></li>\\\\n            </ul>\\\\n          </div>\\\\n          <div class=\\\\\\"flex flex-column mw8 w-100 measure-wide-l pv2 pv5-m pv2-ns ph4-m ph4-l\\\\\\">\\\\n            <h4>Social</h4>\\\\n            <div class=\\\\\\"flex flex-row flex-wrap items-center\\\\\\">\\\\n              <a rel=\\\\\\"me\\\\\\" href=\\\\\\"https://social.rust-lang.org/@rust\\\\\\" target=\\\\\\"_blank\\\\\\"><img src=\\\\\\"/static/images/mastodon.svg\\\\\\" alt=\\\\\\"Mastodon\\\\\\" title=\\\\\\"Mastodon\\\\\\" /></a>\\\\n              <a href=\\\\\\"https://twitter.com/rustlang\\\\\\" target=\\\\\\"_blank\\\\\\"><img src=\\\\\\"/static/images/twitter.svg\\\\\\" alt=\\\\\\"twitter logo\\\\\\" title=\\\\\\"Twitter\\\\\\"/></a>\\\\n              <a href=\\\\\\"https://www.youtube.com/channel/UCaYhcUwRBNscFNUKTjgPFiA\\\\\\" target=\\\\\\"_blank\\\\\\"><img class=\\\\\\"pv2\\\\\\" src=\\\\\\"/static/images/youtube.svg\\\\\\" alt=\\\\\\"youtube logo\\\\\\" title=\\\\\\"YouTube\\\\\\"/></a>\\\\n              <a href=\\\\\\"https://discord.gg/rust-lang\\\\\\" target=\\\\\\"_blank\\\\\\"><img src=\\\\\\"/static/images/discord.svg\\\\\\" alt=\\\\\\"discord logo\\\\\\" title=\\\\\\"Discord\\\\\\"/></a>\\\\n              <a href=\\\\\\"https://github.com/rust-lang\\\\\\" target=\\\\\\"_blank\\\\\\"><img src=\\\\\\"/static/images/github.svg\\\\\\" alt=\\\\\\"github logo\\\\\\" title=\\\\\\"GitHub\\\\\\"/></a>\\\\n            </div>\\\\n          </div>\\\\n    \\\\n        </div>\\\\n        <div class=\\\\\\"attribution\\\\\\">\\\\n          <p>\\\\n            Maintained by the Rust Team. See a bug?\\\\n<a href=\\\\\\"https://github.com/rust-lang/www.rust-lang.org/issues/new/choose\\\\\\">File an issue!</a>\\\\n          </p>\\\\n          <p>Looking for the <a href=\\\\\\"https://prev.rust-lang.org\\\\\\">previous website</a>?</p>\\\\n        </div>\\\\n      </div>\\\\n    </footer>\\\\n    <script src=\\\\\\"/static/scripts/languages.js\\\\\\"></script>\\\\n  </body>\\\\n</html>\\\\n\\"))",
                                      },
                                    },
                                  ],
                                  "id": 1099511627777n,
                                  "metadataId": 4355177280n,
                                },
                              ],
                              "createdAt": {
                                "nanos": 441077750,
                                "seconds": 1699978195n,
                              },
                              "enteredAt": {
                                "nanos": 117679791,
                                "seconds": 1699978201n,
                              },
                              "exitedAt": {
                                "nanos": 117683833,
                                "seconds": 1699978201n,
                              },
                              "fields": [
                                {
                                  "metadataId": 4355177008n,
                                  "name": "id",
                                  "value": {
                                    "oneofKind": "u64Val",
                                    "u64Val": 1066188670690238080n,
                                  },
                                },
                              ],
                              "id": 10n,
                              "metadataId": 4355177008n,
                            },
                            {
                              "children": [],
                              "createdAt": {
                                "nanos": 441073416,
                                "seconds": 1699978195n,
                              },
                              "fields": [
                                {
                                  "metadataId": 4354778704n,
                                  "name": "id",
                                  "value": {
                                    "oneofKind": "u64Val",
                                    "u64Val": 1066188670690238080n,
                                  },
                                },
                              ],
                              "id": 9n,
                              "metadataId": 4354778704n,
                            },
                            {
                              "children": [],
                              "createdAt": {
                                "nanos": 441077750,
                                "seconds": 1699978195n,
                              },
                              "fields": [
                                {
                                  "metadataId": 4355177008n,
                                  "name": "id",
                                  "value": {
                                    "oneofKind": "u64Val",
                                    "u64Val": 1066188670690238080n,
                                  },
                                },
                              ],
                              "id": 10n,
                              "metadataId": 4355177008n,
                            },
                          ],
                          "createdAt": {
                            "nanos": 441065166,
                            "seconds": 1699978195n,
                          },
                          "enteredAt": {
                            "nanos": 441069791,
                            "seconds": 1699978195n,
                          },
                          "exitedAt": {
                            "nanos": 441107500,
                            "seconds": 1699978195n,
                          },
                          "fields": [
                            {
                              "metadataId": 4354778568n,
                              "name": "id",
                              "value": {
                                "oneofKind": "u64Val",
                                "u64Val": 1066188670690238080n,
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "cmd",
                              "value": {
                                "oneofKind": "strVal",
                                "strVal": "test1",
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "kind",
                              "value": {
                                "oneofKind": "strVal",
                                "strVal": "async",
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "loc.line",
                              "value": {
                                "oneofKind": "u64Val",
                                "u64Val": 0n,
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "loc.col",
                              "value": {
                                "oneofKind": "u64Val",
                                "u64Val": 0n,
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "is_internal",
                              "value": {
                                "boolVal": false,
                                "oneofKind": "boolVal",
                              },
                            },
                          ],
                          "id": 2251799813685256n,
                          "metadataId": 4354778568n,
                        },
                        {
                          "children": [],
                          "createdAt": {
                            "nanos": 441065166,
                            "seconds": 1699978195n,
                          },
                          "fields": [
                            {
                              "metadataId": 4354778568n,
                              "name": "id",
                              "value": {
                                "oneofKind": "u64Val",
                                "u64Val": 1066188670690238080n,
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "cmd",
                              "value": {
                                "oneofKind": "strVal",
                                "strVal": "test1",
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "kind",
                              "value": {
                                "oneofKind": "strVal",
                                "strVal": "async",
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "loc.line",
                              "value": {
                                "oneofKind": "u64Val",
                                "u64Val": 0n,
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "loc.col",
                              "value": {
                                "oneofKind": "u64Val",
                                "u64Val": 0n,
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "is_internal",
                              "value": {
                                "boolVal": false,
                                "oneofKind": "boolVal",
                              },
                            },
                          ],
                          "id": 2251799813685256n,
                          "metadataId": 4354778568n,
                        },
                      ],
                      "createdAt": {
                        "nanos": 440973458,
                        "seconds": 1699978195n,
                      },
                      "enteredAt": {
                        "nanos": 440976000,
                        "seconds": 1699978195n,
                      },
                      "exitedAt": {
                        "nanos": 441114791,
                        "seconds": 1699978195n,
                      },
                      "fields": [
                        {
                          "metadataId": 4355177584n,
                          "name": "id",
                          "value": {
                            "oneofKind": "u64Val",
                            "u64Val": 1066188670690238080n,
                          },
                        },
                        {
                          "metadataId": 4355177584n,
                          "name": "cmd",
                          "value": {
                            "oneofKind": "strVal",
                            "strVal": "test1",
                          },
                        },
                      ],
                      "id": 2251799813685255n,
                      "metadataId": 4355177584n,
                    },
                    {
                      "children": [],
                      "createdAt": {
                        "nanos": 440973458,
                        "seconds": 1699978195n,
                      },
                      "fields": [
                        {
                          "metadataId": 4355177584n,
                          "name": "id",
                          "value": {
                            "oneofKind": "u64Val",
                            "u64Val": 1066188670690238080n,
                          },
                        },
                        {
                          "metadataId": 4355177584n,
                          "name": "cmd",
                          "value": {
                            "oneofKind": "strVal",
                            "strVal": "test1",
                          },
                        },
                      ],
                      "id": 2251799813685255n,
                      "metadataId": 4355177584n,
                    },
                  ],
                  "createdAt": {
                    "nanos": 440945750,
                    "seconds": 1699978195n,
                  },
                  "enteredAt": {
                    "nanos": 440951583,
                    "seconds": 1699978195n,
                  },
                  "exitedAt": {
                    "nanos": 441116125,
                    "seconds": 1699978195n,
                  },
                  "fields": [
                    {
                      "metadataId": 4355177432n,
                      "name": "id",
                      "value": {
                        "oneofKind": "u64Val",
                        "u64Val": 1066188670690238080n,
                      },
                    },
                    {
                      "metadataId": 4355177432n,
                      "name": "kind",
                      "value": {
                        "oneofKind": "strVal",
                        "strVal": "post-message",
                      },
                    },
                  ],
                  "id": 2251799813685254n,
                  "metadataId": 4355177432n,
                },
                {
                  "children": [],
                  "createdAt": {
                    "nanos": 440945750,
                    "seconds": 1699978195n,
                  },
                  "fields": [
                    {
                      "metadataId": 4355177432n,
                      "name": "id",
                      "value": {
                        "oneofKind": "u64Val",
                        "u64Val": 1066188670690238080n,
                      },
                    },
                    {
                      "metadataId": 4355177432n,
                      "name": "kind",
                      "value": {
                        "oneofKind": "strVal",
                        "strVal": "post-message",
                      },
                    },
                  ],
                  "id": 2251799813685254n,
                  "metadataId": 4355177432n,
                },
              ],
              "createdAt": {
                "nanos": 440893125,
                "seconds": 1699978195n,
              },
              "enteredAt": {
                "nanos": 440910416,
                "seconds": 1699978195n,
              },
              "exitedAt": {
                "nanos": 441117708,
                "seconds": 1699978195n,
              },
              "fields": [],
              "id": 4503599627370501n,
              "marginLeft": 45.15576529832752,
              "metadataId": 4355189520n,
              "width": 8.365176081792832,
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "children": [
                        {
                          "children": [
                            {
                              "children": [],
                              "createdAt": {
                                "nanos": 596073916,
                                "seconds": 1699978195n,
                              },
                              "enteredAt": {
                                "nanos": 783977125,
                                "seconds": 1699978201n,
                              },
                              "exitedAt": {
                                "nanos": 783982958,
                                "seconds": 1699978201n,
                              },
                              "fields": [
                                {
                                  "metadataId": 4354778704n,
                                  "name": "id",
                                  "value": {
                                    "oneofKind": "u64Val",
                                    "u64Val": 10869309688778586112n,
                                  },
                                },
                              ],
                              "id": 15n,
                              "metadataId": 4354778704n,
                            },
                            {
                              "children": [
                                {
                                  "children": [],
                                  "createdAt": {
                                    "nanos": 785439916,
                                    "seconds": 1699978201n,
                                  },
                                  "enteredAt": {
                                    "nanos": 785470791,
                                    "seconds": 1699978201n,
                                  },
                                  "exitedAt": {
                                    "nanos": 795454833,
                                    "seconds": 1699978201n,
                                  },
                                  "fields": [
                                    {
                                      "metadataId": 4355177280n,
                                      "name": "id",
                                      "value": {
                                        "oneofKind": "u64Val",
                                        "u64Val": 10869309688778586112n,
                                      },
                                    },
                                    {
                                      "metadataId": 4355177280n,
                                      "name": "response",
                                      "value": {
                                        "oneofKind": "strVal",
                                        "strVal": "Ok(String(\\"<!doctype html>\\\\n<html lang=\\\\\\"en-US\\\\\\">\\\\n  <head>\\\\n    <meta charset=\\\\\\"utf-8\\\\\\">\\\\n    <title>\\\\n            Rust Programming Language\\\\n        </title>\\\\n    <meta name=\\\\\\"viewport\\\\\\" content=\\\\\\"width=device-width,initial-scale=1.0\\\\\\">\\\\n    <meta name=\\\\\\"description\\\\\\" content=\\\\\\"A language empowering everyone to build reliable and efficient software.\\\\\\">\\\\n\\\\n    <!-- Twitter card -->\\\\n    <meta name=\\\\\\"twitter:card\\\\\\" content=\\\\\\"summary\\\\\\">\\\\n    <meta name=\\\\\\"twitter:site\\\\\\" content=\\\\\\"@rustlang\\\\\\">\\\\n    <meta name=\\\\\\"twitter:creator\\\\\\" content=\\\\\\"@rustlang\\\\\\">\\\\n    <meta name=\\\\\\"twitter:title\\\\\\" content=\\\\\\"\\\\\\">\\\\n    <meta name=\\\\\\"twitter:description\\\\\\" content=\\\\\\"A language empowering everyone to build reliable and efficient software.\\\\\\">\\\\n    <meta name=\\\\\\"twitter:image\\\\\\" content=\\\\\\"https://www.rust-lang.org/static/images/rust-social.jpg\\\\\\">\\\\n\\\\n    <!-- Facebook OpenGraph -->\\\\n    <meta property=\\\\\\"og:title\\\\\\" content=\\\\\\"\\\\\\" />\\\\n    <meta property=\\\\\\"og:description\\\\\\" content=\\\\\\"A language empowering everyone to build reliable and efficient software.\\\\\\">\\\\n    <meta property=\\\\\\"og:image\\\\\\" content=\\\\\\"https://www.rust-lang.org/static/images/rust-social-wide.jpg\\\\\\" />\\\\n    <meta property=\\\\\\"og:type\\\\\\" content=\\\\\\"website\\\\\\" />\\\\n    <meta property=\\\\\\"og:locale\\\\\\" content=\\\\\\"en_US\\\\\\" />\\\\n\\\\n    <!-- styles -->\\\\n    <link rel=\\\\\\"stylesheet\\\\\\" href=\\\\\\"/static/styles/a11y-dark.css\\\\\\"/>\\\\n    <link rel=\\\\\\"stylesheet\\\\\\" href=\\\\\\"/static/styles/vendor_10880690442070639967.css\\\\\\"/>\\\\n    <link rel=\\\\\\"stylesheet\\\\\\" href=\\\\\\"/static/styles/fonts_8049871103083011125.css\\\\\\"/>\\\\n    <link rel=\\\\\\"stylesheet\\\\\\" href=\\\\\\"/static/styles/app_14658805106732275902.css\\\\\\"/>\\\\n\\\\n    <!-- favicon -->\\\\n    <link rel=\\\\\\"apple-touch-icon\\\\\\" sizes=\\\\\\"180x180\\\\\\" href=\\\\\\"/static/images/apple-touch-icon.png?v=ngJW8jGAmR\\\\\\">\\\\n    <link rel=\\\\\\"icon\\\\\\" sizes=\\\\\\"16x16\\\\\\" type=\\\\\\"image/png\\\\\\" href=\\\\\\"/static/images/favicon-16x16.png\\\\\\">\\\\n    <link rel=\\\\\\"icon\\\\\\" sizes=\\\\\\"32x32\\\\\\" type=\\\\\\"image/png\\\\\\" href=\\\\\\"/static/images/favicon-32x32.png\\\\\\">\\\\n    <link rel=\\\\\\"icon\\\\\\" type=\\\\\\"image/svg+xml\\\\\\" href=\\\\\\"/static/images/favicon.svg\\\\\\">\\\\n    <link rel=\\\\\\"manifest\\\\\\" href=\\\\\\"/static/images/site.webmanifest?v=ngJW8jGAmR\\\\\\">\\\\n    <link rel=\\\\\\"mask-icon\\\\\\" href=\\\\\\"/static/images/safari-pinned-tab.svg?v=ngJW8jGAmR\\\\\\" color=\\\\\\"#000000\\\\\\">\\\\n    <meta name=\\\\\\"msapplication-TileColor\\\\\\" content=\\\\\\"#ffffff\\\\\\">\\\\n    <meta name=\\\\\\"msapplication-config\\\\\\" content=\\\\\\"/static/images/browserconfig.xml?v=ngJW8jGAmR\\\\\\">\\\\n    <meta name=\\\\\\"theme-color\\\\\\" content=\\\\\\"#ffffff\\\\\\">\\\\n\\\\n        <!-- locales -->\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/en-US\\\\\\" hreflang=\\\\\\"en-US\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/es\\\\\\" hreflang=\\\\\\"es\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/fr\\\\\\" hreflang=\\\\\\"fr\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/it\\\\\\" hreflang=\\\\\\"it\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/ja\\\\\\" hreflang=\\\\\\"ja\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/pt-BR\\\\\\" hreflang=\\\\\\"pt-BR\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/ru\\\\\\" hreflang=\\\\\\"ru\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/tr\\\\\\" hreflang=\\\\\\"tr\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/zh-CN\\\\\\" hreflang=\\\\\\"zh-CN\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/zh-TW\\\\\\" hreflang=\\\\\\"zh-TW\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/\\\\\\" hreflang=\\\\\\"x-default\\\\\\">\\\\n\\\\n    <!-- Custom Highlight pack with: Rust, Markdown, TOML, Bash, JSON, YAML,\\\\n         and plaintext. -->\\\\n    <script src=\\\\\\"/static/scripts/highlight.pack.js\\\\\\" defer></script>\\\\n    <script src=\\\\\\"/static/scripts/init.js\\\\\\" defer></script>\\\\n  </head>\\\\n  <body>\\\\n    <nav class=\\\\\\"flex flex-row justify-center justify-end-l items-center flex-wrap ph2 pl3-ns pr3-ns pb3\\\\\\">\\\\n      <div class=\\\\\\"brand flex-auto w-100 w-auto-l self-start tc tl-l\\\\\\">\\\\n        <a href=\\\\\\"/\\\\\\" class=\\\\\\"brand\\\\\\">\\\\n          <img class=\\\\\\"v-mid ml0-l\\\\\\" alt=\\\\\\"Rust Logo\\\\\\" src=\\\\\\"/static/images/rust-logo-blk.svg\\\\\\">\\\\n    </a>\\\\n      </div>\\\\n    \\\\n      <ul class=\\\\\\"nav list w-100 w-auto-l flex flex-none flex-row flex-wrap justify-center justify-end-l items-center pv2 ph0 ph4-ns\\\\\\">\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/tools/install\\\\\\">Install</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/learn\\\\\\">Learn</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"https://play.rust-lang.org/\\\\\\">Playground</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/tools\\\\\\">Tools</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/governance\\\\\\">Governance</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/community\\\\\\">Community</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"https://blog.rust-lang.org/\\\\\\">Blog</a></li>\\\\n      </ul>\\\\n    \\\\n      <div class=\\\\\\" w-100 w-auto-l flex-none flex justify-center pv4 pv-0-l languages\\\\\\">\\\\n        <div class=\\\\\\"select\\\\\\">\\\\n          <label for=\\\\\\"language-nav\\\\\\" class=\\\\\\"hidden\\\\\\">Language</label>\\\\n          <select id=\\\\\\"language-nav\\\\\\" data-current-lang=\\\\\\"en-US\\\\\\">\\\\n            <option title=\\\\\\"English (en-US)\\\\\\" value=\\\\\\"en-US\\\\\\">English (en-US)</option>\\\\n<option title=\\\\\\"Español (es)\\\\\\" value=\\\\\\"es\\\\\\">Español (es)</option>\\\\n<option title=\\\\\\"Français (fr)\\\\\\" value=\\\\\\"fr\\\\\\">Français (fr)</option>\\\\n<option title=\\\\\\"Italiano (it)\\\\\\" value=\\\\\\"it\\\\\\">Italiano (it)</option>\\\\n<option title=\\\\\\"日本語 (ja)\\\\\\" value=\\\\\\"ja\\\\\\">日本語 (ja)</option>\\\\n<option title=\\\\\\"Português (pt-BR)\\\\\\" value=\\\\\\"pt-BR\\\\\\">Português (pt-BR)</option>\\\\n<option title=\\\\\\"Русский (ru)\\\\\\" value=\\\\\\"ru\\\\\\">Русский (ru)</option>\\\\n<option title=\\\\\\"Türkçe (tr)\\\\\\" value=\\\\\\"tr\\\\\\">Türkçe (tr)</option>\\\\n<option title=\\\\\\"简体中文 (zh-CN)\\\\\\" value=\\\\\\"zh-CN\\\\\\">简体中文 (zh-CN)</option>\\\\n<option title=\\\\\\"正體中文 (zh-TW)\\\\\\" value=\\\\\\"zh-TW\\\\\\">正體中文 (zh-TW)</option>\\\\n      </select>\\\\n        </div>\\\\n      </div>\\\\n    \\\\n    </nav>\\\\n    <main><header class=\\\\\\"mt3 mb6 w-100 mw-none ph3 mw8-m mw9-l center\\\\\\">\\\\n  <div class=\\\\\\"flex flex-column flex-row-l\\\\\\">\\\\n    <div class=\\\\\\"w-70-l mw8-l\\\\\\">\\\\n      <h1>Rust</h1>\\\\n      <h2 class=\\\\\\"mt4 mb0 f2 f1-ns\\\\\\">\\\\n        A language empowering everyone <br class='dn db-ns'> to build reliable and efficient software.\\\\n      </h2>\\\\n    </div>\\\\n    <div class=\\\\\\"w-30-l flex-column pl0-l pr0-l pl3 pr3\\\\\\">\\\\n      <a class=\\\\\\"button button-download ph4 mt0 w-100\\\\\\" href=\\\\\\"/learn/get-started\\\\\\">\\\\n        Get Started\\\\n      </a>\\\\n      <p class=\\\\\\"tc f3 f2-l mt3\\\\\\">\\\\n        <a href=\\\\\\"https://blog.rust-lang.org/2023/10/05/Rust-1.73.0.html\\\\\\" class=\\\\\\"download-link\\\\\\">Version 1.73.0</a>\\\\n      </p>\\\\n    </div>\\\\n  </div>\\\\n</header>\\\\n\\\\n<section id=\\\\\\"language-values\\\\\\" class=\\\\\\"green\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center f3\\\\\\">\\\\n    <header class=\\\\\\"pb0\\\\\\">\\\\n      <h2>\\\\n        Why Rust?\\\\n      </h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n    <div class=\\\\\\"flex-none flex-l\\\\\\">\\\\n      <section class=\\\\\\"w-100 pv2 pv0-l mt4\\\\\\">\\\\n        <h3 class=\\\\\\"f2 f1-l\\\\\\">Performance</h3>\\\\n        <p class=\\\\\\"f3 lh-copy\\\\\\">\\\\n          Rust is blazingly fast and memory-efficient: with no runtime or\\\\ngarbage collector, it can power performance-critical services, run on\\\\nembedded devices, and easily integrate with other languages.\\\\n        </p>\\\\n      </section>\\\\n      <section class=\\\\\\"w-100 pv2 pv0-l mt4 mh5-l\\\\\\">\\\\n        <h3 class=\\\\\\"f2 f1-l\\\\\\">Reliability</h3>\\\\n        <p class=\\\\\\"f3 lh-copy\\\\\\">\\\\n          Rust’s rich type system and ownership model guarantee memory-safety\\\\nand thread-safety &mdash; enabling you to eliminate many classes of\\\\nbugs at compile-time.\\\\n        </p>\\\\n      </section>\\\\n      <section class=\\\\\\"w-100 pv2 pv0-l mt4\\\\\\">\\\\n        <h3 class=\\\\\\"f2 f1-l\\\\\\">Productivity</h3>\\\\n        <p class=\\\\\\"f3 lh-copy\\\\\\">\\\\n          Rust has great documentation, a friendly compiler with useful error\\\\nmessages, and top-notch tooling &mdash; an integrated package manager\\\\nand build tool, smart multi-editor support with auto-completion and\\\\ntype inspections, an auto-formatter, and more.\\\\n        </p>\\\\n      </section>\\\\n\\\\n    </div>\\\\n  </div>\\\\n</section>\\\\n<section class=\\\\\\"purple\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center f3\\\\\\">\\\\n    <header>\\\\n      <h2>\\\\n        Build it in Rust\\\\n      </h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n\\\\n    <div class=\\\\\\"flex-none flex-l flex-row\\\\\\">\\\\n      <p class=\\\\\\"flex-grow-1 pb2\\\\\\">\\\\n        In 2018, the Rust community decided to improve the programming experience\\\\nfor a few distinct domains (see <a\\\\nhref=\\\\\\"https://blog.rust-lang.org/2018/03/12/roadmap.html\\\\\\">the 2018\\\\nroadmap</a>). For these, you can find many high-quality crates and some\\\\nawesome guides on how to get started.\\\\n      </p>\\\\n    </div>\\\\n\\\\n    <div class=\\\\\\"flex-none flex-l flex-row\\\\\\">\\\\n      <div class=\\\\\\"flex flex-row flex-column-l justify-between-l mw8 measure-wide-l w-100 mt5 mt2-l\\\\\\">\\\\n        <div class=\\\\\\"v-top tc-l\\\\\\">\\\\n          <img src=\\\\\\"/static/images/cli.svg\\\\\\" alt=\\\\\\"terminal\\\\\\"\\\\n               class=\\\\\\"mw3 mw4-ns\\\\\\"/>\\\\n        </div>\\\\n        <div class=\\\\\\"v-top pl4 pl0-l pt0 pt3-l measure-wide-l flex-l flex-column-l flex-auto-l justify-between-l\\\\\\">\\\\n          <h3 class=\\\\\\"tc-l\\\\\\">\\\\n            Command Line\\\\n          </h3>\\\\n          <p class=\\\\\\"flex-grow-1\\\\\\">\\\\n            Whip up a CLI tool quickly with Rust’s robust ecosystem.\\\\nRust helps you maintain your app with confidence and distribute it with ease.\\\\n          </p>\\\\n          <a href=\\\\\\"/what/cli\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Building Tools</a>\\\\n        </div>\\\\n      </div>\\\\n\\\\n      <div class=\\\\\\"flex flex-row flex-column-l justify-between-l mw8 measure-wide-l w-100 mt5 mt2-l pl4-l\\\\\\">\\\\n        <div class=\\\\\\"v-top tc-l\\\\\\">\\\\n          <img src=\\\\\\"/static/images/webassembly.svg\\\\\\" alt=\\\\\\"gear with puzzle piece elements\\\\\\"\\\\n               class=\\\\\\"mw3 mw4-ns\\\\\\"/>\\\\n        </div>\\\\n        <div class=\\\\\\"v-top pl4 pl0-l pt0 pt3-l measure-wide-l flex-l flex-column-l flex-auto-l justify-between-l\\\\\\">\\\\n          <h3 class=\\\\\\"tc-l\\\\\\">\\\\n            WebAssembly\\\\n          </h3>\\\\n          <p class=\\\\\\"flex-grow-1\\\\\\">\\\\n          Use Rust to supercharge your JavaScript, one module at a time.\\\\nPublish to npm, bundle with webpack, and you’re off to the races.\\\\n          </p>\\\\n          <a href=\\\\\\"/what/wasm\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Writing Web Apps</a>\\\\n        </div>\\\\n      </div>\\\\n\\\\n      <div class=\\\\\\"flex flex-row flex-column-l justify-between-l mw8 measure-wide-l w-100 mt5 mt2-l pl4-l\\\\\\">\\\\n        <div class=\\\\\\"v-top tc-l\\\\\\">\\\\n          <img src=\\\\\\"/static/images/networking.svg\\\\\\" alt=\\\\\\"a cloud with nodes\\\\\\"\\\\n               class=\\\\\\"mw3 mw4-ns\\\\\\"/>\\\\n        </div>\\\\n        <div class=\\\\\\"v-top pl4 pl0-l pt0 pt3-l measure-wide-l flex-l flex-column-l flex-auto-l justify-between-l\\\\\\">\\\\n          <h3 class=\\\\\\"tc-l\\\\\\">\\\\n            Networking\\\\n          </h3>\\\\n          <p class=\\\\\\"flex-grow-1\\\\\\">\\\\n            Predictable performance. Tiny resource footprint. Rock-solid reliability.\\\\nRust is great for network services.\\\\n          </p>\\\\n          <a href=\\\\\\"/what/networking\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Working On Servers</a>\\\\n        </div>\\\\n      </div>\\\\n\\\\n      <div class=\\\\\\"flex flex-row flex-column-l justify-between-l mw8 measure-wide-l w-100 mt5 mt2-l pl4-l\\\\\\">\\\\n        <div class=\\\\\\"v-top tc-l\\\\\\">\\\\n          <img src=\\\\\\"/static/images/embedded.svg\\\\\\" alt=\\\\\\"an embedded device chip\\\\\\"\\\\n               class=\\\\\\"mw3 mw4-ns\\\\\\"/>\\\\n        </div>\\\\n        <div class=\\\\\\"v-top pl4 pl0-l pt0 pt3-l measure-wide-l flex-l flex-column-l flex-auto-l justify-between-l\\\\\\">\\\\n          <h3 class=\\\\\\"tc-l\\\\\\">\\\\n            Embedded\\\\n          </h3>\\\\n          <p class=\\\\\\"flex-grow-1\\\\\\">\\\\n            Targeting low-resource devices?\\\\nNeed low-level control without giving up high-level conveniences?\\\\nRust has you covered.\\\\n          </p>\\\\n          <a href=\\\\\\"/what/embedded\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Starting With Embedded</a>\\\\n        </div>\\\\n      </div>\\\\n    </div>\\\\n  </div>\\\\n</section>\\\\n<section class=\\\\\\"white production\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center\\\\\\">\\\\n    <header>\\\\n      <h2>Rust in production</h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n    <div class=\\\\\\"description\\\\\\">\\\\n      <p class=\\\\\\"lh-copy f2\\\\\\">\\\\n        Hundreds of companies around the world are using Rust in production\\\\ntoday for fast, low-resource, cross-platform solutions. Software you know\\\\nand love, like <a href=\\\\\\"https://hacks.mozilla.org/2017/08/inside-a-super-fast-css-engine-quantum-css-aka-stylo/\\\\\\">Firefox</a>,\\\\n<a href=\\\\\\"https://blogs.dropbox.com/tech/2016/06/lossless-compression-with-brotli/\\\\\\">Dropbox</a>,\\\\nand <a href=\\\\\\"https://blog.cloudflare.com/cloudflare-workers-as-a-serverless-rust-platform/\\\\\\">Cloudflare</a>,\\\\nuses Rust. <strong>From startups to large\\\\ncorporations, from embedded devices to scalable web services, Rust is a great fit.</strong>\\\\n      </p>\\\\n    </div>\\\\n    <div class=\\\\\\"testimonials\\\\\\">\\\\n      <div class=\\\\\\"testimonial flex-none flex-l\\\\\\">\\\\n        <div class=\\\\\\"w-100 w-70-l\\\\\\" id=\\\\\\"npm-testimonial\\\\\\">\\\\n          <blockquote class=\\\\\\"lh-title-ns\\\\\\">\\\\n            My biggest compliment to Rust is that it's boring, and this is an amazing compliment.\\\\n          </blockquote>\\\\n          <p class=\\\\\\"attribution\\\\\\">&ndash; Chris Dickinson, Engineer at npm, Inc</p>\\\\n        </div>\\\\n        <div class=\\\\\\"w-100 w-30-l tc\\\\\\">\\\\n          <a href=\\\\\\"https://www.npmjs.com/\\\\\\">\\\\n            <img src=\\\\\\"/static/images/user-logos/npm.svg\\\\\\" alt=\\\\\\"npm Logo\\\\\\" class=\\\\\\"w-33 w-60-ns h-auto\\\\\\" />\\\\n          </a>\\\\n        </div>\\\\n      </div>\\\\n      <hr/>\\\\n      <div class=\\\\\\"testimonial flex-none flex-l\\\\\\">\\\\n        <div class=\\\\\\"w-100 w-30-l tc\\\\\\">\\\\n          <a href=\\\\\\"https://www.youtube.com/watch?v=u6ZbF4apABk\\\\\\"><img src=\\\\\\"/static/images/user-logos/yelp.png\\\\\\" alt=\\\\\\"Yelp Logo\\\\\\" class=\\\\\\"w-80\\\\\\" /></a>\\\\n        </div>\\\\n        <div class=\\\\\\"w-100 w-70-l\\\\\\" id=\\\\\\"yelp-testimonial\\\\\\">\\\\n          <blockquote>\\\\n            All the documentation, the tooling, the community is great - you have all the tools to succeed in writing Rust code.\\\\n          </blockquote>\\\\n          <p class=\\\\\\"attribution\\\\\\">&ndash; Antonio Verardi, Infrastructure Engineer</p>\\\\n        </div>\\\\n      </div>\\\\n    </div>\\\\n    <a href=\\\\\\"/production\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Learn More</a>\\\\n  </div>\\\\n</section>\\\\n<section class=\\\\\\"get-involved red\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center f3\\\\\\">\\\\n    <header>\\\\n      <h2>Get involved</h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n    <div class=\\\\\\"flex flex-column flex-row-l\\\\\\">\\\\n      <div id=\\\\\\"read-rust\\\\\\" class=\\\\\\"mw-50-l mr4-l pt0 flex flex-column justify-between-l\\\\\\">\\\\n        <h3>Read Rust</h3>\\\\n        <p class=\\\\\\"flex-grow-1\\\\\\">We love documentation! Take a look at the books available online, as well as key blog posts and user guides.</p>\\\\n        <a href=\\\\\\"learn\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Read the book</a>\\\\n      </div>\\\\n      <div id=\\\\\\"watch-rust\\\\\\" class=\\\\\\"mw-50-l pt3 pt0-l flex flex-column justify-between-l\\\\\\">\\\\n        <h3>Watch Rust</h3>\\\\n        <p class=\\\\\\"flex-grow-1\\\\\\">The Rust community has a dedicated YouTube channel collecting a huge range of presentations and\\\\ntutorials.</p>\\\\n        <a href=\\\\\\"https://www.youtube.com/channel/UCaYhcUwRBNscFNUKTjgPFiA\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Watch the Videos</a>\\\\n      </div>\\\\n    </div>\\\\n    <div class=\\\\\\"pt3\\\\\\">\\\\n      <h3>Contribute code</h3>\\\\n      <p>\\\\n      Rust is truly a community effort, and we welcome contribution from hobbyists and production users, from\\\\nnewcomers and seasoned professionals. Come help us make the Rust experience even better!\\\\n      </p>\\\\n      <a href=\\\\\\"https://rustc-dev-guide.rust-lang.org/getting-started.html\\\\\\" class=\\\\\\"button button-secondary\\\\\\">\\\\n        Read Contribution Guide\\\\n      </a>\\\\n    </div>\\\\n  </div>\\\\n</section>\\\\n<section class=\\\\\\"white thanks\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center\\\\\\">\\\\n    <header>\\\\n      <h2>Thanks</h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n    <div class=\\\\\\"description\\\\\\">\\\\n      <p class=\\\\\\"lh-copy f2\\\\\\">\\\\n        Rust would not exist without the generous contributions of time, work, and resources from individuals and companies. We are very grateful for the support!\\\\n      </p>\\\\n    </div>\\\\n    <div class=\\\\\\"flex flex-column flex-row-l\\\\\\">\\\\n      <div id=\\\\\\"individual-code\\\\\\" class=\\\\\\"mw-50-l mr4-l pt0 flex flex-column justify-between-l\\\\\\">\\\\n        <h3>Individuals</h3>\\\\n        <p class=\\\\\\"flex-grow-1\\\\\\">Rust is a community project and is very thankful for the many community contributions it receives.</p>\\\\n        <a href=\\\\\\"https://thanks.rust-lang.org/\\\\\\" class=\\\\\\"button button-secondary\\\\\\">See individual contributors</a>\\\\n      </div>\\\\n      <div id=\\\\\\"company-sponsorships\\\\\\" class=\\\\\\"mw-50-l pt3 pt0-l flex flex-column justify-between-l\\\\\\">\\\\n        <h3>Corporate sponsors</h3>\\\\n        <p class=\\\\\\"flex-grow-1\\\\\\">The Rust project receives support from companies through the Rust Foundation.</p>\\\\n        <a href=\\\\\\"https://foundation.rust-lang.org/members\\\\\\" class=\\\\\\"button button-secondary\\\\\\">See Foundation members</a>\\\\n      </div>\\\\n    </div>\\\\n  </div>\\\\n</section>\\\\n\\\\n    </main>\\\\n    <footer>\\\\n      <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center f3\\\\\\">\\\\n        <div class=\\\\\\"flex flex-column flex-row-ns pv0-l\\\\\\">\\\\n          <div class=\\\\\\"flex flex-column mw8 w-100 measure-wide-l pv2 pv5-m pv2-ns ph4-m ph4-l\\\\\\" id=\\\\\\"get-help\\\\\\">\\\\n            <h4>Get help!</h4>\\\\n            <ul>\\\\n              <li><a href=\\\\\\"/learn\\\\\\">Documentation</a></li>\\\\n              <li><a href=\\\\\\"http://forge.rust-lang.org\\\\\\">Rust Forge (Contributor Documentation)</a></li>\\\\n              <li><a href=\\\\\\"https://users.rust-lang.org\\\\\\">Ask a Question on the Users Forum</a></li>\\\\n            </ul>\\\\n            <div class=\\\\\\"languages\\\\\\">\\\\n              <div class=\\\\\\"select\\\\\\">\\\\n                <label for=\\\\\\"language-footer\\\\\\" class=\\\\\\"hidden\\\\\\">Language</label>\\\\n                <select id=\\\\\\"language-footer\\\\\\">\\\\n                  <option title=\\\\\\"English (en-US)\\\\\\" value=\\\\\\"en-US\\\\\\">English (en-US)</option>\\\\n<option title=\\\\\\"Español (es)\\\\\\" value=\\\\\\"es\\\\\\">Español (es)</option>\\\\n<option title=\\\\\\"Français (fr)\\\\\\" value=\\\\\\"fr\\\\\\">Français (fr)</option>\\\\n<option title=\\\\\\"Italiano (it)\\\\\\" value=\\\\\\"it\\\\\\">Italiano (it)</option>\\\\n<option title=\\\\\\"日本語 (ja)\\\\\\" value=\\\\\\"ja\\\\\\">日本語 (ja)</option>\\\\n<option title=\\\\\\"Português (pt-BR)\\\\\\" value=\\\\\\"pt-BR\\\\\\">Português (pt-BR)</option>\\\\n<option title=\\\\\\"Русский (ru)\\\\\\" value=\\\\\\"ru\\\\\\">Русский (ru)</option>\\\\n<option title=\\\\\\"Türkçe (tr)\\\\\\" value=\\\\\\"tr\\\\\\">Türkçe (tr)</option>\\\\n<option title=\\\\\\"简体中文 (zh-CN)\\\\\\" value=\\\\\\"zh-CN\\\\\\">简体中文 (zh-CN)</option>\\\\n<option title=\\\\\\"正體中文 (zh-TW)\\\\\\" value=\\\\\\"zh-TW\\\\\\">正體中文 (zh-TW)</option>\\\\n            </select>\\\\n              </div>\\\\n            </div>\\\\n          </div>\\\\n          <div class=\\\\\\"flex flex-column mw8 w-100 measure-wide-l pv2 pv5-m pv2-ns ph4-m ph4-l\\\\\\">\\\\n            <h4>Terms and policies</h4>\\\\n            <ul>\\\\n              <li><a href=\\\\\\"/policies/code-of-conduct\\\\\\">Code of Conduct</a></li>\\\\n              <li><a href=\\\\\\"/policies/licenses\\\\\\">Licenses</a></li>\\\\n              <li><a href=\\\\\\"https://foundation.rust-lang.org/policies/logo-policy-and-media-guide/\\\\\\">Logo Policy and Media Guide</a></li>\\\\n              <li><a href=\\\\\\"/policies/security\\\\\\">Security Disclosures</a></li>\\\\n              <li><a href=\\\\\\"https://foundation.rust-lang.org/policies/privacy-policy/\\\\\\">Privacy Notice</a></li>\\\\n              <li><a href=\\\\\\"/policies\\\\\\">All Policies</a></li>\\\\n            </ul>\\\\n          </div>\\\\n          <div class=\\\\\\"flex flex-column mw8 w-100 measure-wide-l pv2 pv5-m pv2-ns ph4-m ph4-l\\\\\\">\\\\n            <h4>Social</h4>\\\\n            <div class=\\\\\\"flex flex-row flex-wrap items-center\\\\\\">\\\\n              <a rel=\\\\\\"me\\\\\\" href=\\\\\\"https://social.rust-lang.org/@rust\\\\\\" target=\\\\\\"_blank\\\\\\"><img src=\\\\\\"/static/images/mastodon.svg\\\\\\" alt=\\\\\\"Mastodon\\\\\\" title=\\\\\\"Mastodon\\\\\\" /></a>\\\\n              <a href=\\\\\\"https://twitter.com/rustlang\\\\\\" target=\\\\\\"_blank\\\\\\"><img src=\\\\\\"/static/images/twitter.svg\\\\\\" alt=\\\\\\"twitter logo\\\\\\" title=\\\\\\"Twitter\\\\\\"/></a>\\\\n              <a href=\\\\\\"https://www.youtube.com/channel/UCaYhcUwRBNscFNUKTjgPFiA\\\\\\" target=\\\\\\"_blank\\\\\\"><img class=\\\\\\"pv2\\\\\\" src=\\\\\\"/static/images/youtube.svg\\\\\\" alt=\\\\\\"youtube logo\\\\\\" title=\\\\\\"YouTube\\\\\\"/></a>\\\\n              <a href=\\\\\\"https://discord.gg/rust-lang\\\\\\" target=\\\\\\"_blank\\\\\\"><img src=\\\\\\"/static/images/discord.svg\\\\\\" alt=\\\\\\"discord logo\\\\\\" title=\\\\\\"Discord\\\\\\"/></a>\\\\n              <a href=\\\\\\"https://github.com/rust-lang\\\\\\" target=\\\\\\"_blank\\\\\\"><img src=\\\\\\"/static/images/github.svg\\\\\\" alt=\\\\\\"github logo\\\\\\" title=\\\\\\"GitHub\\\\\\"/></a>\\\\n            </div>\\\\n          </div>\\\\n    \\\\n        </div>\\\\n        <div class=\\\\\\"attribution\\\\\\">\\\\n          <p>\\\\n            Maintained by the Rust Team. See a bug?\\\\n<a href=\\\\\\"https://github.com/rust-lang/www.rust-lang.org/issues/new/choose\\\\\\">File an issue!</a>\\\\n          </p>\\\\n          <p>Looking for the <a href=\\\\\\"https://prev.rust-lang.org\\\\\\">previous website</a>?</p>\\\\n        </div>\\\\n      </div>\\\\n    </footer>\\\\n    <script src=\\\\\\"/static/scripts/languages.js\\\\\\"></script>\\\\n  </body>\\\\n</html>\\\\n\\"))",
                                      },
                                    },
                                  ],
                                  "id": 6756224074776577n,
                                  "metadataId": 4355177280n,
                                },
                                {
                                  "children": [],
                                  "createdAt": {
                                    "nanos": 785439916,
                                    "seconds": 1699978201n,
                                  },
                                  "fields": [
                                    {
                                      "metadataId": 4355177280n,
                                      "name": "id",
                                      "value": {
                                        "oneofKind": "u64Val",
                                        "u64Val": 10869309688778586112n,
                                      },
                                    },
                                    {
                                      "metadataId": 4355177280n,
                                      "name": "response",
                                      "value": {
                                        "oneofKind": "strVal",
                                        "strVal": "Ok(String(\\"<!doctype html>\\\\n<html lang=\\\\\\"en-US\\\\\\">\\\\n  <head>\\\\n    <meta charset=\\\\\\"utf-8\\\\\\">\\\\n    <title>\\\\n            Rust Programming Language\\\\n        </title>\\\\n    <meta name=\\\\\\"viewport\\\\\\" content=\\\\\\"width=device-width,initial-scale=1.0\\\\\\">\\\\n    <meta name=\\\\\\"description\\\\\\" content=\\\\\\"A language empowering everyone to build reliable and efficient software.\\\\\\">\\\\n\\\\n    <!-- Twitter card -->\\\\n    <meta name=\\\\\\"twitter:card\\\\\\" content=\\\\\\"summary\\\\\\">\\\\n    <meta name=\\\\\\"twitter:site\\\\\\" content=\\\\\\"@rustlang\\\\\\">\\\\n    <meta name=\\\\\\"twitter:creator\\\\\\" content=\\\\\\"@rustlang\\\\\\">\\\\n    <meta name=\\\\\\"twitter:title\\\\\\" content=\\\\\\"\\\\\\">\\\\n    <meta name=\\\\\\"twitter:description\\\\\\" content=\\\\\\"A language empowering everyone to build reliable and efficient software.\\\\\\">\\\\n    <meta name=\\\\\\"twitter:image\\\\\\" content=\\\\\\"https://www.rust-lang.org/static/images/rust-social.jpg\\\\\\">\\\\n\\\\n    <!-- Facebook OpenGraph -->\\\\n    <meta property=\\\\\\"og:title\\\\\\" content=\\\\\\"\\\\\\" />\\\\n    <meta property=\\\\\\"og:description\\\\\\" content=\\\\\\"A language empowering everyone to build reliable and efficient software.\\\\\\">\\\\n    <meta property=\\\\\\"og:image\\\\\\" content=\\\\\\"https://www.rust-lang.org/static/images/rust-social-wide.jpg\\\\\\" />\\\\n    <meta property=\\\\\\"og:type\\\\\\" content=\\\\\\"website\\\\\\" />\\\\n    <meta property=\\\\\\"og:locale\\\\\\" content=\\\\\\"en_US\\\\\\" />\\\\n\\\\n    <!-- styles -->\\\\n    <link rel=\\\\\\"stylesheet\\\\\\" href=\\\\\\"/static/styles/a11y-dark.css\\\\\\"/>\\\\n    <link rel=\\\\\\"stylesheet\\\\\\" href=\\\\\\"/static/styles/vendor_10880690442070639967.css\\\\\\"/>\\\\n    <link rel=\\\\\\"stylesheet\\\\\\" href=\\\\\\"/static/styles/fonts_8049871103083011125.css\\\\\\"/>\\\\n    <link rel=\\\\\\"stylesheet\\\\\\" href=\\\\\\"/static/styles/app_14658805106732275902.css\\\\\\"/>\\\\n\\\\n    <!-- favicon -->\\\\n    <link rel=\\\\\\"apple-touch-icon\\\\\\" sizes=\\\\\\"180x180\\\\\\" href=\\\\\\"/static/images/apple-touch-icon.png?v=ngJW8jGAmR\\\\\\">\\\\n    <link rel=\\\\\\"icon\\\\\\" sizes=\\\\\\"16x16\\\\\\" type=\\\\\\"image/png\\\\\\" href=\\\\\\"/static/images/favicon-16x16.png\\\\\\">\\\\n    <link rel=\\\\\\"icon\\\\\\" sizes=\\\\\\"32x32\\\\\\" type=\\\\\\"image/png\\\\\\" href=\\\\\\"/static/images/favicon-32x32.png\\\\\\">\\\\n    <link rel=\\\\\\"icon\\\\\\" type=\\\\\\"image/svg+xml\\\\\\" href=\\\\\\"/static/images/favicon.svg\\\\\\">\\\\n    <link rel=\\\\\\"manifest\\\\\\" href=\\\\\\"/static/images/site.webmanifest?v=ngJW8jGAmR\\\\\\">\\\\n    <link rel=\\\\\\"mask-icon\\\\\\" href=\\\\\\"/static/images/safari-pinned-tab.svg?v=ngJW8jGAmR\\\\\\" color=\\\\\\"#000000\\\\\\">\\\\n    <meta name=\\\\\\"msapplication-TileColor\\\\\\" content=\\\\\\"#ffffff\\\\\\">\\\\n    <meta name=\\\\\\"msapplication-config\\\\\\" content=\\\\\\"/static/images/browserconfig.xml?v=ngJW8jGAmR\\\\\\">\\\\n    <meta name=\\\\\\"theme-color\\\\\\" content=\\\\\\"#ffffff\\\\\\">\\\\n\\\\n        <!-- locales -->\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/en-US\\\\\\" hreflang=\\\\\\"en-US\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/es\\\\\\" hreflang=\\\\\\"es\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/fr\\\\\\" hreflang=\\\\\\"fr\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/it\\\\\\" hreflang=\\\\\\"it\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/ja\\\\\\" hreflang=\\\\\\"ja\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/pt-BR\\\\\\" hreflang=\\\\\\"pt-BR\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/ru\\\\\\" hreflang=\\\\\\"ru\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/tr\\\\\\" hreflang=\\\\\\"tr\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/zh-CN\\\\\\" hreflang=\\\\\\"zh-CN\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/zh-TW\\\\\\" hreflang=\\\\\\"zh-TW\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/\\\\\\" hreflang=\\\\\\"x-default\\\\\\">\\\\n\\\\n    <!-- Custom Highlight pack with: Rust, Markdown, TOML, Bash, JSON, YAML,\\\\n         and plaintext. -->\\\\n    <script src=\\\\\\"/static/scripts/highlight.pack.js\\\\\\" defer></script>\\\\n    <script src=\\\\\\"/static/scripts/init.js\\\\\\" defer></script>\\\\n  </head>\\\\n  <body>\\\\n    <nav class=\\\\\\"flex flex-row justify-center justify-end-l items-center flex-wrap ph2 pl3-ns pr3-ns pb3\\\\\\">\\\\n      <div class=\\\\\\"brand flex-auto w-100 w-auto-l self-start tc tl-l\\\\\\">\\\\n        <a href=\\\\\\"/\\\\\\" class=\\\\\\"brand\\\\\\">\\\\n          <img class=\\\\\\"v-mid ml0-l\\\\\\" alt=\\\\\\"Rust Logo\\\\\\" src=\\\\\\"/static/images/rust-logo-blk.svg\\\\\\">\\\\n    </a>\\\\n      </div>\\\\n    \\\\n      <ul class=\\\\\\"nav list w-100 w-auto-l flex flex-none flex-row flex-wrap justify-center justify-end-l items-center pv2 ph0 ph4-ns\\\\\\">\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/tools/install\\\\\\">Install</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/learn\\\\\\">Learn</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"https://play.rust-lang.org/\\\\\\">Playground</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/tools\\\\\\">Tools</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/governance\\\\\\">Governance</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/community\\\\\\">Community</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"https://blog.rust-lang.org/\\\\\\">Blog</a></li>\\\\n      </ul>\\\\n    \\\\n      <div class=\\\\\\" w-100 w-auto-l flex-none flex justify-center pv4 pv-0-l languages\\\\\\">\\\\n        <div class=\\\\\\"select\\\\\\">\\\\n          <label for=\\\\\\"language-nav\\\\\\" class=\\\\\\"hidden\\\\\\">Language</label>\\\\n          <select id=\\\\\\"language-nav\\\\\\" data-current-lang=\\\\\\"en-US\\\\\\">\\\\n            <option title=\\\\\\"English (en-US)\\\\\\" value=\\\\\\"en-US\\\\\\">English (en-US)</option>\\\\n<option title=\\\\\\"Español (es)\\\\\\" value=\\\\\\"es\\\\\\">Español (es)</option>\\\\n<option title=\\\\\\"Français (fr)\\\\\\" value=\\\\\\"fr\\\\\\">Français (fr)</option>\\\\n<option title=\\\\\\"Italiano (it)\\\\\\" value=\\\\\\"it\\\\\\">Italiano (it)</option>\\\\n<option title=\\\\\\"日本語 (ja)\\\\\\" value=\\\\\\"ja\\\\\\">日本語 (ja)</option>\\\\n<option title=\\\\\\"Português (pt-BR)\\\\\\" value=\\\\\\"pt-BR\\\\\\">Português (pt-BR)</option>\\\\n<option title=\\\\\\"Русский (ru)\\\\\\" value=\\\\\\"ru\\\\\\">Русский (ru)</option>\\\\n<option title=\\\\\\"Türkçe (tr)\\\\\\" value=\\\\\\"tr\\\\\\">Türkçe (tr)</option>\\\\n<option title=\\\\\\"简体中文 (zh-CN)\\\\\\" value=\\\\\\"zh-CN\\\\\\">简体中文 (zh-CN)</option>\\\\n<option title=\\\\\\"正體中文 (zh-TW)\\\\\\" value=\\\\\\"zh-TW\\\\\\">正體中文 (zh-TW)</option>\\\\n      </select>\\\\n        </div>\\\\n      </div>\\\\n    \\\\n    </nav>\\\\n    <main><header class=\\\\\\"mt3 mb6 w-100 mw-none ph3 mw8-m mw9-l center\\\\\\">\\\\n  <div class=\\\\\\"flex flex-column flex-row-l\\\\\\">\\\\n    <div class=\\\\\\"w-70-l mw8-l\\\\\\">\\\\n      <h1>Rust</h1>\\\\n      <h2 class=\\\\\\"mt4 mb0 f2 f1-ns\\\\\\">\\\\n        A language empowering everyone <br class='dn db-ns'> to build reliable and efficient software.\\\\n      </h2>\\\\n    </div>\\\\n    <div class=\\\\\\"w-30-l flex-column pl0-l pr0-l pl3 pr3\\\\\\">\\\\n      <a class=\\\\\\"button button-download ph4 mt0 w-100\\\\\\" href=\\\\\\"/learn/get-started\\\\\\">\\\\n        Get Started\\\\n      </a>\\\\n      <p class=\\\\\\"tc f3 f2-l mt3\\\\\\">\\\\n        <a href=\\\\\\"https://blog.rust-lang.org/2023/10/05/Rust-1.73.0.html\\\\\\" class=\\\\\\"download-link\\\\\\">Version 1.73.0</a>\\\\n      </p>\\\\n    </div>\\\\n  </div>\\\\n</header>\\\\n\\\\n<section id=\\\\\\"language-values\\\\\\" class=\\\\\\"green\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center f3\\\\\\">\\\\n    <header class=\\\\\\"pb0\\\\\\">\\\\n      <h2>\\\\n        Why Rust?\\\\n      </h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n    <div class=\\\\\\"flex-none flex-l\\\\\\">\\\\n      <section class=\\\\\\"w-100 pv2 pv0-l mt4\\\\\\">\\\\n        <h3 class=\\\\\\"f2 f1-l\\\\\\">Performance</h3>\\\\n        <p class=\\\\\\"f3 lh-copy\\\\\\">\\\\n          Rust is blazingly fast and memory-efficient: with no runtime or\\\\ngarbage collector, it can power performance-critical services, run on\\\\nembedded devices, and easily integrate with other languages.\\\\n        </p>\\\\n      </section>\\\\n      <section class=\\\\\\"w-100 pv2 pv0-l mt4 mh5-l\\\\\\">\\\\n        <h3 class=\\\\\\"f2 f1-l\\\\\\">Reliability</h3>\\\\n        <p class=\\\\\\"f3 lh-copy\\\\\\">\\\\n          Rust’s rich type system and ownership model guarantee memory-safety\\\\nand thread-safety &mdash; enabling you to eliminate many classes of\\\\nbugs at compile-time.\\\\n        </p>\\\\n      </section>\\\\n      <section class=\\\\\\"w-100 pv2 pv0-l mt4\\\\\\">\\\\n        <h3 class=\\\\\\"f2 f1-l\\\\\\">Productivity</h3>\\\\n        <p class=\\\\\\"f3 lh-copy\\\\\\">\\\\n          Rust has great documentation, a friendly compiler with useful error\\\\nmessages, and top-notch tooling &mdash; an integrated package manager\\\\nand build tool, smart multi-editor support with auto-completion and\\\\ntype inspections, an auto-formatter, and more.\\\\n        </p>\\\\n      </section>\\\\n\\\\n    </div>\\\\n  </div>\\\\n</section>\\\\n<section class=\\\\\\"purple\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center f3\\\\\\">\\\\n    <header>\\\\n      <h2>\\\\n        Build it in Rust\\\\n      </h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n\\\\n    <div class=\\\\\\"flex-none flex-l flex-row\\\\\\">\\\\n      <p class=\\\\\\"flex-grow-1 pb2\\\\\\">\\\\n        In 2018, the Rust community decided to improve the programming experience\\\\nfor a few distinct domains (see <a\\\\nhref=\\\\\\"https://blog.rust-lang.org/2018/03/12/roadmap.html\\\\\\">the 2018\\\\nroadmap</a>). For these, you can find many high-quality crates and some\\\\nawesome guides on how to get started.\\\\n      </p>\\\\n    </div>\\\\n\\\\n    <div class=\\\\\\"flex-none flex-l flex-row\\\\\\">\\\\n      <div class=\\\\\\"flex flex-row flex-column-l justify-between-l mw8 measure-wide-l w-100 mt5 mt2-l\\\\\\">\\\\n        <div class=\\\\\\"v-top tc-l\\\\\\">\\\\n          <img src=\\\\\\"/static/images/cli.svg\\\\\\" alt=\\\\\\"terminal\\\\\\"\\\\n               class=\\\\\\"mw3 mw4-ns\\\\\\"/>\\\\n        </div>\\\\n        <div class=\\\\\\"v-top pl4 pl0-l pt0 pt3-l measure-wide-l flex-l flex-column-l flex-auto-l justify-between-l\\\\\\">\\\\n          <h3 class=\\\\\\"tc-l\\\\\\">\\\\n            Command Line\\\\n          </h3>\\\\n          <p class=\\\\\\"flex-grow-1\\\\\\">\\\\n            Whip up a CLI tool quickly with Rust’s robust ecosystem.\\\\nRust helps you maintain your app with confidence and distribute it with ease.\\\\n          </p>\\\\n          <a href=\\\\\\"/what/cli\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Building Tools</a>\\\\n        </div>\\\\n      </div>\\\\n\\\\n      <div class=\\\\\\"flex flex-row flex-column-l justify-between-l mw8 measure-wide-l w-100 mt5 mt2-l pl4-l\\\\\\">\\\\n        <div class=\\\\\\"v-top tc-l\\\\\\">\\\\n          <img src=\\\\\\"/static/images/webassembly.svg\\\\\\" alt=\\\\\\"gear with puzzle piece elements\\\\\\"\\\\n               class=\\\\\\"mw3 mw4-ns\\\\\\"/>\\\\n        </div>\\\\n        <div class=\\\\\\"v-top pl4 pl0-l pt0 pt3-l measure-wide-l flex-l flex-column-l flex-auto-l justify-between-l\\\\\\">\\\\n          <h3 class=\\\\\\"tc-l\\\\\\">\\\\n            WebAssembly\\\\n          </h3>\\\\n          <p class=\\\\\\"flex-grow-1\\\\\\">\\\\n          Use Rust to supercharge your JavaScript, one module at a time.\\\\nPublish to npm, bundle with webpack, and you’re off to the races.\\\\n          </p>\\\\n          <a href=\\\\\\"/what/wasm\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Writing Web Apps</a>\\\\n        </div>\\\\n      </div>\\\\n\\\\n      <div class=\\\\\\"flex flex-row flex-column-l justify-between-l mw8 measure-wide-l w-100 mt5 mt2-l pl4-l\\\\\\">\\\\n        <div class=\\\\\\"v-top tc-l\\\\\\">\\\\n          <img src=\\\\\\"/static/images/networking.svg\\\\\\" alt=\\\\\\"a cloud with nodes\\\\\\"\\\\n               class=\\\\\\"mw3 mw4-ns\\\\\\"/>\\\\n        </div>\\\\n        <div class=\\\\\\"v-top pl4 pl0-l pt0 pt3-l measure-wide-l flex-l flex-column-l flex-auto-l justify-between-l\\\\\\">\\\\n          <h3 class=\\\\\\"tc-l\\\\\\">\\\\n            Networking\\\\n          </h3>\\\\n          <p class=\\\\\\"flex-grow-1\\\\\\">\\\\n            Predictable performance. Tiny resource footprint. Rock-solid reliability.\\\\nRust is great for network services.\\\\n          </p>\\\\n          <a href=\\\\\\"/what/networking\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Working On Servers</a>\\\\n        </div>\\\\n      </div>\\\\n\\\\n      <div class=\\\\\\"flex flex-row flex-column-l justify-between-l mw8 measure-wide-l w-100 mt5 mt2-l pl4-l\\\\\\">\\\\n        <div class=\\\\\\"v-top tc-l\\\\\\">\\\\n          <img src=\\\\\\"/static/images/embedded.svg\\\\\\" alt=\\\\\\"an embedded device chip\\\\\\"\\\\n               class=\\\\\\"mw3 mw4-ns\\\\\\"/>\\\\n        </div>\\\\n        <div class=\\\\\\"v-top pl4 pl0-l pt0 pt3-l measure-wide-l flex-l flex-column-l flex-auto-l justify-between-l\\\\\\">\\\\n          <h3 class=\\\\\\"tc-l\\\\\\">\\\\n            Embedded\\\\n          </h3>\\\\n          <p class=\\\\\\"flex-grow-1\\\\\\">\\\\n            Targeting low-resource devices?\\\\nNeed low-level control without giving up high-level conveniences?\\\\nRust has you covered.\\\\n          </p>\\\\n          <a href=\\\\\\"/what/embedded\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Starting With Embedded</a>\\\\n        </div>\\\\n      </div>\\\\n    </div>\\\\n  </div>\\\\n</section>\\\\n<section class=\\\\\\"white production\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center\\\\\\">\\\\n    <header>\\\\n      <h2>Rust in production</h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n    <div class=\\\\\\"description\\\\\\">\\\\n      <p class=\\\\\\"lh-copy f2\\\\\\">\\\\n        Hundreds of companies around the world are using Rust in production\\\\ntoday for fast, low-resource, cross-platform solutions. Software you know\\\\nand love, like <a href=\\\\\\"https://hacks.mozilla.org/2017/08/inside-a-super-fast-css-engine-quantum-css-aka-stylo/\\\\\\">Firefox</a>,\\\\n<a href=\\\\\\"https://blogs.dropbox.com/tech/2016/06/lossless-compression-with-brotli/\\\\\\">Dropbox</a>,\\\\nand <a href=\\\\\\"https://blog.cloudflare.com/cloudflare-workers-as-a-serverless-rust-platform/\\\\\\">Cloudflare</a>,\\\\nuses Rust. <strong>From startups to large\\\\ncorporations, from embedded devices to scalable web services, Rust is a great fit.</strong>\\\\n      </p>\\\\n    </div>\\\\n    <div class=\\\\\\"testimonials\\\\\\">\\\\n      <div class=\\\\\\"testimonial flex-none flex-l\\\\\\">\\\\n        <div class=\\\\\\"w-100 w-70-l\\\\\\" id=\\\\\\"npm-testimonial\\\\\\">\\\\n          <blockquote class=\\\\\\"lh-title-ns\\\\\\">\\\\n            My biggest compliment to Rust is that it's boring, and this is an amazing compliment.\\\\n          </blockquote>\\\\n          <p class=\\\\\\"attribution\\\\\\">&ndash; Chris Dickinson, Engineer at npm, Inc</p>\\\\n        </div>\\\\n        <div class=\\\\\\"w-100 w-30-l tc\\\\\\">\\\\n          <a href=\\\\\\"https://www.npmjs.com/\\\\\\">\\\\n            <img src=\\\\\\"/static/images/user-logos/npm.svg\\\\\\" alt=\\\\\\"npm Logo\\\\\\" class=\\\\\\"w-33 w-60-ns h-auto\\\\\\" />\\\\n          </a>\\\\n        </div>\\\\n      </div>\\\\n      <hr/>\\\\n      <div class=\\\\\\"testimonial flex-none flex-l\\\\\\">\\\\n        <div class=\\\\\\"w-100 w-30-l tc\\\\\\">\\\\n          <a href=\\\\\\"https://www.youtube.com/watch?v=u6ZbF4apABk\\\\\\"><img src=\\\\\\"/static/images/user-logos/yelp.png\\\\\\" alt=\\\\\\"Yelp Logo\\\\\\" class=\\\\\\"w-80\\\\\\" /></a>\\\\n        </div>\\\\n        <div class=\\\\\\"w-100 w-70-l\\\\\\" id=\\\\\\"yelp-testimonial\\\\\\">\\\\n          <blockquote>\\\\n            All the documentation, the tooling, the community is great - you have all the tools to succeed in writing Rust code.\\\\n          </blockquote>\\\\n          <p class=\\\\\\"attribution\\\\\\">&ndash; Antonio Verardi, Infrastructure Engineer</p>\\\\n        </div>\\\\n      </div>\\\\n    </div>\\\\n    <a href=\\\\\\"/production\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Learn More</a>\\\\n  </div>\\\\n</section>\\\\n<section class=\\\\\\"get-involved red\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center f3\\\\\\">\\\\n    <header>\\\\n      <h2>Get involved</h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n    <div class=\\\\\\"flex flex-column flex-row-l\\\\\\">\\\\n      <div id=\\\\\\"read-rust\\\\\\" class=\\\\\\"mw-50-l mr4-l pt0 flex flex-column justify-between-l\\\\\\">\\\\n        <h3>Read Rust</h3>\\\\n        <p class=\\\\\\"flex-grow-1\\\\\\">We love documentation! Take a look at the books available online, as well as key blog posts and user guides.</p>\\\\n        <a href=\\\\\\"learn\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Read the book</a>\\\\n      </div>\\\\n      <div id=\\\\\\"watch-rust\\\\\\" class=\\\\\\"mw-50-l pt3 pt0-l flex flex-column justify-between-l\\\\\\">\\\\n        <h3>Watch Rust</h3>\\\\n        <p class=\\\\\\"flex-grow-1\\\\\\">The Rust community has a dedicated YouTube channel collecting a huge range of presentations and\\\\ntutorials.</p>\\\\n        <a href=\\\\\\"https://www.youtube.com/channel/UCaYhcUwRBNscFNUKTjgPFiA\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Watch the Videos</a>\\\\n      </div>\\\\n    </div>\\\\n    <div class=\\\\\\"pt3\\\\\\">\\\\n      <h3>Contribute code</h3>\\\\n      <p>\\\\n      Rust is truly a community effort, and we welcome contribution from hobbyists and production users, from\\\\nnewcomers and seasoned professionals. Come help us make the Rust experience even better!\\\\n      </p>\\\\n      <a href=\\\\\\"https://rustc-dev-guide.rust-lang.org/getting-started.html\\\\\\" class=\\\\\\"button button-secondary\\\\\\">\\\\n        Read Contribution Guide\\\\n      </a>\\\\n    </div>\\\\n  </div>\\\\n</section>\\\\n<section class=\\\\\\"white thanks\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center\\\\\\">\\\\n    <header>\\\\n      <h2>Thanks</h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n    <div class=\\\\\\"description\\\\\\">\\\\n      <p class=\\\\\\"lh-copy f2\\\\\\">\\\\n        Rust would not exist without the generous contributions of time, work, and resources from individuals and companies. We are very grateful for the support!\\\\n      </p>\\\\n    </div>\\\\n    <div class=\\\\\\"flex flex-column flex-row-l\\\\\\">\\\\n      <div id=\\\\\\"individual-code\\\\\\" class=\\\\\\"mw-50-l mr4-l pt0 flex flex-column justify-between-l\\\\\\">\\\\n        <h3>Individuals</h3>\\\\n        <p class=\\\\\\"flex-grow-1\\\\\\">Rust is a community project and is very thankful for the many community contributions it receives.</p>\\\\n        <a href=\\\\\\"https://thanks.rust-lang.org/\\\\\\" class=\\\\\\"button button-secondary\\\\\\">See individual contributors</a>\\\\n      </div>\\\\n      <div id=\\\\\\"company-sponsorships\\\\\\" class=\\\\\\"mw-50-l pt3 pt0-l flex flex-column justify-between-l\\\\\\">\\\\n        <h3>Corporate sponsors</h3>\\\\n        <p class=\\\\\\"flex-grow-1\\\\\\">The Rust project receives support from companies through the Rust Foundation.</p>\\\\n        <a href=\\\\\\"https://foundation.rust-lang.org/members\\\\\\" class=\\\\\\"button button-secondary\\\\\\">See Foundation members</a>\\\\n      </div>\\\\n    </div>\\\\n  </div>\\\\n</section>\\\\n\\\\n    </main>\\\\n    <footer>\\\\n      <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center f3\\\\\\">\\\\n        <div class=\\\\\\"flex flex-column flex-row-ns pv0-l\\\\\\">\\\\n          <div class=\\\\\\"flex flex-column mw8 w-100 measure-wide-l pv2 pv5-m pv2-ns ph4-m ph4-l\\\\\\" id=\\\\\\"get-help\\\\\\">\\\\n            <h4>Get help!</h4>\\\\n            <ul>\\\\n              <li><a href=\\\\\\"/learn\\\\\\">Documentation</a></li>\\\\n              <li><a href=\\\\\\"http://forge.rust-lang.org\\\\\\">Rust Forge (Contributor Documentation)</a></li>\\\\n              <li><a href=\\\\\\"https://users.rust-lang.org\\\\\\">Ask a Question on the Users Forum</a></li>\\\\n            </ul>\\\\n            <div class=\\\\\\"languages\\\\\\">\\\\n              <div class=\\\\\\"select\\\\\\">\\\\n                <label for=\\\\\\"language-footer\\\\\\" class=\\\\\\"hidden\\\\\\">Language</label>\\\\n                <select id=\\\\\\"language-footer\\\\\\">\\\\n                  <option title=\\\\\\"English (en-US)\\\\\\" value=\\\\\\"en-US\\\\\\">English (en-US)</option>\\\\n<option title=\\\\\\"Español (es)\\\\\\" value=\\\\\\"es\\\\\\">Español (es)</option>\\\\n<option title=\\\\\\"Français (fr)\\\\\\" value=\\\\\\"fr\\\\\\">Français (fr)</option>\\\\n<option title=\\\\\\"Italiano (it)\\\\\\" value=\\\\\\"it\\\\\\">Italiano (it)</option>\\\\n<option title=\\\\\\"日本語 (ja)\\\\\\" value=\\\\\\"ja\\\\\\">日本語 (ja)</option>\\\\n<option title=\\\\\\"Português (pt-BR)\\\\\\" value=\\\\\\"pt-BR\\\\\\">Português (pt-BR)</option>\\\\n<option title=\\\\\\"Русский (ru)\\\\\\" value=\\\\\\"ru\\\\\\">Русский (ru)</option>\\\\n<option title=\\\\\\"Türkçe (tr)\\\\\\" value=\\\\\\"tr\\\\\\">Türkçe (tr)</option>\\\\n<option title=\\\\\\"简体中文 (zh-CN)\\\\\\" value=\\\\\\"zh-CN\\\\\\">简体中文 (zh-CN)</option>\\\\n<option title=\\\\\\"正體中文 (zh-TW)\\\\\\" value=\\\\\\"zh-TW\\\\\\">正體中文 (zh-TW)</option>\\\\n            </select>\\\\n              </div>\\\\n            </div>\\\\n          </div>\\\\n          <div class=\\\\\\"flex flex-column mw8 w-100 measure-wide-l pv2 pv5-m pv2-ns ph4-m ph4-l\\\\\\">\\\\n            <h4>Terms and policies</h4>\\\\n            <ul>\\\\n              <li><a href=\\\\\\"/policies/code-of-conduct\\\\\\">Code of Conduct</a></li>\\\\n              <li><a href=\\\\\\"/policies/licenses\\\\\\">Licenses</a></li>\\\\n              <li><a href=\\\\\\"https://foundation.rust-lang.org/policies/logo-policy-and-media-guide/\\\\\\">Logo Policy and Media Guide</a></li>\\\\n              <li><a href=\\\\\\"/policies/security\\\\\\">Security Disclosures</a></li>\\\\n              <li><a href=\\\\\\"https://foundation.rust-lang.org/policies/privacy-policy/\\\\\\">Privacy Notice</a></li>\\\\n              <li><a href=\\\\\\"/policies\\\\\\">All Policies</a></li>\\\\n            </ul>\\\\n          </div>\\\\n          <div class=\\\\\\"flex flex-column mw8 w-100 measure-wide-l pv2 pv5-m pv2-ns ph4-m ph4-l\\\\\\">\\\\n            <h4>Social</h4>\\\\n            <div class=\\\\\\"flex flex-row flex-wrap items-center\\\\\\">\\\\n              <a rel=\\\\\\"me\\\\\\" href=\\\\\\"https://social.rust-lang.org/@rust\\\\\\" target=\\\\\\"_blank\\\\\\"><img src=\\\\\\"/static/images/mastodon.svg\\\\\\" alt=\\\\\\"Mastodon\\\\\\" title=\\\\\\"Mastodon\\\\\\" /></a>\\\\n              <a href=\\\\\\"https://twitter.com/rustlang\\\\\\" target=\\\\\\"_blank\\\\\\"><img src=\\\\\\"/static/images/twitter.svg\\\\\\" alt=\\\\\\"twitter logo\\\\\\" title=\\\\\\"Twitter\\\\\\"/></a>\\\\n              <a href=\\\\\\"https://www.youtube.com/channel/UCaYhcUwRBNscFNUKTjgPFiA\\\\\\" target=\\\\\\"_blank\\\\\\"><img class=\\\\\\"pv2\\\\\\" src=\\\\\\"/static/images/youtube.svg\\\\\\" alt=\\\\\\"youtube logo\\\\\\" title=\\\\\\"YouTube\\\\\\"/></a>\\\\n              <a href=\\\\\\"https://discord.gg/rust-lang\\\\\\" target=\\\\\\"_blank\\\\\\"><img src=\\\\\\"/static/images/discord.svg\\\\\\" alt=\\\\\\"discord logo\\\\\\" title=\\\\\\"Discord\\\\\\"/></a>\\\\n              <a href=\\\\\\"https://github.com/rust-lang\\\\\\" target=\\\\\\"_blank\\\\\\"><img src=\\\\\\"/static/images/github.svg\\\\\\" alt=\\\\\\"github logo\\\\\\" title=\\\\\\"GitHub\\\\\\"/></a>\\\\n            </div>\\\\n          </div>\\\\n    \\\\n        </div>\\\\n        <div class=\\\\\\"attribution\\\\\\">\\\\n          <p>\\\\n            Maintained by the Rust Team. See a bug?\\\\n<a href=\\\\\\"https://github.com/rust-lang/www.rust-lang.org/issues/new/choose\\\\\\">File an issue!</a>\\\\n          </p>\\\\n          <p>Looking for the <a href=\\\\\\"https://prev.rust-lang.org\\\\\\">previous website</a>?</p>\\\\n        </div>\\\\n      </div>\\\\n    </footer>\\\\n    <script src=\\\\\\"/static/scripts/languages.js\\\\\\"></script>\\\\n  </body>\\\\n</html>\\\\n\\"))",
                                      },
                                    },
                                  ],
                                  "id": 6756224074776577n,
                                  "metadataId": 4355177280n,
                                },
                              ],
                              "createdAt": {
                                "nanos": 596077500,
                                "seconds": 1699978195n,
                              },
                              "enteredAt": {
                                "nanos": 795470500,
                                "seconds": 1699978201n,
                              },
                              "exitedAt": {
                                "nanos": 795472958,
                                "seconds": 1699978201n,
                              },
                              "fields": [
                                {
                                  "metadataId": 4355177008n,
                                  "name": "id",
                                  "value": {
                                    "oneofKind": "u64Val",
                                    "u64Val": 10869309688778586112n,
                                  },
                                },
                              ],
                              "id": 16n,
                              "metadataId": 4355177008n,
                            },
                            {
                              "children": [],
                              "createdAt": {
                                "nanos": 596073916,
                                "seconds": 1699978195n,
                              },
                              "fields": [
                                {
                                  "metadataId": 4354778704n,
                                  "name": "id",
                                  "value": {
                                    "oneofKind": "u64Val",
                                    "u64Val": 10869309688778586112n,
                                  },
                                },
                              ],
                              "id": 15n,
                              "metadataId": 4354778704n,
                            },
                            {
                              "children": [],
                              "createdAt": {
                                "nanos": 596077500,
                                "seconds": 1699978195n,
                              },
                              "fields": [
                                {
                                  "metadataId": 4355177008n,
                                  "name": "id",
                                  "value": {
                                    "oneofKind": "u64Val",
                                    "u64Val": 10869309688778586112n,
                                  },
                                },
                              ],
                              "id": 16n,
                              "metadataId": 4355177008n,
                            },
                          ],
                          "createdAt": {
                            "nanos": 596067333,
                            "seconds": 1699978195n,
                          },
                          "enteredAt": {
                            "nanos": 596072041,
                            "seconds": 1699978195n,
                          },
                          "exitedAt": {
                            "nanos": 596111208,
                            "seconds": 1699978195n,
                          },
                          "fields": [
                            {
                              "metadataId": 4354778568n,
                              "name": "id",
                              "value": {
                                "oneofKind": "u64Val",
                                "u64Val": 10869309688778586112n,
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "cmd",
                              "value": {
                                "oneofKind": "strVal",
                                "strVal": "test1",
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "kind",
                              "value": {
                                "oneofKind": "strVal",
                                "strVal": "async",
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "loc.line",
                              "value": {
                                "oneofKind": "u64Val",
                                "u64Val": 0n,
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "loc.col",
                              "value": {
                                "oneofKind": "u64Val",
                                "u64Val": 0n,
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "is_internal",
                              "value": {
                                "boolVal": false,
                                "oneofKind": "boolVal",
                              },
                            },
                          ],
                          "id": 14n,
                          "metadataId": 4354778568n,
                        },
                        {
                          "children": [],
                          "createdAt": {
                            "nanos": 596067333,
                            "seconds": 1699978195n,
                          },
                          "fields": [
                            {
                              "metadataId": 4354778568n,
                              "name": "id",
                              "value": {
                                "oneofKind": "u64Val",
                                "u64Val": 10869309688778586112n,
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "cmd",
                              "value": {
                                "oneofKind": "strVal",
                                "strVal": "test1",
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "kind",
                              "value": {
                                "oneofKind": "strVal",
                                "strVal": "async",
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "loc.line",
                              "value": {
                                "oneofKind": "u64Val",
                                "u64Val": 0n,
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "loc.col",
                              "value": {
                                "oneofKind": "u64Val",
                                "u64Val": 0n,
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "is_internal",
                              "value": {
                                "boolVal": false,
                                "oneofKind": "boolVal",
                              },
                            },
                          ],
                          "id": 14n,
                          "metadataId": 4354778568n,
                        },
                      ],
                      "createdAt": {
                        "nanos": 595973833,
                        "seconds": 1699978195n,
                      },
                      "enteredAt": {
                        "nanos": 595976458,
                        "seconds": 1699978195n,
                      },
                      "exitedAt": {
                        "nanos": 596120250,
                        "seconds": 1699978195n,
                      },
                      "fields": [
                        {
                          "metadataId": 4355177584n,
                          "name": "id",
                          "value": {
                            "oneofKind": "u64Val",
                            "u64Val": 10869309688778586112n,
                          },
                        },
                        {
                          "metadataId": 4355177584n,
                          "name": "cmd",
                          "value": {
                            "oneofKind": "strVal",
                            "strVal": "test1",
                          },
                        },
                      ],
                      "id": 13n,
                      "metadataId": 4355177584n,
                    },
                    {
                      "children": [],
                      "createdAt": {
                        "nanos": 595973833,
                        "seconds": 1699978195n,
                      },
                      "fields": [
                        {
                          "metadataId": 4355177584n,
                          "name": "id",
                          "value": {
                            "oneofKind": "u64Val",
                            "u64Val": 10869309688778586112n,
                          },
                        },
                        {
                          "metadataId": 4355177584n,
                          "name": "cmd",
                          "value": {
                            "oneofKind": "strVal",
                            "strVal": "test1",
                          },
                        },
                      ],
                      "id": 13n,
                      "metadataId": 4355177584n,
                    },
                  ],
                  "createdAt": {
                    "nanos": 595941416,
                    "seconds": 1699978195n,
                  },
                  "enteredAt": {
                    "nanos": 595948375,
                    "seconds": 1699978195n,
                  },
                  "exitedAt": {
                    "nanos": 596121583,
                    "seconds": 1699978195n,
                  },
                  "fields": [
                    {
                      "metadataId": 4355177432n,
                      "name": "id",
                      "value": {
                        "oneofKind": "u64Val",
                        "u64Val": 10869309688778586112n,
                      },
                    },
                    {
                      "metadataId": 4355177432n,
                      "name": "kind",
                      "value": {
                        "oneofKind": "strVal",
                        "strVal": "post-message",
                      },
                    },
                  ],
                  "id": 12n,
                  "metadataId": 4355177432n,
                },
                {
                  "children": [],
                  "createdAt": {
                    "nanos": 595941416,
                    "seconds": 1699978195n,
                  },
                  "fields": [
                    {
                      "metadataId": 4355177432n,
                      "name": "id",
                      "value": {
                        "oneofKind": "u64Val",
                        "u64Val": 10869309688778586112n,
                      },
                    },
                    {
                      "metadataId": 4355177432n,
                      "name": "kind",
                      "value": {
                        "oneofKind": "strVal",
                        "strVal": "post-message",
                      },
                    },
                  ],
                  "id": 12n,
                  "metadataId": 4355177432n,
                },
              ],
              "createdAt": {
                "nanos": 595884291,
                "seconds": 1699978195n,
              },
              "enteredAt": {
                "nanos": 595900250,
                "seconds": 1699978195n,
              },
              "exitedAt": {
                "nanos": 596123166,
                "seconds": 1699978195n,
              },
              "fields": [],
              "id": 11n,
              "marginLeft": 49.38011927466017,
              "metadataId": 4355189520n,
              "width": 8.995146132396984,
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "children": [
                        {
                          "children": [
                            {
                              "children": [],
                              "createdAt": {
                                "nanos": 717797666,
                                "seconds": 1699978195n,
                              },
                              "enteredAt": {
                                "nanos": 506054666,
                                "seconds": 1699978201n,
                              },
                              "exitedAt": {
                                "nanos": 506056000,
                                "seconds": 1699978201n,
                              },
                              "fields": [
                                {
                                  "metadataId": 4354778704n,
                                  "name": "id",
                                  "value": {
                                    "oneofKind": "u64Val",
                                    "u64Val": 13685720206714877952n,
                                  },
                                },
                              ],
                              "id": 21n,
                              "metadataId": 4354778704n,
                            },
                            {
                              "children": [
                                {
                                  "children": [],
                                  "createdAt": {
                                    "nanos": 506325458,
                                    "seconds": 1699978201n,
                                  },
                                  "enteredAt": {
                                    "nanos": 506332625,
                                    "seconds": 1699978201n,
                                  },
                                  "exitedAt": {
                                    "nanos": 507124541,
                                    "seconds": 1699978201n,
                                  },
                                  "fields": [
                                    {
                                      "metadataId": 4355177280n,
                                      "name": "id",
                                      "value": {
                                        "oneofKind": "u64Val",
                                        "u64Val": 13685720206714877952n,
                                      },
                                    },
                                    {
                                      "metadataId": 4355177280n,
                                      "name": "response",
                                      "value": {
                                        "oneofKind": "strVal",
                                        "strVal": "Ok(String(\\"<!doctype html>\\\\n<html lang=\\\\\\"en-US\\\\\\">\\\\n  <head>\\\\n    <meta charset=\\\\\\"utf-8\\\\\\">\\\\n    <title>\\\\n            Rust Programming Language\\\\n        </title>\\\\n    <meta name=\\\\\\"viewport\\\\\\" content=\\\\\\"width=device-width,initial-scale=1.0\\\\\\">\\\\n    <meta name=\\\\\\"description\\\\\\" content=\\\\\\"A language empowering everyone to build reliable and efficient software.\\\\\\">\\\\n\\\\n    <!-- Twitter card -->\\\\n    <meta name=\\\\\\"twitter:card\\\\\\" content=\\\\\\"summary\\\\\\">\\\\n    <meta name=\\\\\\"twitter:site\\\\\\" content=\\\\\\"@rustlang\\\\\\">\\\\n    <meta name=\\\\\\"twitter:creator\\\\\\" content=\\\\\\"@rustlang\\\\\\">\\\\n    <meta name=\\\\\\"twitter:title\\\\\\" content=\\\\\\"\\\\\\">\\\\n    <meta name=\\\\\\"twitter:description\\\\\\" content=\\\\\\"A language empowering everyone to build reliable and efficient software.\\\\\\">\\\\n    <meta name=\\\\\\"twitter:image\\\\\\" content=\\\\\\"https://www.rust-lang.org/static/images/rust-social.jpg\\\\\\">\\\\n\\\\n    <!-- Facebook OpenGraph -->\\\\n    <meta property=\\\\\\"og:title\\\\\\" content=\\\\\\"\\\\\\" />\\\\n    <meta property=\\\\\\"og:description\\\\\\" content=\\\\\\"A language empowering everyone to build reliable and efficient software.\\\\\\">\\\\n    <meta property=\\\\\\"og:image\\\\\\" content=\\\\\\"https://www.rust-lang.org/static/images/rust-social-wide.jpg\\\\\\" />\\\\n    <meta property=\\\\\\"og:type\\\\\\" content=\\\\\\"website\\\\\\" />\\\\n    <meta property=\\\\\\"og:locale\\\\\\" content=\\\\\\"en_US\\\\\\" />\\\\n\\\\n    <!-- styles -->\\\\n    <link rel=\\\\\\"stylesheet\\\\\\" href=\\\\\\"/static/styles/a11y-dark.css\\\\\\"/>\\\\n    <link rel=\\\\\\"stylesheet\\\\\\" href=\\\\\\"/static/styles/vendor_10880690442070639967.css\\\\\\"/>\\\\n    <link rel=\\\\\\"stylesheet\\\\\\" href=\\\\\\"/static/styles/fonts_8049871103083011125.css\\\\\\"/>\\\\n    <link rel=\\\\\\"stylesheet\\\\\\" href=\\\\\\"/static/styles/app_14658805106732275902.css\\\\\\"/>\\\\n\\\\n    <!-- favicon -->\\\\n    <link rel=\\\\\\"apple-touch-icon\\\\\\" sizes=\\\\\\"180x180\\\\\\" href=\\\\\\"/static/images/apple-touch-icon.png?v=ngJW8jGAmR\\\\\\">\\\\n    <link rel=\\\\\\"icon\\\\\\" sizes=\\\\\\"16x16\\\\\\" type=\\\\\\"image/png\\\\\\" href=\\\\\\"/static/images/favicon-16x16.png\\\\\\">\\\\n    <link rel=\\\\\\"icon\\\\\\" sizes=\\\\\\"32x32\\\\\\" type=\\\\\\"image/png\\\\\\" href=\\\\\\"/static/images/favicon-32x32.png\\\\\\">\\\\n    <link rel=\\\\\\"icon\\\\\\" type=\\\\\\"image/svg+xml\\\\\\" href=\\\\\\"/static/images/favicon.svg\\\\\\">\\\\n    <link rel=\\\\\\"manifest\\\\\\" href=\\\\\\"/static/images/site.webmanifest?v=ngJW8jGAmR\\\\\\">\\\\n    <link rel=\\\\\\"mask-icon\\\\\\" href=\\\\\\"/static/images/safari-pinned-tab.svg?v=ngJW8jGAmR\\\\\\" color=\\\\\\"#000000\\\\\\">\\\\n    <meta name=\\\\\\"msapplication-TileColor\\\\\\" content=\\\\\\"#ffffff\\\\\\">\\\\n    <meta name=\\\\\\"msapplication-config\\\\\\" content=\\\\\\"/static/images/browserconfig.xml?v=ngJW8jGAmR\\\\\\">\\\\n    <meta name=\\\\\\"theme-color\\\\\\" content=\\\\\\"#ffffff\\\\\\">\\\\n\\\\n        <!-- locales -->\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/en-US\\\\\\" hreflang=\\\\\\"en-US\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/es\\\\\\" hreflang=\\\\\\"es\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/fr\\\\\\" hreflang=\\\\\\"fr\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/it\\\\\\" hreflang=\\\\\\"it\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/ja\\\\\\" hreflang=\\\\\\"ja\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/pt-BR\\\\\\" hreflang=\\\\\\"pt-BR\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/ru\\\\\\" hreflang=\\\\\\"ru\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/tr\\\\\\" hreflang=\\\\\\"tr\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/zh-CN\\\\\\" hreflang=\\\\\\"zh-CN\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/zh-TW\\\\\\" hreflang=\\\\\\"zh-TW\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/\\\\\\" hreflang=\\\\\\"x-default\\\\\\">\\\\n\\\\n    <!-- Custom Highlight pack with: Rust, Markdown, TOML, Bash, JSON, YAML,\\\\n         and plaintext. -->\\\\n    <script src=\\\\\\"/static/scripts/highlight.pack.js\\\\\\" defer></script>\\\\n    <script src=\\\\\\"/static/scripts/init.js\\\\\\" defer></script>\\\\n  </head>\\\\n  <body>\\\\n    <nav class=\\\\\\"flex flex-row justify-center justify-end-l items-center flex-wrap ph2 pl3-ns pr3-ns pb3\\\\\\">\\\\n      <div class=\\\\\\"brand flex-auto w-100 w-auto-l self-start tc tl-l\\\\\\">\\\\n        <a href=\\\\\\"/\\\\\\" class=\\\\\\"brand\\\\\\">\\\\n          <img class=\\\\\\"v-mid ml0-l\\\\\\" alt=\\\\\\"Rust Logo\\\\\\" src=\\\\\\"/static/images/rust-logo-blk.svg\\\\\\">\\\\n    </a>\\\\n      </div>\\\\n    \\\\n      <ul class=\\\\\\"nav list w-100 w-auto-l flex flex-none flex-row flex-wrap justify-center justify-end-l items-center pv2 ph0 ph4-ns\\\\\\">\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/tools/install\\\\\\">Install</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/learn\\\\\\">Learn</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"https://play.rust-lang.org/\\\\\\">Playground</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/tools\\\\\\">Tools</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/governance\\\\\\">Governance</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/community\\\\\\">Community</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"https://blog.rust-lang.org/\\\\\\">Blog</a></li>\\\\n      </ul>\\\\n    \\\\n      <div class=\\\\\\" w-100 w-auto-l flex-none flex justify-center pv4 pv-0-l languages\\\\\\">\\\\n        <div class=\\\\\\"select\\\\\\">\\\\n          <label for=\\\\\\"language-nav\\\\\\" class=\\\\\\"hidden\\\\\\">Language</label>\\\\n          <select id=\\\\\\"language-nav\\\\\\" data-current-lang=\\\\\\"en-US\\\\\\">\\\\n            <option title=\\\\\\"English (en-US)\\\\\\" value=\\\\\\"en-US\\\\\\">English (en-US)</option>\\\\n<option title=\\\\\\"Español (es)\\\\\\" value=\\\\\\"es\\\\\\">Español (es)</option>\\\\n<option title=\\\\\\"Français (fr)\\\\\\" value=\\\\\\"fr\\\\\\">Français (fr)</option>\\\\n<option title=\\\\\\"Italiano (it)\\\\\\" value=\\\\\\"it\\\\\\">Italiano (it)</option>\\\\n<option title=\\\\\\"日本語 (ja)\\\\\\" value=\\\\\\"ja\\\\\\">日本語 (ja)</option>\\\\n<option title=\\\\\\"Português (pt-BR)\\\\\\" value=\\\\\\"pt-BR\\\\\\">Português (pt-BR)</option>\\\\n<option title=\\\\\\"Русский (ru)\\\\\\" value=\\\\\\"ru\\\\\\">Русский (ru)</option>\\\\n<option title=\\\\\\"Türkçe (tr)\\\\\\" value=\\\\\\"tr\\\\\\">Türkçe (tr)</option>\\\\n<option title=\\\\\\"简体中文 (zh-CN)\\\\\\" value=\\\\\\"zh-CN\\\\\\">简体中文 (zh-CN)</option>\\\\n<option title=\\\\\\"正體中文 (zh-TW)\\\\\\" value=\\\\\\"zh-TW\\\\\\">正體中文 (zh-TW)</option>\\\\n      </select>\\\\n        </div>\\\\n      </div>\\\\n    \\\\n    </nav>\\\\n    <main><header class=\\\\\\"mt3 mb6 w-100 mw-none ph3 mw8-m mw9-l center\\\\\\">\\\\n  <div class=\\\\\\"flex flex-column flex-row-l\\\\\\">\\\\n    <div class=\\\\\\"w-70-l mw8-l\\\\\\">\\\\n      <h1>Rust</h1>\\\\n      <h2 class=\\\\\\"mt4 mb0 f2 f1-ns\\\\\\">\\\\n        A language empowering everyone <br class='dn db-ns'> to build reliable and efficient software.\\\\n      </h2>\\\\n    </div>\\\\n    <div class=\\\\\\"w-30-l flex-column pl0-l pr0-l pl3 pr3\\\\\\">\\\\n      <a class=\\\\\\"button button-download ph4 mt0 w-100\\\\\\" href=\\\\\\"/learn/get-started\\\\\\">\\\\n        Get Started\\\\n      </a>\\\\n      <p class=\\\\\\"tc f3 f2-l mt3\\\\\\">\\\\n        <a href=\\\\\\"https://blog.rust-lang.org/2023/10/05/Rust-1.73.0.html\\\\\\" class=\\\\\\"download-link\\\\\\">Version 1.73.0</a>\\\\n      </p>\\\\n    </div>\\\\n  </div>\\\\n</header>\\\\n\\\\n<section id=\\\\\\"language-values\\\\\\" class=\\\\\\"green\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center f3\\\\\\">\\\\n    <header class=\\\\\\"pb0\\\\\\">\\\\n      <h2>\\\\n        Why Rust?\\\\n      </h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n    <div class=\\\\\\"flex-none flex-l\\\\\\">\\\\n      <section class=\\\\\\"w-100 pv2 pv0-l mt4\\\\\\">\\\\n        <h3 class=\\\\\\"f2 f1-l\\\\\\">Performance</h3>\\\\n        <p class=\\\\\\"f3 lh-copy\\\\\\">\\\\n          Rust is blazingly fast and memory-efficient: with no runtime or\\\\ngarbage collector, it can power performance-critical services, run on\\\\nembedded devices, and easily integrate with other languages.\\\\n        </p>\\\\n      </section>\\\\n      <section class=\\\\\\"w-100 pv2 pv0-l mt4 mh5-l\\\\\\">\\\\n        <h3 class=\\\\\\"f2 f1-l\\\\\\">Reliability</h3>\\\\n        <p class=\\\\\\"f3 lh-copy\\\\\\">\\\\n          Rust’s rich type system and ownership model guarantee memory-safety\\\\nand thread-safety &mdash; enabling you to eliminate many classes of\\\\nbugs at compile-time.\\\\n        </p>\\\\n      </section>\\\\n      <section class=\\\\\\"w-100 pv2 pv0-l mt4\\\\\\">\\\\n        <h3 class=\\\\\\"f2 f1-l\\\\\\">Productivity</h3>\\\\n        <p class=\\\\\\"f3 lh-copy\\\\\\">\\\\n          Rust has great documentation, a friendly compiler with useful error\\\\nmessages, and top-notch tooling &mdash; an integrated package manager\\\\nand build tool, smart multi-editor support with auto-completion and\\\\ntype inspections, an auto-formatter, and more.\\\\n        </p>\\\\n      </section>\\\\n\\\\n    </div>\\\\n  </div>\\\\n</section>\\\\n<section class=\\\\\\"purple\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center f3\\\\\\">\\\\n    <header>\\\\n      <h2>\\\\n        Build it in Rust\\\\n      </h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n\\\\n    <div class=\\\\\\"flex-none flex-l flex-row\\\\\\">\\\\n      <p class=\\\\\\"flex-grow-1 pb2\\\\\\">\\\\n        In 2018, the Rust community decided to improve the programming experience\\\\nfor a few distinct domains (see <a\\\\nhref=\\\\\\"https://blog.rust-lang.org/2018/03/12/roadmap.html\\\\\\">the 2018\\\\nroadmap</a>). For these, you can find many high-quality crates and some\\\\nawesome guides on how to get started.\\\\n      </p>\\\\n    </div>\\\\n\\\\n    <div class=\\\\\\"flex-none flex-l flex-row\\\\\\">\\\\n      <div class=\\\\\\"flex flex-row flex-column-l justify-between-l mw8 measure-wide-l w-100 mt5 mt2-l\\\\\\">\\\\n        <div class=\\\\\\"v-top tc-l\\\\\\">\\\\n          <img src=\\\\\\"/static/images/cli.svg\\\\\\" alt=\\\\\\"terminal\\\\\\"\\\\n               class=\\\\\\"mw3 mw4-ns\\\\\\"/>\\\\n        </div>\\\\n        <div class=\\\\\\"v-top pl4 pl0-l pt0 pt3-l measure-wide-l flex-l flex-column-l flex-auto-l justify-between-l\\\\\\">\\\\n          <h3 class=\\\\\\"tc-l\\\\\\">\\\\n            Command Line\\\\n          </h3>\\\\n          <p class=\\\\\\"flex-grow-1\\\\\\">\\\\n            Whip up a CLI tool quickly with Rust’s robust ecosystem.\\\\nRust helps you maintain your app with confidence and distribute it with ease.\\\\n          </p>\\\\n          <a href=\\\\\\"/what/cli\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Building Tools</a>\\\\n        </div>\\\\n      </div>\\\\n\\\\n      <div class=\\\\\\"flex flex-row flex-column-l justify-between-l mw8 measure-wide-l w-100 mt5 mt2-l pl4-l\\\\\\">\\\\n        <div class=\\\\\\"v-top tc-l\\\\\\">\\\\n          <img src=\\\\\\"/static/images/webassembly.svg\\\\\\" alt=\\\\\\"gear with puzzle piece elements\\\\\\"\\\\n               class=\\\\\\"mw3 mw4-ns\\\\\\"/>\\\\n        </div>\\\\n        <div class=\\\\\\"v-top pl4 pl0-l pt0 pt3-l measure-wide-l flex-l flex-column-l flex-auto-l justify-between-l\\\\\\">\\\\n          <h3 class=\\\\\\"tc-l\\\\\\">\\\\n            WebAssembly\\\\n          </h3>\\\\n          <p class=\\\\\\"flex-grow-1\\\\\\">\\\\n          Use Rust to supercharge your JavaScript, one module at a time.\\\\nPublish to npm, bundle with webpack, and you’re off to the races.\\\\n          </p>\\\\n          <a href=\\\\\\"/what/wasm\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Writing Web Apps</a>\\\\n        </div>\\\\n      </div>\\\\n\\\\n      <div class=\\\\\\"flex flex-row flex-column-l justify-between-l mw8 measure-wide-l w-100 mt5 mt2-l pl4-l\\\\\\">\\\\n        <div class=\\\\\\"v-top tc-l\\\\\\">\\\\n          <img src=\\\\\\"/static/images/networking.svg\\\\\\" alt=\\\\\\"a cloud with nodes\\\\\\"\\\\n               class=\\\\\\"mw3 mw4-ns\\\\\\"/>\\\\n        </div>\\\\n        <div class=\\\\\\"v-top pl4 pl0-l pt0 pt3-l measure-wide-l flex-l flex-column-l flex-auto-l justify-between-l\\\\\\">\\\\n          <h3 class=\\\\\\"tc-l\\\\\\">\\\\n            Networking\\\\n          </h3>\\\\n          <p class=\\\\\\"flex-grow-1\\\\\\">\\\\n            Predictable performance. Tiny resource footprint. Rock-solid reliability.\\\\nRust is great for network services.\\\\n          </p>\\\\n          <a href=\\\\\\"/what/networking\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Working On Servers</a>\\\\n        </div>\\\\n      </div>\\\\n\\\\n      <div class=\\\\\\"flex flex-row flex-column-l justify-between-l mw8 measure-wide-l w-100 mt5 mt2-l pl4-l\\\\\\">\\\\n        <div class=\\\\\\"v-top tc-l\\\\\\">\\\\n          <img src=\\\\\\"/static/images/embedded.svg\\\\\\" alt=\\\\\\"an embedded device chip\\\\\\"\\\\n               class=\\\\\\"mw3 mw4-ns\\\\\\"/>\\\\n        </div>\\\\n        <div class=\\\\\\"v-top pl4 pl0-l pt0 pt3-l measure-wide-l flex-l flex-column-l flex-auto-l justify-between-l\\\\\\">\\\\n          <h3 class=\\\\\\"tc-l\\\\\\">\\\\n            Embedded\\\\n          </h3>\\\\n          <p class=\\\\\\"flex-grow-1\\\\\\">\\\\n            Targeting low-resource devices?\\\\nNeed low-level control without giving up high-level conveniences?\\\\nRust has you covered.\\\\n          </p>\\\\n          <a href=\\\\\\"/what/embedded\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Starting With Embedded</a>\\\\n        </div>\\\\n      </div>\\\\n    </div>\\\\n  </div>\\\\n</section>\\\\n<section class=\\\\\\"white production\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center\\\\\\">\\\\n    <header>\\\\n      <h2>Rust in production</h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n    <div class=\\\\\\"description\\\\\\">\\\\n      <p class=\\\\\\"lh-copy f2\\\\\\">\\\\n        Hundreds of companies around the world are using Rust in production\\\\ntoday for fast, low-resource, cross-platform solutions. Software you know\\\\nand love, like <a href=\\\\\\"https://hacks.mozilla.org/2017/08/inside-a-super-fast-css-engine-quantum-css-aka-stylo/\\\\\\">Firefox</a>,\\\\n<a href=\\\\\\"https://blogs.dropbox.com/tech/2016/06/lossless-compression-with-brotli/\\\\\\">Dropbox</a>,\\\\nand <a href=\\\\\\"https://blog.cloudflare.com/cloudflare-workers-as-a-serverless-rust-platform/\\\\\\">Cloudflare</a>,\\\\nuses Rust. <strong>From startups to large\\\\ncorporations, from embedded devices to scalable web services, Rust is a great fit.</strong>\\\\n      </p>\\\\n    </div>\\\\n    <div class=\\\\\\"testimonials\\\\\\">\\\\n      <div class=\\\\\\"testimonial flex-none flex-l\\\\\\">\\\\n        <div class=\\\\\\"w-100 w-70-l\\\\\\" id=\\\\\\"npm-testimonial\\\\\\">\\\\n          <blockquote class=\\\\\\"lh-title-ns\\\\\\">\\\\n            My biggest compliment to Rust is that it's boring, and this is an amazing compliment.\\\\n          </blockquote>\\\\n          <p class=\\\\\\"attribution\\\\\\">&ndash; Chris Dickinson, Engineer at npm, Inc</p>\\\\n        </div>\\\\n        <div class=\\\\\\"w-100 w-30-l tc\\\\\\">\\\\n          <a href=\\\\\\"https://www.npmjs.com/\\\\\\">\\\\n            <img src=\\\\\\"/static/images/user-logos/npm.svg\\\\\\" alt=\\\\\\"npm Logo\\\\\\" class=\\\\\\"w-33 w-60-ns h-auto\\\\\\" />\\\\n          </a>\\\\n        </div>\\\\n      </div>\\\\n      <hr/>\\\\n      <div class=\\\\\\"testimonial flex-none flex-l\\\\\\">\\\\n        <div class=\\\\\\"w-100 w-30-l tc\\\\\\">\\\\n          <a href=\\\\\\"https://www.youtube.com/watch?v=u6ZbF4apABk\\\\\\"><img src=\\\\\\"/static/images/user-logos/yelp.png\\\\\\" alt=\\\\\\"Yelp Logo\\\\\\" class=\\\\\\"w-80\\\\\\" /></a>\\\\n        </div>\\\\n        <div class=\\\\\\"w-100 w-70-l\\\\\\" id=\\\\\\"yelp-testimonial\\\\\\">\\\\n          <blockquote>\\\\n            All the documentation, the tooling, the community is great - you have all the tools to succeed in writing Rust code.\\\\n          </blockquote>\\\\n          <p class=\\\\\\"attribution\\\\\\">&ndash; Antonio Verardi, Infrastructure Engineer</p>\\\\n        </div>\\\\n      </div>\\\\n    </div>\\\\n    <a href=\\\\\\"/production\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Learn More</a>\\\\n  </div>\\\\n</section>\\\\n<section class=\\\\\\"get-involved red\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center f3\\\\\\">\\\\n    <header>\\\\n      <h2>Get involved</h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n    <div class=\\\\\\"flex flex-column flex-row-l\\\\\\">\\\\n      <div id=\\\\\\"read-rust\\\\\\" class=\\\\\\"mw-50-l mr4-l pt0 flex flex-column justify-between-l\\\\\\">\\\\n        <h3>Read Rust</h3>\\\\n        <p class=\\\\\\"flex-grow-1\\\\\\">We love documentation! Take a look at the books available online, as well as key blog posts and user guides.</p>\\\\n        <a href=\\\\\\"learn\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Read the book</a>\\\\n      </div>\\\\n      <div id=\\\\\\"watch-rust\\\\\\" class=\\\\\\"mw-50-l pt3 pt0-l flex flex-column justify-between-l\\\\\\">\\\\n        <h3>Watch Rust</h3>\\\\n        <p class=\\\\\\"flex-grow-1\\\\\\">The Rust community has a dedicated YouTube channel collecting a huge range of presentations and\\\\ntutorials.</p>\\\\n        <a href=\\\\\\"https://www.youtube.com/channel/UCaYhcUwRBNscFNUKTjgPFiA\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Watch the Videos</a>\\\\n      </div>\\\\n    </div>\\\\n    <div class=\\\\\\"pt3\\\\\\">\\\\n      <h3>Contribute code</h3>\\\\n      <p>\\\\n      Rust is truly a community effort, and we welcome contribution from hobbyists and production users, from\\\\nnewcomers and seasoned professionals. Come help us make the Rust experience even better!\\\\n      </p>\\\\n      <a href=\\\\\\"https://rustc-dev-guide.rust-lang.org/getting-started.html\\\\\\" class=\\\\\\"button button-secondary\\\\\\">\\\\n        Read Contribution Guide\\\\n      </a>\\\\n    </div>\\\\n  </div>\\\\n</section>\\\\n<section class=\\\\\\"white thanks\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center\\\\\\">\\\\n    <header>\\\\n      <h2>Thanks</h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n    <div class=\\\\\\"description\\\\\\">\\\\n      <p class=\\\\\\"lh-copy f2\\\\\\">\\\\n        Rust would not exist without the generous contributions of time, work, and resources from individuals and companies. We are very grateful for the support!\\\\n      </p>\\\\n    </div>\\\\n    <div class=\\\\\\"flex flex-column flex-row-l\\\\\\">\\\\n      <div id=\\\\\\"individual-code\\\\\\" class=\\\\\\"mw-50-l mr4-l pt0 flex flex-column justify-between-l\\\\\\">\\\\n        <h3>Individuals</h3>\\\\n        <p class=\\\\\\"flex-grow-1\\\\\\">Rust is a community project and is very thankful for the many community contributions it receives.</p>\\\\n        <a href=\\\\\\"https://thanks.rust-lang.org/\\\\\\" class=\\\\\\"button button-secondary\\\\\\">See individual contributors</a>\\\\n      </div>\\\\n      <div id=\\\\\\"company-sponsorships\\\\\\" class=\\\\\\"mw-50-l pt3 pt0-l flex flex-column justify-between-l\\\\\\">\\\\n        <h3>Corporate sponsors</h3>\\\\n        <p class=\\\\\\"flex-grow-1\\\\\\">The Rust project receives support from companies through the Rust Foundation.</p>\\\\n        <a href=\\\\\\"https://foundation.rust-lang.org/members\\\\\\" class=\\\\\\"button button-secondary\\\\\\">See Foundation members</a>\\\\n      </div>\\\\n    </div>\\\\n  </div>\\\\n</section>\\\\n\\\\n    </main>\\\\n    <footer>\\\\n      <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center f3\\\\\\">\\\\n        <div class=\\\\\\"flex flex-column flex-row-ns pv0-l\\\\\\">\\\\n          <div class=\\\\\\"flex flex-column mw8 w-100 measure-wide-l pv2 pv5-m pv2-ns ph4-m ph4-l\\\\\\" id=\\\\\\"get-help\\\\\\">\\\\n            <h4>Get help!</h4>\\\\n            <ul>\\\\n              <li><a href=\\\\\\"/learn\\\\\\">Documentation</a></li>\\\\n              <li><a href=\\\\\\"http://forge.rust-lang.org\\\\\\">Rust Forge (Contributor Documentation)</a></li>\\\\n              <li><a href=\\\\\\"https://users.rust-lang.org\\\\\\">Ask a Question on the Users Forum</a></li>\\\\n            </ul>\\\\n            <div class=\\\\\\"languages\\\\\\">\\\\n              <div class=\\\\\\"select\\\\\\">\\\\n                <label for=\\\\\\"language-footer\\\\\\" class=\\\\\\"hidden\\\\\\">Language</label>\\\\n                <select id=\\\\\\"language-footer\\\\\\">\\\\n                  <option title=\\\\\\"English (en-US)\\\\\\" value=\\\\\\"en-US\\\\\\">English (en-US)</option>\\\\n<option title=\\\\\\"Español (es)\\\\\\" value=\\\\\\"es\\\\\\">Español (es)</option>\\\\n<option title=\\\\\\"Français (fr)\\\\\\" value=\\\\\\"fr\\\\\\">Français (fr)</option>\\\\n<option title=\\\\\\"Italiano (it)\\\\\\" value=\\\\\\"it\\\\\\">Italiano (it)</option>\\\\n<option title=\\\\\\"日本語 (ja)\\\\\\" value=\\\\\\"ja\\\\\\">日本語 (ja)</option>\\\\n<option title=\\\\\\"Português (pt-BR)\\\\\\" value=\\\\\\"pt-BR\\\\\\">Português (pt-BR)</option>\\\\n<option title=\\\\\\"Русский (ru)\\\\\\" value=\\\\\\"ru\\\\\\">Русский (ru)</option>\\\\n<option title=\\\\\\"Türkçe (tr)\\\\\\" value=\\\\\\"tr\\\\\\">Türkçe (tr)</option>\\\\n<option title=\\\\\\"简体中文 (zh-CN)\\\\\\" value=\\\\\\"zh-CN\\\\\\">简体中文 (zh-CN)</option>\\\\n<option title=\\\\\\"正體中文 (zh-TW)\\\\\\" value=\\\\\\"zh-TW\\\\\\">正體中文 (zh-TW)</option>\\\\n            </select>\\\\n              </div>\\\\n            </div>\\\\n          </div>\\\\n          <div class=\\\\\\"flex flex-column mw8 w-100 measure-wide-l pv2 pv5-m pv2-ns ph4-m ph4-l\\\\\\">\\\\n            <h4>Terms and policies</h4>\\\\n            <ul>\\\\n              <li><a href=\\\\\\"/policies/code-of-conduct\\\\\\">Code of Conduct</a></li>\\\\n              <li><a href=\\\\\\"/policies/licenses\\\\\\">Licenses</a></li>\\\\n              <li><a href=\\\\\\"https://foundation.rust-lang.org/policies/logo-policy-and-media-guide/\\\\\\">Logo Policy and Media Guide</a></li>\\\\n              <li><a href=\\\\\\"/policies/security\\\\\\">Security Disclosures</a></li>\\\\n              <li><a href=\\\\\\"https://foundation.rust-lang.org/policies/privacy-policy/\\\\\\">Privacy Notice</a></li>\\\\n              <li><a href=\\\\\\"/policies\\\\\\">All Policies</a></li>\\\\n            </ul>\\\\n          </div>\\\\n          <div class=\\\\\\"flex flex-column mw8 w-100 measure-wide-l pv2 pv5-m pv2-ns ph4-m ph4-l\\\\\\">\\\\n            <h4>Social</h4>\\\\n            <div class=\\\\\\"flex flex-row flex-wrap items-center\\\\\\">\\\\n              <a rel=\\\\\\"me\\\\\\" href=\\\\\\"https://social.rust-lang.org/@rust\\\\\\" target=\\\\\\"_blank\\\\\\"><img src=\\\\\\"/static/images/mastodon.svg\\\\\\" alt=\\\\\\"Mastodon\\\\\\" title=\\\\\\"Mastodon\\\\\\" /></a>\\\\n              <a href=\\\\\\"https://twitter.com/rustlang\\\\\\" target=\\\\\\"_blank\\\\\\"><img src=\\\\\\"/static/images/twitter.svg\\\\\\" alt=\\\\\\"twitter logo\\\\\\" title=\\\\\\"Twitter\\\\\\"/></a>\\\\n              <a href=\\\\\\"https://www.youtube.com/channel/UCaYhcUwRBNscFNUKTjgPFiA\\\\\\" target=\\\\\\"_blank\\\\\\"><img class=\\\\\\"pv2\\\\\\" src=\\\\\\"/static/images/youtube.svg\\\\\\" alt=\\\\\\"youtube logo\\\\\\" title=\\\\\\"YouTube\\\\\\"/></a>\\\\n              <a href=\\\\\\"https://discord.gg/rust-lang\\\\\\" target=\\\\\\"_blank\\\\\\"><img src=\\\\\\"/static/images/discord.svg\\\\\\" alt=\\\\\\"discord logo\\\\\\" title=\\\\\\"Discord\\\\\\"/></a>\\\\n              <a href=\\\\\\"https://github.com/rust-lang\\\\\\" target=\\\\\\"_blank\\\\\\"><img src=\\\\\\"/static/images/github.svg\\\\\\" alt=\\\\\\"github logo\\\\\\" title=\\\\\\"GitHub\\\\\\"/></a>\\\\n            </div>\\\\n          </div>\\\\n    \\\\n        </div>\\\\n        <div class=\\\\\\"attribution\\\\\\">\\\\n          <p>\\\\n            Maintained by the Rust Team. See a bug?\\\\n<a href=\\\\\\"https://github.com/rust-lang/www.rust-lang.org/issues/new/choose\\\\\\">File an issue!</a>\\\\n          </p>\\\\n          <p>Looking for the <a href=\\\\\\"https://prev.rust-lang.org\\\\\\">previous website</a>?</p>\\\\n        </div>\\\\n      </div>\\\\n    </footer>\\\\n    <script src=\\\\\\"/static/scripts/languages.js\\\\\\"></script>\\\\n  </body>\\\\n</html>\\\\n\\"))",
                                      },
                                    },
                                  ],
                                  "id": 4504424261091329n,
                                  "metadataId": 4355177280n,
                                },
                                {
                                  "children": [],
                                  "createdAt": {
                                    "nanos": 506325458,
                                    "seconds": 1699978201n,
                                  },
                                  "fields": [
                                    {
                                      "metadataId": 4355177280n,
                                      "name": "id",
                                      "value": {
                                        "oneofKind": "u64Val",
                                        "u64Val": 13685720206714877952n,
                                      },
                                    },
                                    {
                                      "metadataId": 4355177280n,
                                      "name": "response",
                                      "value": {
                                        "oneofKind": "strVal",
                                        "strVal": "Ok(String(\\"<!doctype html>\\\\n<html lang=\\\\\\"en-US\\\\\\">\\\\n  <head>\\\\n    <meta charset=\\\\\\"utf-8\\\\\\">\\\\n    <title>\\\\n            Rust Programming Language\\\\n        </title>\\\\n    <meta name=\\\\\\"viewport\\\\\\" content=\\\\\\"width=device-width,initial-scale=1.0\\\\\\">\\\\n    <meta name=\\\\\\"description\\\\\\" content=\\\\\\"A language empowering everyone to build reliable and efficient software.\\\\\\">\\\\n\\\\n    <!-- Twitter card -->\\\\n    <meta name=\\\\\\"twitter:card\\\\\\" content=\\\\\\"summary\\\\\\">\\\\n    <meta name=\\\\\\"twitter:site\\\\\\" content=\\\\\\"@rustlang\\\\\\">\\\\n    <meta name=\\\\\\"twitter:creator\\\\\\" content=\\\\\\"@rustlang\\\\\\">\\\\n    <meta name=\\\\\\"twitter:title\\\\\\" content=\\\\\\"\\\\\\">\\\\n    <meta name=\\\\\\"twitter:description\\\\\\" content=\\\\\\"A language empowering everyone to build reliable and efficient software.\\\\\\">\\\\n    <meta name=\\\\\\"twitter:image\\\\\\" content=\\\\\\"https://www.rust-lang.org/static/images/rust-social.jpg\\\\\\">\\\\n\\\\n    <!-- Facebook OpenGraph -->\\\\n    <meta property=\\\\\\"og:title\\\\\\" content=\\\\\\"\\\\\\" />\\\\n    <meta property=\\\\\\"og:description\\\\\\" content=\\\\\\"A language empowering everyone to build reliable and efficient software.\\\\\\">\\\\n    <meta property=\\\\\\"og:image\\\\\\" content=\\\\\\"https://www.rust-lang.org/static/images/rust-social-wide.jpg\\\\\\" />\\\\n    <meta property=\\\\\\"og:type\\\\\\" content=\\\\\\"website\\\\\\" />\\\\n    <meta property=\\\\\\"og:locale\\\\\\" content=\\\\\\"en_US\\\\\\" />\\\\n\\\\n    <!-- styles -->\\\\n    <link rel=\\\\\\"stylesheet\\\\\\" href=\\\\\\"/static/styles/a11y-dark.css\\\\\\"/>\\\\n    <link rel=\\\\\\"stylesheet\\\\\\" href=\\\\\\"/static/styles/vendor_10880690442070639967.css\\\\\\"/>\\\\n    <link rel=\\\\\\"stylesheet\\\\\\" href=\\\\\\"/static/styles/fonts_8049871103083011125.css\\\\\\"/>\\\\n    <link rel=\\\\\\"stylesheet\\\\\\" href=\\\\\\"/static/styles/app_14658805106732275902.css\\\\\\"/>\\\\n\\\\n    <!-- favicon -->\\\\n    <link rel=\\\\\\"apple-touch-icon\\\\\\" sizes=\\\\\\"180x180\\\\\\" href=\\\\\\"/static/images/apple-touch-icon.png?v=ngJW8jGAmR\\\\\\">\\\\n    <link rel=\\\\\\"icon\\\\\\" sizes=\\\\\\"16x16\\\\\\" type=\\\\\\"image/png\\\\\\" href=\\\\\\"/static/images/favicon-16x16.png\\\\\\">\\\\n    <link rel=\\\\\\"icon\\\\\\" sizes=\\\\\\"32x32\\\\\\" type=\\\\\\"image/png\\\\\\" href=\\\\\\"/static/images/favicon-32x32.png\\\\\\">\\\\n    <link rel=\\\\\\"icon\\\\\\" type=\\\\\\"image/svg+xml\\\\\\" href=\\\\\\"/static/images/favicon.svg\\\\\\">\\\\n    <link rel=\\\\\\"manifest\\\\\\" href=\\\\\\"/static/images/site.webmanifest?v=ngJW8jGAmR\\\\\\">\\\\n    <link rel=\\\\\\"mask-icon\\\\\\" href=\\\\\\"/static/images/safari-pinned-tab.svg?v=ngJW8jGAmR\\\\\\" color=\\\\\\"#000000\\\\\\">\\\\n    <meta name=\\\\\\"msapplication-TileColor\\\\\\" content=\\\\\\"#ffffff\\\\\\">\\\\n    <meta name=\\\\\\"msapplication-config\\\\\\" content=\\\\\\"/static/images/browserconfig.xml?v=ngJW8jGAmR\\\\\\">\\\\n    <meta name=\\\\\\"theme-color\\\\\\" content=\\\\\\"#ffffff\\\\\\">\\\\n\\\\n        <!-- locales -->\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/en-US\\\\\\" hreflang=\\\\\\"en-US\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/es\\\\\\" hreflang=\\\\\\"es\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/fr\\\\\\" hreflang=\\\\\\"fr\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/it\\\\\\" hreflang=\\\\\\"it\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/ja\\\\\\" hreflang=\\\\\\"ja\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/pt-BR\\\\\\" hreflang=\\\\\\"pt-BR\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/ru\\\\\\" hreflang=\\\\\\"ru\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/tr\\\\\\" hreflang=\\\\\\"tr\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/zh-CN\\\\\\" hreflang=\\\\\\"zh-CN\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/zh-TW\\\\\\" hreflang=\\\\\\"zh-TW\\\\\\">\\\\n<link rel=\\\\\\"alternate\\\\\\" href=\\\\\\"https://www.rust-lang.org/\\\\\\" hreflang=\\\\\\"x-default\\\\\\">\\\\n\\\\n    <!-- Custom Highlight pack with: Rust, Markdown, TOML, Bash, JSON, YAML,\\\\n         and plaintext. -->\\\\n    <script src=\\\\\\"/static/scripts/highlight.pack.js\\\\\\" defer></script>\\\\n    <script src=\\\\\\"/static/scripts/init.js\\\\\\" defer></script>\\\\n  </head>\\\\n  <body>\\\\n    <nav class=\\\\\\"flex flex-row justify-center justify-end-l items-center flex-wrap ph2 pl3-ns pr3-ns pb3\\\\\\">\\\\n      <div class=\\\\\\"brand flex-auto w-100 w-auto-l self-start tc tl-l\\\\\\">\\\\n        <a href=\\\\\\"/\\\\\\" class=\\\\\\"brand\\\\\\">\\\\n          <img class=\\\\\\"v-mid ml0-l\\\\\\" alt=\\\\\\"Rust Logo\\\\\\" src=\\\\\\"/static/images/rust-logo-blk.svg\\\\\\">\\\\n    </a>\\\\n      </div>\\\\n    \\\\n      <ul class=\\\\\\"nav list w-100 w-auto-l flex flex-none flex-row flex-wrap justify-center justify-end-l items-center pv2 ph0 ph4-ns\\\\\\">\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/tools/install\\\\\\">Install</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/learn\\\\\\">Learn</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"https://play.rust-lang.org/\\\\\\">Playground</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/tools\\\\\\">Tools</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/governance\\\\\\">Governance</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"/community\\\\\\">Community</a></li>\\\\n        <li class=\\\\\\"tc pv2 ph2 ph4-ns flex-20-s\\\\\\"><a href=\\\\\\"https://blog.rust-lang.org/\\\\\\">Blog</a></li>\\\\n      </ul>\\\\n    \\\\n      <div class=\\\\\\" w-100 w-auto-l flex-none flex justify-center pv4 pv-0-l languages\\\\\\">\\\\n        <div class=\\\\\\"select\\\\\\">\\\\n          <label for=\\\\\\"language-nav\\\\\\" class=\\\\\\"hidden\\\\\\">Language</label>\\\\n          <select id=\\\\\\"language-nav\\\\\\" data-current-lang=\\\\\\"en-US\\\\\\">\\\\n            <option title=\\\\\\"English (en-US)\\\\\\" value=\\\\\\"en-US\\\\\\">English (en-US)</option>\\\\n<option title=\\\\\\"Español (es)\\\\\\" value=\\\\\\"es\\\\\\">Español (es)</option>\\\\n<option title=\\\\\\"Français (fr)\\\\\\" value=\\\\\\"fr\\\\\\">Français (fr)</option>\\\\n<option title=\\\\\\"Italiano (it)\\\\\\" value=\\\\\\"it\\\\\\">Italiano (it)</option>\\\\n<option title=\\\\\\"日本語 (ja)\\\\\\" value=\\\\\\"ja\\\\\\">日本語 (ja)</option>\\\\n<option title=\\\\\\"Português (pt-BR)\\\\\\" value=\\\\\\"pt-BR\\\\\\">Português (pt-BR)</option>\\\\n<option title=\\\\\\"Русский (ru)\\\\\\" value=\\\\\\"ru\\\\\\">Русский (ru)</option>\\\\n<option title=\\\\\\"Türkçe (tr)\\\\\\" value=\\\\\\"tr\\\\\\">Türkçe (tr)</option>\\\\n<option title=\\\\\\"简体中文 (zh-CN)\\\\\\" value=\\\\\\"zh-CN\\\\\\">简体中文 (zh-CN)</option>\\\\n<option title=\\\\\\"正體中文 (zh-TW)\\\\\\" value=\\\\\\"zh-TW\\\\\\">正體中文 (zh-TW)</option>\\\\n      </select>\\\\n        </div>\\\\n      </div>\\\\n    \\\\n    </nav>\\\\n    <main><header class=\\\\\\"mt3 mb6 w-100 mw-none ph3 mw8-m mw9-l center\\\\\\">\\\\n  <div class=\\\\\\"flex flex-column flex-row-l\\\\\\">\\\\n    <div class=\\\\\\"w-70-l mw8-l\\\\\\">\\\\n      <h1>Rust</h1>\\\\n      <h2 class=\\\\\\"mt4 mb0 f2 f1-ns\\\\\\">\\\\n        A language empowering everyone <br class='dn db-ns'> to build reliable and efficient software.\\\\n      </h2>\\\\n    </div>\\\\n    <div class=\\\\\\"w-30-l flex-column pl0-l pr0-l pl3 pr3\\\\\\">\\\\n      <a class=\\\\\\"button button-download ph4 mt0 w-100\\\\\\" href=\\\\\\"/learn/get-started\\\\\\">\\\\n        Get Started\\\\n      </a>\\\\n      <p class=\\\\\\"tc f3 f2-l mt3\\\\\\">\\\\n        <a href=\\\\\\"https://blog.rust-lang.org/2023/10/05/Rust-1.73.0.html\\\\\\" class=\\\\\\"download-link\\\\\\">Version 1.73.0</a>\\\\n      </p>\\\\n    </div>\\\\n  </div>\\\\n</header>\\\\n\\\\n<section id=\\\\\\"language-values\\\\\\" class=\\\\\\"green\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center f3\\\\\\">\\\\n    <header class=\\\\\\"pb0\\\\\\">\\\\n      <h2>\\\\n        Why Rust?\\\\n      </h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n    <div class=\\\\\\"flex-none flex-l\\\\\\">\\\\n      <section class=\\\\\\"w-100 pv2 pv0-l mt4\\\\\\">\\\\n        <h3 class=\\\\\\"f2 f1-l\\\\\\">Performance</h3>\\\\n        <p class=\\\\\\"f3 lh-copy\\\\\\">\\\\n          Rust is blazingly fast and memory-efficient: with no runtime or\\\\ngarbage collector, it can power performance-critical services, run on\\\\nembedded devices, and easily integrate with other languages.\\\\n        </p>\\\\n      </section>\\\\n      <section class=\\\\\\"w-100 pv2 pv0-l mt4 mh5-l\\\\\\">\\\\n        <h3 class=\\\\\\"f2 f1-l\\\\\\">Reliability</h3>\\\\n        <p class=\\\\\\"f3 lh-copy\\\\\\">\\\\n          Rust’s rich type system and ownership model guarantee memory-safety\\\\nand thread-safety &mdash; enabling you to eliminate many classes of\\\\nbugs at compile-time.\\\\n        </p>\\\\n      </section>\\\\n      <section class=\\\\\\"w-100 pv2 pv0-l mt4\\\\\\">\\\\n        <h3 class=\\\\\\"f2 f1-l\\\\\\">Productivity</h3>\\\\n        <p class=\\\\\\"f3 lh-copy\\\\\\">\\\\n          Rust has great documentation, a friendly compiler with useful error\\\\nmessages, and top-notch tooling &mdash; an integrated package manager\\\\nand build tool, smart multi-editor support with auto-completion and\\\\ntype inspections, an auto-formatter, and more.\\\\n        </p>\\\\n      </section>\\\\n\\\\n    </div>\\\\n  </div>\\\\n</section>\\\\n<section class=\\\\\\"purple\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center f3\\\\\\">\\\\n    <header>\\\\n      <h2>\\\\n        Build it in Rust\\\\n      </h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n\\\\n    <div class=\\\\\\"flex-none flex-l flex-row\\\\\\">\\\\n      <p class=\\\\\\"flex-grow-1 pb2\\\\\\">\\\\n        In 2018, the Rust community decided to improve the programming experience\\\\nfor a few distinct domains (see <a\\\\nhref=\\\\\\"https://blog.rust-lang.org/2018/03/12/roadmap.html\\\\\\">the 2018\\\\nroadmap</a>). For these, you can find many high-quality crates and some\\\\nawesome guides on how to get started.\\\\n      </p>\\\\n    </div>\\\\n\\\\n    <div class=\\\\\\"flex-none flex-l flex-row\\\\\\">\\\\n      <div class=\\\\\\"flex flex-row flex-column-l justify-between-l mw8 measure-wide-l w-100 mt5 mt2-l\\\\\\">\\\\n        <div class=\\\\\\"v-top tc-l\\\\\\">\\\\n          <img src=\\\\\\"/static/images/cli.svg\\\\\\" alt=\\\\\\"terminal\\\\\\"\\\\n               class=\\\\\\"mw3 mw4-ns\\\\\\"/>\\\\n        </div>\\\\n        <div class=\\\\\\"v-top pl4 pl0-l pt0 pt3-l measure-wide-l flex-l flex-column-l flex-auto-l justify-between-l\\\\\\">\\\\n          <h3 class=\\\\\\"tc-l\\\\\\">\\\\n            Command Line\\\\n          </h3>\\\\n          <p class=\\\\\\"flex-grow-1\\\\\\">\\\\n            Whip up a CLI tool quickly with Rust’s robust ecosystem.\\\\nRust helps you maintain your app with confidence and distribute it with ease.\\\\n          </p>\\\\n          <a href=\\\\\\"/what/cli\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Building Tools</a>\\\\n        </div>\\\\n      </div>\\\\n\\\\n      <div class=\\\\\\"flex flex-row flex-column-l justify-between-l mw8 measure-wide-l w-100 mt5 mt2-l pl4-l\\\\\\">\\\\n        <div class=\\\\\\"v-top tc-l\\\\\\">\\\\n          <img src=\\\\\\"/static/images/webassembly.svg\\\\\\" alt=\\\\\\"gear with puzzle piece elements\\\\\\"\\\\n               class=\\\\\\"mw3 mw4-ns\\\\\\"/>\\\\n        </div>\\\\n        <div class=\\\\\\"v-top pl4 pl0-l pt0 pt3-l measure-wide-l flex-l flex-column-l flex-auto-l justify-between-l\\\\\\">\\\\n          <h3 class=\\\\\\"tc-l\\\\\\">\\\\n            WebAssembly\\\\n          </h3>\\\\n          <p class=\\\\\\"flex-grow-1\\\\\\">\\\\n          Use Rust to supercharge your JavaScript, one module at a time.\\\\nPublish to npm, bundle with webpack, and you’re off to the races.\\\\n          </p>\\\\n          <a href=\\\\\\"/what/wasm\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Writing Web Apps</a>\\\\n        </div>\\\\n      </div>\\\\n\\\\n      <div class=\\\\\\"flex flex-row flex-column-l justify-between-l mw8 measure-wide-l w-100 mt5 mt2-l pl4-l\\\\\\">\\\\n        <div class=\\\\\\"v-top tc-l\\\\\\">\\\\n          <img src=\\\\\\"/static/images/networking.svg\\\\\\" alt=\\\\\\"a cloud with nodes\\\\\\"\\\\n               class=\\\\\\"mw3 mw4-ns\\\\\\"/>\\\\n        </div>\\\\n        <div class=\\\\\\"v-top pl4 pl0-l pt0 pt3-l measure-wide-l flex-l flex-column-l flex-auto-l justify-between-l\\\\\\">\\\\n          <h3 class=\\\\\\"tc-l\\\\\\">\\\\n            Networking\\\\n          </h3>\\\\n          <p class=\\\\\\"flex-grow-1\\\\\\">\\\\n            Predictable performance. Tiny resource footprint. Rock-solid reliability.\\\\nRust is great for network services.\\\\n          </p>\\\\n          <a href=\\\\\\"/what/networking\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Working On Servers</a>\\\\n        </div>\\\\n      </div>\\\\n\\\\n      <div class=\\\\\\"flex flex-row flex-column-l justify-between-l mw8 measure-wide-l w-100 mt5 mt2-l pl4-l\\\\\\">\\\\n        <div class=\\\\\\"v-top tc-l\\\\\\">\\\\n          <img src=\\\\\\"/static/images/embedded.svg\\\\\\" alt=\\\\\\"an embedded device chip\\\\\\"\\\\n               class=\\\\\\"mw3 mw4-ns\\\\\\"/>\\\\n        </div>\\\\n        <div class=\\\\\\"v-top pl4 pl0-l pt0 pt3-l measure-wide-l flex-l flex-column-l flex-auto-l justify-between-l\\\\\\">\\\\n          <h3 class=\\\\\\"tc-l\\\\\\">\\\\n            Embedded\\\\n          </h3>\\\\n          <p class=\\\\\\"flex-grow-1\\\\\\">\\\\n            Targeting low-resource devices?\\\\nNeed low-level control without giving up high-level conveniences?\\\\nRust has you covered.\\\\n          </p>\\\\n          <a href=\\\\\\"/what/embedded\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Starting With Embedded</a>\\\\n        </div>\\\\n      </div>\\\\n    </div>\\\\n  </div>\\\\n</section>\\\\n<section class=\\\\\\"white production\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center\\\\\\">\\\\n    <header>\\\\n      <h2>Rust in production</h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n    <div class=\\\\\\"description\\\\\\">\\\\n      <p class=\\\\\\"lh-copy f2\\\\\\">\\\\n        Hundreds of companies around the world are using Rust in production\\\\ntoday for fast, low-resource, cross-platform solutions. Software you know\\\\nand love, like <a href=\\\\\\"https://hacks.mozilla.org/2017/08/inside-a-super-fast-css-engine-quantum-css-aka-stylo/\\\\\\">Firefox</a>,\\\\n<a href=\\\\\\"https://blogs.dropbox.com/tech/2016/06/lossless-compression-with-brotli/\\\\\\">Dropbox</a>,\\\\nand <a href=\\\\\\"https://blog.cloudflare.com/cloudflare-workers-as-a-serverless-rust-platform/\\\\\\">Cloudflare</a>,\\\\nuses Rust. <strong>From startups to large\\\\ncorporations, from embedded devices to scalable web services, Rust is a great fit.</strong>\\\\n      </p>\\\\n    </div>\\\\n    <div class=\\\\\\"testimonials\\\\\\">\\\\n      <div class=\\\\\\"testimonial flex-none flex-l\\\\\\">\\\\n        <div class=\\\\\\"w-100 w-70-l\\\\\\" id=\\\\\\"npm-testimonial\\\\\\">\\\\n          <blockquote class=\\\\\\"lh-title-ns\\\\\\">\\\\n            My biggest compliment to Rust is that it's boring, and this is an amazing compliment.\\\\n          </blockquote>\\\\n          <p class=\\\\\\"attribution\\\\\\">&ndash; Chris Dickinson, Engineer at npm, Inc</p>\\\\n        </div>\\\\n        <div class=\\\\\\"w-100 w-30-l tc\\\\\\">\\\\n          <a href=\\\\\\"https://www.npmjs.com/\\\\\\">\\\\n            <img src=\\\\\\"/static/images/user-logos/npm.svg\\\\\\" alt=\\\\\\"npm Logo\\\\\\" class=\\\\\\"w-33 w-60-ns h-auto\\\\\\" />\\\\n          </a>\\\\n        </div>\\\\n      </div>\\\\n      <hr/>\\\\n      <div class=\\\\\\"testimonial flex-none flex-l\\\\\\">\\\\n        <div class=\\\\\\"w-100 w-30-l tc\\\\\\">\\\\n          <a href=\\\\\\"https://www.youtube.com/watch?v=u6ZbF4apABk\\\\\\"><img src=\\\\\\"/static/images/user-logos/yelp.png\\\\\\" alt=\\\\\\"Yelp Logo\\\\\\" class=\\\\\\"w-80\\\\\\" /></a>\\\\n        </div>\\\\n        <div class=\\\\\\"w-100 w-70-l\\\\\\" id=\\\\\\"yelp-testimonial\\\\\\">\\\\n          <blockquote>\\\\n            All the documentation, the tooling, the community is great - you have all the tools to succeed in writing Rust code.\\\\n          </blockquote>\\\\n          <p class=\\\\\\"attribution\\\\\\">&ndash; Antonio Verardi, Infrastructure Engineer</p>\\\\n        </div>\\\\n      </div>\\\\n    </div>\\\\n    <a href=\\\\\\"/production\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Learn More</a>\\\\n  </div>\\\\n</section>\\\\n<section class=\\\\\\"get-involved red\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center f3\\\\\\">\\\\n    <header>\\\\n      <h2>Get involved</h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n    <div class=\\\\\\"flex flex-column flex-row-l\\\\\\">\\\\n      <div id=\\\\\\"read-rust\\\\\\" class=\\\\\\"mw-50-l mr4-l pt0 flex flex-column justify-between-l\\\\\\">\\\\n        <h3>Read Rust</h3>\\\\n        <p class=\\\\\\"flex-grow-1\\\\\\">We love documentation! Take a look at the books available online, as well as key blog posts and user guides.</p>\\\\n        <a href=\\\\\\"learn\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Read the book</a>\\\\n      </div>\\\\n      <div id=\\\\\\"watch-rust\\\\\\" class=\\\\\\"mw-50-l pt3 pt0-l flex flex-column justify-between-l\\\\\\">\\\\n        <h3>Watch Rust</h3>\\\\n        <p class=\\\\\\"flex-grow-1\\\\\\">The Rust community has a dedicated YouTube channel collecting a huge range of presentations and\\\\ntutorials.</p>\\\\n        <a href=\\\\\\"https://www.youtube.com/channel/UCaYhcUwRBNscFNUKTjgPFiA\\\\\\" class=\\\\\\"button button-secondary\\\\\\">Watch the Videos</a>\\\\n      </div>\\\\n    </div>\\\\n    <div class=\\\\\\"pt3\\\\\\">\\\\n      <h3>Contribute code</h3>\\\\n      <p>\\\\n      Rust is truly a community effort, and we welcome contribution from hobbyists and production users, from\\\\nnewcomers and seasoned professionals. Come help us make the Rust experience even better!\\\\n      </p>\\\\n      <a href=\\\\\\"https://rustc-dev-guide.rust-lang.org/getting-started.html\\\\\\" class=\\\\\\"button button-secondary\\\\\\">\\\\n        Read Contribution Guide\\\\n      </a>\\\\n    </div>\\\\n  </div>\\\\n</section>\\\\n<section class=\\\\\\"white thanks\\\\\\">\\\\n  <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center\\\\\\">\\\\n    <header>\\\\n      <h2>Thanks</h2>\\\\n      <div class=\\\\\\"highlight\\\\\\"></div>\\\\n    </header>\\\\n    <div class=\\\\\\"description\\\\\\">\\\\n      <p class=\\\\\\"lh-copy f2\\\\\\">\\\\n        Rust would not exist without the generous contributions of time, work, and resources from individuals and companies. We are very grateful for the support!\\\\n      </p>\\\\n    </div>\\\\n    <div class=\\\\\\"flex flex-column flex-row-l\\\\\\">\\\\n      <div id=\\\\\\"individual-code\\\\\\" class=\\\\\\"mw-50-l mr4-l pt0 flex flex-column justify-between-l\\\\\\">\\\\n        <h3>Individuals</h3>\\\\n        <p class=\\\\\\"flex-grow-1\\\\\\">Rust is a community project and is very thankful for the many community contributions it receives.</p>\\\\n        <a href=\\\\\\"https://thanks.rust-lang.org/\\\\\\" class=\\\\\\"button button-secondary\\\\\\">See individual contributors</a>\\\\n      </div>\\\\n      <div id=\\\\\\"company-sponsorships\\\\\\" class=\\\\\\"mw-50-l pt3 pt0-l flex flex-column justify-between-l\\\\\\">\\\\n        <h3>Corporate sponsors</h3>\\\\n        <p class=\\\\\\"flex-grow-1\\\\\\">The Rust project receives support from companies through the Rust Foundation.</p>\\\\n        <a href=\\\\\\"https://foundation.rust-lang.org/members\\\\\\" class=\\\\\\"button button-secondary\\\\\\">See Foundation members</a>\\\\n      </div>\\\\n    </div>\\\\n  </div>\\\\n</section>\\\\n\\\\n    </main>\\\\n    <footer>\\\\n      <div class=\\\\\\"w-100 mw-none ph3 mw8-m mw9-l center f3\\\\\\">\\\\n        <div class=\\\\\\"flex flex-column flex-row-ns pv0-l\\\\\\">\\\\n          <div class=\\\\\\"flex flex-column mw8 w-100 measure-wide-l pv2 pv5-m pv2-ns ph4-m ph4-l\\\\\\" id=\\\\\\"get-help\\\\\\">\\\\n            <h4>Get help!</h4>\\\\n            <ul>\\\\n              <li><a href=\\\\\\"/learn\\\\\\">Documentation</a></li>\\\\n              <li><a href=\\\\\\"http://forge.rust-lang.org\\\\\\">Rust Forge (Contributor Documentation)</a></li>\\\\n              <li><a href=\\\\\\"https://users.rust-lang.org\\\\\\">Ask a Question on the Users Forum</a></li>\\\\n            </ul>\\\\n            <div class=\\\\\\"languages\\\\\\">\\\\n              <div class=\\\\\\"select\\\\\\">\\\\n                <label for=\\\\\\"language-footer\\\\\\" class=\\\\\\"hidden\\\\\\">Language</label>\\\\n                <select id=\\\\\\"language-footer\\\\\\">\\\\n                  <option title=\\\\\\"English (en-US)\\\\\\" value=\\\\\\"en-US\\\\\\">English (en-US)</option>\\\\n<option title=\\\\\\"Español (es)\\\\\\" value=\\\\\\"es\\\\\\">Español (es)</option>\\\\n<option title=\\\\\\"Français (fr)\\\\\\" value=\\\\\\"fr\\\\\\">Français (fr)</option>\\\\n<option title=\\\\\\"Italiano (it)\\\\\\" value=\\\\\\"it\\\\\\">Italiano (it)</option>\\\\n<option title=\\\\\\"日本語 (ja)\\\\\\" value=\\\\\\"ja\\\\\\">日本語 (ja)</option>\\\\n<option title=\\\\\\"Português (pt-BR)\\\\\\" value=\\\\\\"pt-BR\\\\\\">Português (pt-BR)</option>\\\\n<option title=\\\\\\"Русский (ru)\\\\\\" value=\\\\\\"ru\\\\\\">Русский (ru)</option>\\\\n<option title=\\\\\\"Türkçe (tr)\\\\\\" value=\\\\\\"tr\\\\\\">Türkçe (tr)</option>\\\\n<option title=\\\\\\"简体中文 (zh-CN)\\\\\\" value=\\\\\\"zh-CN\\\\\\">简体中文 (zh-CN)</option>\\\\n<option title=\\\\\\"正體中文 (zh-TW)\\\\\\" value=\\\\\\"zh-TW\\\\\\">正體中文 (zh-TW)</option>\\\\n            </select>\\\\n              </div>\\\\n            </div>\\\\n          </div>\\\\n          <div class=\\\\\\"flex flex-column mw8 w-100 measure-wide-l pv2 pv5-m pv2-ns ph4-m ph4-l\\\\\\">\\\\n            <h4>Terms and policies</h4>\\\\n            <ul>\\\\n              <li><a href=\\\\\\"/policies/code-of-conduct\\\\\\">Code of Conduct</a></li>\\\\n              <li><a href=\\\\\\"/policies/licenses\\\\\\">Licenses</a></li>\\\\n              <li><a href=\\\\\\"https://foundation.rust-lang.org/policies/logo-policy-and-media-guide/\\\\\\">Logo Policy and Media Guide</a></li>\\\\n              <li><a href=\\\\\\"/policies/security\\\\\\">Security Disclosures</a></li>\\\\n              <li><a href=\\\\\\"https://foundation.rust-lang.org/policies/privacy-policy/\\\\\\">Privacy Notice</a></li>\\\\n              <li><a href=\\\\\\"/policies\\\\\\">All Policies</a></li>\\\\n            </ul>\\\\n          </div>\\\\n          <div class=\\\\\\"flex flex-column mw8 w-100 measure-wide-l pv2 pv5-m pv2-ns ph4-m ph4-l\\\\\\">\\\\n            <h4>Social</h4>\\\\n            <div class=\\\\\\"flex flex-row flex-wrap items-center\\\\\\">\\\\n              <a rel=\\\\\\"me\\\\\\" href=\\\\\\"https://social.rust-lang.org/@rust\\\\\\" target=\\\\\\"_blank\\\\\\"><img src=\\\\\\"/static/images/mastodon.svg\\\\\\" alt=\\\\\\"Mastodon\\\\\\" title=\\\\\\"Mastodon\\\\\\" /></a>\\\\n              <a href=\\\\\\"https://twitter.com/rustlang\\\\\\" target=\\\\\\"_blank\\\\\\"><img src=\\\\\\"/static/images/twitter.svg\\\\\\" alt=\\\\\\"twitter logo\\\\\\" title=\\\\\\"Twitter\\\\\\"/></a>\\\\n              <a href=\\\\\\"https://www.youtube.com/channel/UCaYhcUwRBNscFNUKTjgPFiA\\\\\\" target=\\\\\\"_blank\\\\\\"><img class=\\\\\\"pv2\\\\\\" src=\\\\\\"/static/images/youtube.svg\\\\\\" alt=\\\\\\"youtube logo\\\\\\" title=\\\\\\"YouTube\\\\\\"/></a>\\\\n              <a href=\\\\\\"https://discord.gg/rust-lang\\\\\\" target=\\\\\\"_blank\\\\\\"><img src=\\\\\\"/static/images/discord.svg\\\\\\" alt=\\\\\\"discord logo\\\\\\" title=\\\\\\"Discord\\\\\\"/></a>\\\\n              <a href=\\\\\\"https://github.com/rust-lang\\\\\\" target=\\\\\\"_blank\\\\\\"><img src=\\\\\\"/static/images/github.svg\\\\\\" alt=\\\\\\"github logo\\\\\\" title=\\\\\\"GitHub\\\\\\"/></a>\\\\n            </div>\\\\n          </div>\\\\n    \\\\n        </div>\\\\n        <div class=\\\\\\"attribution\\\\\\">\\\\n          <p>\\\\n            Maintained by the Rust Team. See a bug?\\\\n<a href=\\\\\\"https://github.com/rust-lang/www.rust-lang.org/issues/new/choose\\\\\\">File an issue!</a>\\\\n          </p>\\\\n          <p>Looking for the <a href=\\\\\\"https://prev.rust-lang.org\\\\\\">previous website</a>?</p>\\\\n        </div>\\\\n      </div>\\\\n    </footer>\\\\n    <script src=\\\\\\"/static/scripts/languages.js\\\\\\"></script>\\\\n  </body>\\\\n</html>\\\\n\\"))",
                                      },
                                    },
                                  ],
                                  "id": 4504424261091329n,
                                  "metadataId": 4355177280n,
                                },
                              ],
                              "createdAt": {
                                "nanos": 717803125,
                                "seconds": 1699978195n,
                              },
                              "enteredAt": {
                                "nanos": 507150375,
                                "seconds": 1699978201n,
                              },
                              "exitedAt": {
                                "nanos": 507152750,
                                "seconds": 1699978201n,
                              },
                              "fields": [
                                {
                                  "metadataId": 4355177008n,
                                  "name": "id",
                                  "value": {
                                    "oneofKind": "u64Val",
                                    "u64Val": 13685720206714877952n,
                                  },
                                },
                              ],
                              "id": 22n,
                              "metadataId": 4355177008n,
                            },
                            {
                              "children": [],
                              "createdAt": {
                                "nanos": 717797666,
                                "seconds": 1699978195n,
                              },
                              "fields": [
                                {
                                  "metadataId": 4354778704n,
                                  "name": "id",
                                  "value": {
                                    "oneofKind": "u64Val",
                                    "u64Val": 13685720206714877952n,
                                  },
                                },
                              ],
                              "id": 21n,
                              "metadataId": 4354778704n,
                            },
                            {
                              "children": [],
                              "createdAt": {
                                "nanos": 717803125,
                                "seconds": 1699978195n,
                              },
                              "fields": [
                                {
                                  "metadataId": 4355177008n,
                                  "name": "id",
                                  "value": {
                                    "oneofKind": "u64Val",
                                    "u64Val": 13685720206714877952n,
                                  },
                                },
                              ],
                              "id": 22n,
                              "metadataId": 4355177008n,
                            },
                          ],
                          "createdAt": {
                            "nanos": 717776708,
                            "seconds": 1699978195n,
                          },
                          "enteredAt": {
                            "nanos": 717794875,
                            "seconds": 1699978195n,
                          },
                          "exitedAt": {
                            "nanos": 717855958,
                            "seconds": 1699978195n,
                          },
                          "fields": [
                            {
                              "metadataId": 4354778568n,
                              "name": "id",
                              "value": {
                                "oneofKind": "u64Val",
                                "u64Val": 13685720206714877952n,
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "cmd",
                              "value": {
                                "oneofKind": "strVal",
                                "strVal": "test1",
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "kind",
                              "value": {
                                "oneofKind": "strVal",
                                "strVal": "async",
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "loc.line",
                              "value": {
                                "oneofKind": "u64Val",
                                "u64Val": 0n,
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "loc.col",
                              "value": {
                                "oneofKind": "u64Val",
                                "u64Val": 0n,
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "is_internal",
                              "value": {
                                "boolVal": false,
                                "oneofKind": "boolVal",
                              },
                            },
                          ],
                          "id": 20n,
                          "metadataId": 4354778568n,
                        },
                        {
                          "children": [],
                          "createdAt": {
                            "nanos": 717776708,
                            "seconds": 1699978195n,
                          },
                          "fields": [
                            {
                              "metadataId": 4354778568n,
                              "name": "id",
                              "value": {
                                "oneofKind": "u64Val",
                                "u64Val": 13685720206714877952n,
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "cmd",
                              "value": {
                                "oneofKind": "strVal",
                                "strVal": "test1",
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "kind",
                              "value": {
                                "oneofKind": "strVal",
                                "strVal": "async",
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "loc.line",
                              "value": {
                                "oneofKind": "u64Val",
                                "u64Val": 0n,
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "loc.col",
                              "value": {
                                "oneofKind": "u64Val",
                                "u64Val": 0n,
                              },
                            },
                            {
                              "metadataId": 4354778568n,
                              "name": "is_internal",
                              "value": {
                                "boolVal": false,
                                "oneofKind": "boolVal",
                              },
                            },
                          ],
                          "id": 20n,
                          "metadataId": 4354778568n,
                        },
                      ],
                      "createdAt": {
                        "nanos": 717453500,
                        "seconds": 1699978195n,
                      },
                      "enteredAt": {
                        "nanos": 717461875,
                        "seconds": 1699978195n,
                      },
                      "exitedAt": {
                        "nanos": 717871916,
                        "seconds": 1699978195n,
                      },
                      "fields": [
                        {
                          "metadataId": 4355177584n,
                          "name": "id",
                          "value": {
                            "oneofKind": "u64Val",
                            "u64Val": 13685720206714877952n,
                          },
                        },
                        {
                          "metadataId": 4355177584n,
                          "name": "cmd",
                          "value": {
                            "oneofKind": "strVal",
                            "strVal": "test1",
                          },
                        },
                      ],
                      "id": 19n,
                      "metadataId": 4355177584n,
                    },
                    {
                      "children": [],
                      "createdAt": {
                        "nanos": 717453500,
                        "seconds": 1699978195n,
                      },
                      "fields": [
                        {
                          "metadataId": 4355177584n,
                          "name": "id",
                          "value": {
                            "oneofKind": "u64Val",
                            "u64Val": 13685720206714877952n,
                          },
                        },
                        {
                          "metadataId": 4355177584n,
                          "name": "cmd",
                          "value": {
                            "oneofKind": "strVal",
                            "strVal": "test1",
                          },
                        },
                      ],
                      "id": 19n,
                      "metadataId": 4355177584n,
                    },
                  ],
                  "createdAt": {
                    "nanos": 717348083,
                    "seconds": 1699978195n,
                  },
                  "enteredAt": {
                    "nanos": 717372791,
                    "seconds": 1699978195n,
                  },
                  "exitedAt": {
                    "nanos": 717873250,
                    "seconds": 1699978195n,
                  },
                  "fields": [
                    {
                      "metadataId": 4355177432n,
                      "name": "id",
                      "value": {
                        "oneofKind": "u64Val",
                        "u64Val": 13685720206714877952n,
                      },
                    },
                    {
                      "metadataId": 4355177432n,
                      "name": "kind",
                      "value": {
                        "oneofKind": "strVal",
                        "strVal": "post-message",
                      },
                    },
                  ],
                  "id": 18n,
                  "metadataId": 4355177432n,
                },
                {
                  "children": [],
                  "createdAt": {
                    "nanos": 717348083,
                    "seconds": 1699978195n,
                  },
                  "fields": [
                    {
                      "metadataId": 4355177432n,
                      "name": "id",
                      "value": {
                        "oneofKind": "u64Val",
                        "u64Val": 13685720206714877952n,
                      },
                    },
                    {
                      "metadataId": 4355177432n,
                      "name": "kind",
                      "value": {
                        "oneofKind": "strVal",
                        "strVal": "post-message",
                      },
                    },
                  ],
                  "id": 18n,
                  "metadataId": 4355177432n,
                },
              ],
              "createdAt": {
                "nanos": 717155375,
                "seconds": 1699978195n,
              },
              "enteredAt": {
                "nanos": 717216458,
                "seconds": 1699978195n,
              },
              "exitedAt": {
                "nanos": 717875458,
                "seconds": 1699978195n,
              },
              "fields": [],
              "id": 17n,
              "marginLeft": 49.04205500700097,
              "metadataId": 4355189520n,
              "width": 26.582670659919444,
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "children": [
                        {
                          "children": [
                            {
                              "children": [],
                              "createdAt": {
                                "nanos": 25484541,
                                "seconds": 1699978196n,
                              },
                              "enteredAt": {
                                "nanos": 25488625,
                                "seconds": 1699978196n,
                              },
                              "exitedAt": {
                                "nanos": 25643208,
                                "seconds": 1699978196n,
                              },
                              "fields": [
                                {
                                  "metadataId": 4355177280n,
                                  "name": "id",
                                  "value": {
                                    "oneofKind": "u64Val",
                                    "u64Val": 4022241998958008320n,
                                  },
                                },
                                {
                                  "metadataId": 4355177280n,
                                  "name": "response",
                                  "value": {
                                    "oneofKind": "strVal",
                                    "strVal": "Ok(Bool(false))",
                                  },
                                },
                              ],
                              "id": 2252074691592193n,
                              "metadataId": 4355177280n,
                            },
                            {
                              "children": [],
                              "createdAt": {
                                "nanos": 25484541,
                                "seconds": 1699978196n,
                              },
                              "fields": [
                                {
                                  "metadataId": 4355177280n,
                                  "name": "id",
                                  "value": {
                                    "oneofKind": "u64Val",
                                    "u64Val": 4022241998958008320n,
                                  },
                                },
                                {
                                  "metadataId": 4355177280n,
                                  "name": "response",
                                  "value": {
                                    "oneofKind": "strVal",
                                    "strVal": "Ok(Bool(false))",
                                  },
                                },
                              ],
                              "id": 2252074691592193n,
                              "metadataId": 4355177280n,
                            },
                          ],
                          "createdAt": {
                            "nanos": 25400000,
                            "seconds": 1699978196n,
                          },
                          "enteredAt": {
                            "nanos": 25652875,
                            "seconds": 1699978196n,
                          },
                          "exitedAt": {
                            "nanos": 25654416,
                            "seconds": 1699978196n,
                          },
                          "fields": [
                            {
                              "metadataId": 4355176888n,
                              "name": "id",
                              "value": {
                                "oneofKind": "u64Val",
                                "u64Val": 4022241998958008320n,
                              },
                            },
                          ],
                          "id": 26n,
                          "metadataId": 4355176888n,
                        },
                        {
                          "children": [],
                          "createdAt": {
                            "nanos": 25400000,
                            "seconds": 1699978196n,
                          },
                          "fields": [
                            {
                              "metadataId": 4355176888n,
                              "name": "id",
                              "value": {
                                "oneofKind": "u64Val",
                                "u64Val": 4022241998958008320n,
                              },
                            },
                          ],
                          "id": 26n,
                          "metadataId": 4355176888n,
                        },
                      ],
                      "createdAt": {
                        "nanos": 25287166,
                        "seconds": 1699978196n,
                      },
                      "enteredAt": {
                        "nanos": 25290375,
                        "seconds": 1699978196n,
                      },
                      "exitedAt": {
                        "nanos": 25435208,
                        "seconds": 1699978196n,
                      },
                      "fields": [
                        {
                          "metadataId": 4355177584n,
                          "name": "id",
                          "value": {
                            "oneofKind": "u64Val",
                            "u64Val": 4022241998958008320n,
                          },
                        },
                        {
                          "metadataId": 4355177584n,
                          "name": "cmd",
                          "value": {
                            "oneofKind": "strVal",
                            "strVal": "tauri",
                          },
                        },
                      ],
                      "id": 25n,
                      "metadataId": 4355177584n,
                    },
                    {
                      "children": [],
                      "createdAt": {
                        "nanos": 25287166,
                        "seconds": 1699978196n,
                      },
                      "fields": [
                        {
                          "metadataId": 4355177584n,
                          "name": "id",
                          "value": {
                            "oneofKind": "u64Val",
                            "u64Val": 4022241998958008320n,
                          },
                        },
                        {
                          "metadataId": 4355177584n,
                          "name": "cmd",
                          "value": {
                            "oneofKind": "strVal",
                            "strVal": "tauri",
                          },
                        },
                      ],
                      "id": 25n,
                      "metadataId": 4355177584n,
                    },
                  ],
                  "createdAt": {
                    "nanos": 25213291,
                    "seconds": 1699978196n,
                  },
                  "enteredAt": {
                    "nanos": 25223291,
                    "seconds": 1699978196n,
                  },
                  "exitedAt": {
                    "nanos": 25437625,
                    "seconds": 1699978196n,
                  },
                  "fields": [
                    {
                      "metadataId": 4355177432n,
                      "name": "id",
                      "value": {
                        "oneofKind": "u64Val",
                        "u64Val": 4022241998958008320n,
                      },
                    },
                    {
                      "metadataId": 4355177432n,
                      "name": "kind",
                      "value": {
                        "oneofKind": "strVal",
                        "strVal": "post-message",
                      },
                    },
                  ],
                  "id": 2251799813685272n,
                  "metadataId": 4355177432n,
                },
                {
                  "children": [],
                  "createdAt": {
                    "nanos": 25213291,
                    "seconds": 1699978196n,
                  },
                  "fields": [
                    {
                      "metadataId": 4355177432n,
                      "name": "id",
                      "value": {
                        "oneofKind": "u64Val",
                        "u64Val": 4022241998958008320n,
                      },
                    },
                    {
                      "metadataId": 4355177432n,
                      "name": "kind",
                      "value": {
                        "oneofKind": "strVal",
                        "strVal": "post-message",
                      },
                    },
                  ],
                  "id": 2251799813685272n,
                  "metadataId": 4355177432n,
                },
              ],
              "createdAt": {
                "nanos": 25147875,
                "seconds": 1699978196n,
              },
              "enteredAt": {
                "nanos": 25164958,
                "seconds": 1699978196n,
              },
              "exitedAt": {
                "nanos": 25439750,
                "seconds": 1699978196n,
              },
              "fields": [],
              "id": 2251799813685271n,
              "marginLeft": 60.648351608461326,
              "metadataId": 4355189520n,
              "width": 11.081276463905814,
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "children": [
                        {
                          "children": [],
                          "createdAt": {
                            "nanos": 25535791,
                            "seconds": 1699978196n,
                          },
                          "enteredAt": {
                            "nanos": 25539166,
                            "seconds": 1699978196n,
                          },
                          "exitedAt": {
                            "nanos": 25546750,
                            "seconds": 1699978196n,
                          },
                          "fields": [
                            {
                              "metadataId": 4355178072n,
                              "name": "name",
                              "value": {
                                "oneofKind": "strVal",
                                "strVal": "probe",
                              },
                            },
                          ],
                          "id": 30n,
                          "metadataId": 4355178072n,
                        },
                        {
                          "children": [],
                          "createdAt": {
                            "nanos": 25535791,
                            "seconds": 1699978196n,
                          },
                          "fields": [
                            {
                              "metadataId": 4355178072n,
                              "name": "name",
                              "value": {
                                "oneofKind": "strVal",
                                "strVal": "probe",
                              },
                            },
                          ],
                          "id": 30n,
                          "metadataId": 4355178072n,
                        },
                      ],
                      "createdAt": {
                        "nanos": 25493750,
                        "seconds": 1699978196n,
                      },
                      "enteredAt": {
                        "nanos": 25496458,
                        "seconds": 1699978196n,
                      },
                      "exitedAt": {
                        "nanos": 25555708,
                        "seconds": 1699978196n,
                      },
                      "fields": [
                        {
                          "metadataId": 4355177584n,
                          "name": "id",
                          "value": {
                            "oneofKind": "u64Val",
                            "u64Val": 6587737361166952448n,
                          },
                        },
                        {
                          "metadataId": 4355177584n,
                          "name": "cmd",
                          "value": {
                            "oneofKind": "strVal",
                            "strVal": "__initialized",
                          },
                        },
                      ],
                      "id": 29n,
                      "metadataId": 4355177584n,
                    },
                    {
                      "children": [],
                      "createdAt": {
                        "nanos": 25493750,
                        "seconds": 1699978196n,
                      },
                      "fields": [
                        {
                          "metadataId": 4355177584n,
                          "name": "id",
                          "value": {
                            "oneofKind": "u64Val",
                            "u64Val": 6587737361166952448n,
                          },
                        },
                        {
                          "metadataId": 4355177584n,
                          "name": "cmd",
                          "value": {
                            "oneofKind": "strVal",
                            "strVal": "__initialized",
                          },
                        },
                      ],
                      "id": 29n,
                      "metadataId": 4355177584n,
                    },
                  ],
                  "createdAt": {
                    "nanos": 25478541,
                    "seconds": 1699978196n,
                  },
                  "enteredAt": {
                    "nanos": 25481916,
                    "seconds": 1699978196n,
                  },
                  "exitedAt": {
                    "nanos": 25558958,
                    "seconds": 1699978196n,
                  },
                  "fields": [
                    {
                      "metadataId": 4355177432n,
                      "name": "id",
                      "value": {
                        "oneofKind": "u64Val",
                        "u64Val": 6587737361166952448n,
                      },
                    },
                    {
                      "metadataId": 4355177432n,
                      "name": "kind",
                      "value": {
                        "oneofKind": "strVal",
                        "strVal": "post-message",
                      },
                    },
                  ],
                  "id": 28n,
                  "metadataId": 4355177432n,
                },
                {
                  "children": [],
                  "createdAt": {
                    "nanos": 25478541,
                    "seconds": 1699978196n,
                  },
                  "fields": [
                    {
                      "metadataId": 4355177432n,
                      "name": "id",
                      "value": {
                        "oneofKind": "u64Val",
                        "u64Val": 6587737361166952448n,
                      },
                    },
                    {
                      "metadataId": 4355177432n,
                      "name": "kind",
                      "value": {
                        "oneofKind": "strVal",
                        "strVal": "post-message",
                      },
                    },
                  ],
                  "id": 28n,
                  "metadataId": 4355177432n,
                },
              ],
              "createdAt": {
                "nanos": 25465666,
                "seconds": 1699978196n,
              },
              "enteredAt": {
                "nanos": 25468375,
                "seconds": 1699978196n,
              },
              "exitedAt": {
                "nanos": 25562208,
                "seconds": 1699978196n,
              },
              "fields": [],
              "id": 27n,
              "marginLeft": 64.45165990797753,
              "metadataId": 4355189520n,
              "width": 3.7798203036249096,
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "children": [
                        {
                          "children": [
                            {
                              "children": [],
                              "createdAt": {
                                "nanos": 83698750,
                                "seconds": 1699978197n,
                              },
                              "enteredAt": {
                                "nanos": 83702500,
                                "seconds": 1699978197n,
                              },
                              "exitedAt": {
                                "nanos": 83798708,
                                "seconds": 1699978197n,
                              },
                              "fields": [
                                {
                                  "metadataId": 4355177280n,
                                  "name": "id",
                                  "value": {
                                    "oneofKind": "u64Val",
                                    "u64Val": 9016175834150165504n,
                                  },
                                },
                                {
                                  "metadataId": 4355177280n,
                                  "name": "response",
                                  "value": {
                                    "oneofKind": "strVal",
                                    "strVal": "Ok(Bool(false))",
                                  },
                                },
                              ],
                              "id": 4503874505277441n,
                              "metadataId": 4355177280n,
                            },
                            {
                              "children": [],
                              "createdAt": {
                                "nanos": 83698750,
                                "seconds": 1699978197n,
                              },
                              "fields": [
                                {
                                  "metadataId": 4355177280n,
                                  "name": "id",
                                  "value": {
                                    "oneofKind": "u64Val",
                                    "u64Val": 9016175834150165504n,
                                  },
                                },
                                {
                                  "metadataId": 4355177280n,
                                  "name": "response",
                                  "value": {
                                    "oneofKind": "strVal",
                                    "strVal": "Ok(Bool(false))",
                                  },
                                },
                              ],
                              "id": 4503874505277441n,
                              "metadataId": 4355177280n,
                            },
                          ],
                          "createdAt": {
                            "nanos": 83604500,
                            "seconds": 1699978197n,
                          },
                          "enteredAt": {
                            "nanos": 83815833,
                            "seconds": 1699978197n,
                          },
                          "exitedAt": {
                            "nanos": 83817166,
                            "seconds": 1699978197n,
                          },
                          "fields": [
                            {
                              "metadataId": 4355176888n,
                              "name": "id",
                              "value": {
                                "oneofKind": "u64Val",
                                "u64Val": 9016175834150165504n,
                              },
                            },
                          ],
                          "id": 2251799813685278n,
                          "metadataId": 4355176888n,
                        },
                        {
                          "children": [],
                          "createdAt": {
                            "nanos": 83604500,
                            "seconds": 1699978197n,
                          },
                          "fields": [
                            {
                              "metadataId": 4355176888n,
                              "name": "id",
                              "value": {
                                "oneofKind": "u64Val",
                                "u64Val": 9016175834150165504n,
                              },
                            },
                          ],
                          "id": 2251799813685278n,
                          "metadataId": 4355176888n,
                        },
                      ],
                      "createdAt": {
                        "nanos": 83502833,
                        "seconds": 1699978197n,
                      },
                      "enteredAt": {
                        "nanos": 83505708,
                        "seconds": 1699978197n,
                      },
                      "exitedAt": {
                        "nanos": 83635000,
                        "seconds": 1699978197n,
                      },
                      "fields": [
                        {
                          "metadataId": 4355177584n,
                          "name": "id",
                          "value": {
                            "oneofKind": "u64Val",
                            "u64Val": 9016175834150165504n,
                          },
                        },
                        {
                          "metadataId": 4355177584n,
                          "name": "cmd",
                          "value": {
                            "oneofKind": "strVal",
                            "strVal": "tauri",
                          },
                        },
                      ],
                      "id": 2251799813685277n,
                      "metadataId": 4355177584n,
                    },
                    {
                      "children": [],
                      "createdAt": {
                        "nanos": 83502833,
                        "seconds": 1699978197n,
                      },
                      "fields": [
                        {
                          "metadataId": 4355177584n,
                          "name": "id",
                          "value": {
                            "oneofKind": "u64Val",
                            "u64Val": 9016175834150165504n,
                          },
                        },
                        {
                          "metadataId": 4355177584n,
                          "name": "cmd",
                          "value": {
                            "oneofKind": "strVal",
                            "strVal": "tauri",
                          },
                        },
                      ],
                      "id": 2251799813685277n,
                      "metadataId": 4355177584n,
                    },
                  ],
                  "createdAt": {
                    "nanos": 83458541,
                    "seconds": 1699978197n,
                  },
                  "enteredAt": {
                    "nanos": 83463833,
                    "seconds": 1699978197n,
                  },
                  "exitedAt": {
                    "nanos": 83636833,
                    "seconds": 1699978197n,
                  },
                  "fields": [
                    {
                      "metadataId": 4355177432n,
                      "name": "id",
                      "value": {
                        "oneofKind": "u64Val",
                        "u64Val": 9016175834150165504n,
                      },
                    },
                    {
                      "metadataId": 4355177432n,
                      "name": "kind",
                      "value": {
                        "oneofKind": "strVal",
                        "strVal": "post-message",
                      },
                    },
                  ],
                  "id": 4503599627370524n,
                  "metadataId": 4355177432n,
                },
                {
                  "children": [],
                  "createdAt": {
                    "nanos": 83458541,
                    "seconds": 1699978197n,
                  },
                  "fields": [
                    {
                      "metadataId": 4355177432n,
                      "name": "id",
                      "value": {
                        "oneofKind": "u64Val",
                        "u64Val": 9016175834150165504n,
                      },
                    },
                    {
                      "metadataId": 4355177432n,
                      "name": "kind",
                      "value": {
                        "oneofKind": "strVal",
                        "strVal": "post-message",
                      },
                    },
                  ],
                  "id": 4503599627370524n,
                  "metadataId": 4355177432n,
                },
              ],
              "createdAt": {
                "nanos": 83427541,
                "seconds": 1699978197n,
              },
              "enteredAt": {
                "nanos": 83432041,
                "seconds": 1699978197n,
              },
              "exitedAt": {
                "nanos": 83638291,
                "seconds": 1699978197n,
              },
              "fields": [],
              "id": 6755399441055771n,
              "marginLeft": 92.36242517492188,
              "metadataId": 4355189520n,
              "width": 8.323866570277806,
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "children": [
                        {
                          "children": [],
                          "createdAt": {
                            "nanos": 83718666,
                            "seconds": 1699978197n,
                          },
                          "enteredAt": {
                            "nanos": 83721458,
                            "seconds": 1699978197n,
                          },
                          "exitedAt": {
                            "nanos": 83730833,
                            "seconds": 1699978197n,
                          },
                          "fields": [
                            {
                              "metadataId": 4355178072n,
                              "name": "name",
                              "value": {
                                "oneofKind": "strVal",
                                "strVal": "probe",
                              },
                            },
                          ],
                          "id": 2251799813685273n,
                          "metadataId": 4355178072n,
                        },
                        {
                          "children": [],
                          "createdAt": {
                            "nanos": 83718666,
                            "seconds": 1699978197n,
                          },
                          "fields": [
                            {
                              "metadataId": 4355178072n,
                              "name": "name",
                              "value": {
                                "oneofKind": "strVal",
                                "strVal": "probe",
                              },
                            },
                          ],
                          "id": 2251799813685273n,
                          "metadataId": 4355178072n,
                        },
                      ],
                      "createdAt": {
                        "nanos": 83682916,
                        "seconds": 1699978197n,
                      },
                      "enteredAt": {
                        "nanos": 83685208,
                        "seconds": 1699978197n,
                      },
                      "exitedAt": {
                        "nanos": 83736833,
                        "seconds": 1699978197n,
                      },
                      "fields": [
                        {
                          "metadataId": 4355177584n,
                          "name": "id",
                          "value": {
                            "oneofKind": "u64Val",
                            "u64Val": 208205879480069536n,
                          },
                        },
                        {
                          "metadataId": 4355177584n,
                          "name": "cmd",
                          "value": {
                            "oneofKind": "strVal",
                            "strVal": "__initialized",
                          },
                        },
                      ],
                      "id": 2251799813685274n,
                      "metadataId": 4355177584n,
                    },
                    {
                      "children": [],
                      "createdAt": {
                        "nanos": 83682916,
                        "seconds": 1699978197n,
                      },
                      "fields": [
                        {
                          "metadataId": 4355177584n,
                          "name": "id",
                          "value": {
                            "oneofKind": "u64Val",
                            "u64Val": 208205879480069536n,
                          },
                        },
                        {
                          "metadataId": 4355177584n,
                          "name": "cmd",
                          "value": {
                            "oneofKind": "strVal",
                            "strVal": "__initialized",
                          },
                        },
                      ],
                      "id": 2251799813685274n,
                      "metadataId": 4355177584n,
                    },
                  ],
                  "createdAt": {
                    "nanos": 83669125,
                    "seconds": 1699978197n,
                  },
                  "enteredAt": {
                    "nanos": 83671666,
                    "seconds": 1699978197n,
                  },
                  "exitedAt": {
                    "nanos": 83740083,
                    "seconds": 1699978197n,
                  },
                  "fields": [
                    {
                      "metadataId": 4355177432n,
                      "name": "id",
                      "value": {
                        "oneofKind": "u64Val",
                        "u64Val": 208205879480069536n,
                      },
                    },
                    {
                      "metadataId": 4355177432n,
                      "name": "kind",
                      "value": {
                        "oneofKind": "strVal",
                        "strVal": "post-message",
                      },
                    },
                  ],
                  "id": 32n,
                  "metadataId": 4355177432n,
                },
                {
                  "children": [],
                  "createdAt": {
                    "nanos": 83669125,
                    "seconds": 1699978197n,
                  },
                  "fields": [
                    {
                      "metadataId": 4355177432n,
                      "name": "id",
                      "value": {
                        "oneofKind": "u64Val",
                        "u64Val": 208205879480069536n,
                      },
                    },
                    {
                      "metadataId": 4355177432n,
                      "name": "kind",
                      "value": {
                        "oneofKind": "strVal",
                        "strVal": "post-message",
                      },
                    },
                  ],
                  "id": 32n,
                  "metadataId": 4355177432n,
                },
              ],
              "createdAt": {
                "nanos": 83658791,
                "seconds": 1699978197n,
              },
              "enteredAt": {
                "nanos": 83660833,
                "seconds": 1699978197n,
              },
              "exitedAt": {
                "nanos": 83742666,
                "seconds": 1699978197n,
              },
              "fields": [],
              "id": 31n,
              "marginLeft": 96.80445352626094,
              "metadataId": 4355189520n,
              "width": 3.3047609212021065,
            },
            {
              "children": [],
              "createdAt": {
                "nanos": 892960958,
                "seconds": 1699978193n,
              },
              "fields": [],
              "id": 4503599627370499n,
              "metadataId": 4355189520n,
            },
            {
              "children": [],
              "createdAt": {
                "nanos": 893632666,
                "seconds": 1699978193n,
              },
              "fields": [],
              "id": 5n,
              "metadataId": 4355189520n,
            },
            {
              "children": [],
              "createdAt": {
                "nanos": 440893125,
                "seconds": 1699978195n,
              },
              "fields": [],
              "id": 4503599627370501n,
              "metadataId": 4355189520n,
            },
            {
              "children": [],
              "createdAt": {
                "nanos": 595884291,
                "seconds": 1699978195n,
              },
              "fields": [],
              "id": 11n,
              "metadataId": 4355189520n,
            },
            {
              "children": [],
              "createdAt": {
                "nanos": 717155375,
                "seconds": 1699978195n,
              },
              "fields": [],
              "id": 17n,
              "metadataId": 4355189520n,
            },
            {
              "children": [],
              "createdAt": {
                "nanos": 25147875,
                "seconds": 1699978196n,
              },
              "fields": [],
              "id": 2251799813685271n,
              "metadataId": 4355189520n,
            },
            {
              "children": [],
              "createdAt": {
                "nanos": 25465666,
                "seconds": 1699978196n,
              },
              "fields": [],
              "id": 27n,
              "metadataId": 4355189520n,
            },
            {
              "children": [],
              "createdAt": {
                "nanos": 83427541,
                "seconds": 1699978197n,
              },
              "fields": [],
              "id": 6755399441055771n,
              "metadataId": 4355189520n,
            },
            {
              "children": [],
              "createdAt": {
                "nanos": 83658791,
                "seconds": 1699978197n,
              },
              "fields": [],
              "id": 31n,
              "metadataId": 4355189520n,
            },
          ]
        `)
    })
})