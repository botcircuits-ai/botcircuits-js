# Publishing BotCircuits JavaScript Client to npm

This guide explains how to publish the BotCircuits JavaScript client library to the npm registry, making it available for other developers to install and use in their projects.

## Prerequisites

Before publishing to npm, ensure you have:

1. An [npm account](https://www.npmjs.com/signup)
2. Node.js and npm installed on your machine
3. The BotCircuits JavaScript client library code ready for publishing

## Preparing for Publication

### 1. Build the Library

Make sure the library is built and ready for distribution:

```bash
# Navigate to the library directory
cd botcircuits-js

# Install dependencies
npm install

# Build the library
npm run build
```

This will create the distribution files in the `dist` directory.

### 2. Check Package.json

Ensure your `package.json` file has all the necessary information:

- **name**: The package name (e.g., `botcircuits-client`)
- **version**: Following semantic versioning (e.g., `1.0.0`)
- **description**: A clear description of the library
- **main**: Entry point for CommonJS (e.g., `dist/index.js`)
- **module**: Entry point for ES modules (e.g., `dist/index.esm.js`)
- **types**: TypeScript definitions (e.g., `dist/index.d.ts`)
- **files**: Array of files/directories to include in the package
- **repository**: Link to the source code repository
- **keywords**: Relevant keywords for npm search
- **author**: Your name or organization
- **license**: The license type (e.g., `MIT`)

Example:

```json
{
  "name": "botcircuits-client",
  "version": "1.0.0",
  "description": "JavaScript client library for BotCircuits",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/botcircuits/botcircuits-js-client.git"
  },
  "keywords": [
    "botcircuits",
    "chatbot",
    "websocket",
    "client"
  ],
  "author": "BotCircuits",
  "license": "MIT"
}
```

### 3. Create .npmignore File

Create a `.npmignore` file to exclude files that shouldn't be published:

```
# Source files
src/

# Development files
examples/
tests/
.github/
.vscode/
.idea/

# Configuration files
tsconfig.json
rollup.config.js
jest.config.js
.eslintrc
.prettierrc
.babelrc

# Build artifacts
coverage/
node_modules/

# Misc
.DS_Store
*.log
```

### 4. Test the Package Locally

Before publishing, test the package locally:

```bash
# Create a tarball of your package
npm pack

# This will create a file like botcircuits-client-1.0.0.tgz
```

You can install this tarball in a test project:

```bash
# In a test project
npm install /path/to/botcircuits-client-1.0.0.tgz
```

## Publishing to npm

### 1. Login to npm

```bash
npm login
```

Enter your npm username, password, and email when prompted.

### 2. Publish the Package

```bash
npm publish
```

If this is your first time publishing this package, it will be created in the registry. If you're updating an existing package, make sure to update the version number in `package.json` first.

### 3. Publishing a Scoped Package

If you want to publish under an organization or scope (e.g., `@botcircuits/client`):

1. Update your package name in `package.json`:

```json
{
  "name": "@botcircuits/client",
  ...
}
```

2. Publish with the public access flag:

```bash
npm publish --access=public
```

## Version Management

Follow semantic versioning (SemVer) for your package:

- **MAJOR** version for incompatible API changes (e.g., 1.0.0 to 2.0.0)
- **MINOR** version for new functionality in a backward-compatible manner (e.g., 1.0.0 to 1.1.0)
- **PATCH** version for backward-compatible bug fixes (e.g., 1.0.0 to 1.0.1)

You can update the version using npm:

```bash
# Patch update (1.0.0 -> 1.0.1)
npm version patch

# Minor update (1.0.0 -> 1.1.0)
npm version minor

# Major update (1.0.0 -> 2.0.0)
npm version major
```

These commands will update the version in `package.json` and create a git tag.

## Publishing Updates

To publish an update:

1. Make your changes to the codebase
2. Build the library: `npm run build`
3. Update the version: `npm version patch|minor|major`
4. Publish: `npm publish`

## Setting Up Continuous Integration

For automated publishing, you can set up GitHub Actions:

1. Create a `.github/workflows/publish.yml` file:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16.x'
          registry-url: 'https://registry.npmjs.org/'
      - run: npm ci
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}
```

2. Add your npm token to GitHub repository secrets

## Best Practices

1. **Documentation**: Ensure your README.md is comprehensive and includes installation and usage instructions
2. **Changelog**: Maintain a CHANGELOG.md file to track changes between versions
3. **Testing**: Include tests and ensure they pass before publishing
4. **Deprecation**: If you need to deprecate a version, use `npm deprecate`

## Troubleshooting

- **Name conflicts**: If the package name is already taken, choose a different name or use a scope
- **Version conflicts**: If the version already exists, you must increment the version number
- **Authentication issues**: Make sure you're logged in with `npm login` and have the right permissions

## Additional Resources

- [npm Documentation](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)
- [npm Package.json Guide](https://docs.npmjs.com/cli/v7/configuring-npm/package-json)
