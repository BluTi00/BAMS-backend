export const smsMessage = {
  accountVerification: (otp: string | number) =>
    `Your OTP for account verification for IEDI (SAMS) is ${otp}.`,
  passwordReset: (otp: string | number) =>
    `Your OTP for password reset for IEDI (SAMS) is ${otp}.`,
  applicationSubmitted: (registrationNumber: string) =>
    `Application registration number is: ${registrationNumber}`,
  loginVerification: (otp: string | number) =>
    `Your OTP for login verification for IEDI (SAMS) is ${otp}.`,
}
