# Scoring Methodology

The MVP scoring model is designed to be understandable, defensible, and easy to revise.

## Metrics

Accuracy is the percentage of resolved directional predictions that were correct.

Calibration uses a Brier-style score and converts lower error into a 0-100 score.

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

## Disclaimer

This is not a final mathematical reputation standard. It is an early MVP model for validation.
