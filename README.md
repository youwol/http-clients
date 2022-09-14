# @youwol/http-clients

The library exposes some of YouWol backend services.

This library is part of the hybrid cloud/local ecosystem
[YouWol](https://platform.youwol.com/applications/@youwol/platform/latest).

## Links

[Online user-guide](https://l.youwol.com/doc/@youwol/http-clients)

[Developers documentation](https://platform.youwol.com/applications/@youwol/cdn-explorer/latest?package=@youwol/http-clients)

[Package on npm](https://www.npmjs.com/package/@youwol/http-clients)

[Source on GitHub](https://github.com/youwol/http-clients)

# Installation, Build, Test

To install the required dependencies:

```shell
yarn
```

---

To build for development:

```shell
yarn build:dev
```

To build for production:

```shell
yarn build:prod
```

---
Tests require [py-youwol](https://l.youwol.com/doc/py-youwol) to run on port 2001 using the configuration defined [here](https://github.com/youwol/integration-tests-conf).
To run tests:

```shell
yarn test
```

Coverage can be evaluated using:

```shell
yarn test-coverage
```

---

To generate code's documentation:

```shell
yarn doc
```
