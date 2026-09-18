import { expect, test, describe } from '@jest/globals';
import reducer, { getIngredients } from '../slice';
import { TIngredient } from '@utils-types';

const ingredients: TIngredient[] = [
  {
    _id: '1',
    name: 'Булка',
    type: 'bun',
    proteins: 10,
    fat: 5,
    carbohydrates: 20,
    calories: 200,
    price: 100,
    image: 'image.jpg',
    image_mobile: 'image-mobile.jpg',
    image_large: 'image-large.jpg',
  }
];

describe('тест reducer slice ingredients', () => {
  test('несуществующий в приложении action', () => {
    const state = reducer(undefined, { type: 'UNKNOWN' });

    expect(state).toEqual({
      ingredients: [],
      isLoading: false,
      error: null
    });
  });

  test('getIngredients.pending', () => {
    const state = reducer(undefined, getIngredients.pending('request-id'));

    expect(state).toEqual({
      ingredients: [],
      isLoading: true,
      error: null
    });
  });

  test('getIngredients.fulfilled', () => {
    const state = reducer(
      undefined,
      getIngredients.fulfilled(ingredients, 'request-id')
    );

    expect(state).toEqual({
      ingredients,
      isLoading: false,
      error: null
    });
  });

  test('getIngredients.rejected', () => {
    const error = new Error('error');

    const state = reducer(
      undefined,
      getIngredients.rejected(error, 'request-id')
    );

    expect(state).toEqual({
      ingredients: [],
      isLoading: false,
      error: 'error'
    });
  });
});
