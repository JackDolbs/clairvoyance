import { writable } from 'svelte/store';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface ChatConversation {
    id: string;
    title: string;  // First few words of first message
    messages: ChatMessage[];
    lastUpdated: Date;
    contexts: string[];  // IDs of contexts used in this chat
}

function createChatStore() {
    const { subscribe, set, update } = writable<ChatConversation[]>([]);

    return {
        subscribe,
        addConversation: (firstMessage: string, contexts: string[]) => {
            const id = crypto.randomUUID();
            const title = firstMessage.split(' ').slice(0, 5).join(' ') + '...';
            
            update(conversations => [{
                id,
                title,
                messages: [],
                lastUpdated: new Date(),
                contexts
            }, ...conversations]);

            return id;
        },
        addMessage: (conversationId: string, message: ChatMessage) => {
            update(conversations => {
                const conversation = conversations.find(c => c.id === conversationId);
                if (conversation) {
                    conversation.messages = [...conversation.messages, message];
                    conversation.lastUpdated = new Date();
                }
                return conversations;
            });
        },
        getConversation: (id: string) => {
            let result: ChatConversation | undefined;
            update(conversations => {
                result = conversations.find(c => c.id === id);
                return conversations;
            });
            return result;
        }
    };
}

export const chatStore = createChatStore(); 