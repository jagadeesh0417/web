# Security notes

## Next.js bundled PostCSS

`npm audit` reports the following advisories for the PostCSS version bundled with Next.js 15.5.29:

> PostCSS has XSS via Unescaped </style> in its CSS Stringify Output — GHSA-qx2v-qp2m-jg93
>
> PostCSS: Arbitrary file read and information disclosure via attacker-controlled sourceMappingURL in CSS comments — GHSA-6g55-p6wh-862q
>
> PostCSS: incomplete fix of GHSA-6g55-p6wh-862q — attacker-controlled sourceMappingURL reads arbitrary .map files when `from` is unset — GHSA-fxqj-rqcc-2cmp
>
> PostCSS: Path Traversal in Previous Source Map Auto-Loading (sourceMappingURL) leads to Arbitrary .map File Disclosure — GHSA-r28c-9q8g-f849

Source inspection found no application code that accepts untrusted CSS or source maps and sends them to PostCSS. PostCSS is used by the build toolchain. This is not a proof that all framework or deployment paths are unreachable; reassess whenever the build pipeline or input handling changes.

Per the requested risk decision, this finding is accepted until the planned Next.js 16 upgrade. No PostCSS override has been added. Reassess advisories and test the upgrade before deployment.
