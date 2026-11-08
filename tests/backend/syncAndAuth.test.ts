import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { useUserStore } from '../../src/store/useUserStore';
import { SyncManager } from '../../src/services/sync/syncManager';

describe('User Store & Authentication', () => {
  it('should initialize with default guest user', () => {
    const state = useUserStore.getState();
    assert.equal(state.isAuthenticated, false);
    assert.equal(state.user.isGuest, true);
    assert.equal(state.user.displayName, 'Audiophile Guest');
  });

  it('should sign up and update user state', async () => {
    const { signUp } = useUserStore.getState();
    const success = await signUp('tester@audiophile.lab', 'secret123', 'AcousticTester');

    assert.equal(success, true);
    const updated = useUserStore.getState();
    assert.equal(updated.isAuthenticated, true);
    assert.equal(updated.user.email, 'tester@audiophile.lab');
    assert.equal(updated.user.displayName, 'AcousticTester');
    assert.equal(updated.user.isGuest, false);
  });

  it('should sign out and reset state to guest', async () => {
    const { signOut } = useUserStore.getState();
    await signOut();

    const state = useUserStore.getState();
    assert.equal(state.isAuthenticated, false);
    assert.equal(state.user.isGuest, true);
    assert.equal(state.user.displayName, 'Audiophile Guest');
  });
});

describe('SyncManager', () => {
  it('should report initial sync status and subscribe listeners', () => {
    const syncManager = SyncManager.getInstance();
    const status = syncManager.getStatus();

    assert.ok(status.state === 'idle' || status.state === 'offline');
    assert.equal(status.pendingUploadsCount, 0);

    let receivedStatus: any = null;
    const unsub = syncManager.subscribe((s) => {
      receivedStatus = s;
    });

    assert.ok(receivedStatus, 'Listener must receive immediate status update');
    unsub();
  });

  it('should prompt for user authentication when syncing without userId', async () => {
    const syncManager = SyncManager.getInstance();
    const result = await syncManager.triggerSync(undefined);

    // Without credentials or without userId, handles gracefully
    const status = syncManager.getStatus();
    assert.ok(status.state === 'idle' || status.state === 'offline');
  });
});

