import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { useAudioStore } from '../../src/store/useAudioStore';

describe('useAudioStore', () => {
  it('should initialize with default Moondrop Blessing 3 and Harman profile', () => {
    const state = useAudioStore.getState();
    assert.equal(state.activeIEM.name, 'Blessing 3');
    assert.equal(state.activeIEM.manufacturerName, 'Moondrop');
    assert.equal(state.activeProfile.targetCurve, 'Harman In-Ear 2019v2');
    assert.equal(state.isBypassed, false);
    assert.equal(state.filters.length, 6);
  });

  it('should toggle bypass correctly', () => {
    const { toggleBypass } = useAudioStore.getState();
    assert.equal(useAudioStore.getState().isBypassed, false);
    
    toggleBypass();
    assert.equal(useAudioStore.getState().isBypassed, true);

    toggleBypass();
    assert.equal(useAudioStore.getState().isBypassed, false);
  });

  it('should clamp preamp gain within [-24, +6] dB', () => {
    const { setPreamp } = useAudioStore.getState();

    setPreamp(12.0);
    assert.equal(useAudioStore.getState().preampDb, 6.0);

    setPreamp(-35.0);
    assert.equal(useAudioStore.getState().preampDb, -24.0);

    setPreamp(-3.5);
    assert.equal(useAudioStore.getState().preampDb, -3.5);
  });

  it('should update specific filter band parameters', () => {
    const { updateFilter, filters } = useAudioStore.getState();
    const targetId = filters[0].id;

    updateFilter(targetId, { gain: 5.5, q: 1.4 });

    const updated = useAudioStore.getState().filters.find((f) => f.id === targetId);
    assert.equal(updated?.gain, 5.5);
    assert.equal(updated?.q, 1.4);
  });

  it('should switch scenario and update macro knobs', () => {
    const { setScenario, setMacroKnob } = useAudioStore.getState();

    setScenario('gaming_fps');
    assert.equal(useAudioStore.getState().activeScenario, 'gaming_fps');

    setMacroKnob('bass', 3.5);
    setMacroKnob('clarity', 2.0);
    assert.equal(useAudioStore.getState().macroKnobs.bass, 3.5);
    assert.equal(useAudioStore.getState().macroKnobs.clarity, 2.0);
  });

  it('should reset to flat profile', () => {
    const { resetToFlat } = useAudioStore.getState();
    resetToFlat();

    const state = useAudioStore.getState();
    assert.equal(state.preampDb, 0.0);
    assert.equal(state.macroKnobs.bass, 0);
    assert.equal(state.macroKnobs.clarity, 0);
    // All filters should have 0 gain
    for (const filter of state.filters) {
      assert.equal(filter.gain, 0.0);
    }
  });
});
