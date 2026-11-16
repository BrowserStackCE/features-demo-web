// Test data comes from the environment (.env locally, workflow secrets/inputs in CI).
// When a value is not provided, random test data is generated instead.
const randomDigits = (count) =>
  Array.from({ length: count }, () => Math.floor(Math.random() * 10)).join('');
const suffix = () => `${Date.now().toString(36)}${randomDigits(3)}`;

function optional(name, generate) {
  return process.env[name] || generate();
}

module.exports = {
  registerName: () => optional('REGISTER_NAME', () => `user${suffix()}`),
  registerEmail: () => optional('REGISTER_EMAIL', () => `user${suffix()}@example.com`),
  registerPassword: () => optional('REGISTER_PASSWORD', () => `Pw!${suffix()}`),
  phoneNumber: () => optional('PHONE_NUMBER', () => `9${randomDigits(9)}`),
  otp: () => optional('OTP_VALUE', () => '1234'),
};
