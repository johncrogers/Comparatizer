import React, { useState } from "react";
import { Input, Row, Col, FormGroup, Label } from "reactstrap";
import { isEqual } from "lodash";

export const Comparatizer: React.FC<IComparatizerPropTypes> = (
  props: IComparatizerPropTypes
) => {
  const [expectedIsValid, setExpectedIsValid] = useState(false);
  const [actualIsValid, setActualIsValid] = useState(false);
  const [actual, setActual] = useState<string>();
  const [expected, setExpected] = useState<string>();
  const [actualJSON, setActualJSON] = useState<{ [key: string]: any }>({});
  const [expectedJSON, setExpectedJSON] = useState<{ [key: string]: any }>({});

  if (actualJSON && expectedJSON) {
    console.clear();
    logNonMatchingProperties(actualJSON, expectedJSON);
  }

  return (
    <div
      style={{
        height: window.innerHeight,
        width: window.innerWidth,
      }}
    >
      <h1>Comparatizer</h1>
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="actual">
              Actual:
              <div style={{ color: actualIsValid ? "green" : "red" }}>
                {actualIsValid ? "Valid" : "Invalid"}
              </div>
            </Label>
            <Input
              style={{ height: window.outerHeight }}
              id="actual"
              type="textarea"
              value={actual}
              onChange={(event) => {
                setActual(event.target.value);
                try {
                  const value = JSON.parse(event.target.value);
                  setActualJSON(value);
                  setActualIsValid(true);
                } catch (err) {
                  setActualIsValid(false);
                }
              }}
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="expected">
              Expected:
              <div style={{ color: expectedIsValid ? "green" : "red" }}>
                {expectedIsValid ? "Valid" : "Invalid"}
              </div>
            </Label>
            <Input
              style={{ height: window.outerHeight }}
              id="expected"
              type="textarea"
              value={expected}
              onChange={(event) => {
                setExpected(event.target.value);
                try {
                  const value = JSON.parse(event.target.value);
                  setExpectedJSON(value);
                  setExpectedIsValid(true);
                } catch (err) {
                  setExpectedIsValid(false);
                }
              }}
            />
          </FormGroup>
        </Col>
      </Row>
    </div>
  );
};

export interface IComparatizerPropTypes {}

const logNonMatchingProperties: (
  actual: { [key: string]: any },
  expected: { [key: string]: any },
  objectName?: string
) => void = (
  actual: { [key: string]: any },
  expected: { [key: string]: any },
  objectName
) => {
  const inequalities: {
    missing?: { [key: string]: any };
    extra?: { [key: string]: any };
    unequal?: {
      [key: string]: {
        expected: any;
        actual: any;
      };
    };
  } = {};
  // Collect missing, extra, and unequal values
  new Set(Object.keys(actual).concat(Object.keys(expected))).forEach((key) => {
    const isExtra: boolean =
      !expected.hasOwnProperty(key) && actual.hasOwnProperty(key);
    const isMissing: boolean =
      expected.hasOwnProperty(key) && !actual.hasOwnProperty(key);
    const isShared: boolean =
      expected.hasOwnProperty(key) && actual.hasOwnProperty(key);
    const isUnequal: boolean = !isEqual(actual[key], expected[key]);

    if (isMissing) {
      const missingValue = expected[key];
      if (!inequalities.missing) {
        inequalities.missing = {
          [key]: missingValue,
        };
      }
      inequalities.missing[key] = missingValue;
    }
    if (isExtra) {
      const extraValue = actual[key];
      if (!inequalities.extra) {
        inequalities.extra = {
          [key]: extraValue,
        };
      }
      inequalities.extra[key] = extraValue;
    }
    if (isShared && isUnequal) {
      const unequalValue = {
        actual: actual[key],
        expected: expected[key],
      };
      if (!inequalities.unequal) {
        inequalities.unequal = {
          [key]: unequalValue,
        };
      }
      inequalities.unequal[key] = unequalValue;
    }
  });

  console.group(objectName || "Inequalities:", inequalities);
  if (!objectName) {
    console.log("Actual:", actual);
    console.log("Expected:", expected);
  }
  if (inequalities.missing) {
    console.group("Values missing from actual:");
    console.table(inequalities.missing);
    console.groupEnd();
  }
  if (inequalities.extra) {
    console.group("Extra values not in expected:");
    console.table(inequalities.extra);
    console.groupEnd();
  }
  if (inequalities.unequal) {
    console.group("Unequal values:");
    console.table(inequalities.unequal);
    console.groupEnd();
  }
  if (inequalities.unequal) {
    Object.keys(inequalities.unequal).forEach((unequalKey) => {
      if (
        inequalities.unequal &&
        typeof inequalities.unequal[unequalKey].expected === "object"
      ) {
        logNonMatchingProperties(
          inequalities.unequal[unequalKey].actual,
          inequalities.unequal[unequalKey].expected,
          unequalKey
        );
      }
    });
  }
  console.groupEnd();
};
