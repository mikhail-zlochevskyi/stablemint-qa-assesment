import type { Locator, Page } from "@playwright/test";

export class LoginPage {
  readonly heading: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly successFlash: Locator;
  readonly errorFlash: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole("heading", { name: "Login Page", exact: true });
    this.usernameInput = page.getByLabel("Username");
    this.passwordInput = page.getByLabel("Password");
    this.submitButton = page.getByRole("button", { name: /login/i });
    this.successFlash = page.locator("#flash.success");
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
