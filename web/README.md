# FoculessPDF — Front-end

Interface em Vue 3 para a API do FoculessPDF.

## Stack

- **Vue 3** + **Vite** + TypeScript
- **Tailwind CSS 4** + **shadcn-vue** (componentes em `src/components/ui`)
- **vue-router**, **axios** (progresso de upload), **vue-sonner** (toasts), **vue-i18n** (português e inglês)
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
├── i18n/
│   ├── index.ts          # idioma inicial (salvo ou do navegador) e troca de idioma
│   ├── pt-BR.ts          # textos em português
│   └── en.ts             # textos em inglês (tipado contra o pt-BR: chave faltando não compila)
├── lib/
│   ├── tools.ts          # catálogo das ferramentas: rota da API, campos, limites (sem textos)
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

1. Adicione a entrada em `src/lib/tools.ts` (rota da API, tipos de arquivo, campos).
2. Adicione os textos em `src/i18n/pt-BR.ts` e `src/i18n/en.ts`, em `tools.<id>`: título, descrição e, para cada campo, `label`, `placeholder`/`hint` ou `options`.
3. `npm test` confere se toda ferramenta e todo campo têm texto nos dois idiomas.
