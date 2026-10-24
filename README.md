<p align="center">
  <img src="web/public/favicon.svg" alt="" width="72" />
</p>

<h1 align="center">FoculessPDF</h1>

<p align="center">
  <b>English</b> · <a href="README.pt-BR.md">Português (Brasil)</a>
</p>

<p align="center">
  PDF tools with no ads, no telemetry and no sign-up: merge, split, compress, convert and protect your files.
</p>

<p align="center">
  <img alt="NestJS 12" src="https://img.shields.io/badge/NestJS-12-e0234e?logo=nestjs&logoColor=white" />
  <img alt="Vue 3" src="https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white" />
  <img alt="Node.js 22.13+" src="https://img.shields.io/badge/Node.js-22.13%2B-5fa04e?logo=nodedotjs&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss&logoColor=white" />
  <img alt="shadcn-vue" src="https://img.shields.io/badge/UI-shadcn--vue-111111" />
  <img alt="Swagger" src="https://img.shields.io/badge/docs-Swagger-85ea2d?logo=swagger&logoColor=black" />
</p>

> [!NOTE]
> **Your files are never stored.** Uploads are processed in the API's memory and discarded as soon as the response is sent: nothing is written to disk. The site uses no analytics, no tracking cookies and no third-party fonts or scripts. FoculessPDF is not affiliated with iLovePDF; the idea is inspired by it.

## Features

- **Organize**
  - **Merge PDF**: combine 2 to 20 PDFs, in the order you choose.
  - **Split PDF**: extract page ranges (`1-3,5,8-10`) into separate PDFs, delivered as a ZIP.
  - **Organize PDF**: reorder pages (`3,1,2`); pages left out are removed.
  - **Rotate PDF**: 90°, 180° or 270°, on every page or only the selected ones, on top of the current rotation.
- **Optimize**
  - **Compress PDF**: downscales and re-encodes the document's photos at three levels. The site shows how much smaller the file got.
- **Convert**
  - **JPG/PNG to PDF**: one A4 page per image, landscape for wide images. Phone photos come out the right way up (EXIF).
  - **PDF to JPG/PNG**: every page becomes a 150 DPI image, delivered as a ZIP.
- **Edit**
  - **Watermark**: diagonal text, centered and sized to the page, at three intensities.
  - **Page numbers**: six positions and a configurable starting number.
- **Security**
  - **Protect PDF**: AES-256 encryption; the password is required to open the file, while printing and copying stay allowed.
  - **Unlock PDF**: removes the password from a protected PDF (given the current password).
- **Website** in English and Portuguese, with pastel **light and dark modes**, drag and drop, upload progress and automatic download with the right file name.
- **Documented API** with Swagger at `/docs`, to use the tools without the website.

## Getting started

All you need is [Node.js](https://nodejs.org) **22.13 or newer**. There is no API key and no external program to install: no Ghostscript, no LibreOffice. The `.env` file is optional.

```sh
git clone https://github.com/SamuelSchutz13/FoculessPDF.git
cd FoculessPDF

# terminal 1: API (http://localhost:3000, docs at /docs)
npm install
npm run start:dev

# terminal 2: website (http://localhost:5173)
cd web
npm install
npm run dev
```

Open **http://localhost:5173**. The website calls the API at `http://localhost:3000/api/v1`, and the API allows that origin through CORS.

### Configuration

Every variable has a default. To change one, copy `.env.example` to `.env`, at the root for the API or in `web/` for the website.

| Where   | Variable                | Default                        | Description                                     |
| ------- | ----------------------- | ------------------------------ | ----------------------------------------------- |
| API     | `PORT`                  | `3000`                         | API port                                        |
| API     | `CORS_ORIGINS`          | `http://localhost:5173`        | Allowed website origins, comma-separated        |
| API     | `MAX_FILE_SIZE_MB`      | `50`                           | Maximum size per file                           |
| API     | `RATE_LIMIT_PER_MINUTE` | `30`                           | Requests per minute, per IP and per tool        |
| Website | `VITE_API_URL`          | `http://localhost:3000/api/v1` | API address                                     |
| Website | `VITE_MAX_FILE_SIZE_MB` | `50`                           | Same limit as the API, checked before uploading |

An invalid value (e.g. `PORT=abc`) stops the API from starting, with a message naming the variable.

### Scripts

| Folder | Command              | What it does                                       |
| ------ | -------------------- | -------------------------------------------------- |
| root   | `npm run start:dev`  | API with hot reload                                |
| root   | `npm run build`      | Builds the API into `dist/`                        |
| root   | `npm run start:prod` | Runs the API build                                 |
| root   | `npm test`           | API unit tests                                     |
| root   | `npm run test:e2e`   | API end-to-end (HTTP) tests                        |
| root   | `npm run test:cov`   | Tests with coverage                                |
| root   | `npm run lint`       | Biome: lint, formatting and import sorting         |
| root   | `npm run lint:fix`   | Biome with automatic fixes                         |
| `web`  | `npm run dev`        | Website in development mode                        |
| `web`  | `npm test`           | Tests for the API client and the translations      |
| `web`  | `npm run type-check` | Type checking (`vue-tsc`)                          |
| `web`  | `npm run build`      | Type checking and production build into `web/dist` |

## How it works

```
web/   Vue 3 + Vite + shadcn-vue   →  multipart/form-data  →   NestJS API (/api/v1)   →  pdf-lib · pdf.js · canvas
```

- **Uploads**: files only live in memory (Multer). Before a file reaches a tool, the API checks its type from the file's bytes, not its extension, and its maximum size. A corrupt or password-protected file becomes a `422` error with a clear message, never a `500`.
- **PDF editing**: [`@cantoo/pdf-lib`](https://github.com/cantoo-scribe/pdf-lib), a maintained fork of pdf-lib that also handles the AES-256 encryption for protect/unlock.
- **PDF to image**: pages are rendered with [pdf.js](https://mozilla.github.io/pdf.js/) (the same renderer as Firefox) on [`@napi-rs/canvas`](https://github.com/Brooooooklyn/canvas), which ships prebuilt binaries and needs no system libraries.
- **Compression**: the document's JPEG photos are downscaled and re-encoded, and each one is only replaced if it gets smaller. The PDF is saved with compressed object streams. If nothing gets smaller, the API returns the original file.

  | Level       | JPEG quality | Longest image side |
  | ----------- | ------------ | ------------------ |
  | Low         | 85%          | 2500 px            |
  | Recommended | 70%          | 1800 px            |
  | Extreme     | 50%          | 1200 px            |

- **Errors**: every error response has the same shape, with `message` always a list. Unexpected errors are logged and the client only gets `"Internal server error"`.

  ```json
  { "statusCode": 400, "error": "Bad Request", "message": ["order must look like \"3,1,2\""] }
  ```

- **API protection**: rate limiting per IP and per tool (`429` with `Retry-After`), security headers with helmet, and CORS restricted to the configured origins.
- **Website**: each tool is an entry in `web/src/lib/tools.ts`, and a single generic page builds the upload, the fields and the submission. Texts live in `web/src/i18n/`: English is typed against Portuguese, and a test checks that every tool and every field has its texts in both languages.

### Endpoints (`/api/v1`)

Every `POST` route takes `multipart/form-data` and returns the file as a download. Interactive docs are at **http://localhost:3000/docs**.

| Method | Route                   | Input                                              | Output |
| ------ | ----------------------- | -------------------------------------------------- | ------ |
| GET    | `/health`               | —                                                  | JSON   |
| POST   | `/merge`                | `files[]` (2–20 PDFs)                              | PDF    |
| POST   | `/split`                | `file`, `ranges` (`1-3,5`)                         | ZIP    |
| POST   | `/compress`             | `file`, `level?` (`low`, `recommended`, `extreme`) | PDF    |
| POST   | `/rotate`               | `file`, `angle` (`90`, `180`, `270`), `pages?`     | PDF    |
| POST   | `/organize`             | `file`, `order` (`3,1,2`)                          | PDF    |
| POST   | `/convert/image-to-pdf` | `files[]` (JPEG/PNG, up to 20)                     | PDF    |
| POST   | `/convert/pdf-to-image` | `file`, `format?` (`jpeg`, `png`)                  | ZIP    |
| POST   | `/watermark`            | `file`, `text`, `opacity?`                         | PDF    |
| POST   | `/page-numbers`         | `file`, `position?`, `startAt?`                    | PDF    |
| POST   | `/security/protect`     | `file`, `password` (4–128 characters)              | PDF    |
| POST   | `/security/unlock`      | `file`, `password`                                 | PDF    |

### Project structure

```
src/                          API (NestJS)
  main.ts, app.module.ts      bootstrap and module registration
  app.setup.ts                prefix, versioning, validation, CORS, helmet, Swagger (also used by e2e)
  config/env.ts               reading and validating .env
  common/
    pdf/                      opening PDFs with clear errors, page ranges (+ tests)
    files/                    upload validation, download response
    filters/                  single error shape (+ tests)
    decorators/               @ApiFileOperation (Swagger for upload/download)
  modules/<tool>/             controller, service (+ tests) and DTOs for each tool
test/
  app.e2e-spec.ts             end-to-end HTTP tests
  fixtures/images.ts          PNG/JPEG generated for the tests
web/                          website (Vue) — details in web/README.md
  src/lib/tools.ts            tool catalog
  src/lib/api.ts              API calls, file name and error messages (+ tests)
  src/i18n/                   English and Portuguese (+ tests)
  src/views/                  home and the generic tool page
  src/components/             upload, file list, icons, language, theme, GitHub link
```

### Adding a tool

1. **API**: create `src/modules/<name>/` by copying an existing module. The controller uses `FileInterceptor`, `PdfFilePipe`, `@ApiFileOperation` and `fileResponse`. The service opens the PDF with `loadPdf`. Register the module in `src/app.module.ts`.
2. **Website**: add the entry to `web/src/lib/tools.ts` and the texts to `web/src/i18n/pt-BR.ts` and `en.ts`. `npm test` in `web` reports any missing text.

## Known limitations

- **Compress** only re-encodes JPEG photos (RGB or grayscale). Images in other formats, CMYK or masked images are left as they are, so text-only PDFs barely shrink.
- **PDF to image** accepts up to 100 pages per file. Rendering runs on the API's main thread, so a large conversion delays other requests.
- **Watermark** and **page numbers** use the standard PDF fonts: the Latin alphabet with accents works; emoji, Chinese, etc. are rejected with a message. The watermark ignores the page's own rotation.
- **Merge, split, organize and unlock** build a new PDF from the pages, so bookmarks, forms and metadata (title, author) from the original are not kept.
- Photos with a mirrored EXIF orientation (rare in cameras) are rotated but not mirrored.
- API error messages are in English, even when the website is in Portuguese.
- Rate limiting lives in the process memory. Behind a proxy (Nginx, Cloudflare) you need to enable `trust proxy`; with more than one API instance, move the limits to Redis.
- On Windows, network filters such as AdGuard intercept `localhost` and make the e2e tests fail now and then with `ECONNRESET`. Add `node.exe` to its exceptions.

## Credits

- PDF editing and encryption: [`@cantoo/pdf-lib`](https://github.com/cantoo-scribe/pdf-lib) (MIT), a fork of Andrew Dillon's [pdf-lib](https://github.com/Hopding/pdf-lib).
- Page rendering: Mozilla's [pdf.js](https://github.com/mozilla/pdf.js) (Apache-2.0), on [`@napi-rs/canvas`](https://github.com/Brooooooklyn/canvas) (MIT).
- ZIP files: [fflate](https://github.com/101arrowz/fflate) (MIT).
- API: [NestJS](https://nestjs.com). Website: [Vue](https://vuejs.org), [Vite](https://vite.dev) and [Tailwind CSS](https://tailwindcss.com).
- UI components: [shadcn-vue](https://www.shadcn-vue.com) and [Reka UI](https://reka-ui.com). Icons: [Lucide](https://lucide.dev) and the GitHub mark from [Octicons](https://github.com/primer/octicons) (MIT).
- Font: [Geist](https://vercel.com/font) by Vercel (SIL Open Font License), served by the website itself.
