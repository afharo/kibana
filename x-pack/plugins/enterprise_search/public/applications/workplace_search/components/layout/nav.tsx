/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';

import { EuiSpacer } from '@elastic/eui';

import { WORKPLACE_SEARCH_PLUGIN } from '../../../../../common/constants';
import { SideNav, SideNavLink } from '../../../shared/layout';
import { NAV } from '../../constants';
import {
  ALPHA_PATH,
  SOURCES_PATH,
  SECURITY_PATH,
  ROLE_MAPPINGS_PATH,
  GROUPS_PATH,
  ORG_SETTINGS_PATH,
} from '../../routes';

interface Props {
  sourcesSubNav?: React.ReactNode;
  groupsSubNav?: React.ReactNode;
  settingsSubNav?: React.ReactNode;
}

export const WorkplaceSearchNav: React.FC<Props> = ({
  sourcesSubNav,
  groupsSubNav,
  settingsSubNav,
}) => (
  <SideNav product={WORKPLACE_SEARCH_PLUGIN}>
    <SideNavLink to={ALPHA_PATH} isRoot>
      {NAV.OVERVIEW}
    </SideNavLink>
    <SideNavLink to={SOURCES_PATH} subNav={sourcesSubNav}>
      {NAV.SOURCES}
    </SideNavLink>
    <SideNavLink to={GROUPS_PATH} subNav={groupsSubNav}>
      {NAV.GROUPS}
    </SideNavLink>
    <SideNavLink shouldShowActiveForSubroutes to={ROLE_MAPPINGS_PATH}>
      {NAV.ROLE_MAPPINGS}
    </SideNavLink>
    <SideNavLink to={SECURITY_PATH}>{NAV.SECURITY}</SideNavLink>
    <SideNavLink subNav={settingsSubNav} to={ORG_SETTINGS_PATH}>
      {NAV.SETTINGS}
    </SideNavLink>
    <EuiSpacer />
  </SideNav>
);
