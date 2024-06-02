import { Children, cloneElement, useContext, useEffect, useRef, useState } from 'react';
import { StepperContext } from './stepper.context';
import './styles.css';

type StepperButtonProps = { children?: React.ReactNode; regId: string };

export const StepperButton = function StepperButton({ children, regId }: StepperButtonProps) {
  const { registerButton, unregisterButton, setActiveTargetManually } = useContext(StepperContext);
  const button = useRef(null);
  const [isActive, setActive] = useState(false);

  useEffect(() => {
    registerButton(regId, {
      element: button,
      handlers: {
        deactivate: () => setActive(false),
        activate: () => setActive(true),
        isActive: () => isActive,
      },
    });
    return () => {
      unregisterButton(regId);
    };
  }, [regId, button, setActive, isActive, unregisterButton, registerButton]);

  const childrenArray = Children.toArray(children);

  if (childrenArray.length > 1) {
    throw new Error('StepperButton should have only one child element which should accept active prop');
  }

  const child = cloneElement(childrenArray[0], { isActive });

  return (
    <button className="left-block-w-full" type="button" ref={button} onClick={() => setActiveTargetManually(regId)}>
      {child}
    </button>
  );
};
