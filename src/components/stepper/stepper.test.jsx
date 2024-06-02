import { createRef } from 'react';
import { generateArray } from 'utils/array';
import { getContext } from './stepper.context';
import { StepperContextType } from './stepper.types';

function mockButtonInstance() {
  const activate = jest.fn();
  const deactivate = jest.fn();
  const buttonInstance = {
    element: createRef(),
    handlers: { deactivate, activate, isActive: () => true },
  };
  (buttonInstance.element.current) = document.createElement('button');
  return buttonInstance;
}

function mockIntersectionObserverEntry(y: number, ratio: number): [IntersectionObserverEntry[], IntersectionObserver] {
  return [
    [
      {
        boundingClientRect: new DOMRectReadOnly(undefined, y),
        intersectionRatio: ratio,
        intersectionRect: new DOMRectReadOnly(),
        isIntersecting: true,
        rootBounds: null,
        target: document.createElement('div'),
        time: 123123,
      },
    ],
    new IntersectionObserver(() => {}),
  ];
}

describe('Stepper Instance', () => {
  let context: StepperContextType;

  beforeEach(() => {
    jest.clearAllMocks();
    context = getContext();
    context.uninitialize();
  });

  it('should initialize/uninitialize successfully', () => {
    const activateRootScroll = jest.spyOn(context, 'activateRootScroll');
    const setActiveButtonAutomatically = jest.spyOn(context, 'setActiveButtonAutomatically');
    const deactivateRootScroll = jest.spyOn(context, 'deactivateRootScroll');
    const deactivateManualScroll = jest.spyOn(context, 'deactivateManualScroll');

    context.initialize();

    expect(activateRootScroll).toHaveBeenCalled();
    expect(setActiveButtonAutomatically).toHaveBeenCalled();

    context.uninitialize();

    expect(deactivateRootScroll).toHaveBeenCalled();
    expect(deactivateManualScroll).toHaveBeenCalled();
  });

  it('should register/unregister button if ref is not null', () => {
    let buttonInstance = mockButtonInstance();
    (buttonInstance.element.current) = null;

    context.registerButton('button-id', buttonInstance);
    expect(context.buttons['button-id']).toBe(undefined);

    buttonInstance = mockButtonInstance();
    context.registerButton('button-id', buttonInstance);
    expect(context.buttons['button-id']).toBe(buttonInstance);

    context.unregisterButton('button-id');
    expect(context.buttons['button-id']).toBe(undefined);
  });

  it('should register/unregister target if ref is not null', () => {
    const target = createRef();
    const observeTarget = jest.spyOn(context, 'observeTarget');

    context.registerTarget('target-id', target);

    expect(context.targets['target-id']).toBe(undefined);

    (target.current) = document.createElement('div');
    context.registerTarget('target-id', target);

    expect(context.targets['target-id']).toBe(target);
    expect(observeTarget).toHaveBeenCalled();

    const disconnect = jest.spyOn(context.observers['target-id'], 'disconnect');
    context.unregisterTarget('target-id');

    expect(context.buttons['target-id']).toBe(undefined);
    expect(context.observers['target-id']).toBe(undefined);
    expect(disconnect).toHaveBeenCalled();
  });

  it('should clear ScrollEnd callback', () => {
    const timeout = jest.fn();
    jest.useFakeTimers();

    context.scrollEndTimer = window.setTimeout(timeout, 0);
    context.clearScrollEnd();
    jest.runAllTimers();

    expect(timeout).not.toHaveBeenCalled();
    expect(context.scrollEndTimer).toBe(null);

    jest.useRealTimers();
  });

  it('should return ratio leaders', () => {
    context.ratio = new Map([
      ['regId-1', 0.9],
      ['regId-0', 1],
    ]);
    expect(context.getRatioLeaders()).toEqual(['regId-0']);

    context.ratio = new Map([
      ['regId-0', 0.9],
      ['regId-1', 0.8],
      ['regId-2', 0.9],
      ['regId-3', 0],
    ]);
    expect(context.getRatioLeaders()).toEqual(['regId-0', 'regId-2']);

    context.ratio = new Map([
      ['regId-0', 0],
      ['regId-1', 0],
    ]);
    expect(context.getRatioLeaders()).toEqual([]);
  });

  it('should collect target data', () => {
    const doCollect = context.collectTargetData('regId-0');

    doCollect(...mockIntersectionObserverEntry(2, 0.4));
    doCollect(...mockIntersectionObserverEntry(1, 0.5));

    expect(context.ratio).toEqual(new Map([['regId-0', 0.5]]));
    expect(context.direction).toEqual('down');

    doCollect(...mockIntersectionObserverEntry(1, 0.5));
    doCollect(...mockIntersectionObserverEntry(2, 0.4));

    expect(context.ratio).toEqual(new Map([['regId-0', 0.4]]));
    expect(context.direction).toEqual('up');
  });

  it('should set up target observer', () => {
    const target = createRef();
    (target.current) = document.createElement('div');
    const collectTargetData = jest.spyOn(context, 'collectTargetData');
    const observe = jest.fn();
    const intersectionObserver = jest
      .spyOn(window, 'IntersectionObserver')
      .mockImplementation(() => ({ observe })); // as IntersectionObserver

    context.registerTarget('regId-0', target);

    expect(context.ratio).toEqual(new Map([['regId-0', 0]]));
    expect(collectTargetData).toHaveBeenCalledWith('regId-0');
    expect(intersectionObserver).toHaveBeenCalledWith(expect.any(Function), { root: null, threshold: generateArray(1, 0.05) });
    expect(observe).toHaveBeenCalledWith(target.current);
  });

  it('should deactivate buttons', () => {
    const buttonInstance = mockButtonInstance();

    context.registerButton('button-0', buttonInstance);
    context.registerButton('button-1', buttonInstance);
    context.deactivateButtons();

    expect(buttonInstance.handlers.deactivate).toHaveBeenCalledTimes(2);
  });

  it('should activate/deactivate root scroll binds', () => {
    const addEventListener = jest.spyOn(context.root, 'addEventListener');
    const removeEventListener = jest.spyOn(context.root, 'removeEventListener');

    context.activateRootScroll();
    expect(addEventListener).toHaveBeenCalledWith('scroll', context.setActiveButtonAutomatically);

    context.deactivateRootScroll();
    expect(removeEventListener).toHaveBeenCalledWith('scroll', context.setActiveButtonAutomatically);
  });

  it('should activate/deactivate manual scroll binds', () => {
    const addEventListener = jest.spyOn(context.root, 'addEventListener');
    const detectScrollEnd = jest.spyOn(context, 'detectScrollEnd');

    const clearScrollEnd = jest.spyOn(context, 'clearScrollEnd');
    const removeEventListener = jest.spyOn(context.root, 'removeEventListener');

    jest.clearAllMocks();
    context.activateManualScroll();

    expect(detectScrollEnd).toHaveBeenCalled();
    expect(addEventListener).toHaveBeenNthCalledWith(1, 'scroll', context.detectScrollEnd);
    expect(addEventListener).toHaveBeenNthCalledWith(2, 'mousewheel', context.scrollEndCallback);

    jest.clearAllMocks();
    context.deactivateManualScroll();

    expect(clearScrollEnd).toHaveBeenCalled();
    expect(removeEventListener).toHaveBeenNthCalledWith(1, 'scroll', context.detectScrollEnd);
    expect(removeEventListener).toHaveBeenNthCalledWith(2, 'mousewheel', context.scrollEndCallback);
  });

  it('should set up scrollEndCallback', () => {
    const clearScrollEnd = jest.spyOn(context, 'clearScrollEnd');
    const setTimeout = jest.spyOn(window, 'setTimeout');

    context.detectScrollEnd();

    expect(clearScrollEnd).toHaveBeenCalled();
    expect(setTimeout).toHaveBeenCalledWith(context.scrollEndCallback, 100);
    expect(context.scrollEndTimer).toEqual(expect.any(Number));
  });

  it('should deactivateManualScroll and activateRootScroll when scroll ends', () => {
    const deactivateManualScroll = jest.spyOn(context, 'deactivateManualScroll');
    const activateRootScroll = jest.spyOn(context, 'activateRootScroll');

    context.scrollEndCallback();

    expect(deactivateManualScroll).toHaveBeenCalled();
    expect(activateRootScroll).toHaveBeenCalled();
  });

  it('should set active target manually', () => {
    const deactivateManualScroll = jest.spyOn(context, 'deactivateManualScroll');
    const deactivateRootScroll = jest.spyOn(context, 'deactivateRootScroll');
    const deactivateButtons = jest.spyOn(context, 'deactivateButtons');
    const activateManualScroll = jest.spyOn(context, 'activateManualScroll');

    const buttonInstance = mockButtonInstance();
    context.registerButton('regId-test', buttonInstance);

    Element.prototype.scrollIntoView = jest.fn();
    const target = createRef();
    (target.current) = document.createElement('div');
    context.registerTarget('regId-test', target);

    context.setActiveTargetManually('regId-test');
    expect(deactivateManualScroll).toHaveBeenCalled();
    expect(deactivateRootScroll).toHaveBeenCalled();
    expect(deactivateButtons).toHaveBeenCalled();
    expect(activateManualScroll).toHaveBeenCalled();
    expect(buttonInstance.handlers.activate).toHaveBeenCalled();
    expect(target.current?.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start', inline: 'start' });
  });

  it('should set active button automatically', () => {
    jest.useFakeTimers();
    const deactivateButtons = jest.spyOn(context, 'deactivateButtons');
    jest.spyOn(context, 'getRatioLeaders').mockImplementation(() => ['test-id-1']);

    const buttonInstance = mockButtonInstance();
    context.registerButton('test-id-1', buttonInstance);
    context.isInitialized = true;
    context.setActiveButtonAutomatically();
    jest.runAllTimers();

    expect(deactivateButtons).toHaveBeenCalled();
    expect(buttonInstance.handlers.activate).toHaveBeenCalled();
    jest.clearAllMocks();

    jest.spyOn(context, 'getRatioLeaders').mockImplementation(() => ['test-id-0', 'test-id-1', 'test-id-2']);
    const buttonInstance0 = mockButtonInstance();
    context.registerButton('test-id-0', buttonInstance0);
    const buttonInstance2 = mockButtonInstance();
    context.registerButton('test-id-2', buttonInstance2);
    context.direction = 'down';
    context.setActiveButtonAutomatically();
    jest.runAllTimers();

    expect(deactivateButtons).toHaveBeenCalled();
    expect(buttonInstance2.handlers.activate).toHaveBeenCalled();
    jest.clearAllMocks();

    context.direction = 'up';
    context.setActiveButtonAutomatically();
    jest.runAllTimers();

    expect(deactivateButtons).toHaveBeenCalled();
    expect(buttonInstance0.handlers.activate).toHaveBeenCalled();
    jest.clearAllMocks();

    jest.useRealTimers();
  });

  it('should wait button to be registered', () => {
    jest.useFakeTimers();
    const deactivateButtons = jest.spyOn(context, 'deactivateButtons');
    jest.spyOn(context, 'getRatioLeaders').mockImplementation(() => []);

    context.isInitialized = true;
    context.setActiveButtonAutomatically();
    jest.runOnlyPendingTimers();

    jest.spyOn(context, 'getRatioLeaders').mockImplementation(() => ['test-id-1']);
    const buttonInstance = mockButtonInstance();
    context.registerButton('test-id-1', buttonInstance);

    jest.runAllTimers();

    expect(deactivateButtons).toHaveBeenCalled();
    expect(buttonInstance.handlers.activate).toHaveBeenCalled();
    jest.clearAllMocks();
    jest.useRealTimers();
  });
});
