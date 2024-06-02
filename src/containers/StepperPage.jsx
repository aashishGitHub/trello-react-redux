import React from "react";
import { Stepper } from "../components/stepper/stepper";
import "./stepper.css";

function Step({ isActive, children }: { isActive?: boolean; children?: React.ReactNode }) {
    return <div className={isActive ? 'underline' : ''}>{children}</div>;
  }
  
export default function StepperPage() {
  return (
    <div>
      <h1>StepperPage</h1>
      <div className="relative-w-full">
        <Stepper.Container>
          <div className="fixed">
            <Stepper.Button regId="target-1">
              <Step>step 1</Step>
            </Stepper.Button>
            <Stepper.Button regId="target-2">
              <Step>step 2</Step>
            </Stepper.Button>
            <Stepper.Button regId="target-3">
              <Step>step 3</Step>
            </Stepper.Button>
          </div>
          <Stepper.Target regId="target-1">
            <div className="h-96">
              <h2>Target 1</h2>
            </div>
          </Stepper.Target>
          <Stepper.Target regId="target-2">
            <div className="h-96">
              <h2>Target 2</h2>
            </div>
          </Stepper.Target>
          <Stepper.Target regId="target-3">
            <div className="h-96">
              <h2>Target 3</h2>
            </div>
          </Stepper.Target>
        </Stepper.Container>
      </div>
    </div>
  );
}