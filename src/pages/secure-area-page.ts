import type { Locator, Page } from "@playwright/test";
import { BasePage } from "@/pages/base-page";

export class SecureAreaPage extends BasePage {
  readonly heading: Locator;
  readonly successFlash: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: "Secure Area", exact: true });
    this.successFlash = page.locator("#flash.success");
    this.logoutButton = page.getByRole("link", { name: /logout/i });
  }
}
