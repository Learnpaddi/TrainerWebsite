import { Loader2, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  getAvailableMessageContacts,
  getOrCreateConversationId,
  sendConversationMessage,
  subscribeConversationMessages,
  subscribeUserConversations,
  type ConversationRecord,
  type MessageContact,
  type MessageRecord,
} from '@/services/firebase/messageService';

const formatMessageTime = (value?: string) => {
  if (!value) {
    return 'Just now';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Just now';
  }

  return parsed.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const MessagesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [contacts, setContacts] = useState<MessageContact[]>([]);
  const [conversations, setConversations] = useState<ConversationRecord[]>([]);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [sending, setSending] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.doc) {
      setContacts([]);
      setLoadingContacts(false);
      return;
    }

    let active = true;
    setLoadingContacts(true);

    getAvailableMessageContacts(user.doc)
      .then((nextContacts) => {
        if (!active) {
          return;
        }
        setContacts(nextContacts);
        setLoadingContacts(false);
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }
        setPageError(error instanceof Error ? error.message : 'Unable to load message contacts.');
        setLoadingContacts(false);
      });

    return () => {
      active = false;
    };
  }, [user?.doc]);

  useEffect(() => {
    if (!user?.uid) {
      setConversations([]);
      return undefined;
    }

    return subscribeUserConversations(
      user.uid,
      (nextConversations) => {
        setConversations(nextConversations);
      },
      (error) => {
        setPageError(error.message);
      },
    );
  }, [user?.uid]);

  useEffect(() => {
    if (!conversations.length) {
      setSelectedConversationId(null);
      return;
    }

    const hasSelectedConversation = selectedConversationId
      ? conversations.some((conversation) => conversation.id === selectedConversationId)
      : false;

    if (!hasSelectedConversation) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return undefined;
    }

    return subscribeConversationMessages(
      selectedConversationId,
      (nextMessages) => {
        setMessages(nextMessages);
      },
      (error) => {
        setPageError(error.message);
      },
    );
  }, [selectedConversationId]);

  const currentConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) || null,
    [conversations, selectedConversationId],
  );

  const userRole = user?.doc?.role;
  const visibleConversations = useMemo(() => conversations
    .filter((conversation) => (
      conversation.studentId === user?.uid
      || conversation.trainerId === user?.uid
    ))
    .map((conversation) => {
      const otherUserId = conversation.studentId === user?.uid ? conversation.trainerId : conversation.studentId;
      const matchingContact = contacts.find((contact) => contact.uid === otherUserId);
      return {
        ...conversation,
        contactName: matchingContact?.name || conversation.participantNames[otherUserId] || 'LearnPaddi User',
      };
    }), [contacts, conversations, user?.uid]);

  const availableNewContacts = useMemo(() => {
    const openConversationContactIds = new Set(
      conversations.map((conversation) => (conversation.studentId === user?.uid ? conversation.trainerId : conversation.studentId)),
    );

    return contacts.filter((contact) => !openConversationContactIds.has(contact.uid));
  }, [contacts, conversations, user?.uid]);

  const handleCreateConversation = async (contact: MessageContact) => {
    if (!user?.doc) {
      return;
    }

    try {
      setPageError(null);
      const conversationId = await getOrCreateConversationId({
        currentUser: user.doc,
        contact,
      });
      setSelectedConversationId(conversationId);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Unable to open conversation.');
    }
  };

  const handleSend = async () => {
    const message = draft.trim();
    if (!message || !currentConversation || sending) {
      return;
    }

    try {
      setSending(true);
      setPageError(null);
      await sendConversationMessage({
        studentId: currentConversation.studentId,
        trainerId: currentConversation.trainerId,
        text: message,
      });
      setDraft('');
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Unable to send message.');
    } finally {
      setSending(false);
    }
  };

  const isLoading = authLoading || loadingContacts;

  if (isLoading) {
    return (
      <div className="flex min-h-[340px] items-center justify-center rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <Loader2 className="h-4.5 w-4.5 animate-spin" />
          Loading conversations...
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-corporate-text">Inbox</p>
          <span className="text-xs text-corporate-muted">
            {userRole === 'trainer' ? 'Enrolled students' : 'Your trainers'}
          </span>
        </div>

        {availableNewContacts.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Start a conversation</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {availableNewContacts.map((contact) => (
                <button
                  key={contact.uid}
                  type="button"
                  onClick={() => handleCreateConversation(contact)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  {contact.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-4 space-y-2">
          {visibleConversations.length > 0 ? visibleConversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => setSelectedConversationId(conversation.id)}
              className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                selectedConversationId === conversation.id
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-corporate-text">{conversation.contactName}</p>
                <span className="text-xs text-corporate-muted">{formatMessageTime(conversation.lastMessageAt)}</span>
              </div>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {userRole === 'trainer' ? 'Student conversation' : 'Trainer conversation'}
              </p>
              <p className="mt-1 text-xs text-corporate-muted">{conversation.lastMessageText || 'No messages yet.'}</p>
            </button>
          )) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              {contacts.length > 0
                ? 'Select a registered contact above to start your first conversation.'
                : 'No registered trainer-student conversation partners are available yet.'}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md">
        <p className="text-sm font-semibold text-corporate-text">Conversation</p>

        {pageError ? (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {pageError}
          </div>
        ) : null}

        {currentConversation ? (
          <>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
              <div>
                <p className="text-sm font-semibold text-corporate-text">
                  {currentConversation.participantNames[
                    currentConversation.studentId === user?.uid ? currentConversation.trainerId : currentConversation.studentId
                  ] || 'Conversation'}
                </p>
                <p className="mt-1 text-xs text-corporate-muted">
                  {userRole === 'trainer' ? 'Messaging a registered student' : 'Messaging a registered trainer'}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              {messages.length > 0 ? messages.map((message) => {
                const isCurrentUser = message.senderId === user?.uid;
                return (
                  <div
                    key={message.id}
                    className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                      isCurrentUser
                        ? 'ml-auto bg-blue-600 text-white'
                        : 'bg-white text-corporate-secondary'
                    }`}
                  >
                    <p>{message.text}</p>
                    <p className={`mt-1 text-[11px] ${isCurrentUser ? 'text-blue-100' : 'text-slate-400'}`}>
                      {message.senderRole === 'trainer' ? 'Trainer' : 'Student'} • {formatMessageTime(message.createdAt)}
                    </p>
                  </div>
                );
              }) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                  No messages yet. Start the conversation below.
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type your message..."
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    void handleSend();
                  }
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-corporate-text outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={sending}
                className="inline-flex rounded-xl bg-corporate-accent p-2.5 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Send className="h-4.5 w-4.5" />}
              </button>
            </div>
          </>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-sm text-slate-500">
            Choose a registered trainer or student conversation to view messages.
          </div>
        )}
      </section>
    </div>
  );
};

export default MessagesPage;
