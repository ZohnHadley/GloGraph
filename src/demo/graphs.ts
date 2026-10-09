// Bundled demo projects for the web demo. The shipped `.glograph` files are
// imported as raw text and parsed, then used both as openable projects and as the
// preset library that "New Project" seeds from (each file carries a full settings
// snapshot for its preset).
import architectureRaw from '../../demos/software-architecture-demo.glograph?raw';
import agentRaw from '../../demos/agent-memory-demo.glograph?raw';
import macroRaw from '../../demos/macro-economics-demo.glograph?raw';
import systemRaw from '../../demos/system-behavior-demo.glograph?raw';
import knowledgeRaw from '../../demos/knowledge-map-demo.glograph?raw';
import projectRaw from '../../demos/project-tracker-demo.glograph?raw';

export const DEMOS: Record<string, any> = {
  'software-architecture': JSON.parse(architectureRaw),
  'agent-memory': JSON.parse(agentRaw),
  'macro-economics': JSON.parse(macroRaw),
  'system-behavior': JSON.parse(systemRaw),
  'knowledge-map': JSON.parse(knowledgeRaw),
  'project-tracker': JSON.parse(projectRaw),
};

export const DEMO_LABELS: Record<string, string> = {
  'software-architecture': 'Payments platform architecture',
  'agent-memory': "How a system's services connect",
  'macro-economics': '2022-2023 Global Macro Crisis',
  'system-behavior': 'Population & Resource Feedback Loops',
  'knowledge-map': 'Understanding Inflation',
  'project-tracker': 'GloGraph Launch Plan',
};

// Pseudo-paths used as the per-tab "save path" so opening from Recents works.
export const DEMO_BY_PATH: Record<string, any> = {
  'demo://software-architecture': DEMOS['software-architecture'],
  'demo://agent-memory': DEMOS['agent-memory'],
  'demo://macro-economics': DEMOS['macro-economics'],
  'demo://system-behavior': DEMOS['system-behavior'],
  'demo://knowledge-map': DEMOS['knowledge-map'],
  'demo://project-tracker': DEMOS['project-tracker'],
};

export const RECENTS = [
  { name: DEMO_LABELS['software-architecture'], path: 'demo://software-architecture' },
  { name: DEMO_LABELS['agent-memory'], path: 'demo://agent-memory' },
  { name: DEMO_LABELS['macro-economics'], path: 'demo://macro-economics' },
  { name: DEMO_LABELS['system-behavior'], path: 'demo://system-behavior' },
  { name: DEMO_LABELS['knowledge-map'], path: 'demo://knowledge-map' },
  { name: DEMO_LABELS['project-tracker'], path: 'demo://project-tracker' },
];

// New Project preset IDs (mirror NewProjectDialog) → the settings snapshot to seed.
const BLANK_SETTINGS = { presetName: 'Blank', paramDefs: [], edgeParamDefs: [] };
export const PRESET_LIBRARY: Record<string, any> = {
  '00000000-0000-0000-0000-000000000005': BLANK_SETTINGS,
  '00000000-0000-0000-0000-000000000001': DEMOS['macro-economics'].settings,
  '00000000-0000-0000-0000-000000000002': DEMOS['system-behavior'].settings,
  '00000000-0000-0000-0000-000000000003': DEMOS['knowledge-map'].settings,
  '00000000-0000-0000-0000-000000000004': DEMOS['project-tracker'].settings,
};
