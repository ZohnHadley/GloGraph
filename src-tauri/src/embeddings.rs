//! Optional semantic search support. GloGraph stays local-first and ships no
//! embedding model: instead it calls a **pluggable, OpenAI-compatible embeddings
//! endpoint** the user configures (default: a local Ollama at
//! `http://localhost:11434/v1/embeddings`). Vectors are cached per node in
//! `node_embeddings` and ranked by cosine similarity. Disabled by default.

use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EmbedConfig {
    pub enabled: bool,
    /// OpenAI-compatible embeddings URL. Ollama: http://localhost:11434/v1/embeddings.
    pub url: String,
    pub model: String,
    /// Optional bearer token (for hosted providers; blank for local Ollama).
    #[serde(default)]
    pub api_key: String,
}

impl Default for EmbedConfig {
    fn default() -> Self {
        EmbedConfig {
            enabled: false,
            url: "http://localhost:11434/v1/embeddings".to_string(),
            model: "nomic-embed-text".to_string(),
            api_key: String::new(),
        }
    }
}

/// Read `embed_config.json` from the projects dir (global, like `api_config.json`).
/// Writes a default (disabled) file the first time so users have something to edit.
pub fn load_embed_config(projects_dir: &Path) -> EmbedConfig {
    let path = projects_dir.join("embed_config.json");
    if let Ok(s) = std::fs::read_to_string(&path) {
        if let Ok(cfg) = serde_json::from_str(&s) {
            return cfg;
        }
    }
    let def = EmbedConfig::default();
    if let Ok(json) = serde_json::to_string_pretty(&def) {
        let _ = std::fs::write(&path, json);
    }
    def
}

#[derive(Deserialize)]
struct EmbedResponse {
    data: Vec<EmbedDatum>,
}
#[derive(Deserialize)]
struct EmbedDatum {
    embedding: Vec<f32>,
}

/// Embed a batch of texts in one request. Blocking — call inside `spawn_blocking`.
pub fn embed_texts(cfg: &EmbedConfig, texts: &[String]) -> Result<Vec<Vec<f32>>, String> {
    if texts.is_empty() {
        return Ok(vec![]);
    }
    let body = serde_json::json!({ "model": cfg.model, "input": texts });
    let mut req = ureq::post(&cfg.url).set("Content-Type", "application/json");
    if !cfg.api_key.is_empty() {
        req = req.set("Authorization", &format!("Bearer {}", cfg.api_key));
    }
    let resp = req
        .send_json(body)
        .map_err(|e| format!("embeddings request to {} failed: {}", cfg.url, e))?;
    let parsed: EmbedResponse = resp
        .into_json()
        .map_err(|e| format!("could not parse embeddings response: {}", e))?;
    Ok(parsed.data.into_iter().map(|d| d.embedding).collect())
}

pub fn cosine(a: &[f32], b: &[f32]) -> f32 {
    if a.len() != b.len() || a.is_empty() {
        return 0.0;
    }
    let (mut dot, mut na, mut nb) = (0.0f32, 0.0f32, 0.0f32);
    for i in 0..a.len() {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    if na == 0.0 || nb == 0.0 {
        return 0.0;
    }
    dot / (na.sqrt() * nb.sqrt())
}

pub fn vec_to_bytes(v: &[f32]) -> Vec<u8> {
    v.iter().flat_map(|f| f.to_le_bytes()).collect()
}
pub fn bytes_to_vec(b: &[u8]) -> Vec<f32> {
    b.chunks_exact(4)
        .map(|c| f32::from_le_bytes([c[0], c[1], c[2], c[3]]))
        .collect()
}

/// Hash of the embeddable text + model, so a title/description (or model) change
/// invalidates the cached vector.
pub fn src_hash(model: &str, title: &str, desc: &str) -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    let mut h = DefaultHasher::new();
    model.hash(&mut h);
    title.hash(&mut h);
    desc.hash(&mut h);
    format!("{:x}", h.finish())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cosine_basic() {
        assert!((cosine(&[1.0, 0.0], &[1.0, 0.0]) - 1.0).abs() < 1e-6); // identical
        assert!(cosine(&[1.0, 0.0], &[0.0, 1.0]).abs() < 1e-6); // orthogonal
        assert!((cosine(&[1.0, 1.0], &[2.0, 2.0]) - 1.0).abs() < 1e-6); // same direction
        assert_eq!(cosine(&[1.0], &[1.0, 2.0]), 0.0); // length mismatch → 0
        assert_eq!(cosine(&[0.0, 0.0], &[1.0, 1.0]), 0.0); // zero vector → 0
    }

    #[test]
    fn vec_byte_roundtrip() {
        let v = vec![0.0f32, 1.5, -2.25, 3.125];
        assert_eq!(bytes_to_vec(&vec_to_bytes(&v)), v);
    }

    #[test]
    fn hash_changes_with_content_and_model() {
        let a = src_hash("m1", "t", "d");
        assert_eq!(a, src_hash("m1", "t", "d")); // stable
        assert_ne!(a, src_hash("m1", "t", "d2")); // desc change
        assert_ne!(a, src_hash("m2", "t", "d")); // model change
    }
}
