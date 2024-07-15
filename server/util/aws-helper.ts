import { config } from '../config/config';
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import * as ses from "@aws-sdk/client-ses";
import * as fs from 'fs';
import { resolve } from 'path';
import { createTransport } from 'nodemailer';
import { ParsedMail, simpleParser } from 'mailparser';
import { stripHtml } from 'string-strip-html';

const sqsClient = new SQSClient({ region: config.awsRegion });

const sesClient = new ses.SES({
  region: config.awsRegion,
  tls: true,
  credentials: {
    accessKeyId: config.email.username!,
    secretAccessKey: config.email.password!
  }
});

const transporter = createTransport({
  SES: { ses: sesClient, aws: ses }
});

class AwsHelper {
  constructor() {}

  /**
   * Sends an email
   */
  sendEmail(to: string, subject: string, html: string, replyTo?: string) {
    transporter.sendMail({
      from: `${config.email.supportFrom} <${config.email.supportAddress}>`,
      to,
      subject,
      html,
      sender: config.email.supportAddress,
      replyTo,
      bcc: config.email.superAdminEmail
    }).then(
      (value: any) => console.log('email sent'),
      (reason: any) => console.log('email failed', reason)
    );
  }

  /**
   * Calls the handle methods for the 3 SQS queues
   */
  checkQueues() {
    this.handleSqsBounceQueue();
    this.handleSqsComplaintQueue();
    this.handleSqsSupportQueue();
  }

  /**
   * Get messages from the support SQS queue, send that message
   * to an admin and then delete the message from the queue
   */
  getSqsCommand(queue: string): ReceiveMessageCommand {
    return new ReceiveMessageCommand({
      QueueUrl: queue,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 10
    });
  }

  /**
   * Get messages from the bounce SQS queue, send that message
   * to an admin and then delete the message from the queue
   */
  handleSqsBounceQueue() {
    const command = this.getSqsCommand(config.email.bounceUrl!);

    sqsClient.send(command).then(
      value => {
        if(value.Messages) {
          let to: string = config.email.superAdminEmail!;
          let subject: string = 'Angular Template - Bounced email';

          for(let item of value.Messages) {
            const message = JSON.parse(item.Body || 'null');

            if(!message) {
              continue;
            }

            let email = fs.readFileSync(resolve(__dirname, './email-templates/bounced.html'), 'utf8');
            let recipients;
            let info = [];

            if(!message.bounce) {
              if(item.ReceiptHandle) {
                this.deleteMessageFromSqs(config.email.bounceUrl!, item.ReceiptHandle);
              }

              continue;
            }

            recipients = message.bounce.bouncedRecipients.map((i: any) => i.emailAddress).join(';');
            info.push(`Bounce Type: <strong>${stripHtml(message.bounce.bounceType).result}</strong>`);
            info.push(`If this was a permanent bounce, this email should be added to the DO NOT SEND list.`);
            email = email
              .replace('##BOUNCED_EMAIL##', stripHtml(recipients).result)
              .replace('##ADDITIONAL_INFO##', info.join('<br>'));

            this.sendEmail(to, subject, email);

            if(item.ReceiptHandle) {
              this.deleteMessageFromSqs(config.email.bounceUrl!, item.ReceiptHandle);
            }
          }
        } else {
          console.log('no messages in bounce queue');
        }
      },
      reason => console.log('recieve command error', reason)
    );
  }

  /**
   * Get messages from the complaint SQS queue, send that message
   * to an admin and then delete the message from the queue
   */
  handleSqsComplaintQueue() {
    const command = this.getSqsCommand(config.email.complaintsUrl!);

    sqsClient.send(command).then(
      value => {
        if(value.Messages) {
          let to: string = config.email.superAdminEmail!;
          let subject: string = 'Angular Template - Email complaint';

          for(let item of value.Messages) {
            const obj = JSON.parse(item.Body || 'null');

            if(!obj) {
              continue;
            }

            const message = JSON.parse(JSON.parse(item.Body!).Message);
            let email = fs.readFileSync(resolve(__dirname, './email-templates/complaint.html'), 'utf8');
            let recipients = 'no recipient data available';
            let info = [];

            if(message.complaint.complaintFeedbackType === 'not-spam') {

              if(item.ReceiptHandle) {
                this.deleteMessageFromSqs(config.email.complaintsUrl!, item.ReceiptHandle);
              }

              continue;
            }
            
            if(message.complaint.complainedRecipients) {
              recipients = message.complaint.complainedRecipients.map((i: any) => i.emailAddress).join(';');
            }

            info.push(`Complaint type: <strong>${stripHtml(message.complaint.complaintFeedbackType).result}</strong>`);
            info.push('If the email address was provided it needs to be removed from all mailing lists.');
            email = email
              .replace('##COMPLAINED_EMAIL##', stripHtml(recipients).result)
              .replace('##ADDITIONAL_INFO##', info.join('<br>'));

            this.sendEmail(to, subject, email);

            if(item.ReceiptHandle) {
              this.deleteMessageFromSqs(config.email.complaintsUrl!, item.ReceiptHandle);
            }
          }
        } else {
          console.log('no messages in complaint queue');
        }
      },
      reason => console.log('recieve command error', reason)
    );
  }

  /**
   * Get messages from the support SQS queue, send that message
   * to an admin and then delete the message from the queue
   */
  handleSqsSupportQueue() {
    const command = this.getSqsCommand(config.email.supportUrl!);

    sqsClient.send(command).then(
      value => {
        if(value.Messages) {
          const to: string = config.email.superAdminEmail!;
          const subject: string = 'Angular Template - Support request';

          for(let item of value.Messages) {
            const message = JSON.parse(item.Body || 'null');

            if(!message) {
              continue;
            }

            let content = JSON.parse(message.Message).content;

            if(!content) {
              if(item.ReceiptHandle) {
                this.deleteMessageFromSqs(config.email.supportUrl!, item.ReceiptHandle);
              }

              continue;
            }

            simpleParser(content, (err, parsed: ParsedMail) => {
              const body = stripHtml(parsed.text || 'no body value').result;
              const replyTo = parsed.from?.value[0].address || 'no reply to value';
              const submitter = parsed.from?.text || 'no from value';

              let email = fs.readFileSync(resolve(__dirname, './email-templates/support.html'), 'utf8');
              email = email
                .replace('##SUBMITTER##', submitter)
                .replace('##SUPPORT_MESSAGE##', body);

              this.sendEmail(to, subject, email, replyTo);

              if(item.ReceiptHandle) {
                this.deleteMessageFromSqs(config.email.supportUrl!, item.ReceiptHandle);
              }
            });
          }
        } else {
          console.log('no messages in support queue');
        }
      },
      reason => console.log('recieve command error', reason)
    );
  }

  /**
   * Delete message from an SQS queue
   */
  deleteMessageFromSqs(queue: string, receiptHandle: string) {
    const command = new DeleteMessageCommand({
      QueueUrl: queue,
      ReceiptHandle: receiptHandle
    });

    sqsClient.send(command).then(
      value => console.log('deleted message from queue'),
      reason => console.log('delete message command error', reason.Error.Message)
    );
  }
}

export default new AwsHelper();
