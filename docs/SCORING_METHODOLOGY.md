# Scoring Methodology

The MVP scoring model is designed to be understandable, defensible, and easy to revise.

## Metrics

Accuracy is the percentage of resolved directional predictions that were correct. Neutral forecasts are excluded from directional accuracy.

Calibration uses a Brier-style score against the market's yes/no outcome and converts lower error into a 0-100 score. `predicted_probability` means probability of "yes"; `confidence` is a separate subjective conviction field and is not used as a substitute for probability.

Experience increases with the number of resolved forecasts and reduces the impact of tiny samples.

Consistency rewards stable performance across earlier and later resolved forecasts.

Recent performance measures the most recent resolved calls so rankings can respond to changing forecaster quality.

## Verity Score

Initial weights:

- 35% accuracy
- 25% calibration
- 15% consistency
- 15% experience
- 10% recent performance

A minimum-sample adjustment blends the raw score toward 50 until the forecaster has enough resolved history.

## Market Conviction

Reputation-weighted market conviction gives more weight to forecasters with:

- higher Verity scores
- more resolved forecast experience
- stronger performance in the market category

Individual influence is capped so one forecaster cannot dominate the aggregate.

Forecasts on cancelled markets and forecasts after a market resolution date are excluded or rejected. The model still needs more work for forecast timing, repeated updates, category sample imbalance, and adversarial behavior.

## Disclaimer

This is not a final mathematical reputation standard. It is an early MVP model for validation.
