// Utility: parses pagination query values and returns safe page/limit numbers.

function parsePagination(query, defaults = { page: 1, limit: 10, maxLimit: 100 }) {
  const rawPage = Number(query.page);
  const rawLimit = Number(query.limit);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : defaults.page;
  const limitCandidate =
    Number.isFinite(rawLimit) && rawLimit > 0 ? Math.floor(rawLimit) : defaults.limit;
  const limit = Math.min(limitCandidate, defaults.maxLimit);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

module.exports = {
  parsePagination
};


