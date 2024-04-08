'use client'
import type { FC } from 'react'
import React, { useCallback, useEffect, useState } from 'react'
import { useContext } from 'use-context-selector'
import { useTranslation } from 'react-i18next'
import cn from 'classnames'
import ResultPanel from './result'
// import TracingPanel from '@/app/components/workflow/run/tracing-panel'
import { ToastContext } from '@/app/components/base/toast'
import Loading from '@/app/components/base/loading'
import { fetchAgentLogDetail } from '@/service/log'
// import type { NodeTracing } from '@/types/workflow'
import type { AgentLogDetailResponse } from '@/models/log'
import { useStore as useAppStore } from '@/app/components/app/store'

export type AgentLogDetailProps = {
  activeTab?: 'DETAIL' | 'TRACING'
  conversationID: string
  messageID: string
}

const AgentLogDetail: FC<AgentLogDetailProps> = ({ activeTab = 'DETAIL', conversationID, messageID }) => {
  const { t } = useTranslation()
  const { notify } = useContext(ToastContext)
  const [currentTab, setCurrentTab] = useState<string>(activeTab)
  const { appDetail } = useAppStore()
  const [loading, setLoading] = useState<boolean>(true)
  const [runDetail, setRunDetail] = useState<AgentLogDetailResponse>()
  // const [list, setList] = useState<NodeTracing[]>([])

  const getResult = useCallback(async (appID: string, conversationID: string, messageID: string) => {
    try {
      const res = await fetchAgentLogDetail({
        appID,
        params: {
          conversation_id: conversationID,
          message_id: messageID,
        },
      })
      setRunDetail(res)
    }
    catch (err) {
      notify({
        type: 'error',
        message: `${err}`,
      })
    }
  }, [notify])

  const getData = async (appID: string, conversationID: string, messageID: string) => {
    setLoading(true)
    await getResult(appID, conversationID, messageID)
    setLoading(false)
  }

  const switchTab = async (tab: string) => {
    setCurrentTab(tab)
  }

  useEffect(() => {
    // fetch data
    if (appDetail)
      getData(appDetail.id, conversationID, messageID)
  }, [appDetail, conversationID, messageID])

  return (
    <div className='grow relative flex flex-col'>
      {/* tab */}
      <div className='shrink-0 flex items-center px-4 border-b-[0.5px] border-[rgba(0,0,0,0.05)]'>
        <div
          className={cn(
            'mr-6 py-3 border-b-2 border-transparent text-[13px] font-semibold leading-[18px] text-gray-400 cursor-pointer',
            currentTab === 'DETAIL' && '!border-[rgb(21,94,239)] text-gray-700',
          )}
          onClick={() => switchTab('DETAIL')}
        >{t('runLog.detail')}</div>
        <div
          className={cn(
            'mr-6 py-3 border-b-2 border-transparent text-[13px] font-semibold leading-[18px] text-gray-400 cursor-pointer',
            currentTab === 'TRACING' && '!border-[rgb(21,94,239)] text-gray-700',
          )}
          onClick={() => switchTab('TRACING')}
        >{t('runLog.tracing')}</div>
      </div>
      {/* panel detal */}
      <div className={cn('grow bg-white h-0 overflow-y-auto rounded-b-2xl', currentTab !== 'DETAIL' && '!bg-gray-50')}>
        {loading && (
          <div className='flex h-full items-center justify-center bg-white'>
            <Loading />
          </div>
        )}
        {!loading && currentTab === 'DETAIL' && runDetail && (
          <ResultPanel
            inputs={''}
            outputs={''}
            status={runDetail.meta.status}
            error={runDetail.meta.error}
            elapsed_time={runDetail.meta.elapsed_time}
            total_tokens={runDetail.meta.total_tokens}
            created_at={runDetail.meta.start_time} // wrong type
            created_by={runDetail.meta.executor}
            agentMode={runDetail.meta.agent_mode}
            tools={['TODO']}
            iterations={runDetail.iterations.length}
          />
        )}
        {/* {!loading && currentTab === 'TRACING' && (
          <TracingPanel
            list={list}
          />
        )} */}
      </div>
    </div>
  )
}

export default AgentLogDetail
