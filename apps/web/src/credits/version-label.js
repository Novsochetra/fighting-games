// A build's version is SemVer with the build after a + (build-version.js); the credits name the
// build in brackets, as iOS names an app's Version 1.0 (42).
export function versionLabel(version) {
  const [release, build] = version.split('+');

  return build ? `${release} (${build})` : release;
}
