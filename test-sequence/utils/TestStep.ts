export interface TestStep {
  id: string;
  title: string;
  instruction: string;
  expectedEvent: string;
  status: 'pending' | 'current' | 'completed' | 'failed';
}

export const STEP = {
  start: 0,
  fingerTimeout: 1,
  pulseTimeout: 2,
  backgrounding: 3,
  placeFinger: 4,
  sampleReady: 5,
  heartbeat: 6,
  pulse: 7,
  calibration: 8,
  fingerRemoved: 9,
  movementDetected: 10,
  recordingStart: 11,
  recording: 12,
  recordingFinished: 13,
  processing: 14,
  measurementValidation: 15,
} as const;

export const stepData: TestStep[] = [
  {
    id: 'start',
    title: 'Start Measurement',
    instruction: 'Tap the START button to begin.',
    expectedEvent: 'START',
    status: 'pending',
  },
  {
    id: 'fingerTimeout',
    title: 'Finger Timeout',
    instruction: 'Do NOT place your finger — wait for the timeout to expire.',
    expectedEvent: 'onFingerDetectionTimeExpired',
    status: 'pending',
  },
  {
    id: 'pulseTimeout',
    title: 'Pulse Timeout',
    instruction: 'Place your finger loosely on the camera and wait for the pulse timeout to expire.',
    expectedEvent: 'onPulseDetectionTimeExpired',
    status: 'pending',
  },
  {
    id: 'backgrounding',
    title: 'Backgrounding',
    instruction:
      'Place your finger on the camera, then press the Home button to background the app. Return to this app and tap CONFIRM.',
    expectedEvent: 'onBackgroundingVerified',
    status: 'pending',
  },
  {
    id: 'placeFinger',
    title: 'Place Finger',
    instruction: 'Cover the camera firmly with your finger.',
    expectedEvent: 'onFingerDetected',
    status: 'pending',
  },
  {
    id: 'sampleReady',
    title: 'Sample Ready',
    instruction: 'Verifying camera data stream...',
    expectedEvent: 'onSampleReady',
    status: 'pending',
  },
  {
    id: 'heartbeat',
    title: 'Detect Heartbeat',
    instruction: 'Keep your finger steady on the camera.',
    expectedEvent: 'onHeartBeat',
    status: 'pending',
  },
  {
    id: 'pulse',
    title: 'Detect Pulse',
    instruction: 'Hold still — detecting pulse pattern...',
    expectedEvent: 'onPulseDetected',
    status: 'pending',
  },
  {
    id: 'calibration',
    title: 'Calibration',
    instruction: 'Calibrating camera settings...',
    expectedEvent: 'onCalibrationReady',
    status: 'pending',
  },
  {
    id: 'fingerRemoved',
    title: 'Finger Removed',
    instruction: 'Briefly lift your finger off the camera.',
    expectedEvent: 'onFingerRemoved',
    status: 'pending',
  },
  {
    id: 'movementDetected',
    title: 'Movement Detection',
    instruction:
      'Place your finger back on the camera and shake the phone gently. Movement detection only triggers once recording has started.',
    expectedEvent: 'onMovementDetected',
    status: 'pending',
  },
  {
    id: 'recordingStart',
    title: 'Recording Started',
    instruction: 'Waiting for recording to start...',
    expectedEvent: 'onMeasurementStart',
    status: 'pending',
  },
  {
    id: 'recording',
    title: 'Recording in Progress',
    instruction: 'Keep your finger on the camera until the timer ends.',
    expectedEvent: 'onTimeRemaining',
    status: 'pending',
  },
  {
    id: 'recordingFinished',
    title: 'Recording Finished',
    instruction: 'Waiting for recording to finish...',
    expectedEvent: 'onMeasurementFinished',
    status: 'pending',
  },
  {
    id: 'processing',
    title: 'Processing',
    instruction: 'Processing measurement data...',
    expectedEvent: 'onMeasurementProcessed',
    status: 'pending',
  },
  {
    id: 'measurementValidation',
    title: 'Validate Measurement',
    instruction: 'Validating measurement data...',
    expectedEvent: 'onMeasurementValidated',
    status: 'pending',
  },
];
