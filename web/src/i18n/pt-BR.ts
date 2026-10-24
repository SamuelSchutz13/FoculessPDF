export default {
  app: {
    footer: 'Seus arquivos são processados na memória e descartados logo em seguida. Nada fica salvo.',
    switchLanguage: 'Switch to English',
    homeTitle: 'Ferramentas de PDF',
  },
  theme: {
    toDark: 'Ativar modo escuro',
    toLight: 'Ativar modo claro',
  },
  home: {
    title: 'Todas as ferramentas de PDF em um só lugar',
    subtitle:
      'Junte, divida, comprima, converta e proteja seus PDFs direto no navegador. Gratuito e sem cadastro.',
  },
  dropzone: {
    single: 'Arraste o arquivo aqui ou clique para escolher',
    multiple: 'Arraste os arquivos aqui ou clique para escolher',
    limit: 'Até {size} por arquivo',
  },
  fileList: {
    moveUp: 'Mover {name} para cima',
    moveDown: 'Mover {name} para baixo',
    remove: 'Remover {name}',
  },
  tool: {
    back: 'Todas as ferramentas',
    minFiles: 'Adicione pelo menos {count} arquivos.',
    optional: '(opcional)',
    clear: 'Limpar arquivos',
    sending: 'Enviando… {percent}%',
    processing: 'Processando…',
    progress: 'Progresso do envio',
    done: 'Pronto! {filename} foi baixado.',
    failed: 'Não foi possível processar o arquivo',
    wrongType: '"{name}" não é um arquivo {kind} e foi ignorado.',
    tooBig: '"{name}" passa do limite de {size} e foi ignorado.',
    maxFiles: 'Máximo de {count} arquivos.',
    alreadyOptimized: 'O arquivo já estava otimizado.',
    sizeReport: '{from} → {to} (−{percent}%)',
  },
  api: {
    unreachable: 'Não foi possível conectar à API. Ela está rodando?',
    unexpected: 'Erro inesperado. Tente novamente.',
    status: 'Erro {status} ao processar o arquivo.',
  },
  accept: {
    pdf: 'PDF',
    image: 'JPG ou PNG',
  },
  tools: {
    merge: {
      title: 'Juntar PDF',
      description: 'Combine vários PDFs em um só, na ordem que você escolher.',
    },
    split: {
      title: 'Dividir PDF',
      description: 'Separe intervalos de páginas em PDFs independentes.',
      fields: {
        ranges: {
          label: 'Intervalos',
          placeholder: '1-3,5,8-10',
          hint: 'Cada intervalo vira um PDF. O resultado é um arquivo ZIP.',
        },
      },
    },
    rotate: {
      title: 'Girar PDF',
      description: 'Gire todas as páginas ou só as que você escolher.',
      fields: {
        angle: {
          label: 'Rotação',
          options: { '90': '90° sentido horário', '180': '180°', '270': '90° sentido anti-horário' },
        },
        pages: {
          label: 'Páginas',
          placeholder: '1,4-5',
          hint: 'Deixe vazio para girar todas.',
        },
      },
    },
    organize: {
      title: 'Organizar PDF',
      description: 'Reordene ou remova páginas do seu PDF.',
      fields: {
        order: {
          label: 'Nova ordem das páginas',
          placeholder: '3,1,2',
          hint: 'Páginas que ficarem fora da lista são removidas.',
        },
      },
    },
    compress: {
      title: 'Comprimir PDF',
      description: 'Reduza o tamanho do arquivo mantendo a qualidade.',
      fields: {
        level: {
          label: 'Nível de compressão',
          options: {
            recommended: 'Recomendado (boa qualidade, bem menor)',
            low: 'Baixo (qualidade máxima)',
            extreme: 'Extremo (menor arquivo possível)',
          },
        },
      },
    },
    'image-to-pdf': {
      title: 'JPG para PDF',
      description: 'Converta imagens JPG ou PNG em um PDF.',
    },
    'pdf-to-image': {
      title: 'PDF para JPG',
      description: 'Transforme cada página em uma imagem.',
      fields: {
        format: {
          label: 'Formato',
          options: { jpeg: 'JPG (arquivos menores)', png: 'PNG (sem perda de qualidade)' },
        },
      },
    },
    watermark: {
      title: "Marca d'água",
      description: 'Adicione um texto sobre as páginas do PDF.',
      fields: {
        text: {
          label: 'Texto',
          placeholder: 'CONFIDENCIAL',
          hint: 'Aparece na diagonal, no centro de todas as páginas. Até 100 caracteres.',
        },
        opacity: {
          label: 'Intensidade',
          options: { light: 'Leve', medium: 'Média', strong: 'Forte' },
        },
      },
    },
    'page-numbers': {
      title: 'Números de página',
      description: 'Numere as páginas do seu PDF.',
      fields: {
        position: {
          label: 'Posição',
          options: {
            'bottom-center': 'Rodapé, centro',
            'bottom-right': 'Rodapé, direita',
            'bottom-left': 'Rodapé, esquerda',
            'top-center': 'Topo, centro',
            'top-right': 'Topo, direita',
            'top-left': 'Topo, esquerda',
          },
        },
        startAt: {
          label: 'Começar em',
          placeholder: '1',
          hint: 'Número da primeira página. Deixe vazio para começar em 1.',
        },
      },
    },
    protect: {
      title: 'Proteger PDF',
      description: 'Adicione uma senha ao seu PDF.',
      fields: {
        password: {
          label: 'Senha',
          placeholder: 'Mínimo de 4 caracteres',
          hint: 'A senha será pedida para abrir o PDF. Guarde-a: não é possível recuperá-la.',
        },
      },
    },
    unlock: {
      title: 'Desbloquear PDF',
      description: 'Remova a senha de um PDF.',
      fields: {
        password: {
          label: 'Senha atual do PDF',
          placeholder: 'Digite a senha',
        },
      },
    },
  },
}
