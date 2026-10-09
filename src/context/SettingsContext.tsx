import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { EdgeParamDef, EdgeRoutingMode, GloEdge, GloNode, GraphSettings, NodeParamDef, NodeParamOption } from '../types';

interface SettingsContextValue {
  settings: GraphSettings | null;
  refreshSettings: () => Promise<void>;
  activeParamDefs: NodeParamDef[];
  activeEdgeParamDefs: EdgeParamDef[];
  colorDriverParam: NodeParamDef | null;
  edgeRoutingMode: EdgeRoutingMode;
  setEdgeRoutingMode: (mode: EdgeRoutingMode) => Promise<void>;
  snapToGrid: boolean;
  setSnapToGrid: (v: boolean) => Promise<void>;
  expandNodesByDefault: boolean;
  setExpandNodesByDefault: (v: boolean) => Promise<void>;
  apiEnabled: boolean;
  setApiEnabled: (v: boolean) => Promise<void>;
  getNodeColor: (node: GloNode) => string;
  getNodeBadge: (node: GloNode) => { label: string; color: string } | null;
  getParamOption: (paramDefId: string, valueSlug?: string | null) => NodeParamOption | null;
  getEdgeColor: (edge: GloEdge | undefined) => string;
  getEdgeStyle: (edge: GloEdge | undefined) => string;
  getEdgeWidth: (edge: GloEdge | undefined) => number;
  getEdgeArrow: (edge: GloEdge | undefined) => boolean;
  getEdgeLabel: (edge: GloEdge | undefined) => string | null;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const FALLBACK_NODE_COLOR = '#545454';
const FALLBACK_EDGE_COLOR = '#ffffff';

export function SettingsProvider({ children, seed }: { children: React.ReactNode; seed?: GraphSettings }) {
  const [settings, setSettings] = useState<GraphSettings | null>(seed ?? null);
  const [edgeRoutingMode, setEdgeRoutingModeState] = useState<EdgeRoutingMode>('waypoints');
  const [snapToGrid, setSnapToGridState] = useState<boolean>(false);
  // Default ON: node cards render expanded unless the user turns this off.
  const [expandNodesByDefault, setExpandNodesByDefaultState] = useState<boolean>(true);
  const [apiEnabled, setApiEnabledState] = useState<boolean>(false);

  const refreshSettings = useCallback(async () => {
    // Spectate mode: render from the host's settings (seeded), no local fetch.
    if (seed !== undefined) { setSettings(seed); return; }
    try {
      const [s, mode, snap, apiEn, exp] = await Promise.all([
        api.getGraphSettings(),
        api.getAppSetting('edge_routing_mode'),
        api.getAppSetting('snap_to_grid'),
        api.getAppSetting('api_enabled'),
        api.getAppSetting('expand_nodes_default'),
      ]);
      setSettings(s);
      if (mode === 'bezier' || mode === 'waypoints' || mode === 'orthogonal') {
        setEdgeRoutingModeState(mode);
      }
      setSnapToGridState(snap === 'true');
      // Absent (older installs) → default ON; only an explicit "false" turns it off.
      setExpandNodesByDefaultState(exp !== 'false');
      setApiEnabledState(apiEn === 'true');
    } catch (err) {
      console.error('Failed to load graph settings', err);
    }
  }, [seed]);

  const setEdgeRoutingMode = useCallback(async (mode: EdgeRoutingMode) => {
    setEdgeRoutingModeState(mode);
    await api.setAppSetting('edge_routing_mode', mode);
  }, []);

  const setSnapToGrid = useCallback(async (v: boolean) => {
    setSnapToGridState(v);
    await api.setAppSetting('snap_to_grid', String(v));
  }, []);

  const setExpandNodesByDefault = useCallback(async (v: boolean) => {
    setExpandNodesByDefaultState(v);
    await api.setAppSetting('expand_nodes_default', String(v));
  }, []);

  const setApiEnabled = useCallback(async (v: boolean) => {
    setApiEnabledState(v);
    await api.setAppSetting('api_enabled', String(v));
  }, []);

  useEffect(() => { refreshSettings(); }, [refreshSettings]);

  const activeParamDefs = settings?.paramDefs ?? [];
  const activeEdgeParamDefs = settings?.edgeParamDefs ?? [];
  const colorDriverParam = activeParamDefs.find(d => d.drivesColor) ?? null;

  const getParamOption = useCallback((paramDefId: string, valueSlug?: string | null) => {
    if (!valueSlug) return null;
    const def = activeParamDefs.find(d => d.id === paramDefId);
    return def?.options.find(o => o.valueSlug === valueSlug) ?? null;
  }, [activeParamDefs]);

  const getNodeColor = useCallback((node: GloNode): string => {
    if (node.color) return node.color;
    if (!colorDriverParam) return FALLBACK_NODE_COLOR;
    const pv = node.paramValues.find(p => p.paramDefId === colorDriverParam.id);
    if (!pv?.value) return FALLBACK_NODE_COLOR;
    return colorDriverParam.options.find(o => o.valueSlug === pv.value)?.color ?? FALLBACK_NODE_COLOR;
  }, [colorDriverParam]);

  const getNodeBadge = useCallback((node: GloNode): { label: string; color: string } | null => {
    if (!colorDriverParam) return null;
    const pv = node.paramValues.find(p => p.paramDefId === colorDriverParam.id);
    if (!pv?.value) return null;
    const opt = colorDriverParam.options.find(o => o.valueSlug === pv.value);
    if (!opt) return null;
    return { label: opt.label, color: opt.color ?? FALLBACK_NODE_COLOR };
  }, [colorDriverParam]);

  // Edge stroke colour is the manual per-edge override only; with none selected,
  // edges default to white. (The colour-driving param still supplies the midpoint
  // relationship label via getEdgeLabel — it just no longer drives the stroke.)
  const getEdgeColor = useCallback((edge: GloEdge | undefined): string => {
    if (!edge) return FALLBACK_EDGE_COLOR;
    return edge.color || FALLBACK_EDGE_COLOR;
  }, []);

  const getEdgeStyle = useCallback((edge: GloEdge | undefined): string => {
    if (!edge) return 'default';
    const styleParam = activeEdgeParamDefs.find(d => d.drivesStyle);
    if (!styleParam) return 'default';
    const pv = edge.paramValues.find(p => p.paramDefId === styleParam.id && p.isEnabled);
    return pv?.value ?? 'default';
  }, [activeEdgeParamDefs]);

  const getEdgeWidth = useCallback((edge: GloEdge | undefined): number => {
    if (!edge) return 5;
    const widthParam = activeEdgeParamDefs.find(d => d.drivesWidth);
    if (!widthParam) return 5;
    const pv = edge.paramValues.find(p => p.paramDefId === widthParam.id && p.isEnabled);
    return pv?.value ? Number(pv.value) : 5;
  }, [activeEdgeParamDefs]);

  const getEdgeArrow = useCallback((edge: GloEdge | undefined): boolean => {
    if (!edge) return true;
    const arrowParam = activeEdgeParamDefs.find(d => d.drivesArrow);
    if (!arrowParam) return true;
    const pv = edge.paramValues.find(p => p.paramDefId === arrowParam.id && p.isEnabled);
    if (!pv) return true;
    return pv.value === 'true';
  }, [activeEdgeParamDefs]);

  const getEdgeLabel = useCallback((edge: GloEdge | undefined): string | null => {
    if (!edge) return null;
    const colorParam = activeEdgeParamDefs.find(d => d.drivesColor);
    if (!colorParam) return null;
    const pv = edge.paramValues.find(p => p.paramDefId === colorParam.id && p.isEnabled);
    if (!pv?.value) return null;
    return colorParam.options.find(o => o.valueSlug === pv.value)?.label ?? null;
  }, [activeEdgeParamDefs]);

  return (
    <SettingsContext.Provider value={{
      settings,
      refreshSettings,
      activeParamDefs,
      activeEdgeParamDefs,
      colorDriverParam,
      edgeRoutingMode,
      setEdgeRoutingMode,
      snapToGrid,
      setSnapToGrid,
      expandNodesByDefault,
      setExpandNodesByDefault,
      apiEnabled,
      setApiEnabled,
      getNodeColor,
      getNodeBadge,
      getParamOption,
      getEdgeColor,
      getEdgeStyle,
      getEdgeWidth,
      getEdgeArrow,
      getEdgeLabel,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
