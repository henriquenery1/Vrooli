export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** Custom description for the date scalar */
  Date: any;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};

export enum AccountStatus {
  Deleted = 'DELETED',
  HardLocked = 'HARD_LOCKED',
  SoftLocked = 'SOFT_LOCKED',
  Unlocked = 'UNLOCKED'
}

export type Comment = {
  __typename?: 'Comment';
  created_at: Scalars['Date'];
  id: Scalars['ID'];
  organization?: Maybe<Organization>;
  organizationId?: Maybe<Scalars['ID']>;
  project?: Maybe<Project>;
  projectId?: Maybe<Scalars['ID']>;
  reports: Array<Report>;
  resource?: Maybe<Resource>;
  resourceId?: Maybe<Scalars['ID']>;
  routine?: Maybe<Routine>;
  routineId?: Maybe<Scalars['ID']>;
  standard?: Maybe<Standard>;
  standardId?: Maybe<Scalars['ID']>;
  stars?: Maybe<Scalars['Int']>;
  text?: Maybe<Scalars['String']>;
  updated_at: Scalars['Date'];
  user?: Maybe<User>;
  userId?: Maybe<Scalars['ID']>;
  vote?: Maybe<Scalars['Int']>;
};

export type CommentInput = {
  id?: InputMaybe<Scalars['ID']>;
  objectId?: InputMaybe<Scalars['ID']>;
  objectType?: InputMaybe<Scalars['String']>;
  text?: InputMaybe<Scalars['String']>;
};

export type Count = {
  __typename?: 'Count';
  count?: Maybe<Scalars['Int']>;
};

export type DeleteManyInput = {
  ids: Array<Scalars['ID']>;
};

export type DeleteOneInput = {
  id: Scalars['ID'];
};

export type Email = {
  __typename?: 'Email';
  emailAddress: Scalars['String'];
  id: Scalars['ID'];
  receivesAccountUpdates: Scalars['Boolean'];
  receivesBusinessUpdates: Scalars['Boolean'];
  user?: Maybe<User>;
  userId: Scalars['ID'];
  verified: Scalars['Boolean'];
};

export type EmailInput = {
  emailAddress: Scalars['String'];
  id?: InputMaybe<Scalars['ID']>;
  receivesAccountUpdates?: InputMaybe<Scalars['Boolean']>;
  receivesBusinessUpdates?: InputMaybe<Scalars['Boolean']>;
  userId?: InputMaybe<Scalars['ID']>;
};

export type EmailLogInInput = {
  email?: InputMaybe<Scalars['String']>;
  password?: InputMaybe<Scalars['String']>;
  verificationCode?: InputMaybe<Scalars['String']>;
};

export type EmailRequestPasswordChangeInput = {
  email: Scalars['String'];
};

export type EmailResetPasswordInput = {
  code: Scalars['String'];
  id: Scalars['ID'];
  newPassword: Scalars['String'];
};

export type EmailSignUpInput = {
  email: Scalars['String'];
  marketingEmails: Scalars['Boolean'];
  password: Scalars['String'];
  pronouns?: InputMaybe<Scalars['String']>;
  theme: Scalars['String'];
  username: Scalars['String'];
};

export type FeedbackInput = {
  text: Scalars['String'];
  userId?: InputMaybe<Scalars['ID']>;
};

export type FindByIdInput = {
  id: Scalars['ID'];
};

export type Mutation = {
  __typename?: 'Mutation';
  commentAdd: Comment;
  commentDeleteOne: Success;
  commentReport: Success;
  commentUpdate: Comment;
  commentVote: Success;
  emailAdd: Email;
  emailDeleteMany: Count;
  emailLogIn: Session;
  emailRequestPasswordChange: Success;
  emailResetPassword: Session;
  emailSignUp: Session;
  emailUpdate: Email;
  exportData: Scalars['String'];
  feedbackAdd: Success;
  guestLogIn: Session;
  logOut: Success;
  nodeAdd: Node;
  nodeDeleteOne: Success;
  nodeUpdate: Node;
  organizationAdd: Organization;
  organizationDeleteOne: Success;
  organizationReport: Success;
  organizationUpdate: Organization;
  projectAdd: Project;
  projectDeleteOne: Success;
  projectReport: Success;
  projectUpdate: Project;
  resourceAdd: Resource;
  resourceDeleteMany: Count;
  resourceReport: Success;
  resourceUpdate: Resource;
  routineAdd: Routine;
  routineDeleteOne: Success;
  routineReport: Success;
  routineUpdate: Routine;
  standardAdd: Standard;
  standardDeleteMany: Count;
  standardReport: Success;
  standardUpdate: Standard;
  tagAdd: Tag;
  tagDeleteMany: Count;
  tagReport: Success;
  tagUpdate: Tag;
  tagVote: Success;
  userDeleteOne: Success;
  userReport: Success;
  userUpdate: User;
  validateSession: Session;
  walletComplete: Session;
  walletInit: Scalars['String'];
  walletRemove: Success;
  writeAssets?: Maybe<Scalars['Boolean']>;
};


export type MutationCommentAddArgs = {
  input: CommentInput;
};


export type MutationCommentDeleteOneArgs = {
  input: DeleteOneInput;
};


export type MutationCommentReportArgs = {
  input: ReportInput;
};


export type MutationCommentUpdateArgs = {
  input: CommentInput;
};


export type MutationCommentVoteArgs = {
  input: VoteInput;
};


export type MutationEmailAddArgs = {
  input: EmailInput;
};


export type MutationEmailDeleteManyArgs = {
  input: DeleteManyInput;
};


export type MutationEmailLogInArgs = {
  input: EmailLogInInput;
};


export type MutationEmailRequestPasswordChangeArgs = {
  input: EmailRequestPasswordChangeInput;
};


export type MutationEmailResetPasswordArgs = {
  input: EmailResetPasswordInput;
};


export type MutationEmailSignUpArgs = {
  input: EmailSignUpInput;
};


export type MutationEmailUpdateArgs = {
  input: EmailInput;
};


export type MutationFeedbackAddArgs = {
  input: FeedbackInput;
};


export type MutationNodeAddArgs = {
  input: NodeInput;
};


export type MutationNodeDeleteOneArgs = {
  input: DeleteOneInput;
};


export type MutationNodeUpdateArgs = {
  input: NodeInput;
};


export type MutationOrganizationAddArgs = {
  input: OrganizationInput;
};


export type MutationOrganizationDeleteOneArgs = {
  input?: InputMaybe<DeleteOneInput>;
};


export type MutationOrganizationReportArgs = {
  input: ReportInput;
};


export type MutationOrganizationUpdateArgs = {
  input: OrganizationInput;
};


export type MutationProjectAddArgs = {
  input: ProjectInput;
};


export type MutationProjectDeleteOneArgs = {
  input: DeleteOneInput;
};


export type MutationProjectReportArgs = {
  input: ReportInput;
};


export type MutationProjectUpdateArgs = {
  input: ProjectInput;
};


export type MutationResourceAddArgs = {
  input: ResourceInput;
};


export type MutationResourceDeleteManyArgs = {
  input: DeleteManyInput;
};


export type MutationResourceReportArgs = {
  input: ReportInput;
};


export type MutationResourceUpdateArgs = {
  input: ResourceInput;
};


export type MutationRoutineAddArgs = {
  input: RoutineInput;
};


export type MutationRoutineDeleteOneArgs = {
  input: DeleteOneInput;
};


export type MutationRoutineReportArgs = {
  input: ReportInput;
};


export type MutationRoutineUpdateArgs = {
  input: RoutineInput;
};


export type MutationStandardAddArgs = {
  input: StandardInput;
};


export type MutationStandardDeleteManyArgs = {
  input: DeleteManyInput;
};


export type MutationStandardReportArgs = {
  input: ReportInput;
};


export type MutationStandardUpdateArgs = {
  input: StandardInput;
};


export type MutationTagAddArgs = {
  input: TagInput;
};


export type MutationTagDeleteManyArgs = {
  input: DeleteManyInput;
};


export type MutationTagReportArgs = {
  input: ReportInput;
};


export type MutationTagUpdateArgs = {
  input: TagInput;
};


export type MutationTagVoteArgs = {
  input: TagVoteInput;
};


export type MutationUserDeleteOneArgs = {
  input: UserDeleteInput;
};


export type MutationUserReportArgs = {
  input: ReportInput;
};


export type MutationUserUpdateArgs = {
  input: UserUpdateInput;
};


export type MutationWalletCompleteArgs = {
  input: WalletCompleteInput;
};


export type MutationWalletInitArgs = {
  input: WalletInitInput;
};


export type MutationWalletRemoveArgs = {
  input: DeleteOneInput;
};


export type MutationWriteAssetsArgs = {
  input: WriteAssetsInput;
};

export type Node = {
  __typename?: 'Node';
  DecisionItem: Array<NodeDecisionItem>;
  From: Array<Node>;
  Next: Array<Node>;
  Previous: Array<Node>;
  To: Array<Node>;
  created_at: Scalars['Date'];
  data?: Maybe<NodeData>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  next?: Maybe<Node>;
  previous?: Maybe<Node>;
  routine: Routine;
  routineId: Scalars['ID'];
  title: Scalars['String'];
  type: NodeType;
  updated_at: Scalars['Date'];
};

export type NodeCombine = {
  __typename?: 'NodeCombine';
  from: Array<NodeCombineFrom>;
  id: Scalars['ID'];
  to?: Maybe<Node>;
};

export type NodeCombineFrom = {
  __typename?: 'NodeCombineFrom';
  combine?: Maybe<NodeCombine>;
  combineId: Scalars['ID'];
  from?: Maybe<Node>;
  fromId: Scalars['ID'];
  id: Scalars['ID'];
};

export type NodeCombineFromInput = {
  combineId?: InputMaybe<Scalars['ID']>;
  fromId?: InputMaybe<Scalars['ID']>;
  id?: InputMaybe<Scalars['ID']>;
};

export type NodeCombineInput = {
  from: Array<NodeCombineFromInput>;
  id?: InputMaybe<Scalars['ID']>;
  to?: InputMaybe<NodeInput>;
};

export type NodeData = NodeCombine | NodeDecision | NodeEnd | NodeLoop | NodeRedirect | NodeRoutineList | NodeStart;

export type NodeDecision = {
  __typename?: 'NodeDecision';
  decisions: Array<NodeDecisionItem>;
  id: Scalars['ID'];
};

export type NodeDecisionInput = {
  decisions: Array<NodeDecisionItemInput>;
  id?: InputMaybe<Scalars['ID']>;
};

export type NodeDecisionItem = {
  __typename?: 'NodeDecisionItem';
  id: Scalars['ID'];
  title: Scalars['String'];
  when: Array<Maybe<NodeDecisionItemCase>>;
};

export type NodeDecisionItemCase = {
  __typename?: 'NodeDecisionItemCase';
  condition: Scalars['String'];
  id: Scalars['ID'];
};

export type NodeDecisionItemCaseInput = {
  condition?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
};

export type NodeDecisionItemInput = {
  id?: InputMaybe<Scalars['ID']>;
  title?: InputMaybe<Scalars['String']>;
  when?: InputMaybe<Array<InputMaybe<NodeDecisionItemCaseInput>>>;
};

export type NodeEnd = {
  __typename?: 'NodeEnd';
  id: Scalars['ID'];
};

export type NodeEndInput = {
  id?: InputMaybe<Scalars['ID']>;
};

export type NodeInput = {
  combineData?: InputMaybe<NodeCombineInput>;
  decisionData?: InputMaybe<NodeDecisionInput>;
  description?: InputMaybe<Scalars['String']>;
  endData?: InputMaybe<NodeEndInput>;
  id?: InputMaybe<Scalars['ID']>;
  loopData?: InputMaybe<NodeLoopInput>;
  redirectData?: InputMaybe<NodeRedirectInput>;
  routineId?: InputMaybe<Scalars['ID']>;
  routineListData?: InputMaybe<NodeRoutineListInput>;
  startData?: InputMaybe<NodeStartInput>;
  title?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<NodeType>;
};

export type NodeLoop = {
  __typename?: 'NodeLoop';
  id: Scalars['ID'];
};

export type NodeLoopInput = {
  id?: InputMaybe<Scalars['ID']>;
};

export type NodeRedirect = {
  __typename?: 'NodeRedirect';
  id: Scalars['ID'];
};

export type NodeRedirectInput = {
  id?: InputMaybe<Scalars['ID']>;
};

export type NodeRoutineList = {
  __typename?: 'NodeRoutineList';
  id: Scalars['ID'];
  isOrdered: Scalars['Boolean'];
  routines: Array<NodeRoutineListItem>;
};

export type NodeRoutineListInput = {
  id?: InputMaybe<Scalars['ID']>;
  isOrdered?: InputMaybe<Scalars['Boolean']>;
  routines: Array<NodeRoutineListItemInput>;
};

export type NodeRoutineListItem = {
  __typename?: 'NodeRoutineListItem';
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  isOptional: Scalars['Boolean'];
  list?: Maybe<NodeRoutineList>;
  routine?: Maybe<Routine>;
  title: Scalars['String'];
};

export type NodeRoutineListItemInput = {
  description?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  isOptional?: InputMaybe<Scalars['Boolean']>;
  listId?: InputMaybe<Scalars['ID']>;
  routineId?: InputMaybe<Scalars['ID']>;
  title?: InputMaybe<Scalars['String']>;
};

export type NodeStart = {
  __typename?: 'NodeStart';
  id: Scalars['ID'];
};

export type NodeStartInput = {
  id?: InputMaybe<Scalars['ID']>;
};

export enum NodeType {
  Combine = 'COMBINE',
  Decision = 'DECISION',
  End = 'END',
  Loop = 'LOOP',
  Redirect = 'REDIRECT',
  RoutineList = 'ROUTINE_LIST',
  Start = 'START'
}

export type OpenGraphResponse = {
  __typename?: 'OpenGraphResponse';
  description?: Maybe<Scalars['String']>;
  imageUrl?: Maybe<Scalars['String']>;
  site?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

export type Organization = {
  __typename?: 'Organization';
  comments: Array<Comment>;
  created_at: Scalars['Date'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  projects: Array<Project>;
  reports: Array<Report>;
  resources: Array<Resource>;
  routines: Array<Routine>;
  starredBy: Array<User>;
  tags: Array<Tag>;
  updated_at: Scalars['Date'];
  wallets: Array<Wallet>;
};

export type OrganizationInput = {
  description?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  name: Scalars['String'];
  resources?: InputMaybe<Array<ResourceInput>>;
};

export type OrganizationsQueryInput = {
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type Project = {
  __typename?: 'Project';
  comments: Array<Comment>;
  created_at: Scalars['Date'];
  description?: Maybe<Scalars['String']>;
  forks: Array<Project>;
  id: Scalars['ID'];
  name: Scalars['String'];
  organizations?: Maybe<Array<Organization>>;
  parent?: Maybe<Project>;
  reports: Array<Report>;
  resources?: Maybe<Array<Resource>>;
  starredBy?: Maybe<Array<User>>;
  tags: Array<Tag>;
  updated_at: Scalars['Date'];
  users?: Maybe<Array<User>>;
  wallets?: Maybe<Array<Wallet>>;
};

export type ProjectInput = {
  description?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  name: Scalars['String'];
  organizations?: InputMaybe<Array<OrganizationInput>>;
  resources?: InputMaybe<Array<ResourceInput>>;
  users?: InputMaybe<Array<UserInput>>;
};

export enum ProjectSortBy {
  AlphabeticalAsc = 'AlphabeticalAsc',
  AlphabeticalDesc = 'AlphabeticalDesc',
  CommentsAsc = 'CommentsAsc',
  CommentsDesc = 'CommentsDesc',
  DateCreatedAsc = 'DateCreatedAsc',
  DateCreatedDesc = 'DateCreatedDesc',
  DateUpdatedAsc = 'DateUpdatedAsc',
  DateUpdatedDesc = 'DateUpdatedDesc',
  ForksAsc = 'ForksAsc',
  ForksDesc = 'ForksDesc',
  StarsAsc = 'StarsAsc',
  StarsDesc = 'StarsDesc',
  VotesAsc = 'VotesAsc',
  VotesDesc = 'VotesDesc'
}

export type ProjectsQueryInput = {
  first?: InputMaybe<Scalars['Int']>;
  ids?: InputMaybe<Array<Scalars['ID']>>;
  searchString?: InputMaybe<Scalars['String']>;
  skip?: InputMaybe<Scalars['Int']>;
  sortBy?: InputMaybe<ProjectSortBy>;
  userId?: InputMaybe<Scalars['Int']>;
};

export type Query = {
  __typename?: 'Query';
  organization?: Maybe<Organization>;
  organizations: Array<Organization>;
  organizationsCount: Count;
  profile: User;
  project?: Maybe<Project>;
  projects: Array<Project>;
  projectsCount: Count;
  readAssets: Array<Maybe<Scalars['String']>>;
  readOpenGraph: OpenGraphResponse;
  resource?: Maybe<Resource>;
  resources: Array<Resource>;
  resourcesCount: Count;
  routine?: Maybe<Routine>;
  routines: Array<Routine>;
  routinesCount: Count;
  standard?: Maybe<Standard>;
  standards: Array<Standard>;
  standardsCount: Count;
  tag?: Maybe<Tag>;
  tags: Array<Tag>;
  tagsCount: Count;
};


export type QueryOrganizationArgs = {
  input: FindByIdInput;
};


export type QueryOrganizationsArgs = {
  input: OrganizationsQueryInput;
};


export type QueryProjectArgs = {
  input: FindByIdInput;
};


export type QueryProjectsArgs = {
  input: ProjectsQueryInput;
};


export type QueryReadAssetsArgs = {
  input: ReadAssetsInput;
};


export type QueryReadOpenGraphArgs = {
  input: ReadOpenGraphInput;
};


export type QueryResourceArgs = {
  input: FindByIdInput;
};


export type QueryResourcesArgs = {
  input: ResourcesQueryInput;
};


export type QueryRoutineArgs = {
  input: FindByIdInput;
};


export type QueryRoutinesArgs = {
  input: RoutinesQueryInput;
};


export type QueryStandardArgs = {
  input: FindByIdInput;
};


export type QueryStandardsArgs = {
  input: StandardsQueryInput;
};


export type QueryTagArgs = {
  input: FindByIdInput;
};


export type QueryTagsArgs = {
  input: TagsQueryInput;
};

export type ReadAssetsInput = {
  files: Array<Scalars['String']>;
};

export type ReadOpenGraphInput = {
  url: Scalars['String'];
};

export type Report = {
  __typename?: 'Report';
  created_at: Scalars['Date'];
  details?: Maybe<Scalars['String']>;
  from: User;
  fromId: Scalars['ID'];
  id: Scalars['ID'];
  reason: Scalars['String'];
};

export type ReportInput = {
  id: Scalars['ID'];
  reason?: InputMaybe<Scalars['String']>;
};

export type Resource = {
  __typename?: 'Resource';
  comments: Array<Comment>;
  created_at: Scalars['Date'];
  description?: Maybe<Scalars['String']>;
  displayUrl?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  link: Scalars['String'];
  name: Scalars['String'];
  organization_resources: Array<Organization>;
  project_resources: Array<Project>;
  reports: Array<Report>;
  routine_resources_contextual: Array<Routine>;
  routine_resources_donation: Array<Routine>;
  routine_resources_external: Array<Routine>;
  starredBy: Array<User>;
  updated_at: Scalars['Date'];
  user_resources: Array<User>;
};

export enum ResourceFor {
  Organization = 'ORGANIZATION',
  Project = 'PROJECT',
  RoutineContextual = 'ROUTINE_CONTEXTUAL',
  RoutineDonation = 'ROUTINE_DONATION',
  RoutineExternal = 'ROUTINE_EXTERNAL',
  User = 'USER'
}

export type ResourceInput = {
  createdFor: ResourceFor;
  description?: InputMaybe<Scalars['String']>;
  displayUrl?: InputMaybe<Scalars['String']>;
  forId: Scalars['ID'];
  id?: InputMaybe<Scalars['ID']>;
  link: Scalars['String'];
  name: Scalars['String'];
};

export type ResourcesQueryInput = {
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type Response = {
  __typename?: 'Response';
  code?: Maybe<Scalars['Int']>;
  message: Scalars['String'];
};

export type Role = {
  __typename?: 'Role';
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  title: Scalars['String'];
  users: Array<User>;
};

export type Routine = {
  __typename?: 'Routine';
  comments: Array<Comment>;
  contextualResources: Array<Resource>;
  created_at: Scalars['Date'];
  description?: Maybe<Scalars['String']>;
  donationResources: Array<Resource>;
  externalResources: Array<Resource>;
  forks: Array<Routine>;
  id: Scalars['ID'];
  inputs: Array<RoutineInputItem>;
  instructions?: Maybe<Scalars['String']>;
  isAutomatable?: Maybe<Scalars['Boolean']>;
  nodeLists: Array<NodeRoutineList>;
  nodes: Array<Node>;
  organizations: Array<Organization>;
  outputs: Array<RoutineOutputItem>;
  parent?: Maybe<Routine>;
  reports: Array<Report>;
  starredBy: Array<User>;
  tags: Array<Tag>;
  title?: Maybe<Scalars['String']>;
  updated_at: Scalars['Date'];
  users: Array<User>;
  version?: Maybe<Scalars['String']>;
};

export type RoutineInput = {
  description?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  inputs?: InputMaybe<Array<RoutineInputItemInput>>;
  instructions?: InputMaybe<Scalars['String']>;
  isAutomatable?: InputMaybe<Scalars['Boolean']>;
  outputs?: InputMaybe<Array<RoutineOutputItemInput>>;
  title?: InputMaybe<Scalars['String']>;
  version?: InputMaybe<Scalars['String']>;
};

export type RoutineInputItem = {
  __typename?: 'RoutineInputItem';
  id: Scalars['ID'];
  routine: Routine;
  standard: Standard;
};

export type RoutineInputItemInput = {
  id?: InputMaybe<Scalars['ID']>;
  routineId: Scalars['ID'];
  standardId?: InputMaybe<Scalars['ID']>;
};

export type RoutineOutputItem = {
  __typename?: 'RoutineOutputItem';
  id: Scalars['ID'];
  routine: Routine;
  standard: Standard;
};

export type RoutineOutputItemInput = {
  id?: InputMaybe<Scalars['ID']>;
  routineId: Scalars['ID'];
  standardId?: InputMaybe<Scalars['ID']>;
};

export type RoutinesQueryInput = {
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type Session = {
  __typename?: 'Session';
  id?: Maybe<Scalars['ID']>;
  roles: Array<Role>;
  theme: Scalars['String'];
};

export type Standard = {
  __typename?: 'Standard';
  comments: Array<Comment>;
  created_at: Scalars['Date'];
  default?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  isFile: Scalars['Boolean'];
  name: Scalars['String'];
  reports: Array<Report>;
  routineInputs: Array<Routine>;
  routineOutputs: Array<Routine>;
  schema: Scalars['String'];
  starredBy: Array<User>;
  tags: Array<Tag>;
  type: StandardType;
  updated_at: Scalars['Date'];
};

export type StandardInput = {
  default?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  isFile?: InputMaybe<Scalars['Boolean']>;
  name?: InputMaybe<Scalars['String']>;
  schema?: InputMaybe<Scalars['String']>;
  tags?: InputMaybe<Array<TagInput>>;
  type?: InputMaybe<StandardType>;
};

export enum StandardType {
  Array = 'ARRAY',
  Boolean = 'BOOLEAN',
  File = 'FILE',
  Number = 'NUMBER',
  Object = 'OBJECT',
  String = 'STRING',
  Url = 'URL'
}

export type StandardsQueryInput = {
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type Success = {
  __typename?: 'Success';
  success?: Maybe<Scalars['Boolean']>;
};

export type Tag = {
  __typename?: 'Tag';
  created_at: Scalars['Date'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  tag: Scalars['String'];
  updated_at: Scalars['Date'];
};

export type TagInput = {
  id?: InputMaybe<Scalars['ID']>;
};

export type TagVoteInput = {
  id: Scalars['ID'];
  isUpvote: Scalars['Boolean'];
  objectId: Scalars['ID'];
  objectType: Scalars['String'];
};

export type TagsQueryInput = {
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type User = {
  __typename?: 'User';
  comments: Array<Comment>;
  created_at: Scalars['Date'];
  emailVerified: Scalars['Boolean'];
  emails: Array<Email>;
  id: Scalars['ID'];
  projects: Array<Project>;
  pronouns: Scalars['String'];
  reports: Array<Report>;
  resources: Array<Resource>;
  roles: Array<Role>;
  sentReports: Array<Report>;
  starredComments: Array<Comment>;
  starredOrganizations: Array<Organization>;
  starredProjects: Array<Project>;
  starredResources: Array<Resource>;
  starredRoutines: Array<Routine>;
  starredStandards: Array<Standard>;
  starredTags: Array<Tag>;
  starredUsers: Array<User>;
  status: AccountStatus;
  theme: Scalars['String'];
  updated_at: Scalars['Date'];
  username?: Maybe<Scalars['String']>;
  votedByTag: Array<Tag>;
  votedComments: Array<Comment>;
  wallets: Array<Wallet>;
};

export type UserDeleteInput = {
  id: Scalars['ID'];
  password: Scalars['String'];
};

export type UserInput = {
  emails?: InputMaybe<Array<EmailInput>>;
  id?: InputMaybe<Scalars['ID']>;
  pronouns?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<AccountStatus>;
  theme?: InputMaybe<Scalars['String']>;
  username?: InputMaybe<Scalars['String']>;
};

export type UserRole = {
  __typename?: 'UserRole';
  role: Role;
  user: User;
};

export type UserUpdateInput = {
  currentPassword: Scalars['String'];
  data: UserInput;
  newPassword?: InputMaybe<Scalars['String']>;
};

export type VoteInput = {
  id: Scalars['ID'];
  isUpvote: Scalars['Boolean'];
};

export type Wallet = {
  __typename?: 'Wallet';
  id: Scalars['ID'];
  organization?: Maybe<Organization>;
  publicAddress: Scalars['String'];
  user?: Maybe<User>;
  verified: Scalars['Boolean'];
};

export type WalletCompleteInput = {
  publicAddress: Scalars['String'];
  signedMessage: Scalars['String'];
};

export type WalletInitInput = {
  nonceDescription?: InputMaybe<Scalars['String']>;
  publicAddress: Scalars['String'];
};

export type WriteAssetsInput = {
  files: Array<Scalars['Upload']>;
};
