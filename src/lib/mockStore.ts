// Mock Authentication and Data Storage using LocalStorage
export interface User {
  uid: string;
  email: string;
  displayName: string;
}

export interface Complaint {
  id: string;
  userId: string;
  issueType: string;
  description: string;
  ward: string;
  department: string;
  status: string;
  trackingId: string;
  createdAt: string;
  imageUrl?: string;
  locationName: string;
}

const USER_KEY = 'civicsense_user';
const COMPLAINTS_KEY = 'civicsense_complaints';

export const mockAuth = {
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },
  signIn: (email: string): User => {
    const user = { uid: 'user_' + Math.random().toString(36).substr(2, 9), email, displayName: email.split('@')[0] };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('auth-change'));
    return user;
  },
  signOut: () => {
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event('auth-change'));
  },
  onAuthStateChange: (callback: (user: User | null) => void) => {
    const handler = () => callback(mockAuth.getCurrentUser());
    window.addEventListener('auth-change', handler);
    // Initial call
    handler();
    return () => window.removeEventListener('auth-change', handler);
  }
};

export const mockDb = {
  getComplaints: (userId: string): Complaint[] => {
    const data = localStorage.getItem(COMPLAINTS_KEY);
    const all: Complaint[] = data ? JSON.parse(data) : [];
    return all.filter(c => c.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  addComplaint: (complaint: Omit<Complaint, 'id'>): Complaint => {
    const data = localStorage.getItem(COMPLAINTS_KEY);
    const all: Complaint[] = data ? JSON.parse(data) : [];
    const newComplaint = { ...complaint, id: 'comp_' + Math.random().toString(36).substr(2, 9) };
    all.push(newComplaint);
    localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(all));
    return newComplaint;
  }
};
