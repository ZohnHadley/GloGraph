const fs = require('fs');
const path = require('path');

// Validate every `.glograph` file in this directory, not a hardcoded list — so a
// newly added demo (e.g. the web demo's hero graph) can never silently miss the
// integrity check. Sorted for deterministic output.
const files = fs
  .readdirSync(__dirname)
  .filter((f) => f.endsWith('.glograph'))
  .sort();

let totalPassed = 0;
let totalFailed = 0;

for (const filename of files) {
  const filepath = path.join(__dirname, filename);
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  const failures = [];

  // Build lookup maps
  const paramDefMap = {};
  for (const pd of data.settings.paramDefs) paramDefMap[pd.id] = pd;
  const edgeParamDefMap = {};
  for (const pd of data.settings.edgeParamDefs) edgeParamDefMap[pd.id] = pd;
  const nodeMap = {};
  for (const n of data.nodes) nodeMap[n.id] = n;

  // Version — backend accepts 3–10 (see HANDOFF .glograph File Format).
  if (data.version < 3 || data.version > 10)
    failures.push('version=' + data.version + ' not supported (expected 3–10)');

  // Node param defs
  for (const pd of data.settings.paramDefs) {
    if (!pd.displayName) failures.push('paramDef ' + pd.id + ': missing displayName');
    if (!pd.paramType)   failures.push('paramDef ' + pd.id + ': missing paramType');
    if (pd.sortOrder === undefined) failures.push('paramDef ' + pd.id + ': missing sortOrder');
    for (const opt of pd.options) {
      if (!opt.valueSlug) failures.push('paramDef ' + pd.id + ' opt ' + opt.id + ': missing valueSlug');
      if (opt.sortOrder === undefined) failures.push('paramDef ' + pd.id + ' opt ' + opt.id + ': missing sortOrder');
    }
  }

  // Edge param defs
  for (const pd of data.settings.edgeParamDefs) {
    if (!pd.displayName) failures.push('edgeParamDef ' + pd.id + ': missing displayName');
    if (!pd.paramType)   failures.push('edgeParamDef ' + pd.id + ': missing paramType');
    if (pd.sortOrder === undefined) failures.push('edgeParamDef ' + pd.id + ': missing sortOrder');
    if (pd.drivesArrow === undefined) failures.push('edgeParamDef ' + pd.id + ': missing drivesArrow');
    if (pd.drivesColor === undefined) failures.push('edgeParamDef ' + pd.id + ': missing drivesColor');
    if (pd.drivesStyle === undefined) failures.push('edgeParamDef ' + pd.id + ': missing drivesStyle');
    if (pd.drivesWidth === undefined) failures.push('edgeParamDef ' + pd.id + ': missing drivesWidth');
    const driveCount = [pd.drivesArrow, pd.drivesColor, pd.drivesStyle, pd.drivesWidth].filter(Boolean).length;
    if (driveCount > 1) failures.push('edgeParamDef ' + pd.id + ': multiple drive flags set');
  }

  // Nodes
  for (const n of data.nodes) {
    // Title is optional (graph objects can be untitled — they fall back to a
    // derived label); only the field's presence is checked, not non-emptiness.
    if (n.title === undefined || n.title === null) failures.push('node ' + n.id + ': missing title field');
    if (!n.dateAdded) failures.push('node ' + n.id + ': missing dateAdded');
    if (n.x === undefined) failures.push('node ' + n.id + ': missing x');
    if (n.y === undefined) failures.push('node ' + n.id + ': missing y');

    for (const pv of n.paramValues) {
      if (!pv.id)      failures.push('node ' + n.id + ' pv: missing id');
      if (!pv.nodeId)  failures.push('node ' + n.id + ' pv: missing nodeId');
      if (!pv.paramDefId) failures.push('node ' + n.id + ' pv: missing paramDefId');
      if (pv.isEnabled === undefined) failures.push('node ' + n.id + ' pv: missing isEnabled');
      if (pv.showOnCard === undefined) failures.push('node ' + n.id + ' pv: missing showOnCard');

      if (pv.paramDefId && !paramDefMap[pv.paramDefId])
        failures.push('node ' + n.id + ': unknown paramDefId ' + pv.paramDefId);

      if (pv.paramDefId && paramDefMap[pv.paramDefId]) {
        const def = paramDefMap[pv.paramDefId];
        if ((def.paramType === 'select_color' || def.paramType === 'select') && pv.value) {
          const slugs = def.options.map(o => o.valueSlug);
          if (!slugs.includes(pv.value))
            failures.push('node ' + n.id + ' param "' + def.displayName + '": bad value "' + pv.value + '" not in [' + slugs.join(', ') + ']');
        }
      }
    }
  }

  // Edges
  for (const e of data.edges) {
    if (!e.sourceId) failures.push('edge ' + e.id + ': missing sourceId');
    if (!e.targetId) failures.push('edge ' + e.id + ': missing targetId');
    if (e.sourceId && !nodeMap[e.sourceId])
      failures.push('edge ' + e.id + ': sourceId ' + e.sourceId + ' not found');
    if (e.targetId && !nodeMap[e.targetId])
      failures.push('edge ' + e.id + ': targetId ' + e.targetId + ' not found');

    for (const pv of e.paramValues) {
      if (!pv.id)      failures.push('edge ' + e.id + ' epv: missing id');
      if (!pv.edgeId)  failures.push('edge ' + e.id + ' epv: missing edgeId');
      if (!pv.paramDefId) failures.push('edge ' + e.id + ' epv: missing paramDefId');
      if (pv.isEnabled === undefined) failures.push('edge ' + e.id + ' epv: missing isEnabled');

      if (pv.paramDefId && !edgeParamDefMap[pv.paramDefId])
        failures.push('edge ' + e.id + ': unknown edgeParamDefId ' + pv.paramDefId);

      if (pv.paramDefId && edgeParamDefMap[pv.paramDefId]) {
        const def = edgeParamDefMap[pv.paramDefId];
        if ((def.paramType === 'select_color' || def.paramType === 'select') && pv.value) {
          const slugs = def.options.map(o => o.valueSlug);
          if (!slugs.includes(pv.value))
            failures.push('edge ' + e.id + ' param "' + def.displayName + '": bad value "' + pv.value + '" not in [' + slugs.join(', ') + ']');
        }
      }
    }
  }

  // Regions
  for (const r of data.regions) {
    if (!r.title)     failures.push('region ' + r.id + ': missing title');
    if (!r.createdAt) failures.push('region ' + r.id + ': missing createdAt');
    if (r.x === undefined) failures.push('region ' + r.id + ': missing x');
    if (r.y === undefined) failures.push('region ' + r.id + ': missing y');
    if (!r.width)  failures.push('region ' + r.id + ': missing width');
    if (!r.height) failures.push('region ' + r.id + ': missing height');
  }

  // drivesColor cardinality
  const colorDefs = data.settings.paramDefs.filter(pd => pd.drivesColor);
  if (colorDefs.length === 0) failures.push('no node paramDef has drivesColor=true');
  if (colorDefs.length > 1)  failures.push('multiple node paramDefs have drivesColor: ' + colorDefs.map(d => d.displayName).join(', '));

  const edgeColorDefs = data.settings.edgeParamDefs.filter(pd => pd.drivesColor);
  if (edgeColorDefs.length > 1) failures.push('multiple edge paramDefs have drivesColor');

  const arrowDefs = data.settings.edgeParamDefs.filter(pd => pd.drivesArrow);
  if (arrowDefs.length > 1) failures.push('multiple edge paramDefs have drivesArrow');

  // Summarise
  const passed = failures.length === 0;
  totalPassed += passed ? 1 : 0;
  totalFailed += passed ? 0 : 1;

  const pvTotal  = data.nodes.reduce((s, n) => s + n.paramValues.length, 0);
  const epvTotal = data.edges.reduce((s, e) => s + e.paramValues.length, 0);

  console.log((passed ? 'PASS' : 'FAIL') + '  ' + filename);
  console.log('      ' + data.nodes.length + ' nodes  ' + data.edges.length + ' edges  ' + data.regions.length + ' regions');
  console.log('      preset: ' + data.settings.presetName);
  console.log('      ' + data.settings.paramDefs.length + ' node param defs  ' + data.settings.edgeParamDefs.length + ' edge param defs');
  console.log('      ' + pvTotal + ' node param values  ' + epvTotal + ' edge param values');

  if (failures.length) {
    for (const f of failures) console.log('      [!] ' + f);
  } else {
    console.log('      all cross-references valid, all value slugs recognised');
  }
  console.log('');
}

console.log('Results: ' + totalPassed + '/' + files.length + ' passed' + (totalFailed ? '  (' + totalFailed + ' failed)' : ''));
process.exit(totalFailed ? 1 : 0);
