import { useInfiniteQuery } from "@tanstack/react-query";
import { RITUAL_CONTRACT_ID, ritualQueryKey } from "@/constants/ritual";
import { readRitualEventPage } from "@/services/ritual-event-service";

export function useRitualEvents() {
  const query = useInfiniteQuery({
    queryKey: [...ritualQueryKey, "events"],
    queryFn: ({ pageParam }) => readRitualEventPage(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextPage ?? undefined,
    enabled: Boolean(RITUAL_CONTRACT_ID),
    staleTime: 20_000,
    refetchInterval: 45_000,
  });
  return {
    events: query.data?.pages.flatMap((page) => page.events) ?? [],
    error: query.error?.message ?? null,
    loading: query.isPending && query.isFetching,
    loadingMore: query.isFetchingNextPage,
    hasMore: Boolean(query.hasNextPage),
    loadMore: () => query.fetchNextPage(),
  };
}
