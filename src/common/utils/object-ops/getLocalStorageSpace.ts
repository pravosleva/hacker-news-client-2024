/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-prototype-builtins */
import jsonSize from 'json-size'

export type TLocalStorageUsageInfo = {
  bytes: number;
  messages: string[];
  text?: string;
  isErrored: boolean;
}

export const getLocalStorageSpace = ({
  theFieldNames,
  getText,
}: {
  theFieldNames?: string[];
  getText?: (ps: { bytes: number }) => string;
}): TLocalStorageUsageInfo => {
  const result: TLocalStorageUsageInfo = {
    bytes: 0,
    messages: [],
    isErrored: false,
  }
  try {
    if (typeof window === 'undefined') {
      throw new Error(`Type of window is ${typeof window}`)
    }

    const targetChache: {[key: string]: any} = {}
    switch (true) {
      case Array.isArray(theFieldNames) && theFieldNames.length > 0:
        for (const spaceName of theFieldNames) {
          targetChache[spaceName] = window.localStorage[spaceName]
        }
        
        // if (typeof targetChache === 'undefined')
        //   throw new Error(`Type of window.localStorage[${theFieldName}] is ${typeof targetChache}`)
        break
      default:
        for (const key in window.localStorage) {
          if (window.localStorage.hasOwnProperty(key))
            targetChache[key] = window.localStorage[key]
        }
        break
    }

    const sizeOfSerializedObjectInBytes = jsonSize<{[key: string]: string | number}>(targetChache)
    // if (typeof sizeOfSerializedObjectInBytes !== 'number')
    //   throw new Error(`Internal util error! Received type is ${typeof sizeOfSerializedObjectInBytes}`)
    
    result.bytes = sizeOfSerializedObjectInBytes
    switch (true) {
      case typeof getText === 'function':
        result.text = getText({ bytes: sizeOfSerializedObjectInBytes })
        break
      default: {
        const msgs = []
        if (sizeOfSerializedObjectInBytes > 1000)
          msgs.push(`${(sizeOfSerializedObjectInBytes / 1000).toFixed(2)} KB`)
        else
          msgs.push(`${sizeOfSerializedObjectInBytes} B`)

        result.messages.push(msgs.join(', '))
        break
      }
    }
  } catch (err: any) {
    result.isErrored = true
    result.messages.unshift(err?.message || 'No error message')
  }

  if (!result.text)
    result.text = result.messages.join(', ')

  return result
}
