import { expect, test } from "@playwright/test";
import { env } from "@/config/env";
import { LoginPage } from "@/pages/login-page";
import { SecureAreaPage } from "@/pages/secure-area-page";

test("user can log in and log out of the secure area", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const secureAreaPage = new SecureAreaPage(page);

  await loginPage.goto();
  await loginPage.loginAs(env.TEST_USERNAME, env.TEST_PASSWORD);

  await expect(secureAreaPage.heading).toBeVisible();
  await expect(secureAreaPage.successFlash).toContainText(
    /logged into a secure area/i,
  );
  await expect(secureAreaPage.logoutButton).toBeVisible();

  await secureAreaPage.logout();

  await expect(page).toHaveURL(/\/login$/);
  await expect(loginPage.heading).toBeVisible();
  await expect(loginPage.successFlash).toContainText(/logged out of the secure area/i);
});
