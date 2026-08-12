# X Promotion Filter for Firefox

A small Manifest V3 Firefox extension that hides promoted, boosted, sponsored, and paid-partnership timeline items on `x.com` and `twitter.com`.

## Detection strategy

The content script watches dynamically inserted timeline nodes and checks two classes of signals:

- X's `placementTracking` test marker;
- short labels outside tweet text/user/card content, normalized against terms such as `Promoted`, `Sponsored`, and `Paid partnership`.

Matched containers receive one data attribute and are hidden by the extension stylesheet. A setting can allow paid-partnership posts while continuing to hide other promotions.

```text
MutationObserver -> candidate timeline nodes -> marker/label classification
                 -> user setting -> data attribute -> CSS hide
```

## Install for development

1. Open `about:debugging#/runtime/this-firefox`.
2. Select **Load Temporary Add-on**.
3. Choose `manifest.json`.
4. Open X and verify the popup/options behavior.

The extension requests only `storage` plus host access to `x.com` and `twitter.com`. It declares no data collection in the Firefox-specific manifest field. There is no background server, analytics, or network request in the source.

## Test and package

Requirements: Node.js 18+ for tests; PowerShell for the packaging script.

```bash
npm test
npm run package
```

Packaging creates `x-promotion-filter-firefox.zip`; generated archives are ignored.

## Limitations

- X can change its markup, labels, test IDs, localization, or rendering at any time.
- Label matching is intentionally narrow to avoid hiding ordinary posts that merely discuss advertising.
- The included vocabulary is English-focused.
- Hidden counts are page-session state and are not a billing or platform metric.
- This extension does not block network ad requests or remove tracking; it filters matching rendered containers.

Use of X remains subject to its terms. X and Twitter names/marks belong to their respective owners; this project is unaffiliated.

## License

MIT.
