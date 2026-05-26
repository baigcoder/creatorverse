import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { EmailJobData } from '../../queues/email.processor';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private configService: ConfigService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
    type: EmailJobData['type'] = 'custom',
  ) {
    const job = await this.emailQueue.add(
      type,
      { to, subject, html, text, type },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5_000 },
        removeOnComplete: 100,
        removeOnFail: 250,
      },
    );

    this.logger.log(`Queued ${type} email job ${job.id} to ${to}`);
    return { queued: true, jobId: job.id };
  }

  async sendWelcomeEmail(to: string, name: string) {
    return this.sendEmail(
      to,
      'Welcome to SkillMango AI!',
      `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#FF9F1C,#FACC15);padding:40px;text-align:center;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:28px">Welcome to SkillMango AI! 🥭</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #E2E8F0;border-radius:0 0 12px 12px">
          <p style="font-size:16px;color:#0F172A">Hey <strong>${name}</strong>,</p>
          <p style="font-size:16px;color:#64748B">Your account has been created successfully. Start creating courses, building communities, and growing your audience with AI-powered tools.</p>
          <a href="${this.configService.get('app.frontendUrl')}/dashboard" style="display:inline-block;background:#FF9F1C;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;margin-top:16px">Go to Dashboard</a>
        </div>
      </div>`,
      `Welcome to SkillMango AI, ${name}! Your account is ready.`,
      'welcome',
    );
  }

  async sendVerificationEmail(to: string, name: string, token: string) {
    const url = `${this.configService.get('app.frontendUrl')}/auth/verify-email?token=${token}`;
    return this.sendEmail(
      to,
      'Verify your email — SkillMango AI',
      `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#FF9F1C,#FACC15);padding:40px;text-align:center;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:28px">Verify Your Email 📧</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #E2E8F0;border-radius:0 0 12px 12px">
          <p style="font-size:16px;color:#0F172A">Hey <strong>${name}</strong>,</p>
          <p style="font-size:16px;color:#64748B">Please verify your email address to get full access to SkillMango AI.</p>
          <a href="${url}" style="display:inline-block;background:#FF9F1C;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;margin-top:16px">Verify Email</a>
          <p style="font-size:14px;color:#94A3B8;margin-top:16px">This link expires in 24 hours.</p>
        </div>
      </div>`,
      `Verify your email: ${url}`,
      'verification',
    );
  }

  async sendPasswordResetEmail(to: string, name: string, token: string) {
    const url = `${this.configService.get('app.frontendUrl')}/auth/reset-password?token=${token}`;
    return this.sendEmail(
      to,
      'Reset your password — SkillMango AI',
      `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#FF9F1C,#FACC15);padding:40px;text-align:center;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:28px">Reset Your Password 🔑</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #E2E8F0;border-radius:0 0 12px 12px">
          <p style="font-size:16px;color:#0F172A">Hey <strong>${name}</strong>,</p>
          <p style="font-size:16px;color:#64748B">We received a request to reset your password. Click below to create a new one.</p>
          <a href="${url}" style="display:inline-block;background:#FF9F1C;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;margin-top:16px">Reset Password</a>
          <p style="font-size:14px;color:#94A3B8;margin-top:16px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      </div>`,
      `Reset your password: ${url}`,
      'password-reset',
    );
  }

  async sendEnrollmentEmail(to: string, name: string, courseTitle: string) {
    return this.sendEmail(
      to,
      `You're enrolled! — ${courseTitle}`,
      `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
        <div style="padding:32px;background:#fff;border:1px solid #E2E8F0;border-radius:12px">
          <h2 style="color:#0F172A">You're in! 🎉</h2>
          <p style="color:#64748B">Hey <strong>${name}</strong>, you've been enrolled in <strong>${courseTitle}</strong>.</p>
          <a href="${this.configService.get('app.frontendUrl')}/learn/courses" style="display:inline-block;background:#FF9F1C;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px">Start Learning</a>
        </div>
      </div>`,
      `You're enrolled in ${courseTitle}!`,
      'enrollment',
    );
  }

  async sendCertificateEmail(to: string, name: string, courseTitle: string, certificateUrl: string) {
    return this.sendEmail(
      to,
      `Certificate earned — ${courseTitle}`,
      `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
        <div style="padding:32px;background:#fff;border:1px solid #E2E8F0;border-radius:12px">
          <h2 style="color:#0F172A">Certificate Earned! 🏆</h2>
          <p style="color:#64748B">Congratulations <strong>${name}</strong>! You've completed <strong>${courseTitle}</strong>.</p>
          <a href="${certificateUrl}" style="display:inline-block;background:#FF9F1C;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px">View Certificate</a>
        </div>
      </div>`,
      `You earned a certificate for ${courseTitle}!`,
      'certificate',
    );
  }
}
