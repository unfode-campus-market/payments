import mongoose from "mongoose";

interface PaymentAttributes {
  orderId: string;
  stripeId: string;
}

interface PaymentDocument extends mongoose.Document {
  orderId: string;
  stripeId: string;
}

interface PaymentModel extends mongoose.Model<PaymentDocument> {
  build(attributes: PaymentAttributes): PaymentDocument;
}

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      required: true,
      type: String
    },
    stripeId: {
      required: true,
      type: String
    }
  },
  {
    toJSON: {
      versionKey: false,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      }
    }
  }
);

paymentSchema.statics.build = (attributes: PaymentAttributes) => {
  return new Payment(attributes);
};

const Payment = mongoose.model<PaymentDocument, PaymentModel>(
  'Payment',
  paymentSchema
);

export {Payment};