import { Injectable, signal } from '@angular/core';

export interface TranslationKeys {
  // App
  APP_TITLE: string;
  
  // Navigation
  ATTENDANCE: string;
  MEETING_MINUTES: string;
  LOAN_MANAGEMENT: string;
  ORGANIZE_MEETINGS: string;
  REPORTS_ANALYTICS: string;
  PROFILE: string;
  LOGOUT: string;
  
  // Authentication
  LOGIN: string;
  REGISTER: string;
  
  // Dashboard
  DASHBOARD: string;
  ADMIN_DASHBOARD: string;
  MANAGE_MEMBERS: string;
  MANAGE_LOANS: string;
  
  // Attendance
  ATTENDANCE_SYSTEM: string;
  MARK_YOUR_ATTENDANCE: string;
  MARK_ATTENDANCE: string;
  SCANNING_FACE: string;
  GETTING_LOCATION: string;
  ATTENDANCE_MARKED_SUCCESS: string;
  ERROR_MARKING_ATTENDANCE: string;
  LOCATION_DETAILS: string;
  LATITUDE: string;
  LONGITUDE: string;
  
  // Meeting Minutes
  MEETING_MINUTES_GENERATOR: string;
  RECORD_MEETING: string;
  SELECT_MEETING: string;
  SELECT_MEETING_HINT: string;
  MEETING_DETAILS: string;
  TITLE: string;
  DATE: string;
  LOCATION: string;
  DESCRIPTION: string;
  START_RECORDING: string;
  STOP_RECORDING: string;
  GENERATE_MINUTES: string;
  CLEAR: string;
  RECORDING_IN_PROGRESS: string;
  MEETING_TRANSCRIPT: string;
  MEETING_SUMMARY: string;
  COPY_TRANSCRIPT: string;
  COPY_SUMMARY: string;
  DOWNLOAD_TRANSCRIPT: string;
  DOWNLOAD_SUMMARY: string;
  NO_MEETINGS_AVAILABLE: string;
  SCHEDULE_MEETING_FIRST: string;
  SCHEDULE_MEETING: string;
  
  // Loan Management
  LOAN_MANAGEMENTs: string;
  APPLY_FOR_LOAN: string;
  LOAN_APPLICATIONS: string;
  LOAN_AMOUNT: string;
  LOAN_PURPOSE: string;
  PURPOSE_DESCRIPTION: string;
  ADDITIONAL_DETAILS: string;
  APPLY_LOAN: string;
  LOAN_ID: string;
  APPLIED_DATE: string;
  STATUS: string;
  NO_LOAN_APPLICATIONS: string;
  TENURE_MONTHS: string;
  INTEREST_RATE: string;
  EMI_CALCULATOR: string;
  ESTIMATED_MONTHLY_EMI: string;

  // Admin Loan Management
  LOAN_NUMBER: string;
  APPLICANT: string;
  PURPOSE: string;
  APPLIED_DATEs: string;
  LOAN_DETAILS: string;
  APPROVE_LOAN: string;
  REJECT_LOAN: string;
  DISBURSE_LOAN: string;
  VIEW_DETAILSs: string;
  EDIT_LOAN: string;
  PENDING_APPROVAL: string;
  APPROVED_LOANS: string;
  REJECTED_LOANS: string;
  DISBURSED_LOANS: string;
  TOTAL_LOAN_AMOUNT: string;
  ACTIVE_LOANS: string;

  // Member Management
  MEMBER_MANAGEMENT: string;
  MEMBER_NAME: string;
  CONTACT: string;
  EMAIL: string;
  PHONE: string;
  COMMUNITY_UNIT: string;
  JOIN_DATE: string;
  MEMBER_STATUS: string;
  ACTIVE_MEMBERS: string;
  INACTIVE_MEMBERS: string;
  PENDING_MEMBERS: string;
  TOTAL_MEMBERS: string;
  SEARCH_MEMBERS: string;
  SEARCH_LOANS: string;
  APPROVE_MEMBER: string;
  VIEW_DETAILS: string;
  EDIT_MEMBER: string;
  MEMBER_DETAILS: string;
  ATTENDANCE_RATE: string;
  TOTAL_LOANS: string;
  ACTIVE_LOANS_COUNT: string;

  // Reports & Analytics
  MEETING_REPORTS: string;
  MEETING_REPORTS_DESC: string;
  LOAN_REPORTS: string;
  LOAN_REPORTS_DESC: string;
  ATTENDANCE_REPORTS: string;
  ATTENDANCE_REPORTS_DESC: string;
  FINANCIAL_REPORTS: string;
  FINANCIAL_REPORTS_DESC: string;
  GENERATE_REPORT: string;
  GENERATING_REPORT: string;
  REPORT: string;
  
  // Common
  SUCCESS: string;
  ERROR: string;
  PENDING: string;
  APPROVED: string;
  REJECTED: string;
  REQUIRED: string;
  MIN_AMOUNT: string;
  OPTIONAL: string;
  ALL: string;
  ACTIVE: string;
  INACTIVE: string;
  SEARCH: string;
  FILTER: string;
  ACTIONS: string;
  VIEW_ALL: string;
  MANAGE_ALL: string;
  RESULTS_FOUND: string;
  NO_RESULTS_FOUND: string;
  
  // Add index signature to allow string indexing
  [key: string]: string;
}

const ENGLISH_TRANSLATIONS: TranslationKeys = {
  // App
  APP_TITLE: 'Kudumbashree Services',

  // Navigation
  ATTENDANCE: 'Attendance',
  MEETING_MINUTES: 'Meeting Minutes',
  LOAN_MANAGEMENT: 'Loan Management',
  ORGANIZE_MEETINGS: 'Organize Meetings',
  REPORTS_ANALYTICS: 'Reports & Analytics',
  PROFILE: 'Profile',
  LOGOUT: 'Logout',

  // Authentication
  LOGIN: 'Login',
  REGISTER: 'Register',

  // Dashboard
  DASHBOARD: 'Dashboard',
  ADMIN_DASHBOARD: 'Admin Dashboard',
  MANAGE_MEMBERS: 'Manage Members',
  MANAGE_LOANS: 'Manage Loans',

  // Attendance
  ATTENDANCE_SYSTEM: 'Attendance System',
  MARK_YOUR_ATTENDANCE: 'Mark Your Attendance',
  MARK_ATTENDANCE: 'Mark Attendance',
  SCANNING_FACE: 'Scanning Face...',
  GETTING_LOCATION: 'Getting location...',
  ATTENDANCE_MARKED_SUCCESS: 'Attendance marked successfully!',
  ERROR_MARKING_ATTENDANCE: 'Error marking attendance',
  LOCATION_DETAILS: 'Location Details',
  LATITUDE: 'Latitude',
  LONGITUDE: 'Longitude',

  // Meeting Minutes
  MEETING_MINUTES_GENERATOR: 'Meeting Minutes Generator',
  RECORD_MEETING: 'Record Meeting',
  SELECT_MEETING: 'Select Meeting',
  SELECT_MEETING_HINT: 'Choose a meeting to record or generate minutes',
  MEETING_DETAILS: 'Meeting Details',
  TITLE: 'Title',
  DATE: 'Date',
  LOCATION: 'Location',
  DESCRIPTION: 'Description',
  START_RECORDING: 'Start Recording',
  STOP_RECORDING: 'Stop Recording',
  GENERATE_MINUTES: 'Generate Minutes',
  CLEAR: 'Clear',
  RECORDING_IN_PROGRESS: 'Recording in progress...',
  MEETING_TRANSCRIPT: 'Meeting Transcript',
  MEETING_SUMMARY: 'Meeting Summary',
  COPY_TRANSCRIPT: 'Copy transcript',
  COPY_SUMMARY: 'Copy summary',
  DOWNLOAD_TRANSCRIPT: 'Download Transcript',
  DOWNLOAD_SUMMARY: 'Download Summary',
  NO_MEETINGS_AVAILABLE: 'No Meetings Available',
  SCHEDULE_MEETING_FIRST: 'Schedule meetings first to use the minutes generator',
  SCHEDULE_MEETING: 'Schedule a Meeting',

  // Loan Management
  LOAN_MANAGEMENTs: 'Loan Management',
  APPLY_FOR_LOAN: 'Apply for Loan',
  LOAN_APPLICATIONS: 'Loan Applications',
  LOAN_AMOUNT: 'Loan Amount',
  LOAN_PURPOSE: 'Loan Purpose',
  PURPOSE_DESCRIPTION: 'Purpose of loan',
  ADDITIONAL_DETAILS: 'Additional details about the loan requirement',
  APPLY_LOAN: 'Apply for Loan',
  LOAN_ID: 'Loan ID',
  APPLIED_DATE: 'Applied Date',
  STATUS: 'Status',
  NO_LOAN_APPLICATIONS: 'No loan applications found',
  TENURE_MONTHS: 'Tenure (Months)',
  INTEREST_RATE: 'Interest Rate',
  EMI_CALCULATOR: 'EMI Calculator',
  ESTIMATED_MONTHLY_EMI: 'Estimated Monthly EMI',

  // Admin Loan Management
  LOAN_NUMBER: 'Loan Number',
  APPLICANT: 'Applicant',
  PURPOSE: 'Purpose',
  APPLIED_DATEs: 'Applied Date',
  LOAN_DETAILS: 'Loan Details',
  APPROVE_LOAN: 'Approve Loan',
  REJECT_LOAN: 'Reject Loan',
  DISBURSE_LOAN: 'Disburse Loan',
  VIEW_DETAILS: 'View Details',
  EDIT_LOAN: 'Edit Loan',
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED_LOANS: 'Approved Loans',
  REJECTED_LOANS: 'Rejected Loans',
  DISBURSED_LOANS: 'Disbursed Loans',
  TOTAL_LOAN_AMOUNT: 'Total Loan Amount',
  ACTIVE_LOANS: 'Active Loans',

  // Member Management
  MEMBER_MANAGEMENT: 'Member Management',
  MEMBER_NAME: 'Member Name',
  CONTACT: 'Contact',
  EMAIL: 'Email',
  PHONE: 'Phone',
  COMMUNITY_UNIT: 'Community Unit',
  JOIN_DATE: 'Join Date',
  MEMBER_STATUS: 'Status',
  ACTIVE_MEMBERS: 'Active Members',
  INACTIVE_MEMBERS: 'Inactive Members',
  PENDING_MEMBERS: 'Pending Members',
  TOTAL_MEMBERS: 'Total Members',
  SEARCH_MEMBERS: 'Search Members',
  SEARCH_LOANS: 'Search Loans',
  APPROVE_MEMBER: 'Approve Member',
  VIEW_DETAILSs: 'View Details',
  EDIT_MEMBER: 'Edit Member',
  MEMBER_DETAILS: 'Member Details',
  ATTENDANCE_RATE: 'Attendance Rate',
  TOTAL_LOANS: 'Total Loans',
  ACTIVE_LOANS_COUNT: 'Active Loans',

  // Reports & Analytics
  MEETING_REPORTS: 'Meeting Reports',
  MEETING_REPORTS_DESC: 'Generate meeting attendance and minutes reports',
  LOAN_REPORTS: 'Loan Reports', 
  LOAN_REPORTS_DESC: 'View loan applications and status reports',
  ATTENDANCE_REPORTS: 'Attendance Reports',
  ATTENDANCE_REPORTS_DESC: 'Generate member attendance statistics',
  FINANCIAL_REPORTS: 'Financial Reports',
  FINANCIAL_REPORTS_DESC: 'Financial summaries and analytics',
  GENERATE_REPORT: 'Generate Report',
  GENERATING_REPORT: 'Generating',
  REPORT: 'Report',
  
  // Common
  SUCCESS: 'Success',
  ERROR: 'Error',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  REQUIRED: 'Required',
  MIN_AMOUNT: 'Minimum loan amount is ₹1000',
  OPTIONAL: 'Optional',
  ALL: 'All',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SEARCH: 'Search',
  FILTER: 'Filter',
  ACTIONS: 'Actions',
  VIEW_ALL: 'View All',
  MANAGE_ALL: 'Manage All',
  RESULTS_FOUND: 'results found',
  NO_RESULTS_FOUND: 'No results found'
};

const MALAYALAM_TRANSLATIONS: TranslationKeys = {
  // App
  APP_TITLE: 'കുടുംബശ്രീ സേവനങ്ങൾ',
  
  // Navigation
  ATTENDANCE: 'ഹാജരാകൽ',
  MEETING_MINUTES: 'മീറ്റിംഗ് മിനിറ്റുകൾ',
  LOAN_MANAGEMENT: 'ലോൺ മാനേജ്മെന്റ്',
  ORGANIZE_MEETINGS: 'മീറ്റിംഗുകൾ ക്രമീകരിക്കുക',
  REPORTS_ANALYTICS: 'റിപ്പോർട്ടുകളും വിശകലനവും',
  PROFILE: 'പ്രൊഫൈൽ',
  LOGOUT: 'ലോഗൗട്ട്',
  
  // Authentication
  LOGIN: 'ലോഗിൻ',
  REGISTER: 'രജിസ്റ്റർ',

  // Dashboard
  DASHBOARD: 'ഡാഷ്ബോർഡ്',
  ADMIN_DASHBOARD: 'അഡ്മിൻ ഡാഷ്ബോർഡ്',
  MANAGE_MEMBERS: 'അംഗങ്ങളെ നിയന്ത്രിക്കുക',
  MANAGE_LOANS: 'ലോണുകൾ നിയന്ത്രിക്കുക',
  
  // Attendance
  ATTENDANCE_SYSTEM: 'ഹാജരാകൽ സംവിധാനം',
  MARK_YOUR_ATTENDANCE: 'നിങ്ങളുടെ ഹാജരാകൽ രേഖപ്പെടുത്തുക',
  MARK_ATTENDANCE: 'ഹാജരാകൽ രേഖപ്പെടുത്തുക',
  SCANNING_FACE: 'മുഖം സ്കാൻ ചെയ്യുന്നു...',
  GETTING_LOCATION: 'ലൊക്കേഷൻ ലഭിക്കുന്നു...',
  ATTENDANCE_MARKED_SUCCESS: 'ഹാജരാകൽ വിജയകരമായി രേഖപ്പെടുത്തി!',
  ERROR_MARKING_ATTENDANCE: 'ഹാജരാകൽ രേഖപ്പെടുത്തുന്നതിൽ പിശക്',
  LOCATION_DETAILS: 'സ്ഥല വിവരങ്ങൾ',
  LATITUDE: 'അക്ഷാംശം',
  LONGITUDE: 'രേഖാംശം',
  
  // Meeting Minutes
  MEETING_MINUTES_GENERATOR: 'മീറ്റിംഗ് മിനിറ്റുകൾ ജനറേറ്റർ',
  RECORD_MEETING: 'മീറ്റിംഗ് റെക്കോർഡ് ചെയ്യുക',
  SELECT_MEETING: 'മീറ്റിംഗ് തിരഞ്ഞെടുക്കുക',
  SELECT_MEETING_HINT: 'മിനിറ്റുകൾ റെക്കോർഡ് ചെയ്യാനോ ജനറേറ്റ് ചെയ്യാനോ ഒരു മീറ്റിംഗ് തിരഞ്ഞെടുക്കുക',
  MEETING_DETAILS: 'മീറ്റിംഗ് വിവരങ്ങൾ',
  TITLE: 'തലക്കെട്ട്',
  DATE: 'തീയതി',
  LOCATION: 'സ്ഥലം',
  DESCRIPTION: 'വിവരണം',
  START_RECORDING: 'റെക്കോർഡിംഗ് ആരംഭിക്കുക',
  STOP_RECORDING: 'റെക്കോർഡിംഗ് നിർത്തുക',
  GENERATE_MINUTES: 'മിനിറ്റുകൾ ജനറേറ്റ് ചെയ്യുക',
  CLEAR: 'മായ്ക്കുക',
  RECORDING_IN_PROGRESS: 'റെക്കോർഡിംഗ് നടക്കുന്നു...',
  MEETING_TRANSCRIPT: 'മീറ്റിംഗ് ട്രാൻസ്ക്രിപ്റ്റ്',
  MEETING_SUMMARY: 'മീറ്റിംഗ് സംഗ്രഹം',
  COPY_TRANSCRIPT: 'ട്രാൻസ്ക്രിപ്റ്റ് പകർത്തുക',
  COPY_SUMMARY: 'സംഗ്രഹം പകർത്തുക',
  DOWNLOAD_TRANSCRIPT: 'ട്രാൻസ്ക്രിപ്റ്റ് ഡൗൺലോഡ് ചെയ്യുക',
  DOWNLOAD_SUMMARY: 'സംഗ്രഹം ഡൗൺലോഡ് ചെയ്യുക',
  NO_MEETINGS_AVAILABLE: 'മീറ്റിംഗുകൾ ലഭ്യമല്ല',
  SCHEDULE_MEETING_FIRST: 'മിനിറ്റുകൾ ജനറേറ്റർ ഉപയോഗിക്കുന്നതിന് ആദ്യം മീറ്റിംഗുകൾ ഷെഡ്യൂൾ ചെയ്യുക',
  SCHEDULE_MEETING: 'ഒരു മീറ്റിംഗ് ഷെഡ്യൂൾ ചെയ്യുക',
  
  // Loan Management
  LOAN_MANAGEMENTs: 'ലോൺ മാനേജ്മെന്റ്',
  APPLY_FOR_LOAN: 'ലോണിന് അപേക്ഷിക്കുക',
  LOAN_APPLICATIONS: 'ലോൺ അപേക്ഷകൾ',
  LOAN_AMOUNT: 'ലോൺ തുക',
  LOAN_PURPOSE: 'ലോൺ ഉദ്ദേശ്യം',
  PURPOSE_DESCRIPTION: 'ലോണിന്റെ ഉദ്ദേശ്യം',
  ADDITIONAL_DETAILS: 'ലോൺ ആവശ്യകതയെക്കുറിച്ചുള്ള അധിക വിവരങ്ങൾ',
  APPLY_LOAN: 'ലോണിന് അപേക്ഷിക്കുക',
  LOAN_ID: 'ലോൺ ഐഡി',
  APPLIED_DATE: 'അപേക്ഷിച്ച തീയതി',
  STATUS: 'സ്ഥിതി',
  NO_LOAN_APPLICATIONS: 'ലോൺ അപേക്ഷകൾ കണ്ടെത്തിയില്ല',
  TENURE_MONTHS: 'കാലാവധി (മാസങ്ങൾ)',
  INTEREST_RATE: 'വട്ടക',
  EMI_CALCULATOR: 'EMI കാൽക്കുലേറ്റർ',
  ESTIMATED_MONTHLY_EMI: 'ഏകദിന EMI',

  // Admin Loan Management
  LOAN_NUMBER: 'ലോൺ നമ്പർ',
  APPLICANT: 'അപേക്ഷകൻ',
  PURPOSE: 'ഉദ്ദേശ്യം',
  APPLIED_DATEs: 'അപേക്ഷിച്ച തീയതി',
  LOAN_DETAILS: 'ലോൺ വിവരങ്ങൾ',
  APPROVE_LOAN: 'ലോൺ അനുവദിക്കുക',
  REJECT_LOAN: 'ലോൺ നിരസിക്കുക',
  DISBURSE_LOAN: 'ലോൺ നൽകുക',
  VIEW_DETAILS: 'വിവരങ്ങൾ കാണുക',
  EDIT_LOAN: 'ലോൺ എഡിറ്റ് ചെയ്യുക',
  PENDING_APPROVAL: 'അനുവാദത്തിനായി തീർച്ചപ്പെടുത്താത്ത',
  APPROVED_LOANS: 'അനുവദിച്ച ലോണുകൾ',
  REJECTED_LOANS: 'നിരസിച്ച ലോണുകൾ',
  DISBURSED_LOANS: 'നൽകിയ ലോണുകൾ',
  TOTAL_LOAN_AMOUNT: 'മൊത്തം ലോൺ തുക',
  ACTIVE_LOANS: 'സജീവ ലോണുകൾ',

  // Member Management
  MEMBER_MANAGEMENT: 'അംഗ നിയന്ത്രണം',
  MEMBER_NAME: 'അംഗത്തിന്റെ പേര്',
  CONTACT: 'ബന്ധപ്പെടുക',
  EMAIL: 'ഇമെയിൽ',
  PHONE: 'ഫോൺ',
  COMMUNITY_UNIT: 'കമ്മ്യൂണിറ്റി യൂണിറ്റ്',
  JOIN_DATE: 'ചേർന്ന തീയതി',
  MEMBER_STATUS: 'സ്ഥിതി',
  ACTIVE_MEMBERS: 'സജീവ അംഗങ്ങൾ',
  INACTIVE_MEMBERS: 'നിഷ്ക്രിയ അംഗങ്ങൾ',
  PENDING_MEMBERS: 'തീർച്ചപ്പെടുത്താത്ത അംഗങ്ങൾ',
  TOTAL_MEMBERS: 'മൊത്തം അംഗങ്ങൾ',
  SEARCH_MEMBERS: 'അംഗങ്ങളെ തിരയുക',
  SEARCH_LOANS: 'ലോണുകൾ തിരയുക',
  APPROVE_MEMBER: 'അംഗത്തെ അനുവദിക്കുക',
  VIEW_DETAILSs: 'വിവരങ്ങൾ കാണുക',
  EDIT_MEMBER: 'അംഗത്തെ എഡിറ്റ് ചെയ്യുക',
  MEMBER_DETAILS: 'അംഗ വിവരങ്ങൾ',
  ATTENDANCE_RATE: 'ഹാജരാകൽ നിരക്ക്',
  TOTAL_LOANS: 'മൊത്തം ലോണുകൾ',
  ACTIVE_LOANS_COUNT: 'സജീവ ലോണുകൾ',

  // Reports & Analytics
  MEETING_REPORTS: 'മീറ്റിംഗ് റിപ്പോർട്ടുകൾ',
  MEETING_REPORTS_DESC: 'മീറ്റിംഗ് ഹാജരാകലും മിനിറ്റുകളും റിപ്പോർട്ടുകൾ ജനറേറ്റ് ചെയ്യുക',
  LOAN_REPORTS: 'ലോൺ റിപ്പോർട്ടുകൾ',
  LOAN_REPORTS_DESC: 'ലോൺ അപേക്ഷകളും സ്ഥിതി റിപ്പോർട്ടുകളും കാണുക',
  ATTENDANCE_REPORTS: 'ഹാജരാകൽ റിപ്പോർട്ടുകൾ',
  ATTENDANCE_REPORTS_DESC: 'മെമ്പർ ഹാജരാകൽ സ്ഥിതിവിവരക്കണക്കുകൾ ജനറേറ്റ് ചെയ്യുക',
  FINANCIAL_REPORTS: 'ധനകാര്യ റിപ്പോർട്ടുകൾ',
  FINANCIAL_REPORTS_DESC: 'ധനകാര്യ സംഗ്രഹങ്ങളും വിശകലനവും',
  GENERATE_REPORT: 'റിപ്പോർട്ട് ജനറേറ്റ് ചെയ്യുക',
  GENERATING_REPORT: 'ജനറേറ്റ് ചെയ്യുന്നു',
  REPORT: 'റിപ്പോർട്ട്',
  
  // Common
  SUCCESS: 'വിജയം',
  ERROR: 'പിശക്',
  PENDING: 'തീർച്ചപ്പെടുത്താത്ത',
  APPROVED: 'അനുവദിച്ചു',
  REJECTED: 'നിരസിച്ചു',
  REQUIRED: 'ആവശ്യമാണ്',
  MIN_AMOUNT: 'കുറഞ്ഞ ലോൺ തുക ₹1000 ആണ്',
  OPTIONAL: 'ഓപ്ഷണൽ',
  ALL: 'എല്ലാം',
  ACTIVE: 'സജീവം',
  INACTIVE: 'നിഷ്ക്രിയം',
  SEARCH: 'തിരയുക',
  FILTER: 'ഫിൽട്ടർ',
  ACTIONS: 'പ്രവൃത്തികൾ',
  VIEW_ALL: 'എല്ലാം കാണുക',
  MANAGE_ALL: 'എല്ലാം നിയന്ത്രിക്കുക',
  RESULTS_FOUND: 'ഫലങ്ങൾ കണ്ടെത്തി',
  NO_RESULTS_FOUND: 'ഫലങ്ങൾ കണ്ടെത്തിയില്ല'
};

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage = signal<'en' | 'ml'>('en');
  private translations = {
    en: ENGLISH_TRANSLATIONS,
    ml: MALAYALAM_TRANSLATIONS
  };

  currentLanguage$ = this.currentLanguage.asReadonly();
  currentTranslations = signal<TranslationKeys>(this.translations['en']);

  constructor() {
    // Safe localStorage access with try-catch
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedLang = localStorage.getItem('preferredLanguage') as 'en' | 'ml';
        if (savedLang) {
          this.setLanguage(savedLang);
        }
      }
    } catch (error) {
      console.warn('localStorage not available, using default language');
      // Use default language if localStorage is not available
      this.setLanguage('en');
    }
  }

  setLanguage(lang: 'en' | 'ml') {
    this.currentLanguage.set(lang);
    this.currentTranslations.set(this.translations[lang]);
    
    // Safe localStorage access
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('preferredLanguage', lang);
      }
    } catch (error) {
      console.warn('Could not save language preference to localStorage');
    }
  }

  toggleLanguage() {
    const newLang = this.currentLanguage() === 'en' ? 'ml' : 'en';
    this.setLanguage(newLang);
  }

  getCurrentLanguage(): 'en' | 'ml' {
    return this.currentLanguage();
  }

  translate(key: keyof TranslationKeys): string {
    return this.currentTranslations()[key];
  }

  // Helper method to use in templates with the async pipe
  get translations$() {
    return this.currentTranslations.asReadonly();
  }
}