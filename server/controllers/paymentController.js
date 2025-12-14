const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

// @desc    Create subscription checkout session
// @route   POST /api/payments/create-subscription
// @access  Private
exports.createSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user._id.toString(),
        },
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'huf',
            product_data: {
              name: 'Premium Membership',
              description: 'Unlimited AI Chatbot Usage',
            },
            unit_amount: 100000, // 1000 HUF per month (amount in cents/smallest currency unit)
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      metadata: {
        userId: user._id.toString(),
      },
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Verify payment and activate subscription
// @route   POST /api/payments/verify-subscription
// @access  Private
exports.verifySubscription = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const user = await User.findById(req.user.id);
      
      user.isPremium = true;
      user.stripeSubscriptionId = session.subscription;
      
      // Set subscription start date if not already set
      if (!user.subscriptionStartDate) {
        user.subscriptionStartDate = new Date();
      }
      
      // Set subscription end date to 1 month from now
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      user.subscriptionEndDate = endDate;

      await user.save();

      res.json({
        success: true,
        message: 'Premium subscription activated',
        data: user,
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment not completed',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Reactivate subscription
// @route   POST /api/payments/reactivate-subscription
// @access  Private
exports.reactivateSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'No subscription found to reactivate',
      });
    }

    // Remove cancel_at_period_end flag to resume subscription
    const subscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      { cancel_at_period_end: false }
    );

    await user.save();

    res.json({
      success: true,
      message: 'Subscription reactivated successfully',
      nextBillingDate: new Date(subscription.current_period_end * 1000),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Cancel subscription
// @route   POST /api/payments/cancel-subscription
// @access  Private
exports.cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'No active subscription found',
      });
    }

    // Cancel at period end instead of immediately
    const subscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    // Keep isPremium true until the period ends
    // The webhook will handle setting isPremium to false when subscription actually ends

    await user.save();

    res.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
      cancelAt: new Date(subscription.current_period_end * 1000),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get subscription status
// @route   GET /api/payments/subscription-status
// @access  Private
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.stripeSubscriptionId) {
      return res.json({
        success: true,
        data: {
          isPremium: false,
          status: 'inactive',
        },
      });
    }

    const subscription = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId
    );

    res.json({
      success: true,
      data: {
        isPremium: user.isPremium,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        subscriptionStartDate: user.subscriptionStartDate,
        cancelAt: subscription.cancel_at_period_end ? new Date(subscription.current_period_end * 1000) : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Handle Stripe webhooks
// @route   POST /api/payments/webhook
// @access  Public
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      await User.findOneAndUpdate(
        { stripeSubscriptionId: subscription.id },
        {
          isPremium: false,
          stripeSubscriptionId: null,
          subscriptionEndDate: null,
        }
      );
      break;

    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object;
      if (updatedSubscription.status === 'active') {
        await User.findOneAndUpdate(
          { stripeSubscriptionId: updatedSubscription.id },
          {
            isPremium: true,
          }
        );
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
