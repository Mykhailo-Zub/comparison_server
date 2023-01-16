import dotenv from "dotenv";
import { config, getJson } from "serpapi";

dotenv.config();
config.api_key = process.env.API_KEY;

const getParams = (store, query) => {
  switch (store) {
    case "ebay":
      return {
        _nkw: query,
      };
    case "walmart":
      return {
        query,
      };
    default:
      break;
  }
};

const getStoreResults = async (store, query) => {
  const params = getParams(store, query);
  const results = await getJson(store, params);
  return results.organic_results;
};

export default getStoreResults;
