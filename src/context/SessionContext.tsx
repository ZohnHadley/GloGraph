import { createContext, useContext, useState } from 'react';

/**
 * Live Share session state, lifted ABOVE `SettingsProvider` so both the settings
 * layer and the editor can be session-aware. A guest runs the *same* base editor
 * (`AppInner`) as the host — its graph + settings just point at the remote host
 * instead of the local DB. (Host / solo = `null` or `role:'host'`.)
 */
export interface Session {
  role: 'host' | 'guest';
  name: string;
  address?: string;     // guest: the host's ip:port
  token?: string;       // join token
  access?: 'read-only' | 'editor';
  /** TLS cert fingerprint the guest pins / the host shares (Live Share over TLS). */
  fingerprint?: string;
  /** guest: the local loopback bridge base (http://127.0.0.1:<port>) that forwards
   *  to the host over pinned TLS. The guest's transport points here, not at the
   *  host directly — set once `start_guest_bridge` returns. */
  localBase?: string;
}

interface SessionCtx {
  session: Session | null;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
}

const Ctx = createContext<SessionCtx | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  return <Ctx.Provider value={{ session, setSession }}>{children}</Ctx.Provider>;
}

export function useSession(): SessionCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}

/** A guest's transport endpoints — the LOOPBACK bridge (`localBase`), which
 *  forwards to the host over pinned TLS. Null until the bridge is up (so the
 *  editor doesn't try to talk to the host until encryption is in place). */
export function guestEndpoints(session: Session | null): { base: string; ws: string; token: string } | null {
  if (session?.role !== 'guest' || !session.localBase || !session.token) return null;
  const base = session.localBase.trim().replace(/\/+$/, '');
  const token = session.token;
  const wsBase = base.replace(/^http/, 'ws'); // http://127.0.0.1:p → ws://127.0.0.1:p
  return { base, ws: `${wsBase}/ws?token=${encodeURIComponent(token)}`, token };
}
