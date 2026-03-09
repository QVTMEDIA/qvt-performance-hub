export type Role = 'employee' | 'lead' | 'hr' | 'coo' | 'ceo';

export type ReviewStatus =
  | 'draft'
  | 'self_done'
  | 'lead_done'
  | 'hr_done'
  | 'coo_done'
  | 'completed';

export type Period = string; // e.g. 'Q1 2026'

export type ScoreVal = 1 | 2 | 3 | 4 | 5;

export interface SelfReview {
  behavioral: Record<string, ScoreVal>;
  functional: Record<string, ScoreVal>;
  text: {
    accomplishments: string;
    challenges: string;
    goals: string;
    techDev: string;
    behDev: string;
  };
  submittedAt: string;
}

export interface LeadReview {
  behavioral: Record<string, ScoreVal>;
  functional: Record<string, ScoreVal>;
  text: {
    strengths: string;
    improvements: string;
    trainings: string;
    employeeComments: string;
    recommendation: string; // 'Promote' | 'Retain' | 'PIP' | 'Review'
  };
  submittedAt: string;
}

export interface HRReview {
  text: {
    hrComments: string;
    techDev: string;
    behDev: string;
    hrRemarks: string;
  };
  submittedAt: string;
}

export interface COOReview {
  text: {
    strategicAlignment: string;
    cooComments: string;
    disapprovalNote?: string;
  };
  submittedAt: string;
  decision: 'approved' | 'returned';
}

export interface CEOReview {
  text: {
    finalDecision: string;
    ceoNotes: string;
    disapprovalNote?: string;
  };
  submittedAt: string;
  decision: 'approved' | 'returned';
}

export interface Reminder {
  id: string;
  reviewId: string;
  toRole: Role;
  message: string;
  sentAt: string;
  sentBy: Role;
  read: boolean;
}

export interface Review {
  id: string;
  createdAt: string;
  status: ReviewStatus;
  employeeName: string;
  jobTitle: string;
  department: string;
  supervisorName: string;
  resumptionDate: string;
  period: Period;
  selfReview: SelfReview | null;
  leadReview: LeadReview | null;
  hrReview: HRReview | null;
  cooReview: COOReview | null;
  ceoReview: CEOReview | null;
}
