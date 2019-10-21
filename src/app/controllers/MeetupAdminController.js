import * as Yup from 'yup';
import { parseISO, startOfHour, isBefore } from 'date-fns';
import File from '../models/File';
import Meetup from '../models/Meetup';
import User from '../models/User';

class MeetupAdminController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: {
        user_id: req.userId,
      },
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      image: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Invalid or missing fields' });
    }

    const { title, description, location, date, image } = req.body;

    const startDate = startOfHour(parseISO(date));

    if (isBefore(startDate, new Date())) {
      return res
        .status(400)
        .json({ error: "You can't create a meetup in the past" });
    }

    const [, , , , imagePath] = image.split('/');

    const imageExists = await File.findOne({ where: { path: imagePath } });

    if (!imageExists) {
      return res.status(400).json({ error: 'Image not found or uploaded' });
    }

    const meetup = await Meetup.create({
      title,
      description,
      location,
      date: startDate,
      image,
      user_id: req.userId,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      image: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Invalid fields' });
    }

    const meetup = await Meetup.findByPk(req.params.meetupId, {
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (!meetup) {
      return res.status(400).json({ error: 'Meetup not found' });
    }

    if (meetup.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: 'You do not have permission to edit this meetup' });
    }

    if (meetup.past) {
      return res.status(401).json({ error: "You can't edit a past meetup" });
    }

    const { date, image } = req.body;
    const startDate = startOfHour(parseISO(date));

    if (date) {
      if (isBefore(startDate, new Date())) {
        return res
          .status(400)
          .json({ error: "Ÿou can't create a meetup in the past" });
      }
    }

    if (image) {
      const [, , , , imagePath] = image.split('/');

      const imageExists = await File.findOne({ where: { path: imagePath } });

      if (!imageExists) {
        return res.status(400).json({ error: 'Image not found or uploaded' });
      }
    }

    if (req.body.user_id) {
      return res
        .status(401)
        .json({ error: "You can't transfer meetup ownership" });
    }

    const updatedMeetup = await meetup.update(req.body);

    return res.json(updatedMeetup);
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.meetupId, {
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (!meetup) {
      return res.status(400).json({ error: 'Meetup not found' });
    }

    if (meetup.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: "You don't have permission to delete this meetup" });
    }

    if (meetup.past) {
      return res.status(401).json({ error: "You can't delete a past meetup" });
    }

    await meetup.destroy();

    return res.json({ deleted: true });
  }
}

export default new MeetupAdminController();
