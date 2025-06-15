import type { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string = '/') {
    await this.page.goto(path);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `tests/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  // Common utility methods
  async clickElement(selector: string) {
    await this.page.click(selector);
  }

  async fillInput(selector: string, value: string) {
    await this.page.fill(selector, value);
  }

  async getElementText(selector: string): Promise<string> {
    return await this.page.textContent(selector) || '';
  }

  async isElementVisible(selector: string): Promise<boolean> {
    return await this.page.isVisible(selector);
  }

  async waitForElement(selector: string, timeout: number = 10000) {
    await this.page.waitForSelector(selector, { timeout });
  }
} 