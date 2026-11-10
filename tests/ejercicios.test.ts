import { test } from 'node:test'
import assert from 'node:assert/strict'
import { EJERCICIOS, ESTACIONES, ejercicioPorSlug, nombreArchivo } from '../src/lib/ejercicios/catalogo'
import { embedDeVideo, normalizarVideoUrl } from '../src/lib/ejercicios/video'

test('catálogo: slugs y códigos únicos, sin campos vacíos', () => {
  assert.equal(new Set(EJERCICIOS.map(e => e.slug)).size, EJERCICIOS.length)
  assert.equal(new Set(EJERCICIOS.map(e => e.codigo)).size, EJERCICIOS.length)
  for (const e of EJERCICIOS) {
    assert.match(e.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/)
    assert.ok(e.nombre && e.grupo && e.clave && e.error, e.slug)
  }
})

test('catálogo: el código sigue el orden de la estación', () => {
  assert.equal(ESTACIONES[0].ejercicios[0].codigo, '1.01')
  const e = ejercicioPorSlug('press-inclinado-con-mancuernas')
  assert.ok(e)
  assert.equal(nombreArchivo(e), `${e.codigo}-press-inclinado-con-mancuernas`)
})

test('video: solo acepta links https', () => {
  assert.equal(normalizarVideoUrl('http://youtu.be/abc12345678'), null)
  assert.equal(normalizarVideoUrl('javascript:alert(1)'), null)
  assert.equal(normalizarVideoUrl('no es un link'), null)
  assert.equal(normalizarVideoUrl(' https://youtu.be/abc12345678 '), 'https://youtu.be/abc12345678')
})

test('video: reconoce los formatos de YouTube y los archivos directos', () => {
  const esperado = 'https://www.youtube-nocookie.com/embed/abc12345678?rel=0&playsinline=1'
  for (const url of [
    'https://youtu.be/abc12345678',
    'https://www.youtube.com/watch?v=abc12345678',
    'https://youtube.com/shorts/abc12345678?feature=share',
    'https://m.youtube.com/watch?v=abc12345678',
  ]) {
    assert.deepEqual(embedDeVideo(url), { tipo: 'youtube', src: esperado })
  }
  assert.equal(embedDeVideo('https://x.public.blob.vercel-storage.com/sentadilla.mp4').tipo, 'archivo')
  assert.equal(embedDeVideo('https://vimeo.com/123456').tipo, 'link')
})
