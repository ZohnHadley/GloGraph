fn main() {
    // Stamp the build date into the binary — shown in the About panel and used by
    // the (future) license updates-entitlement check. A release sets it explicitly:
    //   GLOGRAPH_BUILD_DATE=2026-06-01 npm run tauri build
    // Dev/CI builds without it fall back to the compile date.
    let build_date = std::env::var("GLOGRAPH_BUILD_DATE")
        .unwrap_or_else(|_| chrono::Utc::now().format("%Y-%m-%d").to_string());
    println!("cargo:rustc-env=GLOGRAPH_BUILD_DATE={build_date}");
    println!("cargo:rerun-if-env-changed=GLOGRAPH_BUILD_DATE");

    tauri_build::build()
}
