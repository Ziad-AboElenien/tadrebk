'use client';

import { useCallback, useState } from 'react';

/*
 * TODO(BACKEND): this whole file is a client-side stand-in for backend fields
 * that do not exist yet. Every type below maps to a proposed API field
 * (see BACKEND_GAPS.md). When the backend supports them, replace the
 * localStorage read/write with API calls and keep the same interface.
 */

export type SkillSourceType = 'self' | 'education' | 'internship' | 'other';

export interface SkillMeta {
  /** How the student acquired the skill */
  source: SkillSourceType;
  /** Reference label: education institution/field or internship title, or free text for "other" */
  ref?: string;
  /** Optional student note / description */
  description?: string;
}

export interface CourseMeta {
  startDate?: string;
  endDate?: string;
  /** Still ongoing — end date is ignored */
  present?: boolean;
  description?: string;
}

export interface EducationMeta {
  description?: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface ProfileMeta {
  skills: Record<string, SkillMeta>;
  courses: Record<string, CourseMeta>;
  education: Record<string, EducationMeta>;
  socials: SocialLink[];
}

const EMPTY: ProfileMeta = { skills: {}, courses: {}, education: {}, socials: [] };
const LS_KEY = 'tadrebk_profile_meta';

function readAll(): Record<string, ProfileMeta> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, ProfileMeta>) : {};
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, ProfileMeta>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(all));
  } catch {
    // storage full/unavailable — ignore
  }
}

export function getProfileMeta(userId: string | null | undefined): ProfileMeta {
  if (!userId) return EMPTY;
  return { ...EMPTY, ...(readAll()[userId] || {}) };
}

export function saveProfileMeta(userId: string, patch: Partial<ProfileMeta>) {
  if (!userId) return;
  const all = readAll();
  all[userId] = { ...EMPTY, ...(all[userId] || {}), ...patch };
  writeAll(all);
}

export function setSkillMeta(userId: string, skillName: string, meta: SkillMeta) {
  const current = getProfileMeta(userId);
  saveProfileMeta(userId, { skills: { ...current.skills, [skillName]: meta } });
}

export function removeSkillMeta(userId: string, skillName: string) {
  const current = getProfileMeta(userId);
  const skills = { ...current.skills };
  delete skills[skillName];
  saveProfileMeta(userId, { skills });
}

export function setCourseMeta(userId: string, courseName: string, meta: CourseMeta) {
  const current = getProfileMeta(userId);
  saveProfileMeta(userId, { courses: { ...current.courses, [courseName]: meta } });
}

export function removeCourseMeta(userId: string, courseName: string) {
  const current = getProfileMeta(userId);
  const courses = { ...current.courses };
  delete courses[courseName];
  saveProfileMeta(userId, { courses });
}

export function setEducationMeta(userId: string, key: string, meta: EducationMeta) {
  const current = getProfileMeta(userId);
  saveProfileMeta(userId, { education: { ...current.education, [key]: meta } });
}

/** Stable key for an education entry (index + institution). */
export function educationKey(index: number, institution?: string): string {
  return `${index}::${institution || ''}`;
}

const SOCIAL_ID = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `s-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

export function setSocials(userId: string, socials: SocialLink[]) {
  saveProfileMeta(userId, { socials });
}

export function newSocialId(): string {
  return SOCIAL_ID();
}

/** React hook — live profile metadata for a user, re-read when userId changes. */
export function useProfileMeta(userId: string | null | undefined) {
  const [prevUserId, setPrevUserId] = useState(userId);
  const [meta, setMeta] = useState<ProfileMeta>(() => getProfileMeta(userId));

  // Adjust cached metadata during render when the user changes
  // (the documented alternative to syncing state inside an effect).
  if (prevUserId !== userId) {
    setPrevUserId(userId);
    setMeta(getProfileMeta(userId));
  }

  const refresh = useCallback(() => {
    setMeta(getProfileMeta(userId));
  }, [userId]);

  return { meta, refresh };
}

export const SKILL_SOURCE_LABELS: Record<SkillSourceType, string> = {
  self: 'Self-study',
  education: 'From my education',
  internship: 'From an internship',
  other: 'Other',
};

export const SOCIAL_PLATFORMS = [
  'LinkedIn',
  'GitHub',
  'X (Twitter)',
  'Portfolio',
  'Behance',
  'Dribbble',
  'Facebook',
  'Instagram',
  'Other',
];
