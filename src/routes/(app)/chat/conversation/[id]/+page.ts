import type { PageLoad } from './$types';
import { chatStore } from '$lib/stores/chat';
import { error } from '@sveltejs/kit';

export const load = (({ params }) => {
    const conversation = chatStore.getConversation(params.id);
    
    if (!conversation) {
        throw error(404, 'Conversation not found');
    }

    return {
        conversation,
        breadcrumb: 'Conversation'
    };
}) satisfies PageLoad; 