const customers = require("../../../demo_customers");

function getAllCustomers() {
  return customers;
}

function getCustomerById(id) {
  return customers.find((customer) => customer.id === Number(id));
}

module.exports = {
  getAllCustomers,
  getCustomerById,
};
