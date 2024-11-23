/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root';
import { Route as SignupImport } from './routes/signup';
import { Route as LoginImport } from './routes/login';
import { Route as AuthImport } from './routes/_auth';
import { Route as IndexImport } from './routes/index';
import { Route as AuthAccountImport } from './routes/_auth.account';
import { Route as AuthProjectImport } from './routes/_auth.$project';
import { Route as AuthAccountIndexImport } from './routes/_auth.account.index';
import { Route as AuthProjectIndexImport } from './routes/_auth.$project.index';
import { Route as AuthAccountSettingsImport } from './routes/_auth.account.settings';
import { Route as AuthProjectSettingsImport } from './routes/_auth.$project.settings';
import { Route as AuthProjectBoardImport } from './routes/_auth.$project.board';
import { Route as AuthProjectBoardTaskIdImport } from './routes/_auth.$project.board.$taskId';

// Create/Update Routes

const SignupRoute = SignupImport.update({
  id: '/signup',
  path: '/signup',
  getParentRoute: () => rootRoute,
} as any);

const LoginRoute = LoginImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRoute,
} as any);

const AuthRoute = AuthImport.update({
  id: '/_auth',
  getParentRoute: () => rootRoute,
} as any);

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any);

const AuthAccountRoute = AuthAccountImport.update({
  id: '/account',
  path: '/account',
  getParentRoute: () => AuthRoute,
} as any);

const AuthProjectRoute = AuthProjectImport.update({
  id: '/$project',
  path: '/$project',
  getParentRoute: () => AuthRoute,
} as any);

const AuthAccountIndexRoute = AuthAccountIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => AuthAccountRoute,
} as any);

const AuthProjectIndexRoute = AuthProjectIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => AuthProjectRoute,
} as any);

const AuthAccountSettingsRoute = AuthAccountSettingsImport.update({
  id: '/settings',
  path: '/settings',
  getParentRoute: () => AuthAccountRoute,
} as any);

const AuthProjectSettingsRoute = AuthProjectSettingsImport.update({
  id: '/settings',
  path: '/settings',
  getParentRoute: () => AuthProjectRoute,
} as any);

const AuthProjectBoardRoute = AuthProjectBoardImport.update({
  id: '/board',
  path: '/board',
  getParentRoute: () => AuthProjectRoute,
} as any);

const AuthProjectBoardTaskIdRoute = AuthProjectBoardTaskIdImport.update({
  id: '/$taskId',
  path: '/$taskId',
  getParentRoute: () => AuthProjectBoardRoute,
} as any);

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/';
      path: '/';
      fullPath: '/';
      preLoaderRoute: typeof IndexImport;
      parentRoute: typeof rootRoute;
    };
    '/_auth': {
      id: '/_auth';
      path: '';
      fullPath: '';
      preLoaderRoute: typeof AuthImport;
      parentRoute: typeof rootRoute;
    };
    '/login': {
      id: '/login';
      path: '/login';
      fullPath: '/login';
      preLoaderRoute: typeof LoginImport;
      parentRoute: typeof rootRoute;
    };
    '/signup': {
      id: '/signup';
      path: '/signup';
      fullPath: '/signup';
      preLoaderRoute: typeof SignupImport;
      parentRoute: typeof rootRoute;
    };
    '/_auth/$project': {
      id: '/_auth/$project';
      path: '/$project';
      fullPath: '/$project';
      preLoaderRoute: typeof AuthProjectImport;
      parentRoute: typeof AuthImport;
    };
    '/_auth/account': {
      id: '/_auth/account';
      path: '/account';
      fullPath: '/account';
      preLoaderRoute: typeof AuthAccountImport;
      parentRoute: typeof AuthImport;
    };
    '/_auth/$project/board': {
      id: '/_auth/$project/board';
      path: '/board';
      fullPath: '/$project/board';
      preLoaderRoute: typeof AuthProjectBoardImport;
      parentRoute: typeof AuthProjectImport;
    };
    '/_auth/$project/settings': {
      id: '/_auth/$project/settings';
      path: '/settings';
      fullPath: '/$project/settings';
      preLoaderRoute: typeof AuthProjectSettingsImport;
      parentRoute: typeof AuthProjectImport;
    };
    '/_auth/account/settings': {
      id: '/_auth/account/settings';
      path: '/settings';
      fullPath: '/account/settings';
      preLoaderRoute: typeof AuthAccountSettingsImport;
      parentRoute: typeof AuthAccountImport;
    };
    '/_auth/$project/': {
      id: '/_auth/$project/';
      path: '/';
      fullPath: '/$project/';
      preLoaderRoute: typeof AuthProjectIndexImport;
      parentRoute: typeof AuthProjectImport;
    };
    '/_auth/account/': {
      id: '/_auth/account/';
      path: '/';
      fullPath: '/account/';
      preLoaderRoute: typeof AuthAccountIndexImport;
      parentRoute: typeof AuthAccountImport;
    };
    '/_auth/$project/board/$taskId': {
      id: '/_auth/$project/board/$taskId';
      path: '/$taskId';
      fullPath: '/$project/board/$taskId';
      preLoaderRoute: typeof AuthProjectBoardTaskIdImport;
      parentRoute: typeof AuthProjectBoardImport;
    };
  }
}

// Create and export the route tree

interface AuthProjectBoardRouteChildren {
  AuthProjectBoardTaskIdRoute: typeof AuthProjectBoardTaskIdRoute;
}

const AuthProjectBoardRouteChildren: AuthProjectBoardRouteChildren = {
  AuthProjectBoardTaskIdRoute: AuthProjectBoardTaskIdRoute,
};

const AuthProjectBoardRouteWithChildren = AuthProjectBoardRoute._addFileChildren(
  AuthProjectBoardRouteChildren
);

interface AuthProjectRouteChildren {
  AuthProjectBoardRoute: typeof AuthProjectBoardRouteWithChildren;
  AuthProjectSettingsRoute: typeof AuthProjectSettingsRoute;
  AuthProjectIndexRoute: typeof AuthProjectIndexRoute;
}

const AuthProjectRouteChildren: AuthProjectRouteChildren = {
  AuthProjectBoardRoute: AuthProjectBoardRouteWithChildren,
  AuthProjectSettingsRoute: AuthProjectSettingsRoute,
  AuthProjectIndexRoute: AuthProjectIndexRoute,
};

const AuthProjectRouteWithChildren = AuthProjectRoute._addFileChildren(AuthProjectRouteChildren);

interface AuthAccountRouteChildren {
  AuthAccountSettingsRoute: typeof AuthAccountSettingsRoute;
  AuthAccountIndexRoute: typeof AuthAccountIndexRoute;
}

const AuthAccountRouteChildren: AuthAccountRouteChildren = {
  AuthAccountSettingsRoute: AuthAccountSettingsRoute,
  AuthAccountIndexRoute: AuthAccountIndexRoute,
};

const AuthAccountRouteWithChildren = AuthAccountRoute._addFileChildren(AuthAccountRouteChildren);

interface AuthRouteChildren {
  AuthProjectRoute: typeof AuthProjectRouteWithChildren;
  AuthAccountRoute: typeof AuthAccountRouteWithChildren;
}

const AuthRouteChildren: AuthRouteChildren = {
  AuthProjectRoute: AuthProjectRouteWithChildren,
  AuthAccountRoute: AuthAccountRouteWithChildren,
};

const AuthRouteWithChildren = AuthRoute._addFileChildren(AuthRouteChildren);

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute;
  '': typeof AuthRouteWithChildren;
  '/login': typeof LoginRoute;
  '/signup': typeof SignupRoute;
  '/$project': typeof AuthProjectRouteWithChildren;
  '/account': typeof AuthAccountRouteWithChildren;
  '/$project/board': typeof AuthProjectBoardRouteWithChildren;
  '/$project/settings': typeof AuthProjectSettingsRoute;
  '/account/settings': typeof AuthAccountSettingsRoute;
  '/$project/': typeof AuthProjectIndexRoute;
  '/account/': typeof AuthAccountIndexRoute;
  '/$project/board/$taskId': typeof AuthProjectBoardTaskIdRoute;
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute;
  '': typeof AuthRouteWithChildren;
  '/login': typeof LoginRoute;
  '/signup': typeof SignupRoute;
  '/$project/board': typeof AuthProjectBoardRouteWithChildren;
  '/$project/settings': typeof AuthProjectSettingsRoute;
  '/account/settings': typeof AuthAccountSettingsRoute;
  '/$project': typeof AuthProjectIndexRoute;
  '/account': typeof AuthAccountIndexRoute;
  '/$project/board/$taskId': typeof AuthProjectBoardTaskIdRoute;
}

export interface FileRoutesById {
  __root__: typeof rootRoute;
  '/': typeof IndexRoute;
  '/_auth': typeof AuthRouteWithChildren;
  '/login': typeof LoginRoute;
  '/signup': typeof SignupRoute;
  '/_auth/$project': typeof AuthProjectRouteWithChildren;
  '/_auth/account': typeof AuthAccountRouteWithChildren;
  '/_auth/$project/board': typeof AuthProjectBoardRouteWithChildren;
  '/_auth/$project/settings': typeof AuthProjectSettingsRoute;
  '/_auth/account/settings': typeof AuthAccountSettingsRoute;
  '/_auth/$project/': typeof AuthProjectIndexRoute;
  '/_auth/account/': typeof AuthAccountIndexRoute;
  '/_auth/$project/board/$taskId': typeof AuthProjectBoardTaskIdRoute;
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath;
  fullPaths:
    | '/'
    | ''
    | '/login'
    | '/signup'
    | '/$project'
    | '/account'
    | '/$project/board'
    | '/$project/settings'
    | '/account/settings'
    | '/$project/'
    | '/account/'
    | '/$project/board/$taskId';
  fileRoutesByTo: FileRoutesByTo;
  to:
    | '/'
    | ''
    | '/login'
    | '/signup'
    | '/$project/board'
    | '/$project/settings'
    | '/account/settings'
    | '/$project'
    | '/account'
    | '/$project/board/$taskId';
  id:
    | '__root__'
    | '/'
    | '/_auth'
    | '/login'
    | '/signup'
    | '/_auth/$project'
    | '/_auth/account'
    | '/_auth/$project/board'
    | '/_auth/$project/settings'
    | '/_auth/account/settings'
    | '/_auth/$project/'
    | '/_auth/account/'
    | '/_auth/$project/board/$taskId';
  fileRoutesById: FileRoutesById;
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute;
  AuthRoute: typeof AuthRouteWithChildren;
  LoginRoute: typeof LoginRoute;
  SignupRoute: typeof SignupRoute;
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AuthRoute: AuthRouteWithChildren,
  LoginRoute: LoginRoute,
  SignupRoute: SignupRoute,
};

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>();

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/_auth",
        "/login",
        "/signup"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/_auth": {
      "filePath": "_auth.tsx",
      "children": [
        "/_auth/$project",
        "/_auth/account"
      ]
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/signup": {
      "filePath": "signup.tsx"
    },
    "/_auth/$project": {
      "filePath": "_auth.$project.tsx",
      "parent": "/_auth",
      "children": [
        "/_auth/$project/board",
        "/_auth/$project/settings",
        "/_auth/$project/"
      ]
    },
    "/_auth/account": {
      "filePath": "_auth.account.tsx",
      "parent": "/_auth",
      "children": [
        "/_auth/account/settings",
        "/_auth/account/"
      ]
    },
    "/_auth/$project/board": {
      "filePath": "_auth.$project.board.tsx",
      "parent": "/_auth/$project",
      "children": [
        "/_auth/$project/board/$taskId"
      ]
    },
    "/_auth/$project/settings": {
      "filePath": "_auth.$project.settings.tsx",
      "parent": "/_auth/$project"
    },
    "/_auth/account/settings": {
      "filePath": "_auth.account.settings.tsx",
      "parent": "/_auth/account"
    },
    "/_auth/$project/": {
      "filePath": "_auth.$project.index.tsx",
      "parent": "/_auth/$project"
    },
    "/_auth/account/": {
      "filePath": "_auth.account.index.tsx",
      "parent": "/_auth/account"
    },
    "/_auth/$project/board/$taskId": {
      "filePath": "_auth.$project.board.$taskId.tsx",
      "parent": "/_auth/$project/board"
    }
  }
}
ROUTE_MANIFEST_END */
