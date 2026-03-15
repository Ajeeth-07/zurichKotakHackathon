function formatCurrencyINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function paginate(items, page, limit) {
  const parsedPage = Math.max(1, Number(page) || 1);
  const parsedLimit = Math.max(1, Math.min(100, Number(limit) || 20));
  const start = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    total: items.length,
    pages: Math.max(1, Math.ceil(items.length / parsedLimit)),
    data: items.slice(start, start + parsedLimit),
  };
}

module.exports = {
  formatCurrencyINR,
  paginate,
};
