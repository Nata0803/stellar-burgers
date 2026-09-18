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

    const constructor = page.locator('section').filter({
      has: page.getByRole('button', { name: 'Оформить заказ' })
    });

    await expect(
      constructor.getByText('Краторная булка N-200i (верх)')
    ).toBeVisible();

    await expect(
      constructor.getByText('Краторная булка N-200i (низ)')
    ).toBeVisible();
  });

  test('добавление начинки в конструктор', async ({ page }) => {
    await page.routeFromHAR('./tests/hars/ingredients.har', {
      url: '**/ingredients',

      update: false
    });

    await page.goto('/');

    const ingredient = page.locator('li').filter({ hasText: 'Соус Spicy-X' });

    await ingredient.getByRole('button', { name: 'Добавить' }).click();

    const constructor = page.locator('section').filter({
      has: page.getByRole('button', { name: 'Оформить заказ' })
    });

    await expect(
      constructor.getByText('Соус Spicy-X', { exact: true })
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

    const modal = page.locator('#modals');

    await expect(
      modal
        .getByRole('heading', {
          name: 'Детали ингредиента'
        })
        .last()
    ).toBeVisible();

    await expect(
      modal.getByRole('heading', {
        name: 'Соус Spicy-X'
      })
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

    const modal = page.locator('#modals');

    const modalTitle = modal
      .getByRole('heading', {
        name: 'Детали ингредиента'
      })
      .last();

    await expect(modalTitle).toBeVisible();

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

    const modal = page.locator('#modals');

    const modalTitle = modal
      .getByRole('heading', {
        name: 'Детали ингредиента'
      })
      .last();

    await expect(modalTitle).toBeVisible();

    await page.mouse.click(10, 10);

    await expect(modalTitle).not.toBeVisible();
  });

  test('создание заказа', async ({ context, page }) => {
    await page.routeFromHAR('./tests/hars/ingredients.har', {
      url: '**/ingredients',
      update: false
    });

    await page.routeFromHAR('./tests/hars/auth.har', {
      url: '**/auth/user',
      update: false
    });

    await page.routeFromHAR('./tests/hars/orders.har', {
      url: '**/orders',
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

    await page.goto('/');

    const bun = page
      .locator('li')
      .filter({ hasText: 'Краторная булка N-200i' });

    await bun.getByRole('button', { name: 'Добавить' }).click();

    const ingredient = page.locator('li').filter({ hasText: 'Соус Spicy-X' });

    await ingredient.getByRole('button', { name: 'Добавить' }).click();

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    const orderModal = page.locator('#modals');

    const orderNumber = orderModal.getByText(/^\d+$/).last();

    await expect(orderNumber).toBeVisible();

    await orderModal.getByRole('button').click();

    await expect(orderModal).not.toBeVisible();

    const constructor = page.locator('section').filter({
      has: page.getByRole('button', { name: 'Оформить заказ' })
    });

    await expect(constructor.getByText('Выберите булки').first()).toBeVisible();

    await expect(constructor.getByText('Выберите начинку')).toBeVisible();
  });
});
