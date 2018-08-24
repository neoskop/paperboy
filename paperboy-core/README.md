# Paperboy

Content Delivery Layer

## Installation

```bash
$ npm add @neoskop/paperboy
```

## Configuration

There are two ways to overwerite the default configuration:

- Overwrite the default configuration by adding a **config/default.json** file to your project.
- Use the options argument of the **generate** function.

## Usage Example

```javascript
import { generate } from '@neoskop/paperboy';
 
generate('magnolia', { output: { assets: 'output/assets', json: 'output' } })
    .then(() => {
      console.log('Success');
    }).catch(() => {
      console.log('Error');
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