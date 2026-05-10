export const loginPageContract = {
  eyebrow: 'Private community',
  title: 'Member login',
  subtitle: 'Use your approved email and password.',
  primaryActionLabel: 'Login',
  passwordLabel: 'Password',
  invalidCredentialsNotice:
    'Invalid email or password, or this account does not have access. Apply for access or reach out to an administrator.',
  missingAccountNotice:
    'Invalid email or password, or this account does not have access. Apply for access or reach out to an administrator.',
  secondaryPrompt: 'Need access?',
  secondaryLinkLabel: 'Apply for access',
  footer: 'Access is approval-based. Login never creates a new account.',
  preserveTypedInputCase: true,
} as const;

export const passwordResetPageContract = {
  eyebrow: 'Password reset required',
  title: 'Set your password',
  subtitle: 'Temporary passwords must be replaced before entering Freddy Founders.',
  primaryActionLabel: 'Set password',
  passwordLabel: 'New password',
  confirmPasswordLabel: 'Confirm new password',
  successNotice: 'Password updated. Entering Freddy Founders...',
  mismatchNotice: 'Passwords must match.',
  minimumLengthNotice: 'Password must be at least 8 characters.',
} as const;

export const registerPageContract = {
  eyebrow: 'Request access',
  title: 'Apply for access',
  subtitle: 'Freddy Founders is a private community for Atlantic Canadian founders.',
  primaryActionLabel: 'Submit application',
  successNotice: 'Application received. Admins will review it.',
  secondaryPrompt: 'Already approved?',
  secondaryLinkLabel: 'Return to login',
  footer: 'Submitting an application does not create login access.',
  founderAffirmationLabel: 'I am a founder of this company',
  townCityLabel: 'Town/City',
  requiredFieldLabels: [
    'Name',
    'Email address',
    'Company website',
    'Town/City',
    'Founder affirmation',
  ],
  hiddenFieldLabels: ['Company name', 'Public directory consent'],
} as const;
