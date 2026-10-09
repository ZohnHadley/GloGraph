# Windows code-signing wrapper for Tauri's `bundle.windows.signCommand`.
#
# Tauri invokes this once per build artifact (.exe NSIS setup + .msi), passing the
# artifact's absolute path as the single argument. We sign it IN PLACE with SSL.com
# eSigner CodeSignTool (cloud HSM — no USB token), using the IV code-signing cert.
#
# GRACEFUL DEGRADATION: if the eSigner credentials aren't present in the environment,
# this script PRINTS A WARNING AND EXITS 0 WITHOUT SIGNING — so a normal unsigned build
# (`npm run tauri build`, `npm run build:releases`) still succeeds. Signing only happens
# when you've exported the creds below. To produce a SIGNED release, set them first.
#
# Required env vars (set in your shell session, NEVER commit them):
#   ESIGNER_USERNAME       SSL.com account username
#   ESIGNER_PASSWORD       SSL.com account password
#   ESIGNER_CREDENTIAL_ID  eSigner credential id (from the SSL.com eSigner page)
#   ESIGNER_TOTP_SECRET    eSigner TOTP secret (enables headless/automated signing)
# Optional:
#   CODESIGNTOOL_PATH      Path to CodeSignTool.bat (default: "CodeSignTool.bat" on PATH)
#
# Prerequisites: SSL.com eSigner CodeSignTool extracted somewhere, and a JRE/Java on the
# build machine (CodeSignTool is Java-based). Each artifact = one cloud round-trip +
# malware scan, so signed builds are slower. That's expected.

param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$FilePath
)

$ErrorActionPreference = 'Stop'

# Optionally load creds from a dotenv file pointed to by ESIGNER_ENV_FILE (kept OUTSIDE
# the repo so secrets are never committed). Lines are KEY=VALUE; '#' comments and blanks
# are skipped; surrounding quotes are stripped. An already-set env var is NOT overwritten,
# so an explicit `$env:` value still wins over the file.
if ($env:ESIGNER_ENV_FILE) {
  if (Test-Path -LiteralPath $env:ESIGNER_ENV_FILE) {
    foreach ($line in Get-Content -LiteralPath $env:ESIGNER_ENV_FILE) {
      $t = $line.Trim()
      if (-not $t -or $t.StartsWith('#') -or ($t -notmatch '=')) { continue }
      $k = $t.Substring(0, $t.IndexOf('=')).Trim()
      $v = $t.Substring($t.IndexOf('=') + 1).Trim().Trim('"').Trim("'")
      if ($k -and -not (Test-Path "env:$k")) { Set-Item -Path "env:$k" -Value $v }
    }
  } else {
    Write-Host "[sign-windows] ESIGNER_ENV_FILE set but not found: $($env:ESIGNER_ENV_FILE)" -ForegroundColor Yellow
  }
}

$required = 'ESIGNER_USERNAME', 'ESIGNER_PASSWORD', 'ESIGNER_CREDENTIAL_ID', 'ESIGNER_TOTP_SECRET'
$missing = $required | Where-Object { -not (Test-Path "env:$_") }

if ($missing.Count -gt 0) {
  Write-Host "[sign-windows] eSigner creds not set ($($missing -join ', ')) -- skipping signing for: $FilePath" -ForegroundColor Yellow
  Write-Host "[sign-windows] (artifact left UNSIGNED; set the env vars to produce a signed build)" -ForegroundColor Yellow
  exit 0
}

if (-not (Test-Path -LiteralPath $FilePath)) {
  Write-Error "[sign-windows] artifact not found: $FilePath"
  exit 1
}

# CodeSignTool validates by extension and rejects anything outside its supported set
# (e.g. the NSIS uninstaller's transient .tmp). Tauri asks us to sign those too, so skip
# the unsignable ones cleanly (exit 0) instead of erroring out the build log.
$signable = '.exe', '.dll', '.msi', '.cab', '.sys', '.ocx', '.msix', '.appx', '.msp', '.cat'
$ext = [System.IO.Path]::GetExtension($FilePath).ToLowerInvariant()
if ($signable -notcontains $ext) {
  Write-Host "[sign-windows] skipping unsignable file type '$ext': $FilePath" -ForegroundColor Yellow
  exit 0
}

# Locate the CodeSignTool install dir (it bundles its own JDK + jar). Prefer the folder
# of CODESIGNTOOL_PATH (the .bat), else CODE_SIGN_TOOL_PATH, else a PATH lookup.
$toolDir = $null
if ($env:CODESIGNTOOL_PATH)        { $toolDir = Split-Path -Parent $env:CODESIGNTOOL_PATH }
elseif ($env:CODE_SIGN_TOOL_PATH)  { $toolDir = $env:CODE_SIGN_TOOL_PATH }
else {
  $onPath = Get-Command CodeSignTool.bat -ErrorAction SilentlyContinue
  if ($onPath) { $toolDir = Split-Path -Parent $onPath.Source }
}
if (-not $toolDir -or -not (Test-Path -LiteralPath $toolDir)) {
  Write-Error "[sign-windows] could not locate CodeSignTool dir (set CODESIGNTOOL_PATH to the CodeSignTool.bat path)"
  exit 1
}

# Invoke the bundled Java + jar DIRECTLY (not via CodeSignTool.bat) so credentials —
# especially a password containing cmd-special chars (& | % ^ ") — reach the process
# verbatim with no cmd.exe interpretation. Run from $toolDir so the jar finds
# conf\code_sign_tool.properties.
$java = Get-ChildItem -LiteralPath $toolDir -Filter 'java.exe' -Recurse -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -match '\\jdk[-0-9._]*\\bin\\java\.exe$' } | Select-Object -First 1
if (-not $java) {
  $java = Get-ChildItem -LiteralPath $toolDir -Filter 'java.exe' -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
}
$jar = Get-ChildItem -LiteralPath (Join-Path $toolDir 'jar') -Filter 'code_sign_tool-*.jar' -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $java -or -not $jar) {
  Write-Error "[sign-windows] could not find bundled java.exe or code_sign_tool jar under $toolDir"
  exit 1
}

Write-Host "[sign-windows] signing $FilePath ..." -ForegroundColor Cyan

# `-override` signs the input file in place (Tauri expects %1 signed where it sits).
Push-Location -LiteralPath $toolDir
try {
  $output = & $java.FullName -jar $jar.FullName sign `
    "-username=$env:ESIGNER_USERNAME" `
    "-password=$env:ESIGNER_PASSWORD" `
    "-credential_id=$env:ESIGNER_CREDENTIAL_ID" `
    "-totp_secret=$env:ESIGNER_TOTP_SECRET" `
    "-input_file_path=$FilePath" `
    "-override=true" 2>&1 | Out-String
} finally {
  Pop-Location
}

Write-Host $output

# CodeSignTool can exit 0 even on an auth/sign failure, so also treat a printed "Error"
# as failure. (The harmless "WARNING: sun.reflect..." line is intentionally not matched.)
if ($LASTEXITCODE -ne 0 -or $output -match '(?im)^\s*Error\b') {
  Write-Error "[sign-windows] signing FAILED for $FilePath"
  exit 1
}

Write-Host "[sign-windows] signed OK: $FilePath" -ForegroundColor Green
