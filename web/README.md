# FoculessPDF — Front-end

Interface em Vue 3 para a API do FoculessPDF.

## Stack

- **Vue 3** + **Vite** + TypeScript
- **Tailwind CSS 4** + **shadcn-vue** (componentes em `src/components/ui`)
- **vue-router**, **axios** (progresso de upload), **vue-sonner** (toasts)
- **Vitest** para testes

## Começando

A API precisa estar rodando (veja o README da raiz).

```bash
npm install
cp .env.example .env    # opcional: o padrão já aponta para http://localhost:3000/api/v1
npm run dev             # http://localhost:5173
```

## Scripts

| Script               | Descrição                       |
| -------------------- | ------------------------------- |
| `npm run dev`        | Servidor de desenvolvimento     |
| `npm run build`      | Type-check + build para `dist/` |
| `npm run type-check` | Só o type-check (`vue-tsc`)     |
| `npm test`           | Testes (Vitest)                 |

## Estrutura

```
src/
├── main.ts               # monta o app, router e estilos
├── App.vue               # layout: cabeçalho, conteúdo e toasts
├── router.ts             # "/" (início) e "/:tool" (página de cada ferramenta)
├── lib/
│   ├── tools.ts          # catálogo das ferramentas: rota da API, campos, limites
│   ├── api.ts            # chamada à API, nome do arquivo e mensagens de erro
│   └── download.ts       # salvar o arquivo e formatar tamanho
├── views/
│   ├── HomeView.vue      # grade com todas as ferramentas
│   └── ToolView.vue      # página genérica: upload, campos, envio e download
└── components/
    ├── FileDropzone.vue  # área de arrastar/soltar
    ├── FileList.vue      # lista de arquivos (reordenar/remover)
    └── ui/               # componentes do shadcn-vue
```

## Adicionando uma ferramenta

Quando a rota existir na API, basta editar a entrada dela em `src/lib/tools.ts`: preencher `fields` e mudar `available` para `true`. A página é gerada a partir dessa definição.
