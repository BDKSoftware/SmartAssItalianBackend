"use strict";
const stripe = require("stripe")(
  "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"
);

/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async create(ctx) {
    const { products, userName, email } = ctx.request.body;
    try {
      // retrieve item information
      const lineItems = await Promise.all(
        products.map(async (product) => {
          const item = await strapi
            .service("api::item.item")
            .findOne(product.id);

          return {
            price_data: {
              currency: "usd",
              product_data: {
                name: item.name,
              },
              unit_amount: item.price * 100,
            },
            quantity: product.count,
          };
        })
      );

      // create a stripe session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: email,
        mode: "payment",
        success_url:
          "https://smart-ass-italian-frontend.vercel.app/checkout/success", //Change to your client url
        cancel_url: "https://smart-ass-italian-frontend.vercel.app/", //Change to client url
        line_items: lineItems,
        shipping_address_collection: {
          allowed_countries: ["US"],
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: {
                amount: 1000,
                currency: "usd",
              },
              display_name: "Free shipping",
              delivery_estimate: {
                minimum: {
                  unit: "business_day",
                  value: 5,
                },
                maximum: {
                  unit: "business_day",
                  value: 7,
                },
              },
            },
          },
        ],
      });

      // create the item
      await strapi
        .service("api::order.order")
        .create({ data: { userName, products, stripeSessionId: session.id } });

      // return the session id
      console.log(session);
      return { id: session.id };
    } catch (error) {
      ctx.response.status = 500;
      console.log(error);
      return { error: { message: "There was a problem creating the charge" } };
    }
  },
}));
