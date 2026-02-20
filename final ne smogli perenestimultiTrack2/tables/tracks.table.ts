// This file is auto-generated via createOrUpdateHeapTableFile API and should not be edited manually
import { Heap } from '@app/heap'

export const TMultiTrack2TracksV2AhI = Heap.Table(
  't_multiTrack2_tracks_v2_ahI',
  {
    songId: Heap.Optional(Heap.RefLink('t_multiTrack2_songs_v2_hJC', { customMeta: { title: 'Песня' } })),
    name: Heap.Optional(Heap.String({ customMeta: { title: 'Название (бас, гитара, барабаны...)' } })),
    fileHash: Heap.Optional(Heap.String({ customMeta: { title: 'Hash аудиофайла' } })),
    sortOrder: Heap.Optional(Heap.Number({ customMeta: { title: 'Порядок отображения' } })),
    color: Heap.Optional(Heap.String({ customMeta: { title: 'Цвет трека в плеере' } })),
  },
  { customMeta: { title: 'Треки (стемы)', description: 'Треки (стемы)' } },
)

export default TMultiTrack2TracksV2AhI

export type TMultiTrack2TracksV2AhIRow = typeof TMultiTrack2TracksV2AhI.T
export type TMultiTrack2TracksV2AhIRowJson = typeof TMultiTrack2TracksV2AhI.JsonT
