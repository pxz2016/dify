'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'next/navigation'
import useSWRInfinite from 'swr/infinite'
import { flatten } from 'lodash-es'
import produce from 'immer'
import Nav from '../nav'
import { type NavItem } from '../nav/nav-selector'
import { Robot, RobotActive } from '../../base/icons/src/public/header-nav/studio'
import { fetchAppList } from '@/service/apps'
import CreateAppTemplateDialog from '@/app/components/app/create-app-dialog'
import CreateAppModal from '@/app/components/app/create-app-modal'
import CreateFromDSLModal from '@/app/components/app/create-from-dsl-modal'
import type { AppListResponse } from '@/models/app'
import { useAppContext } from '@/context/app-context'
import { useStore as useAppStore } from '@/app/components/app/store'

const getKey = (
  pageIndex: number,
  previousPageData: AppListResponse,
  activeTab: string,
  keywords: string,
) => {
  if (!pageIndex || previousPageData.has_more) {
    const params: any = { url: 'apps', params: { page: pageIndex + 1, limit: 30, name: keywords } }

    if (activeTab !== 'all')
      params.params.mode = activeTab
    else
      delete params.params.mode

    return params
  }
  return null
}

const AppNav = () => {
  const { t } = useTranslation()
  const { appId } = useParams()
  const { isCurrentWorkspaceManager } = useAppContext()
  const { appDetail } = useAppStore()
  const [showNewAppDialog, setShowNewAppDialog] = useState(false)
  const [showNewAppTemplateDialog, setShowNewAppTemplateDialog] = useState(false)
  const [showCreateFromDSLModal, setShowCreateFromDSLModal] = useState(false)
  const [navItems, setNavItems] = useState<NavItem[]>([])

  const { data: appsData, setSize, mutate } = useSWRInfinite(
    appId
      ? (pageIndex: number, previousPageData: AppListResponse) => getKey(pageIndex, previousPageData, 'all', '')
      : () => null,
    fetchAppList,
    { revalidateFirstPage: false },
  )

  const handleLoadmore = useCallback(() => {
    setSize(size => size + 1)
  }, [setSize])

  const openModal = (state: string) => {
    if (state === 'blank')
      setShowNewAppDialog(true)
    if (state === 'template')
      setShowNewAppTemplateDialog(true)
    if (state === 'dsl')
      setShowCreateFromDSLModal(true)
  }

  useEffect(() => {
    if (appsData) {
      const appItems = flatten(appsData?.map(appData => appData.data))
      const navItems = appItems.map((app) => {
        const link = ((isCurrentWorkspaceManager, app) => {
          if (!isCurrentWorkspaceManager) {
            return `/app/${app.id}/overview`
          }
          else {
            if (app.mode === 'workflow' || app.mode === 'advanced-chat')
              return `/app/${app.id}/workflow`
            else
              return `/app/${app.id}/configuration`
          }
        })(isCurrentWorkspaceManager, app)
        return {
          id: app.id,
          icon: app.icon,
          icon_background: app.icon_background,
          name: app.name,
          link,
        }
      })
      setNavItems(navItems)
    }
  }, [appsData, isCurrentWorkspaceManager, setNavItems])

  // update current app name
  useEffect(() => {
    if (appDetail) {
      const newNavItems = produce(navItems, (draft: NavItem[]) => {
        navItems.forEach((app, index) => {
          if (app.id === appDetail.id)
            draft[index].name = appDetail.name
        })
      })
      setNavItems(newNavItems)
    }
  }, [appDetail, navItems])

  return (
    <>
      <Nav
        icon={<Robot className='w-4 h-4' />}
        activeIcon={<RobotActive className='w-4 h-4' />}
        text={t('common.menus.apps')}
        activeSegment={['apps', 'app']}
        link='/apps'
        curNav={appDetail}
        navs={navItems}
        createText={t('common.menus.newApp')}
        onCreate={openModal}
        onLoadmore={handleLoadmore}
      />
      <CreateAppModal
        show={showNewAppDialog}
        onClose={() => setShowNewAppDialog(false)}
        onSuccess={() => mutate()}
      />
      <CreateAppTemplateDialog
        show={showNewAppTemplateDialog}
        onClose={() => setShowNewAppTemplateDialog(false)}
        onSuccess={() => mutate()}
      />
      <CreateFromDSLModal
        show={showCreateFromDSLModal}
        onClose={() => setShowCreateFromDSLModal(false)}
        onSuccess={() => mutate()}
      />
    </>
  )
}

export default AppNav
