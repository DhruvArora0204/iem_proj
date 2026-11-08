import { create } from 'zustand';
import type { ConnectedDeviceState } from '../core/types/audio';

export interface DeviceStoreState {
  currentDevice: ConnectedDeviceState;
  isDetecting: boolean;
  setConnectedDevice: (device: ConnectedDeviceState) => void;
  setIsDetecting: (isDetecting: boolean) => void;
}

export const useDeviceStore = create<DeviceStoreState>((set) => ({
  currentDevice: {
    routeType: 'usb_dac',
    deviceName: 'FiiO KA13 High-Res DAC',
    codec: 'UAC2 32-bit / 384 kHz PCM',
    isExternalDAC: true,
    sampleRate: 48000,
  },
  isDetecting: false,

  setConnectedDevice: (device) => set({ currentDevice: device }),
  setIsDetecting: (isDetecting) => set({ isDetecting }),
}));
