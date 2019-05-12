import { emailerConfig } from './../emailer.config';
import Sendgrid from "sendgrid";
import { Observable, Subject, from, of, interval } from "rxjs";
import { mergeMap, tap } from 'rxjs/operators';

const EMAIL_FLUSH_INTERVAL = 5000;

export class Mailer {

    static instance: Mailer;
    static getInstance() {
      if (!this.instance) {
        this.instance = new Mailer();
      }
      return this.instance;
    }

    private constructor() {
      interval(EMAIL_FLUSH_INTERVAL)
        .pipe(
          tap(() => this.flushQueue())
        ).subscribe()
    }

    emailQueue: Array<any> = [];
    processingQueue: Array<any> = [];

    private config = emailerConfig();

    _message = new Subject<string>();
    get message$(): Observable<string> { return this._message.asObservable(); }

    private sendgrid = Sendgrid(this.config.sendgridApiKey);

    sendMail(sendTo: Array<string>, subject: string, content: string, contentType?: string): void {
        contentType = contentType || "text/plain";
        const to = sendTo.map((email) => ({ email }));

        const sgReqOptions = {
            method: "POST" as "POST",
            path: "/v3/mail/send",
            body: {
              personalizations: [{
                to,
                subject
              }],
              from: { email: this.config.sendgridSender },
              content: [{
                type: contentType,
                value: content
              }]
            }
        };

        this._message.next(`Preparing to send email to ${sendTo}`);
        this.pushToQueue(sgReqOptions);
    }

    pushToQueue(sgReqOptions) {
      this._message.next(`Pushing to queue[${this.emailQueue.length}] (in queue: ${this.emailQueue.indexOf(sgReqOptions) > -1})`);
      this._message.next(sgReqOptions);
      this._message.next("Checking if unique...");
      if (this.isUnique(sgReqOptions)) {
        this._message.next("UNIQUE. ADDING TO QUEUE");
        this.emailQueue.push(sgReqOptions);
      }
    }

    flushQueue() {
      const N = this.emailQueue.length;
      if (N > 0) {
        this._message.next(`Flushing ${N} emails in queue`)
        this.emailQueue
          .map(reqOptions => this.process$(reqOptions))
          .reduce((pipeline, $) => pipeline.pipe(mergeMap(() => $)), of(null))
          .pipe(
            tap(() => this._message.next(`Flushed ${N} emails`))
          ).subscribe();
        this.emailQueue = [];
      }
    }

    process$(sgReqOptions): Observable<any> {
      const sgReq = this.sendgrid.emptyRequest(sgReqOptions);
      return from(this.sendgrid.API(sgReq));
    }

    private isUnique(sgReq) {
      return !!sgReq && !this.emailQueue.find(isReqInQueue(sgReq) );
    }
}

export interface Email {
    to: string;
    subject: string;
    content: Array<{ type: string, value: string}>
}

function isReqInQueue(reqCheck) {
  return req => {
    try {
      const to1 = req.body.personalizations[0].to[0].email;
      const to2 = reqCheck.body.personalizations[0].to[0].email;
      return to1 === to2;
    } catch(e) {
      console.log(e);
      return true;
    }
  }
}
