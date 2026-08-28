import * as migration_20260812_124651_m2_collections from './20260812_124651_m2_collections';
import * as migration_20260812_153409_m2_product_badge from './20260812_153409_m2_product_badge';
import * as migration_20260814_082232_m4_brand_order from './20260814_082232_m4_brand_order';
import * as migration_20260828_114620_slug_optional from './20260828_114620_slug_optional';

export const migrations = [
  {
    up: migration_20260812_124651_m2_collections.up,
    down: migration_20260812_124651_m2_collections.down,
    name: '20260812_124651_m2_collections',
  },
  {
    up: migration_20260812_153409_m2_product_badge.up,
    down: migration_20260812_153409_m2_product_badge.down,
    name: '20260812_153409_m2_product_badge',
  },
  {
    up: migration_20260814_082232_m4_brand_order.up,
    down: migration_20260814_082232_m4_brand_order.down,
    name: '20260814_082232_m4_brand_order',
  },
  {
    up: migration_20260828_114620_slug_optional.up,
    down: migration_20260828_114620_slug_optional.down,
    name: '20260828_114620_slug_optional'
  },
];
