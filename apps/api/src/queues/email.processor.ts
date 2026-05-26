import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  type: 'welcome' | 'verification' | 'password-reset' | 'enrollment' | 'certificate' | 'custom';
}

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private configService: ConfigService) {
    super();
  }

  async process(job: Job<EmailJobData>) {
    this.logger.log(`Processing email job ${job.id} (${job.data.type}) to ${job.data.to}`);

    const resendKey = this.configService.get<string>('email.resendApiKey');
    if (!resendKey) {
      this.logger.warn(`Email skipped (no Resend key): ${job.data.subject}`);
      return { sent: false, reason: 'no_api_key' };
    }

    try {
      const { Resend } = await import('resend');
      const resend = new Resend(resendKey);
      const from = this.configService.get<string>('email.from') || 'noreply@skillmango.ai';
      const { data, error } = await resend.emails.send({
        from,
        to: job.data.to,
        subject: job.data.subject,
        html: job.data.html,
        text: job.data.text,
      });
      if (error) throw error;
      return { sent: true, id: data?.id };
    } catch (err: any) {
      this.logger.error(`Failed to send email: ${err.message}`);
      throw err;
    }
  }
}
