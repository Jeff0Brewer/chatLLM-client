import type { NextApiRequest, NextApiResponse } from 'next'
import type { ChatCompletionRequestMessage } from 'openai'
import type { ErrorResponse } from '@/lib/types'
import OpenAi from '@/lib/openai'

type Data = {
    content: string
}

const complete = async (
    req: NextApiRequest,
    res: NextApiResponse<Data | ErrorResponse>
): Promise<void> => {
    if (typeof req.body?.model !== 'string') {
        res.status(405).json({ message: 'Invalid model id' })
        return
    }
    if (!(req.body?.messages satisfies Array<ChatCompletionRequestMessage>)) {
        res.status(405).json({ message: 'Invalid message list' })
        return
    }
    const completion = await OpenAi.createChatCompletion({
        model: req.body.model.toLowerCase(),
        messages: req.body.messages
    })
    const { choices } = completion.data
    if (
        choices.length > 0 &&
        choices[0]?.message &&
        choices[0]?.finish_reason === 'stop'
    ) {
        res.status(200).json({ content: choices[0].message.content })
        return
    }
    res.status(500).json({ message: 'Completion failed' })
}

export default complete
