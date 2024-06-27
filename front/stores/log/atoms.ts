import { atom } from 'jotai';
import { PostLogAPI } from './apis';
import { PostLogParams } from './types';
import { userDataAtom } from '../auth/atoms';

export const productGroupAtom = atom<String | null>(null);

export const setProductGroupAtom = atom(null, async (get, set, group: String) => {
  set(productGroupAtom, group);
});

export const sendLogAtom = atom(null, async (get, set, { product, action, metaData }) => {
  const productId = product.id ? parseInt(product.id) : undefined;
  const group = get(productGroupAtom);
  const userData = await get(userDataAtom);
  PostLogAPI({ userId: userData?._id , product: { ...product, id: productId, group } , action, metaData } as PostLogParams);
});