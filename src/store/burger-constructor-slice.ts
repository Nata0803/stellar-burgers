import {
  createAsyncThunk,
  createSlice,
  nanoid,
  PayloadAction
} from '@reduxjs/toolkit';
import { TIngredient, TOrder } from '@utils-types';
import { orderBurgerApi } from '@api';

type TConstructorIngredient = TIngredient & {
  id: string;
};

type BurgerConstructorState = {
  bun: TIngredient | null;
  ingredients: TConstructorIngredient[];
  orderRequest: boolean;
  orderModalData: TOrder | null;
  ingredientDetails: TIngredient | null;
  error: string | null;
};

const initialState: BurgerConstructorState = {
  bun: null,
  ingredients: [],
  orderRequest: false,
  orderModalData: null,
  ingredientDetails: null,
  error: null
};

export const orderBurger = createAsyncThunk(
  'burgerConstructor/orderBurger',
  async (ingredients: TIngredient[]) => {
    const ingredientIds = ingredients.map((ingredient) => ingredient._id);

    return await orderBurgerApi(ingredientIds);
  }
);

const burgerSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    addBun: (state, action: PayloadAction<TIngredient>) => {
      state.bun = action.payload;
    },

    addIngredient: {
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        state.ingredients.push(action.payload);
      },
      prepare: (ingredient: TIngredient) => ({
        payload: {
          ...ingredient,
          id: nanoid()
        }
      })
    },

    removeIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter(
        (ingredient) => ingredient.id !== action.payload
      );
    },

    moveIngredientUp: (state, action: PayloadAction<number>) => {
      const index = action.payload;

      if (index > 0) {
        [state.ingredients[index - 1], state.ingredients[index]] = [
          state.ingredients[index],
          state.ingredients[index - 1]
        ];
      }
    },

    moveIngredientDown: (state, action: PayloadAction<number>) => {
      const index = action.payload;

      if (index < state.ingredients.length - 1) {
        [state.ingredients[index], state.ingredients[index + 1]] = [
          state.ingredients[index + 1],
          state.ingredients[index]
        ];
      }
    },

    clearConstructor: (state) => {
      state.bun = null;
      state.ingredients = [];
    },

    openIngredientDetails: (state, action: PayloadAction<TIngredient>) => {
      state.ingredientDetails = action.payload;
    },

    closeIngredientDetails: (state) => {
      state.ingredientDetails = null;
    },

    closeOrderModal: (state) => {
      state.orderModalData = null;
    }
  },

  extraReducers: (builder) => {
    builder.addCase(orderBurger.pending, (state) => {
      state.orderRequest = true;
      state.error = null;
    });

    builder.addCase(orderBurger.fulfilled, (state, action) => {
      state.orderRequest = false;

      state.orderModalData = {
        ...action.payload.order,
        ingredients: state.ingredients.map((ingredient) => ingredient._id)
      };

      state.bun = null;
      state.ingredients = [];
    });

    builder.addCase(orderBurger.rejected, (state, action) => {
      state.orderRequest = false;
      state.error = action.error.message || 'Не удалось оформить заказ';
    });
  }
});

export const {
  addBun,
  addIngredient,
  removeIngredient,
  clearConstructor,
  closeOrderModal,
  openIngredientDetails,
  closeIngredientDetails,
  moveIngredientUp,
  moveIngredientDown
} = burgerSlice.actions;

export default burgerSlice.reducer;
