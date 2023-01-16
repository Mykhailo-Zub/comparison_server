import levenshtein from "js-levenshtein";
import getStoreResults from "./serpApiHandler.js";

// let lowerPrice = Infinity;
// let biggestPrice = 0;
// let ebayLowerPriceResults;
// let ebayBiggestPriceResults;
// filteredEbayResults.forEach((result) => {
//   const { price } = result;
//   const extractedPrice = price.extracted;
//   if (extractedPrice < lowerPrice) {
//     lowerPrice = extractedPrice;
//     ebayLowerPriceResults = result;
//   }
//   if (extractedPrice > biggestPrice) {
//     biggestPrice = extractedPrice;
//     ebayBiggestPriceResults = result;
//   }
// });

const ebayFiltering = (query, accuracy, results) => {
  return results
    .filter((result) => {
      const { title, condition, price } = result;
      const extractedPrice = price?.extracted;
      if (100 - levenshtein(query, title) >= accuracy && condition === "Brand New" && extractedPrice) {
        return true;
      } else return false;
    })
    ?.sort((a, b) => {
      if (a.price.extracted > b.price.extracted) return 1;
      else return -1;
    });
};

const walmartFiltering = (query, accuracy, results) => {
  return results
    .filter((result) => {
      const { title, primary_offer } = result;
      const extractedPrice = primary_offer.offer_price || primary_offer.min_price;
      if (100 - levenshtein(query, title) >= accuracy && extractedPrice) {
        return true;
      } else return false;
    })
    ?.sort((a, b) => {
      const extractedPriceA = a.primary_offer.offer_price || a.primary_offer.min_price;
      const extractedPriceB = b.primary_offer.offer_price || b.primary_offer.min_price;
      if (extractedPriceA > extractedPriceB) return 1;
      else return -1;
    });
};

export const getResultsToChoose = async (req, res) => {
  const { targetStore, query, accuracy } = req.body;
  let results;
  if (targetStore === "ebay") {
    const ebayResults = await getStoreResults(targetStore, query);
    results = ebayFiltering(query, accuracy, ebayResults);
  } else {
    const walmartResults = await getStoreResults(targetStore, query);
    results = walmartFiltering(query, accuracy, walmartResults);
  }
  res.status(200).json({ filteredResults: results });
};

export const buildComparisonTable = async (req, res) => {
  const { targetStore, selectedResults, accuracy } = req.body;
  let comparisonResults = [];
  for (const result of selectedResults) {
    const { title } = result;
    if (targetStore === "ebay") {
      const walmartResults = await getStoreResults("walmart", title);
      comparisonResults.push({ product: result, comparison: walmartFiltering(title, accuracy, walmartResults) });
    } else {
      const ebayResults = await getStoreResults("ebay", title);
      comparisonResults.push({ product: result, comparison: ebayFiltering(title, accuracy, ebayResults) });
    }
  }
  res.status(200).json({ comparisonResults });
};
