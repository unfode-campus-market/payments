import {PaymentCreatedEvent, Publisher, Subjects} from "@campus-market/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}