# Paperboy

Content Delivery Layer

## Installation

```bash
$ npm add @neoskop/paperboy
```

## Usage Example

```javascript
import { Paperboy } from '@neoskop/paperboy';

new Paperboy({
  command: 'yarn build'
});
```

##Development

Build and start the project for development:

### Requirement

- Node >= 8.9.1

### Install

```bash
$ npm i
```

### Start

Builds and starts the project with nodemon and watcher.

```bash
$ npm start
```

### Build

Builds the project (dist directory).

```bash
$ npm run build
```

### Release

Make sure to build and commit before releasing.

```bash
$ npm version patch|minory|major
$ npm publish
```
