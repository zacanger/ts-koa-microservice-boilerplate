# typescript-microservice-boilerplate

[![Support with PayPal](https://img.shields.io/badge/paypal-donate-yellow.png)](https://paypal.me/zacanger) [![Patreon](https://img.shields.io/badge/patreon-donate-yellow.svg)](https://www.patreon.com/zacanger) [![ko-fi](https://img.shields.io/badge/donate-KoFi-yellow.svg)](https://ko-fi.com/U7U2110VB)

An example Node microservice using Koa, TypeScript, and Jest.

Includes examples for Jenkins, CircleCI, GCP Cloudbuild, and Kubernetes.

Also includes an example of static file serving. I recommend serving files in
production out of a CDN rather than from a Node server, or using Node only to
handle requests for those files.

To run in dev, `npm ci && npm start`

To run without docker, `npm run dev` instead

To build, `npm version [major|minor|patch]`

[LICENSE](./LICENSE.md)
