import type { IEMModel } from '../../core/types/audio';

export interface IEMMeasurementPoint {
  freq: number;
  spl: number; // dB normalized to 1 kHz (0 dB)
}

export interface IEMMeasurementData {
  iemId: string;
  sourceRig: string;
  measuredBy: string;
  measuredDate: string;
  points: IEMMeasurementPoint[];
}

export interface IEMFullRecord extends IEMModel {
  country: string;
  measurement?: IEMMeasurementData;
}

export const IEM_CATALOG: IEMFullRecord[] = [
  {
    id: 'iem-1',
    manufacturerName: 'Moondrop',
    name: 'Blessing 3',
    country: 'China',
    driverType: '2DD + 4BA Hybrid',
    driverCount: 6,
    impedanceOhms: 14.8,
    sensitivityDbMw: 120.0,
    releaseYear: 2023,
    description: 'Benchmark hybrid IEM with dual horizontally-opposed dynamic drivers (H.O.D.D.D.U.S.) and quad balanced armatures.',
    isSavedToLibrary: true,
    measurement: {
      iemId: 'iem-1',
      sourceRig: 'IEC 60318-4 (711 Coupler)',
      measuredBy: 'SoundLab Acoustics Verification',
      measuredDate: '2023-05-15',
      points: [
        { freq: 20, spl: 4.8 },
        { freq: 50, spl: 4.5 },
        { freq: 105, spl: 2.8 },
        { freq: 200, spl: 1.2 },
        { freq: 500, spl: 0.1 },
        { freq: 1000, spl: 0.0 },
        { freq: 2000, spl: 6.2 },
        { freq: 2800, spl: 11.2 }, // Higher ear gain than Harman
        { freq: 4000, spl: 6.8 },
        { freq: 6000, spl: 6.5 },  // Coupler insertion peak
        { freq: 8000, spl: 5.0 },
        { freq: 10000, spl: 1.5 },
        { freq: 15000, spl: -3.5 },
      ],
    },
  },
  {
    id: 'iem-2',
    manufacturerName: 'Truthear',
    name: 'Zero: RED',
    country: 'China',
    driverType: 'Dual Dynamic (10mm + 7.8mm)',
    driverCount: 2,
    impedanceOhms: 17.5,
    sensitivityDbMw: 117.5,
    releaseYear: 2023,
    description: 'Crinacle collaboration tuned strictly to the modified Harman in-ear target with low distortion dual polyurethane drivers.',
    isSavedToLibrary: true,
    measurement: {
      iemId: 'iem-2',
      sourceRig: 'IEC 60318-4 (711 Coupler)',
      measuredBy: 'Crinacle Standardized Database',
      measuredDate: '2023-06-01',
      points: [
        { freq: 20, spl: 6.5 },
        { freq: 50, spl: 6.0 },
        { freq: 105, spl: 4.5 },
        { freq: 200, spl: 2.2 },
        { freq: 500, spl: 0.2 },
        { freq: 1000, spl: 0.0 },
        { freq: 2000, spl: 5.0 },
        { freq: 2800, spl: 8.5 },
        { freq: 4000, spl: 6.0 },
        { freq: 6000, spl: 2.5 },  // Slight dip in presence
        { freq: 8000, spl: 5.5 },
        { freq: 10000, spl: 2.0 },
        { freq: 15000, spl: -4.0 },
      ],
    },
  },
  {
    id: 'iem-3',
    manufacturerName: '7Hz',
    name: 'Timeless',
    country: 'China',
    driverType: '14.2mm Planar Magnetic',
    driverCount: 1,
    impedanceOhms: 14.8,
    sensitivityDbMw: 104.0,
    releaseYear: 2021,
    description: 'Ultra-thin 14.2mm planar diaphragm with double-sided N52 neodymium magnet array, providing exceptional transient resolution.',
    isSavedToLibrary: false,
    measurement: {
      iemId: 'iem-3',
      sourceRig: 'IEC 60318-4 (711 Coupler)',
      measuredBy: 'Squiglink Laboratory',
      measuredDate: '2022-01-10',
      points: [
        { freq: 20, spl: 7.2 },
        { freq: 50, spl: 7.0 },
        { freq: 105, spl: 5.5 },
        { freq: 200, spl: 3.0 },
        { freq: 500, spl: 0.5 },
        { freq: 1000, spl: 0.0 },
        { freq: 2000, spl: 4.5 },
        { freq: 2800, spl: 8.0 },
        { freq: 4000, spl: 5.5 },
        { freq: 6000, spl: 4.0 },
        { freq: 8000, spl: 9.0 },  // 8 kHz planar peak
        { freq: 10000, spl: 4.5 },
        { freq: 15000, spl: -1.0 },
      ],
    },
  },
  {
    id: 'iem-4',
    manufacturerName: 'Sennheiser',
    name: 'IE 200',
    country: 'Germany',
    driverType: '7mm TrueResponse Dynamic',
    driverCount: 1,
    impedanceOhms: 18.0,
    sensitivityDbMw: 119.0,
    releaseYear: 2023,
    description: 'Precision engineered 7mm TrueResponse transducer with dual-tuning nozzle system delivering natural German studio balance.',
    isSavedToLibrary: false,
    measurement: {
      iemId: 'iem-4',
      sourceRig: 'IEC 60318-4 (711 Coupler)',
      measuredBy: 'SoundLab Acoustics Verification',
      measuredDate: '2023-03-20',
      points: [
        { freq: 20, spl: 5.0 },
        { freq: 50, spl: 5.2 },
        { freq: 105, spl: 4.0 },
        { freq: 200, spl: 2.0 },
        { freq: 500, spl: 0.0 },
        { freq: 1000, spl: 0.0 },
        { freq: 2000, spl: 4.5 },
        { freq: 2800, spl: 7.5 },
        { freq: 4000, spl: 6.2 },
        { freq: 6000, spl: 4.8 },
        { freq: 8000, spl: 6.5 },
        { freq: 10000, spl: 2.0 },
        { freq: 15000, spl: -3.0 },
      ],
    },
  },
  {
    id: 'iem-5',
    manufacturerName: 'Tangzu',
    name: 'Wan\'er S.G',
    country: 'China',
    driverType: '10mm PET Dynamic',
    driverCount: 1,
    impedanceOhms: 20.0,
    sensitivityDbMw: 107.0,
    releaseYear: 2022,
    description: 'Budget reference acoustic benchmark with smooth treble response and natural vocal timbre.',
    isSavedToLibrary: false,
    measurement: {
      iemId: 'iem-5',
      sourceRig: 'IEC 60318-4 (711 Coupler)',
      measuredBy: 'Crinacle 711 Rig',
      measuredDate: '2022-11-18',
      points: [
        { freq: 20, spl: 6.0 },
        { freq: 50, spl: 5.8 },
        { freq: 105, spl: 4.2 },
        { freq: 200, spl: 2.5 },
        { freq: 500, spl: 0.5 },
        { freq: 1000, spl: 0.0 },
        { freq: 2000, spl: 4.2 },
        { freq: 2800, spl: 8.2 },
        { freq: 4000, spl: 5.0 },
        { freq: 6000, spl: 3.5 },
        { freq: 8000, spl: 5.0 },
        { freq: 10000, spl: 1.0 },
        { freq: 15000, spl: -4.5 },
      ],
    },
  },
  {
    id: 'iem-6',
    manufacturerName: 'Moondrop',
    name: 'Chu II',
    country: 'China',
    driverType: '10mm Al-Mg Dynamic',
    driverCount: 1,
    impedanceOhms: 18.0,
    sensitivityDbMw: 119.0,
    releaseYear: 2023,
    description: 'Aluminum-magnesium alloy dome dynamic driver with brass acoustic nozzle and VDSF target curve.',
    isSavedToLibrary: false,
    measurement: {
      iemId: 'iem-6',
      sourceRig: 'IEC 60318-4 (711 Coupler)',
      measuredBy: 'SoundLab Acoustics Verification',
      measuredDate: '2023-07-22',
      points: [
        { freq: 20, spl: 7.0 },
        { freq: 50, spl: 6.8 },
        { freq: 105, spl: 5.0 },
        { freq: 200, spl: 2.8 },
        { freq: 500, spl: 0.2 },
        { freq: 1000, spl: 0.0 },
        { freq: 2000, spl: 4.8 },
        { freq: 2800, spl: 8.8 },
        { freq: 4000, spl: 5.8 },
        { freq: 6000, spl: 4.2 },
        { freq: 8000, spl: 6.0 },
        { freq: 10000, spl: 1.5 },
        { freq: 15000, spl: -4.0 },
      ],
    },
  },
  {
    id: 'iem-7',
    manufacturerName: 'Kiwi Ears',
    name: 'Cadenza',
    country: 'China',
    driverType: '10mm Beryllium Dynamic',
    driverCount: 1,
    impedanceOhms: 32.0,
    sensitivityDbMw: 110.0,
    releaseYear: 2022,
    description: 'Beryllium-coated 10mm dynamic driver delivering textured bass impact and non-fatiguing treble.',
    isSavedToLibrary: false,
    measurement: {
      iemId: 'iem-7',
      sourceRig: 'IEC 60318-4 (711 Coupler)',
      measuredBy: 'Squiglink Database',
      measuredDate: '2023-01-05',
      points: [
        { freq: 20, spl: 6.2 },
        { freq: 50, spl: 6.0 },
        { freq: 105, spl: 4.8 },
        { freq: 200, spl: 2.5 },
        { freq: 500, spl: 0.3 },
        { freq: 1000, spl: 0.0 },
        { freq: 2000, spl: 4.2 },
        { freq: 2800, spl: 7.8 },
        { freq: 4000, spl: 5.2 },
        { freq: 6000, spl: 3.8 },
        { freq: 8000, spl: 5.2 },
        { freq: 10000, spl: 1.2 },
        { freq: 15000, spl: -4.2 },
      ],
    },
  },
  {
    id: 'iem-8',
    manufacturerName: 'Thieaudio',
    name: 'Monarch MkIII',
    country: 'China',
    driverType: 'Tribrid: 2DD + 6BA + 2EST',
    driverCount: 10,
    impedanceOhms: 20.0,
    sensitivityDbMw: 99.0,
    releaseYear: 2023,
    description: 'Flagship tribrid with IMPACT2 dual-subwoofer isobaric system, 6 Sonion/Knowles BAs, and dual electrostatic supertweeters.',
    isSavedToLibrary: false,
    measurement: {
      iemId: 'iem-8',
      sourceRig: 'IEC 60318-4 (711 Coupler)',
      measuredBy: 'SoundLab Acoustics Verification',
      measuredDate: '2023-09-12',
      points: [
        { freq: 20, spl: 8.8 },
        { freq: 50, spl: 8.5 },
        { freq: 105, spl: 6.0 },
        { freq: 200, spl: 2.0 },
        { freq: 500, spl: 0.2 },
        { freq: 1000, spl: 0.0 },
        { freq: 2000, spl: 5.2 },
        { freq: 2800, spl: 9.0 },
        { freq: 4000, spl: 6.5 },
        { freq: 6000, spl: 4.5 },
        { freq: 8000, spl: 6.2 },
        { freq: 10000, spl: 3.8 },
        { freq: 15000, spl: 1.5 },
      ],
    },
  },
];

export function getIEMById(id: string): IEMFullRecord | undefined {
  return IEM_CATALOG.find((iem) => iem.id === id);
}

export function getMeasuredSplAtFreq(measurement: IEMMeasurementData, freq: number): number {
  const points = measurement.points;
  if (points.length === 0) return 0.0;
  if (freq <= points[0].freq) return points[0].spl;
  if (freq >= points[points.length - 1].freq) return points[points.length - 1].spl;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    if (freq >= p1.freq && freq <= p2.freq) {
      const logF1 = Math.log10(p1.freq);
      const logF2 = Math.log10(p2.freq);
      const logF = Math.log10(freq);
      const ratio = (logF - logF1) / (logF2 - logF1);
      return p1.spl + ratio * (p2.spl - p1.spl);
    }
  }

  return 0.0;
}
