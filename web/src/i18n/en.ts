import type ptBR from './pt-BR'

// Typed against the Portuguese messages so a missing or misspelled key fails the type-check.
const en: typeof ptBR = {
  app: {
    footer: 'Your files are processed in memory and discarded right after. Nothing is stored.',
    homeTitle: 'PDF tools',
    github: 'Source code on GitHub',
  },
  theme: {
    toDark: 'Switch to dark mode',
    toLight: 'Switch to light mode',
  },
  home: {
    title: 'PDF tools, without the distractions',
    subtitle: 'No ads, no trackers, no sign-up. Just you, your file and the job at hand.',
    noAds: 'No ads',
    noTelemetry: 'No telemetry',
    noSignup: 'No sign-up',
  },
  dropzone: {
    single: 'Drag the file here or click to choose',
    multiple: 'Drag the files here or click to choose',
    limit: 'Up to {size} per file',
  },
  fileList: {
    moveUp: 'Move {name} up',
    moveDown: 'Move {name} down',
    remove: 'Remove {name}',
  },
  tool: {
    back: 'All tools',
    minFiles: 'Add at least {count} files.',
    optional: '(optional)',
    clear: 'Clear files',
    sending: 'Uploading… {percent}%',
    processing: 'Processing…',
    progress: 'Upload progress',
    done: 'Done! {filename} was downloaded.',
    failed: 'Could not process the file',
    wrongType: '"{name}" is not a {kind} file and was skipped.',
    tooBig: '"{name}" exceeds the {size} limit and was skipped.',
    maxFiles: 'At most {count} files.',
    alreadyOptimized: 'The file was already optimized.',
    sizeReport: '{from} → {to} (−{percent}%)',
  },
  api: {
    unreachable: 'Could not reach the API. Is it running?',
    unexpected: 'Unexpected error. Please try again.',
    status: 'Error {status} while processing the file.',
  },
  accept: {
    pdf: 'PDF',
    image: 'JPG or PNG',
  },
  tools: {
    merge: {
      title: 'Merge PDF',
      description: 'Combine several PDFs into one, in the order you choose.',
    },
    split: {
      title: 'Split PDF',
      description: 'Extract page ranges into separate PDFs.',
      fields: {
        ranges: {
          label: 'Page ranges',
          placeholder: '1-3,5,8-10',
          hint: 'Each range becomes a PDF. The result is a ZIP file.',
        },
      },
    },
    rotate: {
      title: 'Rotate PDF',
      description: 'Rotate every page or only the ones you pick.',
      fields: {
        angle: {
          label: 'Rotation',
          options: { '90': '90° clockwise', '180': '180°', '270': '90° counter-clockwise' },
        },
        pages: {
          label: 'Pages',
          placeholder: '1,4-5',
          hint: 'Leave empty to rotate all pages.',
        },
      },
    },
    organize: {
      title: 'Organize PDF',
      description: 'Reorder or remove pages from your PDF.',
      fields: {
        order: {
          label: 'New page order',
          placeholder: '3,1,2',
          hint: 'Pages left out of the list are removed.',
        },
      },
    },
    compress: {
      title: 'Compress PDF',
      description: 'Reduce the file size while keeping the quality.',
      fields: {
        level: {
          label: 'Compression level',
          options: {
            recommended: 'Recommended (good quality, much smaller)',
            low: 'Low (best quality)',
            extreme: 'Extreme (smallest file)',
          },
        },
      },
    },
    'image-to-pdf': {
      title: 'JPG to PDF',
      description: 'Convert JPG or PNG images into a PDF.',
    },
    'pdf-to-image': {
      title: 'PDF to JPG',
      description: 'Turn every page into an image.',
      fields: {
        format: {
          label: 'Format',
          options: { jpeg: 'JPG (smaller files)', png: 'PNG (lossless)' },
        },
      },
    },
    watermark: {
      title: 'Watermark',
      description: 'Stamp a text over the pages of your PDF.',
      fields: {
        text: {
          label: 'Text',
          placeholder: 'CONFIDENTIAL',
          hint: 'Placed diagonally in the center of every page. Up to 100 characters.',
        },
        opacity: {
          label: 'Intensity',
          options: { light: 'Light', medium: 'Medium', strong: 'Strong' },
        },
      },
    },
    'page-numbers': {
      title: 'Page numbers',
      description: 'Number the pages of your PDF.',
      fields: {
        position: {
          label: 'Position',
          options: {
            'bottom-center': 'Bottom, center',
            'bottom-right': 'Bottom, right',
            'bottom-left': 'Bottom, left',
            'top-center': 'Top, center',
            'top-right': 'Top, right',
            'top-left': 'Top, left',
          },
        },
        startAt: {
          label: 'Start at',
          placeholder: '1',
          hint: 'Number of the first page. Leave empty to start at 1.',
        },
      },
    },
    protect: {
      title: 'Protect PDF',
      description: 'Add a password to your PDF.',
      fields: {
        password: {
          label: 'Password',
          placeholder: 'At least 4 characters',
          hint: 'The password will be required to open the PDF. Keep it safe: it cannot be recovered.',
        },
      },
    },
    unlock: {
      title: 'Unlock PDF',
      description: 'Remove the password from a PDF.',
      fields: {
        password: {
          label: 'Current PDF password',
          placeholder: 'Enter the password',
        },
      },
    },
  },
}

export default en
