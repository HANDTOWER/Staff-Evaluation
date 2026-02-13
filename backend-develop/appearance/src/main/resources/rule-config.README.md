# rule-config.json 설명 (EN)

This file documents the fields used in rule-config.json.

## required

- List of clothing rules that must be satisfied.
- Each item must match a boolean getter in `AppearanceCriteria` (`isShirt`, `isPants`, `isShoes`, `isHat`, `isTie`, ...).

## score

- `base`: Base score before penalties.
- `penaltyPerViolation`: Points subtracted per violated rule.
- `minScore`: Minimum score after penalties.

## pose

Pose thresholds used to evaluate posture. Values are compared to the absolute value of the incoming metrics unless noted.

### Head Deviation

- `headGoodMax`: Green threshold (0..headGoodMax). Current: 10.0.
- `headWarnMax`: Yellow threshold (headGoodMax..headWarnMax). Red if above `headWarnMax`. Current: 20.0.

### Shoulder Tilt

- `shoulderGoodMax`: Green threshold. Current: 3.0.
- `shoulderWarnMax`: Yellow threshold. Red if above. Current: 10.0.

### Forward Head Z

- `forwardHeadGoodMax`: Green threshold (must be strictly less than this value). Current: 2.2.
- `forwardHeadWarnMax`: Yellow threshold (>= good and < warn). Red if >= warn. Current: 2.3.

### Back Deviation

- `backGoodMax`: Green threshold. Current: 20.0.
- `backWarnMax`: Yellow threshold. Red if above. Current: 40.0.

### Stability Score (0–100)

- `stabilityGoodMin`: Green threshold (>= this value). Current: 80.0.
- `stabilityWarnMin`: Yellow threshold (>= this value and < good). Red if below. Current: 65.0.

### Arm Angle

- `armWarnMin`: Yellow threshold (> this value). Current: 10.0.
- `armBadMin`: Red threshold (> this value). Current: 30.0.

### Leg Angle

- `legWarnMin`: Yellow threshold (> this value). Current: 60.0.
- `legBadMin`: Red threshold (> this value). Current: 80.0.

## Notes

- The backend expects stability as a 0–100 score. If the frontend sends `stability_norm` (0–1), it is converted to 0–100 internally.
- Forward head Z uses `<` for green and `>=` for warning/critical.
