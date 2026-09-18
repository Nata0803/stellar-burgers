import { expect, test, describe } from '@jest/globals';
import reducer, {
  addBun,
  addIngredient,
  removeIngredient,
  clearConstructor,
  moveIngredientUp,
  moveIngredientDown,
  openIngredientDetails,
  closeIngredientDetails,
  closeOrderModal,
  orderBurger
} from '../burger-constructor-slice';
import { TIngredient } from '@utils-types';
import { TOrder } from '@utils-types';

const bun: TIngredient = {
  _id: '1',
  name: 'Булка',
  type: 'bun',
  proteins: 10,
  fat: 5,
  carbohydrates: 20,
  calories: 200,
  price: 100,
  image: 'bun.jpg',
  image_mobile: 'bun-mobile.jpg',
  image_large: 'bun-large.jpg',
};

const ingredient: TIngredient = {
  _id: '2',
  name: 'Котлета',
  type: 'main',
  proteins: 20,
  fat: 10,
  carbohydrates: 15,
  calories: 250,
  price: 200,
  image: 'ingredient.jpg',
  image_mobile: 'ingredient-mobile.jpg',
  image_large: 'ingredient-large.jpg',
};

describe('тесты reducer burgerConstructor', () => {
  test('состояние для неизвестного action', () => {
    const state = reducer(undefined, { type: 'UNKNOWN' });

    expect(state).toEqual({
      bun: null,
      ingredients: [],
      orderRequest: false,
      orderModalData: null,
      ingredientDetails: null,
      error: null
    });
  });

  test('добавление булки', () => {
    const state = reducer(undefined, addBun(bun));

    expect(state.bun).toEqual(bun);
  });

  test('добавление начинки', () => {
    const state = reducer(undefined, addIngredient(ingredient));

    expect(state.ingredients).toHaveLength(1);
    expect(state.ingredients[0]).toMatchObject(ingredient);
    expect(state.ingredients[0].id).toEqual(expect.any(String));
  });

  test('удаление начинки', () => {
    const stateWithIngredient = reducer(undefined, addIngredient(ingredient));

    const ingredientId = stateWithIngredient.ingredients[0].id;

    const state = reducer(stateWithIngredient, removeIngredient(ingredientId));

    expect(state.ingredients).toEqual([]);
  });

  test('перемещение ингредиента вверх', () => {
    const secondIngredient: TIngredient = {
      ...ingredient,
      _id: '3',
      name: 'Соус'
    };

    let state = reducer(undefined, addIngredient(ingredient));
    state = reducer(state, addIngredient(secondIngredient));

    state = reducer(state, moveIngredientUp(1));

    expect(state.ingredients[0]._id).toBe('3');
    expect(state.ingredients[1]._id).toBe('2');
  });

  test('перемещение ингредиента вниз', () => {
    const firstIngredient: TIngredient = {
      ...ingredient,
      _id: '3',
      name: 'Соус'
    };

    let state = reducer(undefined, addIngredient(ingredient));
    state = reducer(state, addIngredient(firstIngredient));

    state = reducer(state, moveIngredientDown(0));

    expect(state.ingredients[0]._id).toBe('3');
    expect(state.ingredients[1]._id).toBe('2');
  });

  test('очистка конструктора', () => {
    let state = reducer(undefined, addBun(bun));
    state = reducer(state, addIngredient(ingredient));

    state = reducer(state, clearConstructor());

    expect(state.bun).toBeNull();
    expect(state.ingredients).toEqual([]);
  });

  test('открытие деталей ингредиента', () => {
    const state = reducer(undefined, openIngredientDetails(ingredient));

    expect(state.ingredientDetails).toEqual(ingredient);
  });

  test('закрытие деталей ингредиента', () => {
    const stateWithDetails = reducer(
      undefined,
      openIngredientDetails(ingredient)
    );

    const state = reducer(stateWithDetails, closeIngredientDetails());

    expect(state.ingredientDetails).toBeNull();
  });

  test('закрытие модального окна заказа', () => {
    const state = reducer(
      {
        bun: null,
        ingredients: [],
        orderRequest: false,
        orderModalData: {
          _id: 'order-id',
          status: 'done',
          name: 'Бургер',
          createdAt: '2026-09-16T12:00:00.000Z',
          updatedAt: '2026-09-16T12:00:00.000Z',
          number: 12345,
          ingredients: []
        },
        ingredientDetails: null,
        error: null
      },
      closeOrderModal()
    );

    expect(state.orderModalData).toBeNull();
  });

  test('orderBurger.pending', () => {
    const state = reducer(
      undefined,
      orderBurger.pending('request-id', [ingredient])
    );

    expect(state.orderRequest).toBe(true);
    expect(state.error).toBeNull();
  });

  test('orderBurger.fulfilled', () => {
    const order = {
      _id: 'order-id',
      status: 'done',
      name: 'Бургер',
      owner: {
        name: 'User',
        email: 'user@example.com',
        createdAt: '2026-09-16T12:00:00.000Z',
        updatedAt: '2026-09-16T12:00:00.000Z'
      },
      createdAt: '2026-09-16T12:00:00.000Z',
      updatedAt: '2026-09-16T12:00:00.000Z',
      number: 12345,
      price: 500
    };

    const stateWithBun = reducer(
      reducer(undefined, addBun(bun)),
      addIngredient(ingredient)
    );

    const state = reducer(
      stateWithBun,
      orderBurger.fulfilled(
        {
          success: true,
          order,
          name: 'Бургер'
        },
        'request-id',
        [ingredient]
      )
    );

    expect(state.orderRequest).toBe(false);
    expect(state.orderModalData).toEqual({
      ...order,
      ingredients: ['2']
    });
    expect(state.bun).toBeNull();
    expect(state.ingredients).toEqual([]);
  });

  test('orderBurger.rejected', () => {
    const error = new Error('error');

    const state = reducer(
      undefined,
      orderBurger.rejected(error, 'request-id', [ingredient])
    );

    expect(state.orderRequest).toBe(false);
    expect(state.error).toBe('error');
  });
});
