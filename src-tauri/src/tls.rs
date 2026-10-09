//! Live Share TLS — per-session self-signed cert + fingerprint pinning.
//!
//! The session server (`http_api::serve_session`) runs HTTPS/WSS using a cert
//! generated here for the host's LAN IP. The guest's loopback bridge
//! (`session::start_guest_bridge`) connects with a rustls client that **pins**
//! that exact cert by SHA-256 fingerprint — the fingerprint travels in the join
//! info, so there is no CA and a MITM can't substitute a different cert. The
//! handshake signature is still verified against the pinned cert's key, so
//! knowing the (public) cert isn't enough — the peer must hold its private key.

use std::sync::Arc;

use rustls::client::danger::{HandshakeSignatureValid, ServerCertVerified, ServerCertVerifier};
use rustls::crypto::{aws_lc_rs, CryptoProvider};
use rustls::pki_types::{CertificateDer, ServerName, UnixTime};
use rustls::{ClientConfig, DigitallySignedStruct, SignatureScheme};
use sha2::{Digest, Sha256};

/// Generated cert material for one session.
pub struct SessionCert {
    pub cert_der: Vec<u8>,
    pub key_der: Vec<u8>,
    /// Lowercase-hex SHA-256 of `cert_der` — shared with guests for pinning.
    pub fingerprint: String,
}

/// Generate a fresh self-signed cert valid for the given LAN IP (+ localhost).
/// The IP is a SAN so the cert matches the address the guest dials.
pub fn generate_self_signed(ip: &str) -> Result<SessionCert, String> {
    let mut sans = vec!["localhost".to_string()];
    if !ip.is_empty() {
        sans.push(ip.to_string());
    }
    let certified = rcgen::generate_simple_self_signed(sans).map_err(|e| e.to_string())?;
    let cert_der = certified.cert.der().to_vec();
    let key_der = certified.key_pair.serialize_der();
    let fingerprint = fingerprint_hex(&cert_der);
    Ok(SessionCert { cert_der, key_der, fingerprint })
}

/// Lowercase-hex SHA-256 of a DER cert — the value pinned/shared out-of-band.
pub fn fingerprint_hex(cert_der: &[u8]) -> String {
    let digest = Sha256::digest(cert_der);
    let mut s = String::with_capacity(64);
    for b in digest {
        s.push_str(&format!("{:02x}", b));
    }
    s
}

/// Install aws-lc-rs as the process-default rustls provider (idempotent). Call
/// once at startup so every rustls config (server + client) shares one provider
/// and no path hits the "no process-default CryptoProvider" panic.
pub fn ensure_crypto_provider() {
    let _ = aws_lc_rs::default_provider().install_default();
}

/// A rustls `ClientConfig` that trusts **exactly** the cert whose SHA-256
/// fingerprint equals `expected_fp` (lowercase hex) and nothing else.
pub fn pinned_client_config(expected_fp: &str) -> ClientConfig {
    let provider = Arc::new(aws_lc_rs::default_provider());
    let verifier = Arc::new(PinnedCertVerifier {
        expected_fp: expected_fp.to_lowercase(),
        provider: provider.clone(),
    });
    ClientConfig::builder_with_provider(provider)
        .with_safe_default_protocol_versions()
        .expect("rustls default protocol versions")
        .dangerous()
        .with_custom_certificate_verifier(verifier)
        .with_no_client_auth()
}

#[derive(Debug)]
struct PinnedCertVerifier {
    expected_fp: String,
    provider: Arc<CryptoProvider>,
}

impl ServerCertVerifier for PinnedCertVerifier {
    fn verify_server_cert(
        &self,
        end_entity: &CertificateDer<'_>,
        _intermediates: &[CertificateDer<'_>],
        _server_name: &ServerName<'_>,
        _ocsp_response: &[u8],
        _now: UnixTime,
    ) -> Result<ServerCertVerified, rustls::Error> {
        if fingerprint_hex(end_entity.as_ref()) == self.expected_fp {
            Ok(ServerCertVerified::assertion())
        } else {
            Err(rustls::Error::General("session cert fingerprint mismatch".into()))
        }
    }

    fn verify_tls12_signature(
        &self,
        message: &[u8],
        cert: &CertificateDer<'_>,
        dss: &DigitallySignedStruct,
    ) -> Result<HandshakeSignatureValid, rustls::Error> {
        rustls::crypto::verify_tls12_signature(message, cert, dss, &self.provider.signature_verification_algorithms)
    }

    fn verify_tls13_signature(
        &self,
        message: &[u8],
        cert: &CertificateDer<'_>,
        dss: &DigitallySignedStruct,
    ) -> Result<HandshakeSignatureValid, rustls::Error> {
        rustls::crypto::verify_tls13_signature(message, cert, dss, &self.provider.signature_verification_algorithms)
    }

    fn supported_verify_schemes(&self) -> Vec<SignatureScheme> {
        self.provider.signature_verification_algorithms.supported_schemes()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fingerprint_is_64_hex_and_per_cert_unique() {
        ensure_crypto_provider();
        let a = generate_self_signed("192.168.0.5").unwrap();
        assert_eq!(a.fingerprint.len(), 64);
        assert!(a.fingerprint.chars().all(|c| c.is_ascii_hexdigit()));
        assert_eq!(a.fingerprint, fingerprint_hex(&a.cert_der));
        let b = generate_self_signed("192.168.0.5").unwrap();
        assert_ne!(a.fingerprint, b.fingerprint, "each session gets a unique cert");
    }

    #[test]
    fn verifier_accepts_only_the_pinned_cert() {
        ensure_crypto_provider();
        let a = generate_self_signed("10.0.0.1").unwrap();
        let b = generate_self_signed("10.0.0.1").unwrap();
        let v = PinnedCertVerifier {
            expected_fp: a.fingerprint.clone(),
            provider: Arc::new(aws_lc_rs::default_provider()),
        };
        let now = UnixTime::now();
        let name = ServerName::try_from("10.0.0.1").unwrap();
        let a_der = CertificateDer::from(a.cert_der.clone());
        let b_der = CertificateDer::from(b.cert_der.clone());
        assert!(v.verify_server_cert(&a_der, &[], &name, &[], now).is_ok());
        assert!(v.verify_server_cert(&b_der, &[], &name, &[], now).is_err());
    }

    #[test]
    fn pinned_client_config_builds() {
        ensure_crypto_provider();
        let c = generate_self_signed("10.0.0.1").unwrap();
        let _cfg = pinned_client_config(&c.fingerprint);
    }
}
