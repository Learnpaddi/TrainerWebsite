import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  addDoc,
  type QuerySnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { auth, db } from './config';
import { getUserCourses } from './courseService';
import { getCourseEnrollments } from './enrollmentService';
import { getUserDoc, type UserDoc } from './userService';

export interface MessageContact {
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
  lastMessageText: string;
  lastMessageSenderId: string;
  lastMessageAt?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'student' | 'trainer';
  text: string;
  createdAt?: string;
}

const toIsoString = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  return undefined;
};

const normalizeConversation = (conversationId: string, data: DocumentData): ConversationRecord => ({
  id: conversationId,
  studentId: data.studentId,
  trainerId: data.trainerId,
  participantIds: Array.isArray(data.participantIds) ? data.participantIds : [],
  participantNames: data.participantNames || {},
  lastMessageText: data.lastMessageText || '',
  lastMessageSenderId: data.lastMessageSenderId || '',
  lastMessageAt: toIsoString(data.lastMessageAt),
  updatedAt: toIsoString(data.updatedAt),
  createdAt: toIsoString(data.createdAt),
});

const normalizeMessage = (messageId: string, conversationId: string, data: DocumentData): MessageRecord => ({
  id: messageId,
  conversationId,
  senderId: data.senderId,
  senderRole: data.senderRole,
  text: data.text || '',
  createdAt: toIsoString(data.createdAt),
});

const buildConversationId = (studentId: string, trainerId: string) => `${studentId}_${trainerId}`;

const requireAuthenticatedUser = () => {
  const currentUser = auth.currentUser;
  if (!currentUser?.uid) {
    throw new Error('You must be signed in to send a message.');
  }
  return currentUser;
};

const requireRolePair = async (studentId: string, trainerId: string) => {
  const [student, trainer] = await Promise.all([getUserDoc(studentId), getUserDoc(trainerId)]);

  if (!student || student.role !== 'student') {
    throw new Error('Selected student account was not found.');
  }

  if (!trainer || trainer.role !== 'trainer') {
    throw new Error('Selected trainer account was not found.');
  }

  return { student, trainer };
};

const dedupeContacts = (contacts: MessageContact[]) => {
  const map = new Map<string, MessageContact>();
  contacts.forEach((contact) => {
    map.set(contact.uid, contact);
  });
  return Array.from(map.values()).sort((left, right) => left.name.localeCompare(right.name));
};

const toContact = (user: UserDoc | null): MessageContact | null => {
  if (!user?.uid || !user.role) {
    return null;
  }

  return {
    uid: user.uid,
    name: user.name || user.email || 'LearnPaddi User',
    email: user.email || '',
    role: user.role,
  };
};

export const getAvailableMessageContacts = async (currentUser: UserDoc): Promise<MessageContact[]> => {
  if (currentUser.role === 'student') {
    const enrolledCourseIds = currentUser.enrolledCourses || [];
    const courseLookups = await Promise.all(enrolledCourseIds.map((courseId) => getDoc(doc(db, 'courses', courseId))));
    const trainerIds = Array.from(new Set(
      courseLookups
        .map((courseSnap) => (courseSnap.exists() ? courseSnap.data().trainerId as string | undefined : undefined))
        .filter((value): value is string => Boolean(value)),
    ));

    const trainers = await Promise.all(trainerIds.map((trainerId) => getUserDoc(trainerId)));
    return dedupeContacts(trainers.map(toContact).filter((contact): contact is MessageContact => Boolean(contact)));
  }

  const ownedCourses = await getUserCourses(currentUser.uid);
  const enrollmentSets = await Promise.all(ownedCourses.map((course) => getCourseEnrollments(course.id)));
  const studentIds = Array.from(new Set(
    enrollmentSets.flat().map((enrollment) => enrollment.userId).filter(Boolean),
  ));
  const students = await Promise.all(studentIds.map((studentId) => getUserDoc(studentId)));
  return dedupeContacts(students.map(toContact).filter((contact): contact is MessageContact => Boolean(contact)));
};

export const subscribeUserConversations = (
  userId: string,
  onChange: (conversations: ConversationRecord[]) => void,
  onError: (error: Error) => void,
) => onSnapshot(
  query(collection(db, 'conversations'), where('participantIds', 'array-contains', userId)),
  (snapshot: QuerySnapshot<DocumentData>) => {
    const conversations = snapshot.docs
      .map((conversationDoc) => normalizeConversation(conversationDoc.id, conversationDoc.data()))
      .sort((left, right) => {
        const leftTime = left.updatedAt || left.lastMessageAt || left.createdAt || '';
        const rightTime = right.updatedAt || right.lastMessageAt || right.createdAt || '';
        return rightTime.localeCompare(leftTime);
      });
    onChange(conversations);
  },
  (error) => onError(error instanceof Error ? error : new Error('Unable to load conversations.')),
);

export const subscribeConversationMessages = (
  conversationId: string,
  onChange: (messages: MessageRecord[]) => void,
  onError: (error: Error) => void,
) => onSnapshot(
  query(collection(db, 'conversations', conversationId, 'messages'), orderBy('createdAt', 'asc')),
  (snapshot: QuerySnapshot<DocumentData>) => {
    const messages = snapshot.docs.map((messageDoc) => normalizeMessage(messageDoc.id, conversationId, messageDoc.data()));
    onChange(messages);
  },
  (error) => onError(error instanceof Error ? error : new Error('Unable to load messages.')),
);

export const sendConversationMessage = async ({
  studentId,
  trainerId,
  text,
}: {
  studentId: string;
  trainerId: string;
  text: string;
}) => {
  const currentUser = requireAuthenticatedUser();
  const trimmedText = text.trim();

  if (!trimmedText) {
    return;
  }

  const { student, trainer } = await requireRolePair(studentId, trainerId);
  if (currentUser.uid !== studentId && currentUser.uid !== trainerId) {
    throw new Error('You can send messages only in your own conversation.');
  }

  const conversationId = buildConversationId(studentId, trainerId);
  const senderRole = currentUser.uid === trainerId ? 'trainer' : 'student';
  const conversationRef = doc(db, 'conversations', conversationId);
  const conversationSnapshot = await getDoc(conversationRef);

  await setDoc(conversationRef, {
    studentId,
    trainerId,
    participantIds: [studentId, trainerId],
    participantNames: {
      [studentId]: student.name || student.email || 'Student',
      [trainerId]: trainer.name || trainer.email || 'Trainer',
    },
    lastMessageText: trimmedText,
    lastMessageSenderId: currentUser.uid,
    lastMessageAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...(!conversationSnapshot.exists() ? { createdAt: serverTimestamp() } : {}),
  }, { merge: true });

  await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
    conversationId,
    senderId: currentUser.uid,
    senderRole,
    text: trimmedText,
    createdAt: serverTimestamp(),
  });
};

export const getOrCreateConversationId = async ({
  currentUser,
  contact,
}: {
  currentUser: UserDoc;
  contact: MessageContact;
}) => {
  const studentId = currentUser.role === 'student' ? currentUser.uid : contact.uid;
  const trainerId = currentUser.role === 'trainer' ? currentUser.uid : contact.uid;

  await requireRolePair(studentId, trainerId);
  return buildConversationId(studentId, trainerId);
};
