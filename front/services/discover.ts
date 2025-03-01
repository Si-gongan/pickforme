import { useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { client } from "./axios";

import { IDicoverMainProducts } from "@types";

const CATEGORIES = [
  "1001",
  "1002",
  "1010",
  "1011",
  "1012",
  "1013",
  "1014",
  "1015",
  "1016",
  "1017",
  "1018",
  "1019",
  "1020",
  "1021",
  "1024",
  "1025",
  "1026",
  "1029",
  "1030",
];

export function useServiceMainProducts() {
  /**
   * 카테고리별 베스트 (랜덩) + 오늘의 특가 상품 (스페셜)
   */
  const categoryId = useMemo(function () {
    return CATEGORIES[Math.floor(CATEGORIES.length * Math.random())];
  }, []);

  const { data } = useQuery<IDicoverMainProducts>({
    queryKey: ["fetchMainProducs", categoryId],
    queryFn: async function ({ signal }) {
      const response = await client.get<IDicoverMainProducts>(
        `/discover/products/${categoryId}`,
        {
          signal,
        }
      );
      if (response.status === 200) {
        return response.data;
      }
      throw new Error("FAIL_FETCH_MAIN_PRODUCTS");
    },
    enabled: !!categoryId,
    initialData: {
      special: [],
      random: [],
      local: [],
    },
    gcTime: 60 * 5,
  });

  return { data };
}
