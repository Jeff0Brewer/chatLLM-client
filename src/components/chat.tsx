import React, { FC, useState, useEffect } from 'react'
import type { ChatCompletionRequestMessage as Message } from 'openai'
import ModelDropdown from '@/components/model-dropdown'
import MessageInput from '@/components/message-input'
import MessageList from '@/components/message-list'
import { jsonPostBody } from '@/lib/fetch'
import styles from '@/styles/Chat.module.css'

const DEFAULT_MODEL = 'GPT-3.5-turbo'

const Chat: FC = () => {
    const [model, setModel] = useState<string>(DEFAULT_MODEL)
    const [messages, setMessages] = useState<Array<Message>>([])

    useEffect(() => {
        if (messages.length && messages[messages.length - 1].role === 'user') {
            getCompletion()
        }
    }, [messages])

    // complete current message list, append new message
    const getCompletion = async (): Promise<void> => {
        const res = await fetch('/api/complete', jsonPostBody({ model, messages }))
        if (!res.ok) {
            const { message } = await res.json()
            throw new Error(`Completion error: ${message}`)
        }
        const reader = await res.body?.getReader()
        if (!reader) {
            throw new Error('Invalid stream reader from endpoint')
        }
        // explicit any type since ReadableStreamReadResult interface is private :)
        let content = ''
        const readStream = ({ done, value }: any): Promise<void> | void => {
            if (done) {
                console.log('stream end')
                return
            }
            const lines = Buffer.from(value)
                .toString()
                .split('\n')
                .filter(line => line.trim() !== '')
            for (const line of lines) {
                const response = line.replace(/^data: /, '')
                if (response === '[DONE]') {
                    return
                } else {
                    const token = JSON.parse(response)?.choices?.[0]?.delta?.content
                    if (token) {
                        content += token
                        setMessages([...messages, { role: 'assistant', content }])
                    }
                }
            }
            return reader.read().then(readStream)
        }
        await reader.read().then(readStream)
    }

    // add message to curr list
    const addMessage = (msg: Message): void => {
        setMessages([...messages, msg])
    }

    return (
        <main className={styles.chat}>
            { messages.length === 0
                ? <ModelDropdown model={model} setModel={setModel} />
                : <MessageList model={model} messages={messages} /> }
            <div className={styles.bottom}>
                <MessageInput addMessage={addMessage} />
                <p className={styles.footer}>
                    ChatGPT may produce inaccurate information about people, places, or facts.
                </p>
            </div>
        </main>
    )
}

export default Chat
