# FoculessPDF

API REST para ferramentas de arquivos PDF (inspirada no iLovePDF), feita com NestJS 12.

## Stack

- **NestJS 12** + Express + TypeScript 6
- **Swagger** (OpenAPI) em `/docs` (JSON em `/docs-json`)
- **Jest** + Supertest para testes unitários e e2e
- **Biome** para lint e formatação

## Começando

```bash
npm install
npm run start:dev       # http://localhost:3000/docs
```

## Scripts

| Script               | Descrição                           |
| -------------------- | ----------------------------------- |
| `npm run start:dev`  | Sobe em modo watch                  |
| `npm run build`      | Compila para `dist/`                |
| `npm run start:prod` | Roda o build                        |
| `npm run lint`       | Biome (lint + formatação + imports) |
| `npm run lint:fix`   | Biome com correções automáticas     |
| `npm test`           | Testes unitários                    |
| `npm run test:cov`   | Cobertura                           |
| `npm run test:e2e`   | Testes e2e                          |

## Endpoints (`/api/v1`)

| Método | Rota                    | Entrada                         | Saída |
| ------ | ----------------------- | ------------------------------- | ----- |
| GET    | `/health`               | —                               | JSON  |
| POST   | `/merge`                | `files[]` (2–20 PDFs)           | PDF   |
| POST   | `/split`                | `file`, `ranges` (`1-3,5`)      | ZIP   |
| POST   | `/compress`             | `file`, `level`                 | PDF   |
| POST   | `/rotate`               | `file`, `angle`, `pages?`       | PDF   |
| POST   | `/organize`             | `file`, `order` (`3,1,2`)       | PDF   |
| POST   | `/convert/image-to-pdf` | `files[]` (JPEG/PNG)            | PDF   |
| POST   | `/convert/pdf-to-image` | `file`, `format`                | ZIP   |
| POST   | `/watermark`            | `file`, `text`, `opacity?`      | PDF   |
| POST   | `/page-numbers`         | `file`, `position?`, `startAt?` | PDF   |
| POST   | `/security/protect`     | `file`, `password`              | PDF   |
| POST   | `/security/unlock`      | `file`, `password`              | PDF   |

Todas as rotas POST recebem `multipart/form-data`. Os arquivos são validados (tipo e tamanho máx. 50 MB) e os campos via `class-validator`.
Implementados: `merge`, `split`, `rotate`, `organize`. Os demais services ainda lançam `501 Not Implemented`.

## Estrutura

```
src/
├── main.ts                    # bootstrap
├── app.module.ts              # registra os módulos
├── app.setup.ts               # prefixo, versionamento, ValidationPipe, Swagger (usado também no e2e)
├── common/
│   ├── constants/             # limites, MIME types, regex de páginas
│   ├── decorators/            # @ApiFileOperation (docs Swagger de upload/download)
│   └── files/                 # pipes de validação de arquivo, helper de resposta
└── modules/
    └── <ferramenta>/
        ├── dto/               # entrada validada + schema Swagger
        ├── <ferramenta>.controller.ts
        ├── <ferramenta>.service.ts
        ├── <ferramenta>.service.spec.ts
        └── <ferramenta>.module.ts
test/
└── app.e2e-spec.ts
```

## Adicionando uma ferramenta

1. `nest g resource modules/<nome> --no-spec` (ou copie um módulo existente).
2. Crie o DTO em `dto/` com `@ApiProperty` + validadores.
3. No controller use `FileInterceptor`, `PdfFilePipe`, `@ApiFileOperation` e `fileResponse`.
4. Registre o módulo em `app.module.ts`.
