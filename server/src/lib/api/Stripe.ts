import stripe from "stripe";

const client = new stripe(`${process.env.S_SECRET_KEY}`, {
  apiVersion: '2020-03-02',
});

export const Stripe = {
  connect: async (code: string) => {
    const response = await client.oauth.token({ 
      grant_type: "authorization_code",
      code,
    });

    return response;
  },
  charge: async (
    amount: number, 
    source: string, 
    stripeAccount: string
  ) => {
    const res = await client.paymentIntents.create({
      // payment_method_types: ['card'],
      // source,
      amount,
      payment_method: source,
      currency: 'usd',
      application_fee_amount: Math.round(amount * 0.05),
    }, {
      stripeAccount
    });

    if (res.status !== "succeeded") {
      throw new Error("Failed to create charge with Stripe.")
    }
  },
}