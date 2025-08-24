(function(){
  function formatPct(n){
    if (isNaN(n)) return "-";
    return (Math.round(n * 10) / 10).toFixed(1) + "%";
  }

  function svgPie(percent){
    // percent: 0..100
    const pct = Math.max(0, Math.min(100, percent));
    const r = 70;
    const c = 80;
    const circ = 2 * Math.PI * r;
    const covered = circ * (pct / 100);
    const uncovered = circ - covered;
    const coverageIndex = pct >= 80 ? 2 : (pct >= 50 ? 1 : 0);
    return `
      <svg viewBox="0 0 160 160" class="pie">
        <circle cx="${c}" cy="${c}" r="${r}" stroke="#f3f2f1" stroke-width="16" fill="none" />
        <circle cx="${c}" cy="${c}" r="${r}" coverage-index="${coverageIndex}" stroke-width="16" fill="none"
                stroke-dasharray="${covered} ${uncovered}" transform="rotate(-90 ${c} ${c})" stroke-linecap="butt"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-size="22" fill="rgba(var(--palette-neutral-100, 0, 0, 0), 1)" font-weight="600">${formatPct(pct)}</text>
      </svg>
    `;
  }

  async function authFetch(url, accessToken){
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    if (!res.ok) {
      const text = await res.text().catch(()=>"");
      throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
    }
    return res.json();
  }

  function renderEmpty(container, message, title){
    container.innerHTML = `<div>
        <div class="title">${title}</div>
        <div class="empty">
          <span>${message}</span>
          <img src="img/configure.png">
        </div>
      </div>`;
  }

  function makeCard({name, id, pct, lines, covered, buildId, error}){
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <div class="title" title="${name}">${name}</div>
      <div class="subtitle">Pipeline #${id}${buildId ? ` • Build #${buildId}` : ''}</div>
      ${error ? `<div class="error">${error}</div>` : svgPie(pct)}
      ${!error && lines != null ? `<div class="legend">${covered}/${lines} lines covered</div>` : ''}
    `;
    return div;
  }

  async function getLatestBuildForDefinition(baseUrl, project, definitionId, accessToken){
    const url = `${baseUrl}/${project}/_apis/build/builds?definitions=${definitionId}&$top=1&statusFilter=completed&queryOrder=finishTimeDescending&api-version=7.1`;
    const json = await authFetch(url, accessToken);
    return json.count > 0 ? json.value[0] : null;
  }

  async function getCoverageForBuild(baseUrl, project, buildId, accessToken){
    const url = `${baseUrl}/${project}/_apis/test/codecoverage?buildId=${buildId}&flags=7&api-version=7.1`;
    const json = await authFetch(url, accessToken);
    let total = 0, covered = 0;
    if (json && Array.isArray(json.value) && json.value.length > 0) {
      const entry = json.value[0];
      const modules = Array.isArray(entry.modules) ? entry.modules : [];
      for (const m of modules) {
        const st = m && m.statistics ? m.statistics : {};
        const lc = Number(st.linesCovered ?? 0);
        const lnc = Number(st.linesNotCovered ?? 0);
        covered += lc;
        total += lc + lnc;
      }
    }
    if (total === 0) return {pct: null, total: 0, covered: 0};
    return {pct: (covered/total)*100, total, covered};
  }

  async function getPipelineName(baseUrl, project, pipelineId, accessToken){
    // Try pipelines API first, fallback to build definition API
    try{
      const p = await authFetch(`${baseUrl}/${project}/_apis/pipelines/${pipelineId}?api-version=7.1-preview.1`, accessToken);
      if (p && p.name) return p.name;
    }catch(e){ /* ignore and fallback */ }
    try{
      const d = await authFetch(`${baseUrl}/${project}/_apis/build/definitions/${pipelineId}?api-version=7.1`, accessToken);
      if (d && d.name) return d.name;
    }catch(e){ }
    return `Pipeline ${pipelineId}`;
  }
  
  async function loadData(data, accessToken) {
    const parsedData = data ? JSON.parse(data.customSettings.data) : null;
    const pipelineIds = parsedData?.pipelineIds ?? [];
    const title = data?.name ?? 'Code Coverage Widget';
    const container = document.getElementById('container');

    const webContext = VSS.getWebContext();
    const project = webContext.project && webContext.project.name;
    if (!project){
      renderEmpty(container, 'No project context', title);
      return;
    }
    
    if (pipelineIds.length === 0) {
      renderEmpty(container, 'Configure widget', title);
      return;
    }

    const baseUrl = `https://dev.azure.com/${webContext.collection.name}`;

    container.innerHTML = '';

    const results = [];
    for (const pid of pipelineIds){
      results.push((async () => {
        try{
          const [build, name] = await Promise.all([
            getLatestBuildForDefinition(baseUrl, project, pid, accessToken),
            getPipelineName(baseUrl, project, pid, accessToken)
          ]);
          if (!build){
            return {id: pid, name, error: 'No completed builds found.'};
          }
          const coverage = await getCoverageForBuild(baseUrl, project, build.id, accessToken);
          if (coverage.pct == null){
            return {id: pid, name, buildId: build.id, error: 'No coverage data.'};
          }
          return {id: pid, name, buildId: build.id, pct: coverage.pct, lines: coverage.total, covered: coverage.covered};
        }catch(e){
          return {id: pid, name: `Pipeline ${pid}`, error: e.message || String(e)};
        }
      })());
    }

    const resolved = await Promise.all(results);
    for (const r of resolved){
      container.appendChild(makeCard(r));
    }
  }

  async function run(){
    VSS.init({
      explicitNotifyLoaded: true,
      usePlatformStyles: true,
      usePlatformScripts: true
    })

    await VSS.ready(() => {
      VSS.require(["TFS/Dashboards/WidgetHelpers"], async function (WidgetHelpers) {
        WidgetHelpers.IncludeWidgetStyles();
        VSS.register("code-coverage-widget", async function () {
          const accessToken = (await VSS.getAccessToken()).token
          return {
            load: function (data) {
              loadData(data, accessToken)
              return WidgetHelpers.WidgetStatusHelper.Success()
            },
            reload: function (data) {
              loadData(data, accessToken)
              return WidgetHelpers.WidgetStatusHelper.Success()
            }
          }
        })
        VSS.notifyLoadSucceeded()
      })
    })
  }

  run().catch(err => {
    const container = document.getElementById('container');
    if (container) container.innerHTML = `<div class="error">Failed to load widget: ${err.message || err}</div>`;
    try { VSS.notifyLoadFailed(err.message || String(err)); } catch(e) {}
  });
})();