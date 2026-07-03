const { existsSync, readFileSync } = require('fs');

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const expectedFiles = ['dist', 'README.md', 'CHANGELOG.md', 'LICENSE'];
const requiredArtifacts = ['dist/index.cjs', 'dist/index.d.ts', 'dist/index.mjs'];

const files = packageJson.files || [];
const missingAllowlistEntries = expectedFiles.filter((entry) => !files.includes(entry));
const extraAllowlistEntries = files.filter((entry) => !expectedFiles.includes(entry));
const missingArtifacts = requiredArtifacts.filter((entry) => !existsSync(entry));

if (missingAllowlistEntries.length > 0 || extraAllowlistEntries.length > 0 || missingArtifacts.length > 0) {
  if (missingAllowlistEntries.length > 0) {
    console.error(`Missing package files allowlist entries:\n${missingAllowlistEntries.map((entry) => `- ${entry}`).join('\n')}`);
  }

  if (extraAllowlistEntries.length > 0) {
    console.error(`Unexpected package files allowlist entries:\n${extraAllowlistEntries.map((entry) => `- ${entry}`).join('\n')}`);
  }

  if (missingArtifacts.length > 0) {
    console.error(`Missing package artifacts:\n${missingArtifacts.map((entry) => `- ${entry}`).join('\n')}`);
  }

  process.exit(1);
}

console.log('Package configuration and artifacts OK.');
