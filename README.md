# Minipack

A simple module bundler, inspired by [minipack](https://github.com/ronami/minipack) and [tinypack](https://github.com/hatashiro/tinypack)

## Features

- [x] Remove duplication for the same module
- [x] Resolve circular dependency
- [x] `node_modules` resolution
- [x] Config file
  - [x] Resolve Alias Option
  - [x] Custom loader (ts-loader, babel-loader)

## Install

### Install globally with npm

```shell
npm install -g @yunho1017/minipack
```

### Install your package.json

```shell
yarn add @yunho1017/minipack
```

## How to use

TBD

## How does it work?

Use [the code](packages/core/src/index.ts), Luke!

## References

- [Minipack](https://github.com/ronami/minipack): A simplified example of a
  modern module bundler written in JavaScript
- [Tinypack](https://github.com/hatashiro/tinypack): A simple TypeScript module bundler

## License

[MIT](LICENSE)
