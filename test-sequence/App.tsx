/* eslint-disable no-console */
import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { request, PERMISSIONS } from 'react-native-permissions';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RNFibriCheckView, RNCameraPreviewView } from '@fibricheck/react-native-camera-sdk';
import type { CameraData } from '@fibricheck/react-native-camera-sdk';
import type { FibriCheckViewHandle } from '@fibricheck/react-native-camera-sdk/build/types/src/FibriCheckView';

import { STEP, stepData } from './utils/TestStep';
import { sequenceReducer, initialSequenceState } from './utils/sequenceReducer';
import { colors } from './theme/colors';
import { LabelInfoBanner } from './components/LabelInfoBanner';
import { CameraSettingsModal } from './components/CameraSettingsModal';
import { StepRow } from './components/StepRow';
import { ControlButton } from './components/ControlButton';
import { validateMeasurement } from './utils/validateMeasurement';

const scrollPadding = 20;

export default function App() {
  const [hasCameraPermission, setCameraPermission] = useState(false);
  const [seqState, dispatch] = useReducer(sequenceReducer, initialSequenceState);
  const { steps, currentStepIndex, failureReason, isCompleted } = seqState;
  const [lastEvent, setLastEvent] = useState('');
  const [heartRate, setHeartRate] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isCameraVisible, setCameraVisible] = useState(false);
  const [showBackgroundingConfirm, setShowBackgroundingConfirm] = useState(false);
  const [lastCameraData, setLastCameraData] = useState<CameraData | null>(null);
  const [showCameraSettings, setShowCameraSettings] = useState(false);
  const [skippedPulse, setSkippedPulse] = useState(false);
  const [skippedMovement, setSkippedMovement] = useState(false);
  const [recordingStartedForMovement, setRecordingStartedForMovement] = useState(false);
  // Incrementing cameraKey forces RNFibriCheckView to fully unmount and remount,
  // giving the native camera component a clean state without needing to reset it in place.
  const [cameraKey, setCameraKey] = useState(0);

  const fibriViewRef = useRef<FibriCheckViewHandle>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const stepOffsetsRef = useRef<number[]>([]);
  const stepIndexRef = useRef(currentStepIndex);
  stepIndexRef.current = currentStepIndex;
  const recordingStartedRef = useRef(false);
  const pendingBackgroundingConfirmRef = useRef(false);
  const pendingMeasurementRef = useRef<CameraData | null>(null);
  const pendingValidationRef = useRef<{ error: string | null } | null>(null);

  // Camera permission on mount
  useEffect(() => {
    const perm = Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
    request(perm).then(result => setCameraPermission(result === 'granted'));
  }, []);

  // Start measurement after camera becomes visible
  useEffect(() => {
    if (!isCameraVisible) return;
    const timer = setTimeout(() => {
      fibriViewRef.current?.startMeasurement();
    }, 300);
    return () => clearTimeout(timer);
  }, [isCameraVisible]);

  // Auto-scroll to current step
  useEffect(() => {
    if (currentStepIndex < 0) return;
    const y = stepOffsetsRef.current[currentStepIndex];
    if (y !== undefined) {
      scrollViewRef.current?.scrollTo({
        y: Math.max(0, y - scrollPadding),
        animated: true,
      });
    }
  }, [currentStepIndex]);

  // AppState listener for the backgrounding step
  useEffect(() => {
    if (currentStepIndex !== STEP.backgrounding) return;
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'background') {
        pendingBackgroundingConfirmRef.current = true;
      }
      if (state === 'active' && pendingBackgroundingConfirmRef.current) {
        pendingBackgroundingConfirmRef.current = false;
        setShowBackgroundingConfirm(true);
      }
    });
    return () => sub.remove();
  }, [currentStepIndex]);

  const updateLastEvent = useCallback((event: string, extra?: string) => {
    const msg = extra ? `${event} (${extra})` : event;
    console.log(`[TestSeq] event: ${msg}  step=${stepIndexRef.current}`);
    setLastEvent(msg);
  }, []);

  const advance = useCallback(
    (idx: number) => {
      console.log(`[TestSeq] advance: ${idx} → ${idx + 1}`);
      dispatch({ type: 'ADVANCE', idx });
      if (idx === stepData.length - 1) setCameraVisible(false);
    },
    [dispatch]
  );

  const fail = useCallback(
    (idx: number, reason: string) => {
      console.log(`[TestSeq] FAIL step ${idx}: ${reason}`);
      dispatch({ type: 'FAIL', idx, reason });
      setCameraVisible(false);
    },
    [dispatch]
  );

  // Handle pending measurement/validation results when the relevant step becomes active
  useEffect(() => {
    if (currentStepIndex === STEP.processing && pendingMeasurementRef.current) {
      const data = pendingMeasurementRef.current;
      pendingMeasurementRef.current = null;
      const error = validateMeasurement(data, sensorConfig);
      pendingValidationRef.current = { error };
      advance(STEP.processing);
    } else if (currentStepIndex === STEP.measurementValidation && pendingValidationRef.current) {
      const { error } = pendingValidationRef.current;
      pendingValidationRef.current = null;
      if (error === null) {
        advance(STEP.measurementValidation);
      } else {
        fail(STEP.measurementValidation, `Validation failed: ${error}`);
      }
    }
  }, [currentStepIndex, advance, fail]);

  const restartMeasurement = useCallback((delayMs = 1500) => {
    recordingStartedRef.current = false;
    setCameraVisible(false);
    setTimeout(() => {
      setCameraKey(k => k + 1);
      setCameraVisible(true);
    }, delayMs);
  }, []);

  const resetSequence = () => {
    recordingStartedRef.current = false;
    pendingBackgroundingConfirmRef.current = false;
    pendingMeasurementRef.current = null;
    pendingValidationRef.current = null;
    dispatch({ type: 'RESET' });
    setCameraVisible(false);
    setLastEvent('');
    setHeartRate(0);
    setTimeRemaining(0);
    setLastCameraData(null);
    setShowBackgroundingConfirm(false);
    setSkippedPulse(false);
    setSkippedMovement(false);
    setRecordingStartedForMovement(false);
  };

  // Configuration — adjust values here to tune the test sequence
  const movementDetectionEnabled = true; // Set to false to auto-skip movement detection
  const accEnabled = true;
  const gyroEnabled = true;
  const gravEnabled = true;
  const rotationEnabled = true;
  const sampleTime = 10;
  const sensorConfig = { accEnabled, gyroEnabled, gravEnabled, rotationEnabled };

  const { fingerDetectionExpiryTime, pulseDetectionExpiryTime } = (() => {
    const step = currentStepIndex;
    if (step === STEP.fingerTimeout) {
      return { fingerDetectionExpiryTime: 3, pulseDetectionExpiryTime: 10 };
    }
    if (step === STEP.pulseTimeout) {
      return { fingerDetectionExpiryTime: -1, pulseDetectionExpiryTime: 1 }; // 1s for quick pulse timeout test
    }
    if (step === STEP.backgrounding) {
      return { fingerDetectionExpiryTime: -1, pulseDetectionExpiryTime: -1 }; // SDK must survive backgrounding
    }
    if (step === STEP.calibration || step === STEP.movementDetected || step === STEP.recordingStart) {
      return { fingerDetectionExpiryTime: -1, pulseDetectionExpiryTime: -1 }; // Finger is already on camera
    }
    return {
      fingerDetectionExpiryTime: -1, // No timeout — wait for user to place finger
      pulseDetectionExpiryTime: 30, // 30 seconds — pulse detection can take a while
    };
  })();

  // Event handlers
  const onFingerDetected = useCallback(() => {
    const idx = stepIndexRef.current;
    updateLastEvent('onFingerDetected');
    if (idx === STEP.fingerTimeout) {
      fail(idx, 'Finger detected — do NOT place finger during this test');
      return;
    }
    if (idx === STEP.pulseTimeout) return;
    if (idx === STEP.backgrounding) return;
    if (stepData[idx]?.expectedEvent === 'onFingerDetected') {
      advance(idx);
    }
  }, [updateLastEvent, advance, fail]);

  const onFingerRemoved = useCallback(() => {
    updateLastEvent('onFingerRemoved');
    const idx = stepIndexRef.current;
    if (idx >= STEP.recordingFinished) return;
    if (idx === STEP.fingerRemoved) {
      advance(idx);
    }
  }, [updateLastEvent, advance]);

  const onFingerDetectionTimeExpired = useCallback(() => {
    updateLastEvent('onFingerDetectionTimeExpired');
    const idx = stepIndexRef.current;
    if (idx >= STEP.recording) return;
    if (idx === STEP.fingerTimeout) {
      advance(idx);
      restartMeasurement(1500);
      return;
    }
    if (idx === STEP.pulseTimeout || idx === STEP.backgrounding) return;
    fail(idx, 'Finger detection timed out');
  }, [updateLastEvent, advance, restartMeasurement, fail]);

  const onPulseDetected = useCallback(() => {
    updateLastEvent('onPulseDetected');
    const idx = stepIndexRef.current;
    if (idx === STEP.pulseTimeout) {
      fail(idx, 'Pulse detected — keep finger loose for this test');
      return;
    }
    if (stepData[idx]?.expectedEvent === 'onPulseDetected') {
      advance(idx);
    }
  }, [updateLastEvent, advance, fail]);

  const onPulseDetectionTimeExpired = useCallback(() => {
    updateLastEvent('onPulseDetectionTimeExpired');
    const idx = stepIndexRef.current;
    if (idx >= STEP.recording) return;
    if (idx === STEP.pulseTimeout) {
      advance(idx);
      restartMeasurement(1500);
      return;
    }
    if (idx === STEP.backgrounding) return;
    fail(idx, 'Pulse detection timed out — try holding more steady');
  }, [updateLastEvent, advance, restartMeasurement, fail]);

  const onSampleReady = useCallback(() => {
    const idx = stepIndexRef.current;
    if (idx === STEP.sampleReady) {
      updateLastEvent('onSampleReady');
      advance(idx);
    }
  }, [updateLastEvent, advance]);

  const onHeartBeat = useCallback(
    (hr: number) => {
      setHeartRate(hr);
      updateLastEvent('onHeartBeat', `BPM=${hr}`);
      const idx = stepIndexRef.current;
      if (idx === STEP.heartbeat) advance(idx);
    },
    [updateLastEvent, advance]
  );

  const onCalibrationReady = useCallback(() => {
    updateLastEvent('onCalibrationReady');
    const idx = stepIndexRef.current;
    if (stepData[idx]?.expectedEvent === 'onCalibrationReady') {
      advance(idx);
      if (!movementDetectionEnabled) {
        setSkippedMovement(true);
        advance(STEP.movementDetected);
      }
    }
  }, [updateLastEvent, advance]);

  const onMeasurementStart = useCallback(() => {
    updateLastEvent('onMeasurementStart');
    const idx = stepIndexRef.current;
    if (idx === STEP.movementDetected) {
      recordingStartedRef.current = true;
      setRecordingStartedForMovement(true);
      return;
    }
    if (idx === STEP.recordingStart) {
      advance(idx);
    }
  }, [updateLastEvent, advance]);

  const onTimeRemaining = useCallback(
    (seconds: number) => {
      const idx = stepIndexRef.current;
      setTimeRemaining(seconds);
      if (idx === STEP.recording) {
        updateLastEvent('onTimeRemaining', `${seconds}s`);
        advance(idx);
      }
    },
    [updateLastEvent, advance]
  );

  const onMovementDetected = useCallback(() => {
    updateLastEvent('onMovementDetected');
    const idx = stepIndexRef.current;
    if (idx >= STEP.recordingStart) return;
    if (idx === STEP.movementDetected) {
      advance(idx);
      if (recordingStartedRef.current) {
        recordingStartedRef.current = false;
        advance(STEP.recordingStart);
      }
      return;
    }
    fail(idx, 'Movement detected — hold the phone steady');
  }, [updateLastEvent, advance, fail]);

  const onMeasurementFinished = useCallback(() => {
    updateLastEvent('onMeasurementFinished');
    const idx = stepIndexRef.current;
    if (idx === STEP.fingerRemoved) {
      fail(idx, 'Recording finished before finger was removed — retry and lift sooner');
      return;
    }
    if (idx === STEP.movementDetected) {
      fail(idx, 'Recording finished before movement was detected — retry and shake sooner');
      return;
    }
    if (idx === STEP.recordingFinished) {
      advance(idx);
    }
  }, [updateLastEvent, advance, fail]);

  const onMeasurementProcessed = useCallback(
    (data: CameraData) => {
      updateLastEvent('onMeasurementProcessed', `HR=${Math.round(data.heartrate)}`);
      const idx = stepIndexRef.current;
      if (idx < STEP.recordingFinished) {
        console.warn(`[TestSeq] onMeasurementProcessed fired early at step ${idx} — ignoring`);
        return;
      }
      setLastCameraData(data);
      setCameraVisible(false);
      if (idx >= STEP.processing) {
        // Normal case: already at processing — validate and advance directly
        const error = validateMeasurement(data, sensorConfig);
        pendingValidationRef.current = { error };
        advance(STEP.processing);
      } else {
        // Native callback beats React's state update — park and pick up in the useEffect.
        pendingMeasurementRef.current = data;
      }
    },
    [updateLastEvent, advance]
  );

  const onMeasurementError = useCallback(
    (error: string) => {
      updateLastEvent('onMeasurementError', error);
      const idx = stepIndexRef.current;
      if (idx >= STEP.recording) {
        console.warn(`[TestSeq] error during step ${idx}: ${error}`);
        return;
      }
      if (idx >= 0) fail(idx, `Error: ${error}`);
    },
    [updateLastEvent, fail]
  );

  const skipPulseStep = () => {
    setSkippedPulse(true);
    advance(STEP.pulse);
    restartMeasurement(300);
  };

  const confirmBackgroundingTest = () => {
    setShowBackgroundingConfirm(false);
    advance(STEP.backgrounding);
    restartMeasurement(1500);
  };

  const startSequence = () => {
    resetSequence();
    dispatch({ type: 'START' });
    setLastEvent('START');
    setCameraKey(k => k + 1);
    setCameraVisible(true);
  };

  const retryStep = () => {
    recordingStartedRef.current = false;
    dispatch({ type: 'RETRY' });
    setCameraKey(k => k + 1);
    setCameraVisible(true);
  };

  const currentStep = currentStepIndex >= 0 && currentStepIndex < steps.length ? steps[currentStepIndex] : null;

  const isIdle = currentStepIndex < 0;
  const hasFailed = failureReason !== null;
  const isRunning = isCameraVisible && !isCompleted && !hasFailed && !showBackgroundingConfirm;
  const showSkip = isRunning && currentStepIndex === STEP.pulse;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <LabelInfoBanner />

        {hasCameraPermission && isCameraVisible && (
          <>
            <View style={styles.graphOverlay}>
              <RNFibriCheckView
                key={cameraKey}
                ref={fibriViewRef}
                style={styles.cameraView}
                flashEnabled
                sampleTime={sampleTime}
                movementDetectionEnabled={movementDetectionEnabled}
                accEnabled={accEnabled}
                gyroEnabled={gyroEnabled}
                gravEnabled={gravEnabled}
                rotationEnabled={rotationEnabled}
                fingerDetectionExpiryTime={fingerDetectionExpiryTime}
                pulseDetectionExpiryTime={pulseDetectionExpiryTime}
                onFingerDetected={onFingerDetected}
                onFingerRemoved={onFingerRemoved}
                onCalibrationReady={onCalibrationReady}
                onPulseDetected={onPulseDetected}
                onPulseDetectionTimeExpired={onPulseDetectionTimeExpired}
                onFingerDetectionTimeExpired={onFingerDetectionTimeExpired}
                onMovementDetected={onMovementDetected}
                onMeasurementStart={onMeasurementStart}
                onMeasurementFinished={onMeasurementFinished}
                onHeartBeat={onHeartBeat}
                onTimeRemaining={onTimeRemaining}
                onSampleReady={onSampleReady}
                onMeasurementProcessed={onMeasurementProcessed}
                onMeasurementError={onMeasurementError}
              />
            </View>
            <View style={styles.cameraOverlay}>
              <RNCameraPreviewView style={styles.cameraView} />
            </View>
          </>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            {isCompleted ? (
              <Text style={styles.headerTitle}>All {steps.length} steps completed!</Text>
            ) : currentStepIndex >= 0 ? (
              <Text style={styles.headerTitle}>
                Step {Math.min(currentStepIndex + 1, steps.length)} of {steps.length}
              </Text>
            ) : (
              <Text style={styles.headerTitle}>Ready to start</Text>
            )}
            {isCompleted && <Text style={styles.completedIcon}>✓</Text>}
            {hasFailed && <Text style={styles.failedIcon}>✗</Text>}
          </View>
          <Text style={styles.lastEventText}>
            Last event: <Text style={styles.lastEventValue}>{lastEvent || '—'}</Text>
          </Text>
          {isRunning && currentStepIndex === STEP.recordingFinished && (
            <Text style={styles.hrText}>
              {heartRate} BPM
              {timeRemaining > 0 ? `  ·  ${timeRemaining}s remaining` : ''}
            </Text>
          )}
        </View>

        {/* Steps list */}
        <ScrollView ref={scrollViewRef} style={styles.stepsList} contentContainerStyle={styles.stepsContent}>
          {steps.map((step, idx) => (
            <StepRow
              key={step.id}
              step={step}
              onLayout={y => {
                stepOffsetsRef.current[idx] = y;
              }}
            />
          ))}
        </ScrollView>

        {/* Instruction card */}
        {isCompleted ? (
          <View style={[styles.card, styles.cardSuccess]}>
            <Text style={styles.cardTitle}>Test Sequence Passed!</Text>
            <Text style={styles.cardSubtitle}>Heart rate: {heartRate} BPM</Text>
            {skippedPulse && <Text style={styles.cardSkipped}>⏭ Pulse step skipped</Text>}
            {skippedMovement && <Text style={styles.cardSkipped}>⏭ Movement detection skipped</Text>}
          </View>
        ) : currentStep ? (
          <View style={[styles.card, hasFailed ? styles.cardError : styles.cardInfo]}>
            <Text style={styles.cardTitle}>{currentStep.title}</Text>
            <Text style={styles.cardInstruction}>
              {showBackgroundingConfirm
                ? 'Back from background! SDK still active. Tap CONFIRM to proceed.'
                : currentStepIndex === STEP.movementDetected && recordingStartedForMovement
                  ? 'Recording started! Now shake the phone gently.'
                  : currentStep.instruction}
            </Text>
            {hasFailed && <Text style={styles.cardErrorText}>✗ {failureReason}</Text>}
          </View>
        ) : null}

        {/* Controls */}
        <View style={styles.controls}>
          {isIdle && <ControlButton title="START" onPress={startSequence} variant="primary" />}
          {isRunning && !showSkip && <ControlButton title="STOP" onPress={resetSequence} variant="danger" />}
          {isRunning && showSkip && (
            <>
              <ControlButton title="STOP" onPress={resetSequence} variant="danger" flex />
              <ControlButton title="SKIP" onPress={skipPulseStep} variant="secondary" flex />
            </>
          )}
          {showBackgroundingConfirm && (
            <ControlButton title="CONFIRM" onPress={confirmBackgroundingTest} variant="primary" />
          )}
          {hasFailed && (
            <>
              <ControlButton title="RETRY" onPress={retryStep} variant="primary" flex />
              <ControlButton title="RESET" onPress={resetSequence} variant="danger" flex />
            </>
          )}
          {isCompleted && (
            <>
              {lastCameraData && (
                <ControlButton title="VIEW RESULTS" onPress={() => setShowCameraSettings(true)} variant="secondary" flex />
              )}
              <ControlButton title="RESET" onPress={resetSequence} variant="secondary" flex />
            </>
          )}
        </View>

        <CameraSettingsModal
          visible={showCameraSettings}
          data={lastCameraData}
          onClose={() => setShowCameraSettings(false)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgRoot,
  },

  graphOverlay: {
    position: 'absolute',
    bottom: 362,
    right: 16,
    width: 120,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    backgroundColor: colors.bgRoot,
    borderColor: colors.primary,
    zIndex: 10,
  },

  cameraOverlay: {
    position: 'absolute',
    bottom: 190,
    right: 16,
    width: 120,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary,
    zIndex: 10,
  },
  cameraView: {
    flex: 1,
  },

  header: {
    padding: 16,
    backgroundColor: colors.bgHeader,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
  },
  completedIcon: {
    fontSize: 18,
    color: colors.success,
  },
  failedIcon: {
    fontSize: 18,
    color: colors.danger,
  },
  lastEventText: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: colors.textMedium,
  },
  lastEventValue: {
    color: colors.primary,
    fontWeight: '600',
  },
  hrText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },

  stepsList: {
    flex: 1,
  },
  stepsContent: {
    paddingVertical: 4,
  },

  card: {
    margin: 12,
    padding: 16,
    borderRadius: 12,
    gap: 6,
  },
  cardInfo: {
    backgroundColor: colors.bgPrimaryLight,
  },
  cardSuccess: {
    backgroundColor: colors.bgSuccessLight,
  },
  cardError: {
    backgroundColor: colors.bgDangerLight,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textMedium,
  },
  cardInstruction: {
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 18,
  },
  cardErrorText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '600',
    marginTop: 4,
  },
  cardSkipped: {
    fontSize: 12,
    color: colors.textMedium,
  },

  controls: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgHeader,
  },
});
