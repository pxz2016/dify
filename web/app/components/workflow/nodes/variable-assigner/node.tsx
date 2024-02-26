import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { mockData } from './mock'
import { getNodeInfoById } from '@/app/components/workflow/nodes/_base/components/variable/var-reference-picker'
import { VarBlockIcon } from '@/app/components/workflow/block-icon'
import { Line3 } from '@/app/components/base/icons/src/public/common'
import { Variable02 } from '@/app/components/base/icons/src/vender/solid/development'
const i18nPrefix = 'workflow.nodes.variableAssigner'

const Node: FC = () => {
  const { t } = useTranslation()
  const { variables, output_type } = mockData
  // TODO: get var type through node and  value
  const getVarType = () => {
    return 'string'
  }

  return (
    <div className='px-3'>
      <div className='mb-0.5 leading-4 text-xs font-medium text-gray-500 uppercase'>{t(`${i18nPrefix}.title`)}</div>
      {
        variables.length === 0 && (
          <div className='flex items-center h-6 justify-between bg-gray-100 rounded-md  px-1 space-x-1 text-xs font-normal text-gray-400 uppercase'>
            {t(`${i18nPrefix}.varNotSet`)}
          </div>
        )
      }
      {variables.length > 0 && (
        <>
          <div className='space-y-0.5'>
            {variables.map((item, index) => {
              const node = getNodeInfoById(item[0])
              const varName = item[item.length - 1]
              return (
                <div key={index} className='flex items-center h-6 bg-gray-100 rounded-md  px-1 text-xs font-normal text-gray-700' >
                  <div className='flex items-center'>
                    <div className='p-[1px]'>
                      <VarBlockIcon
                        className='!text-gray-900'
                        type={node?.type}
                      />
                    </div>
                    <div className='mx-0.5 text-xs font-medium text-gray-700'>{node?.title}</div>
                    <Line3 className='mr-0.5'></Line3>
                  </div>
                  <div className='flex items-center text-primary-600'>
                    <Variable02 className='w-3.5 h-3.5' />
                    <div className='ml-0.5 text-xs font-medium'>{varName}</div>
                  </div>
                  <div className='ml-0.5 text-xs font-normal text-gray-500'>{getVarType()}</div>
                </div>
              )
            },

            )}
          </div>
          <div className='mt-2 flex items-center h-6 justify-between bg-gray-100 rounded-md  px-1 space-x-1 text-xs font-normal text-gray-700'>
            <div className='text-xs font-medium text-gray-500 uppercase'>
              {t(`${i18nPrefix}.outputType`)}
            </div>
            <div className='text-xs font-normal text-gray-700'>
              {t(`${i18nPrefix}.type.${output_type}`)}
            </div>
          </div>
        </>
      )
      }
    </div >
  )
}

export default Node