import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20261002_003631 from './20261002_003631';
import * as migration_20261002_032654 from './20261002_032654';
import * as migration_20261002_120000 from './20261002_120000';
import * as migration_20261011_035219_directory_countries_towns_shops from './20261011_035219_directory_countries_towns_shops';
import * as migration_20261011_041543_claim_pay_later from './20261011_041543_claim_pay_later';

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20261002_003631.up,
    down: migration_20261002_003631.down,
    name: '20261002_003631',
  },
  {
    up: migration_20261002_032654.up,
    down: migration_20261002_032654.down,
    name: '20261002_032654',
  },
  {
    up: migration_20261002_120000.up,
    down: migration_20261002_120000.down,
    name: '20261002_120000',
  },
  {
    up: migration_20261011_035219_directory_countries_towns_shops.up,
    down: migration_20261011_035219_directory_countries_towns_shops.down,
    name: '20261011_035219_directory_countries_towns_shops',
  },
  {
    up: migration_20261011_041543_claim_pay_later.up,
    down: migration_20261011_041543_claim_pay_later.down,
    name: '20261011_041543_claim_pay_later'
  },
];
