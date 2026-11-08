import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { IEMModel } from '@/core/types/audio';
import { IEM_CATALOG } from './iemCatalog';

const DB_NAME = 'audiophile.db';
let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase | null> {
  if (Platform.OS === 'web') {
    return null;
  }
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbInstance;
}

export async function initializeLocalDatabase(): Promise<void> {
  if (Platform.OS === 'web') {
    console.info('[SQLite] Web environment initialized with IEM catalog in-memory store.');
    return;
  }

  const db = await getDatabase();
  if (!db) return;

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS local_iems (
      id TEXT PRIMARY KEY,
      manufacturer_name TEXT NOT NULL,
      model_name TEXT NOT NULL,
      driver_type TEXT NOT NULL,
      driver_count INTEGER DEFAULT 1,
      impedance_ohms REAL NOT NULL,
      sensitivity_db_mw REAL NOT NULL,
      release_year INTEGER,
      description TEXT,
      image_url TEXT,
      is_saved_to_library INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS local_profiles (
      id TEXT PRIMARY KEY,
      iem_id TEXT,
      creator_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      profile_type TEXT NOT NULL,
      scenario TEXT NOT NULL,
      target_curve TEXT,
      source_attribution TEXT,
      preamp_db REAL DEFAULT 0.0,
      is_public INTEGER DEFAULT 0,
      is_verified INTEGER DEFAULT 0,
      sync_status TEXT DEFAULT 'synced',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(iem_id) REFERENCES local_iems(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS local_filters (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      filter_index INTEGER NOT NULL,
      filter_type TEXT NOT NULL,
      frequency_hz REAL NOT NULL,
      gain_db REAL NOT NULL,
      q_factor REAL NOT NULL,
      is_enabled INTEGER DEFAULT 1,
      FOREIGN KEY(profile_id) REFERENCES local_profiles(id) ON DELETE CASCADE
    );
  `);

  await seedCatalogData(db);
}

async function seedCatalogData(db: SQLite.SQLiteDatabase): Promise<void> {
  const countResult = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM local_iems;'
  );

  if (countResult && countResult.count >= IEM_CATALOG.length) {
    return;
  }

  for (const iem of IEM_CATALOG) {
    await db.runAsync(
      `INSERT OR REPLACE INTO local_iems (
        id, manufacturer_name, model_name, driver_type, driver_count,
        impedance_ohms, sensitivity_db_mw, release_year, description, is_saved_to_library, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        iem.id,
        iem.manufacturerName,
        iem.name,
        iem.driverType,
        iem.driverCount,
        iem.impedanceOhms,
        iem.sensitivityDbMw,
        iem.releaseYear ?? null,
        iem.description ?? '',
        iem.isSavedToLibrary ? 1 : 0,
        iem.id === 'iem-1' ? 1 : 0,
      ]
    );
  }
}

export async function getLocalIEMs(): Promise<IEMModel[]> {
  if (Platform.OS === 'web') {
    return IEM_CATALOG.map((i) => ({
      id: i.id,
      manufacturerName: i.manufacturerName,
      name: i.name,
      driverType: i.driverType,
      driverCount: i.driverCount,
      impedanceOhms: i.impedanceOhms,
      sensitivityDbMw: i.sensitivityDbMw,
      releaseYear: i.releaseYear,
      description: i.description,
      imageUrl: i.imageUrl,
      isSavedToLibrary: i.isSavedToLibrary,
    }));
  }

  const db = await getDatabase();
  if (!db) {
    return IEM_CATALOG;
  }

  const rows = await db.getAllAsync<{
    id: string;
    manufacturer_name: string;
    model_name: string;
    driver_type: string;
    driver_count: number;
    impedance_ohms: number;
    sensitivity_db_mw: number;
    release_year: number | null;
    description: string | null;
    image_url: string | null;
    is_saved_to_library: number;
  }>('SELECT * FROM local_iems ORDER BY manufacturer_name, model_name;');

  return rows.map((r) => ({
    id: r.id,
    manufacturerName: r.manufacturer_name,
    name: r.model_name,
    driverType: r.driver_type,
    driverCount: r.driver_count,
    impedanceOhms: r.impedance_ohms,
    sensitivityDbMw: r.sensitivity_db_mw,
    releaseYear: r.release_year ?? undefined,
    description: r.description ?? undefined,
    imageUrl: r.image_url ?? undefined,
    isSavedToLibrary: Boolean(r.is_saved_to_library),
  }));
}
