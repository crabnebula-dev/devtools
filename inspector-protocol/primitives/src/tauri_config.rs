use serde::{Serialize, Serializer};
use std::{collections::HashMap, fmt::Display, path::PathBuf, sync::Arc};
use tauri::utils::config as tauri_config;
use typescript_type_def::TypeDef;

/// An URL to open on a Tauri webview window.
#[derive(PartialEq, Eq, Debug, Clone, Serialize, TypeDef)]
#[serde(untagged)]
pub enum WindowUrl {
	/// An external URL.
	External(String),
	/// The path portion of an app URL.
	/// For instance, to load `tauri://localhost/users/john`,
	/// you can simply provide `users/john` in this configuration.
	App(PathBuf),
}

/// A bundle referenced by tauri-bundler.
#[derive(TypeDef)]
pub enum BundleType {
	/// The debian bundle (.deb).
	Deb,
	/// The AppImage bundle (.appimage).
	AppImage,
	/// The Microsoft Installer bundle (.msi).
	Msi,
	/// The NSIS bundle (.exe).
	Nsis,
	/// The macOS application bundle (.app).
	App,
	/// The Apple Disk Image bundle (.dmg).
	Dmg,
	/// The Tauri updater bundle.
	Updater,
}

impl Display for BundleType {
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
		write!(
			f,
			"{}",
			match self {
				Self::Deb => "deb",
				Self::AppImage => "appimage",
				Self::Msi => "msi",
				Self::Nsis => "nsis",
				Self::App => "app",
				Self::Dmg => "dmg",
				Self::Updater => "updater",
			}
		)
	}
}

impl Serialize for BundleType {
	fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
	where
		S: Serializer,
	{
		serializer.serialize_str(self.to_string().as_ref())
	}
}

/// Targets to bundle. Each value is case insensitive.
#[derive(TypeDef)]
pub enum BundleTarget {
	/// Bundle all targets.
	All,
	/// A list of bundle targets.
	List(Vec<BundleType>),
	/// A single bundle target.
	One(BundleType),
}

impl Serialize for BundleTarget {
	fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
	where
		S: Serializer,
	{
		match self {
			Self::All => serializer.serialize_str("all"),
			Self::List(l) => l.serialize(serializer),
			Self::One(t) => serializer.serialize_str(t.to_string().as_ref()),
		}
	}
}

/// Configuration for AppImage bundles.
///
/// See more: https://tauri.app/v1/api/config#appimageconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AppImageConfig {
	/// Include additional gstreamer dependencies needed for audio and video playback.
	/// This increases the bundle size by ~15-35MB depending on your build system.
	pub bundle_media_framework: bool,
}

/// Configuration for Debian (.deb) bundles.
///
/// See more: https://tauri.app/v1/api/config#debconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct DebConfig {
	/// The list of deb dependencies your application relies on.
	pub depends: Option<Vec<String>>,
	/// The files to include on the package.
	pub files: HashMap<PathBuf, PathBuf>,
	/// Path to a custom desktop file Handlebars template.
	///
	/// Available variables: `categories`, `comment` (optional), `exec`, `icon` and `name`.
	pub desktop_template: Option<PathBuf>,
}

/// Configuration for the macOS bundles.
///
/// See more: https://tauri.app/v1/api/config#macconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct MacConfig {
	/// A list of strings indicating any macOS X frameworks that need to be bundled with the application.
	///
	/// If a name is used, ".framework" must be omitted and it will look for standard install locations. You may also use a path to a specific framework.
	pub frameworks: Option<Vec<String>>,
	/// A version string indicating the minimum macOS X version that the bundled application supports. Defaults to `10.13`.
	///
	/// Setting it to `null` completely removes the `LSMinimumSystemVersion` field on the bundle's `Info.plist`
	/// and the `MACOSX_DEPLOYMENT_TARGET` environment variable.
	///
	/// An empty string is considered an invalid value so the default value is used.
	pub minimum_system_version: Option<String>,
	/// Allows your application to communicate with the outside world.
	/// It should be a lowercase, without port and protocol domain name.
	pub exception_domain: Option<String>,
	/// The path to the license file to add to the DMG bundle.
	pub license: Option<String>,
	/// Identity to use for code signing.
	pub signing_identity: Option<String>,
	/// Provider short name for notarization.
	pub provider_short_name: Option<String>,
	/// Path to the entitlements file.
	pub entitlements: Option<String>,
}

/// Configuration for a target language for the WiX build.
///
/// See more: https://tauri.app/v1/api/config#wixlanguageconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WixLanguageConfig {
	/// The path to a locale (`.wxl`) file. See <https://wixtoolset.org/documentation/manual/v3/howtos/ui_and_localization/build_a_localized_version.html>.
	#[serde(alias = "locale-path")]
	pub locale_path: Option<String>,
}

/// The languages to build using WiX.
#[derive(Serialize, TypeDef)]
#[serde(untagged)]
pub enum WixLanguage {
	/// A single language to build, without configuration.
	One(String),
	/// A list of languages to build, without configuration.
	List(Vec<String>),
	/// A map of languages and its configuration.
	Localized(HashMap<String, WixLanguageConfig>),
}

/// Configuration for the MSI bundle using WiX.
///
/// See more: https://tauri.app/v1/api/config#wixconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WixConfig {
	/// The installer languages to build. See <https://docs.microsoft.com/en-us/windows/win32/msi/localizing-the-error-and-actiontext-tables>.
	pub language: WixLanguage,
	/// A custom .wxs template to use.
	pub template: Option<PathBuf>,
	/// A list of paths to .wxs files with WiX fragments to use.
	#[serde(default)]
	pub fragment_paths: Vec<PathBuf>,
	/// The ComponentGroup element ids you want to reference from the fragments.
	#[serde(default)]
	pub component_group_refs: Vec<String>,
	/// The Component element ids you want to reference from the fragments.
	#[serde(default)]
	pub component_refs: Vec<String>,
	/// The FeatureGroup element ids you want to reference from the fragments.
	#[serde(default)]
	pub feature_group_refs: Vec<String>,
	/// The Feature element ids you want to reference from the fragments.
	#[serde(default)]
	pub feature_refs: Vec<String>,
	/// The Merge element ids you want to reference from the fragments.
	#[serde(default)]
	pub merge_refs: Vec<String>,
	/// Disables the Webview2 runtime installation after app install.
	///
	/// Will be removed in v2, prefer the [`WindowsConfig::webview_install_mode`] option.
	#[serde(default)]
	pub skip_webview_install: bool,
	/// The path to the license file to render on the installer.
	///
	/// Must be an RTF file, so if a different extension is provided, we convert it to the RTF format.
	pub license: Option<PathBuf>,
	/// Create an elevated update task within Windows Task Scheduler.
	#[serde(default)]
	pub enable_elevated_update_task: bool,
	/// Path to a bitmap file to use as the installation user interface banner.
	/// This bitmap will appear at the top of all but the first page of the installer.
	///
	/// The required dimensions are 493px × 58px.
	#[serde(alias = "banner-path")]
	pub banner_path: Option<PathBuf>,
	/// Path to a bitmap file to use on the installation user interface dialogs.
	/// It is used on the welcome and completion dialogs.

	/// The required dimensions are 493px × 312px.
	#[serde(alias = "dialog-image-path")]
	pub dialog_image_path: Option<PathBuf>,
}

/// Configuration for the Installer bundle using NSIS.
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct NsisConfig {
	/// A custom .nsi template to use.
	pub template: Option<PathBuf>,
	/// The path to the license file to render on the installer.
	pub license: Option<PathBuf>,
	/// The path to a bitmap file to display on the header of installers pages.
	///
	/// The recommended dimensions are 150px x 57px.
	#[serde(alias = "header-image")]
	pub header_image: Option<PathBuf>,
	/// The path to a bitmap file for the Welcome page and the Finish page.
	///
	/// The recommended dimensions are 164px x 314px.
	#[serde(alias = "sidebar-image")]
	pub sidebar_image: Option<PathBuf>,
	/// The path to an icon file used as the installer icon.
	#[serde(alias = "install-icon")]
	pub installer_icon: Option<PathBuf>,
	/// Whether the installation will be for all users or just the current user.
	#[serde(default)]
	pub install_mode: NSISInstallerMode,
	/// A list of installer languages.
	/// By default the OS language is used. If the OS language is not in the list of languages, the first language will be used.
	/// To allow the user to select the language, set `display_language_selector` to `true`.
	///
	/// See <https://github.com/kichik/nsis/tree/9465c08046f00ccb6eda985abbdbf52c275c6c4d/Contrib/Language%20files> for the complete list of languages.
	pub languages: Option<Vec<String>>,
	/// A key-value pair where the key is the language and the
	/// value is the path to a custom `.nsh` file that holds the translated text for tauri's custom messages.
	///
	/// See <https://github.com/tauri-apps/tauri/blob/dev/tooling/bundler/src/bundle/windows/templates/nsis-languages/English.nsh> for an example `.nsh` file.
	///
	/// **Note**: the key must be a valid NSIS language and it must be added to [`NsisConfig`] languages array,
	pub custom_language_files: Option<HashMap<String, PathBuf>>,
	/// Whether to display a language selector dialog before the installer and uninstaller windows are rendered or not.
	/// By default the OS language is selected, with a fallback to the first language in the `languages` array.
	#[serde(default)]
	pub display_language_selector: bool,
}

/// Install Modes for the NSIS installer.
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub enum NSISInstallerMode {
	/// Default mode for the installer.
	///
	/// Install the app by default in a directory that doesn't require Administrator access.
	///
	/// Installer metadata will be saved under the `HKCU` registry path.
	CurrentUser,
	/// Install the app by default in the `Program Files` folder directory requires Administrator
	/// access for the installation.
	///
	/// Installer metadata will be saved under the `HKLM` registry path.
	PerMachine,
	/// Combines both modes and allows the user to choose at install time
	/// whether to install for the current user or per machine. Note that this mode
	/// will require Administrator access even if the user wants to install it for the current user only.
	///
	/// Installer metadata will be saved under the `HKLM` or `HKCU` registry path based on the user's choice.
	Both,
}

/// Install modes for the Webview2 runtime.
/// Note that for the updater bundle [`Self::DownloadBootstrapper`] is used.
///
/// For more information see <https://tauri.app/v1/guides/building/windows>.
#[derive(Serialize, TypeDef)]
#[serde(tag = "type", rename_all = "camelCase", deny_unknown_fields)]
pub enum WebviewInstallMode {
	/// Do not install the Webview2 as part of the Windows Installer.
	Skip,
	/// Download the bootstrapper and run it.
	/// Requires an internet connection.
	/// Results in a smaller installer size, but is not recommended on Windows 7.
	DownloadBootstrapper {
		/// Instructs the installer to run the bootstrapper in silent mode. Defaults to `true`.
		#[serde(default = "ser::default_true")]
		silent: bool,
	},
	/// Embed the bootstrapper and run it.
	/// Requires an internet connection.
	/// Increases the installer size by around 1.8MB, but offers better support on Windows 7.
	EmbedBootstrapper {
		/// Instructs the installer to run the bootstrapper in silent mode. Defaults to `true`.
		#[serde(default = "ser::default_true")]
		silent: bool,
	},
	/// Embed the offline installer and run it.
	/// Does not require an internet connection.
	/// Increases the installer size by around 127MB.
	OfflineInstaller {
		/// Instructs the installer to run the installer in silent mode. Defaults to `true`.
		#[serde(default = "ser::default_true")]
		silent: bool,
	},
	/// Embed a fixed webview2 version and use it at runtime.
	/// Increases the installer size by around 180MB.
	FixedRuntime {
		/// The path to the fixed runtime to use.
		///
		/// The fixed version can be downloaded [on the official website](https://developer.microsoft.com/en-us/microsoft-edge/webview2/#download-section).
		/// The `.cab` file must be extracted to a folder and this folder path must be defined on this field.
		path: PathBuf,
	},
}

/// Windows bundler configuration.
///
/// See more: https://tauri.app/v1/api/config#windowsconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WindowsConfig {
	/// Specifies the file digest algorithm to use for creating file signatures.
	/// Required for code signing. SHA-256 is recommended.
	#[serde(alias = "digest-algorithm")]
	pub digest_algorithm: Option<String>,
	/// Specifies the SHA1 hash of the signing certificate.
	#[serde(alias = "certificate-thumbprint")]
	pub certificate_thumbprint: Option<String>,
	/// Server to use during timestamping.
	#[serde(alias = "timestamp-url")]
	pub timestamp_url: Option<String>,
	/// Whether to use Time-Stamp Protocol (TSP, a.k.a. RFC 3161) for the timestamp server. Your code signing provider may
	/// use a TSP timestamp server, like e.g. SSL.com does. If so, enable TSP by setting to true.
	pub tsp: bool,
	/// The installation mode for the Webview2 runtime.
	#[serde(default)]
	pub webview_install_mode: WebviewInstallMode,
	/// Path to the webview fixed runtime to use. Overwrites [`Self::webview_install_mode`] if set.
	///
	/// Will be removed in v2, prefer the [`Self::webview_install_mode`] option.
	///
	/// The fixed version can be downloaded [on the official website](https://developer.microsoft.com/en-us/microsoft-edge/webview2/#download-section).
	/// The `.cab` file must be extracted to a folder and this folder path must be defined on this field.
	#[serde(alias = "webview-fixed-runtime-path")]
	pub webview_fixed_runtime_path: Option<PathBuf>,
	/// Validates a second app installation, blocking the user from installing an older version if set to `false`.
	///
	/// For instance, if `1.2.1` is installed, the user won't be able to install app version `1.2.0` or `1.1.5`.
	///
	/// The default value of this flag is `true`.
	#[serde(default = "ser::default_true")]
	pub allow_downgrades: bool,
	/// Configuration for the MSI generated with WiX.
	pub wix: Option<WixConfig>,
	/// Configuration for the installer generated with NSIS.
	pub nsis: Option<NsisConfig>,
}

/// Configuration for tauri-bundler.
///
/// See more: https://tauri.app/v1/api/config#bundleconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct BundleConfig {
	/// Whether Tauri should bundle your application or just output the executable.
	pub active: bool,
	/// The bundle targets, currently supports ["deb", "appimage", "nsis", "msi", "app", "dmg", "updater"] or "all".
	pub targets: BundleTarget,
	/// The application identifier in reverse domain name notation (e.g. `com.tauri.example`).
	/// This string must be unique across applications since it is used in system configurations like
	/// the bundle ID and path to the webview data directory.
	/// This string must contain only alphanumeric characters (A–Z, a–z, and 0–9), hyphens (-),
	/// and periods (.).
	pub identifier: String,
	/// The application's publisher. Defaults to the second element in the identifier string.
	/// Currently maps to the Manufacturer property of the Windows Installer.
	pub publisher: Option<String>,
	/// The app's icons
	pub icon: Vec<String>,
	/// App resources to bundle.
	/// Each resource is a path to a file or directory.
	/// Glob patterns are supported.
	pub resources: Option<Vec<String>>,
	/// A copyright string associated with your application.
	pub copyright: Option<String>,
	/// The application kind.
	///
	/// Should be one of the following:
	/// Business, DeveloperTool, Education, Entertainment, Finance, Game, ActionGame, AdventureGame, ArcadeGame, BoardGame, CardGame, CasinoGame, DiceGame, EducationalGame, FamilyGame, KidsGame, MusicGame, PuzzleGame, RacingGame, RolePlayingGame, SimulationGame, SportsGame, StrategyGame, TriviaGame, WordGame, GraphicsAndDesign, HealthcareAndFitness, Lifestyle, Medical, Music, News, Photography, Productivity, Reference, SocialNetworking, Sports, Travel, Utility, Video, Weather.
	pub category: Option<String>,
	/// A short description of your application.
	#[serde(alias = "short-description")]
	pub short_description: Option<String>,
	/// A longer, multi-line description of the application.
	#[serde(alias = "long-description")]
	pub long_description: Option<String>,
	/// Configuration for the AppImage bundle.
	pub appimage: AppImageConfig,
	/// Configuration for the Debian bundle.
	pub deb: DebConfig,
	/// Configuration for the macOS bundles.
	#[serde(rename = "macOS")]
	pub macos: MacConfig,
	/// A list of—either absolute or relative—paths to binaries to embed with your application.
	///
	/// Note that Tauri will look for system-specific binaries following the pattern "binary-name{-target-triple}{.system-extension}".
	///
	/// E.g. for the external binary "my-binary", Tauri looks for:
	///
	/// - "my-binary-x86_64-pc-windows-msvc.exe" for Windows
	/// - "my-binary-x86_64-apple-darwin" for macOS
	/// - "my-binary-x86_64-unknown-linux-gnu" for Linux
	///
	/// so don't forget to provide binaries for all targeted platforms.
	#[serde(alias = "external-bin")]
	pub external_bin: Option<Vec<String>>,
	/// Configuration for the Windows bundle.
	pub windows: WindowsConfig,
}

/// A CLI argument definition.
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct CliArg {
	/// The short version of the argument, without the preceding -.
	///
	/// NOTE: Any leading `-` characters will be stripped, and only the first non-character will be used as the short version.
	#[type_def(type_of = "String")]
	pub short: Option<char>,
	/// The unique argument name
	pub name: String,
	/// The argument description which will be shown on the help information.
	/// Typically, this is a short (one line) description of the arg.
	pub description: Option<String>,
	/// The argument long description which will be shown on the help information.
	/// Typically this a more detailed (multi-line) message that describes the argument.
	#[serde(alias = "long-description")]
	pub long_description: Option<String>,
	/// Specifies that the argument takes a value at run time.
	///
	/// NOTE: values for arguments may be specified in any of the following methods
	/// - Using a space such as -o value or --option value
	/// - Using an equals and no space such as -o=value or --option=value
	/// - Use a short and no space such as -ovalue
	#[serde(default)]
	pub takes_value: bool,
	/// Specifies that the argument may have an unknown number of multiple values. Without any other settings, this argument may appear only once.
	///
	/// For example, --opt val1 val2 is allowed, but --opt val1 val2 --opt val3 is not.
	///
	/// NOTE: Setting this requires `takes_value` to be set to true.
	pub multiple: bool,
	/// Specifies that the argument may appear more than once.
	/// For flags, this results in the number of occurrences of the flag being recorded. For example -ddd or -d -d -d would count as three occurrences.
	/// For options or arguments that take a value, this does not affect how many values they can accept. (i.e. only one at a time is allowed)
	///
	/// For example, --opt val1 --opt val2 is allowed, but --opt val1 val2 is not.
	#[serde(default)]
	pub multiple_occurrences: bool,
	/// Specifies how many values are required to satisfy this argument. For example, if you had a
	/// `-f <file>` argument where you wanted exactly 3 'files' you would set
	/// `number_of_values = 3`, and this argument wouldn't be satisfied unless the user provided
	/// 3 and only 3 values.
	///
	/// **NOTE:** Does *not* require `multiple_occurrences = true` to be set. Setting
	/// `multiple_occurrences = true` would allow `-f <file> <file> <file> -f <file> <file> <file>` where
	/// as *not* setting it would only allow one occurrence of this argument.
	///
	/// **NOTE:** implicitly sets `takes_value = true` and `multiple_values = true`.
	#[serde(alias = "number-of-values")]
	pub number_of_values: Option<usize>,
	/// Specifies a list of possible values for this argument.
	/// At runtime, the CLI verifies that only one of the specified values was used, or fails with an error message.
	#[serde(alias = "possible-values")]
	pub possible_values: Option<Vec<String>>,
	/// Specifies the minimum number of values for this argument.
	/// For example, if you had a -f `<file>` argument where you wanted at least 2 'files',
	/// you would set `minValues: 2`, and this argument would be satisfied if the user provided, 2 or more values.
	#[serde(alias = "min-values")]
	pub min_values: Option<usize>,
	/// Specifies the maximum number of values are for this argument.
	/// For example, if you had a -f `<file>` argument where you wanted up to 3 'files',
	/// you would set .max_values(3), and this argument would be satisfied if the user provided, 1, 2, or 3 values.
	#[serde(alias = "max-values")]
	pub max_values: Option<usize>,
	/// Sets whether or not the argument is required by default.
	///
	/// - Required by default means it is required, when no other conflicting rules have been evaluated
	/// - Conflicting rules take precedence over being required.
	pub required: bool,
	/// Sets an arg that override this arg's required setting
	/// i.e. this arg will be required unless this other argument is present.
	#[serde(alias = "required-unless-present")]
	pub required_unless_present: Option<String>,
	/// Sets args that override this arg's required setting
	/// i.e. this arg will be required unless all these other arguments are present.
	#[serde(alias = "required-unless-present-all")]
	pub required_unless_present_all: Option<Vec<String>>,
	/// Sets args that override this arg's required setting
	/// i.e. this arg will be required unless at least one of these other arguments are present.
	#[serde(alias = "required-unless-present-any")]
	pub required_unless_present_any: Option<Vec<String>>,
	/// Sets a conflicting argument by name
	/// i.e. when using this argument, the following argument can't be present and vice versa.
	#[serde(alias = "conflicts-with")]
	pub conflicts_with: Option<String>,
	/// The same as conflictsWith but allows specifying multiple two-way conflicts per argument.
	#[serde(alias = "conflicts-with-all")]
	pub conflicts_with_all: Option<Vec<String>>,
	/// Tets an argument by name that is required when this one is present
	/// i.e. when using this argument, the following argument must be present.
	pub requires: Option<String>,
	/// Sts multiple arguments by names that are required when this one is present
	/// i.e. when using this argument, the following arguments must be present.
	#[serde(alias = "requires-all")]
	pub requires_all: Option<Vec<String>>,
	/// Allows a conditional requirement with the signature [arg, value]
	/// the requirement will only become valid if `arg`'s value equals `${value}`.
	#[serde(alias = "requires-if")]
	pub requires_if: Option<Vec<String>>,
	/// Allows specifying that an argument is required conditionally with the signature [arg, value]
	/// the requirement will only become valid if the `arg`'s value equals `${value}`.
	#[serde(alias = "requires-if-eq")]
	pub required_if_eq: Option<Vec<String>>,
	/// Requires that options use the --option=val syntax
	/// i.e. an equals between the option and associated value.
	#[serde(alias = "requires-equals")]
	pub require_equals: Option<bool>,
	/// The positional argument index, starting at 1.
	///
	/// The index refers to position according to other positional argument.
	/// It does not define position in the argument list as a whole. When utilized with multiple=true,
	/// only the last positional argument may be defined as multiple (i.e. the one with the highest index).
	#[cfg_attr(feature = "schema", validate(range(min = 1)))]
	pub index: Option<usize>,
}

/// describes a CLI configuration
///
/// See more: https://tauri.app/v1/api/config#cliconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct CliConfig {
	/// Command description which will be shown on the help information.
	pub description: Option<String>,
	/// Command long description which will be shown on the help information.
	#[serde(alias = "long-description")]
	pub long_description: Option<String>,
	/// Adds additional help information to be displayed in addition to auto-generated help.
	/// This information is displayed before the auto-generated help information.
	/// This is often used for header information.
	#[serde(alias = "before-help")]
	pub before_help: Option<String>,
	/// Adds additional help information to be displayed in addition to auto-generated help.
	/// This information is displayed after the auto-generated help information.
	/// This is often used to describe how to use the arguments, or caveats to be noted.
	#[serde(alias = "after-help")]
	pub after_help: Option<String>,
	/// List of arguments for the command
	pub args: Option<Vec<CliArg>>,
	/// List of subcommands of this command
	#[type_def(skip)]
	pub subcommands: Option<HashMap<String, CliConfig>>,
}

impl CliConfig {
	/// List of arguments for the command
	pub fn args(&self) -> Option<&Vec<CliArg>> {
		self.args.as_ref()
	}

	/// List of subcommands of this command
	pub fn subcommands(&self) -> Option<&HashMap<String, CliConfig>> {
		self.subcommands.as_ref()
	}

	/// Command description which will be shown on the help information.
	pub fn description(&self) -> Option<&String> {
		self.description.as_ref()
	}

	/// Command long description which will be shown on the help information.
	pub fn long_description(&self) -> Option<&String> {
		self.description.as_ref()
	}

	/// Adds additional help information to be displayed in addition to auto-generated help.
	/// This information is displayed before the auto-generated help information.
	/// This is often used for header information.
	pub fn before_help(&self) -> Option<&String> {
		self.before_help.as_ref()
	}

	/// Adds additional help information to be displayed in addition to auto-generated help.
	/// This information is displayed after the auto-generated help information.
	/// This is often used to describe how to use the arguments, or caveats to be noted.
	pub fn after_help(&self) -> Option<&String> {
		self.after_help.as_ref()
	}
}

/// System theme.
#[derive(Debug, Copy, Clone, PartialEq, Eq, TypeDef)]
#[non_exhaustive]
pub enum Theme {
	/// Light theme.
	Light,
	/// Dark theme.
	Dark,
}

impl Serialize for Theme {
	fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
	where
		S: Serializer,
	{
		serializer.serialize_str(self.to_string().as_ref())
	}
}

impl Display for Theme {
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
		write!(
			f,
			"{}",
			match self {
				Self::Light => "light",
				Self::Dark => "dark",
			}
		)
	}
}

/// How the window title bar should be displayed on macOS.
#[derive(Debug, Clone, PartialEq, Eq, TypeDef)]
pub enum TitleBarStyle {
	/// A normal title bar.
	Visible,
	/// Makes the title bar transparent, so the window background color is shown instead.
	///
	/// Useful if you don't need to have actual HTML under the title bar. This lets you avoid the caveats of using `TitleBarStyle::Overlay`. Will be more useful when Tauri lets you set a custom window background color.
	Transparent,
	/// Shows the title bar as a transparent overlay over the window's content.
	///
	/// Keep in mind:
	/// - The height of the title bar is different on different OS versions, which can lead to window the controls and title not being where you don't expect.
	/// - You need to define a custom drag region to make your window draggable, however due to a limitation you can't drag the window when it's not in focus <https://github.com/tauri-apps/tauri/issues/4316>.
	/// - The color of the window title depends on the system theme.
	Overlay,
}

impl Serialize for TitleBarStyle {
	fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
	where
		S: Serializer,
	{
		serializer.serialize_str(self.to_string().as_ref())
	}
}

impl Display for TitleBarStyle {
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
		write!(
			f,
			"{}",
			match self {
				Self::Visible => "Visible",
				Self::Transparent => "Transparent",
				Self::Overlay => "Overlay",
			}
		)
	}
}

/// The window configuration object.
///
/// See more: https://tauri.app/v1/api/config#windowconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WindowConfig {
	/// The window identifier. It must be alphanumeric.
	#[serde(default = "default_window_label")]
	pub label: String,
	/// The window webview URL.
	pub url: WindowUrl,
	/// The user agent for the webview
	#[serde(alias = "user-agent")]
	pub user_agent: Option<String>,
	/// Whether the file drop is enabled or not on the webview. By default it is enabled.
	///
	/// Disabling it is required to use drag and drop on the frontend on Windows.
	#[serde(default = "ser::default_true")]
	pub file_drop_enabled: bool,
	/// Whether or not the window starts centered or not.
	pub center: bool,
	/// The horizontal position of the window's top left corner
	pub x: Option<f64>,
	/// The vertical position of the window's top left corner
	pub y: Option<f64>,
	/// The window width.
	#[serde(default = "default_width")]
	pub width: f64,
	/// The window height.
	#[serde(default = "default_height")]
	pub height: f64,
	/// The min window width.
	#[serde(alias = "min-width")]
	pub min_width: Option<f64>,
	/// The min window height.
	#[serde(alias = "min-height")]
	pub min_height: Option<f64>,
	/// The max window width.
	#[serde(alias = "max-width")]
	pub max_width: Option<f64>,
	/// The max window height.
	#[serde(alias = "max-height")]
	pub max_height: Option<f64>,
	/// Whether the window is resizable or not. When resizable is set to false, native window's maximize button is automatically disabled.
	#[serde(default = "ser::default_true")]
	pub resizable: bool,
	/// Whether the window's native maximize button is enabled or not.
	/// If resizable is set to false, this setting is ignored.
	///
	/// ## Platform-specific
	///
	/// - **macOS:** Disables the "zoom" button in the window titlebar, which is also used to enter fullscreen mode.
	/// - **Linux / iOS / Android:** Unsupported.
	#[serde(default = "ser::default_true")]
	pub maximizable: bool,
	/// Whether the window's native minimize button is enabled or not.
	///
	/// ## Platform-specific
	///
	/// - **Linux / iOS / Android:** Unsupported.
	#[serde(default = "ser::default_true")]
	pub minimizable: bool,
	/// Whether the window's native close button is enabled or not.
	///
	/// ## Platform-specific
	///
	/// - **Linux:** "GTK+ will do its best to convince the window manager not to show a close button.
	///   Depending on the system, this function may not have any effect when called on a window that is already visible"
	/// - **iOS / Android:** Unsupported.
	#[serde(default = "ser::default_true")]
	pub closable: bool,
	/// The window title.
	#[serde(default = "default_title")]
	pub title: String,
	/// Whether the window starts as fullscreen or not.
	pub fullscreen: bool,
	/// Whether the window will be initially focused or not.
	#[serde(default = "ser::default_true")]
	pub focus: bool,
	/// Whether the window is transparent or not.
	///
	/// Note that on `macOS` this requires the `macos-private-api` feature flag, enabled under `tauri > macOSPrivateApi`.
	/// WARNING: Using private APIs on `macOS` prevents your application from being accepted to the `App Store`.
	pub transparent: bool,
	/// Whether the window is maximized or not.
	pub maximized: bool,
	/// Whether the window is visible or not.
	#[serde(default = "ser::default_true")]
	pub visible: bool,
	/// Whether the window should have borders and bars.
	#[serde(default = "ser::default_true")]
	pub decorations: bool,
	/// Whether the window should always be on top of other windows.
	#[serde(default)]
	pub always_on_top: bool,
	/// Prevents the window contents from being captured by other apps.
	#[serde(default)]
	pub content_protected: bool,
	/// If `true`, hides the window icon from the taskbar on Windows and Linux.
	#[serde(default)]
	pub skip_taskbar: bool,
	/// The initial window theme. Defaults to the system theme. Only implemented on Windows and macOS 10.14+.
	pub theme: Option<Theme>,
	/// The style of the macOS title bar.
	#[serde(default)]
	pub title_bar_style: TitleBarStyle,
	/// If `true`, sets the window title to be hidden on macOS.
	#[serde(default)]
	pub hidden_title: bool,
	/// Whether clicking an inactive window also clicks through to the webview on macOS.
	#[serde(default)]
	pub accept_first_mouse: bool,
	/// Defines the window [tabbing identifier] for macOS.
	///
	/// Windows with matching tabbing identifiers will be grouped together.
	/// If the tabbing identifier is not set, automatic tabbing will be disabled.
	///
	/// [tabbing identifier]: <https://developer.apple.com/documentation/appkit/nswindow/1644704-tabbingidentifier>
	#[serde(default)]
	pub tabbing_identifier: Option<String>,
	/// Defines additional browser arguments on Windows. By default wry passes `--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection`
	/// so if you use this method, you also need to disable these components by yourself if you want.
	#[serde(default)]
	pub additional_browser_args: Option<String>,
}

/// A Content-Security-Policy directive source list.
/// See <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#sources>.
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", untagged)]
pub enum CspDirectiveSources {
	/// An inline list of CSP sources. Same as [`Self::List`], but concatenated with a space separator.
	Inline(String),
	/// A list of CSP sources. The collection will be concatenated with a space separator for the CSP string.
	List(Vec<String>),
}

/// A Content-Security-Policy definition.
/// See <https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP>.
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", untagged)]
pub enum Csp {
	/// The entire CSP policy in a single text string.
	Policy(String),
	/// An object mapping a directive with its sources values as a list of strings.
	DirectiveMap(HashMap<String, CspDirectiveSources>),
}

/// The possible values for the `dangerous_disable_asset_csp_modification` config option.
#[derive(Serialize, TypeDef)]
#[serde(untagged)]
pub enum DisabledCspModificationKind {
	/// If `true`, disables all CSP modification.
	/// `false` is the default value and it configures Tauri to control the CSP.
	Flag(bool),
	/// Disables the given list of CSP directives modifications.
	List(Vec<String>),
}

/// External command access definition.
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct RemoteDomainAccessScope {
	/// The URL scheme to allow. By default, all schemas are allowed.
	pub scheme: Option<String>,
	/// The domain to allow.
	pub domain: String,
	/// The list of window labels this scope applies to.
	pub windows: Vec<String>,
	/// The list of plugins that are allowed in this scope.
	pub plugins: Vec<String>,
	/// Enables access to the Tauri API.
	#[serde(default, rename = "enableTauriAPI")]
	pub enable_tauri_api: bool,
}

/// Security configuration.
///
/// See more: https://tauri.app/v1/api/config#securityconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct SecurityConfig {
	/// The Content Security Policy that will be injected on all HTML files on the built application.
	/// If [`dev_csp`](#SecurityConfig.devCsp) is not specified, this value is also injected on dev.
	///
	/// This is a really important part of the configuration since it helps you ensure your WebView is secured.
	/// See <https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP>.
	pub csp: Option<Csp>,
	/// The Content Security Policy that will be injected on all HTML files on development.
	///
	/// This is a really important part of the configuration since it helps you ensure your WebView is secured.
	/// See <https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP>.
	#[serde(alias = "dev-csp")]
	pub dev_csp: Option<Csp>,
	/// Freeze the `Object.prototype` when using the custom protocol.
	#[serde(default)]
	pub freeze_prototype: bool,
	/// Disables the Tauri-injected CSP sources.
	///
	/// At compile time, Tauri parses all the frontend assets and changes the Content-Security-Policy
	/// to only allow loading of your own scripts and styles by injecting nonce and hash sources.
	/// This stricts your CSP, which may introduce issues when using along with other flexing sources.
	///
	/// This configuration option allows both a boolean and a list of strings as value.
	/// A boolean instructs Tauri to disable the injection for all CSP injections,
	/// and a list of strings indicates the CSP directives that Tauri cannot inject.
	///
	/// **WARNING:** Only disable this if you know what you are doing and have properly configured the CSP.
	/// Your application might be vulnerable to XSS attacks without this Tauri protection.
	#[serde(default)]
	pub dangerous_disable_asset_csp_modification: DisabledCspModificationKind,
	/// Allow external domains to send command to Tauri.
	///
	/// By default, external domains do not have access to `window.__TAURI__`, which means they cannot
	/// communicate with the commands defined in Rust. This prevents attacks where an externally
	/// loaded malicious or compromised sites could start executing commands on the user's device.
	///
	/// This configuration allows a set of external domains to have access to the Tauri commands.
	/// When you configure a domain to be allowed to access the IPC, all subpaths are allowed. Subdomains are not allowed.
	///
	/// **WARNING:** Only use this option if you either have internal checks against malicious
	/// external sites or you can trust the allowed external sites. You application might be
	/// vulnerable to dangerous Tauri command related attacks otherwise.
	#[serde(default)]
	pub dangerous_remote_domain_ipc_access: Vec<RemoteDomainAccessScope>,
}

/// Filesystem scope definition.
/// It is a list of glob patterns that restrict the API access from the webview.
///
/// Each pattern can start with a variable that resolves to a system base directory.
/// The variables are: `$AUDIO`, `$CACHE`, `$CONFIG`, `$DATA`, `$LOCALDATA`, `$DESKTOP`,
/// `$DOCUMENT`, `$DOWNLOAD`, `$EXE`, `$FONT`, `$HOME`, `$PICTURE`, `$PUBLIC`, `$RUNTIME`,
/// `$TEMPLATE`, `$VIDEO`, `$RESOURCE`, `$APP`, `$LOG`, `$TEMP`, `$APPCONFIG`, `$APPDATA`,
/// `$APPLOCALDATA`, `$APPCACHE`, `$APPLOG`.
#[derive(Serialize, TypeDef)]
#[serde(untagged)]
pub enum FsAllowlistScope {
	/// A list of paths that are allowed by this scope.
	AllowedPaths(Vec<PathBuf>),
	/// A complete scope configuration.
	#[serde(rename_all = "camelCase")]
	Scope {
		/// A list of paths that are allowed by this scope.
		allow: Vec<PathBuf>,
		/// A list of paths that are not allowed by this scope.
		/// This gets precedence over the [`Self::Scope::allow`] list.
		deny: Vec<PathBuf>,
		/// Whether or not paths that contain components that start with a `.`
		/// will require that `.` appears literally in the pattern; `*`, `?`, `**`,
		/// or `[...]` will not match. This is useful because such files are
		/// conventionally considered hidden on Unix systems and it might be
		/// desirable to skip them when listing files.
		///
		/// Defaults to `false` on Unix systems and `true` on Windows
		// dotfiles are not supposed to be exposed by default on unix
		#[serde(alias = "require-literal-leading-dot")]
		require_literal_leading_dot: Option<bool>,
	},
}

impl FsAllowlistScope {
	/// The list of allowed paths.
	pub fn allowed_paths(&self) -> &Vec<PathBuf> {
		match self {
			Self::AllowedPaths(p) => p,
			Self::Scope { allow, .. } => allow,
		}
	}

	/// The list of forbidden paths.
	pub fn forbidden_paths(&self) -> Option<&Vec<PathBuf>> {
		match self {
			Self::AllowedPaths(_) => None,
			Self::Scope { deny, .. } => Some(deny),
		}
	}
}

/// Allowlist for the file system APIs.
///
/// See more: https://tauri.app/v1/api/config#fsallowlistconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct FsAllowlistConfig {
	/// The access scope for the filesystem APIs.
	pub scope: FsAllowlistScope,
	/// Use this flag to enable all file system API features.
	pub all: bool,
	/// Read file from local filesystem.
	#[serde(default)]
	pub read_file: bool,
	/// Write file to local filesystem.
	#[serde(default)]
	pub write_file: bool,
	/// Read directory from local filesystem.
	#[serde(default)]
	pub read_dir: bool,
	/// Copy file from local filesystem.
	#[serde(default)]
	pub copy_file: bool,
	/// Create directory from local filesystem.
	#[serde(default)]
	pub create_dir: bool,
	/// Remove directory from local filesystem.
	#[serde(default)]
	pub remove_dir: bool,
	/// Remove file from local filesystem.
	#[serde(default)]
	pub remove_file: bool,
	/// Rename file from local filesystem.
	#[serde(default)]
	pub rename_file: bool,
	/// Check if path exists on the local filesystem.
	pub exists: bool,
}

/// Allowlist for the window APIs.
///
/// See more: https://tauri.app/v1/api/config#windowallowlistconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WindowAllowlistConfig {
	/// Use this flag to enable all window API features.
	pub all: bool,
	/// Allows dynamic window creation.
	pub create: bool,
	/// Allows centering the window.
	pub center: bool,
	/// Allows requesting user attention on the window.
	#[serde(default)]
	pub request_user_attention: bool,
	/// Allows setting the resizable flag of the window.
	#[serde(default)]
	pub set_resizable: bool,
	/// Allows setting whether the window's native maximize button is enabled or not.
	#[serde(default)]
	pub set_maximizable: bool,
	/// Allows setting whether the window's native minimize button is enabled or not.
	#[serde(default)]
	pub set_minimizable: bool,
	/// Allows setting whether the window's native close button is enabled or not.
	#[serde(default)]
	pub set_closable: bool,
	/// Allows changing the window title.
	#[serde(default)]
	pub set_title: bool,
	/// Allows maximizing the window.
	pub maximize: bool,
	/// Allows unmaximizing the window.
	pub unmaximize: bool,
	/// Allows minimizing the window.
	pub minimize: bool,
	/// Allows unminimizing the window.
	pub unminimize: bool,
	/// Allows showing the window.
	pub show: bool,
	/// Allows hiding the window.
	pub hide: bool,
	/// Allows closing the window.
	pub close: bool,
	/// Allows setting the decorations flag of the window.
	#[serde(default)]
	pub set_decorations: bool,
	/// Allows setting the always_on_top flag of the window.
	#[serde(default)]
	pub set_always_on_top: bool,
	/// Allows preventing the window contents from being captured by other apps.
	#[serde(default)]
	pub set_content_protected: bool,
	/// Allows setting the window size.
	#[serde(default)]
	pub set_size: bool,
	/// Allows setting the window minimum size.
	#[serde(default)]
	pub set_min_size: bool,
	/// Allows setting the window maximum size.
	#[serde(default)]
	pub set_max_size: bool,
	/// Allows changing the position of the window.
	#[serde(default)]
	pub set_position: bool,
	/// Allows setting the fullscreen flag of the window.
	#[serde(default)]
	pub set_fullscreen: bool,
	/// Allows focusing the window.
	#[serde(default)]
	pub set_focus: bool,
	/// Allows changing the window icon.
	#[serde(default)]
	pub set_icon: bool,
	/// Allows setting the skip_taskbar flag of the window.
	#[serde(default)]
	pub set_skip_taskbar: bool,
	/// Allows grabbing the cursor.
	#[serde(default)]
	pub set_cursor_grab: bool,
	/// Allows setting the cursor visibility.
	#[serde(default)]
	pub set_cursor_visible: bool,
	/// Allows changing the cursor icon.
	#[serde(default)]
	pub set_cursor_icon: bool,
	/// Allows setting the cursor position.
	#[serde(default)]
	pub set_cursor_position: bool,
	/// Allows ignoring cursor events.
	#[serde(default)]
	pub set_ignore_cursor_events: bool,
	/// Allows start dragging on the window.
	#[serde(default)]
	pub start_dragging: bool,
	/// Allows opening the system dialog to print the window content.
	pub print: bool,
}

/// A command allowed to be executed by the webview API.
#[derive(Serialize, TypeDef)]
pub struct ShellAllowedCommand {
	/// The name for this allowed shell command configuration.
	///
	/// This name will be used inside of the webview API to call this command along with
	/// any specified arguments.
	pub name: String,

	/// The command name.
	/// It can start with a variable that resolves to a system base directory.
	/// The variables are: `$AUDIO`, `$CACHE`, `$CONFIG`, `$DATA`, `$LOCALDATA`, `$DESKTOP`,
	/// `$DOCUMENT`, `$DOWNLOAD`, `$EXE`, `$FONT`, `$HOME`, `$PICTURE`, `$PUBLIC`, `$RUNTIME`,
	/// `$TEMPLATE`, `$VIDEO`, `$RESOURCE`, `$APP`, `$LOG`, `$TEMP`, `$APPCONFIG`, `$APPDATA`,
	/// `$APPLOCALDATA`, `$APPCACHE`, `$APPLOG`.
	#[serde(rename = "cmd")] // use default just so the schema doesn't flag it as required
	pub command: PathBuf,

	/// The allowed arguments for the command execution.
	pub args: ShellAllowedArgs,

	/// If this command is a sidecar command.
	pub sidecar: bool,
}

/// A set of command arguments allowed to be executed by the webview API.
///
/// A value of `true` will allow any arguments to be passed to the command. `false` will disable all
/// arguments. A list of [`ShellAllowedArg`] will set those arguments as the only valid arguments to
/// be passed to the attached command configuration.
#[derive(Serialize, TypeDef)]
#[serde(untagged, deny_unknown_fields)]
#[non_exhaustive]
pub enum ShellAllowedArgs {
	/// Use a simple boolean to allow all or disable all arguments to this command configuration.
	Flag(bool),

	/// A specific set of [`ShellAllowedArg`] that are valid to call for the command configuration.
	List(Vec<ShellAllowedArg>),
}

/// A command argument allowed to be executed by the webview API.
#[derive(Serialize, TypeDef)]
#[serde(untagged, deny_unknown_fields)]
#[non_exhaustive]
pub enum ShellAllowedArg {
	/// A non-configurable argument that is passed to the command in the order it was specified.
	Fixed(String),

	/// A variable that is set while calling the command from the webview API.
	///
	Var {
		/// [regex] validator to require passed values to conform to an expected input.
		///
		/// This will require the argument value passed to this variable to match the `validator` regex
		/// before it will be executed.
		///
		/// [regex]: https://docs.rs/regex/latest/regex/#syntax
		validator: String,
	},
}

/// Shell scope definition.
/// It is a list of command names and associated CLI arguments that restrict the API access from the webview.
#[derive(Serialize, TypeDef)]
pub struct ShellAllowlistScope(pub Vec<ShellAllowedCommand>);

/// Defines the `shell > open` api scope.
#[derive(Serialize, TypeDef)]
#[serde(untagged, deny_unknown_fields)]
#[non_exhaustive]
pub enum ShellAllowlistOpen {
	/// If the shell open API should be enabled.
	///
	/// If enabled, the default validation regex (`^((mailto:\w+)|(tel:\w+)|(https?://\w+)).+`) is used.
	Flag(bool),

	/// Enable the shell open API, with a custom regex that the opened path must match against.
	///
	/// If using a custom regex to support a non-http(s) schema, care should be used to prevent values
	/// that allow flag-like strings to pass validation. e.g. `--enable-debugging`, `-i`, `/R`.
	Validate(String),
}

/// Allowlist for the shell APIs.
///
/// See more: https://tauri.app/v1/api/config#shellallowlistconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ShellAllowlistConfig {
	/// Access scope for the binary execution APIs.
	/// Sidecars are automatically enabled.
	pub scope: ShellAllowlistScope,
	/// Use this flag to enable all shell API features.
	pub all: bool,
	/// Enable binary execution.
	pub execute: bool,
	/// Enable sidecar execution, allowing the JavaScript layer to spawn a sidecar command,
	/// an executable that is shipped with the application.
	/// For more information see <https://tauri.app/v1/guides/building/sidecar>.
	pub sidecar: bool,
	/// Open URL with the user's default application.
	pub open: ShellAllowlistOpen,
}

/// Allowlist for the dialog APIs.
///
/// See more: https://tauri.app/v1/api/config#dialogallowlistconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct DialogAllowlistConfig {
	/// Use this flag to enable all dialog API features.
	pub all: bool,
	/// Allows the API to open a dialog window to pick files.
	pub open: bool,
	/// Allows the API to open a dialog window to pick where to save files.
	pub save: bool,
	/// Allows the API to show a message dialog window.
	pub message: bool,
	/// Allows the API to show a dialog window with Yes/No buttons.
	pub ask: bool,
	/// Allows the API to show a dialog window with Ok/Cancel buttons.
	pub confirm: bool,
}

/// HTTP API scope definition.
/// It is a list of URLs that can be accessed by the webview when using the HTTP APIs.
/// The scoped URL is matched against the request URL using a glob pattern.
///
/// Examples:
/// - "https://*": allows all HTTPS urls
/// - "https://*.github.com/tauri-apps/tauri": allows any subdomain of "github.com" with the "tauri-apps/api" path
/// - "https://myapi.service.com/users/*": allows access to any URLs that begins with "https://myapi.service.com/users/"
#[allow(rustdoc::bare_urls)]
#[derive(Serialize, TypeDef)]
// TODO: in v2, parse into a String or a custom type that perserves the
// glob string because Url type will add a trailing slash
pub struct HttpAllowlistScope(pub Vec<String>);

/// Allowlist for the HTTP APIs.
///
/// See more: https://tauri.app/v1/api/config#httpallowlistconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct HttpAllowlistConfig {
	/// The access scope for the HTTP APIs.
	pub scope: HttpAllowlistScope,
	/// Use this flag to enable all HTTP API features.
	pub all: bool,
	/// Allows making HTTP requests.
	pub request: bool,
}

/// Allowlist for the notification APIs.
///
/// See more: https://tauri.app/v1/api/config#notificationallowlistconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct NotificationAllowlistConfig {
	/// Use this flag to enable all notification API features.
	pub all: bool,
}

/// Allowlist for the global shortcut APIs.
///
/// See more: https://tauri.app/v1/api/config#globalshortcutallowlistconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct GlobalShortcutAllowlistConfig {
	/// Use this flag to enable all global shortcut API features.
	pub all: bool,
}

/// Allowlist for the OS APIs.
///
/// See more: https://tauri.app/v1/api/config#osallowlistconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct OsAllowlistConfig {
	/// Use this flag to enable all OS API features.
	pub all: bool,
}

/// Allowlist for the path APIs.
///
/// See more: https://tauri.app/v1/api/config#pathallowlistconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct PathAllowlistConfig {
	/// Use this flag to enable all path API features.
	pub all: bool,
}

/// Allowlist for the custom protocols.
///
/// See more: https://tauri.app/v1/api/config#protocolallowlistconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProtocolAllowlistConfig {
	/// The access scope for the asset protocol.
	#[serde(default)]
	pub asset_scope: FsAllowlistScope,
	/// Use this flag to enable all custom protocols.
	pub all: bool,
	/// Enables the asset protocol.
	pub asset: bool,
}

/// Allowlist for the process APIs.
///
/// See more: https://tauri.app/v1/api/config#processallowlistconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProcessAllowlistConfig {
	/// Use this flag to enable all process APIs.
	pub all: bool,
	/// Enables the relaunch API.
	pub relaunch: bool,
	/// Dangerous option that allows macOS to relaunch even if the binary contains a symlink.
	///
	/// This is due to macOS having less symlink protection. Highly recommended to not set this flag
	/// unless you have a very specific reason too, and understand the implications of it.
	pub relaunch_dangerous_allow_symlink_macos: bool,
	/// Enables the exit API.
	pub exit: bool,
}
/// Allowlist for the clipboard APIs.
///
/// See more: https://tauri.app/v1/api/config#clipboardallowlistconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ClipboardAllowlistConfig {
	/// Use this flag to enable all clipboard APIs.
	pub all: bool,
	/// Enables the clipboard's `writeText` API.
	#[serde(default)]
	pub write_text: bool,
	/// Enables the clipboard's `readText` API.
	#[serde(default)]
	pub read_text: bool,
}

/// Allowlist for the app APIs.
///
/// See more: https://tauri.app/v1/api/config#appallowlistconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AppAllowlistConfig {
	/// Use this flag to enable all app APIs.
	pub all: bool,
	/// Enables the app's `show` API.
	pub show: bool,
	/// Enables the app's `hide` API.
	pub hide: bool,
}

/// Allowlist configuration. The allowlist is a translation of the [Cargo allowlist features](https://docs.rs/tauri/latest/tauri/#cargo-allowlist-features).
///
/// # Notes
///
/// - Endpoints that don't have their own allowlist option are enabled by default.
/// - There is only "opt-in", no "opt-out". Setting an option to `false` has no effect.
///
/// # Examples
///
/// - * [`"app-all": true`](https://tauri.app/v1/api/config/#appallowlistconfig.all) will make the [hide](https://tauri.app/v1/api/js/app#hide) endpoint be available regardless of whether `hide` is set to `false` or `true` in the allowlist.
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AllowlistConfig {
	/// Use this flag to enable all API features.
	pub all: bool,
	/// File system API allowlist.
	pub fs: FsAllowlistConfig,
	/// Window API allowlist.
	pub window: WindowAllowlistConfig,
	/// Shell API allowlist.
	pub shell: ShellAllowlistConfig,
	/// Dialog API allowlist.
	pub dialog: DialogAllowlistConfig,
	/// HTTP API allowlist.
	pub http: HttpAllowlistConfig,
	/// Notification API allowlist.
	pub notification: NotificationAllowlistConfig,
	/// Global shortcut API allowlist.
	#[serde(default)]
	pub global_shortcut: GlobalShortcutAllowlistConfig,
	/// OS allowlist.
	pub os: OsAllowlistConfig,
	/// Path API allowlist.
	pub path: PathAllowlistConfig,
	/// Custom protocol allowlist.
	pub protocol: ProtocolAllowlistConfig,
	/// Process API allowlist.
	pub process: ProcessAllowlistConfig,
	/// Clipboard APIs allowlist.
	pub clipboard: ClipboardAllowlistConfig,
	/// App APIs allowlist.
	pub app: AppAllowlistConfig,
}

/// The application pattern.
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "lowercase", tag = "use", content = "options")]
pub enum PatternKind {
	/// Brownfield pattern.
	Brownfield,
	/// Isolation pattern. Recommended for security purposes.
	Isolation {
		/// The dir containing the index.html file that contains the secure isolation application.
		dir: PathBuf,
	},
}

/// The Tauri configuration object.
///
/// See more: https://tauri.app/v1/api/config#tauriconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct TauriConfig {
	/// The pattern to use.
	pub pattern: PatternKind,
	/// The windows configuration.
	pub windows: Vec<WindowConfig>,
	/// The CLI configuration.
	pub cli: Option<CliConfig>,
	/// The bundler configuration.
	pub bundle: BundleConfig,
	/// The allowlist configuration.
	pub allowlist: AllowlistConfig,
	/// Security configuration.
	pub security: SecurityConfig,
	/// The updater configuration.
	pub updater: UpdaterConfig,
	/// Configuration for app system tray.
	#[serde(alias = "system-tray")]
	pub system_tray: Option<SystemTrayConfig>,
	/// MacOS private API configuration. Enables the transparent background API and sets the `fullScreenEnabled` preference to `true`.
	#[serde(rename = "macOSPrivateApi")]
	pub macos_private_api: bool,
}

/// A URL to an updater server.
///
/// The URL must use the `https` scheme on production.
#[derive(Serialize, TypeDef)]
pub struct UpdaterEndpoint(pub String);

impl std::fmt::Display for UpdaterEndpoint {
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
		write!(f, "{}", self.0)
	}
}

/// Install modes for the Windows update.
#[derive(TypeDef)]
pub enum WindowsUpdateInstallMode {
	/// Specifies there's a basic UI during the installation process, including a final dialog box at the end.
	BasicUi,
	/// The quiet mode means there's no user interaction required.
	/// Requires admin privileges if the installer does.
	Quiet,
	/// Specifies unattended mode, which means the installation only shows a progress bar.
	Passive,
	// to add more modes, we need to check if the updater relaunch makes sense
	// i.e. for a full UI mode, the user can also mark the installer to start the app
}

impl Display for WindowsUpdateInstallMode {
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
		write!(
			f,
			"{}",
			match self {
				Self::BasicUi => "basicUI",
				Self::Quiet => "quiet",
				Self::Passive => "passive",
			}
		)
	}
}

impl Serialize for WindowsUpdateInstallMode {
	fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
	where
		S: Serializer,
	{
		serializer.serialize_str(self.to_string().as_ref())
	}
}

/// The updater configuration for Windows.
///
/// See more: https://tauri.app/v1/api/config#updaterwindowsconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct UpdaterWindowsConfig {
	/// Additional arguments given to the NSIS or WiX installer.
	pub installer_args: Vec<String>,
	/// The installation mode for the update on Windows. Defaults to `passive`.
	pub install_mode: WindowsUpdateInstallMode,
}

/// The Updater configuration object.
///
/// See more: https://tauri.app/v1/api/config#updaterconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct UpdaterConfig {
	/// Whether the updater is active or not.
	pub active: bool,
	/// Display built-in dialog or use event system if disabled.
	#[serde(default = "ser::default_true")]
	pub dialog: bool,
	/// The updater endpoints. TLS is enforced on production.
	///
	/// The updater URL can contain the following variables:
	/// - {{current_version}}: The version of the app that is requesting the update
	/// - {{target}}: The operating system name (one of `linux`, `windows` or `darwin`).
	/// - {{arch}}: The architecture of the machine (one of `x86_64`, `i686`, `aarch64` or `armv7`).
	///
	/// # Examples
	/// - "https://my.cdn.com/latest.json": a raw JSON endpoint that returns the latest version and download links for each platform.
	/// - "https://updates.app.dev/{{target}}?version={{current_version}}&arch={{arch}}": a dedicated API with positional and query string arguments.
	#[allow(rustdoc::bare_urls)]
	pub endpoints: Option<Vec<UpdaterEndpoint>>,
	/// Signature public key.
	#[serde(default)] // use default just so the schema doesn't flag it as required
	pub pubkey: String,
	/// The Windows configuration for the updater.
	pub windows: UpdaterWindowsConfig,
}

/// Configuration for application system tray icon.
///
/// See more: https://tauri.app/v1/api/config#systemtrayconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct SystemTrayConfig {
	/// Path to the default icon to use on the system tray.
	#[serde(alias = "icon-path")]
	pub icon_path: PathBuf,
	/// A Boolean value that determines whether the image represents a [template](https://developer.apple.com/documentation/appkit/nsimage/1520017-template?language=objc) image on macOS.
	#[serde(default)]
	pub icon_as_template: bool,
	/// A Boolean value that determines whether the menu should appear when the tray icon receives a left click on macOS.
	#[serde(default = "ser::default_true")]
	pub menu_on_left_click: bool,
	/// Title for MacOS tray
	pub title: Option<String>,
}

/// Defines the URL or assets to embed in the application.
#[derive(Serialize, TypeDef)]
#[serde(untagged, deny_unknown_fields)]
#[non_exhaustive]
pub enum AppUrl {
	/// The app's external URL, or the path to the directory containing the app assets.
	Url(WindowUrl),
	/// An array of files to embed on the app.
	Files(Vec<PathBuf>),
}

/// Describes the shell command to run before `tauri dev`.
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", untagged)]
pub enum BeforeDevCommand {
	/// Run the given script with the default options.
	Script(String),
	/// Run the given script with custom options.
	ScriptWithOptions {
		/// The script to execute.
		script: String,
		/// The current working directory.
		cwd: Option<String>,
		/// Whether `tauri dev` should wait for the command to finish or not. Defaults to `false`.
		wait: bool,
	},
}

/// Describes a shell command to be executed when a CLI hook is triggered.
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", untagged)]
pub enum HookCommand {
	/// Run the given script with the default options.
	Script(String),
	/// Run the given script with custom options.
	ScriptWithOptions {
		/// The script to execute.
		script: String,
		/// The current working directory.
		cwd: Option<String>,
	},
}

/// The Build configuration object.
///
/// See more: https://tauri.app/v1/api/config#buildconfig
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct BuildConfig {
	/// The binary used to build and run the application.
	pub runner: Option<String>,
	/// The path to the application assets or URL to load in development.
	///
	/// This is usually an URL to a dev server, which serves your application assets
	/// with live reloading. Most modern JavaScript bundlers provides a way to start a dev server by default.
	///
	/// See [vite](https://vitejs.dev/guide/), [Webpack DevServer](https://webpack.js.org/configuration/dev-server/) and [sirv](https://github.com/lukeed/sirv)
	/// for examples on how to set up a dev server.
	#[serde(default = "default_dev_path")]
	pub dev_path: AppUrl,
	/// The path to the application assets or URL to load in production.
	///
	/// When a path relative to the configuration file is provided,
	/// it is read recursively and all files are embedded in the application binary.
	/// Tauri then looks for an `index.html` file unless you provide a custom window URL.
	///
	/// You can also provide a list of paths to be embedded, which allows granular control over what files are added to the binary.
	/// In this case, all files are added to the root and you must reference it that way in your HTML files.
	///
	/// When an URL is provided, the application won't have bundled assets
	/// and the application will load that URL by default.
	#[serde(default = "default_dist_dir")]
	pub dist_dir: AppUrl,
	/// A shell command to run before `tauri dev` kicks in.
	///
	/// The TAURI_PLATFORM, TAURI_ARCH, TAURI_FAMILY, TAURI_PLATFORM_VERSION, TAURI_PLATFORM_TYPE and TAURI_DEBUG environment variables are set if you perform conditional compilation.
	#[serde(alias = "before-dev-command")]
	pub before_dev_command: Option<BeforeDevCommand>,
	/// A shell command to run before `tauri build` kicks in.
	///
	/// The TAURI_PLATFORM, TAURI_ARCH, TAURI_FAMILY, TAURI_PLATFORM_VERSION, TAURI_PLATFORM_TYPE and TAURI_DEBUG environment variables are set if you perform conditional compilation.
	#[serde(alias = "before-build-command")]
	pub before_build_command: Option<HookCommand>,
	/// A shell command to run before the bundling phase in `tauri build` kicks in.
	///
	/// The TAURI_PLATFORM, TAURI_ARCH, TAURI_FAMILY, TAURI_PLATFORM_VERSION, TAURI_PLATFORM_TYPE and TAURI_DEBUG environment variables are set if you perform conditional compilation.
	#[serde(alias = "before-bundle-command")]
	pub before_bundle_command: Option<HookCommand>,
	/// Features passed to `cargo` commands.
	pub features: Option<Vec<String>>,
	/// Whether we should inject the Tauri API on `window.__TAURI__` or not.
	#[serde(default)]
	pub with_global_tauri: bool,
}

#[derive(Debug, PartialEq, Eq)]
struct PackageVersion(String);

/// The package configuration.
///
/// See more: https://tauri.app/v1/api/config#packageconfig
#[derive(Debug, Clone, PartialEq, Eq, Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct PackageConfig {
	/// App name.
	#[serde(alias = "product-name")]
	pub product_name: Option<String>,
	/// App version. It is a semver version number or a path to a `package.json` file containing the `version` field. If removed the version number from `Cargo.toml` is used.
	pub version: Option<String>,
}

/// The Tauri configuration object.
/// It is read from a file where you can define your frontend assets,
/// configure the bundler, enable the app updater, define a system tray,
/// enable APIs via the allowlist and more.
///
/// The configuration file is generated by the
/// [`tauri init`](https://tauri.app/v1/api/cli#init) command that lives in
/// your Tauri application source directory (src-tauri).
///
/// Once generated, you may modify it at will to customize your Tauri application.
///
/// ## File Formats
///
/// By default, the configuration is defined as a JSON file named `tauri.conf.json`.
///
/// Tauri also supports JSON5 and TOML files via the `config-json5` and `config-toml` Cargo features, respectively.
/// The JSON5 file name must be either `tauri.conf.json` or `tauri.conf.json5`.
/// The TOML file name is `Tauri.toml`.
///
/// ## Platform-Specific Configuration
///
/// In addition to the default configuration file, Tauri can
/// read a platform-specific configuration from `tauri.linux.conf.json`,
/// `tauri.windows.conf.json`, and `tauri.macos.conf.json`
/// (or `Tauri.linux.toml`, `Tauri.windows.toml` and `Tauri.macos.toml` if the `Tauri.toml` format is used),
/// which gets merged with the main configuration object.
///
/// ## Configuration Structure
///
/// The configuration is composed of the following objects:
///
/// - [`package`](#packageconfig): Package settings
/// - [`tauri`](#tauriconfig): The Tauri config
/// - [`build`](#buildconfig): The build configuration
/// - [`plugins`](#pluginconfig): The plugins config
///
/// ```json title="Example tauri.config.json file"
/// {
///   "build": {
///     "beforeBuildCommand": "",
///     "beforeDevCommand": "",
///     "devPath": "../dist",
///     "distDir": "../dist"
///   },
///   "package": {
///     "productName": "tauri-app",
///     "version": "0.1.0"
///   },
///   "tauri": {
///     "allowlist": {
///       "all": true
///     },
///     "bundle": {},
///     "security": {
///       "csp": null
///     },
///     "updater": {
///       "active": false
///     },
///     "windows": [
///       {
///         "fullscreen": false,
///         "height": 600,
///         "resizable": true,
///         "title": "Tauri App",
///         "width": 800
///       }
///     ]
///   }
/// }
/// ```
#[derive(Serialize, TypeDef)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Config {
	/// Package settings.
	pub package: PackageConfig,
	/// The Tauri configuration.
	pub tauri: TauriConfig,
	/// The build configuration.
	#[serde(default = "default_build")]
	pub build: BuildConfig,
	/// The plugins config.
	pub plugins: PluginConfig,
}

/// The plugin configs holds a HashMap mapping a plugin name to its configuration object.
///
/// See more: https://tauri.app/v1/api/config#pluginconfig
#[derive(Debug, Clone, PartialEq, Eq, Serialize, TypeDef)]
pub struct PluginConfig(pub HashMap<String, serde_json::Value>);

impl From<tauri::Theme> for Theme {
	fn from(value: tauri::Theme) -> Self {
		match value {
			tauri::Theme::Light => Self::Light,
			tauri::Theme::Dark => Self::Dark,
			_ => unreachable!(),
		}
	}
}
impl From<tauri::TitleBarStyle> for TitleBarStyle {
	fn from(value: tauri::TitleBarStyle) -> Self {
		match value {
			tauri::TitleBarStyle::Visible => TitleBarStyle::Visible,
			tauri::TitleBarStyle::Transparent => TitleBarStyle::Transparent,
			tauri::TitleBarStyle::Overlay => TitleBarStyle::Overlay,
		}
	}
}

impl From<tauri_config::PackageConfig> for PackageConfig {
	fn from(value: tauri_config::PackageConfig) -> Self {
		let tauri_config::PackageConfig { product_name, version } = value;
		PackageConfig { product_name, version }
	}
}

impl From<tauri_config::WindowUrl> for WindowUrl {
	fn from(value: tauri_config::WindowUrl) -> Self {
		match value {
			tauri::WindowUrl::External(external) => WindowUrl::External(external.to_string()),
			tauri::WindowUrl::App(app) => WindowUrl::App(app),
			_ => unreachable!(),
		}
	}
}

impl From<tauri_config::PatternKind> for PatternKind {
	fn from(value: tauri_config::PatternKind) -> Self {
		match value {
			tauri_config::PatternKind::Brownfield => PatternKind::Brownfield,
			tauri_config::PatternKind::Isolation { dir } => PatternKind::Isolation { dir },
		}
	}
}

impl From<tauri_config::WindowConfig> for WindowConfig {
	fn from(value: tauri_config::WindowConfig) -> Self {
		let tauri_config::WindowConfig {
			label,
			url,
			user_agent,
			file_drop_enabled,
			center,
			x,
			y,
			width,
			height,
			min_width,
			min_height,
			max_width,
			max_height,
			resizable,
			maximizable,
			minimizable,
			closable,
			title,
			fullscreen,
			focus,
			transparent,
			maximized,
			visible,
			decorations,
			always_on_top,
			content_protected,
			skip_taskbar,
			theme,
			title_bar_style,
			hidden_title,
			accept_first_mouse,
			tabbing_identifier,
			additional_browser_args,
		} = value;

		WindowConfig {
			label,
			url: url.into(),
			user_agent,
			file_drop_enabled,
			center,
			x,
			y,
			width,
			height,
			min_width,
			min_height,
			max_width,
			max_height,
			resizable,
			maximizable,
			minimizable,
			closable,
			title,
			fullscreen,
			focus,
			transparent,
			maximized,
			visible,
			decorations,
			always_on_top,
			content_protected,
			skip_taskbar,
			theme: theme.map(Into::into),
			title_bar_style: title_bar_style.into(),
			hidden_title,
			accept_first_mouse,
			tabbing_identifier,
			additional_browser_args,
		}
	}
}

impl From<tauri_config::CliArg> for CliArg {
	fn from(value: tauri_config::CliArg) -> Self {
		let tauri_config::CliArg {
			short,
			name,
			description,
			long_description,
			takes_value,
			multiple,
			multiple_occurrences,
			number_of_values,
			possible_values,
			min_values,
			max_values,
			required,
			required_unless_present,
			required_unless_present_all,
			required_unless_present_any,
			conflicts_with,
			conflicts_with_all,
			requires,
			requires_all,
			requires_if,
			required_if_eq,
			require_equals,
			index,
		} = value;

		CliArg {
			short,
			name,
			description,
			long_description,
			takes_value,
			multiple,
			multiple_occurrences,
			number_of_values,
			possible_values,
			min_values,
			max_values,
			required,
			required_unless_present,
			required_unless_present_all,
			required_unless_present_any,
			conflicts_with,
			conflicts_with_all,
			requires,
			requires_all,
			requires_if,
			required_if_eq,
			require_equals,
			index,
		}
	}
}

impl From<tauri_config::CliConfig> for CliConfig {
	fn from(value: tauri_config::CliConfig) -> Self {
		let tauri_config::CliConfig {
			description,
			long_description,
			before_help,
			after_help,
			args,
			subcommands,
		} = value;

		CliConfig {
			description,
			long_description,
			before_help,
			after_help,
			args: args.map(|a| a.into_iter().map(Into::into).collect()),
			subcommands: subcommands.map(|a| {
				let mut b = HashMap::new();
				a.into_iter().for_each(|(key, config)| {
					b.insert(key, config.into());
				});
				b
			}),
		}
	}
}

impl From<tauri_config::BundleType> for BundleType {
	fn from(value: tauri_config::BundleType) -> Self {
		match value {
			tauri_config::BundleType::Deb => BundleType::Deb,
			tauri_config::BundleType::AppImage => BundleType::AppImage,
			tauri_config::BundleType::Msi => BundleType::Msi,
			tauri_config::BundleType::Nsis => BundleType::Nsis,
			tauri_config::BundleType::App => BundleType::App,
			tauri_config::BundleType::Dmg => BundleType::Dmg,
			tauri_config::BundleType::Updater => BundleType::Updater,
		}
	}
}

impl From<tauri_config::BundleTarget> for BundleTarget {
	fn from(value: tauri_config::BundleTarget) -> Self {
		match value {
			tauri_config::BundleTarget::All => BundleTarget::All,
			tauri_config::BundleTarget::List(v) => BundleTarget::List(v.into_iter().map(Into::into).collect()),
			tauri_config::BundleTarget::One(v) => BundleTarget::One(v.into()),
		}
	}
}

impl From<tauri_config::AppImageConfig> for AppImageConfig {
	fn from(value: tauri_config::AppImageConfig) -> Self {
		let tauri_config::AppImageConfig { bundle_media_framework } = value;
		AppImageConfig { bundle_media_framework }
	}
}

impl From<tauri_config::DebConfig> for DebConfig {
	fn from(value: tauri_config::DebConfig) -> Self {
		let tauri_config::DebConfig {
			depends,
			files,
			desktop_template,
		} = value;

		DebConfig {
			depends,
			files,
			desktop_template,
		}
	}
}

impl From<tauri_config::MacConfig> for MacConfig {
	fn from(value: tauri_config::MacConfig) -> Self {
		let tauri_config::MacConfig {
			frameworks,
			minimum_system_version,
			exception_domain,
			license,
			signing_identity,
			provider_short_name,
			entitlements,
		} = value;

		MacConfig {
			frameworks,
			minimum_system_version,
			exception_domain,
			license,
			signing_identity,
			provider_short_name,
			entitlements,
		}
	}
}

impl From<tauri_config::WebviewInstallMode> for WebviewInstallMode {
	fn from(value: tauri_config::WebviewInstallMode) -> Self {
		match value {
			tauri_config::WebviewInstallMode::Skip => WebviewInstallMode::Skip,
			tauri_config::WebviewInstallMode::DownloadBootstrapper { silent } => {
				WebviewInstallMode::DownloadBootstrapper { silent }
			}
			tauri_config::WebviewInstallMode::EmbedBootstrapper { silent } => {
				WebviewInstallMode::EmbedBootstrapper { silent }
			}
			tauri_config::WebviewInstallMode::OfflineInstaller { silent } => {
				WebviewInstallMode::OfflineInstaller { silent }
			}
			tauri_config::WebviewInstallMode::FixedRuntime { path } => WebviewInstallMode::FixedRuntime { path },
		}
	}
}
impl From<tauri_config::WixLanguageConfig> for WixLanguageConfig {
	fn from(value: tauri_config::WixLanguageConfig) -> Self {
		let tauri_config::WixLanguageConfig { locale_path } = value;
		WixLanguageConfig { locale_path }
	}
}
impl From<tauri_config::WixLanguage> for WixLanguage {
	fn from(value: tauri_config::WixLanguage) -> Self {
		match value {
			tauri_config::WixLanguage::One(one) => WixLanguage::One(one),
			tauri_config::WixLanguage::List(list) => WixLanguage::List(list),
			tauri_config::WixLanguage::Localized(localized) => {
				let mut b = HashMap::new();
				localized.into_iter().for_each(|(key, config)| {
					b.insert(key, config.into());
				});
				WixLanguage::Localized(b)
			}
		}
	}
}

impl From<tauri_config::WixConfig> for WixConfig {
	fn from(value: tauri_config::WixConfig) -> Self {
		let tauri_config::WixConfig {
			language,
			template,
			fragment_paths,
			component_group_refs,
			component_refs,
			feature_group_refs,
			feature_refs,
			merge_refs,
			skip_webview_install,
			license,
			enable_elevated_update_task,
			banner_path,
			dialog_image_path,
		} = value;

		WixConfig {
			language: language.into(),
			template,
			fragment_paths,
			component_group_refs,
			component_refs,
			feature_group_refs,
			feature_refs,
			merge_refs,
			skip_webview_install,
			license,
			enable_elevated_update_task,
			banner_path,
			dialog_image_path,
		}
	}
}

impl From<tauri_config::NSISInstallerMode> for NSISInstallerMode {
	fn from(value: tauri_config::NSISInstallerMode) -> Self {
		match value {
			tauri_config::NSISInstallerMode::CurrentUser => NSISInstallerMode::CurrentUser,
			tauri_config::NSISInstallerMode::PerMachine => NSISInstallerMode::PerMachine,
			tauri_config::NSISInstallerMode::Both => NSISInstallerMode::Both,
		}
	}
}

impl From<tauri_config::NsisConfig> for NsisConfig {
	fn from(value: tauri_config::NsisConfig) -> Self {
		let tauri_config::NsisConfig {
			template,
			license,
			header_image,
			sidebar_image,
			installer_icon,
			install_mode,
			languages,
			custom_language_files,
			display_language_selector,
		} = value;

		NsisConfig {
			template,
			license,
			header_image,
			sidebar_image,
			installer_icon,
			install_mode: install_mode.into(),
			languages,
			custom_language_files,
			display_language_selector,
		}
	}
}

impl From<tauri_config::WindowsConfig> for WindowsConfig {
	fn from(value: tauri_config::WindowsConfig) -> Self {
		let tauri_config::WindowsConfig {
			digest_algorithm,
			certificate_thumbprint,
			timestamp_url,
			tsp,
			webview_install_mode,
			webview_fixed_runtime_path,
			allow_downgrades,
			wix,
			nsis,
		} = value;

		WindowsConfig {
			digest_algorithm,
			certificate_thumbprint,
			timestamp_url,
			tsp,
			webview_fixed_runtime_path,
			allow_downgrades,
			webview_install_mode: webview_install_mode.into(),
			wix: wix.map(Into::into),
			nsis: nsis.map(Into::into),
		}
	}
}

impl From<tauri_config::BundleConfig> for BundleConfig {
	fn from(value: tauri_config::BundleConfig) -> Self {
		let tauri_config::BundleConfig {
			active,
			targets,
			identifier,
			publisher,
			icon,
			resources,
			copyright,
			category,
			short_description,
			long_description,
			appimage,
			deb,
			macos,
			external_bin,
			windows,
		} = value;

		BundleConfig {
			active,
			identifier,
			publisher,
			icon,
			resources,
			copyright,
			category,
			short_description,
			long_description,
			targets: targets.into(),
			appimage: appimage.into(),
			deb: deb.into(),
			macos: macos.into(),
			external_bin,
			windows: windows.into(),
		}
	}
}

impl From<tauri_config::FsAllowlistScope> for FsAllowlistScope {
	fn from(value: tauri_config::FsAllowlistScope) -> Self {
		match value {
			tauri_config::FsAllowlistScope::AllowedPaths(paths) => FsAllowlistScope::AllowedPaths(paths),
			tauri_config::FsAllowlistScope::Scope {
				allow,
				deny,
				require_literal_leading_dot,
			} => FsAllowlistScope::Scope {
				allow,
				deny,
				require_literal_leading_dot,
			},
		}
	}
}

impl From<tauri_config::FsAllowlistConfig> for FsAllowlistConfig {
	fn from(value: tauri_config::FsAllowlistConfig) -> Self {
		let tauri_config::FsAllowlistConfig {
			scope,
			all,
			read_file,
			write_file,
			read_dir,
			copy_file,
			create_dir,
			remove_dir,
			remove_file,
			rename_file,
			exists,
		} = value;

		FsAllowlistConfig {
			scope: scope.into(),
			all,
			read_file,
			write_file,
			read_dir,
			copy_file,
			create_dir,
			remove_dir,
			remove_file,
			rename_file,
			exists,
		}
	}
}

impl From<tauri_config::WindowAllowlistConfig> for WindowAllowlistConfig {
	fn from(value: tauri_config::WindowAllowlistConfig) -> Self {
		let tauri_config::WindowAllowlistConfig {
			all,
			create,
			center,
			request_user_attention,
			set_resizable,
			set_maximizable,
			set_minimizable,
			set_closable,
			set_title,
			maximize,
			unmaximize,
			minimize,
			unminimize,
			show,
			hide,
			close,
			set_decorations,
			set_always_on_top,
			set_content_protected,
			set_size,
			set_min_size,
			set_max_size,
			set_position,
			set_fullscreen,
			set_focus,
			set_icon,
			set_skip_taskbar,
			set_cursor_grab,
			set_cursor_visible,
			set_cursor_icon,
			set_cursor_position,
			set_ignore_cursor_events,
			start_dragging,
			print,
		} = value;

		WindowAllowlistConfig {
			all,
			create,
			center,
			request_user_attention,
			set_resizable,
			set_maximizable,
			set_minimizable,
			set_closable,
			set_title,
			maximize,
			unmaximize,
			minimize,
			unminimize,
			show,
			hide,
			close,
			set_decorations,
			set_always_on_top,
			set_content_protected,
			set_size,
			set_min_size,
			set_max_size,
			set_position,
			set_fullscreen,
			set_focus,
			set_icon,
			set_skip_taskbar,
			set_cursor_grab,
			set_cursor_visible,
			set_cursor_icon,
			set_cursor_position,
			set_ignore_cursor_events,
			start_dragging,
			print,
		}
	}
}

impl From<tauri_config::ShellAllowlistOpen> for ShellAllowlistOpen {
	fn from(value: tauri_config::ShellAllowlistOpen) -> Self {
		match value {
			tauri_config::ShellAllowlistOpen::Flag(flags) => ShellAllowlistOpen::Flag(flags),
			tauri_config::ShellAllowlistOpen::Validate(validate) => ShellAllowlistOpen::Validate(validate),
			_ => unimplemented!(),
		}
	}
}

impl From<tauri_config::ShellAllowedArg> for ShellAllowedArg {
	fn from(value: tauri_config::ShellAllowedArg) -> Self {
		match value {
			tauri_config::ShellAllowedArg::Fixed(fixed) => ShellAllowedArg::Fixed(fixed),
			tauri_config::ShellAllowedArg::Var { validator } => ShellAllowedArg::Var { validator },
			_ => unimplemented!(),
		}
	}
}

impl From<tauri_config::ShellAllowedArgs> for ShellAllowedArgs {
	fn from(value: tauri_config::ShellAllowedArgs) -> Self {
		match value {
			tauri_config::ShellAllowedArgs::Flag(flag) => ShellAllowedArgs::Flag(flag),
			tauri_config::ShellAllowedArgs::List(list) => {
				ShellAllowedArgs::List(list.into_iter().map(Into::into).collect())
			}
			_ => unimplemented!(),
		}
	}
}

impl From<tauri_config::ShellAllowedCommand> for ShellAllowedCommand {
	fn from(value: tauri_config::ShellAllowedCommand) -> Self {
		let tauri_config::ShellAllowedCommand {
			name,
			command,
			args,
			sidecar,
		} = value;

		ShellAllowedCommand {
			name,
			command,
			args: args.into(),
			sidecar,
		}
	}
}

impl From<tauri_config::ShellAllowlistScope> for ShellAllowlistScope {
	fn from(value: tauri_config::ShellAllowlistScope) -> Self {
		let tauri_config::ShellAllowlistScope(scope) = value;
		ShellAllowlistScope(scope.into_iter().map(Into::into).collect())
	}
}

impl From<tauri_config::ShellAllowlistConfig> for ShellAllowlistConfig {
	fn from(value: tauri_config::ShellAllowlistConfig) -> Self {
		let tauri_config::ShellAllowlistConfig {
			scope,
			all,
			execute,
			sidecar,
			open,
		} = value;

		ShellAllowlistConfig {
			open: open.into(),
			scope: scope.into(),
			all,
			execute,
			sidecar,
		}
	}
}

impl From<tauri_config::DialogAllowlistConfig> for DialogAllowlistConfig {
	fn from(value: tauri_config::DialogAllowlistConfig) -> Self {
		let tauri_config::DialogAllowlistConfig {
			all,
			open,
			save,
			message,
			ask,
			confirm,
		} = value;

		DialogAllowlistConfig {
			all,
			open,
			save,
			message,
			ask,
			confirm,
		}
	}
}

impl From<tauri_config::HttpAllowlistScope> for HttpAllowlistScope {
	fn from(value: tauri_config::HttpAllowlistScope) -> Self {
		let tauri_config::HttpAllowlistScope(scope) = value;
		HttpAllowlistScope(scope.into_iter().map(|a| a.to_string()).collect())
	}
}

impl From<tauri_config::HttpAllowlistConfig> for HttpAllowlistConfig {
	fn from(value: tauri_config::HttpAllowlistConfig) -> Self {
		let tauri_config::HttpAllowlistConfig { scope, all, request } = value;
		HttpAllowlistConfig {
			scope: scope.into(),
			all,
			request,
		}
	}
}

impl From<tauri_config::NotificationAllowlistConfig> for NotificationAllowlistConfig {
	fn from(value: tauri_config::NotificationAllowlistConfig) -> Self {
		let tauri_config::NotificationAllowlistConfig { all } = value;
		NotificationAllowlistConfig { all }
	}
}

impl From<tauri_config::GlobalShortcutAllowlistConfig> for GlobalShortcutAllowlistConfig {
	fn from(value: tauri_config::GlobalShortcutAllowlistConfig) -> Self {
		let tauri_config::GlobalShortcutAllowlistConfig { all } = value;
		GlobalShortcutAllowlistConfig { all }
	}
}

impl From<tauri_config::OsAllowlistConfig> for OsAllowlistConfig {
	fn from(value: tauri_config::OsAllowlistConfig) -> Self {
		let tauri_config::OsAllowlistConfig { all } = value;
		OsAllowlistConfig { all }
	}
}

impl From<tauri_config::PathAllowlistConfig> for PathAllowlistConfig {
	fn from(value: tauri_config::PathAllowlistConfig) -> Self {
		let tauri_config::PathAllowlistConfig { all } = value;
		PathAllowlistConfig { all }
	}
}

impl From<tauri_config::ProtocolAllowlistConfig> for ProtocolAllowlistConfig {
	fn from(value: tauri_config::ProtocolAllowlistConfig) -> Self {
		let tauri_config::ProtocolAllowlistConfig {
			all,
			asset_scope,
			asset,
		} = value;
		ProtocolAllowlistConfig {
			all,
			asset_scope: asset_scope.into(),
			asset,
		}
	}
}

impl From<tauri_config::ProcessAllowlistConfig> for ProcessAllowlistConfig {
	fn from(value: tauri_config::ProcessAllowlistConfig) -> Self {
		let tauri_config::ProcessAllowlistConfig {
			all,
			relaunch,
			relaunch_dangerous_allow_symlink_macos,
			exit,
		} = value;
		ProcessAllowlistConfig {
			all,
			relaunch,
			relaunch_dangerous_allow_symlink_macos,
			exit,
		}
	}
}

impl From<tauri_config::ClipboardAllowlistConfig> for ClipboardAllowlistConfig {
	fn from(value: tauri_config::ClipboardAllowlistConfig) -> Self {
		let tauri_config::ClipboardAllowlistConfig {
			all,
			write_text,
			read_text,
		} = value;
		ClipboardAllowlistConfig {
			all,
			write_text,
			read_text,
		}
	}
}

impl From<tauri_config::AppAllowlistConfig> for AppAllowlistConfig {
	fn from(value: tauri_config::AppAllowlistConfig) -> Self {
		let tauri_config::AppAllowlistConfig { all, show, hide } = value;
		AppAllowlistConfig { all, show, hide }
	}
}

impl From<tauri_config::AllowlistConfig> for AllowlistConfig {
	fn from(value: tauri_config::AllowlistConfig) -> Self {
		let tauri_config::AllowlistConfig {
			all,
			fs,
			window,
			shell,
			dialog,
			http,
			notification,
			global_shortcut,
			os,
			path,
			protocol,
			process,
			clipboard,
			app,
		} = value;

		AllowlistConfig {
			all,
			fs: fs.into(),
			window: window.into(),
			shell: shell.into(),
			dialog: dialog.into(),
			http: http.into(),
			notification: notification.into(),
			global_shortcut: global_shortcut.into(),
			os: os.into(),
			path: path.into(),
			protocol: protocol.into(),
			process: process.into(),
			clipboard: clipboard.into(),
			app: app.into(),
		}
	}
}

impl From<tauri_config::CspDirectiveSources> for CspDirectiveSources {
	fn from(value: tauri_config::CspDirectiveSources) -> Self {
		match value {
			tauri_config::CspDirectiveSources::Inline(inline) => CspDirectiveSources::Inline(inline),
			tauri_config::CspDirectiveSources::List(list) => CspDirectiveSources::List(list),
		}
	}
}

impl From<tauri_config::Csp> for Csp {
	fn from(value: tauri_config::Csp) -> Self {
		match value {
			tauri_config::Csp::Policy(p) => Csp::Policy(p),
			tauri_config::Csp::DirectiveMap(d) => {
				let mut b = HashMap::new();
				d.into_iter().for_each(|(key, config)| {
					b.insert(key, config.into());
				});
				Csp::DirectiveMap(b)
			}
		}
	}
}

impl From<tauri_config::DisabledCspModificationKind> for DisabledCspModificationKind {
	fn from(value: tauri_config::DisabledCspModificationKind) -> Self {
		match value {
			tauri_config::DisabledCspModificationKind::Flag(flag) => DisabledCspModificationKind::Flag(flag),
			tauri_config::DisabledCspModificationKind::List(list) => DisabledCspModificationKind::List(list),
		}
	}
}

impl From<tauri_config::RemoteDomainAccessScope> for RemoteDomainAccessScope {
	fn from(value: tauri_config::RemoteDomainAccessScope) -> Self {
		let tauri_config::RemoteDomainAccessScope {
			scheme,
			domain,
			windows,
			plugins,
			enable_tauri_api,
		} = value;

		RemoteDomainAccessScope {
			scheme,
			domain,
			windows,
			plugins,
			enable_tauri_api,
		}
	}
}

impl From<tauri_config::SecurityConfig> for SecurityConfig {
	fn from(value: tauri_config::SecurityConfig) -> Self {
		let tauri_config::SecurityConfig {
			csp,
			dev_csp,
			freeze_prototype,
			dangerous_disable_asset_csp_modification,
			dangerous_remote_domain_ipc_access,
		} = value;

		SecurityConfig {
			csp: csp.map(Into::into),
			dev_csp: dev_csp.map(Into::into),
			freeze_prototype,
			dangerous_disable_asset_csp_modification: dangerous_disable_asset_csp_modification.into(),
			dangerous_remote_domain_ipc_access: dangerous_remote_domain_ipc_access
				.into_iter()
				.map(Into::into)
				.collect(),
		}
	}
}

impl From<tauri_config::UpdaterEndpoint> for UpdaterEndpoint {
	fn from(value: tauri_config::UpdaterEndpoint) -> Self {
		let tauri_config::UpdaterEndpoint(url) = value;
		UpdaterEndpoint(url.to_string())
	}
}

impl From<tauri_config::WindowsUpdateInstallMode> for WindowsUpdateInstallMode {
	fn from(value: tauri_config::WindowsUpdateInstallMode) -> Self {
		match value {
			tauri_config::WindowsUpdateInstallMode::BasicUi => WindowsUpdateInstallMode::BasicUi,
			tauri_config::WindowsUpdateInstallMode::Quiet => WindowsUpdateInstallMode::Quiet,
			tauri_config::WindowsUpdateInstallMode::Passive => WindowsUpdateInstallMode::Passive,
		}
	}
}

impl From<tauri_config::UpdaterWindowsConfig> for UpdaterWindowsConfig {
	fn from(value: tauri_config::UpdaterWindowsConfig) -> Self {
		let tauri_config::UpdaterWindowsConfig {
			installer_args,
			install_mode,
		} = value;
		UpdaterWindowsConfig {
			installer_args,
			install_mode: install_mode.into(),
		}
	}
}

impl From<tauri_config::UpdaterConfig> for UpdaterConfig {
	fn from(value: tauri_config::UpdaterConfig) -> Self {
		let tauri_config::UpdaterConfig {
			active,
			dialog,
			endpoints,
			pubkey,
			windows,
		} = value;

		UpdaterConfig {
			active,
			dialog,
			pubkey,
			endpoints: endpoints.map(|v| v.into_iter().map(Into::into).collect()),
			windows: windows.into(),
		}
	}
}

impl From<tauri_config::SystemTrayConfig> for SystemTrayConfig {
	fn from(value: tauri_config::SystemTrayConfig) -> Self {
		let tauri_config::SystemTrayConfig {
			icon_path,
			icon_as_template,
			menu_on_left_click,
			title,
		} = value;

		SystemTrayConfig {
			icon_path,
			icon_as_template,
			menu_on_left_click,
			title,
		}
	}
}

impl From<tauri_config::TauriConfig> for TauriConfig {
	fn from(value: tauri_config::TauriConfig) -> Self {
		let tauri_config::TauriConfig {
			pattern,
			windows,
			cli,
			bundle,
			allowlist,
			security,
			updater,
			system_tray,
			macos_private_api,
		} = value;

		TauriConfig {
			pattern: pattern.into(),
			bundle: bundle.into(),
			allowlist: allowlist.into(),
			security: security.into(),
			updater: updater.into(),
			windows: windows.into_iter().map(Into::into).collect(),
			cli: cli.map(Into::into),
			system_tray: system_tray.map(Into::into),
			macos_private_api,
		}
	}
}

impl From<tauri_config::AppUrl> for AppUrl {
	fn from(value: tauri_config::AppUrl) -> Self {
		match value {
			tauri_config::AppUrl::Url(url) => AppUrl::Url(url.into()),
			tauri_config::AppUrl::Files(files) => AppUrl::Files(files),
			_ => unimplemented!(),
		}
	}
}

impl From<tauri_config::BeforeDevCommand> for BeforeDevCommand {
	fn from(value: tauri_config::BeforeDevCommand) -> Self {
		match value {
			tauri_config::BeforeDevCommand::Script(script) => BeforeDevCommand::Script(script),
			tauri_config::BeforeDevCommand::ScriptWithOptions { script, cwd, wait } => {
				BeforeDevCommand::ScriptWithOptions { script, cwd, wait }
			}
		}
	}
}

impl From<tauri_config::HookCommand> for HookCommand {
	fn from(value: tauri_config::HookCommand) -> Self {
		match value {
			tauri_config::HookCommand::Script(script) => HookCommand::Script(script),
			tauri_config::HookCommand::ScriptWithOptions { script, cwd } => {
				HookCommand::ScriptWithOptions { script, cwd }
			}
		}
	}
}

impl From<tauri_config::BuildConfig> for BuildConfig {
	fn from(value: tauri_config::BuildConfig) -> Self {
		let tauri_config::BuildConfig {
			runner,
			dev_path,
			dist_dir,
			before_dev_command,
			before_build_command,
			before_bundle_command,
			features,
			with_global_tauri,
		} = value;

		BuildConfig {
			runner,
			dev_path: dev_path.into(),
			dist_dir: dist_dir.into(),
			before_dev_command: before_dev_command.map(Into::into),
			before_build_command: before_build_command.map(Into::into),
			before_bundle_command: before_bundle_command.map(Into::into),
			features,
			with_global_tauri,
		}
	}
}

impl From<tauri_config::PluginConfig> for PluginConfig {
	fn from(value: tauri_config::PluginConfig) -> Self {
		let tauri_config::PluginConfig(conf) = value;
		PluginConfig(conf)
	}
}

impl From<Arc<tauri::Config>> for Config {
	fn from(config: Arc<tauri::Config>) -> Self {
		let tauri::Config {
			package,
			tauri,
			build,
			plugins,
			..
		} = config.as_ref();

		Config {
			package: package.clone().into(),
			tauri: tauri.clone().into(),
			build: build.clone().into(),
			plugins: plugins.clone().into(),
		}
	}
}
