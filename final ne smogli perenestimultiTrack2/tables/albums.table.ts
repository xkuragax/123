// This file is auto-generated via createOrUpdateHeapTableFile API and should not be edited manually
import { Heap } from '@app/heap'

export const TMultiTrack2AlbumsV2Wcd = Heap.Table(
  't_multiTrack2_albums_v2_wcd',
  {
    title: Heap.Optional(
      Heap.String({ customMeta: { title: 'Название' }, searchable: { langs: ['ru', 'en'], embeddings: true } }),
    ),
    artist: Heap.Optional(
      Heap.String({ customMeta: { title: 'Исполнитель' }, searchable: { langs: ['ru', 'en'], embeddings: true } }),
    ),
    coverHash: Heap.Optional(Heap.String({ customMeta: { title: 'Обложка (hash файла)' } })),
    year: Heap.Optional(Heap.Number({ customMeta: { title: 'Год выпуска' } })),
    sortOrder: Heap.Optional(Heap.Number({ customMeta: { title: 'Порядок сортировки' } })),
  },
  { customMeta: { title: 'Альбомы', description: 'Альбомы' } },
)

export default TMultiTrack2AlbumsV2Wcd

export type TMultiTrack2AlbumsV2WcdRow = typeof TMultiTrack2AlbumsV2Wcd.T
export type TMultiTrack2AlbumsV2WcdRowJson = typeof TMultiTrack2AlbumsV2Wcd.JsonT
