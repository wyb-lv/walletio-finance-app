/**
 * Validate that an amount is a positive number
 * @param {string|number} value
 * @returns {{ valid: boolean, message: string }}
 */
export const validateAmount = (value) => {
  const num = Number(value);
  if (!value && value !== 0) return { valid: false, message: "Vui lòng nhập số tiền." };
  if (isNaN(num))            return { valid: false, message: "Số tiền không hợp lệ." };
  if (num <= 0)              return { valid: false, message: "Số tiền phải lớn hơn 0." };
  return { valid: true, message: "" };
};

/**
 * Validate wallet name
 * @param {string} name
 * @returns {{ valid: boolean, message: string }}
 */
export const validateWalletName = (name = "") => {
  if (!name.trim()) return { valid: false, message: "Tên ví không được để trống." };
  if (name.trim().length < 2) return { valid: false, message: "Tên ví phải có ít nhất 2 ký tự." };
  return { valid: true, message: "" };
};

/**
 * Validate login fields
 * @param {string} username
 * @param {string} password
 * @returns {{ valid: boolean, message: string }}
 */
export const validateLogin = (username, password) => {
  if (!username?.trim()) return { valid: false, message: "Vui lòng nhập tên đăng nhập." };
  if (!password?.trim()) return { valid: false, message: "Vui lòng nhập mật khẩu." };
  if (password.length < 6) return { valid: false, message: "Mật khẩu phải có ít nhất 6 ký tự." };
  return { valid: true, message: "" };
};
