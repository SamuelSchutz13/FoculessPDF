import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios'
import { beforeAll, describe, expect, it } from 'vitest'
import { i18n } from '@/i18n'
import { errorMessages, filenameFrom } from './api'

const responseWith = (status: number, data: unknown) =>
  ({ status, data, headers: {}, statusText: '', config: { headers: new AxiosHeaders() } }) as AxiosResponse

const axiosError = (response?: AxiosResponse) =>
  new AxiosError('failed', 'ERR', undefined, undefined, response)

describe('filenameFrom', () => {
  it('reads the filename from Content-Disposition', () => {
    expect(filenameFrom('attachment; filename="merged.pdf"')).toBe('merged.pdf')
  })

  it('returns undefined when the header is missing', () => {
    expect(filenameFrom(undefined)).toBeUndefined()
  })
})

describe('errorMessages', () => {
  beforeAll(() => {
    i18n.global.locale.value = 'pt-BR'
  })

  it('reads the API message list from a Blob body', async () => {
    const body = new Blob([JSON.stringify({ statusCode: 400, message: ['Page 2 appears more than once'] })])
    expect(await errorMessages(axiosError(responseWith(400, body)))).toEqual([
      'Page 2 appears more than once',
    ])
  })

  it('falls back to the status when the body is not the API format', async () => {
    expect(await errorMessages(axiosError(responseWith(502, new Blob(['<html>']))))).toEqual([
      'Erro 502 ao processar o arquivo.',
    ])
  })

  it('explains when the API is unreachable', async () => {
    expect(await errorMessages(axiosError())).toEqual([
      'Não foi possível conectar à API. Ela está rodando?',
    ])
  })
})
