# Code Coverage Pizza - Azure DevOps Dashboard Widget

## How it works
- Pipelines list is retrieved using `GET _apis/pipelines` (and falls back to `GET _apis/build/definitions` if needed).
- For each selected pipeline ID, the widget queries the latest completed build via `GET _apis/build/builds?definitions={id}&$top=1&statusFilter=completed&queryOrder=finishTimeDescending`.
- Code coverage is read from `GET _apis/test/codecoverage?buildId={buildId}&flags=7` and the "Lines" coverage stats are aggregated.
- Calls are authenticated using the extension SDK access token.

## Build/Run
This extension is pure static HTML/JS and bundles the Azure DevOps Extension SDK locally (no external CDN dependency). No build step is required.

### Package and publish
1. Update `vss-extension.json` with your `publisher` and repository link.
2. Install `tfx-cli` if needed: `npm i -g tfx-cli`
3. Create a VSIX: `tfx extension create --manifest-globs vss-extension.json`
4. Publish to your publisher: `tfx extension publish --publisher <publisher>`
5. Install the extension into your Azure DevOps organization and add the widget to a dashboard.