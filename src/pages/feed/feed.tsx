import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { FC, useEffect } from 'react';

import { useDispatch, useSelector } from '../../services/store';
import {
  getFeeds,
  selectFeedError,
  selectFeedLoading,
  selectFeedOrders
} from '../../store/feed-slice';

export const Feed: FC = () => {
  const dispatch = useDispatch();

  const orders = useSelector(selectFeedOrders);
  const isLoading = useSelector(selectFeedLoading);
  const error = useSelector(selectFeedError);

  useEffect(() => {
    dispatch(getFeeds());
  }, [dispatch]);

  if (error) {
    return <p>error: {error}</p>;
  }

  if (isLoading) {
    return <Preloader />;
  }

  return <FeedUI orders={orders} handleGetFeeds={() => dispatch(getFeeds())} />;
};
