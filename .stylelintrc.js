module.exports = {
  "processors": ["@mapbox/stylelint-processor-arbitrary-tags"],
  "extends": [
    "stylelint-config-standard",
    "stylelint-config-recommended-scss"
  ],
  "plugins": ["stylelint-scss"],
  "rules": {
    "no-empty-source": null,
    "no-descending-specificity": null,
    "selector-descendant-combinator-no-non-space": null,
    "selector-combinator-space-before": null,
  }
}
