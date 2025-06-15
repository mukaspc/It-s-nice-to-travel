import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
  });

  test('should display login form correctly', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.gotoLogin();
    
    await expect(page).toHaveTitle(/Login/);
    expect(await loginPage.isLoginFormVisible()).toBeTruthy();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.gotoLogin();
    await loginPage.login('invalid@email.com', 'wrongpassword');
    
    // Wait for error message to appear
    await expect(loginPage.errorMessage).toBeVisible();
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toBeTruthy();
  });

  test('should navigate to register page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.gotoLogin();
    await loginPage.clickRegisterLink();
    
    await expect(page).toHaveURL(/register/);
  });

  test('should navigate to forgot password page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.gotoLogin();
    await loginPage.clickForgotPassword();
    
    await expect(page).toHaveURL(/reset-password/);
  });

  test('should take screenshot on successful login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.gotoLogin();
    
    // Take screenshot of login page
    await expect(page).toHaveScreenshot('login-page.png');
  });
}); 