# FoculessPDF

Ferramentas de PDF (inspiradas no iLovePDF): uma API REST em NestJS 12 na raiz e o front-end em Vue na pasta [`web/`](web/README.md).

## Stack

- **API:** NestJS 12 + Express + TypeScript 6, Swagger em `/docs` (JSON em `/docs-json`), Jest + Supertest, Biome
- **Front-end:** Vue 3 + Vite + Tailwind 4 + shadcn-vue, Vitest

## Rodando tudo

```bash
npm install && npm run start:dev          # API em http://localhost:3000
cd web && npm install && npm run dev      # front em http://localhost:5173
```

## Começando

```bash
npm install
cp .env.example .env    # opcional: todos os valores têm padrão
npm run start:dev       # http://localhost:3000/docs
```

## Configuração (`.env`)

| Variável                | Padrão                  | Descrição                                          |
| ----------------------- | ----------------------- | -------------------------------------------------- |
| `PORT`                  | `3000`                  | Porta da API                                       |
| `CORS_ORIGINS`          | `http://localhost:5173` | Origens do front-end liberadas (separadas por `,`) |
| `MAX_FILE_SIZE_MB`      | `50`                    | Tamanho máximo por arquivo                         |
| `RATE_LIMIT_PER_MINUTE` | `30`                    | Requisições por minuto, por IP e por rota          |

Valores inválidos (ex.: `PORT=abc`) impedem a API de subir, com uma mensagem clara.

## Erros

Toda resposta de erro tem o mesmo formato, com `message` sempre como lista:

```json
{ "statusCode": 400, "error": "Bad Request", "message": ["order must look like \"3,1,2\""] }
```

Erros inesperados (500) são registrados no log e retornam só `"Internal server error"`, sem detalhes internos.

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
