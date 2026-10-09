import { useEffect, useRef, useState } from 'react';
import { Search, X, ChevronRight, ChevronDown, ChevronUp, BarChart2, FileText, Filter, List } from 'lucide-react';
import GlographMark from './GlographMark';
import { GloEdge, GloNode, GloRegion } from '../types';
import { useSettings } from '../context/SettingsContext';
import { isNodeInRegion } from '../lib/regionMembership';
import { nodeDisplayLabel } from '../lib/nodeDisplay';

interface SidebarProps {
  nodes: GloNode[];
  edges: GloEdge[];
  regions: GloRegion[];
  selectedNodeId?: string;
  selectedRegionId?: string;
  onSelectNode: (node: GloNode) => void;
  onSelectRegion: (region: GloRegion) => void;
  onHighlight?: (nodeIds: string[]) => void;
  onScrollToNode?: (node: GloNode) => void;
  searchFocusTrigger?: number;
  graphNotes: string;
  onNotesChange: (notes: string) => void;
}

export default function Sidebar({
  nodes,
  edges,
  regions,
  selectedNodeId,
  selectedRegionId,
  onSelectNode,
  onSelectRegion,
  onHighlight,
  onScrollToNode,
  searchFocusTrigger,
  graphNotes,
  onNotesChange,
}: SidebarProps) {
  const { activeParamDefs, activeEdgeParamDefs, getNodeColor } = useSettings();
  const [search, setSearch] = useState('');
  const [notesOpen, setNotesOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string | null>>({});
  const [activeEdgeFilters, setActiveEdgeFilters] = useState<Record<string, string | null>>({});
  const [collapsedRegions, setCollapsedRegions] = useState<Set<string>>(new Set());
  const [expandedParams, setExpandedParams] = useState<Set<string>>(new Set());
  const CHIP_LIMIT = 7;
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showHierarchy, setShowHierarchy] = useState(true);
  const [uncontainedCollapsed, setUncontainedCollapsed] = useState(false);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [navIndex, setNavIndex] = useState(0);
  const [sortMode, setSortMode] = useState<'default' | 'title' | 'date' | 'degree'>('default');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchFocusTrigger) searchRef.current?.focus();
  }, [searchFocusTrigger]);

  const allTags = Array.from(new Set(nodes.flatMap(n => n.tags ?? []))).sort();

  const filterableParams = activeParamDefs.filter(
    d => d.paramType === 'select' || d.paramType === 'select_color'
  );

  const filterableEdgeParams = activeEdgeParamDefs.filter(
    d => d.paramType === 'select' || d.paramType === 'select_color'
  );

  // Reset nav index when the filtered set changes
  useEffect(() => {
    setNavIndex(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, JSON.stringify(activeFilters), JSON.stringify(activeEdgeFilters)]);

  const hasAnyFilter = Object.values(activeFilters).some(v => v != null)
    || Object.values(activeEdgeFilters).some(v => v != null)
    || activeTagFilter != null;
  const isFiltering = !!(search || hasAnyFilter);

  const filteredNodes = nodes.filter(n => {
    const matchesSearch =
      !search ||
      nodeDisplayLabel(n).toLowerCase().includes(search.toLowerCase()) ||
      n.description?.toLowerCase().includes(search.toLowerCase()) ||
      edges.some(e =>
        (e.sourceId === n.id || e.targetId === n.id) &&
        e.paramValues.some(pv => {
          const def = activeEdgeParamDefs.find(d => d.id === pv.paramDefId);
          if (!def || !pv.value) return false;
          const opt = def.options.find(o => o.valueSlug === pv.value);
          return opt?.label.toLowerCase().includes(search.toLowerCase()) ?? false;
        })
      );

    const matchesFilters = filterableParams.every(param => {
      const slug = activeFilters[param.id];
      if (!slug) return true;
      return n.paramValues.find(pv => pv.paramDefId === param.id)?.value === slug;
    });

    const matchesEdgeFilters = filterableEdgeParams.every(param => {
      const slug = activeEdgeFilters[param.id];
      if (!slug) return true;
      return edges.some(e =>
        (e.sourceId === n.id || e.targetId === n.id) &&
        e.paramValues.find(pv => pv.paramDefId === param.id)?.value === slug
      );
    });

    const matchesTagFilter = !activeTagFilter || (n.tags ?? []).includes(activeTagFilter);

    return matchesSearch && matchesFilters && matchesEdgeFilters && matchesTagFilter;
  });

  // Notify parent of canvas highlight whenever filtered set changes
  useEffect(() => {
    if (!onHighlight) return;
    if (isFiltering) {
      onHighlight(filteredNodes.map(n => n.id));
    } else {
      onHighlight([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, JSON.stringify(activeFilters), JSON.stringify(activeEdgeFilters), activeTagFilter, nodes.length]);

  // ── Sort ──────────────────────────────────────────────────────────
  const edgeDegreeMap = new Map<string, number>();
  for (const e of edges) {
    edgeDegreeMap.set(e.sourceId, (edgeDegreeMap.get(e.sourceId) ?? 0) + 1);
    edgeDegreeMap.set(e.targetId, (edgeDegreeMap.get(e.targetId) ?? 0) + 1);
  }

  const SORT_OPTIONS: { key: typeof sortMode; label: string }[] = [
    { key: 'default', label: 'Default' },
    { key: 'title',   label: 'A–Z' },
    { key: 'date',    label: 'Date' },
    { key: 'degree',  label: '# Edges' },
  ];

  function toggleFilter(paramDefId: string, slug: string) {
    setActiveFilters(prev => ({
      ...prev,
      [paramDefId]: prev[paramDefId] === slug ? null : slug,
    }));
  }

  function toggleEdgeFilter(paramDefId: string, slug: string) {
    setActiveEdgeFilters(prev => ({
      ...prev,
      [paramDefId]: prev[paramDefId] === slug ? null : slug,
    }));
  }

  function toggleCollapse(regionId: string) {
    setCollapsedRegions(prev => {
      const next = new Set(prev);
      if (next.has(regionId)) next.delete(regionId); else next.add(regionId);
      return next;
    });
  }

  function navigatePrev(filtered: GloNode[]) {
    if (!filtered.length) return;
    const idx = (navIndex - 1 + filtered.length) % filtered.length;
    setNavIndex(idx);
    onScrollToNode?.(filtered[idx]);
  }

  function navigateNext(filtered: GloNode[]) {
    if (!filtered.length) return;
    const idx = (navIndex + 1) % filtered.length;
    setNavIndex(idx);
    onScrollToNode?.(filtered[idx]);
  }

  const sortedFilteredNodes = sortMode === 'default' ? filteredNodes : [...filteredNodes].sort((a, b) => {
    if (sortMode === 'title') return nodeDisplayLabel(a).localeCompare(nodeDisplayLabel(b));
    if (sortMode === 'date') {
      if (!a.eventDate && !b.eventDate) return 0;
      if (!a.eventDate) return 1;
      if (!b.eventDate) return -1;
      return a.eventDate.localeCompare(b.eventDate);
    }
    if (sortMode === 'degree') return (edgeDegreeMap.get(b.id) ?? 0) - (edgeDegreeMap.get(a.id) ?? 0);
    return 0;
  });

  // ── Hierarchy computation ──────────────────────────────────────────
  const nodesPerRegion = new Map<string, GloNode[]>(regions.map(r => [r.id, []]));
  const uncontainedNodes: GloNode[] = [];

  for (const node of sortedFilteredNodes) {
    const region = regions.find(r => isNodeInRegion(node, r));
    if (region) {
      nodesPerRegion.get(region.id)!.push(node);
    } else {
      uncontainedNodes.push(node);
    }
  }

  const visibleRegions = regions.filter(r => {
    const titleMatch = !search || r.title.toLowerCase().includes(search.toLowerCase());
    const hasChildren = (nodesPerRegion.get(r.id)?.length ?? 0) > 0;
    return titleMatch || hasChildren;
  });

  // ── Stats pre-computation ──────────────────────────────────────────
  const topNode = nodes.length
    ? nodes.reduce((a, b) => (edgeDegreeMap.get(b.id) ?? 0) > (edgeDegreeMap.get(a.id) ?? 0) ? b : a)
    : null;
  const avgEdges = nodes.length ? (edges.length * 2 / nodes.length).toFixed(1) : '—';

  const isEmpty = nodes.length === 0 && regions.length === 0;
  const noResults = !isEmpty && sortedFilteredNodes.length === 0 && visibleRegions.length === 0;

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <GlographMark size={16} />
        <span>GloGraph</span>
      </div>

      <div className="sidebar__search">
        <Search size={14} />
        <input
          ref={searchRef}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search…"
        />
        {search && (
          <button className="icon-btn" onClick={() => setSearch('')} title="Clear search"
            style={{ padding: '1px 2px', marginRight: -2 }}>
            <X size={11} />
          </button>
        )}
        {isFiltering && sortedFilteredNodes.length > 1 && (
          <>
            <button className="icon-btn sidebar__nav-btn" onClick={() => navigatePrev(sortedFilteredNodes)} title="Previous match">
              <ChevronUp size={11} />
            </button>
            <button className="icon-btn sidebar__nav-btn" onClick={() => navigateNext(sortedFilteredNodes)} title="Next match">
              <ChevronDown size={11} />
            </button>
          </>
        )}
      </div>

      {/* ── Filters (collapsible) ── */}
      {(filterableParams.length > 0 || filterableEdgeParams.length > 0 || allTags.length > 0) && (
        <div className="sidebar__stats-toggle" onClick={() => setShowFilters(s => !s)}>
          <Filter size={11} />
          <span>Filters</span>
          {hasAnyFilter && <span className="sidebar__filter-active-dot" />}
          {showFilters ? <ChevronDown size={10} style={{ marginLeft: 'auto' }} /> : <ChevronRight size={10} style={{ marginLeft: 'auto' }} />}
        </div>
      )}

      {showFilters && (
        <>
          {/* ── Node field filters ── */}
          {filterableParams.length > 0 && (
            <div className="sidebar__filters">
              {filterableParams.map(param => {
                const active = activeFilters[param.id] ?? null;
                return (
                  <div key={param.id} className="filter-group">
                    <div className="filter-group__label">{param.displayName}</div>
                    <div className="filter-group__chips">
                      <button
                        className={`filter-chip ${active === null ? 'filter-chip--active' : ''}`}
                        onClick={() => setActiveFilters(prev => ({ ...prev, [param.id]: null }))}
                      >
                        All
                      </button>
                      {(expandedParams.has(param.id) ? param.options : param.options.slice(0, CHIP_LIMIT)).map(opt => {
                        const isActive = active === opt.valueSlug;
                        return (
                          <button
                            key={opt.id}
                            className={`filter-chip ${isActive ? 'filter-chip--active' : ''}`}
                            style={isActive && opt.color
                              ? { background: opt.color + '33', borderColor: opt.color, color: opt.color }
                              : {}}
                            onClick={() => toggleFilter(param.id, opt.valueSlug)}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                      {param.options.length > CHIP_LIMIT && (
                        <button
                          className="filter-chip filter-chip--more"
                          onClick={() => setExpandedParams(prev => {
                            const next = new Set(prev);
                            if (next.has(param.id)) next.delete(param.id); else next.add(param.id);
                            return next;
                          })}
                        >
                          {expandedParams.has(param.id) ? 'Less' : `+${param.options.length - CHIP_LIMIT}`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Edge field filters ── */}
          {filterableEdgeParams.length > 0 && (
            <div className="sidebar__filters sidebar__filters--edge">
              {filterableEdgeParams.map(param => {
                const active = activeEdgeFilters[param.id] ?? null;
                return (
                  <div key={param.id} className="filter-group">
                    <div className="filter-group__label">
                      {param.displayName}
                      <span className="filter-group__edge-tag">edge</span>
                    </div>
                    <div className="filter-group__chips">
                      <button
                        className={`filter-chip ${active === null ? 'filter-chip--active' : ''}`}
                        onClick={() => setActiveEdgeFilters(prev => ({ ...prev, [param.id]: null }))}
                      >
                        All
                      </button>
                      {(expandedParams.has(param.id) ? param.options : param.options.slice(0, CHIP_LIMIT)).map(opt => {
                        const isActive = active === opt.valueSlug;
                        return (
                          <button
                            key={opt.id}
                            className={`filter-chip ${isActive ? 'filter-chip--active' : ''}`}
                            style={isActive && opt.color
                              ? { background: opt.color + '33', borderColor: opt.color, color: opt.color }
                              : {}}
                            onClick={() => toggleEdgeFilter(param.id, opt.valueSlug)}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                      {param.options.length > CHIP_LIMIT && (
                        <button
                          className="filter-chip filter-chip--more"
                          onClick={() => setExpandedParams(prev => {
                            const next = new Set(prev);
                            if (next.has(param.id)) next.delete(param.id); else next.add(param.id);
                            return next;
                          })}
                        >
                          {expandedParams.has(param.id) ? 'Less' : `+${param.options.length - CHIP_LIMIT}`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Tag filter chips ── */}
          {allTags.length > 0 && (
            <div className="sidebar__filters">
              <div className="filter-group">
                <div className="filter-group__label">Tags</div>
                <div className="filter-group__chips">
                  <button
                    className={`filter-chip${activeTagFilter === null ? ' filter-chip--active' : ''}`}
                    onClick={() => setActiveTagFilter(null)}
                  >All</button>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      className={`filter-chip${activeTagFilter === tag ? ' filter-chip--active' : ''}`}
                      onClick={() => setActiveTagFilter(prev => prev === tag ? null : tag)}
                    >{tag}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Stats panel ── */}
      <div className="sidebar__stats-toggle" onClick={() => setShowStats(s => !s)}>
        <BarChart2 size={11} />
        <span>Graph Stats</span>
        {showStats ? <ChevronDown size={10} style={{ marginLeft: 'auto' }} /> : <ChevronRight size={10} style={{ marginLeft: 'auto' }} />}
      </div>
      {showStats && (
        <div className="sidebar__stats">
          <div className="stats-row"><span className="stats-label">Nodes</span><span className="stats-val">{nodes.length}</span></div>
          <div className="stats-row"><span className="stats-label">Edges</span><span className="stats-val">{edges.length}</span></div>
          <div className="stats-row"><span className="stats-label">Regions</span><span className="stats-val">{regions.length}</span></div>
          <div className="stats-row"><span className="stats-label">Avg edges/node</span><span className="stats-val">{avgEdges}</span></div>
          {topNode && (
            <div className="stats-row">
              <span className="stats-label">Most connected</span>
              <span className="stats-val stats-val--name" title={nodeDisplayLabel(topNode)}>
                {nodeDisplayLabel(topNode)} ({edgeDegreeMap.get(topNode.id) ?? 0})
              </span>
            </div>
          )}

          {/* ── Per-param breakdowns (all select/select_color fields) ── */}
          {filterableParams.map(param => {
            const counts = param.options
              .map(opt => ({
                label: opt.label,
                color: opt.color ?? null,
                count: nodes.filter(n =>
                  n.paramValues.find(pv => pv.paramDefId === param.id)?.value === opt.valueSlug
                ).length,
              }))
              .filter(c => c.count > 0);
            if (!counts.length) return null;
            return (
              <div key={param.id}>
                <div className="stats-section-label">{param.displayName}</div>
                {counts.map(c => (
                  <div key={c.label} className="stats-row">
                    <span className="stats-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {c.color && <span className="stats-dot" style={{ background: c.color }} />}
                      {c.label}
                    </span>
                    <span className="stats-val">{c.count}</span>
                  </div>
                ))}
              </div>
            );
          })}

          {/* ── Edge field breakdowns ── */}
          {filterableEdgeParams.map(param => {
            const counts = param.options
              .map(opt => ({
                label: opt.label,
                color: opt.color ?? null,
                count: edges.filter(e =>
                  e.paramValues.find(pv => pv.paramDefId === param.id)?.value === opt.valueSlug
                ).length,
              }))
              .filter(c => c.count > 0);
            if (!counts.length) return null;
            return (
              <div key={param.id}>
                <div className="stats-section-label">{param.displayName} <span style={{ opacity: 0.5, fontSize: 9 }}>edges</span></div>
                {counts.map(c => (
                  <div key={c.label} className="stats-row">
                    <span className="stats-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {c.color && <span className="stats-dot" style={{ background: c.color }} />}
                      {c.label}
                    </span>
                    <span className="stats-val">{c.count}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Graph Notes ── */}
      <div className="sidebar__notes-toggle" onClick={() => setNotesOpen(o => !o)}>
        <FileText size={11} />
        <span>Graph Notes</span>
        {notesOpen ? <ChevronDown size={10} style={{ marginLeft: 'auto' }} /> : <ChevronRight size={10} style={{ marginLeft: 'auto' }} />}
      </div>
      {notesOpen && (
        <textarea
          className="sidebar__notes"
          value={graphNotes}
          onChange={e => onNotesChange(e.target.value)}
          placeholder="Notes about this graph…"
          rows={5}
        />
      )}

      {/* ── Nodes hierarchy (collapsible, open by default) ── */}
      <div className="sidebar__stats-toggle" onClick={() => setShowHierarchy(s => !s)}>
        <List size={11} />
        <span>Nodes</span>
        {showHierarchy ? <ChevronDown size={10} style={{ marginLeft: 'auto' }} /> : <ChevronRight size={10} style={{ marginLeft: 'auto' }} />}
      </div>

      {showHierarchy && (
        <>
          {nodes.length > 1 && (
            <div className="sidebar__sort">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  className={`sort-btn${sortMode === opt.key ? ' sort-btn--active' : ''}`}
                  onClick={() => setSortMode(opt.key)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <div className="sidebar__list">
            {isEmpty && (
              <p className="sidebar__empty">No nodes yet — add one to get started</p>
            )}
            {noResults && (
              <p className="sidebar__empty">No nodes match this filter</p>
            )}

            {/* ── Regions with their child nodes ── */}
            {visibleRegions.map(region => {
              const children = nodesPerRegion.get(region.id) ?? [];
              const isCollapsed = collapsedRegions.has(region.id) && !isFiltering;
              const showChildren = !isCollapsed && children.length > 0;

              return (
                <div key={region.id} className="hierarchy-group">
                  <div className={`hierarchy-row${selectedRegionId === region.id ? ' hierarchy-row--active' : ''}`}>
                    <button
                      className="hierarchy-toggle"
                      onClick={() => toggleCollapse(region.id)}
                      disabled={children.length === 0}
                      title={isCollapsed ? 'Expand' : 'Collapse'}
                    >
                      {children.length > 0 && (
                        isCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />
                      )}
                    </button>
                    <button className="hierarchy-label" onClick={() => onSelectRegion(region)}>
                      <span
                        className="node-list-item__dot node-list-item__dot--region"
                        style={{ background: region.color ?? '#484848' }}
                      />
                      <span className="node-list-item__title">{region.title || 'Region'}</span>
                      {isCollapsed && children.length > 0 && (
                        <span className="hierarchy-count">{children.length}</span>
                      )}
                    </button>
                  </div>

                  {showChildren && (
                    <div className="hierarchy-children">
                      {children.map(node => (
                        <button
                          key={node.id}
                          className={`node-list-item hierarchy-child${selectedNodeId === node.id ? ' node-list-item--active' : ''}`}
                          onClick={() => onSelectNode(node)}
                        >
                          <span className="node-list-item__dot" style={{ background: getNodeColor(node) }} />
                          <span className="node-list-item__title">{nodeDisplayLabel(node)}</span>
                          {node.eventDate && (
                            <span className="node-list-item__date">{node.eventDate}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* ── Nodes not inside any region ── */}
            {uncontainedNodes.length > 0 && visibleRegions.length > 0 && (
              <div className="hierarchy-row hierarchy-row--uncontained" onClick={() => setUncontainedCollapsed(c => !c)}>
                <button className="hierarchy-toggle" tabIndex={-1}>
                  {uncontainedCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                </button>
                <span className="hierarchy-label-plain">
                  <span className="node-list-item__title">Other Nodes</span>
                  {uncontainedCollapsed && <span className="hierarchy-count">{uncontainedNodes.length}</span>}
                </span>
              </div>
            )}
            {!uncontainedCollapsed && uncontainedNodes.map(node => (
              <button
                key={node.id}
                className={`node-list-item${visibleRegions.length > 0 ? ' hierarchy-child' : ''}${selectedNodeId === node.id ? ' node-list-item--active' : ''}`}
                onClick={() => onSelectNode(node)}
              >
                <span className="node-list-item__dot" style={{ background: getNodeColor(node) }} />
                <span className="node-list-item__title">{nodeDisplayLabel(node)}</span>
                {node.eventDate && (
                  <span className="node-list-item__date">{node.eventDate}</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="sidebar__count">
        {isFiltering
          ? `${sortedFilteredNodes.length} / ${nodes.length} nodes · ${visibleRegions.length} / ${regions.length} regions`
          : `${nodes.length} nodes · ${regions.length} regions`
        }
      </div>
    </aside>
  );
}
