import { STEP, stepData } from '../TestStep';
import { sequenceReducer, initialSequenceState, SequenceState } from '../sequenceReducer';

const started = () => sequenceReducer(initialSequenceState, { type: 'START' });

describe('sequenceReducer', () => {
  describe('initial state', () => {
    it('has the correct number of steps', () => {
      expect(initialSequenceState.steps).toHaveLength(stepData.length);
    });

    it('all steps start pending', () => {
      initialSequenceState.steps.forEach(s => expect(s.status).toBe('pending'));
    });

    it('sets currentStepIndex to -1', () => {
      expect(initialSequenceState.currentStepIndex).toBe(-1);
    });

    it('sets failureReason to null', () => {
      expect(initialSequenceState.failureReason).toBeNull();
    });

    it('sets isCompleted to false', () => {
      expect(initialSequenceState.isCompleted).toBe(false);
    });
  });

  describe('START', () => {
    let state: SequenceState;
    beforeEach(() => {
      state = started();
    });

    it('marks the start step as completed', () => {
      expect(state.steps[STEP.start].status).toBe('completed');
    });

    it('marks the fingerTimeout step as current', () => {
      expect(state.steps[STEP.fingerTimeout].status).toBe('current');
    });

    it('sets currentStepIndex to fingerTimeout', () => {
      expect(state.currentStepIndex).toBe(STEP.fingerTimeout);
    });

    it('leaves all other steps pending', () => {
      state.steps.forEach((s, i) => {
        if (i !== STEP.start && i !== STEP.fingerTimeout) {
          expect(s.status).toBe('pending');
        }
      });
    });

    it('clears any prior failure reason', () => {
      const failed = sequenceReducer(started(), { type: 'FAIL', idx: STEP.fingerTimeout, reason: 'oops' });
      expect(sequenceReducer(failed, { type: 'START' }).failureReason).toBeNull();
    });

    it('resets isCompleted', () => {
      const completed = sequenceReducer(started(), { type: 'ADVANCE', idx: stepData.length - 1 });
      expect(sequenceReducer(completed, { type: 'START' }).isCompleted).toBe(false);
    });

    it('does not mutate initialSequenceState', () => {
      expect(initialSequenceState.currentStepIndex).toBe(-1);
      initialSequenceState.steps.forEach(s => expect(s.status).toBe('pending'));
    });
  });

  describe('ADVANCE', () => {
    let state: SequenceState;
    beforeEach(() => {
      state = started();
    });

    it('marks the step as completed', () => {
      expect(sequenceReducer(state, { type: 'ADVANCE', idx: STEP.fingerTimeout }).steps[STEP.fingerTimeout].status).toBe('completed');
    });

    it('marks the next step as current', () => {
      expect(sequenceReducer(state, { type: 'ADVANCE', idx: STEP.fingerTimeout }).steps[STEP.pulseTimeout].status).toBe('current');
    });

    it('advances currentStepIndex', () => {
      expect(sequenceReducer(state, { type: 'ADVANCE', idx: STEP.fingerTimeout }).currentStepIndex).toBe(STEP.pulseTimeout);
    });

    it('sets isCompleted on the last step', () => {
      expect(sequenceReducer(state, { type: 'ADVANCE', idx: stepData.length - 1 }).isCompleted).toBe(true);
    });

    it('sets currentStepIndex beyond the array on completion', () => {
      expect(sequenceReducer(state, { type: 'ADVANCE', idx: stepData.length - 1 }).currentStepIndex).toBe(stepData.length);
    });

    it('returns the same state reference for a negative index', () => {
      expect(sequenceReducer(state, { type: 'ADVANCE', idx: -1 })).toBe(state);
    });

    it('returns the same state reference for an out-of-bounds index', () => {
      expect(sequenceReducer(state, { type: 'ADVANCE', idx: stepData.length })).toBe(state);
    });

    it('does not mutate the previous state', () => {
      const before = state.steps.map(s => s.status);
      sequenceReducer(state, { type: 'ADVANCE', idx: STEP.fingerTimeout });
      expect(state.steps.map(s => s.status)).toEqual(before);
    });
  });

  describe('FAIL', () => {
    let state: SequenceState;
    beforeEach(() => {
      state = started();
    });

    it('marks the step as failed', () => {
      expect(sequenceReducer(state, { type: 'FAIL', idx: STEP.fingerTimeout, reason: 'oops' }).steps[STEP.fingerTimeout].status).toBe('failed');
    });

    it('stores the failure reason', () => {
      expect(sequenceReducer(state, { type: 'FAIL', idx: STEP.fingerTimeout, reason: 'oops' }).failureReason).toBe('oops');
    });

    it('does not change currentStepIndex', () => {
      expect(sequenceReducer(state, { type: 'FAIL', idx: STEP.fingerTimeout, reason: 'oops' }).currentStepIndex).toBe(STEP.fingerTimeout);
    });

    it('returns the same state reference for a negative index', () => {
      expect(sequenceReducer(state, { type: 'FAIL', idx: -1, reason: 'oops' })).toBe(state);
    });

    it('returns the same state reference for an out-of-bounds index', () => {
      expect(sequenceReducer(state, { type: 'FAIL', idx: stepData.length, reason: 'oops' })).toBe(state);
    });
  });

  describe('RETRY', () => {
    let state: SequenceState;
    beforeEach(() => {
      state = sequenceReducer(started(), { type: 'FAIL', idx: STEP.fingerTimeout, reason: 'oops' });
    });

    it('resets the step back to current', () => {
      expect(sequenceReducer(state, { type: 'RETRY' }).steps[STEP.fingerTimeout].status).toBe('current');
    });

    it('clears the failure reason', () => {
      expect(sequenceReducer(state, { type: 'RETRY' }).failureReason).toBeNull();
    });

    it('does not change currentStepIndex', () => {
      expect(sequenceReducer(state, { type: 'RETRY' }).currentStepIndex).toBe(STEP.fingerTimeout);
    });

    it('returns the same state reference when not started', () => {
      expect(sequenceReducer(initialSequenceState, { type: 'RETRY' })).toBe(initialSequenceState);
    });
  });

  describe('RESET', () => {
    it('resets all steps to pending', () => {
      sequenceReducer(started(), { type: 'RESET' }).steps.forEach(s => expect(s.status).toBe('pending'));
    });

    it('resets currentStepIndex to -1', () => {
      expect(sequenceReducer(started(), { type: 'RESET' }).currentStepIndex).toBe(-1);
    });

    it('clears failureReason', () => {
      const failed = sequenceReducer(started(), { type: 'FAIL', idx: STEP.fingerTimeout, reason: 'oops' });
      expect(sequenceReducer(failed, { type: 'RESET' }).failureReason).toBeNull();
    });

    it('clears isCompleted', () => {
      const completed = sequenceReducer(started(), { type: 'ADVANCE', idx: stepData.length - 1 });
      expect(sequenceReducer(completed, { type: 'RESET' }).isCompleted).toBe(false);
    });
  });

  describe('ON_EVENT', () => {
    let state: SequenceState;
    beforeEach(() => {
      state = started();
    });

    it('advances when the event matches the current step', () => {
      const event = stepData[STEP.fingerTimeout].expectedEvent;
      expect(sequenceReducer(state, { type: 'ON_EVENT', eventName: event }).currentStepIndex).toBe(STEP.pulseTimeout);
    });

    it('returns the same state reference for a non-matching event', () => {
      expect(sequenceReducer(state, { type: 'ON_EVENT', eventName: 'onMeasurementFinished' })).toBe(state);
    });

    it('returns the same state reference before start', () => {
      expect(sequenceReducer(initialSequenceState, { type: 'ON_EVENT', eventName: 'onFingerDetectionTimeExpired' })).toBe(initialSequenceState);
    });

    it('returns the same state reference after completion', () => {
      const completed = sequenceReducer(started(), { type: 'ADVANCE', idx: stepData.length - 1 });
      const event = stepData[stepData.length - 1].expectedEvent;
      expect(sequenceReducer(completed, { type: 'ON_EVENT', eventName: event })).toBe(completed);
    });
  });

  describe('full sequence walkthrough', () => {
    it('completes all steps in order via ON_EVENT', () => {
      let state = started();
      for (let i = STEP.fingerTimeout; i < stepData.length; i++) {
        state = sequenceReducer(state, { type: 'ON_EVENT', eventName: stepData[i].expectedEvent });
      }
      expect(state.isCompleted).toBe(true);
      state.steps.forEach(s => expect(s.status).toBe('completed'));
    });
  });
});
