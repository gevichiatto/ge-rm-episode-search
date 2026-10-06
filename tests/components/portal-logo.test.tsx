// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PortalLogo } from "@/components/portal-logo";

describe("PortalLogo", () => {
  it("é decorativo e aceita className", () => {
    const { container } = render(<PortalLogo className="size-16" />);
    const svg = container.querySelector("svg");

    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveClass("size-16");
  });
});
