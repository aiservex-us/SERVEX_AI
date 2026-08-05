import {FileSignature, DatabaseZap, GlobeLock, ShieldAlert, Scale, Gavel, Cpu, Layers, FileText, Zap, CheckCircle, AlertTriangle} from "lucide-react";

export const termsData = [
  {
    id: "term-1",
    title: "1. Acceptance of Terms",
    icon: FileSignature,
    content: "By accessing the Servex Copilot platform, you enter an ecosystem designed completely and exclusively for Servex US. This bespoke engine was built to solve Servex's unique operational challenges, providing an absolute competitive advantage in the market.",    category: "Profiles & Access",
    span: "col-span-1 md:col-span-2 lg:col-span-2"
  },
  {
    id: "term-2",
    title: "2. Purpose of the Platform",
    icon: GlobeLock,
    content: "Servex Copilot is an elite, custom-built ETL and AI engine with no equivalent in the market. It exists solely to automate Servex US's catalog processing and solidify their position as industry leaders.",    category: "AI & Data Handling",
    span: "col-span-1"
  },
  {
    id: "term-3",
    title: "3. Modifications to Terms",
    icon: ShieldAlert,
    content: "Any modifications to these terms or the core architecture will only be executed under the direct consensus and approval of Servex US leadership, ensuring complete alignment with Servex's strategic goals.",    category: "General & Acceptance",
    span: "col-span-1"
  },
  {
    id: "term-4",
    title: "4. Severability",
    icon: Scale,
    content: "If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.",    category: "AI & Data Handling",
    span: "col-span-1"
  },
  {
    id: "term-5",
    title: "5. Restrictions on Use",
    icon: Layers,
    content: "Users shall not reverse engineer, decompile, disassemble, or attempt to derive the source code of any software provided within the platform.",    category: "General & Acceptance",
    span: "col-span-1 md:col-span-2 lg:col-span-2"
  },
  {
    id: "term-6",
    title: "6. Access Authorization",
    icon: FileSignature,
    content: "Access is restricted to authorized personnel who have been granted explicit permissions by Servex US administration.",    category: "Profiles & Access",
    span: "col-span-1"
  },
  {
    id: "term-7",
    title: "7. Gatekeeper Protocol",
    icon: DatabaseZap,
    content: "Access to specific modules requires passing the Alysa Gatekeeper verification. Once identified, the user assumes the role of 'Official Administrator' for that session.",    category: "AI & Data Handling",
    span: "col-span-1 md:col-span-2 lg:col-span-3"
  },
  {
    id: "term-8",
    title: "8. Credential Security",
    icon: GlobeLock,
    content: "Sharing credentials, session access, or impersonating another user is strictly prohibited and constitutes a severe security breach.",    category: "Security & Network",
    span: "col-span-1"
  },
  {
    id: "term-9",
    title: "9. User Responsibility",
    icon: Scale,
    content: "The User assumes full responsibility for all actions taken under their session, including database uploads, AI interactions, and catalog modifications.",    category: "AI & Data Handling",
    span: "col-span-1 md:col-span-2 lg:col-span-2"
  },
  {
    id: "term-10",
    title: "10. Data Accuracy Requirement",
    icon: Gavel,
    content: "Users are responsible for ensuring that the base XML and CSV files uploaded for processing are accurate, up-to-date, and properly formatted.",    category: "Modules & ETL Engine",
    span: "col-span-1"
  },
  {
    id: "term-11",
    title: "11. Input Validation",
    icon: Cpu,
    content: "While the platform performs structural validation, the semantic correctness of pricing and catalog data remains the User's sole responsibility.",    category: "AI & Data Handling",
    span: "col-span-1"
  },
  {
    id: "term-12",
    title: "12. Prohibited Content",
    icon: Layers,
    content: "Users shall not upload malicious code, corrupted files, or data containing personal identifiable information (PII) not relevant to catalog processing.",    category: "AI & Data Handling",
    span: "col-span-1"
  },
  {
    id: "term-13",
    title: "13. Data Backup Responsibility",
    icon: FileText,
    content: "Servex US is responsible for maintaining external backups of all original CSV and XML files before processing them through the platform.",    category: "AI & Data Handling",
    span: "col-span-1"
  },
  {
    id: "term-14",
    title: "14. AI Assistant Purpose",
    icon: FileSignature,
    content: "AI assistants (such as Alysa, WBO, WBS, etc.) are provided to guide users through module-specific workflows and answer operational queries.",    category: "AI & Data Handling",
    span: "col-span-1"
  },
  {
    id: "term-15",
    title: "15. Prohibition of Prompt Injection",
    icon: GlobeLock,
    content: "Users must not attempt to manipulate, jailbreak, or inject malicious prompts into the AI models to bypass restrictions or extract system prompts.",    category: "AI & Data Handling",
    span: "col-span-1 md:col-span-2 lg:col-span-3"
  },
  {
    id: "term-16",
    title: "16. AI Training Data Privacy",
    icon: ShieldAlert,
    content: "Chat logs and interactions with the AI are recorded for auditing and quality control but will not be used to train external public models.",    category: "Security & Network",
    span: "col-span-1"
  },
  {
    id: "term-17",
    title: "17. Automated ETL Engine",
    icon: Gavel,
    content: "The platform automates the injection of variations and data transformations. Users must review the final outputs before deploying them to CET Designer.",    category: "Modules & ETL Engine",
    span: "col-span-1"
  },
  {
    id: "term-18",
    title: "18. Processing Limitations",
    icon: Cpu,
    content: "The ETL engine is designed for specific XML and CSV structures defined by Servex US. Deviations from these structures may cause processing failures.",    category: "AI & Data Handling",
    span: "col-span-1"
  },
  {
    id: "term-19",
    title: "19. Manual Overrides",
    icon: Zap,
    content: "Any manual modifications made to the output files outside the platform's pipeline are strictly at the risk of Servex US.",    category: "General & Acceptance",
    span: "col-span-1"
  },
  {
    id: "term-20",
    title: "20. Incident Reporting",
    icon: DatabaseZap,
    content: "Users must immediately report any suspected security vulnerabilities, unauthorized access, or data breaches to the technical team.",    category: "Security & Network",
    span: "col-span-1"
  },
  {
    id: "term-21",
    title: "21. Confidentiality Obligation",
    icon: GlobeLock,
    content: "All operational data, catalog structures, and internal processes of Servex US processed by the platform are considered strictly confidential.",    category: "Security & Network",
    span: "col-span-1"
  },
  {
    id: "term-22",
    title: "22. Network Security",
    icon: ShieldAlert,
    content: "Users must access the platform over secure networks. Accessing the platform from compromised devices or unsecured public Wi-Fi is prohibited.",    category: "Security & Network",
    span: "col-span-1 md:col-span-2 lg:col-span-3"
  },
  {
    id: "term-23",
    title: "23. Audit Logs",
    icon: Scale,
    content: "The platform maintains audit logs of user actions. These logs are the property of Servex US and may be used for internal compliance and security reviews.",    category: "Security & Network",
    span: "col-span-1"
  },
  {
    id: "term-24",
    title: "24. Emergency Maintenance",
    icon: Layers,
    content: "In the event of critical vulnerabilities or system failures, emergency maintenance may be performed without prior notice.",    category: "AI & Data Handling",
    span: "col-span-1"
  },
  {
    id: "term-25",
    title: "25. Beta Features",
    icon: FileText,
    content: "Certain modules or features may be marked as 'Beta'. These are provided 'as is' without warranties and may be unstable.",    category: "AI & Data Handling",
    span: "col-span-1"
  },
  {
    id: "term-26",
    title: "26. Defense of Claims",
    icon: FileText,
    content: "The indemnifying party shall have the right to control the defense and settlement of any indemnified claim, provided the indemnified party is kept informed.",    category: "AI & Data Handling",
    span: "col-span-1"
  },
  {
    id: "term-27",
    title: "27. Privacy Policy Application",
    icon: FileSignature,
    content: "The use of the platform is also governed by our Privacy Policy, which outlines how user data and corporate data are handled.",    category: "Security & Network",
    span: "col-span-1"
  },
  {
    id: "term-28",
    title: "28. Data Ownership",
    icon: DatabaseZap,
    content: "Servex US retains all ownership rights to the raw CSV/XML data and the final processed outputs generated by the platform.",    category: "Legal & Intellectual Property",
    span: "col-span-1"
  },
  {
    id: "term-29",
    title: "29. Profile Integrity",
    icon: CheckCircle,
    content: "Users must ensure their profile information (WBO, WBS, etc.) reflects their actual corporate role. Falsifying module access privileges is grounds for immediate access revocation by Servex US.",    category: "Modules & ETL Engine",
    span: "col-span-1 md:col-span-2 lg:col-span-2"
  },
  {
    id: "term-30",
    title: "30. Public Audit Forum",
    icon: AlertTriangle,
    content: "When a user executes the '/createAuditor' command, the resulting audit log is published to a shared corporate forum. Users acknowledge that their operational commands are visible to Servex US management.",    category: "Profiles & Access",
    span: "col-span-1"
  },
  {
    id: "term-31",
    title: "31. Audit Accuracy",
    icon: FileText,
    content: "The data published to the ClientSERVEX_Audit repository is considered the official operational record. Users must not attempt to alter or delete audit logs after publication.",    category: "Security & Network",
    span: "col-span-1"
  },
  {
    id: "term-32",
    title: "32. Forum Professionalism",
    icon: DatabaseZap,
    content: "Comments, annotations, and generated audits shared across the AI_Users network must maintain strict corporate professionalism. Inappropriate language will be flagged by the system.",    category: "Security & Network",
    span: "col-span-1"
  },
  {
    id: "term-33",
    title: "33. Cross-Profile Visibility",
    icon: GlobeLock,
    content: "Users acknowledge that while their personal data is protected, their operational outputs (publications and audits) are visible to all authorized Servex US personnel to ensure workflow transparency.",    category: "Profiles & Access",
    span: "col-span-1"
  },
  {
    id: "term-34",
    title: "34. Profile Data Sync",
    icon: Zap,
    content: "The platform synchronizes user profiles with internal Servex HR directories. Discrepancies must be reported to the IT department immediately.",    category: "Profiles & Access",
    span: "col-span-1"
  },
  {
    id: "term-35",
    title: "35. Session Timeouts",
    icon: Layers,
    content: "For security purposes, inactive sessions within any module will be automatically terminated after a predefined period of inactivity.",    category: "Legal & Intellectual Property",
    span: "col-span-1"
  },
  {
    id: "term-36",
    title: "36. Concurrent Logins",
    icon: Cpu,
    content: "Logging into the platform from multiple IP addresses simultaneously using the same credentials is prohibited and will trigger an automatic security freeze.",    category: "Security & Network",
    span: "col-span-1 md:col-span-2 lg:col-span-2"
  },
  {
    id: "term-37",
    title: "37. Off-boarding Protocol",
    icon: CheckCircle,
    content: "Upon termination of employment with Servex US, the user's profile and access tokens are immediately and irreversibly revoked.",    category: "Legal & Intellectual Property",
    span: "col-span-1"
  },
  {
    id: "term-38",
    title: "38. Role-Based Access Control (RBAC)",
    icon: AlertTriangle,
    content: "Users are granted access strictly on a need-to-know basis. Attempting to bypass RBAC to access unauthorized modules (e.g., trying to access WBO when assigned to WBT) is prohibited.",    category: "Modules & ETL Engine",
    span: "col-span-1"
  },
  {
    id: "term-39",
    title: "39. Module: WBO Compliance",
    icon: FileText,
    content: "When operating within the WBO module, users must strictly adhere to the designated XML schema for Workstation modifications. Unapproved schema alterations will be rejected.",    category: "Modules & ETL Engine",
    span: "col-span-1"
  },
  {
    id: "term-40",
    title: "40. Module: WBS Integrity",
    icon: DatabaseZap,
    content: "The WBS module requires accurate spatial and structural inputs. Users must verify all dimensions before running the automated parser.",    category: "Modules & ETL Engine",
    span: "col-span-1 md:col-span-2 lg:col-span-3"
  },
  {
    id: "term-41",
    title: "41. Module: WBD Specifications",
    icon: GlobeLock,
    content: "In the WBD module, visual assets and dimensional data must match the manufacturer's official specifications to prevent catastrophic errors in CET Designer.",    category: "Modules & ETL Engine",
    span: "col-span-1"
  },
  {
    id: "term-42",
    title: "42. Module: WBT Accuracy",
    icon: Zap,
    content: "Users assigned to the WBT module are responsible for the absolute accuracy of textile and finish codes. The ETL engine assumes these codes are pre-validated.",    category: "Modules & ETL Engine",
    span: "col-span-1"
  },
  {
    id: "term-43",
    title: "43. CET Designer Synchronization",
    icon: Layers,
    content: "The outputs generated by Servex Copilot are formatted explicitly for ingestion by CET Designer. Servex US prohibits the use of these files in unauthorized third-party CAD software.",    category: "Modules & ETL Engine",
    span: "col-span-1 md:col-span-2 lg:col-span-2"
  },
  {
    id: "term-44",
    title: "44. Catalog Master Files",
    icon: Cpu,
    content: "Users must always pull from the most recent 'Master Price List' provided by Servex US. Processing outdated catalogs is a violation of operational protocol.",    category: "Modules & ETL Engine",
    span: "col-span-1"
  },
  {
    id: "term-45",
    title: "45. Manufacturer Anomalies",
    icon: CheckCircle,
    content: "If a manufacturer (e.g., Lesro, PNT) issues a mid-year catalog update, the module administrator must halt processing and request a schema review from Servex US management.",    category: "Modules & ETL Engine",
    span: "col-span-1"
  },
  {
    id: "term-46",
    title: "46. Price Discount Rules",
    icon: AlertTriangle,
    content: "Automated discount algorithms applied during the ETL process must not be manually overridden without written consent from Servex US financial controllers.",    category: "Modules & ETL Engine",
    span: "col-span-1"
  },
  {
    id: "term-47",
    title: "47. XML Tag Structure",
    icon: FileText,
    content: "Manual editing of the final XML output tags is strictly forbidden. The XML must remain exactly as generated by the platform to ensure CET Designer compatibility.",    category: "AI & Data Handling",
    span: "col-span-1"
  },
  {
    id: "term-48",
    title: "48. Asset Naming Conventions",
    icon: DatabaseZap,
    content: "Users must adhere to the Servex US standardized naming conventions for all uploaded visual assets (PNGs, JPEGs). Improperly named files will be discarded by the AI.",    category: "AI & Data Handling",
    span: "col-span-1"
  },
  {
    id: "term-49",
    title: "49. Confidentiality of Pricing",
    icon: GlobeLock,
    content: "Wholesale pricing, tier discounts, and margin logic processed by the platform are highly classified trade secrets of Servex US.",    category: "Security & Network",
    span: "col-span-1"
  },
  {
    id: "term-50",
    title: "50. Export Restrictions",
    icon: Zap,
    content: "Exporting processed catalog data to external storage drives or personal cloud accounts (e.g., Google Drive, Dropbox) is strictly prohibited by Servex US.",    category: "Modules & ETL Engine",
    span: "col-span-1 md:col-span-2 lg:col-span-2"
  },
  {
    id: "term-51",
    title: "51. AI Query Scope",
    icon: Layers,
    content: "The AI assistants (Alysa and module agents) are designed strictly for operational guidance. Users must not use the chat interface for personal queries or non-work-related discussions.",    category: "AI & Data Handling",
    span: "col-span-1 md:col-span-2 lg:col-span-3"
  },
  {
    id: "term-52",
    title: "52. Automated AI Actions",
    icon: Cpu,
    content: "When delegating tasks to the AI (e.g., 'fix this column'), the user retains full responsibility for reviewing the AI's execution before approving the final output.",    category: "AI & Data Handling",
    span: "col-span-1"
  },
  {
    id: "term-53",
    title: "53. No AI Legal Advice",
    icon: CheckCircle,
    content: "The AI assistants cannot provide legal, financial, or HR advice. All such queries should be directed to the respective Servex US departments.",    category: "AI & Data Handling",
    span: "col-span-1"
  },
  {
    id: "term-54",
    title: "54. Handling Corrupt Files",
    icon: AlertTriangle,
    content: "If the platform detects a corrupted CSV or XML file, the user must immediately quarantine the file and notify the database administration team.",    category: "AI & Data Handling",
    span: "col-span-1"
  },
  {
    id: "term-55",
    title: "55. Data Retention Limits",
    icon: FileText,
    content: "Raw user uploads are purged from the active server every 30 days. Users must maintain their own local working copies as dictated by Servex US policy.",    category: "AI & Data Handling",
    span: "col-span-1"
  },
  {
    id: "term-56",
    title: "56. Version Control",
    icon: DatabaseZap,
    content: "The platform maintains strict version control over generated outputs. Reverting to older versions requires approval from a designated module administrator.",    category: "AI & Data Handling",
    span: "col-span-1"
  },
  {
    id: "term-57",
    title: "57. Error Reporting",
    icon: GlobeLock,
    content: "Users encountering 500 Internal Server Errors or unexpected AI behaviors must log the error code and immediately report it via the internal ticketing system.",    category: "AI & Data Handling",
    span: "col-span-1 md:col-span-2 lg:col-span-2"
  },
  {
    id: "term-58",
    title: "58. Testing Environments",
    icon: Zap,
    content: "Experimental or unverified CSV files must only be uploaded to the designated 'Sandbox' environment, never to the production modules.",    category: "Modules & ETL Engine",
    span: "col-span-1"
  },
  {
    id: "term-59",
    title: "59. Corporate Devices Only",
    icon: Layers,
    content: "The platform should only be accessed via corporate-issued devices unless specific BYOD (Bring Your Own Device) clearance has been granted by Servex US.",    category: "Profiles & Access",
    span: "col-span-1"
  },
  {
    id: "term-60",
    title: "60. VPN Requirement",
    icon: Cpu,
    content: "Remote access to Servex Copilot requires an active connection to the Servex US corporate VPN.",    category: "Security & Network",
    span: "col-span-1"
  },
  {
    id: "term-61",
    title: "61. Browser Compatibility",
    icon: CheckCircle,
    content: "The platform is optimized for modern, secure browsers (Chrome, Edge). Use of outdated or unsupported browsers is at the user's own risk.",    category: "General & Acceptance",
    span: "col-span-1"
  },
  {
    id: "term-62",
    title: "62. Screen Sharing Restrictions",
    icon: AlertTriangle,
    content: "Users must obscure or hide sensitive pricing columns when sharing their screen during external meetings or vendor presentations.",    category: "General & Acceptance",
    span: "col-span-1 md:col-span-2 lg:col-span-3"
  },
  {
    id: "term-63",
    title: "63. Malware Scanning",
    icon: FileText,
    content: "All CSV and XML files must be scanned by corporate antivirus software before being uploaded to the ETL engine.",    category: "Security & Network",
    span: "col-span-1"
  },
  {
    id: "term-64",
    title: "64. Password Rotation",
    icon: DatabaseZap,
    content: "Users are required to update their access credentials every 90 days in accordance with Servex US IT security policies.",    category: "Security & Network",
    span: "col-span-1 md:col-span-2 lg:col-span-2"
  },
  {
    id: "term-65",
    title: "65. Two-Factor Authentication",
    icon: GlobeLock,
    content: "2FA is mandatory for all administrative actions, including the final approval of a catalog push to CET Designer.",    category: "Security & Network",
    span: "col-span-1"
  },
  {
    id: "term-66",
    title: "66. No Scraping",
    icon: Zap,
    content: "Automated scraping of the platform's user interface, API endpoints, or database structures by users is strictly forbidden.",    category: "General & Acceptance",
    span: "col-span-1"
  },
  {
    id: "term-67",
    title: "67. API Rate Limits",
    icon: Layers,
    content: "Users authorized to use programmatic API access must respect the predefined rate limits to prevent server degradation.",    category: "Profiles & Access",
    span: "col-span-1"
  },
  {
    id: "term-68",
    title: "68. Geolocation Tracking",
    icon: Cpu,
    content: "Servex US reserves the right to monitor the geolocation of logins to detect and prevent unauthorized overseas access.",    category: "Profiles & Access",
    span: "col-span-1"
  },
  {
    id: "term-69",
    title: "69. Unforeseen Operational Errors",
    icon: CheckCircle,
    content: "In the event of an unforeseen edge-case error not explicitly covered by these terms, the user must halt all activity and await guidance from Servex US management.",    category: "AI & Data Handling",
    span: "col-span-1"
  },
  {
    id: "term-70",
    title: "70. Precedence of Corporate Policy",
    icon: AlertTriangle,
    content: "Where these terms conflict with the Servex US Employee Handbook, the Employee Handbook takes precedence regarding disciplinary actions.",    category: "General & Acceptance",
    span: "col-span-1"
  },
  {
    id: "term-71",
    title: "71. Zero Tolerance for Sabotage",
    icon: FileText,
    content: "Intentional corruption of data, intentional AI manipulation, or sabotage of the ETL pipeline will result in immediate termination and legal action by Servex US.",    category: "Legal & Intellectual Property",
    span: "col-span-1 md:col-span-2 lg:col-span-2"
  },
  {
    id: "term-72",
    title: "72. Training Requirement",
    icon: DatabaseZap,
    content: "Access is contingent upon the user completing the mandatory Servex Copilot certification and training program.",    category: "AI & Data Handling",
    span: "col-span-1"
  },
  {
    id: "term-73",
    title: "73. Vendor Communication",
    icon: GlobeLock,
    content: "Users must not share raw platform logs or internal AI chat transcripts with external furniture manufacturers.",    category: "AI & Data Handling",
    span: "col-span-1 md:col-span-2 lg:col-span-3"
  },
  {
    id: "term-74",
    title: "74. System Audits",
    icon: Zap,
    content: "Servex US IT reserves the right to remotely shadow user sessions for troubleshooting and compliance audits without prior notification.",    category: "General & Acceptance",
    span: "col-span-1"
  },
  {
    id: "term-75",
    title: "75. Feature Abuse",
    icon: Layers,
    content: "Repeatedly spamming the AI agent or initiating redundant, heavy ETL processing tasks constitutes feature abuse and may result in throttling.",    category: "AI & Data Handling",
    span: "col-span-1"
  },
  {
    id: "term-76",
    title: "76. Constructive Feedback",
    icon: Cpu,
    content: "Users are encouraged to report UI/UX friction points directly to their managers to ensure continuous internal workflow improvement.",    category: "General & Acceptance",
    span: "col-span-1"
  },
  {
    id: "term-77",
    title: "77. Emergency Stop Button",
    icon: CheckCircle,
    content: "In the event of a catastrophic data ingestion error, users must utilize the 'Emergency Halt' feature to stop all active ETL processes immediately.",    category: "Modules & ETL Engine",
    span: "col-span-1"
  },
  {
    id: "term-78",
    title: "78. Absolute Servex Authority",
    icon: AlertTriangle,
    content: "Ultimately, Servex US reserves the absolute right to enforce, interpret, and act upon any operational scenario within the platform to protect its corporate interests.",    category: "General & Acceptance",
    span: "col-span-1 md:col-span-2 lg:col-span-2"
  },
  {
    id: "term-79",
    title: "79. Definitions",
    icon: DatabaseZap,
    content: "'Platform' refers to Servex Copilot. 'Creator' refers to GLYNNE S.A.S. 'Client' refers to Servex US. 'User' refers to any authorized personnel accessing the platform.",    category: "Profiles & Access",
    span: "col-span-1"
  },
  {
    id: "term-80",
    title: "80. License to Servex US",
    icon: Cpu,
    content: "GLYNNE S.A.S. grants Servex US a complete, exclusive, and irrevocable license to the platform. While GLYNNE retains intellectual ownership, Servex US has absolute dominion and control over its use, leveraging it as a proprietary competitive weapon.",    category: "Legal & Intellectual Property",
    span: "col-span-1"
  },
  {
    id: "term-81",
    title: "81. Trademarks and Branding",
    icon: FileText,
    content: "The name 'GLYNNE S.A.S.' and 'Servex Copilot' and their associated logos are trademarks and may not be used without explicit written permission.",    category: "General & Acceptance",
    span: "col-span-1"
  },
  {
    id: "term-82",
    title: "82. Data Corruption Disclaimer",
    icon: Zap,
    content: "GLYNNE S.A.S. is not liable for data corruption resulting from the ingestion of malformed, incomplete, or unsupported file formats by the User.",    category: "AI & Data Handling",
    span: "col-span-1"
  },
  {
    id: "term-83",
    title: "83. AI Service Availability",
    icon: Scale,
    content: "AI features depend on third-party APIs and infrastructure. GLYNNE S.A.S. is not liable for temporary outages of the AI functionalities.",    category: "AI & Data Handling",
    span: "col-span-1"
  },
  {
    id: "term-84",
    title: "84. Performance Expectations",
    icon: Layers,
    content: "Processing times may vary depending on file size, network latency, and server load. GLYNNE S.A.S. does not guarantee instantaneous processing.",    category: "Security & Network",
    span: "col-span-1"
  },
  {
    id: "term-85",
    title: "85. System Security",
    icon: FileSignature,
    content: "GLYNNE S.A.S. implements industry-standard security measures, but Servex US acknowledges that no system is completely immune to cyber threats.",    category: "Security & Network",
    span: "col-span-1"
  },
  {
    id: "term-86",
    title: "86. Scheduled Maintenance",
    icon: Cpu,
    content: "GLYNNE S.A.S. reserves the right to pause platform services for maintenance, infrastructure upgrades, or bug fixes with prior notice.",    category: "AI & Data Handling",
    span: "col-span-1"
  },
  {
    id: "term-87",
    title: "87. Third-Party Dependencies",
    icon: Scale,
    content: "GLYNNE S.A.S. is not responsible for failures or damages caused by third-party services, including cloud hosting providers or external APIs.",    category: "AI & Data Handling",
    span: "col-span-1 md:col-span-2 lg:col-span-3"
  },
  {
    id: "term-88",
    title: "88. Aggregated Telemetry",
    icon: GlobeLock,
    content: "GLYNNE S.A.S. may collect anonymized, aggregated telemetry data regarding platform usage to optimize performance and AI models.",    category: "AI & Data Handling",
    span: "col-span-1"
  },
  {
    id: "term-89",
    title: "89. Data Deletion Rights",
    icon: ShieldAlert,
    content: "Upon termination of the agreement, Servex US has the right to request the deletion of all its proprietary data from GLYNNE S.A.S. servers.",    category: "Legal & Intellectual Property",
    span: "col-span-1"
  },
  {
    id: "term-90",
    title: "90. Right to Terminate",
    icon: Gavel,
    content: "Servex US holds the exclusive right to dictate the lifecycle of the platform. GLYNNE S.A.S. commits to perpetual maintenance as contracted, ensuring Servex's dominance is never interrupted by unilateral termination.",    category: "Legal & Intellectual Property",
    span: "col-span-1 md:col-span-2 lg:col-span-3"
  },
  {
    id: "term-91",
    title: "91. Effect of Termination",
    icon: Cpu,
    content: "Should Servex US decide to decommission the platform, all data and final outputs remain the exclusive property of Servex US. GLYNNE S.A.S. will facilitate a seamless transition of all architectural data.",    category: "Legal & Intellectual Property",
    span: "col-span-1 md:col-span-2 lg:col-span-2"
  },
  {
    id: "term-92",
    title: "92. Service Availability",
    icon: Gavel,
    content: "GLYNNE S.A.S. strives for high availability but does not provide a binding Service Level Agreement (SLA) for 100% uptime unless explicitly contracted.",    category: "Legal & Intellectual Property",
    span: "col-span-1 md:col-span-2 lg:col-span-2"
  },
  {
    id: "term-93",
    title: "93. Intellectual Property Ownership",
    icon: Gavel,
    content: "The underlying AI architecture, parsing algorithms, UI/UX designs, and logic models are the exclusive intellectual property of GLYNNE S.A.S.",    category: "Legal & Intellectual Property",
    span: "col-span-1"
  },
  {
    id: "term-94",
    title: "94. Feedback and Improvements",
    icon: Zap,
    content: "Any feedback, suggestions, or structural ideas provided by Users to optimize or scale the platform will be evaluated by Servex US leadership. Approved functional evolutions, custom upgrades, and ongoing maintenance architectures are exclusively executed through dedicated service scopes by GLYNNE S.A.S., acting as the sole technological architect.",    category: "Legal & Intellectual Property",
    span: "col-span-1"
  },
  {
    id: "term-95",
    title: "95. Account Termination",
    icon: ShieldAlert,
    content: "Servex US retains sole and absolute authority to manage, suspend, or terminate User access. GLYNNE S.A.S. acts solely as the maintenance provider and relinquishes any right to arbitrarily restrict Servex US's operations.",    category: "Legal & Intellectual Property",
    span: "col-span-1"
  },
  {
    id: "term-96",
    title: "96. No Liability for AI Outputs",
    icon: DatabaseZap,
    content: "GLYNNE S.A.S. does not guarantee the absolute accuracy of AI-generated text. Users must independently verify all critical information provided by the AI.",    category: "Legal & Intellectual Property",
    span: "col-span-1 md:col-span-2 lg:col-span-2"
  },
  {
    id: "term-97",
    title: "97. Output Liability",
    icon: FileText,
    content: "GLYNNE S.A.S. disclaims any liability for pricing errors, catalog mismatches, or business losses resulting from the automated ETL process.",    category: "Legal & Intellectual Property",
    span: "col-span-1 md:col-span-2 lg:col-span-2"
  },
  {
    id: "term-98",
    title: "98. Data Retention During Downtime",
    icon: Zap,
    content: "During scheduled or unscheduled downtime, GLYNNE S.A.S. will take reasonable steps to ensure data integrity is preserved.",    category: "Legal & Intellectual Property",
    span: "col-span-1"
  },
  {
    id: "term-99",
    title: "99. No Warranty",
    icon: FileSignature,
    content: "The platform is provided 'as is' and 'as available'. GLYNNE S.A.S. disclaims all implied warranties, including merchantability and fitness for a particular purpose.",    category: "Legal & Intellectual Property",
    span: "col-span-1"
  },
  {
    id: "term-100",
    title: "100. Limitation on Direct Damages",
    icon: DatabaseZap,
    content: "The maximum liability of GLYNNE S.A.S. for any direct damages arising from the use of the platform shall not exceed the fees paid for the software license.",    category: "Legal & Intellectual Property",
    span: "col-span-1"
  },
  {
    id: "term-101",
    title: "101. Exclusion of Indirect Damages",
    icon: GlobeLock,
    content: "GLYNNE S.A.S. shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits or data.",    category: "Legal & Intellectual Property",
    span: "col-span-1 md:col-span-2 lg:col-span-2"
  },
  {
    id: "term-102",
    title: "102. Force Majeure",
    icon: ShieldAlert,
    content: "Neither party shall be liable for failures caused by events beyond their reasonable control, including natural disasters, acts of war, or internet outages.",    category: "Legal & Intellectual Property",
    span: "col-span-1"
  },
  {
    id: "term-103",
    title: "103. User Indemnification",
    icon: Gavel,
    content: "Servex US and its Users agree to indemnify and hold harmless GLYNNE S.A.S. from any claims arising out of the misuse of the platform.",    category: "Legal & Intellectual Property",
    span: "col-span-1"
  },
  {
    id: "term-104",
    title: "104. Data Claim Indemnification",
    icon: Cpu,
    content: "Servex US indemnifies GLYNNE S.A.S. against any claims related to the inaccuracy, illegality, or unauthorized use of the data uploaded to the platform.",    category: "Legal & Intellectual Property",
    span: "col-span-1"
  },
  {
    id: "term-105",
    title: "105. IP Indemnification by GLYNNE",
    icon: Layers,
    content: "GLYNNE S.A.S. will indemnify Servex US against claims that the platform infringes on the intellectual property rights of a third party, subject to certain conditions.",    category: "Legal & Intellectual Property",
    span: "col-span-1"
  },
  {
    id: "term-106",
    title: "106. Limitation of Indemnification",
    icon: Zap,
    content: "Indemnification obligations do not apply if the claim arises from unauthorized modifications to the platform made by Servex US.",    category: "Legal & Intellectual Property",
    span: "col-span-1 md:col-span-2 lg:col-span-2"
  },
  {
    id: "term-107",
    title: "107. Compliance with Laws",
    icon: Scale,
    content: "Both parties agree to comply with all applicable data protection and privacy laws relevant to their jurisdiction and operations.",    category: "Legal & Intellectual Property",
    span: "col-span-1"
  },
  {
    id: "term-108",
    title: "108. Survival of Terms",
    icon: Layers,
    content: "Clauses related to Intellectual Property, Limitation of Liability, Indemnification, and Confidentiality shall survive the termination of these terms.",    category: "Legal & Intellectual Property",
    span: "col-span-1"
  },
  {
    id: "term-109",
    title: "109. Governing Law",
    icon: FileText,
    content: "These Terms and Conditions shall be governed by and construed in accordance with the laws of the jurisdiction where GLYNNE S.A.S. is registered.",    category: "Legal & Intellectual Property",
    span: "col-span-1"
  },
  {
    id: "term-110",
    title: "110. Dispute Resolution",
    icon: Zap,
    content: "Any disputes arising from these terms shall be resolved through binding arbitration in the jurisdiction of GLYNNE S.A.S., unless otherwise agreed in writing.",    category: "Legal & Intellectual Property",
    span: "col-span-1"
  },
];
