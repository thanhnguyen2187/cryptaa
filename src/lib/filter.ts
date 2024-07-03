export type FilterSortOption =
  | "title-a-z"
  | "title-z-a"
  | "date-created-earliest-latest"
  | "date-created-latest-earliest"
  | "date-updated-earliest-latest"
  | "date-updated-latest-earliest";

export type FilterData = {
  limit: number;
  keyword: string;
  tagsInclude: Set<string>;
  tagsExclude: Set<string>;
  sortBy: FilterSortOption;
};

export const filterDataKey = "cryptaa.filterData";

export function readFilterData(): FilterData {
  const filterDataRaw = JSON.parse(
    localStorage.getItem(filterDataKey) ??
      `{"limit": 10, "keyword": "", "tagsInclude": [], "tagsExclude": [], "sortBy": "date-created-earliest-latest"}`,
  );
  const filterData: FilterData = {
    ...filterDataRaw,
    tagsInclude: new Set(filterDataRaw.tagsInclude),
    tagsExclude: new Set(filterDataRaw.tagsExclude),
  };
  return filterData;
}

export function writeFilterData(data: FilterData) {
  const filterDataRaw = {
    ...data,
    tagsInclude: Array.from(data.tagsInclude.keys()),
    tagsExclude: Array.from(data.tagsExclude.keys()),
  };
  localStorage.setItem(filterDataKey, JSON.stringify(filterDataRaw));
}
