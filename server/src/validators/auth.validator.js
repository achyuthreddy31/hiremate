import { z } from 'zod';

export const userProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  education: z.array(z.object({
    institution: z.string().optional(),
    degree: z.string().optional(),
    fieldOfStudy: z.string().optional(),
    startYear: z.number().optional(),
    endYear: z.number().optional(),
    level: z.enum(['diploma', 'bachelor', 'master', 'doctorate', 'other']).default('bachelor')
  })).default([]),
  skills: z.array(z.string()).default([]),
  softSkills: z.array(z.string()).default([]),
  experience: z.array(z.object({
    company: z.string().optional(),
    role: z.string().optional(),
    startDate: z.string().or(z.date()).optional(),
    endDate: z.string().or(z.date()).optional().nullable(),
    isCurrent: z.boolean().default(false),
    isInternship: z.boolean().default(false),
    description: z.string().optional()
  })).default([]),
  projects: z.array(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    skills: z.array(z.string()).default([]),
    link: z.string().optional()
  })).default([]),
  certifications: z.array(z.object({
    name: z.string().min(1),
    issuer: z.string().optional(),
    issueDate: z.string().or(z.date()).optional(),
    credentialUrl: z.string().optional()
  })).default([]),
  links: z.object({
    github: z.string().default(''),
    linkedin: z.string().default(''),
    portfolio: z.string().default('')
  }).default({}),
  careerInterests: z.array(z.string()).default([]),
  currentLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner')
});

export const applicationSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  jobDescription: z.string().min(10, 'Job description must be at least 10 characters'),
  jobUrl: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
  employmentType: z.enum(['full_time', 'part_time', 'internship', 'contract', 'remote']).default('full_time'),
  experienceLevel: z.enum(['entry_level', 'mid_level', 'senior_level', 'lead']).default('entry_level'),
  interviewDate: z.string().datetime().nullable().optional().or(z.literal(null)),
  availableDays: z.number().min(1).max(180).default(14),
  dailyPreparationMinutes: z.number().min(20).max(480).default(60),
  status: z.enum(['applied', 'interviewing', 'offer', 'rejected', 'archived']).default('interviewing')
});
