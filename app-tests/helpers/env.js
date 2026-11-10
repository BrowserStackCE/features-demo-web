// Test data comes from the environment (.env locally, workflow secrets/inputs in CI).
function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set. Add it to app-tests/.env or the workflow environment.`);
  return value;
}

module.exports = {
  registerName: () => required('REGISTER_NAME'),
  registerEmail: () => required('REGISTER_EMAIL'),
  registerPassword: () => required('REGISTER_PASSWORD'),
  phoneNumber: () => required('PHONE_NUMBER'),
  otp: () => required('OTP_VALUE'),
};
