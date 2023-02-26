import {useEffect, useState} from 'react'

export function useDevicePixelRatio(options = {}) {
    const dpr = getDevicePixelRatio(options)
    const [currentDpr, setCurrentDpr] = useState(dpr)
    const {defaultDpr, maxDpr, round} = options || {}

    useEffect(() => {
        const canListen = typeof window !== 'undefined' && 'matchMedia' in window
        if (!canListen) {
            return
        }

        const updateDpr = () => setCurrentDpr(getDevicePixelRatio({defaultDpr, maxDpr, round}))
        const mediaMatcher = window.matchMedia(`screen and (resolution: ${currentDpr}dppx)`)

        // Safari 13.1 does not have `addEventListener`, but does have `addListener`
        if (mediaMatcher.addEventListener) {
            mediaMatcher.addEventListener('change', updateDpr)
        } else {
            mediaMatcher.addListener(updateDpr)
        }

        return () => {
            if (mediaMatcher.removeEventListener) {
                mediaMatcher.removeEventListener('change', updateDpr)
            } else {
                mediaMatcher.removeListener(updateDpr)
            }
        }
    }, [currentDpr, defaultDpr, maxDpr, round])

    return currentDpr
}

export function getDevicePixelRatio(options = {}) {
    const {defaultDpr = 1, maxDpr = 3, round = true} = options || {}
    const hasDprProp = typeof window !== 'undefined' && typeof window.devicePixelRatio === 'number'
    const dpr = hasDprProp ? window.devicePixelRatio : defaultDpr
    return Math.min(Math.max(1, round ? Math.floor(dpr) : dpr), maxDpr)
}