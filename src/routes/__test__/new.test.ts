import request from 'supertest';
import mongoose from "mongoose";
import {app} from "../../app";
import {Order} from "../../models/order";
import {OrderStatus} from "@campus-market/common";

jest.mock('../../stripe');

it("should return a 404 when paying for an order that doesn't exist", async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup())
    .send({
      token: 'lsdfjsd',
      orderId: new mongoose.Types.ObjectId().toHexString()
    })
    .expect(404);
});

it("should return a 401 when paying for an order that doesn't belong to the user", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 100,
    status: OrderStatus.Created
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup())
    .send({
      token: 'lsdfjsd',
      orderId: order.id
    })
    .expect(401);
});

it("should return a 400 when paying for a cancelled order", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: userId,
    version: 0,
    price: 100,
    status: OrderStatus.Cancelled
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup(userId))
    .send({
      token: 'lsdfjsd',
      orderId: order.id
    })
    .expect(400);
});

// it('should return a 201 with valid inputs', async () => {
//   const userId = new mongoose.Types.ObjectId().toHexString();
//
//   const orderPrice = 100;
//   const order = Order.build({
//     id: new mongoose.Types.ObjectId().toHexString(),
//     userId: userId,
//     version: 0,
//     price: orderPrice,
//     status: OrderStatus.Created
//   });
//   await order.save();
//
//   const stripeToken = 'tok_visa';
//   await request(app)
//     .post('/api/payments')
//     .set('Cookie', global.signup(userId))
//     .send({
//       token: stripeToken,
//       orderId: order.id
//     })
//     .expect(201);
//
//   const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
//   expect(chargeOptions.source).toEqual(stripeToken);
//   expect(chargeOptions.amount).toEqual(orderPrice * 100);
//   expect(chargeOptions.currency).toEqual('usd');
// });