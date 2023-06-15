import { Engine } from './engine'
import { FEATURES } from './features'

const INLINE_SVG = /^data:image\/svg\+xml/i
const INLINE_BASE64 = /^data:image\/.*;base64,/i
const INLINE_IMG = /^data:image\/.*/i

const isRenderable = (src: string): boolean =>
  FEATURES.SUPPORT_SVG_DRAWING || !isSVG(src)
const isInlineImage = (src: string): boolean => INLINE_IMG.test(src)
const isInlineBase64Image = (src: string): boolean => INLINE_BASE64.test(src)
const isBlobImage = (src: string): boolean => src.substr(0, 4) === 'blob'

const isSVG = (src: string): boolean =>
  src.substr(-3).toLowerCase() === 'svg' || INLINE_SVG.test(src)

export interface CacheStorage {
  _link: HTMLAnchorElement
  _origin: string
  getOrigin(url: string): string
  isSameOrigin(src: string): boolean
  // setContext(window: Window): void
}

function getOrigin(this: CacheStorage, url: string): string {
  const link = this._link
  if (!link) {
    return 'about:blank'
  }

  link.href = url
  link.href = link.href // IE9, LOL! - http://jsfiddle.net/niklasvh/2e48b/
  return link.protocol + link.hostname + link.port
}

function isSameOrigin(this: CacheStorage, src: string): boolean {
  return this.getOrigin(src) === this._origin
}

const CacheStorage: CacheStorage = {
  _link: null,
  _origin: 'about:blank',
  getOrigin,
  isSameOrigin
}

export interface ResourceOptions {
  imageTimeout: number
  useCORS: boolean
  allowTaint: boolean
  proxy?: string
}

export interface Cache {
  context: Engine
  addImage(src: string): void
  match(src: string): Promise<any>
  loadImage(key: string): Promise<any>
  has(key: string): boolean
  keys(this: Cache): Promise<string[]>
  proxy(this: Cache, src: string): Promise<string>
}

export function createCache(context: Engine, options: ResourceOptions): Cache {
  let _cache: { [key: string]: Promise<any> } = {},
    _options = options

  let cache: Cache = {
    context,
    addImage,
    match,
    loadImage,
    has,
    keys,
    proxy
  }

  function addImage(this: Cache, src) {
    console.log('addImage', src)
    const result = Promise.resolve()
    if (this.has(src)) {
      return result
    }

    if (isBlobImage(src) || isRenderable(src)) {
      ;(_cache[src] = this.loadImage(src)).catch(() => {
        // prevent unhandled rejection
      })
      return result
    }

    return result
  }

  function match(this: Cache, src: string): Promise<any> {
    return _cache[src]
  }

  async function loadImage(this: Cache, key: string): Promise<any> {
    const isSameOrigin = CacheStorage.isSameOrigin(key)
    const useCORS =
      !isInlineImage(key) &&
      _options.useCORS === true &&
      FEATURES.SUPPORT_CORS_IMAGES &&
      !isSameOrigin
    const useProxy =
      !isInlineImage(key) &&
      !isSameOrigin &&
      !isBlobImage(key) &&
      typeof _options.proxy === 'string' &&
      FEATURES.SUPPORT_CORS_XHR &&
      !useCORS
    if (
      !isSameOrigin &&
      _options.allowTaint === false &&
      !isInlineImage(key) &&
      !isBlobImage(key) &&
      !useProxy &&
      !useCORS
    ) {
      return
    }

    let src = key
    if (useProxy) {
      src = await this.proxy(src)
    }

    this.context.logger.debug(`Added image ${key.substring(0, 256)}`)

    return await new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      //ios safari 10.3 taints canvas with data urls unless crossOrigin is set to anonymous
      if (isInlineBase64Image(src) || useCORS) {
        img.crossOrigin = 'anonymous'
      }
      img.src = src
      if (img.complete === true) {
        // Inline XML images may fail to parse, throwing an Error later on
        setTimeout(() => resolve(img), 500)
      }
      if (_options.imageTimeout > 0) {
        setTimeout(
          () => reject(`Timed out (${_options.imageTimeout}ms) loading image`),
          _options.imageTimeout
        )
      }
    })
  }

  function has(this: Cache, key: string): boolean {
    return typeof _cache[key] !== 'undefined'
  }

  function keys(this: Cache): Promise<string[]> {
    return Promise.resolve(Object.keys(_cache))
  }

  function proxy(this: Cache, src: string): Promise<string> {
    const proxy = _options.proxy

    if (!proxy) {
      throw new Error('No proxy defined')
    }

    const key = src.substring(0, 256)

    return new Promise((resolve, reject) => {
      const responseType = FEATURES.SUPPORT_RESPONSE_TYPE ? 'blob' : 'text'
      const xhr = new XMLHttpRequest()
      xhr.onload = () => {
        if (xhr.status === 200) {
          if (responseType === 'text') {
            resolve(xhr.response)
          } else {
            const reader = new FileReader()
            reader.addEventListener(
              'load',
              () => resolve(reader.result as string),
              false
            )
            reader.addEventListener('error', (e) => reject(e), false)
            reader.readAsDataURL(xhr.response)
          }
        } else {
          reject(
            `Failed to proxy resource ${key} with status code ${xhr.status}`
          )
        }
      }

      xhr.onerror = reject
      const queryString = proxy.indexOf('?') > -1 ? '&' : '?'
      xhr.open(
        'GET',
        `${proxy}${queryString}url=${encodeURIComponent(
          src
        )}&responseType=${responseType}`
      )

      if (responseType !== 'text' && xhr instanceof XMLHttpRequest) {
        xhr.responseType = responseType
      }

      if (_options.imageTimeout) {
        const timeout = _options.imageTimeout
        xhr.timeout = timeout
        xhr.ontimeout = () => reject(`Timed out (${timeout}ms) proxying ${key}`)
      }

      xhr.send()
    })
  }

  return cache
}
