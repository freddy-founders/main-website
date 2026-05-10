export type ActionKind = 'navigation' | 'external-navigation' | 'mutation';
export type ActionRisk = 'low' | 'medium' | 'high';
export type ActionActor = 'anonymous' | 'member' | 'admin';
export type ActionAuthPolicy = 'public' | 'authenticated' | 'admin';
export type ActionVerificationKind =
  | 'bdd'
  | 'unit'
  | 'static-ui'
  | 'rendered-ui'
  | 'mbt'
  | 'contract'
  | 'smoke';

export interface ActionCapability {
  readonly id: string;
  readonly label: string;
  readonly kind: ActionKind;
  readonly actor: ActionActor;
  readonly surface: string;
  readonly risk: ActionRisk;
  readonly auth: ActionAuthPolicy;
  readonly boundary: string;
  readonly workflow: string | null;
  readonly verification: {
    readonly required: readonly ActionVerificationKind[];
    readonly mbtExempt?: {
      readonly reason: string;
    };
  };
}

export const actionCapabilities = {
  navigateEvents: {
    id: 'navigate-events',
    label: 'Navigate to Events',
    kind: 'navigation',
    actor: 'member',
    surface: '/events',
    risk: 'low',
    auth: 'authenticated',
    boundary: 'React route /events',
    workflow: null,
    verification: {
      required: ['bdd', 'static-ui', 'rendered-ui'],
    },
  },
  navigatePeople: {
    id: 'navigate-people',
    label: 'Navigate to People',
    kind: 'navigation',
    actor: 'member',
    surface: '/people',
    risk: 'low',
    auth: 'authenticated',
    boundary: 'React route /people',
    workflow: null,
    verification: {
      required: ['bdd', 'static-ui', 'rendered-ui'],
    },
  },
  navigateCompanies: {
    id: 'navigate-companies',
    label: 'Navigate to Companies',
    kind: 'navigation',
    actor: 'member',
    surface: '/companies',
    risk: 'low',
    auth: 'authenticated',
    boundary: 'React route /companies',
    workflow: null,
    verification: {
      required: ['bdd', 'static-ui', 'rendered-ui'],
    },
  },
  navigateLogin: {
    id: 'navigate-login',
    label: 'Navigate to Login',
    kind: 'navigation',
    actor: 'anonymous',
    surface: '/login',
    risk: 'low',
    auth: 'public',
    boundary: 'React route /login',
    workflow: null,
    verification: {
      required: ['bdd', 'static-ui', 'rendered-ui'],
    },
  },
  navigateRegister: {
    id: 'navigate-register',
    label: 'Navigate to Register',
    kind: 'navigation',
    actor: 'anonymous',
    surface: '/register',
    risk: 'low',
    auth: 'public',
    boundary: 'React route /register',
    workflow: null,
    verification: {
      required: ['bdd', 'static-ui', 'rendered-ui'],
    },
  },
  submitLogin: {
    id: 'submit-login',
    label: 'Submit password login',
    kind: 'mutation',
    actor: 'anonymous',
    surface: '/login',
    risk: 'high',
    auth: 'public',
    boundary: 'src/application/auth.signInWithPassword -> Supabase Auth signInWithPassword',
    workflow: 'auth-access',
    verification: {
      required: ['bdd', 'unit', 'static-ui', 'rendered-ui', 'mbt', 'contract'],
    },
  },
  completePasswordReset: {
    id: 'complete-password-reset',
    label: 'Complete required password reset',
    kind: 'mutation',
    actor: 'member',
    surface: '/reset-password',
    risk: 'high',
    auth: 'authenticated',
    boundary: 'src/application/auth.completePasswordReset -> Supabase Auth updateUser',
    workflow: 'auth-access',
    verification: {
      required: ['bdd', 'unit', 'static-ui', 'rendered-ui', 'mbt', 'contract'],
    },
  },
  submitApplication: {
    id: 'submit-application',
    label: 'Submit founder application',
    kind: 'mutation',
    actor: 'anonymous',
    surface: '/register',
    risk: 'high',
    auth: 'public',
    boundary: 'POST /api/registration-requests -> submit_founder_registration_request',
    workflow: 'auth-access',
    verification: {
      required: ['bdd', 'unit', 'static-ui', 'rendered-ui', 'mbt', 'contract'],
    },
  },
  registerExternalEvent: {
    id: 'register-external-event',
    label: 'Register for an external event',
    kind: 'external-navigation',
    actor: 'member',
    surface: '/events',
    risk: 'medium',
    auth: 'authenticated',
    boundary: 'External event registration URL',
    workflow: null,
    verification: {
      required: ['bdd', 'static-ui'],
      mbtExempt: {
        reason: 'External handoff does not mutate Freddy Founders durable state in v0.',
      },
    },
  },
  approveRegistrationRequest: {
    id: 'approve-registration-request',
    label: 'Approve registration request',
    kind: 'mutation',
    actor: 'admin',
    surface: '/admin',
    risk: 'high',
    auth: 'admin',
    boundary: 'POST /api/admin/registration-requests/:id/approve',
    workflow: 'auth-access',
    verification: {
      required: ['bdd', 'unit', 'static-ui', 'rendered-ui', 'mbt', 'contract'],
    },
  },
  archiveRegistrationRequest: {
    id: 'archive-registration-request',
    label: 'Archive registration request',
    kind: 'mutation',
    actor: 'admin',
    surface: '/admin',
    risk: 'high',
    auth: 'admin',
    boundary: 'POST /api/admin/registration-requests/:id/archive',
    workflow: 'auth-access',
    verification: {
      required: ['bdd', 'unit', 'static-ui', 'rendered-ui', 'mbt', 'contract'],
    },
  },
  promoteOrganizer: {
    id: 'promote-organizer',
    label: 'Promote member to organizer',
    kind: 'mutation',
    actor: 'admin',
    surface: '/admin',
    risk: 'high',
    auth: 'admin',
    boundary: 'src/application/admin.setProfileRole -> set_profile_role RPC',
    workflow: 'admin-governance',
    verification: {
      required: ['bdd', 'unit', 'static-ui', 'rendered-ui', 'mbt'],
    },
  },
  promoteAdmin: {
    id: 'promote-admin',
    label: 'Promote user to admin',
    kind: 'mutation',
    actor: 'admin',
    surface: '/admin',
    risk: 'high',
    auth: 'admin',
    boundary: 'src/application/admin.setProfileRole -> set_profile_role RPC',
    workflow: 'admin-governance',
    verification: {
      required: ['bdd', 'unit', 'static-ui', 'rendered-ui', 'mbt'],
    },
  },
  demoteMember: {
    id: 'demote-member',
    label: 'Demote user to member',
    kind: 'mutation',
    actor: 'admin',
    surface: '/admin',
    risk: 'high',
    auth: 'admin',
    boundary: 'src/application/admin.setProfileRole -> set_profile_role RPC',
    workflow: 'admin-governance',
    verification: {
      required: ['bdd', 'unit', 'static-ui', 'rendered-ui', 'mbt'],
    },
  },
  deactivateProfile: {
    id: 'deactivate-profile',
    label: 'Deactivate profile access',
    kind: 'mutation',
    actor: 'admin',
    surface: '/admin',
    risk: 'high',
    auth: 'admin',
    boundary: 'POST /api/admin/profiles/:id/deactivate',
    workflow: 'auth-access',
    verification: {
      required: ['bdd', 'unit', 'static-ui', 'rendered-ui', 'mbt', 'contract'],
    },
  },
  resetMemberPassword: {
    id: 'reset-member-password',
    label: 'Issue temporary password',
    kind: 'mutation',
    actor: 'admin',
    surface: '/admin',
    risk: 'high',
    auth: 'admin',
    boundary: 'POST /api/admin/profiles/:id/reset-password',
    workflow: 'auth-access',
    verification: {
      required: ['bdd', 'unit', 'static-ui', 'rendered-ui', 'mbt', 'contract'],
    },
  },
  navigateAdminIntegrations: {
    id: 'navigate-admin-integrations',
    label: 'Navigate to admin integrations',
    kind: 'navigation',
    actor: 'admin',
    surface: '/admin/integrations',
    risk: 'low',
    auth: 'admin',
    boundary: 'React route /admin/integrations',
    workflow: null,
    verification: {
      required: ['bdd', 'static-ui', 'rendered-ui'],
    },
  },
  saveGoogleAiApiKey: {
    id: 'save-google-ai-api-key',
    label: 'Save Google AI API key',
    kind: 'mutation',
    actor: 'admin',
    surface: '/admin/integrations',
    risk: 'high',
    auth: 'admin',
    boundary: 'POST /api/admin/integrations/google-ai/api-key',
    workflow: null,
    verification: {
      required: ['bdd', 'unit', 'static-ui', 'rendered-ui', 'contract'],
      mbtExempt: {
        reason:
          'Provider credential setup is a bounded integration configuration change, not an app-domain state machine.',
      },
    },
  },
  removeGoogleAiApiKey: {
    id: 'remove-google-ai-api-key',
    label: 'Remove Google AI API key',
    kind: 'mutation',
    actor: 'admin',
    surface: '/admin/integrations',
    risk: 'high',
    auth: 'admin',
    boundary: 'POST /api/admin/integrations/google-ai/api-key/remove',
    workflow: null,
    verification: {
      required: ['bdd', 'unit', 'static-ui', 'rendered-ui', 'contract'],
      mbtExempt: {
        reason:
          'Provider credential removal is a bounded integration configuration change, not an app-domain state machine.',
      },
    },
  },
} as const satisfies Record<string, ActionCapability>;

export type UserActionKey = keyof typeof actionCapabilities;
export type UserActionId = (typeof actionCapabilities)[UserActionKey]['id'];

export const userActions = Object.fromEntries(
  Object.entries(actionCapabilities).map(([key, capability]) => [key, capability.id]),
) as { readonly [Key in UserActionKey]: (typeof actionCapabilities)[Key]['id'] };

export const mutationUserActions = Object.values(actionCapabilities)
  .filter((capability) => capability.kind === 'mutation')
  .map((capability) => capability.id) as UserActionId[];

export type WorkflowCoverageKind = 'states' | 'transitions' | 'forbidden-transitions';

export interface UserActionWorkflowTransition {
  readonly from: string;
  readonly action: UserActionId;
  readonly to: string;
}

export interface UserActionWorkflowForbiddenTransition {
  readonly state: string;
  readonly action: UserActionId;
  readonly reason: string;
}

export interface UserActionWorkflow {
  readonly id: string;
  readonly label: string;
  readonly initialState: string;
  readonly states: readonly string[];
  readonly events: readonly UserActionId[];
  readonly transitions: readonly UserActionWorkflowTransition[];
  readonly forbiddenTransitions: readonly UserActionWorkflowForbiddenTransition[];
  readonly requiredCoverage: readonly WorkflowCoverageKind[];
  readonly evidence: readonly string[];
}

export const userActionWorkflows = {
  authAccess: {
    id: 'auth-access',
    label: 'Private community access lifecycle',
    initialState: 'anonymous',
    states: [
      'anonymous',
      'pending-application',
      'archived-application',
      'password-reset-required',
      'approved-member',
      'member-session',
      'deactivated-member',
    ],
    events: [
      userActions.submitApplication,
      userActions.approveRegistrationRequest,
      userActions.archiveRegistrationRequest,
      userActions.submitLogin,
      userActions.completePasswordReset,
      userActions.deactivateProfile,
      userActions.resetMemberPassword,
    ],
    transitions: [
      { from: 'anonymous', action: userActions.submitApplication, to: 'pending-application' },
      {
        from: 'pending-application',
        action: userActions.approveRegistrationRequest,
        to: 'password-reset-required',
      },
      {
        from: 'pending-application',
        action: userActions.archiveRegistrationRequest,
        to: 'archived-application',
      },
      {
        from: 'password-reset-required',
        action: userActions.submitLogin,
        to: 'password-reset-required',
      },
      {
        from: 'password-reset-required',
        action: userActions.completePasswordReset,
        to: 'member-session',
      },
      { from: 'approved-member', action: userActions.submitLogin, to: 'member-session' },
      {
        from: 'approved-member',
        action: userActions.resetMemberPassword,
        to: 'password-reset-required',
      },
      {
        from: 'member-session',
        action: userActions.resetMemberPassword,
        to: 'password-reset-required',
      },
      {
        from: 'password-reset-required',
        action: userActions.deactivateProfile,
        to: 'deactivated-member',
      },
      { from: 'approved-member', action: userActions.deactivateProfile, to: 'deactivated-member' },
      { from: 'member-session', action: userActions.deactivateProfile, to: 'deactivated-member' },
    ],
    forbiddenTransitions: [
      {
        state: 'anonymous',
        action: userActions.submitLogin,
        reason: 'Login must never create a new account or access session.',
      },
      {
        state: 'anonymous',
        action: userActions.completePasswordReset,
        reason: 'Anonymous visitors have no authenticated password-reset session.',
      },
      {
        state: 'pending-application',
        action: userActions.submitLogin,
        reason: 'Pending applicants are not approved members.',
      },
      {
        state: 'pending-application',
        action: userActions.completePasswordReset,
        reason: 'Pending applicants do not have temporary credentials.',
      },
      {
        state: 'deactivated-member',
        action: userActions.submitLogin,
        reason: 'Deactivated members lose login eligibility.',
      },
      {
        state: 'deactivated-member',
        action: userActions.resetMemberPassword,
        reason: 'Deactivated members must be reactivated before receiving credentials.',
      },
      {
        state: 'approved-member',
        action: userActions.completePasswordReset,
        reason:
          'Approved members without a reset requirement should not reset through the mandatory reset route.',
      },
      {
        state: 'approved-member',
        action: userActions.submitApplication,
        reason: 'Approved members cannot create duplicate applications.',
      },
    ],
    requiredCoverage: ['states', 'transitions', 'forbidden-transitions'],
    evidence: [
      'features/**/*.feature',
      'scripts/check-model-workflow-coverage.mjs',
      'scripts/test-model-workflows.mjs',
    ],
  },
  adminGovernance: {
    id: 'admin-governance',
    label: 'Admin role governance lifecycle',
    initialState: 'member',
    states: ['member', 'organizer', 'admin', 'owner-admin', 'deactivated'],
    events: [
      userActions.promoteOrganizer,
      userActions.promoteAdmin,
      userActions.demoteMember,
      userActions.deactivateProfile,
    ],
    transitions: [
      { from: 'member', action: userActions.promoteOrganizer, to: 'organizer' },
      { from: 'member', action: userActions.promoteAdmin, to: 'admin' },
      { from: 'organizer', action: userActions.promoteAdmin, to: 'admin' },
      { from: 'organizer', action: userActions.demoteMember, to: 'member' },
      { from: 'admin', action: userActions.demoteMember, to: 'member' },
      { from: 'member', action: userActions.deactivateProfile, to: 'deactivated' },
      { from: 'organizer', action: userActions.deactivateProfile, to: 'deactivated' },
      { from: 'admin', action: userActions.deactivateProfile, to: 'deactivated' },
    ],
    forbiddenTransitions: [
      {
        state: 'owner-admin',
        action: userActions.demoteMember,
        reason: 'The singleton owner must remain an admin.',
      },
      {
        state: 'owner-admin',
        action: userActions.deactivateProfile,
        reason: 'The singleton owner cannot be deactivated through ordinary admin controls.',
      },
    ],
    requiredCoverage: ['states', 'transitions', 'forbidden-transitions'],
    evidence: [
      'features/**/*.feature',
      'scripts/check-model-workflow-coverage.mjs',
      'scripts/test-model-workflows.mjs',
    ],
  },
} as const satisfies Record<string, UserActionWorkflow>;

export interface ProductCapability {
  readonly id: string;
  readonly label: string;
  readonly tag: string;
  readonly cucumberFeatures: readonly string[];
  readonly requiredActions: readonly UserActionId[];
  readonly workflows: readonly string[];
}

export const productCapabilities = {
  authAccess: {
    id: 'auth-access',
    label: 'Private community access',
    tag: '@capability.auth-access',
    cucumberFeatures: [
      'features/auth-entry.feature',
      'features/founder-application.feature',
      'features/application-review.feature',
      'features/member-login.feature',
      'features/private-app-access.feature',
      'features/account-deactivation.feature',
      'features/access-audit.feature',
    ],
    requiredActions: [
      userActions.navigateLogin,
      userActions.navigateRegister,
      userActions.submitApplication,
      userActions.approveRegistrationRequest,
      userActions.archiveRegistrationRequest,
      userActions.submitLogin,
      userActions.completePasswordReset,
      userActions.navigateEvents,
      userActions.navigatePeople,
      userActions.navigateCompanies,
      userActions.deactivateProfile,
      userActions.resetMemberPassword,
    ],
    workflows: ['auth-access'],
  },
  adminGovernance: {
    id: 'admin-governance',
    label: 'Admin governance',
    tag: '@capability.admin-governance',
    cucumberFeatures: [
      'features/admin.feature',
      'features/admin-governance.feature',
      'features/access-audit.feature',
    ],
    requiredActions: [
      userActions.approveRegistrationRequest,
      userActions.archiveRegistrationRequest,
      userActions.promoteOrganizer,
      userActions.promoteAdmin,
      userActions.demoteMember,
      userActions.deactivateProfile,
      userActions.resetMemberPassword,
    ],
    workflows: ['admin-governance'],
  },
  adminIntegrations: {
    id: 'admin-integrations',
    label: 'Admin integrations',
    tag: '@capability.admin-integrations',
    cucumberFeatures: ['features/admin-integrations.feature'],
    requiredActions: [
      userActions.navigateAdminIntegrations,
      userActions.saveGoogleAiApiKey,
      userActions.removeGoogleAiApiKey,
    ],
    workflows: [],
  },
  memberEvents: {
    id: 'member-events',
    label: 'Member events',
    tag: '@capability.member-events',
    cucumberFeatures: ['features/events.feature'],
    requiredActions: [userActions.navigateEvents, userActions.registerExternalEvent],
    workflows: [],
  },
  memberDirectory: {
    id: 'member-directory',
    label: 'Member directory',
    tag: '@capability.member-directory',
    cucumberFeatures: ['features/people.feature', 'features/companies.feature'],
    requiredActions: [userActions.navigatePeople, userActions.navigateCompanies],
    workflows: [],
  },
} as const satisfies Record<string, ProductCapability>;

export function userActionTag(actionId: UserActionId): `@action.${UserActionId}` {
  return `@action.${actionId}`;
}
