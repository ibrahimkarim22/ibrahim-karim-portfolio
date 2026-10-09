# Google Drive resume source

## Investigation

The active portfolio used `/Ibrahim_Karim_Full_Stack_Resume.pdf` in `ResumeContext.js` for Open and Download, and `ResumeView.js` embedded the same local file with native PDF toolbar fragments. The tracked PDF in `public/` was also present in the existing `build/` directory. Create React App copies public assets into the build, and Firebase Hosting serves that build. Updating Drive could not change that deployed copy, regardless of browser cache settings.

Desktop uses `ResumeContext` in `HomeContextPanel`; the compact/mobile layout uses the same context inside `ResumeView`. Their source was already shared. The existing resume SCSS, breakpoints, dimensions, shell navigation and animations are preserved.

There was no active resume Drive link. Project APK links point to unrelated Drive files. Git history contained an older PDF link (`1Mc2SdmCu-oop6GbOgkBhhYwq8rDUKLsO`) replaced by a Google Docs link in commit `82f23ff`. Connector metadata identified that older PDF as `Ibrahim-Karim-Resume.pdf`, modified in 2024. It was not used for this change.

The owner supplied the current authoritative file:

- File ID: `1ur7krnoyejgUwa6azvwzmWAas6kzIiVT`.
- Filename: `Ibrahim_Karim_Full_Stack_Resume.pdf`.
- MIME type: `application/pdf`.
- Connector metadata: modified October 9, 2026 at 12:59:38 p.m. Eastern (16:59:38 UTC), size 60,078 bytes.
- Current PDF text was successfully fetched through the connected Drive account. Separate anonymous HTTP checks successfully returned the named preview/open pages and a 60,078-byte PDF download with the expected filename.

`firebase.json` defines no custom caching headers, and `src/index.js` registers no service worker. Firebase's normal static asset cache and browser PDF caching could retain the old bundled document, but the fundamental issue was a deployed snapshot. The revised flow does not request a Firebase-hosted PDF.

## Implementation

`src/components/resume/resumeSource.js` is the single configuration point. It derives these destinations from one stable file ID, without filename paths, revision IDs, timestamp parameters, credentials or application-side PDF fetching:

| Access | Destination |
| --- | --- |
| Embedded viewer | `https://drive.google.com/file/d/1ur7krnoyejgUwa6azvwzmWAas6kzIiVT/preview` |
| Open Resume | `https://drive.google.com/file/d/1ur7krnoyejgUwa6azvwzmWAas6kzIiVT/view` |
| Download Resume | `https://drive.google.com/uc?export=download&id=1ur7krnoyejgUwa6azvwzmWAas6kzIiVT` |

The preview uses Drive's viewer rather than embedding a sharing page or raw download redirect. The iframe's size and container are unchanged; Drive controls its internal viewer UI. Both buttons are ordinary new-tab anchors with `noopener noreferrer`. Download requests the current file from Drive, which controls redirects, permission checks, download headers and the saved filename. The cross-origin HTML `download` attribute was removed because it cannot enforce this behavior or rename the remote file.

The obsolete `public/` PDF was removed so future builds do not carry another resume copy. No local PDF fallback exists. Missing or malformed source configuration shows an unavailable message and emits no broken links. For unavailable remote content, Drive controls the iframe's error page; the existing independent Open Resume and Download Resume links remain available in both layouts. Screen readers also receive guidance to use Open Resume when previewing fails. The portfolio cannot inspect Drive's cross-origin error page or reliably detect it with iframe events.

This code change needs an initial deployment before it affects the live portfolio. No deployment was performed. After that initial deployment, use the existing Drive item's **Manage versions → Upload new version**. Future same-file revisions need no application edits, rebuilds or Firebase deployments. Uploading a separate file with the same name creates another ID and will not update these links.

## Permissions and practical limitations

- Anonymous HTTP access and downloading succeeded for this specific file at verification time. If access later changes, check **Anyone with the link → Viewer** and that viewers can download it. An organization may restrict those settings. No permissions or Drive files were modified by this task. The exact sharing-policy settings were not exposed by connector metadata.
- Ordinary iframe embedding and link navigation do not require a CORS-enabled PDF fetch. The app intentionally avoids `fetch`, Blob downloads and PDF.js against Drive.
- Google recommends **Embed item** for uploaded PDFs. The synthesized `/preview`, `/view` and `uc?export=download` routes are Drive web conventions, not immutable public API contracts. A download may show a confirmation, login, abuse/traffic-limit page or error rather than immediately save bytes. Never store a redirected session/confirmation URL.
- Browser and Drive caching/preview processing can delay visibility. An already-open preview does not receive live updates; reopen or reload it after replacing a revision. This implementation resolves the current logical file on subsequent requests, without promising immediate cache invalidation or identical snapshots across separate requests.
- The supplied URL has no `resourcekey`. If Google later requires a resource key, preserve it in the source destinations; do not reuse a different file ID to work around access restrictions.
- Mobile Safari/Chrome can show a preview or save/share flow rather than a desktop-style download. Use Open Resume when the embedded viewer is unsupported or blocked. On iPhone, the displayed PDF can be saved using Share → Save to Files.
- The smallest fallback for a failing direct-download route is **Open Resume → Drive's native Download action**, using the same item. A guaranteed programmatic filename, instant revision propagation or inspectable remote error status would require a controlled serving endpoint; that exceeds this minimal static-hosting change. No backend, Drive API credentials or scheduled synchronization was added.

## Verification

Focused tests cover both existing context placements, exact same-ID destinations, no active local-PDF destinations, stable links across later dates, independent actions after opaque iframe events, accessible fallback guidance and missing/malformed configuration. Application regression tests retain keyboard navigation, context ordering and route behavior.

Verification completed:

- Resume and application suites: 133 tests passed across two suites.
- Complete suite: 770 tests passed across 41 suites (`node node_modules/react-scripts/bin/react-scripts.js test --watchAll=false --runInBand`, the underlying npm test runner).
- `npm run build`: passed. Existing warnings remain for a missing MediaPipe source map, `HorizontalScroll.js` hook usage, outdated Browserslist data and Create React App's Babel dependency declaration. Test runs also report dependency deprecations and warnings from existing Reactstrap/router coverage; no failures occurred.
- `git diff --check`: passed.
- The new build contains no `Ibrahim_Karim_Full_Stack_Resume.pdf` static asset, and searching `src/` and `public/` finds no local-PDF source references. The compiled stylesheet hash is unchanged (`main.328b9b53.css`).
- Independent code review: no blocking findings. Test names/documentation distinguish URL stability and both context placements from unperformed remote-revision and responsive-browser checks.

Anonymous HTTP checks without cookies or authentication returned status 200 for `/preview` and `/view`, with the correct filename in their HTML and `Cache-Control: no-cache, no-store, max-age=0, must-revalidate`. The download followed Drive's redirects and returned status 200, PDF signature `%PDF-`, 60,078 bytes (matching current metadata), and `Content-Disposition: attachment; filename="Ibrahim_Karim_Full_Stack_Resume.pdf"`, with `Cache-Control: private, max-age=0`. These checks succeeded using an approved network-capable shell after sandbox network restrictions blocked the initial attempt.

No connected browser was available. Actual desktop/mobile rendering, browser save-dialog behavior and replacement-revision propagation were not verified. The date-change test verifies URL stability; it does not upload or simulate a remote revision. Context tests exercise both placements, not browser responsive layout. The live deployed website was not changed.

## References

- [Google: embed uploaded Drive files](https://workspaceupdates.googleblog.com/2023/10/upcoming-changes-to-third-party-cookies-in-google-drive.html).
- [Google: manage file versions](https://support.google.com/drive/answer/2409045?hl=en).
- [Google: sharing and download permissions](https://support.google.com/drive/answer/2494822?hl=en).
- [Google: browser downloads and webContentLink](https://developers.google.com/workspace/drive/api/guides/manage-downloads).
- [Google: stable file links](https://developers.google.com/workspace/drive/api/guides/manage-sharing#file_links_and_access_control).
- [Google: resource keys](https://developers.google.com/workspace/drive/api/guides/resource-keys).
- [MDN: cross-origin download attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#download).
- [MDN: iframe load and error event behavior](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#error_and_load_event_behavior).
- [Apple: saving a PDF on iPhone](https://support.apple.com/guide/iphone/download-a-pdf-ipha9ed5131c/ios).
