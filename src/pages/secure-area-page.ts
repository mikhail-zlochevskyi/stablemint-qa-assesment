import type { Locator, Page } from "@playwright/test";

export class SecureAreaPage {
  readonly heading: Locator;
  readonly successFlash: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.heading = page.getByRole("heading", { name: "Secure Area", exact: true });
    this.successFlash = page.locator("#flash.success");
    this.logoutButton = page.getByRole("link", { name: /logout/i });
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
