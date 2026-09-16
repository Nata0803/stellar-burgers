import { test, expect } from '@playwright/test';

test.describe('тестирование конструктора бургера', () => {
  test('добавление булки в конструктор', async ({ page }) => {
    await page.routeFromHAR('./tests/hars/ingredients.har', {
      url: '**/ingredients',
      update: false
    });

    await page.goto('/');

    const bun = page
      .locator('li')
      .filter({ hasText: 'Краторная булка N-200i' });

    await bun.getByRole('button', { name: 'Добавить' }).click();

    await expect(page.getByText('Краторная булка N-200i (верх)')).toBeVisible();

    await expect(page.getByText('Краторная булка N-200i (низ)')).toBeVisible();
  });

  test('добавление начинки в конструктор', async ({ page }) => {
    await page.routeFromHAR('./tests/hars/ingredients.har', {
      url: '**/ingredients',
      update: false
    });

    await page.goto('/');

    const ingredient = page.locator('li').filter({ hasText: 'Соус Spicy-X' });

    await ingredient.getByRole('button', { name: 'Добавить' }).click();

    await expect(
      page.getByText('Соус Spicy-X', { exact: true }).last()
    ).toBeVisible();
  });

  test('открытие модального окна ингредиента', async ({ page }) => {
    await page.routeFromHAR('./tests/hars/ingredients.har', {
      url: '**/ingredients',
      update: false
    });

    await page.goto('/');

    const ingredient = page
      .locator('li')
      .filter({ hasText: 'Соус Spicy-X' })
      .getByRole('link');

    await ingredient.click();

    await expect(page).toHaveURL(/\/ingredients/);

    await expect(
      page.getByRole('heading', { name: 'Детали ингредиента' })
    ).toBeVisible();

    await expect(
      page.getByRole('heading', { name: 'Соус Spicy-X' })
    ).toBeVisible();
  });

  test('закрытие модального окна по клику на крестик', async ({ page }) => {
    await page.routeFromHAR('./tests/hars/ingredients.har', {
      url: '**/ingredients',
      update: false
    });

    await page.goto('/');

    const ingredient = page
      .locator('li')
      .filter({ hasText: 'Соус Spicy-X' })
      .getByRole('link');

    await ingredient.click();

    const modalTitle = page.getByRole('heading', {
      name: 'Детали ингредиента'
    });

    await expect(modalTitle).toBeVisible();

    const modal = modalTitle.locator('xpath=ancestor::div[.//button][1]');

    await modal.getByRole('button').click();

    await expect(modalTitle).not.toBeVisible();
  });

  test('закрытие модального окна по клику на оверлей', async ({ page }) => {
    await page.routeFromHAR('./tests/hars/ingredients.har', {
      url: '**/ingredients',
      update: false
    });

    await page.goto('/');

    const ingredient = page
      .locator('li')
      .filter({ hasText: 'Соус Spicy-X' })
      .getByRole('link');

    await ingredient.click();

    const modalTitle = page.getByRole('heading', {
      name: 'Детали ингредиента'
    });

    await expect(modalTitle).toBeVisible();

    await page.mouse.click(10, 10);

    await expect(modalTitle).not.toBeVisible();
  });

  test('создание заказа', async ({ context, page }) => {
    await page.routeFromHAR('./tests/hars/ingredients.har', {
      url: '**/ingredients',
      update: false
    });

    await context.addCookies([
      {
        name: 'accessToken',
        value: 'fake-access-token',
        domain: 'localhost',
        path: '/'
      }
    ]);

    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'fake-refresh-token');
    });

    await page.route('**/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            email: 'test@example.com',
            name: 'Test User'
          }
        })
      });
    });

    await page.route('**/orders', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          name: 'Бургер',
          order: {
            _id: 'test-order-id',
            status: 'done',
            name: 'Бургер',
            owner: {
              name: 'Test User',
              email: 'test@example.com',
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: '2026-01-01T00:00:00.000Z'
            },
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
            number: 12345,
            price: 1000
          }
        })
      });
    });

    await page.goto('/');

    const bun = page
      .locator('li')
      .filter({ hasText: 'Краторная булка N-200i' });

    await bun.getByRole('button', { name: 'Добавить' }).click();

    const ingredient = page.locator('li').filter({ hasText: 'Соус Spicy-X' });

    await ingredient.getByRole('button', { name: 'Добавить' }).click();

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    await expect(page.getByText('12345')).toBeVisible();

    await expect(page.getByText('Выберите булки').first()).toBeVisible();

    await expect(page.getByText('Выберите начинку')).toBeVisible();

    const orderNumber = page.getByText('12345');

    const modal = orderNumber.locator('..').locator('..');

    await modal.getByRole('button').click();

    await expect(page.getByText('12345')).not.toBeVisible();
  });
});
