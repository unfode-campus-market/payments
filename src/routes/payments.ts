import express, {Request, Response} from "express";
import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest
} from "@campus-market/common";
import {body} from "express-validator";
import {Order} from "../models/order";
import {stripe} from "../stripe";
import {Payment} from "../models/payment";
import {PaymentCreatedPublisher} from "../events/publishers/payment-created-publisher";
import {natsWrapper} from "../nats-wrapper";

const router = express.Router();

router.post(
  '/',
  requireAuth,
  [
    body('token').not().isEmpty(),
    body('orderId').not().isEmpty()
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const {token, orderId} = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("order has been cancelled");
    }

    const charge = await stripe.charges.create({
      amount: order.price * 100,
      currency: 'usd',
      source: token,
      description: 'My First Test Charge (created for API docs at https://www.stripe.com/docs/api)',
    });

    const payment = Payment.build({
      orderId: orderId,
      stripeId: charge.id
    });

    await payment.save();

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId
    });

    res.status(201).send({id: payment.id});
  }
);

export {router as paymentsRouter};