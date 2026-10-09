import { useSettings } from '../context/SettingsContext';

/**
 * Small canvas-corner indicator shown while the embedded HTTP API is enabled,
 * so the operator always knows the workstation is reachable over localhost.
 * Renders nothing when the API is off.
 */
export default function ApiStatusBadge() {
  const { apiEnabled } = useSettings();
  if (!apiEnabled) return null;
  return (
    <div className="api-status-badge" title="HTTP API enabled — listening on 127.0.0.1:57321">
      <span className="api-status-badge__dot" />
      API
    </div>
  );
}
