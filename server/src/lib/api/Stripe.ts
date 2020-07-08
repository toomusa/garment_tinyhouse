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
  disconnect: async (stripeUserId: string) => {
    const response = await client.oauth.deauthorize({
      client_id: `${process.env.S_CLIENT_ID}`,
      stripe_user_id: stripeUserId
    });

    return response;
  },
  getSecret: async (amount: number, stripeAccount: string) => {
    const paymentIntent = await client.paymentIntents.create({
      payment_method_types: ['card'],
      amount,
      currency: 'usd',
      application_fee_amount: Math.round(amount * 0.05),
      transfer_data: {
        destination: stripeAccount,
      },
    });
    return paymentIntent.client_secret;
  },
  charge: async (
    amount: number, 
    source: string, 
    stripeAccount: string
  ) => {
    const res = await client.charges.create({
      amount,
      source,
      currency: 'usd',
      application_fee_amount: Math.round(amount * 0.05),
    }, {
      stripe_account: stripeAccount
    });
    if (res.status !== "succeeded") {
      throw new Error("Failed to create charge with Stripe.")
    }
  },
}