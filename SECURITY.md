# Security policy

Report vulnerabilities privately to the security contact published on `eyrove.com`. Do not open a public issue containing API keys, provider responses, personal images or browsing data.

The extension stores BYOK settings and local history in `chrome.storage.local`. It sends the configured key only in the `Authorization` header of the exact endpoint saved by the user. It does not send the key to EYROVE.

Before installing a release, verify that the archive contains only this directory and review `manifest.json`, `background.js` and `core.js`.
