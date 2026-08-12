import * as migration_20260812_124651_m2_collections from './20260812_124651_m2_collections';
import * as migration_20260812_153409_m2_product_badge from './20260812_153409_m2_product_badge';

export const migrations = [
  {
    up: migration_20260812_124651_m2_collections.up,
    down: migration_20260812_124651_m2_collections.down,
    name: '20260812_124651_m2_collections',
  },
  {
    up: migration_20260812_153409_m2_product_badge.up,
    down: migration_20260812_153409_m2_product_badge.down,
    name: '20260812_153409_m2_product_badge'
  },
];
