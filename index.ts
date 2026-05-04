import useUmami from './src/useUmami'
import withUmamiProxy from './src/withUmamiProxy'
import UmamiProvider from './src/UmamiProvider'
import { createUmamiDistinctId } from './src/createUmamiDistinctId'

export { createUmamiDistinctId, useUmami, withUmamiProxy }
export type { CreateUmamiDistinctIdOptions } from './src/createUmamiDistinctId'
export type {
  PageView,
  UmamiBeforeSend,
  UmamiEventData,
  UmamiEventDataValue,
  UmamiIdentifyArguments,
  UmamiPayload,
  UmamiProps,
  UmamiTrackArguments,
  UmamiTrackOptions,
  UmamiTrackPayload,
} from './src/common'
export default UmamiProvider
