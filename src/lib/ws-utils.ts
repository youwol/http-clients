/** @format */

import { ContextMessage, Label } from './py-youwol'
import { Observable } from 'rxjs'
import { filter } from 'rxjs/operators'

export type ContextMessage$<T> = Observable<ContextMessage<T>>

export function filterCtxMessage<T = unknown>({
    withAttributes,
    withLabels,
}: {
    withAttributes?: {
        [_key: string]: string | ((string) => boolean)
    }
    withLabels?: Label[]
}): (source$: ContextMessage$<unknown>) => ContextMessage$<T> {
    withAttributes = withAttributes || {}
    withLabels = withLabels || []
    return (source$: Observable<ContextMessage>) =>
        source$.pipe(
            filter((message: ContextMessage) => {
                const attrsOk =
                    message.attributes &&
                    Object.entries(withAttributes).reduce((acc, [k, v]) => {
                        if (!acc || !message.attributes[k]) {
                            return false
                        }
                        if (typeof v == 'string') {
                            return message.attributes[k] == v
                        }

                        return v(message.attributes[k])
                    }, true)

                const labelsOk =
                    message.labels &&
                    withLabels.reduce(
                        (acc, label) => acc && message.labels.includes(label),
                        true,
                    )

                return attrsOk && labelsOk
            }),
        ) as ContextMessage$<T>
}
