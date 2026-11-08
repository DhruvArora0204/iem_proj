import { supabase, isSupabaseConfigured } from '../supabase/client';
import { getDatabase } from '../local-db/sqlite';
import type { EQProfile, BiquadFilterConfig } from '../../core/types/audio';

export type SyncState = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

export interface SyncStatus {
  state: SyncState;
  lastSyncedAt: string | null;
  pendingUploadsCount: number;
  errorMessage: string | null;
}

export class SyncManager {
  private static instance: SyncManager | null = null;
  private state: SyncState = 'idle';
  private lastSyncedAt: string | null = null;
  private pendingUploadsCount = 0;
  private errorMessage: string | null = null;
  private listeners: Set<(status: SyncStatus) => void> = new Set();

  private constructor() {
    this.state = isSupabaseConfigured ? 'idle' : 'offline';
  }

  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  public getStatus(): SyncStatus {
    return {
      state: this.state,
      lastSyncedAt: this.lastSyncedAt,
      pendingUploadsCount: this.pendingUploadsCount,
      errorMessage: this.errorMessage,
    };
  }

  public subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => this.listeners.delete(listener);
  }

  /**
   * Triggers bi-directional synchronization between local SQLite and remote Supabase.
   */
  public async triggerSync(userId?: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      this.state = 'offline';
      this.errorMessage = 'Supabase environment credentials not configured; local offline mode active.';
      this.notify();
      return true;
    }

    if (!userId) {
      this.state = 'idle';
      this.errorMessage = 'Sign in to sync your custom profiles to the cloud.';
      this.notify();
      return false;
    }

    this.state = 'syncing';
    this.errorMessage = null;
    this.notify();

    try {
      // 1. Sync Upstream: Push local profiles with sync_status = 'pending_upload' or 'pending_update'
      await this.pushLocalChanges(userId);

      // 2. Sync Downstream: Fetch cloud profiles owned by this user
      await this.pullRemoteChanges(userId);

      this.state = 'synced';
      this.lastSyncedAt = new Date().toISOString();
      this.pendingUploadsCount = 0;
      this.errorMessage = null;
      this.notify();
      return true;
    } catch (err: any) {
      console.warn('[SyncManager] Sync failed:', err);
      this.state = 'error';
      this.errorMessage = err?.message || 'Sync failed';
      this.notify();
      return false;
    }
  }

  private async pushLocalChanges(userId: string): Promise<void> {
    const db = await getDatabase();
    if (!db) return;

    // Query pending profiles
    const pendingProfiles = (await db.getAllAsync(
      "SELECT * FROM local_profiles WHERE sync_status IN ('pending_upload', 'pending_update');"
    )) as Array<{
      id: string;
      iem_id: string | null;
      name: string;
      description: string | null;
      profile_type: string;
      scenario: string;
      target_curve: string | null;
      source_attribution: string | null;
      preamp_db: number;
      is_public: number;
      sync_status: string;
      updated_at: string;
    }>;

    this.pendingUploadsCount = pendingProfiles.length;
    this.notify();

    for (const p of pendingProfiles) {
      // Upsert profile into Supabase
      const { error: profileError } = await supabase.from('eq_profiles').upsert({
        id: p.id,
        creator_id: userId,
        iem_id: p.iem_id,
        name: p.name,
        description: p.description,
        profile_type: p.profile_type,
        scenario: p.scenario,
        target_curve: p.target_curve,
        source_attribution: p.source_attribution,
        preamp_db: p.preamp_db,
        is_public: Boolean(p.is_public),
        updated_at: p.updated_at,
      });

      if (profileError) {
        console.warn(`[SyncManager] Failed to push profile ${p.id}:`, profileError);
        continue;
      }

      // Fetch corresponding local filters and push
      const localFilters = (await db.getAllAsync(
        'SELECT * FROM local_filters WHERE profile_id = ? ORDER BY filter_index;',
        [p.id]
      )) as Array<{
        id: string;
        filter_index: number;
        filter_type: string;
        frequency_hz: number;
        gain_db: number;
        q_factor: number;
        is_enabled: number;
      }>;

      for (const f of localFilters) {
        await supabase.from('eq_filters').upsert({
          id: f.id,
          profile_id: p.id,
          filter_index: f.filter_index,
          filter_type: f.filter_type,
          frequency_hz: f.frequency_hz,
          gain_db: f.gain_db,
          q_factor: f.q_factor,
          is_enabled: Boolean(f.is_enabled),
        });
      }

      // Mark locally as synced
      await db.runAsync("UPDATE local_profiles SET sync_status = 'synced' WHERE id = ?;", [p.id]);
    }
  }

  private async pullRemoteChanges(userId: string): Promise<void> {
    const db = await getDatabase();
    if (!db) return;

    const { data: remoteProfiles, error } = await supabase
      .from('eq_profiles')
      .select('*, eq_filters(*)')
      .eq('creator_id', userId);

    if (error || !remoteProfiles) {
      if (error) console.warn('[SyncManager] Failed to pull remote profiles:', error);
      return;
    }

    for (const rp of remoteProfiles) {
      // Check if profile exists locally
      const existing = (await db.getFirstAsync(
        'SELECT updated_at FROM local_profiles WHERE id = ?;',
        [rp.id]
      )) as { updated_at: string } | null;

      // Last-Write-Wins (LWW) conflict resolution
      if (existing) {
        const localTime = new Date(existing.updated_at).getTime();
        const remoteTime = new Date(rp.updated_at).getTime();
        if (remoteTime <= localTime) {
          // Local version is newer or equal, skip overwrite
          continue;
        }
      }

      // Insert/update local profile
      await db.runAsync(
        `INSERT OR REPLACE INTO local_profiles (
          id, iem_id, creator_id, name, description, profile_type, scenario,
          target_curve, source_attribution, preamp_db, is_public, sync_status,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?);`,
        [
          rp.id,
          rp.iem_id,
          rp.creator_id,
          rp.name,
          rp.description,
          rp.profile_type,
          rp.scenario,
          rp.target_curve,
          rp.source_attribution,
          rp.preamp_db,
          rp.is_public ? 1 : 0,
          rp.created_at,
          rp.updated_at,
        ]
      );

      // Save filters
      if (Array.isArray(rp.eq_filters)) {
        await db.runAsync('DELETE FROM local_filters WHERE profile_id = ?;', [rp.id]);
        for (const rf of rp.eq_filters) {
          await db.runAsync(
            `INSERT INTO local_filters (
              id, profile_id, filter_index, filter_type, frequency_hz,
              gain_db, q_factor, is_enabled
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [
              rf.id,
              rp.id,
              rf.filter_index,
              rf.filter_type,
              rf.frequency_hz,
              rf.gain_db,
              rf.q_factor,
              rf.is_enabled ? 1 : 0,
            ]
          );
        }
      }
    }
  }

  private notify(): void {
    const status = this.getStatus();
    for (const listener of this.listeners) {
      try {
        listener(status);
      } catch (err) {
        console.warn('[SyncManager] Listener error:', err);
      }
    }
  }
}
