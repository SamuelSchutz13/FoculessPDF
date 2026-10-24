<p align="center">
  <img src="web/public/favicon.svg" alt="" width="72" />
</p>

<h1 align="center">FoculessPDF</h1>

<p align="center">
  <a href="README.md">English</a> · <b>Português (Brasil)</b>
</p>

<p align="center">
  Ferramentas de PDF sem anúncios, sem telemetria e sem cadastro: junte, divida, comprima, converta e proteja seus arquivos.
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
> **Seus arquivos não ficam salvos.** Os uploads são processados na memória da API e descartados assim que a resposta é enviada: nada é gravado em disco. O site não usa analytics, cookies de rastreamento nem fontes ou scripts de terceiros. O FoculessPDF não tem relação com o iLovePDF; a ideia é inspirada nele.

## Funcionalidades

- **Organizar**
  - **Juntar PDF**: combine de 2 a 20 PDFs, na ordem que você escolher.
  - **Dividir PDF**: separe intervalos (`1-3,5,8-10`) em PDFs independentes, entregues num ZIP.
  - **Organizar PDF**: reordene páginas (`3,1,2`); as que ficarem de fora são removidas.
  - **Girar PDF**: 90°, 180° ou 270°, em todas as páginas ou só nas escolhidas, somando à rotação atual.
- **Otimizar**
  - **Comprimir PDF**: reduz e recomprime as fotos do documento em três níveis. O site mostra quanto o arquivo diminuiu.
- **Converter**
  - **JPG/PNG para PDF**: uma página A4 por imagem, deitada se a imagem for larga. Fotos de celular saem na orientação certa (EXIF).
  - **PDF para JPG/PNG**: cada página vira uma imagem de 150 DPI, entregues num ZIP.
- **Editar**
  - **Marca d'água**: texto na diagonal, centralizado e dimensionado pela página, em três intensidades.
  - **Números de página**: seis posições e número inicial configurável.
- **Segurança**
  - **Proteger PDF**: criptografia AES-256; a senha é pedida para abrir, mas imprimir e copiar continuam liberados.
  - **Desbloquear PDF**: remove a senha de um PDF protegido (com a senha atual).
- **Site** em português e inglês, com **modo claro e escuro** em tons pastéis, arrastar e soltar, barra de progresso e download automático com o nome certo.
- **API documentada** com Swagger em `/docs`, para usar as ferramentas sem o site.

## Como rodar

Você só precisa do [Node.js](https://nodejs.org) **22.13 ou mais novo**. Não há chave de API nem programa externo para instalar: nem Ghostscript, nem LibreOffice. O arquivo `.env` é opcional.

```sh
git clone https://github.com/SamuelSchutz13/FoculessPDF.git
cd FoculessPDF

# terminal 1: API (http://localhost:3000, documentação em /docs)
npm install
npm run start:dev

# terminal 2: site (http://localhost:5173)
cd web
npm install
npm run dev
```

Abra **http://localhost:5173**. O site chama a API em `http://localhost:3000/api/v1`, e a API libera essa origem no CORS.

### Configuração

Todas as variáveis têm valor padrão. Para mudar, copie o `.env.example` para `.env`, na raiz para a API ou em `web/` para o site.

| Onde | Variável                | Padrão                         | Descrição                                       |
| ---- | ----------------------- | ------------------------------ | ----------------------------------------------- |
| API  | `PORT`                  | `3000`                         | Porta da API                                    |
| API  | `CORS_ORIGINS`          | `http://localhost:5173`        | Origens do site liberadas, separadas por `,`    |
| API  | `MAX_FILE_SIZE_MB`      | `50`                           | Tamanho máximo por arquivo                      |
| API  | `RATE_LIMIT_PER_MINUTE` | `30`                           | Requisições por minuto, por IP e por ferramenta |
| Site | `VITE_API_URL`          | `http://localhost:3000/api/v1` | Endereço da API                                 |
| Site | `VITE_MAX_FILE_SIZE_MB` | `50`                           | Mesmo limite da API, checado antes do upload    |

Um valor inválido (ex.: `PORT=abc`) impede a API de subir e mostra uma mensagem dizendo qual variável está errada.

### Scripts

| Pasta | Comando              | O que faz                                           |
| ----- | -------------------- | --------------------------------------------------- |
| raiz  | `npm run start:dev`  | API com recarga automática                          |
| raiz  | `npm run build`      | Build da API em `dist/`                             |
| raiz  | `npm run start:prod` | Roda o build da API                                 |
| raiz  | `npm test`           | Testes unitários da API                             |
| raiz  | `npm run test:e2e`   | Testes de ponta a ponta (HTTP) da API               |
| raiz  | `npm run test:cov`   | Testes com cobertura                                |
| raiz  | `npm run lint`       | Biome: lint, formatação e organização dos imports   |
| raiz  | `npm run lint:fix`   | Biome com correções automáticas                     |
| `web` | `npm run dev`        | Site em modo de desenvolvimento                     |
| `web` | `npm test`           | Testes do cliente da API e das traduções            |
| `web` | `npm run type-check` | Checagem de tipos (`vue-tsc`)                       |
| `web` | `npm run build`      | Checagem de tipos e build de produção em `web/dist` |

## Como funciona

```
web/   Vue 3 + Vite + shadcn-vue   →  multipart/form-data  →   API NestJS (/api/v1)   →  pdf-lib · pdf.js · canvas
```

- **Uploads**: os arquivos ficam só na memória (Multer). Antes de chegar à ferramenta, a API confere o tipo pelos bytes do arquivo, e não pela extensão, e o tamanho máximo. Arquivo corrompido ou protegido por senha vira um erro `422` com mensagem clara, nunca um `500`.
- **Edição de PDF**: [`@cantoo/pdf-lib`](https://github.com/cantoo-scribe/pdf-lib), um fork mantido da pdf-lib que também faz a criptografia AES-256 de proteger/desbloquear.
- **PDF para imagem**: as páginas são renderizadas com o [pdf.js](https://mozilla.github.io/pdf.js/) (o mesmo do Firefox) sobre o [`@napi-rs/canvas`](https://github.com/Brooooooklyn/canvas), que vem com binários prontos e não exige bibliotecas do sistema.
- **Compressão**: as fotos JPEG do documento são reduzidas e recodificadas, e cada uma só é trocada se ficar menor. O PDF é salvo com object streams comprimidos. Se nada diminuir, a API devolve o arquivo original.

  | Nível       | Qualidade JPEG | Maior lado da imagem |
  | ----------- | -------------- | -------------------- |
  | Baixo       | 85%            | 2500 px              |
  | Recomendado | 70%            | 1800 px              |
  | Extremo     | 50%            | 1200 px              |

- **Erros**: toda resposta de erro tem o mesmo formato, com `message` sempre como lista. Erros inesperados vão para o log e o cliente recebe só `"Internal server error"`.

  ```json
  { "statusCode": 400, "error": "Bad Request", "message": ["order must look like \"3,1,2\""] }
  ```

- **Proteção da API**: limite de requisições por IP e por ferramenta (`429` com `Retry-After`), headers de segurança com helmet e CORS restrito às origens configuradas.
- **Site**: cada ferramenta é uma entrada em `web/src/lib/tools.ts`, e uma única página genérica monta o upload, os campos e o envio. Os textos ficam em `web/src/i18n/`: o inglês é tipado contra o português, e um teste confere se toda ferramenta e todo campo têm texto nos dois idiomas.

### Endpoints (`/api/v1`)

Todas as rotas `POST` recebem `multipart/form-data` e devolvem o arquivo como download. A documentação interativa fica em **http://localhost:3000/docs**.

| Método | Rota                    | Entrada                                            | Saída |
| ------ | ----------------------- | -------------------------------------------------- | ----- |
| GET    | `/health`               | —                                                  | JSON  |
| POST   | `/merge`                | `files[]` (2–20 PDFs)                              | PDF   |
| POST   | `/split`                | `file`, `ranges` (`1-3,5`)                         | ZIP   |
| POST   | `/compress`             | `file`, `level?` (`low`, `recommended`, `extreme`) | PDF   |
| POST   | `/rotate`               | `file`, `angle` (`90`, `180`, `270`), `pages?`     | PDF   |
| POST   | `/organize`             | `file`, `order` (`3,1,2`)                          | PDF   |
| POST   | `/convert/image-to-pdf` | `files[]` (JPEG/PNG, até 20)                       | PDF   |
| POST   | `/convert/pdf-to-image` | `file`, `format?` (`jpeg`, `png`)                  | ZIP   |
| POST   | `/watermark`            | `file`, `text`, `opacity?`                         | PDF   |
| POST   | `/page-numbers`         | `file`, `position?`, `startAt?`                    | PDF   |
| POST   | `/security/protect`     | `file`, `password` (4–128 caracteres)              | PDF   |
| POST   | `/security/unlock`      | `file`, `password`                                 | PDF   |

### Estrutura

```
src/                          API (NestJS)
  main.ts, app.module.ts      bootstrap e registro dos módulos
  app.setup.ts                prefixo, versão, validação, CORS, helmet, Swagger (usado também no e2e)
  config/env.ts               leitura e validação do .env
  common/
    pdf/                      abrir PDF com erros claros, intervalos de páginas (+ testes)
    files/                    validação de upload, resposta de download
    filters/                  formato único de erro (+ testes)
    decorators/               @ApiFileOperation (Swagger de upload/download)
  modules/<ferramenta>/       controller, service (+ testes) e DTOs de cada ferramenta
test/
  app.e2e-spec.ts             testes HTTP de ponta a ponta
  fixtures/images.ts          PNG/JPEG gerados para os testes
web/                          site (Vue) — detalhes em web/README.md
  src/lib/tools.ts            catálogo das ferramentas
  src/lib/api.ts              chamada à API, nome do arquivo e mensagens de erro (+ testes)
  src/i18n/                   português e inglês (+ testes)
  src/views/                  início e página genérica da ferramenta
  src/components/             upload, lista de arquivos, ícones, idioma, tema, link do GitHub
```

### Adicionando uma ferramenta

1. **API**: crie `src/modules/<nome>/` copiando um módulo existente. O controller usa `FileInterceptor`, `PdfFilePipe`, `@ApiFileOperation` e `fileResponse`. O service abre o PDF com `loadPdf`. Registre o módulo em `src/app.module.ts`.
2. **Site**: adicione a entrada em `web/src/lib/tools.ts` e os textos em `web/src/i18n/pt-BR.ts` e `en.ts`. O `npm test` em `web` avisa se faltar algum texto.

## Limitações conhecidas

- **Comprimir** só recomprime fotos JPEG (RGB ou tons de cinza). Imagens em outros formatos, CMYK ou com máscara ficam como estão, então PDFs só de texto diminuem pouco.
- **PDF para imagem** aceita até 100 páginas por arquivo. A renderização roda na thread principal da API, então uma conversão grande atrasa as outras requisições.
- **Marca d'água** e **números de página** usam as fontes padrão do PDF: alfabeto latino com acentos funciona; emoji, chinês etc. são recusados com uma mensagem. A marca d'água ignora a rotação própria da página.
- **Juntar, dividir, organizar e desbloquear** criam um PDF novo a partir das páginas, então marcadores, formulários e metadados (título, autor) do original não são mantidos.
- Fotos com orientação EXIF espelhada (raras em câmeras) são giradas, mas não espelhadas.
- As mensagens de erro da API são em inglês, mesmo com o site em português.
- O limite de requisições fica na memória do processo. Atrás de um proxy (Nginx, Cloudflare) é preciso ativar o `trust proxy`; com mais de uma instância da API, mova o limite para o Redis.
- No Windows, filtros de rede como o AdGuard interceptam o `localhost` e fazem os testes e2e falharem às vezes com `ECONNRESET`. Coloque o `node.exe` nas exceções.

## Créditos

- Edição e criptografia de PDF: [`@cantoo/pdf-lib`](https://github.com/cantoo-scribe/pdf-lib) (MIT), fork da [pdf-lib](https://github.com/Hopding/pdf-lib) de Andrew Dillon.
- Renderização de páginas: [pdf.js](https://github.com/mozilla/pdf.js), da Mozilla (Apache-2.0), sobre o [`@napi-rs/canvas`](https://github.com/Brooooooklyn/canvas) (MIT).
- Arquivos ZIP: [fflate](https://github.com/101arrowz/fflate) (MIT).
- API: [NestJS](https://nestjs.com). Site: [Vue](https://vuejs.org), [Vite](https://vite.dev) e [Tailwind CSS](https://tailwindcss.com).
- Componentes de interface: [shadcn-vue](https://www.shadcn-vue.com) e [Reka UI](https://reka-ui.com). Ícones: [Lucide](https://lucide.dev) e o símbolo do GitHub do [Octicons](https://github.com/primer/octicons) (MIT).
- Fonte: [Geist](https://vercel.com/font), da Vercel (SIL Open Font License), servida pelo próprio site.
