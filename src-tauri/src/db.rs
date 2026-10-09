use rusqlite::{Connection, Result, params};

// ── Preset IDs ────────────────────────────────────────────────────────────────
const MACRO_PRESET_ID:  &str = "00000000-0000-0000-0000-000000000001";
const SB_PRESET_ID:     &str = "00000000-0000-0000-0000-000000000002"; // System Behavior
const KM_PRESET_ID:     &str = "00000000-0000-0000-0000-000000000003"; // Knowledge Map
const PR_PRESET_ID:     &str = "00000000-0000-0000-0000-000000000004"; // Project
const BLANK_PRESET_ID:  &str = "00000000-0000-0000-0000-000000000005"; // Blank

// ── Macro Economics — node param def IDs ─────────────────────────────────────
const PARAM_CAT_ID:    &str = "00000000-0000-0004-0000-000000000001";
const PARAM_STATUS_ID: &str = "00000000-0000-0004-0000-000000000002";

// ── Macro Economics — edge param def IDs ─────────────────────────────────────
const EDGE_PARAM_RELATIONSHIP: &str = "00000000-0000-0006-0001-000000000001";
const EDGE_PARAM_DIRECTED:     &str = "00000000-0000-0006-0001-000000000002";
const EDGE_PARAM_LINE_STYLE:   &str = "00000000-0000-0006-0001-000000000003";
const EDGE_PARAM_STRENGTH:     &str = "00000000-0000-0006-0001-000000000004";
const EDGE_PARAM_NOTES:        &str = "00000000-0000-0006-0001-000000000005";
const EDGE_PARAM_CORRELATION:  &str = "00000000-0000-0006-0001-000000000006";
const EDGE_PARAM_TIME_LAG:     &str = "00000000-0000-0006-0001-000000000007";
const EDGE_PARAM_CONFIDENCE:   &str = "00000000-0000-0006-0001-000000000008";

// ── System Behavior — node param def IDs ─────────────────────────────────────
const SB_NODE_COMPONENT: &str = "00000000-0000-0004-0002-000000000001";
const SB_NODE_STATUS:    &str = "00000000-0000-0004-0002-000000000002";

// ── System Behavior — edge param def IDs ─────────────────────────────────────
const SB_EDGE_INFLUENCE:   &str = "00000000-0000-0006-0002-000000000001";
const SB_EDGE_DIRECTED:    &str = "00000000-0000-0006-0002-000000000002";
const SB_EDGE_LINE_STYLE:  &str = "00000000-0000-0006-0002-000000000003";
const SB_EDGE_STRENGTH:    &str = "00000000-0000-0006-0002-000000000004";
const SB_EDGE_NOTES:       &str = "00000000-0000-0006-0002-000000000005";

// ── Knowledge Map — node param def IDs ───────────────────────────────────────
const KM_NODE_TYPE:       &str = "00000000-0000-0004-0003-000000000001";
const KM_NODE_CONFIDENCE: &str = "00000000-0000-0004-0003-000000000002";

// ── Knowledge Map — edge param def IDs ───────────────────────────────────────
const KM_EDGE_RELATION: &str = "00000000-0000-0006-0003-000000000001";
const KM_EDGE_DIRECTED: &str = "00000000-0000-0006-0003-000000000002";
const KM_EDGE_WEIGHT:   &str = "00000000-0000-0006-0003-000000000003";
const KM_EDGE_NOTES:    &str = "00000000-0000-0006-0003-000000000004";

// ── Project — node param def IDs ─────────────────────────────────────────────
const PR_NODE_STATUS:   &str = "00000000-0000-0004-0004-000000000001";
const PR_NODE_PRIORITY: &str = "00000000-0000-0004-0004-000000000002";

// ── Project — edge param def IDs ─────────────────────────────────────────────
const PR_EDGE_TYPE:     &str = "00000000-0000-0006-0004-000000000001";
const PR_EDGE_DIRECTED: &str = "00000000-0000-0006-0004-000000000002";
const PR_EDGE_NOTES:    &str = "00000000-0000-0006-0004-000000000003";

// ── Macro Economics — new param def IDs ──────────────────────────────────────
const PARAM_REGION_ID: &str = "00000000-0000-0004-0001-000000000003";

// ── System Behavior — new param def IDs ──────────────────────────────────────
const SB_EDGE_LOOP_TYPE: &str = "00000000-0000-0006-0002-000000000006";
const SB_EDGE_DELAY:     &str = "00000000-0000-0006-0002-000000000007";

// ── Knowledge Map — new param def IDs ────────────────────────────────────────
const KM_NODE_SOURCE: &str = "00000000-0000-0004-0003-000000000003";

// ── Project — new param def IDs ──────────────────────────────────────────────
const PR_NODE_TYPE:     &str = "00000000-0000-0004-0004-000000000003";
const PR_NODE_ESTIMATE: &str = "00000000-0000-0004-0004-000000000004";

/// True if `table` has a column named `column`. Used to keep legacy data
/// migrations working on pre-existing DBs without breaking brand-new DBs
/// (where the legacy column was never created).
fn column_exists(conn: &Connection, table: &str, column: &str) -> bool {
    conn.prepare(&format!("SELECT 1 FROM pragma_table_info('{}') WHERE name = ?1", table))
        .and_then(|mut stmt| stmt.query_row(params![column], |_| Ok(())))
        .is_ok()
}

pub fn init_db(conn: &Connection) -> Result<()> {
    conn.execute_batch(
        "PRAGMA journal_mode=WAL;
         PRAGMA foreign_keys=ON;

         CREATE TABLE IF NOT EXISTS nodes (
             id               TEXT PRIMARY KEY,
             title            TEXT NOT NULL,
             description      TEXT,
             event_date       TEXT,
             date_added       TEXT NOT NULL,
             x                REAL NOT NULL DEFAULT 0,
             y                REAL NOT NULL DEFAULT 0,
             color            TEXT,
             confidence       INTEGER,
             impact_magnitude INTEGER,
             external_id      TEXT,
             tags             TEXT NOT NULL DEFAULT '[]',
             data_source      TEXT,
             is_pinned        INTEGER NOT NULL DEFAULT 0,
             is_expand_pinned INTEGER NOT NULL DEFAULT 0,
             z_order          INTEGER NOT NULL DEFAULT 0,
             kind             TEXT NOT NULL DEFAULT 'standard',
             width            REAL,
             height           REAL,
             render_markdown  INTEGER NOT NULL DEFAULT 1,
             show_thumbnail   INTEGER NOT NULL DEFAULT 1
         );

         CREATE TABLE IF NOT EXISTS node_links (
             id      TEXT PRIMARY KEY,
             node_id TEXT NOT NULL,
             url     TEXT NOT NULL,
             label   TEXT,
             FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
         );

         -- Cached embedding vector per node for semantic search (POST /api/search/semantic).
         -- src_hash detects when title/description changed so we re-embed lazily.
         CREATE TABLE IF NOT EXISTS node_embeddings (
             node_id  TEXT PRIMARY KEY,
             model    TEXT NOT NULL,
             src_hash TEXT NOT NULL,
             dim      INTEGER NOT NULL,
             vec      BLOB NOT NULL,
             FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
         );

         CREATE TABLE IF NOT EXISTS edges (
             id            TEXT PRIMARY KEY,
             source_id     TEXT NOT NULL,
             target_id     TEXT NOT NULL,
             label         TEXT,
             source_handle TEXT,
             target_handle TEXT,
             waypoints     TEXT,
             external_id   TEXT,
             color         TEXT,
             created_at    TEXT NOT NULL,
             FOREIGN KEY (source_id) REFERENCES nodes(id) ON DELETE CASCADE,
             FOREIGN KEY (target_id) REFERENCES nodes(id) ON DELETE CASCADE
         );

         CREATE TABLE IF NOT EXISTS presets (
             id         TEXT PRIMARY KEY,
             name       TEXT NOT NULL,
             is_builtin INTEGER NOT NULL DEFAULT 0,
             created_at TEXT NOT NULL
         );

         CREATE TABLE IF NOT EXISTS app_settings (
             key   TEXT PRIMARY KEY,
             value TEXT NOT NULL
         );

         CREATE TABLE IF NOT EXISTS node_param_defs (
             id                   TEXT PRIMARY KEY,
             preset_id            TEXT NOT NULL,
             display_name         TEXT NOT NULL,
             param_type           TEXT NOT NULL DEFAULT 'text',
             default_value        TEXT,
             drives_color         INTEGER NOT NULL DEFAULT 0,
             show_on_card_default INTEGER NOT NULL DEFAULT 0,
             sort_order           INTEGER NOT NULL DEFAULT 0,
             FOREIGN KEY (preset_id) REFERENCES presets(id) ON DELETE CASCADE
         );

         CREATE TABLE IF NOT EXISTS node_param_options (
             id           TEXT PRIMARY KEY,
             param_def_id TEXT NOT NULL,
             value_slug   TEXT NOT NULL,
             label        TEXT NOT NULL,
             color        TEXT,
             sort_order   INTEGER NOT NULL DEFAULT 0,
             FOREIGN KEY (param_def_id) REFERENCES node_param_defs(id) ON DELETE CASCADE
         );

         CREATE TABLE IF NOT EXISTS node_param_values (
             id           TEXT PRIMARY KEY,
             node_id      TEXT NOT NULL,
             param_def_id TEXT NOT NULL,
             value        TEXT,
             is_enabled   INTEGER NOT NULL DEFAULT 1,
             show_on_card INTEGER NOT NULL DEFAULT 0,
             FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE,
             FOREIGN KEY (param_def_id) REFERENCES node_param_defs(id) ON DELETE CASCADE,
             UNIQUE(node_id, param_def_id)
         );

         CREATE TABLE IF NOT EXISTS edge_param_defs (
             id             TEXT PRIMARY KEY,
             preset_id      TEXT NOT NULL,
             display_name   TEXT NOT NULL,
             param_type     TEXT NOT NULL DEFAULT 'text',
             default_value  TEXT,
             drives_arrow   INTEGER NOT NULL DEFAULT 0,
             drives_style   INTEGER NOT NULL DEFAULT 0,
             drives_color   INTEGER NOT NULL DEFAULT 0,
             drives_width   INTEGER NOT NULL DEFAULT 0,
             sort_order     INTEGER NOT NULL DEFAULT 0,
             FOREIGN KEY (preset_id) REFERENCES presets(id) ON DELETE CASCADE
         );

         CREATE TABLE IF NOT EXISTS edge_param_options (
             id           TEXT PRIMARY KEY,
             param_def_id TEXT NOT NULL,
             value_slug   TEXT NOT NULL,
             label        TEXT NOT NULL,
             color        TEXT,
             sort_order   INTEGER NOT NULL DEFAULT 0,
             FOREIGN KEY (param_def_id) REFERENCES edge_param_defs(id) ON DELETE CASCADE
         );

         CREATE TABLE IF NOT EXISTS edge_param_values (
             id           TEXT PRIMARY KEY,
             edge_id      TEXT NOT NULL,
             param_def_id TEXT NOT NULL,
             value        TEXT,
             is_enabled   INTEGER NOT NULL DEFAULT 1,
             FOREIGN KEY (edge_id) REFERENCES edges(id) ON DELETE CASCADE,
             FOREIGN KEY (param_def_id) REFERENCES edge_param_defs(id) ON DELETE CASCADE,
             UNIQUE(edge_id, param_def_id)
         );

         CREATE TABLE IF NOT EXISTS regions (
             id         TEXT PRIMARY KEY,
             title      TEXT NOT NULL DEFAULT 'Region',
             x          REAL NOT NULL DEFAULT 0,
             y          REAL NOT NULL DEFAULT 0,
             width      REAL NOT NULL DEFAULT 400,
             height     REAL NOT NULL DEFAULT 300,
             color        TEXT,
             z_order      INTEGER NOT NULL DEFAULT 0,
             is_locked    INTEGER NOT NULL DEFAULT 0,
             is_minimized INTEGER NOT NULL DEFAULT 0,
             created_at   TEXT NOT NULL
         );

         CREATE TABLE IF NOT EXISTS node_media (
             id           TEXT PRIMARY KEY,
             node_id      TEXT NOT NULL,
             label        TEXT NOT NULL DEFAULT '',
             src          TEXT NOT NULL,
             src_type     TEXT NOT NULL DEFAULT 'file',
             media_type   TEXT NOT NULL DEFAULT 'image',
             sort_order   INTEGER NOT NULL DEFAULT 0,
             show_on_card INTEGER NOT NULL DEFAULT 1,
             FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
         );
        ",
    )?;

    // Idempotent column migrations — run after CREATE TABLE so they work on both
    // existing DBs (column already added, ALTER fails silently) and brand-new DBs
    // (table now exists, ALTER succeeds and adds the column).
    let _ = conn.execute("ALTER TABLE edges ADD COLUMN source_handle TEXT", []);
    let _ = conn.execute("ALTER TABLE edges ADD COLUMN target_handle TEXT", []);
    let _ = conn.execute("ALTER TABLE edges ADD COLUMN waypoints TEXT", []);
    let _ = conn.execute("ALTER TABLE edges ADD COLUMN label TEXT", []);
    let _ = conn.execute("ALTER TABLE edges ADD COLUMN color TEXT", []);
    let _ = conn.execute("ALTER TABLE regions ADD COLUMN z_order INTEGER NOT NULL DEFAULT 0", []);
    let _ = conn.execute("ALTER TABLE regions ADD COLUMN is_locked INTEGER NOT NULL DEFAULT 0", []);
    let _ = conn.execute("ALTER TABLE regions ADD COLUMN is_minimized INTEGER NOT NULL DEFAULT 0", []);
    let _ = conn.execute("ALTER TABLE nodes ADD COLUMN is_pinned INTEGER NOT NULL DEFAULT 0", []);
    let _ = conn.execute("ALTER TABLE nodes ADD COLUMN is_expand_pinned INTEGER NOT NULL DEFAULT 0", []);
    let _ = conn.execute("ALTER TABLE nodes ADD COLUMN z_order INTEGER NOT NULL DEFAULT 0", []);
    // Graph-item variant discriminator: standard | note | image | video | audio.
    // See specs/GRAPH_ITEMS_DESIGN.md. Legacy rows default to 'standard'.
    let _ = conn.execute("ALTER TABLE nodes ADD COLUMN kind TEXT NOT NULL DEFAULT 'standard'", []);
    // Optional per-node canvas size (resizable image/video/note items). NULL =
    // use the default size for the node's kind.
    let _ = conn.execute("ALTER TABLE nodes ADD COLUMN width REAL", []);
    let _ = conn.execute("ALTER TABLE nodes ADD COLUMN height REAL", []);
    // Note bodies render as markdown by default; per-note toggle (1 = styled).
    let _ = conn.execute("ALTER TABLE nodes ADD COLUMN render_markdown INTEGER NOT NULL DEFAULT 1", []);
    // File nodes show a preview thumbnail by default; per-file toggle (1 = thumbnail).
    let _ = conn.execute("ALTER TABLE nodes ADD COLUMN show_thumbnail INTEGER NOT NULL DEFAULT 1", []);
    let _ = conn.execute("ALTER TABLE nodes ADD COLUMN confidence INTEGER", []);
    let _ = conn.execute("ALTER TABLE nodes ADD COLUMN impact_magnitude INTEGER", []);
    let _ = conn.execute(
        "ALTER TABLE node_param_defs ADD COLUMN drives_color INTEGER NOT NULL DEFAULT 0",
        [],
    );
    let _ = conn.execute(
        "ALTER TABLE node_param_values ADD COLUMN show_on_card INTEGER NOT NULL DEFAULT 0",
        [],
    );
    let _ = conn.execute(
        "ALTER TABLE node_param_defs ADD COLUMN show_on_card_default INTEGER NOT NULL DEFAULT 0",
        [],
    );
    let _ = conn.execute(
        "ALTER TABLE node_media ADD COLUMN show_on_card INTEGER NOT NULL DEFAULT 1",
        [],
    );
    // API schema extensions
    let _ = conn.execute("ALTER TABLE nodes ADD COLUMN external_id TEXT", []);
    let _ = conn.execute("ALTER TABLE nodes ADD COLUMN tags TEXT NOT NULL DEFAULT '[]'", []);
    let _ = conn.execute("ALTER TABLE nodes ADD COLUMN data_source TEXT", []);
    let _ = conn.execute("ALTER TABLE edges ADD COLUMN external_id TEXT", []);

    // Drop the vestigial nodes.created_at column — it was a write-only duplicate of
    // date_added (never read). rusqlite bundles SQLite ≥3.35, so DROP COLUMN works on
    // every DB the app opens; column_exists makes this one-time and a no-op on new DBs
    // (which no longer create the column).
    if column_exists(conn, "nodes", "created_at") {
        conn.execute("ALTER TABLE nodes DROP COLUMN created_at", [])?;
    }

    // Partial unique indexes for nullable external_id columns — must run after
    // ALTER TABLE so external_id exists on every DB (new and existing).
    let _ = conn.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_nodes_external_id \
         ON nodes(external_id) WHERE external_id IS NOT NULL",
        [],
    );
    let _ = conn.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_edges_external_id \
         ON edges(external_id) WHERE external_id IS NOT NULL",
        [],
    );

    seed_macro_preset(conn)?;
    seed_system_behavior_preset(conn)?;
    seed_knowledge_map_preset(conn)?;
    seed_project_preset(conn)?;
    seed_blank_preset(conn)?;
    migrate_legacy_node_columns(conn)?;
    migrate_show_on_card_defaults(conn)?;
    migrate_edge_label(conn)?;
    Ok(())
}

/// One-time migration: older schemas stored the edge label in the `notes`
/// column. The label now lives in its own `label` column; copy any legacy
/// `notes` values over once. No-op on new DBs (the `notes` column is gone).
fn migrate_edge_label(conn: &Connection) -> Result<()> {
    let already_done: bool = conn
        .query_row(
            "SELECT value FROM app_settings WHERE key = 'migration_edge_label_v1'",
            [],
            |row| row.get::<_, String>(0),
        )
        .map(|v| v == "done")
        .unwrap_or(false);

    if already_done {
        return Ok(());
    }

    if column_exists(conn, "edges", "notes") {
        let _ = conn.execute(
            "UPDATE edges SET label = notes WHERE (label IS NULL OR label = '') AND notes IS NOT NULL",
            [],
        );
    }

    conn.execute(
        "INSERT OR REPLACE INTO app_settings (key, value) \
         VALUES ('migration_edge_label_v1', 'done')",
        [],
    )?;

    Ok(())
}

fn seed_macro_preset(conn: &Connection) -> Result<()> {
    conn.execute(
        "INSERT OR IGNORE INTO presets (id, name, is_builtin, created_at)
         VALUES (?1, 'Macro Economics', 1, '2024-01-01T00:00:00Z')",
        params![MACRO_PRESET_ID],
    )?;
    conn.execute(
        "INSERT OR IGNORE INTO app_settings (key, value) VALUES ('active_preset_id', ?1)",
        params![MACRO_PRESET_ID],
    )?;
    conn.execute(
        "INSERT OR IGNORE INTO app_settings (key, value) VALUES ('edge_routing_mode', 'waypoints')",
        [],
    )?;
    conn.execute(
        "INSERT OR IGNORE INTO app_settings (key, value) VALUES ('api_enabled', 'false')",
        [],
    )?;
    conn.execute(
        "INSERT OR IGNORE INTO app_settings (key, value) VALUES ('api_port', '57321')",
        [],
    )?;
    conn.execute(
        "INSERT OR IGNORE INTO app_settings (key, value) VALUES ('api_token', '')",
        [],
    )?;

    // ── Node: Domain param def (was "Category") ───────────────────────────────
    conn.execute(
        "INSERT OR IGNORE INTO node_param_defs
         (id, preset_id, display_name, param_type, drives_color, default_value, sort_order)
         VALUES (?1, ?2, 'Domain', 'select_color', 1, NULL, 0)",
        params![PARAM_CAT_ID, MACRO_PRESET_ID],
    )?;
    conn.execute(
        "UPDATE node_param_defs SET display_name = 'Domain' WHERE id = ?1",
        params![PARAM_CAT_ID],
    )?;

    let cat_options: &[(&str, &str, &str, &str, i64)] = &[
        ("00000000-0000-0005-0001-000000000001", "political", "Political", "#388bfd", 0),
        ("00000000-0000-0005-0001-000000000002", "economic",  "Economic",  "#3fb950", 1),
        ("00000000-0000-0005-0001-000000000003", "natural",   "Natural",   "#d29922", 2),
        ("00000000-0000-0005-0001-000000000004", "market",    "Financial", "#bc8cff", 3),
        ("00000000-0000-0005-0001-000000000005", "energy",    "Energy",    "#f78166", 4),
        ("00000000-0000-0005-0001-000000000006", "social",    "Social",    "#f778ba", 5),
        ("00000000-0000-0005-0001-000000000008", "policy",    "Policy",    "#e8c86e", 6),
        ("00000000-0000-0005-0001-000000000007", "other",     "Other",     "#8b949e", 7),
    ];
    for (id, slug, label, color, order) in cat_options {
        conn.execute(
            "INSERT OR IGNORE INTO node_param_options
             (id, param_def_id, value_slug, label, color, sort_order)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![id, PARAM_CAT_ID, slug, label, color, order],
        )?;
    }
    // Update changed labels/colors for existing rows
    conn.execute("UPDATE node_param_options SET label = 'Financial' WHERE id = '00000000-0000-0005-0001-000000000004'", [])?;
    conn.execute("UPDATE node_param_options SET sort_order = 7 WHERE id = '00000000-0000-0005-0001-000000000007'", [])?;

    // ── Node: Status param def ────────────────────────────────────────────────
    conn.execute(
        "INSERT OR IGNORE INTO node_param_defs
         (id, preset_id, display_name, param_type, drives_color, default_value, sort_order)
         VALUES (?1, ?2, 'Status', 'select_color', 0, NULL, 1)",
        params![PARAM_STATUS_ID, MACRO_PRESET_ID],
    )?;

    let status_options: &[(&str, &str, &str, &str, i64)] = &[
        ("00000000-0000-0005-0002-000000000001", "confirmed",   "Confirmed",   "#3d9e5f", 0),
        ("00000000-0000-0005-0002-000000000002", "expected",    "Expected",    "#d68b2a", 1),
        ("00000000-0000-0005-0002-000000000003", "speculative", "Speculative", "#888888", 2),
        ("00000000-0000-0005-0002-000000000004", "rejected",    "Rejected",    "#c83030", 3),
    ];
    for (id, slug, label, color, order) in status_options {
        conn.execute(
            "INSERT OR IGNORE INTO node_param_options
             (id, param_def_id, value_slug, label, color, sort_order)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![id, PARAM_STATUS_ID, slug, label, color, order],
        )?;
    }

    // ── Node: Region param def ────────────────────────────────────────────────
    conn.execute(
        "INSERT OR IGNORE INTO node_param_defs
         (id, preset_id, display_name, param_type, drives_color, default_value, sort_order)
         VALUES (?1, ?2, 'Region', 'select_color', 0, NULL, 2)",
        params![PARAM_REGION_ID, MACRO_PRESET_ID],
    )?;
    let region_opts: &[(&str, &str, &str, &str, i64)] = &[
        ("00000000-0000-0005-0003-000000000001", "global",    "Global",           "#888888", 0),
        ("00000000-0000-0005-0003-000000000002", "americas",  "Americas",         "#3fb950", 1),
        ("00000000-0000-0005-0003-000000000003", "europe",    "Europe",           "#388bfd", 2),
        ("00000000-0000-0005-0003-000000000004", "asia_pac",  "Asia-Pacific",     "#d68b2a", 3),
        ("00000000-0000-0005-0003-000000000005", "mea",       "Middle East/Africa","#f78166", 4),
        ("00000000-0000-0005-0003-000000000006", "em",        "Emerging Markets", "#7766aa", 5),
    ];
    for (id, slug, label, color, order) in region_opts {
        conn.execute(
            "INSERT OR IGNORE INTO node_param_options
             (id, param_def_id, value_slug, label, color, sort_order)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![id, PARAM_REGION_ID, slug, label, color, order],
        )?;
    }

    // ── Edge: Causation param def (was "Relationship", select_color, drives_color) ─
    conn.execute(
        "INSERT OR IGNORE INTO edge_param_defs
         (id, preset_id, display_name, param_type, drives_arrow, drives_style, drives_color, drives_width, default_value, sort_order)
         VALUES (?1, ?2, 'Causation', 'select_color', 0, 0, 1, 0, NULL, 0)",
        params![EDGE_PARAM_RELATIONSHIP, MACRO_PRESET_ID],
    )?;
    conn.execute(
        "UPDATE edge_param_defs SET display_name = 'Causation' WHERE id = ?1",
        params![EDGE_PARAM_RELATIONSHIP],
    )?;
    let rel_options: &[(&str, &str, &str, &str, i64)] = &[
        ("00000000-0000-0007-0001-000000000001", "caused_by",  "Caused By",      "#c83030", 0),
        ("00000000-0000-0007-0001-000000000002", "correlated", "Correlates With", "#388bfd", 1),
        ("00000000-0000-0007-0001-000000000003", "supports",   "Amplifies",       "#3d9e5f", 2),
        ("00000000-0000-0007-0001-000000000004", "opposes",    "Offsets",         "#f78166", 3),
        ("00000000-0000-0007-0001-000000000005", "hedge",      "Hedges Against",  "#d68b2a", 4),
        ("00000000-0000-0007-0001-000000000006", "reaction",   "Reacts To",       "#7766aa", 5),
        ("00000000-0000-0007-0001-000000000007", "preceded",   "Preceded By",     "#8b949e", 6),
    ];
    // Update changed labels for existing rows
    conn.execute("UPDATE edge_param_options SET label = 'Correlates With' WHERE id = '00000000-0000-0007-0001-000000000002'", [])?;
    conn.execute("UPDATE edge_param_options SET label = 'Amplifies'       WHERE id = '00000000-0000-0007-0001-000000000003'", [])?;
    conn.execute("UPDATE edge_param_options SET label = 'Offsets'         WHERE id = '00000000-0000-0007-0001-000000000004'", [])?;
    conn.execute("UPDATE edge_param_options SET label = 'Hedges Against'  WHERE id = '00000000-0000-0007-0001-000000000005'", [])?;
    conn.execute("UPDATE edge_param_options SET label = 'Reacts To'       WHERE id = '00000000-0000-0007-0001-000000000006'", [])?;
    conn.execute("UPDATE edge_param_options SET label = 'Preceded By'     WHERE id = '00000000-0000-0007-0001-000000000007'", [])?;
    for (id, slug, label, color, order) in rel_options {
        conn.execute(
            "INSERT OR IGNORE INTO edge_param_options
             (id, param_def_id, value_slug, label, color, sort_order)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![id, EDGE_PARAM_RELATIONSHIP, slug, label, color, order],
        )?;
    }

    // ── Edge: Directed (boolean, drives_arrow, default true) ──────────────────
    conn.execute(
        "INSERT OR IGNORE INTO edge_param_defs
         (id, preset_id, display_name, param_type, drives_arrow, drives_style, drives_color, drives_width, default_value, sort_order)
         VALUES (?1, ?2, 'Directed', 'boolean', 1, 0, 0, 0, 'true', 1)",
        params![EDGE_PARAM_DIRECTED, MACRO_PRESET_ID],
    )?;

    // ── Edge: Line Style (select, drives_style) ───────────────────────────────
    conn.execute(
        "INSERT OR IGNORE INTO edge_param_defs
         (id, preset_id, display_name, param_type, drives_arrow, drives_style, drives_color, drives_width, default_value, sort_order)
         VALUES (?1, ?2, 'Line Style', 'select', 0, 1, 0, 0, NULL, 2)",
        params![EDGE_PARAM_LINE_STYLE, MACRO_PRESET_ID],
    )?;
    let style_options: &[(&str, &str, &str, i64)] = &[
        ("00000000-0000-0007-0003-000000000001", "default",    "Bezier (curved)", 0),
        ("00000000-0000-0007-0003-000000000002", "straight",   "Straight",        1),
        ("00000000-0000-0007-0003-000000000003", "step",       "Step",            2),
        ("00000000-0000-0007-0003-000000000004", "smoothstep", "Smooth Step",     3),
    ];
    for (id, slug, label, order) in style_options {
        conn.execute(
            "INSERT OR IGNORE INTO edge_param_options
             (id, param_def_id, value_slug, label, color, sort_order)
             VALUES (?1, ?2, ?3, ?4, NULL, ?5)",
            params![id, EDGE_PARAM_LINE_STYLE, slug, label, order],
        )?;
    }

    // ── Edge: Strength (number, drives_width, default 5) ─────────────────────
    conn.execute(
        "INSERT OR IGNORE INTO edge_param_defs
         (id, preset_id, display_name, param_type, drives_arrow, drives_style, drives_color, drives_width, default_value, sort_order)
         VALUES (?1, ?2, 'Strength', 'number', 0, 0, 0, 1, '5', 3)",
        params![EDGE_PARAM_STRENGTH, MACRO_PRESET_ID],
    )?;

    // ── Edge: Notes (text) ────────────────────────────────────────────────────
    conn.execute(
        "INSERT OR IGNORE INTO edge_param_defs
         (id, preset_id, display_name, param_type, drives_arrow, drives_style, drives_color, drives_width, default_value, sort_order)
         VALUES (?1, ?2, 'Notes', 'text', 0, 0, 0, 0, NULL, 4)",
        params![EDGE_PARAM_NOTES, MACRO_PRESET_ID],
    )?;

    // ── Edge: Correlation (number) ────────────────────────────────────────────
    conn.execute(
        "INSERT OR IGNORE INTO edge_param_defs
         (id, preset_id, display_name, param_type, drives_arrow, drives_style, drives_color, drives_width, default_value, sort_order)
         VALUES (?1, ?2, 'Correlation', 'number', 0, 0, 0, 0, NULL, 5)",
        params![EDGE_PARAM_CORRELATION, MACRO_PRESET_ID],
    )?;

    // ── Edge: Time Lag (number) ───────────────────────────────────────────────
    conn.execute(
        "INSERT OR IGNORE INTO edge_param_defs
         (id, preset_id, display_name, param_type, drives_arrow, drives_style, drives_color, drives_width, default_value, sort_order)
         VALUES (?1, ?2, 'Time Lag (days)', 'number', 0, 0, 0, 0, NULL, 6)",
        params![EDGE_PARAM_TIME_LAG, MACRO_PRESET_ID],
    )?;

    // ── Edge: Confidence (number) ─────────────────────────────────────────────
    conn.execute(
        "INSERT OR IGNORE INTO edge_param_defs
         (id, preset_id, display_name, param_type, drives_arrow, drives_style, drives_color, drives_width, default_value, sort_order)
         VALUES (?1, ?2, 'Confidence (%)', 'number', 0, 0, 0, 0, NULL, 7)",
        params![EDGE_PARAM_CONFIDENCE, MACRO_PRESET_ID],
    )?;

    Ok(())
}

fn seed_system_behavior_preset(conn: &Connection) -> Result<()> {
    conn.execute(
        "INSERT OR IGNORE INTO presets (id, name, is_builtin, created_at)
         VALUES (?1, 'System Behavior', 1, '2024-01-01T00:00:00Z')",
        params![SB_PRESET_ID],
    )?;

    // ── Node: Element Type (was "Component") — system dynamics terminology ───────
    conn.execute(
        "INSERT OR IGNORE INTO node_param_defs
         (id, preset_id, display_name, param_type, drives_color, default_value, sort_order)
         VALUES (?1, ?2, 'Element Type', 'select_color', 1, NULL, 0)",
        params![SB_NODE_COMPONENT, SB_PRESET_ID],
    )?;
    conn.execute(
        "UPDATE node_param_defs SET display_name = 'Element Type' WHERE id = ?1",
        params![SB_NODE_COMPONENT],
    )?;
    let component_opts: &[(&str, &str, &str, &str, i64)] = &[
        ("00000000-0000-0005-0021-000000000001", "process", "Auxiliary",  "#5588bb", 0),
        ("00000000-0000-0005-0021-000000000002", "store",   "Stock",      "#3d9e5f", 1),
        ("00000000-0000-0005-0021-000000000006", "flow",    "Flow",       "#00b0c8", 2),
        ("00000000-0000-0005-0021-000000000003", "source",  "Source",     "#d68b2a", 3),
        ("00000000-0000-0005-0021-000000000004", "sink",    "Sink",       "#c83030", 4),
        ("00000000-0000-0005-0021-000000000005", "control", "Parameter",  "#7766aa", 5),
    ];
    for (id, slug, label, color, order) in component_opts {
        conn.execute(
            "INSERT OR IGNORE INTO node_param_options
             (id, param_def_id, value_slug, label, color, sort_order)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![id, SB_NODE_COMPONENT, slug, label, color, order],
        )?;
    }
    conn.execute("UPDATE node_param_options SET label = 'Auxiliary', sort_order = 0 WHERE id = '00000000-0000-0005-0021-000000000001'", [])?;
    conn.execute("UPDATE node_param_options SET label = 'Stock',     sort_order = 1 WHERE id = '00000000-0000-0005-0021-000000000002'", [])?;
    conn.execute("UPDATE node_param_options SET label = 'Source',    sort_order = 3 WHERE id = '00000000-0000-0005-0021-000000000003'", [])?;
    conn.execute("UPDATE node_param_options SET label = 'Sink',      sort_order = 4 WHERE id = '00000000-0000-0005-0021-000000000004'", [])?;
    conn.execute("UPDATE node_param_options SET label = 'Parameter', sort_order = 5 WHERE id = '00000000-0000-0005-0021-000000000005'", [])?;

    // ── Node: Status (select_color) ───────────────────────────────────────────
    conn.execute(
        "INSERT OR IGNORE INTO node_param_defs
         (id, preset_id, display_name, param_type, drives_color, default_value, sort_order)
         VALUES (?1, ?2, 'Status', 'select_color', 0, NULL, 1)",
        params![SB_NODE_STATUS, SB_PRESET_ID],
    )?;
    let sb_status_opts: &[(&str, &str, &str, &str, i64)] = &[
        ("00000000-0000-0005-0022-000000000001", "active",       "Active",       "#3d9e5f", 0),
        ("00000000-0000-0005-0022-000000000004", "oscillating",  "Oscillating",  "#d68b2a", 1),
        ("00000000-0000-0005-0022-000000000005", "saturated",    "Saturated",    "#f78166", 2),
        ("00000000-0000-0005-0022-000000000002", "dormant",      "Dormant",      "#888888", 3),
        ("00000000-0000-0005-0022-000000000003", "failed",       "Collapsed",    "#c83030", 4),
    ];
    for (id, slug, label, color, order) in sb_status_opts {
        conn.execute(
            "INSERT OR IGNORE INTO node_param_options
             (id, param_def_id, value_slug, label, color, sort_order)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![id, SB_NODE_STATUS, slug, label, color, order],
        )?;
    }
    conn.execute("UPDATE node_param_options SET label = 'Collapsed', sort_order = 4 WHERE id = '00000000-0000-0005-0022-000000000003'", [])?;
    conn.execute("UPDATE node_param_options SET sort_order = 3 WHERE id = '00000000-0000-0005-0022-000000000002'", [])?;

    // ── Edge: Polarity (was "Influence") — causal link polarity ───────────────
    conn.execute(
        "INSERT OR IGNORE INTO edge_param_defs
         (id, preset_id, display_name, param_type, drives_arrow, drives_style, drives_color, drives_width, default_value, sort_order)
         VALUES (?1, ?2, 'Polarity', 'select_color', 0, 0, 1, 0, NULL, 0)",
        params![SB_EDGE_INFLUENCE, SB_PRESET_ID],
    )?;
    conn.execute(
        "UPDATE edge_param_defs SET display_name = 'Polarity' WHERE id = ?1",
        params![SB_EDGE_INFLUENCE],
    )?;
    let influence_opts: &[(&str, &str, &str, &str, i64)] = &[
        ("00000000-0000-0007-0021-000000000001", "positive", "Positive (+)", "#3d9e5f", 0),
        ("00000000-0000-0007-0021-000000000002", "negative", "Negative (−)", "#c83030", 1),
        ("00000000-0000-0007-0021-000000000003", "neutral",  "Neutral",      "#888888", 2),
    ];
    for (id, slug, label, color, order) in influence_opts {
        conn.execute(
            "INSERT OR IGNORE INTO edge_param_options
             (id, param_def_id, value_slug, label, color, sort_order)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![id, SB_EDGE_INFLUENCE, slug, label, color, order],
        )?;
    }
    conn.execute("UPDATE edge_param_options SET label = 'Positive (+)' WHERE id = '00000000-0000-0007-0021-000000000001'", [])?;
    conn.execute("UPDATE edge_param_options SET label = 'Negative (−)' WHERE id = '00000000-0000-0007-0021-000000000002'", [])?;

    // ── Edge: Loop Type (select_color, for labeling feedback loops) ───────────
    conn.execute(
        "INSERT OR IGNORE INTO edge_param_defs
         (id, preset_id, display_name, param_type, drives_arrow, drives_style, drives_color, drives_width, default_value, sort_order)
         VALUES (?1, ?2, 'Loop Type', 'select_color', 0, 0, 0, 0, NULL, 1)",
        params![SB_EDGE_LOOP_TYPE, SB_PRESET_ID],
    )?;
    let loop_opts: &[(&str, &str, &str, &str, i64)] = &[
        ("00000000-0000-0007-0022-000000000010", "reinforcing", "Reinforcing (R)", "#d68b2a", 0),
        ("00000000-0000-0007-0022-000000000011", "balancing",   "Balancing (B)",   "#388bfd", 1),
    ];
    for (id, slug, label, color, order) in loop_opts {
        conn.execute(
            "INSERT OR IGNORE INTO edge_param_options
             (id, param_def_id, value_slug, label, color, sort_order)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![id, SB_EDGE_LOOP_TYPE, slug, label, color, order],
        )?;
    }

    // ── Edge: Delay (boolean, drives_arrow) — causal link has delay ───────────
    conn.execute(
        "INSERT OR IGNORE INTO edge_param_defs
         (id, preset_id, display_name, param_type, drives_arrow, drives_style, drives_color, drives_width, default_value, sort_order)
         VALUES (?1, ?2, 'Delayed', 'boolean', 0, 0, 0, 0, 'false', 2)",
        params![SB_EDGE_DELAY, SB_PRESET_ID],
    )?;

    // ── Edge: Directed (boolean, drives_arrow, default true) ──────────────────
    conn.execute(
        "INSERT OR IGNORE INTO edge_param_defs
         (id, preset_id, display_name, param_type, drives_arrow, drives_style, drives_color, drives_width, default_value, sort_order)
         VALUES (?1, ?2, 'Directed', 'boolean', 1, 0, 0, 0, 'true', 3)",
        params![SB_EDGE_DIRECTED, SB_PRESET_ID],
    )?;

    // ── Edge: Line Style (select, drives_style) ───────────────────────────────
    conn.execute(
        "INSERT OR IGNORE INTO edge_param_defs
         (id, preset_id, display_name, param_type, drives_arrow, drives_style, drives_color, drives_width, default_value, sort_order)
         VALUES (?1, ?2, 'Line Style', 'select', 0, 1, 0, 0, NULL, 4)",
        params![SB_EDGE_LINE_STYLE, SB_PRESET_ID],
    )?;
    let sb_style_opts: &[(&str, &str, &str, i64)] = &[
        ("00000000-0000-0007-0022-000000000001", "default",    "Bezier (curved)", 0),
        ("00000000-0000-0007-0022-000000000002", "straight",   "Straight",        1),
        ("00000000-0000-0007-0022-000000000003", "step",       "Step",            2),
        ("00000000-0000-0007-0022-000000000004", "smoothstep", "Smooth Step",     3),
    ];
    for (id, slug, label, order) in sb_style_opts {
        conn.execute(
            "INSERT OR IGNORE INTO edge_param_options
             (id, param_def_id, value_slug, label, color, sort_order)
             VALUES (?1, ?2, ?3, ?4, NULL, ?5)",
            params![id, SB_EDGE_LINE_STYLE, slug, label, order],
        )?;
    }

    // ── Edge: Strength (number, drives_width, default 3) ─────────────────────
    conn.execute(
        "INSERT OR IGNORE INTO edge_param_defs
         (id, preset_id, display_name, param_type, drives_arrow, drives_style, drives_color, drives_width, default_value, sort_order)
         VALUES (?1, ?2, 'Strength', 'number', 0, 0, 0, 1, '3', 5)",
        params![SB_EDGE_STRENGTH, SB_PRESET_ID],
    )?;

    // ── Edge: Notes (text) ────────────────────────────────────────────────────
    conn.execute(
        "INSERT OR IGNORE INTO edge_param_defs
         (id, preset_id, display_name, param_type, drives_arrow, drives_style, drives_color, drives_width, default_value, sort_order)
         VALUES (?1, ?2, 'Notes', 'text', 0, 0, 0, 0, NULL, 6)",
        params![SB_EDGE_NOTES, SB_PRESET_ID],
    )?;

    Ok(())
}

fn seed_knowledge_map_preset(conn: &Connection) -> Result<()> {
    conn.execute(
        "INSERT OR IGNORE INTO presets (id, name, is_builtin, created_at)
         VALUES (?1, 'Knowledge Map', 1, '2024-01-01T00:00:00Z')",
        params![KM_PRESET_ID],
    )?;

    // ── Node: Type (select_color, drives_color) ───────────────────────────────
    conn.execute(
        "INSERT OR IGNORE INTO node_param_defs
         (id, preset_id, display_name, param_type, drives_color, default_value, sort_order)
         VALUES (?1, ?2, 'Type', 'select_color', 1, NULL, 0)",
        params![KM_NODE_TYPE, KM_PRESET_ID],
    )?;
    let km_type_opts: &[(&str, &str, &str, &str, i64)] = &[
        ("00000000-0000-0005-0031-000000000001", "concept",   "Concept",  "#5588bb", 0),
        ("00000000-0000-0005-0031-000000000002", "principle", "Claim",    "#d68b2a", 1),
        ("00000000-0000-0005-0031-000000000003", "example",   "Evidence", "#3d9e5f", 2),
        ("00000000-0000-0005-0031-000000000005", "method",    "Method",   "#7766aa", 3),
        ("00000000-0000-0005-0031-000000000006", "source",    "Source",   "#888888", 4),
        ("00000000-0000-0005-0031-000000000004", "question",  "Question", "#c83030", 5),
    ];
    for (id, slug, label, color, order) in km_type_opts {
        conn.execute(
            "INSERT OR IGNORE INTO node_param_options
             (id, param_def_id, value_slug, label, color, sort_order)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![id, KM_NODE_TYPE, slug, label, color, order],
        )?;
    }
    conn.execute("UPDATE node_param_options SET label = 'Claim',    sort_order = 1 WHERE id = '00000000-0000-0005-0031-000000000002'", [])?;
    conn.execute("UPDATE node_param_options SET label = 'Evidence', sort_order = 2 WHERE id = '00000000-0000-0005-0031-000000000003'", [])?;
    conn.execute("UPDATE node_param_options SET sort_order = 5 WHERE id = '00000000-0000-0005-0031-000000000004'", [])?;

    // ── Node: Confidence (number, 0–100) ──────────────────────────────────────
    conn.execute(
        "INSERT OR IGNORE INTO node_param_defs
         (id, preset_id, display_name, param_type, drives_color, default_value, sort_order)
         VALUES (?1, ?2, 'Confidence (%)', 'number', 0, NULL, 1)",
        params![KM_NODE_CONFIDENCE, KM_PRESET_ID],
    )?;

    // ── Node: Source citation (text) ──────────────────────────────────────────
    conn.execute(
        "INSERT OR IGNORE INTO node_param_defs
         (id, preset_id, display_name, param_type, drives_color, default_value, sort_order)
         VALUES (?1, ?2, 'Source', 'text', 0, NULL, 2)",
        params![KM_NODE_SOURCE, KM_PRESET_ID],
    )?;

    // ── Edge: Relation (select_color, drives_color) ───────────────────────────
    conn.execute(
        "INSERT OR IGNORE INTO edge_param_defs
         (id, preset_id, display_name, param_type, drives_arrow, drives_style, drives_color, drives_width, default_value, sort_order)
         VALUES (?1, ?2, 'Relation', 'select_color', 0, 0, 1, 0, NULL, 0)",
        params![KM_EDGE_RELATION, KM_PRESET_ID],
    )?;
    let relation_opts: &[(&str, &str, &str, &str, i64)] = &[
        ("00000000-0000-0007-0031-000000000001", "supports",    "Supports",    "#3d9e5f", 0),
        ("00000000-0000-0007-0031-000000000002", "contradicts", "Contradicts", "#c83030", 1),
        ("00000000-0000-0007-0031-000000000003", "extends",     "Extends",     "#5588bb", 2),
        ("00000000-0000-0007-0031-000000000005", "implies",     "Implies",     "#d68b2a", 3),
        ("00000000-0000-0007-0031-000000000006", "cites",       "Cites",       "#7766aa", 4),
        ("00000000-0000-0007-0031-000000000004", "related",     "Related",     "#888888", 5),
    ];
    for (id, slug, label, color, order) in relation_opts {
        conn.execute(
            "INSERT OR IGNORE INTO edge_param_options
             (id, param_def_id, value_slug, label, color, sort_order)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![id, KM_EDGE_RELATION, slug, label, color, order],
        )?;
    }
    conn.execute("UPDATE edge_param_options SET sort_order = 5 WHERE id = '00000000-0000-0007-0031-000000000004'", [])?;

    // ── Edge: Directed (boolean, drives_arrow, default true) ──────────────────
    conn.execute(
        "INSERT OR IGNORE INTO edge_param_defs
         (id, preset_id, display_name, param_type, drives_arrow, drives_style, drives_color, drives_width, default_value, sort_order)
         VALUES (?1, ?2, 'Directed', 'boolean', 1, 0, 0, 0, 'true', 1)",
        params![KM_EDGE_DIRECTED, KM_PRESET_ID],
    )?;

    // ── Edge: Weight (number, drives_width, default 2) ────────────────────────
    conn.execute(
        "INSERT OR IGNORE INTO edge_param_defs
         (id, preset_id, display_name, param_type, drives_arrow, drives_style, drives_color, drives_width, default_value, sort_order)
         VALUES (?1, ?2, 'Weight', 'number', 0, 0, 0, 1, '2', 2)",
        params![KM_EDGE_WEIGHT, KM_PRESET_ID],
    )?;

    // ── Edge: Notes (text) ────────────────────────────────────────────────────
    conn.execute(
        "INSERT OR IGNORE INTO edge_param_defs
         (id, preset_id, display_name, param_type, drives_arrow, drives_style, drives_color, drives_width, default_value, sort_order)
         VALUES (?1, ?2, 'Notes', 'text', 0, 0, 0, 0, NULL, 3)",
        params![KM_EDGE_NOTES, KM_PRESET_ID],
    )?;

    Ok(())
}

fn seed_project_preset(conn: &Connection) -> Result<()> {
    conn.execute(
        "INSERT OR IGNORE INTO presets (id, name, is_builtin, created_at)
         VALUES (?1, 'Project Tracker', 1, '2024-01-01T00:00:00Z')",
        params![PR_PRESET_ID],
    )?;
    conn.execute(
        "UPDATE presets SET name = 'Project Tracker' WHERE id = ?1",
        params![PR_PRESET_ID],
    )?;

    // ── Node: Status (select_color, drives_color) ─────────────────────────────
    conn.execute(
        "INSERT OR IGNORE INTO node_param_defs
         (id, preset_id, display_name, param_type, drives_color, default_value, sort_order)
         VALUES (?1, ?2, 'Status', 'select_color', 1, NULL, 0)",
        params![PR_NODE_STATUS, PR_PRESET_ID],
    )?;
    let pr_status_opts: &[(&str, &str, &str, &str, i64)] = &[
        ("00000000-0000-0005-0041-000000000001", "todo",        "To Do",       "#888888", 0),
        ("00000000-0000-0005-0041-000000000002", "in_progress", "In Progress", "#d68b2a", 1),
        ("00000000-0000-0005-0041-000000000005", "in_review",   "In Review",   "#5588bb", 2),
        ("00000000-0000-0005-0041-000000000003", "done",        "Done",        "#3d9e5f", 3),
        ("00000000-0000-0005-0041-000000000004", "blocked",     "Blocked",     "#c83030", 4),
    ];
    for (id, slug, label, color, order) in pr_status_opts {
        conn.execute(
            "INSERT OR IGNORE INTO node_param_options
             (id, param_def_id, value_slug, label, color, sort_order)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![id, PR_NODE_STATUS, slug, label, color, order],
        )?;
    }
    conn.execute("UPDATE node_param_options SET label = 'To Do',       sort_order = 0 WHERE id = '00000000-0000-0005-0041-000000000001'", [])?;
    conn.execute("UPDATE node_param_options SET sort_order = 3 WHERE id = '00000000-0000-0005-0041-000000000003'", [])?;
    conn.execute("UPDATE node_param_options SET sort_order = 4 WHERE id = '00000000-0000-0005-0041-000000000004'", [])?;

    // ── Node: Type (select_color) ─────────────────────────────────────────────
    conn.execute(
        "INSERT OR IGNORE INTO node_param_defs
         (id, preset_id, display_name, param_type, drives_color, default_value, sort_order)
         VALUES (?1, ?2, 'Type', 'select_color', 0, NULL, 1)",
        params![PR_NODE_TYPE, PR_PRESET_ID],
    )?;
    let pr_node_type_opts: &[(&str, &str, &str, &str, i64)] = &[
        ("00000000-0000-0005-0043-000000000001", "task",      "Task",      "#888888", 0),
        ("00000000-0000-0005-0043-000000000002", "feature",   "Feature",   "#3d9e5f", 1),
        ("00000000-0000-0005-0043-000000000003", "bug",       "Bug",       "#c83030", 2),
        ("00000000-0000-0005-0043-000000000004", "epic",      "Epic",      "#5588bb", 3),
        ("00000000-0000-0005-0043-000000000005", "milestone", "Milestone", "#d68b2a", 4),
    ];
    for (id, slug, label, color, order) in pr_node_type_opts {
        conn.execute(
            "INSERT OR IGNORE INTO node_param_options
             (id, param_def_id, value_slug, label, color, sort_order)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![id, PR_NODE_TYPE, slug, label, color, order],
        )?;
    }

    // ── Node: Priority (select_color) ─────────────────────────────────────────
    conn.execute(
        "INSERT OR IGNORE INTO node_param_defs
         (id, preset_id, display_name, param_type, drives_color, default_value, sort_order)
         VALUES (?1, ?2, 'Priority', 'select_color', 0, NULL, 2)",
        params![PR_NODE_PRIORITY, PR_PRESET_ID],
    )?;
    let priority_opts: &[(&str, &str, &str, &str, i64)] = &[
        ("00000000-0000-0005-0042-000000000001", "low",      "Low",      "#888888", 0),
        ("00000000-0000-0005-0042-000000000002", "medium",   "Medium",   "#5588bb", 1),
        ("00000000-0000-0005-0042-000000000003", "high",     "High",     "#d68b2a", 2),
        ("00000000-0000-0005-0042-000000000004", "critical", "Critical", "#c83030", 3),
    ];
    for (id, slug, label, color, order) in priority_opts {
        conn.execute(
            "INSERT OR IGNORE INTO node_param_options
             (id, param_def_id, value_slug, label, color, sort_order)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![id, PR_NODE_PRIORITY, slug, label, color, order],
        )?;
    }

    // ── Node: Estimate (number, story points) ─────────────────────────────────
    conn.execute(
        "INSERT OR IGNORE INTO node_param_defs
         (id, preset_id, display_name, param_type, drives_color, default_value, sort_order)
         VALUES (?1, ?2, 'Estimate (pts)', 'number', 0, NULL, 3)",
        params![PR_NODE_ESTIMATE, PR_PRESET_ID],
    )?;

    // ── Edge: Relationship (select_color, drives_color) ───────────────────────
    conn.execute(
        "INSERT OR IGNORE INTO edge_param_defs
         (id, preset_id, display_name, param_type, drives_arrow, drives_style, drives_color, drives_width, default_value, sort_order)
         VALUES (?1, ?2, 'Relationship', 'select_color', 0, 0, 1, 0, NULL, 0)",
        params![PR_EDGE_TYPE, PR_PRESET_ID],
    )?;
    conn.execute(
        "UPDATE edge_param_defs SET display_name = 'Relationship' WHERE id = ?1",
        params![PR_EDGE_TYPE],
    )?;
    let pr_type_opts: &[(&str, &str, &str, &str, i64)] = &[
        ("00000000-0000-0007-0041-000000000001", "depends_on", "Depends On", "#c83030", 0),
        ("00000000-0000-0007-0041-000000000002", "blocks",     "Blocks",     "#d68b2a", 1),
        ("00000000-0000-0007-0041-000000000004", "part_of",    "Part Of",    "#7766aa", 2),
        ("00000000-0000-0007-0041-000000000005", "triggers",   "Triggers",   "#00b0c8", 3),
        ("00000000-0000-0007-0041-000000000003", "related",    "Related",    "#5588bb", 4),
    ];
    for (id, slug, label, color, order) in pr_type_opts {
        conn.execute(
            "INSERT OR IGNORE INTO edge_param_options
             (id, param_def_id, value_slug, label, color, sort_order)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![id, PR_EDGE_TYPE, slug, label, color, order],
        )?;
    }
    conn.execute("UPDATE edge_param_options SET sort_order = 4 WHERE id = '00000000-0000-0007-0041-000000000003'", [])?;

    // ── Edge: Directed (boolean, drives_arrow, default true) ──────────────────
    conn.execute(
        "INSERT OR IGNORE INTO edge_param_defs
         (id, preset_id, display_name, param_type, drives_arrow, drives_style, drives_color, drives_width, default_value, sort_order)
         VALUES (?1, ?2, 'Directed', 'boolean', 1, 0, 0, 0, 'true', 1)",
        params![PR_EDGE_DIRECTED, PR_PRESET_ID],
    )?;

    // ── Edge: Notes (text) ────────────────────────────────────────────────────
    conn.execute(
        "INSERT OR IGNORE INTO edge_param_defs
         (id, preset_id, display_name, param_type, drives_arrow, drives_style, drives_color, drives_width, default_value, sort_order)
         VALUES (?1, ?2, 'Notes', 'text', 0, 0, 0, 0, NULL, 2)",
        params![PR_EDGE_NOTES, PR_PRESET_ID],
    )?;

    Ok(())
}

fn seed_blank_preset(conn: &Connection) -> Result<()> {
    conn.execute(
        "INSERT OR IGNORE INTO presets (id, name, is_builtin, created_at)
         VALUES (?1, 'Blank', 1, '2024-01-01T00:00:00Z')",
        params![BLANK_PRESET_ID],
    )?;
    Ok(())
}

/// One-time migration: drivesColor param defs and their existing values should
/// default to showing on card, matching pre-feature behaviour where the badge
/// was always visible. Runs once, tracked via app_settings.
fn migrate_show_on_card_defaults(conn: &Connection) -> Result<()> {
    let already_done: bool = conn
        .query_row(
            "SELECT value FROM app_settings WHERE key = 'migration_show_on_card_v1'",
            [],
            |row| row.get::<_, String>(0),
        )
        .map(|v| v == "done")
        .unwrap_or(false);

    if already_done {
        return Ok(());
    }

    // show_on_card_default = 1 for every drivesColor param def
    conn.execute(
        "UPDATE node_param_defs SET show_on_card_default = 1 WHERE drives_color = 1",
        [],
    )?;

    // show_on_card = 1 for every existing param value of a drivesColor def
    conn.execute(
        "UPDATE node_param_values SET show_on_card = 1 \
         WHERE param_def_id IN (SELECT id FROM node_param_defs WHERE drives_color = 1)",
        [],
    )?;

    conn.execute(
        "INSERT OR REPLACE INTO app_settings (key, value) \
         VALUES ('migration_show_on_card_v1', 'done')",
        [],
    )?;

    Ok(())
}

/// One-time migration: move existing category/status column values on nodes
/// into node_param_values so they survive the schema rework.
fn migrate_legacy_node_columns(conn: &Connection) -> Result<()> {
    // `category` / `status` are legacy columns that only exist on DBs predating
    // the param-values rework. New DBs never create them, so guard each branch.
    if column_exists(conn, "nodes", "category") {
        conn.execute(
            "INSERT OR IGNORE INTO node_param_values (id, node_id, param_def_id, value, is_enabled)
             SELECT lower(hex(randomblob(16))), id, ?1, category, 1
             FROM nodes
             WHERE category IS NOT NULL AND category != ''",
            params![PARAM_CAT_ID],
        )?;
    }

    if column_exists(conn, "nodes", "status") {
        conn.execute(
            "INSERT OR IGNORE INTO node_param_values (id, node_id, param_def_id, value, is_enabled)
             SELECT lower(hex(randomblob(16))), id, ?1, status, 1
             FROM nodes
             WHERE status IS NOT NULL AND status != ''",
            params![PARAM_STATUS_ID],
        )?;
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::{column_exists, init_db};
    use rusqlite::Connection;

    /// The vestigial `nodes.created_at` column (a write-only duplicate of
    /// `date_added`) is never created on new DBs and is dropped from existing ones.
    #[test]
    fn migration_drops_vestigial_nodes_created_at() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).unwrap();
        // Fresh DBs never create the column.
        assert!(!column_exists(&conn, "nodes", "created_at"));

        // Simulate an older DB that still carries the column...
        conn.execute("ALTER TABLE nodes ADD COLUMN created_at TEXT NOT NULL DEFAULT ''", [])
            .unwrap();
        assert!(column_exists(&conn, "nodes", "created_at"));

        // ...re-running init_db applies the DROP COLUMN migration.
        init_db(&conn).unwrap();
        assert!(!column_exists(&conn, "nodes", "created_at"));

        // A node insert that omits created_at now succeeds (no NOT NULL blocker).
        conn.execute(
            "INSERT INTO nodes (id, title, date_added, x, y) VALUES ('n1','T','2026-01-01',0,0)",
            [],
        ).unwrap();
    }
}
