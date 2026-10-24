import {
  Droplet,
  FileImage,
  Hash,
  ImagePlus,
  LayoutGrid,
  Lock,
  LockOpen,
  Merge,
  Minimize2,
  RotateCw,
  Scissors,
} from '@lucide/vue'
import type { Component } from 'vue'

export type ToolField =
  | {
      type: 'text'
      name: string
      label: string
      placeholder: string
      hint?: string
      required: boolean
      /** Renders a password input (masked, no autofill). */
      secret?: boolean
    }
  | {
      type: 'select'
      name: string
      label: string
      options: { value: string; label: string }[]
      default: string
    }

export interface Tool {
  id: string
  title: string
  description: string
  icon: Component
  /** Path relative to the API base URL. */
  endpoint: string
  /** Multipart field name the API expects: "files" for multi-file tools, "file" otherwise. */
  fileField: 'file' | 'files'
  accept: string
  minFiles: number
  maxFiles: number
  fields: ToolField[]
  available: boolean
}

const pdf = { accept: 'application/pdf', fileField: 'file', minFiles: 1, maxFiles: 1 } as const

export const tools: Tool[] = [
  {
    id: 'merge',
    title: 'Juntar PDF',
    description: 'Combine vários PDFs em um só, na ordem que você escolher.',
    icon: Merge,
    endpoint: '/merge',
    ...pdf,
    fileField: 'files',
    minFiles: 2,
    maxFiles: 20,
    fields: [],
    available: true,
  },
  {
    id: 'split',
    title: 'Dividir PDF',
    description: 'Separe intervalos de páginas em PDFs independentes.',
    icon: Scissors,
    endpoint: '/split',
    ...pdf,
    fields: [
      {
        type: 'text',
        name: 'ranges',
        label: 'Intervalos',
        placeholder: '1-3,5,8-10',
        hint: 'Cada intervalo vira um PDF. O resultado é um arquivo ZIP.',
        required: true,
      },
    ],
    available: true,
  },
  {
    id: 'rotate',
    title: 'Girar PDF',
    description: 'Gire todas as páginas ou só as que você escolher.',
    icon: RotateCw,
    endpoint: '/rotate',
    ...pdf,
    fields: [
      {
        type: 'select',
        name: 'angle',
        label: 'Rotação',
        options: [
          { value: '90', label: '90° sentido horário' },
          { value: '180', label: '180°' },
          { value: '270', label: '90° sentido anti-horário' },
        ],
        default: '90',
      },
      {
        type: 'text',
        name: 'pages',
        label: 'Páginas',
        placeholder: '1,4-5',
        hint: 'Deixe vazio para girar todas.',
        required: false,
      },
    ],
    available: true,
  },
  {
    id: 'organize',
    title: 'Organizar PDF',
    description: 'Reordene ou remova páginas do seu PDF.',
    icon: LayoutGrid,
    endpoint: '/organize',
    ...pdf,
    fields: [
      {
        type: 'text',
        name: 'order',
        label: 'Nova ordem das páginas',
        placeholder: '3,1,2',
        hint: 'Páginas que ficarem fora da lista são removidas.',
        required: true,
      },
    ],
    available: true,
  },
  {
    id: 'compress',
    title: 'Comprimir PDF',
    description: 'Reduza o tamanho do arquivo mantendo a qualidade.',
    icon: Minimize2,
    endpoint: '/compress',
    ...pdf,
    fields: [],
    available: false,
  },
  {
    id: 'image-to-pdf',
    title: 'JPG para PDF',
    description: 'Converta imagens JPG ou PNG em um PDF.',
    icon: ImagePlus,
    endpoint: '/convert/image-to-pdf',
    ...pdf,
    fields: [],
    available: false,
  },
  {
    id: 'pdf-to-image',
    title: 'PDF para JPG',
    description: 'Transforme cada página em uma imagem.',
    icon: FileImage,
    endpoint: '/convert/pdf-to-image',
    ...pdf,
    fields: [],
    available: false,
  },
  {
    id: 'watermark',
    title: "Marca d'água",
    description: 'Adicione um texto sobre as páginas do PDF.',
    icon: Droplet,
    endpoint: '/watermark',
    ...pdf,
    fields: [],
    available: false,
  },
  {
    id: 'page-numbers',
    title: 'Números de página',
    description: 'Numere as páginas do seu PDF.',
    icon: Hash,
    endpoint: '/page-numbers',
    ...pdf,
    fields: [],
    available: false,
  },
  {
    id: 'protect',
    title: 'Proteger PDF',
    description: 'Adicione uma senha ao seu PDF.',
    icon: Lock,
    endpoint: '/security/protect',
    ...pdf,
    fields: [
      {
        type: 'text',
        name: 'password',
        label: 'Senha',
        placeholder: 'Mínimo de 4 caracteres',
        hint: 'A senha será pedida para abrir o PDF. Guarde-a: não é possível recuperá-la.',
        required: true,
        secret: true,
      },
    ],
    available: true,
  },
  {
    id: 'unlock',
    title: 'Desbloquear PDF',
    description: 'Remova a senha de um PDF.',
    icon: LockOpen,
    endpoint: '/security/unlock',
    ...pdf,
    fields: [
      {
        type: 'text',
        name: 'password',
        label: 'Senha atual do PDF',
        placeholder: 'Digite a senha',
        required: true,
        secret: true,
      },
    ],
    available: true,
  },
]

export const findTool = (id: string) => tools.find((tool) => tool.id === id && tool.available)
