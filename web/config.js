(function () {
  function setError (msg) {
    const el = document.getElementById('error')
    el.textContent = msg || ''
    el.style.display = msg ? 'block' : 'none'
  }

  async function authFetch (url, accessToken) {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`)
    }
    return res.json()
  }

  function applySelection (select, selectedIds) {
    const set = new Set((selectedIds || []).map(String))
    for (const opt of select.options) {
      opt.selected = set.has(opt.value)
    }
  }

  function getSelected (select) {
    const ids = []
    for (const opt of select.selectedOptions) ids.push(parseInt(opt.value, 10))
    return ids
  }

  async function listPipelines (baseUrl, project, accessToken) {
    // Prefer Pipelines API (works for YAML). Fallback to Build Definitions.
    try {
      const p = await authFetch(`${baseUrl}/${project}/_apis/pipelines?api-version=7.1-preview.1`, accessToken)
      if (Array.isArray(p.value) && p.value.length) {
        return p.value.map(x => ({ id: x.id, name: x.name }))
      }
    } catch (e) { /* ignore, fallback */ }
    const d = await authFetch(`${baseUrl}/${project}/_apis/build/definitions?api-version=7.1-preview.7`, accessToken)
    if (Array.isArray(d.value)) {
      return d.value.map(x => ({ id: x.id, name: x.name }))
    }
    return []
  }

  function filterList (full, term) {
    if (!term) return full
    const t = term.toLowerCase()
    return full.filter(p => String(p.id).includes(t) || (p.name && p.name.toLowerCase().includes(t)))
  }
  
  async function loadData (config, select, accessToken, data = null) {
    const webContext = VSS.getWebContext()
    const project = webContext.project && webContext.project.name
    const baseUrl = `https://dev.azure.com/${webContext.collection.name}`

    const search = document.getElementById('search')
    const refresh = document.getElementById('refresh')
    let selectedIds = data ? JSON.parse(data.customSettings.data)?.pipelineIds : []
    window.allPipelines = []

    search.addEventListener('input', () => render(selectedIds, select, search))
    select.addEventListener('change', () => {
      selectedIds = getSelected(select)
      if (config && config.notify) {
        config.notify({ pipelineIds: selectedIds })
      }
    })
    refresh.addEventListener('click', () =>
      reload(baseUrl, project, selectedIds, accessToken, select, search))

    await reload(baseUrl, project, selectedIds, accessToken, select, search)
  }

  async function reload (baseUrl, project, selectedIds, accessToken, select, search) {
    setError('')
    try {
      window.allPipelines = await listPipelines(baseUrl, project, accessToken)
      render(selectedIds, select, search)
    } catch (e) {
      setError(e.message || String(e))
    }
  }

  function render (selectedIds, select, search) {
    const filtered = filterList(allPipelines, search.value)
    select.innerHTML = ''
    for (const p of filtered) {
      const opt = document.createElement('option')
      opt.value = String(p.id)
      opt.textContent = `${p.name} (#${p.id})`
      select.appendChild(opt)
    }
    applySelection(select, selectedIds)
  }

  async function run () {
    VSS.init({
      explicitNotifyLoaded: true,
      usePlatformStyles: true,
      usePlatformScripts: true
    })
    
    await VSS.ready(() => {
      VSS.require(['TFS/Dashboards/WidgetHelpers'], async function (WidgetHelpers) {
        WidgetHelpers.IncludeWidgetConfigurationStyles()
        VSS.register('code-coverage-widget-configuration', async function () {
          const select = document.getElementById('pipelines')
          const accessToken = (await VSS.getAccessToken()).token
          const config = VSS.getConfiguration()
          return {
            load: async function (data, widgetConfigurationContext) {
              config.notify = function (notifyData) {
                const customSettings = { data: JSON.stringify(notifyData) }
                const eventName = WidgetHelpers.WidgetEvent.ConfigurationChange
                const eventArgs = WidgetHelpers.WidgetEvent.Args(customSettings)
                widgetConfigurationContext.notify(eventName, eventArgs)
              }
              await loadData(config, select, accessToken, data)
              return WidgetHelpers.WidgetStatusHelper.Success()
            },
            onSave: function () {
              const customSettings = { data: JSON.stringify({ pipelineIds: getSelected(select) }) }
              return WidgetHelpers.WidgetConfigurationSave.Valid(customSettings)
            }
          }
        })
        VSS.notifyLoadSucceeded()
      })
    })
  }

  run().catch(err => {
    setError(err.message || String(err))
    try { VSS.notifyLoadFailed(err.message || String(err)) } catch (e) {}
  })
})()