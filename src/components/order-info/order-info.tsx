import { FC, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { TIngredient } from '@utils-types';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { useDispatch, useSelector } from '../../services/store';
import { selectIngredients } from '../../store/slice';
import {
  getOrderByNumber,
  selectFeedOrders,
  selectOrderByNumber,
  selectOrderLoading
} from '../../store/feed-slice';
import { selectProfileOrders } from '../../store/profile-orders-slice';

export const OrderInfo: FC = () => {
  const { number } = useParams();
  const dispatch = useDispatch();

  const ingredients = useSelector(selectIngredients);
  const feedOrders = useSelector(selectFeedOrders);
  const profileOrders = useSelector(selectProfileOrders);
  const orderByNumber = useSelector(selectOrderByNumber);
  const isOrderLoading = useSelector(selectOrderLoading);

  const orderData =
    feedOrders.find((order) => order.number === Number(number)) ||
    profileOrders.find((order) => order.number === Number(number)) ||
    orderByNumber;

  useEffect(() => {
    if (!orderData && number) {
      dispatch(getOrderByNumber(Number(number)));
    }
  }, [dispatch, orderData, number]);

  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) {
      return null;
    }

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item: string) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);

          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  if (isOrderLoading || !orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
