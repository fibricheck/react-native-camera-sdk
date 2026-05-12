export type TestStepStatus = 'pending' | 'current' | 'completed' | 'failed';

export type StepName =
  | 'start'
  | 'fingerTimeout'
  | 'pulseTimeout'
  | 'backgrounding'
  | 'placeFinger'
  | 'sampleReady'
  | 'heartbeat'
  | 'pulse'
  | 'calibration'
  | 'fingerRemoved'
  | 'movementDetected'
  | 'recordingStart'
  | 'recording'
  | 'recordingFinished'
  | 'processing'
  | 'measurementValidation';

export interface TestStep {
  id: number;
  name: StepName;
  title: string;
  instruction: string;
  expectedEvent: string;
  status: TestStepStatus;
}

export const stepData: TestStep[] = [
  {
    id: 1,
    name: 'start',
    title: 'Start Measurement',
    instruction: 'Tap the START button to begin',
    expectedEvent: 'START',
    status: 'pending',
  },
  {
    id: 2,
    name: 'fingerTimeout',
    title: 'Test Finger Timeout',
    instruction: 'Do NOT place finger on the camera — wait for the timeout',
    expectedEvent: 'onFingerDetectionTimeExpired',
    status: 'pending',
  },
  {
    id: 3,
    name: 'pulseTimeout',
    title: 'Test Pulse Timeout',
    instruction: 'Place your finger loosely on the camera — wait for pulse timeout',
    expectedEvent: 'onPulseDetectionTimeExpired',
    status: 'pending',
  },
  {
    id: 4,
    name: 'backgrounding',
    title: 'Test Backgrounding',
    instruction:
      'Place finger on camera, then press the Home button to background the app. Return to this app and tap CONFIRM.',
    expectedEvent: 'onBackgroundingVerified',
    status: 'pending',
  },
  {
    id: 5,
    name: 'placeFinger',
    title: 'Place Finger',
    instruction: 'Now cover the camera firmly with your finger',
    expectedEvent: 'onFingerDetected',
    status: 'pending',
  },
  {
    id: 6,
    name: 'sampleReady',
    title: 'Sample Ready',
    instruction: 'Verifying camera data stream…',
    expectedEvent: 'onSampleReady',
    status: 'pending',
  },
  {
    id: 7,
    name: 'heartbeat',
    title: 'Detect Heartbeat',
    instruction: 'Keep your finger steady — detecting heartbeat…',
    expectedEvent: 'onHeartBeat',
    status: 'pending',
  },
  {
    id: 8,
    name: 'pulse',
    title: 'Detect Pulse',
    instruction: 'Hold still — detecting pulse pattern…',
    expectedEvent: 'onPulseDetected',
    status: 'pending',
  },
  {
    id: 9,
    name: 'calibration',
    title: 'Calibration',
    instruction: 'Calibrating camera settings…',
    expectedEvent: 'onCalibrationReady',
    status: 'pending',
  },
  {
    id: 10,
    name: 'fingerRemoved',
    title: 'Test Finger Removed',
    instruction: 'Briefly lift your finger off the camera',
    expectedEvent: 'onFingerRemoved',
    status: 'pending',
  },
  {
    id: 11,
    name: 'movementDetected',
    title: 'Test Movement Detection',
    instruction: 'Place finger back and wait for recording to start, then shake the phone gently',
    expectedEvent: 'onMovementDetected',
    status: 'pending',
  },
  {
    id: 12,
    name: 'recordingStart',
    title: 'Recording Started',
    instruction: 'Recording has begun — keep finger steady',
    expectedEvent: 'onMeasurementStart',
    status: 'pending',
  },
  {
    id: 13,
    name: 'recording',
    title: 'Recording in Progress',
    instruction: 'Keep finger on camera until the timer fires',
    expectedEvent: 'onTimeRemaining',
    status: 'pending',
  },
  {
    id: 14,
    name: 'recordingFinished',
    title: 'Recording Finished',
    instruction: 'Recording complete!',
    expectedEvent: 'onMeasurementFinished',
    status: 'pending',
  },
  {
    id: 15,
    name: 'processing',
    title: 'Processing',
    instruction: 'Processing measurement data…',
    expectedEvent: 'onMeasurementProcessed',
    status: 'pending',
  },
  {
    id: 16,
    name: 'measurementValidation',
    title: 'Validate Measurement',
    instruction: 'Validating: heartrate, quadrants, time, technical_details',
    expectedEvent: 'onMeasurementValidated',
    status: 'pending',
  },
];

export const STEP = Object.fromEntries(stepData.map((step, idx) => [step.name, idx])) as Record<StepName, number>;
