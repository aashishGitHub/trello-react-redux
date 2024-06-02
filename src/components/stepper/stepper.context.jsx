import { createContext, useEffect, useMemo } from 'react';
import { StepperContextType } from './stepper.types';
import { generateArray, debounce } from './stepper.utils';

/**
 * Creates instance of Stepper Context that is shared across
 * Sepper.Container, Stepper.Target and Stapper.Button compound
 * components.
 *
 * Export for tests.
 */
export function getContext() {
  const context: StepperContextType = {
    isInitialized: false,
    root: window,
    buttons: {},
    targets: {},
    observers: {},
    direction: 'up',
    ratio: new Map(),
    scrollEndTimer: null,
    /**
     * Initializes Stepper.Context by activating root scroll
     * bindings and setting initially active Button via
     * setActiveButtonAutomatically call.
     */
    initialize: () => {
      context.isInitialized = true;
      context.activateRootScroll();
      context.setActiveButtonAutomatically();
    },
    /**
     * termination/destroy function.
     */
    uninitialize: () => {
      context.isInitialized = false;
      context.deactivateRootScroll();
      context.deactivateManualScroll();
    },
    /**
     * Registers Stepper.Button with it's handlers to activate it.
     */
    registerButton: (id, button) => {
      if (button.element.current !== null) {
        context.buttons[id] = button;
      }
    },
    /**
     * Registers Stepper.Target and starts collecting position data.
     */
    registerTarget: (id, target) => {
      if (target.current !== null) {
        context.targets[id] = target;
        context.observeTarget(id);
      }
    },
    /**
     * Unregisters Stepper.Button.
     */
    unregisterButton: (id) => {
      delete context.buttons[id];
    },
    /**
     * Unregisters Stepper.Target.
     */
    unregisterTarget: (id) => {
      context.observers[id]?.disconnect();
      delete context.targets[id];
      delete context.observers[id];
    },
    /**
     * Clears scrollEndTimer. Which used to detect end of smooth scrollIntoView.
     */
    clearScrollEnd: () => {
      if (context.scrollEndTimer) {
        clearTimeout(context.scrollEndTimer);
        context.scrollEndTimer = null;
      }
    },
    /**
     * Returns ratio leaders. Stepper.Targets that take up most of the screen in proportion
     * to their size.
     */
    getRatioLeaders: () => {
      const condidates = Array.from(context.ratio.values(), (value) => parseFloat(value.toFixed(1)));
      const maxValue = Math.max(...condidates);
      return Array.from(context.ratio.keys()).filter((_, index) => condidates[index] !== 0 && condidates[index] === maxValue);
    },
    /**
     * Collects Target position data like: ratio and direction of scrolling.
     */
    collectTargetData: (id) => {
      let previousY = 0;
      return (entries) => {
        const [entry] = entries;
        const currentY = entry.boundingClientRect.y;
        context.ratio.set(id, entry.intersectionRatio);
        context.direction = currentY < previousY ? 'down' : 'up';
        previousY = currentY;
      };
    },
    /**
     * Sets up Stepper.Target observer to collect target position data.
     */
    observeTarget: (id) => {
      const target = context.targets[id].current;
      /**
       * initialize ratio here to make sure ratio index matches registration order.
       */
      context.ratio.set(id, 0);
      context.observers[id] = new IntersectionObserver(context.collectTargetData(id), {
        root: context.root === window ? null : (context.root),
        /**
         * threshold of when we want to capture target data (ratio).
         */
        threshold: generateArray(1, 0.05),
      });
      context.observers[id].observe(target);
    },
    /**
     * Deactivates all the Stepper.Buttons.
     */
    deactivateButtons: () => {
      Object.values(context.buttons).forEach((button) => button.handlers.deactivate());
    },
    /**
     * Listens to scroll to detect active Stepper.Button based on Stepper.Target position.
     */
    activateRootScroll: () => {
      context.root.addEventListener('scroll', context.setActiveButtonAutomatically);
    },
    /**
     * Removes listener.
     */
    deactivateRootScroll: () => {
      context.root.removeEventListener('scroll', context.setActiveButtonAutomatically);
    },
    /**
     * Listens to scroll to detect end of the smooth scrollIntoView action
     * initiated by Stepper.Button. This approach was chosen instead of
     * modern 'scrollend' event due to few downsides of scrollend event:
     *
     * - 'scrollend' gets triggers when next scrollIntoView gets called.
     * - 'scrollend' doesn't get called in case target is already in view.
     *
     * We also need to activateRootScroll incase user interrupts scrollIntoView
     * with mousewheel or touchpad scroll.
     */
    activateManualScroll: () => {
      context.detectScrollEnd();
      context.root.addEventListener('scroll', context.detectScrollEnd);
      context.root.addEventListener('mousewheel', context.scrollEndCallback);
    },
    /**
     * Removes listener and clears timer.
     */
    deactivateManualScroll: () => {
      context.clearScrollEnd();
      context.root.removeEventListener('scroll', context.detectScrollEnd);
      context.root.removeEventListener('mousewheel', context.scrollEndCallback);
    },
    /**
     * Sets scroll end callback.
     */
    detectScrollEnd: () => {
      context.clearScrollEnd();
      context.scrollEndTimer = window.setTimeout(context.scrollEndCallback, 100);
    },
    /**
     * Deactivates manual scroll listener and activates view scroll listener.
     */
    scrollEndCallback: () => {
      context.deactivateManualScroll();
      context.activateRootScroll();
    },
    /**
     * Activates the pressed Stepper.Button and navigates to relevant target smoothly.
     */
    setActiveTargetManually: (id) => {
      context.deactivateManualScroll();
      context.deactivateRootScroll();
      context.deactivateButtons();
      context.activateManualScroll();
      context.buttons[id].handlers.activate();
      context.targets[id].current?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
    },
    /**
     * Sets active Stepper.Button by means of electing most likely observed Stepper.Target.
     */
    setActiveButtonAutomatically: debounce(() => {
      if (!context.isInitialized) {
        return;
      }
      const candidates = context.getRatioLeaders();
      context.deactivateButtons();

      let targetId = '';
      switch (candidates.length) {
        case 0:
          // We need to wait first registerTarget to appear
          // to call [targetId].handlers.activate();
          // It can be usefull during initialization or
          // When we add targets asynchronously.
          context.setActiveButtonAutomatically();
          break;
        case 1:
          [targetId] = candidates;
          break;
        default:
          if (context.direction === 'down') {
            targetId = candidates[candidates.length - 1];
          } else if (context.direction === 'up') {
            [targetId] = candidates;
          }
          break;
      }

      if (targetId) {
        context.buttons[targetId].handlers.activate();
      }
    }, 10),
  };
  return context;
}

export const StepperContext = createContext(getContext());

export const StepperProvider = function StepperProvider({ children }: { children: React.ReactNode }) {
  const contextValue = useMemo(getContext, []);

  useEffect(() => {
    contextValue.initialize();
    return contextValue.uninitialize;
  }, [contextValue]);

  return <StepperContext.Provider value={contextValue}>{children}</StepperContext.Provider>;
};
