import type { UserDoc } from '@/services/database/userService';

export interface MessageContact {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: 'student' | 'trainer';
}

export interface ConversationRecord {
  id: string;
  studentId: string;
  trainerId: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  lastMessage?: string;
  lastMessageText?: string;
  lastMessageAt?: string;
  updatedAt: string;
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'student' | 'trainer';
  text: string;
  createdAt: string;
}

const CONVERSATIONS_KEY = 'learnpaddi-demo-conversations';
const MESSAGES_KEY = 'learnpaddi-demo-messages';

const read = <T,>(key: string, fallback: T): T => {
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const write = <T,>(key: string, value: T) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const getAvailableMessageContacts = async (_currentUser: UserDoc): Promise<MessageContact[]> => {
  void _currentUser;
  return [];
};

export const subscribeUserConversations = (
  currentUser: UserDoc | string,
  callback: (conversations: ConversationRecord[]) => void,
  _onError?: (error: Error) => void,
) => {
  void _onError;
  const uid = typeof currentUser === 'string' ? currentUser : currentUser.uid;
  const conversations = read<ConversationRecord[]>(CONVERSATIONS_KEY, [])
    .filter((conversation) => conversation.participantIds.includes(uid));
  callback(conversations);
  return () => {};
};

export const subscribeConversationMessages = (
  conversationId: string,
  callback: (messages: MessageRecord[]) => void,
  _onError?: (error: Error) => void,
) => {
  void _onError;
  callback(read<MessageRecord[]>(MESSAGES_KEY, []).filter((message) => message.conversationId === conversationId));
  return () => {};
};

export const sendConversationMessage = async (input: {
  conversationId?: string;
  senderId?: string;
  senderRole?: 'student' | 'trainer';
  studentId?: string;
  trainerId?: string;
  text: string;
}) => {
  const conversationId = input.conversationId || `${input.studentId}_${input.trainerId}`;
  const message: MessageRecord = {
    id: `message-${Date.now()}`,
    conversationId,
    senderId: input.senderId || input.studentId || input.trainerId || 'system',
    senderRole: input.senderRole || 'student',
    text: input.text,
    createdAt: new Date().toISOString(),
  };
  write(MESSAGES_KEY, [message, ...read<MessageRecord[]>(MESSAGES_KEY, [])]);
  return message;
};

export const getOrCreateConversationId = async (input: {
  studentId?: string;
  trainerId?: string;
  currentUser?: UserDoc;
  contact?: MessageContact;
}) => {
  const studentId = input.studentId || (input.currentUser?.role === 'student' ? input.currentUser.uid : input.contact?.uid) || '';
  const trainerId = input.trainerId || (input.currentUser?.role === 'trainer' ? input.currentUser.uid : input.contact?.uid) || '';
  const id = `${studentId}_${trainerId}`;
  const conversations = read<ConversationRecord[]>(CONVERSATIONS_KEY, []);
  if (!conversations.some((conversation) => conversation.id === id)) {
    write(CONVERSATIONS_KEY, [
      {
        id,
        studentId,
        trainerId,
        participantIds: [studentId, trainerId],
        participantNames: {},
        lastMessageText: '',
        lastMessageAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ...conversations,
    ]);
  }
  return id;
};
