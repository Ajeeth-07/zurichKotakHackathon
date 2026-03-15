const express = require("express");
const {
  getSummary,
  getCustomers,
  getCustomerDetails,
} = require("../services/dashboardService");

const router = express.Router();

router.get("/summary", (_req, res) => {
  res.json(getSummary());
});

router.get("/customers", (req, res) => {
  res.json(getCustomers(req.query));
});

router.get("/customers/:id", (req, res) => {
  const customer = getCustomerDetails(req.params.id);

  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  return res.json(customer);
});

module.exports = router;
