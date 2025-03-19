import { atom } from 'jotai';
import { Product } from '../product/types';
import { Request, RequestParams } from './types';
import { PostRequestAPI, GetRequestsAPI } from './apis';
import { userDataAtom } from '../auth/atoms';
import { Alert } from 'react-native';


export const requestsAtom = atom<Request[]>([]);

export const addRequestAtom = atom(null, async (get, set, request: RequestParams) => {
 
  const userData = await get(userDataAtom);
  if (!userData){
    return;
  }
  console.log('userData.point::',userData.point);

  if (userData.point < 1) { // 구독
    Alert.alert('매니저 질문 갯수를 모두 소모하였어요.');
    return;
  }
  Alert.alert('매니저 질문이 등록되었습니다.');

  const { data } = await PostRequestAPI(request);
  if (!data) {
    return;
  }
  set(requestsAtom, get(requestsAtom).concat([data]));
  
  set(userDataAtom, { ...userData, point: userData.point - 1 }); // 1픽 사용
});

export const getRequestsAtom = atom(null, async (get, set) => {
  const { data } = await GetRequestsAPI({});
  let requests  = <Request[]>[];
  // 2.0 request (recommend, research) -> 3.0 request (question) 포맷으로 통일
  data.forEach((request) => {
    if (request.type === 'RECOMMEND' || request.type === 'RESEARCH') {
      const requests_ = request.answer?.products.map((product) => {
        return {
          ...request,
          product: {
            name: product.title,
            url: product.url,
            price: product.price,
          } as Product,
          answer: {
            text: request.answer?.text + '\n' + product.desc,
            products: [],
          },
        } as Request;
      });
      if (requests_) {
        requests.push(...requests_);
      } else {
        if (!request.name || !request.link) {
          return;
        }
        const request_ = {
          ...request,
          product: {
            name: request.name,
            url: request.link,
          } as Product
        } as Request;
        requests.push(request_);
      }
    } else if (request.type === 'QUESTION') {
      requests.push(request);
    }
  });
  set(requestsAtom, requests);
});

export const requestBottomSheetAtom = atom<Product | void>(undefined);



