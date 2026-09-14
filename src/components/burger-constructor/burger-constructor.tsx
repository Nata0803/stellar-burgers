import { FC, useMemo } from 'react';
import { TConstructorIngredient } from '@utils-types';
import { BurgerConstructorUI } from '@ui';
import { useDispatch, useSelector } from '../../services/store';
import {
  orderBurger,
  closeOrderModal
} from '../../store/burger-constructor-slice';
import { useNavigate } from 'react-router-dom';

export const BurgerConstructor: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const constructorItems = useSelector((state) => state.burgerConstructor);

  const orderRequest = useSelector(
    (state) => state.burgerConstructor.orderRequest
  );

  const orderModalData = useSelector(
    (state) => state.burgerConstructor.orderModalData
  );

  const user = useSelector((state) => state.auth.user);

  const onOrderClick = () => {
    if (!user) {
      navigate('/login', {
        state: {
          from: '/'
        }
      });
      return;
    }

    if (!constructorItems.bun || orderRequest) return;

    dispatch(
      orderBurger([
        constructorItems.bun,
        ...constructorItems.ingredients,
        constructorItems.bun
      ])
    );
  };

  const handleCloseOrderModal = () => {
    dispatch(closeOrderModal());
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (sum, ingredient) => sum + ingredient.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={handleCloseOrderModal}
    />
  );
};
