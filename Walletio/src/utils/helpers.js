/**
 * Format a number as Vietnamese currency (₫)
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount = 0) => {
  return `${Number(amount).toLocaleString("vi-VN")} ₫`;
};

/**
 * Format a date string or Date object to "dd/MM/yyyy"
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  const dd   = String(d.getDate()).padStart(2, "0");
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

/**
 * Capitalize first letter of a string
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str = "") =>
  str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Get initials from a full name (max 2 chars)
 * @param {string} name
 * @returns {string}
 */
export const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
