import type { Locator, Page } from "@playwright/test";
import { BasePage } from "@/pages/base-page";

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorFlash: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByLabel("Username");
    this.passwordInput = page.getByLabel("Password");
    this.submitButton = page.getByRole("button", { name: /login/i });
    this.errorFlash = page.locator("#flash.error");
  }

  async goto(): Promise<void> {
    await this.page.goto("/login");
  }

  async loginAs(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
