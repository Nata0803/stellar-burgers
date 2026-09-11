import { combineReducers } from '@reduxjs/toolkit';
import ingredientsReducer from './slice';
import burgerConstructorReducer from './burger-constructor-slice';
import feedReducer from './feed-slice';
import ordersReducer from './profile-orders-slice';
import authReducer from './auth-slice';

export const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  burgerConstructor: burgerConstructorReducer,
  feed: feedReducer,
  orders: ordersReducer,
  auth: authReducer
});
