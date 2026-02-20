// This file is auto-generated via createOrUpdateHeapTableFile API and should not be edited manually
import { Heap } from '@app/heap'

export const TMultiTrack2SongsV2HJC = Heap.Table(
  't_multiTrack2_songs_v2_hJC',
  {
    albumId: Heap.Optional(Heap.RefLink('t_multiTrack2_albums_v2_wcd', { customMeta: { title: 'Альбом' } })),
    title: Heap.Optional(
      Heap.String({ customMeta: { title: 'Название' }, searchable: { langs: ['ru', 'en'], embeddings: true } }),
    ),
    trackNumber: Heap.Optional(Heap.Number({ customMeta: { title: 'Номер трека в альбоме' } })),
    lyrics: Heap.Optional(Heap.String({ customMeta: { title: 'Текст песни' } })),
    chords: Heap.Optional(Heap.String({ customMeta: { title: 'Аккорды' } })),
    tabsUrl: Heap.Optional(Heap.String({ customMeta: { title: 'Ссылка на таблатуры (Google Drive)' } })),
    stemsUrl: Heap.Optional(Heap.String({ customMeta: { title: 'Ссылка на стемы (Google Drive)' } })),
    duration: Heap.Optional(Heap.Number({ customMeta: { title: 'Длительность в секундах' } })),
  },
  { customMeta: { title: 'Песни', description: 'Песни' } },
)

export default TMultiTrack2SongsV2HJC

export type TMultiTrack2SongsV2HJCRow = typeof TMultiTrack2SongsV2HJC.T
export type TMultiTrack2SongsV2HJCRowJson = typeof TMultiTrack2SongsV2HJC.JsonT
