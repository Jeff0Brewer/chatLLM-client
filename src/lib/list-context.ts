import { createContext, useContext } from 'react'
import type { ChatCompletionRequestMessage as Message } from 'openai'

type ListContextValues = {
    inds: Array<number>,
    addVariant: (nodeInd: Array<number>, message: Message) => void,
    changeVariant: (nodeInd: Array<number>, delta: number) => void
}

const ListContext = createContext<ListContextValues | null>(null)

const useListContext = (): ListContextValues => {
    const values = useContext(ListContext)
    if (!values) {
        throw new Error('ListContext uninitialized')
    }
    return values
}

export default ListContext

export {
    useListContext
}
