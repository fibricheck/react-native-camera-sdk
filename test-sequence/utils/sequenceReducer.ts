import { STEP, stepData, TestStep } from './TestStep';

export type SequenceState = {
  steps: TestStep[];
  currentStepIndex: number;
  failureReason: string | null;
  isCompleted: boolean;
};

export type SequenceAction =
  | { type: 'START' }
  | { type: 'ADVANCE'; idx: number }
  | { type: 'FAIL'; idx: number; reason: string }
  | { type: 'RETRY' }
  | { type: 'RESET' }
  | { type: 'ON_EVENT'; eventName: string };

const freshSteps = () => stepData.map(step => ({ ...step }));

export const initialSequenceState: SequenceState = {
  steps: freshSteps(),
  currentStepIndex: -1,
  failureReason: null,
  isCompleted: false,
};

export function sequenceReducer(state: SequenceState, action: SequenceAction): SequenceState {
  switch (action.type) {
    case 'RESET':
      return { steps: freshSteps(), currentStepIndex: -1, failureReason: null, isCompleted: false };

    case 'START': {
      const steps = freshSteps();
      steps[STEP.start].status = 'completed';
      steps[STEP.fingerTimeout].status = 'current';
      return { steps, currentStepIndex: STEP.fingerTimeout, failureReason: null, isCompleted: false };
    }

    case 'ADVANCE': {
      const { idx } = action;
      if (idx < 0 || idx >= state.steps.length) return state;
      const nextIndex = idx + 1;
      const completed = nextIndex >= state.steps.length;
      const steps = state.steps.map((s, i) => {
        if (i === idx) return { ...s, status: 'completed' as const };
        if (i === nextIndex && !completed) return { ...s, status: 'current' as const };
        return s;
      });
      return {
        ...state,
        steps,
        currentStepIndex: completed ? state.steps.length : nextIndex,
        isCompleted: completed,
      };
    }

    case 'FAIL': {
      const { idx, reason } = action;
      if (idx < 0 || idx >= state.steps.length) return state;
      const steps = state.steps.map((s, i) => (i === idx ? { ...s, status: 'failed' as const } : s));
      return { ...state, steps, failureReason: reason };
    }

    case 'RETRY': {
      const { currentStepIndex } = state;
      if (currentStepIndex < 0 || currentStepIndex >= state.steps.length) return state;
      const steps = state.steps.map((s, i) => (i === currentStepIndex ? { ...s, status: 'current' as const } : s));
      return { ...state, steps, failureReason: null };
    }

    case 'ON_EVENT': {
      if (state.currentStepIndex < 0 || state.isCompleted) return state;
      const current = state.steps[state.currentStepIndex];
      if (current?.expectedEvent !== action.eventName) return state;
      return sequenceReducer(state, { type: 'ADVANCE', idx: state.currentStepIndex });
    }

    default:
      return state;
  }
}
