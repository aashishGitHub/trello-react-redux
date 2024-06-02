import { useContext, useEffect, useRef } from 'react';
import { StepperContext } from './stepper.context';

export function StepperTarget({ children, regId }: { children?: React.ReactNode; regId: string }) {
  const { registerTarget, unregisterTarget } = useContext(StepperContext);
  const target = useRef(null);

  useEffect(() => {
    registerTarget(regId, target);
    return () => {
      unregisterTarget(regId);
    };
  }, [regId, target, registerTarget, unregisterTarget]);

  return <div ref={target}>{children}</div>;
}
