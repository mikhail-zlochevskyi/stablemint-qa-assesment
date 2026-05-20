import { expect, test } from "@playwright/test";
import { env } from "@/config/env";
import { LoginPage } from "@/pages/login-page";
import { SecureAreaPage } from "@/pages/secure-area-page";

test("user logs into the secure area with valid credentials", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const secureAreaPage = new SecureAreaPage(page);

  await loginPage.goto();
  await loginPage.loginAs(env.TEST_USERNAME, env.TEST_PASSWORD);

  await expect(secureAreaPage.heading).toBeVisible();
  await expect(secureAreaPage.successFlash).toContainText(
    /logged into a secure area/i,
  );
  await expect(secureAreaPage.logoutButton).toBeVisible();
});
