export type Provider = 'openai' | 'anthropic' | 'gemini' | 'local';

export type CreateOptions = {
  dir: string;
  name: string;
  preset: 'expo';
  providers: Provider[];
  force: boolean;
};

export type GeneratedFile = {
  path: string;
  content: string;
  executable?: boolean;
};

export type DoctorIssue = {
  code: string;
  severity: 'info' | 'warn' | 'error';
  message: string;
  file?: string;
};

export type DoctorResult = {
  ok: boolean;
  root: string;
  issueCount: number;
  issues: DoctorIssue[];
};
