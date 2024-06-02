type TargetElement = React.MutableRefObject<HTMLElement | null>;

export type StepperButtonInstance = {
  element: TargetElement;
  handlers: {
    deactivate: () => void;
    activate: () => void;
    isActive: () => boolean;
  };
};

export type StepperContextType = {
  isInitialized: boolean;
  buttons: Record<string, StepperButtonInstance>;
  targets: Record<string, TargetElement>;
  observers: Record<string, IntersectionObserver>;
  ratio: Map<string, number>;
  direction: 'up' | 'down';
  root: Window | Element;
  scrollEndTimer: number | null;
  scrollEndCallback: () => void;
  registerButton: (id: string, button: StepperButtonInstance) => void;
  registerTarget: (id: string, target: TargetElement) => void;
  unregisterButton: (id: string) => void;
  unregisterTarget: (id: string) => void;
  observeTarget: (id: string) => void;
  collectTargetData: (id: string) => IntersectionObserverCallback;
  deactivateButtons: () => void;
  getRatioLeaders: () => string[];
  activateRootScroll: () => void;
  deactivateRootScroll: () => void;
  activateManualScroll: () => void;
  deactivateManualScroll: () => void;
  detectScrollEnd: () => void;
  clearScrollEnd: () => void;
  setActiveTargetManually: (id: string) => void;
  setActiveButtonAutomatically: () => void;
  initialize: () => void;
  uninitialize: () => void;
};
