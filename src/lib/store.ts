
"use client"
import { Participant } from './types';

const STORE_KEY = 'cocoro_participants';

export function getParticipants(): Participant[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading participants from localStorage:", error);
    return [];
  }
}

export function saveParticipant(participant: Participant) {
  try {
    const participants = getParticipants();
    const index = participants.findIndex(p => p.id === participant.id);
    
    let newParticipants;
    if (index > -1) {
      newParticipants = [...participants];
      newParticipants[index] = participant;
    } else {
      newParticipants = [...participants, participant];
    }
    
    localStorage.setItem(STORE_KEY, JSON.stringify(newParticipants));
    return newParticipants;
  } catch (error) {
    console.error("Error saving participant to localStorage:", error);
    return getParticipants();
  }
}

export function deleteParticipant(id: string) {
  try {
    const participants = getParticipants();
    const newParticipants = participants.filter(p => p.id !== id);
    localStorage.setItem(STORE_KEY, JSON.stringify(newParticipants));
    return newParticipants;
  } catch (error) {
    console.error("Error deleting participant from localStorage:", error);
    return getParticipants();
  }
}

export function clearAllData() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify([]));
    return [];
  } catch (error) {
    console.error("Error clearing localStorage:", error);
    return [];
  }
}

export function findParticipantByDni(dni: string): Participant | undefined {
  return getParticipants().find(p => p.dni === dni);
}

export function findParticipantById(id: string): Participant | undefined {
  return getParticipants().find(p => p.id === id);
}

export function updateParticipantStatus(id: string, status: Participant['status'], qrCode?: string) {
  const participant = findParticipantById(id);
  if (participant) {
    participant.status = status;
    if (qrCode) participant.qrCode = qrCode;
    return saveParticipant(participant);
  }
  return getParticipants();
}

export function updateMembershipStatus(id: string, status: Participant['membershipStatus']) {
  const participant = findParticipantById(id);
  if (participant) {
    participant.membershipStatus = status;
    return saveParticipant(participant);
  }
  return getParticipants();
}

export function markAttendance(id: string) {
  const participant = findParticipantById(id);
  if (participant && participant.status === 'validated' && participant.membershipStatus === 'active') {
    const alreadyPresent = participant.attendance === 'present';
    participant.attendance = 'present';
    saveParticipant(participant);
    return !alreadyPresent; // Retorna true solo si es la primera vez que se marca presente
  }
  return false;
}
