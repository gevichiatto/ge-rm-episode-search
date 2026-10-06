import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy } from "@/lib/security/csp";

describe("buildContentSecurityPolicy", () => {
  const csp = buildContentSecurityPolicy("abc123", false);

  it("inclui o nonce em script-src e style-src", () => {
    expect(csp).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic'");
    expect(csp).toContain("style-src 'self' 'nonce-abc123'");
  });

  it("bloqueia frames, plugins e base-uri externos", () => {
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
  });

  it("não permite unsafe-eval nem unsafe-inline em scripts em produção", () => {
    const script = csp.split("; ").find((d) => d.startsWith("script-src"));

    expect(script).not.toContain("unsafe-eval");
    expect(script).not.toContain("unsafe-inline");
  });

  it("permite unsafe-eval só em desenvolvimento", () => {
    expect(buildContentSecurityPolicy("n", true)).toContain("'unsafe-eval'");
  });

  it("em produção o style-src exige nonce; em dev libera inline", () => {
    expect(csp).not.toMatch(/style-src 'self' 'unsafe-inline'/);
    expect(buildContentSecurityPolicy("n", true)).toContain("style-src 'self' 'unsafe-inline'");
  });

  it("não usa upgrade-insecure-requests", () => {
    expect(csp).not.toContain("upgrade-insecure-requests");
  });
});
