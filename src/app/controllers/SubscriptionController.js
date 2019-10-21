import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';
import Queue from '../../lib/Queue';
import NewSubscriptionMail from '../jobs/NewSubscriptionMail';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        subscriber_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          order: ['date'],
          attributes: [
            'id',
            'title',
            'description',
            'date',
            'location',
            'image',
            'past',
          ],
        },
      ],
    });

    // Creates array with future meetups

    const meetups = subscriptions.map(s => {
      if (!s.meetup.past) {
        return s.meetup;
      }

      return null;
    });

    // Removes null values from array

    return res.json(meetups.filter(m => m));
  }

  async store(req, res) {
    const meetup = await Meetup.findByPk(req.params.meetupId, {
      include: [
        {
          model: Subscription,
          as: 'subscribers',
        },
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!meetup) {
      return res.status(400).json({ error: 'Meetup not found' });
    }

    if (meetup.user_id === req.userId) {
      return res
        .status(401)
        .json({ error: "You can't subscribe to your own meetup" });
    }

    if (meetup.past) {
      return res
        .status(401)
        .json({ error: "You can't subscribe to a past meetup" });
    }

    const isSubscriber = await Subscription.findOne({
      where: {
        subscriber_id: req.userId,
        meetup_id: meetup.id,
      },
    });

    if (isSubscriber) {
      return res
        .status(401)
        .json({ error: 'You already are subscribed for this meetup' });
    }

    // Checks if user has another meetup at the same time

    const sameTimeMeetup = await Subscription.findOne({
      where: {
        subscriber_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          attributes: ['title', 'description', 'location', 'image'],
          where: { date: meetup.date },
        },
      ],
    });

    if (sameTimeMeetup) {
      return res
        .status(401)
        .json({ error: 'You already have another meetup at the same time' });
    }

    const subscription = await Subscription.create({
      subscriber_id: req.userId,
      meetup_id: meetup.id,
    });

    const subscriber = await subscription.getSubscriber();

    Queue.add(NewSubscriptionMail.key, { meetup, subscriber });

    return res.json({ subscription, meetup });
  }
}

export default new SubscriptionController();
