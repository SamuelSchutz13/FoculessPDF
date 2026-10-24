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

/**
 * Field texts live in the i18n messages under tools.<toolId>.fields.<name>
 * (label, placeholder, hint, options.<value>).
 */
export type ToolField =
  | {
      type: 'text'
      name: string
      required: boolean
      /** Renders a password input (masked, no autofill). */
      secret?: boolean
    }
  | {
      type: 'select'
      name: string
      /** value is sent to the API; key names its text (values like 0.25 can't be i18n keys). */
      options: { value: string; key: string }[]
      default: string
    }

/** Title and description live in the i18n messages under tools.<id>. */
export interface Tool {
  id: string
  icon: Component
  /** Path relative to the API base URL. */
  endpoint: string
  /** Multipart field name the API expects: "files" for multi-file tools, "file" otherwise. */
  fileField: 'file' | 'files'
  /** Comma-separated MIME types, as in <input accept>. */
  accept: string
  /** i18n key under "accept", shown when a file of another type is dropped. */
  acceptKind: 'pdf' | 'image'
  minFiles: number
  maxFiles: number
  fields: ToolField[]
  /** Shows how much smaller the result is than the upload (for compress). */
  reportsSize?: boolean
}

const options = (...values: string[]) => values.map((value) => ({ value, key: value }))

const pdf = {
  accept: 'application/pdf',
  acceptKind: 'pdf',
  fileField: 'file',
  minFiles: 1,
  maxFiles: 1,
} as const

export const tools: Tool[] = [
  {
    id: 'merge',
    icon: Merge,
    endpoint: '/merge',
    ...pdf,
    fileField: 'files',
    minFiles: 2,
    maxFiles: 20,
    fields: [],
  },
  {
    id: 'split',
    icon: Scissors,
    endpoint: '/split',
    ...pdf,
    fields: [{ type: 'text', name: 'ranges', required: true }],
  },
  {
    id: 'compress',
    icon: Minimize2,
    endpoint: '/compress',
    ...pdf,
    fields: [
      {
        type: 'select',
        name: 'level',
        options: options('recommended', 'low', 'extreme'),
        default: 'recommended',
      },
    ],
    reportsSize: true,
  },
  {
    id: 'rotate',
    icon: RotateCw,
    endpoint: '/rotate',
    ...pdf,
    fields: [
      { type: 'select', name: 'angle', options: options('90', '180', '270'), default: '90' },
      { type: 'text', name: 'pages', required: false },
    ],
  },
  {
    id: 'organize',
    icon: LayoutGrid,
    endpoint: '/organize',
    ...pdf,
    fields: [{ type: 'text', name: 'order', required: true }],
  },
  {
    id: 'image-to-pdf',
    icon: ImagePlus,
    endpoint: '/convert/image-to-pdf',
    accept: 'image/jpeg,image/png',
    acceptKind: 'image',
    fileField: 'files',
    minFiles: 1,
    maxFiles: 20,
    fields: [],
  },
  {
    id: 'pdf-to-image',
    icon: FileImage,
    endpoint: '/convert/pdf-to-image',
    ...pdf,
    fields: [{ type: 'select', name: 'format', options: options('jpeg', 'png'), default: 'jpeg' }],
  },
  {
    id: 'watermark',
    icon: Droplet,
    endpoint: '/watermark',
    ...pdf,
    fields: [
      { type: 'text', name: 'text', required: true },
      {
        type: 'select',
        name: 'opacity',
        options: [
          { value: '0.25', key: 'light' },
          { value: '0.5', key: 'medium' },
          { value: '0.75', key: 'strong' },
        ],
        default: '0.5',
      },
    ],
  },
  {
    id: 'page-numbers',
    icon: Hash,
    endpoint: '/page-numbers',
    ...pdf,
    fields: [
      {
        type: 'select',
        name: 'position',
        options: options(
          'bottom-center',
          'bottom-right',
          'bottom-left',
          'top-center',
          'top-right',
          'top-left',
        ),
        default: 'bottom-center',
      },
      { type: 'text', name: 'startAt', required: false },
    ],
  },
  {
    id: 'protect',
    icon: Lock,
    endpoint: '/security/protect',
    ...pdf,
    fields: [{ type: 'text', name: 'password', required: true, secret: true }],
  },
  {
    id: 'unlock',
    icon: LockOpen,
    endpoint: '/security/unlock',
    ...pdf,
    fields: [{ type: 'text', name: 'password', required: true, secret: true }],
  },
]

export const findTool = (id: string) => tools.find((tool) => tool.id === id)
