import { Op } from 'sequelize';
import { startOfDay, endOfDay, setHours, setSeconds, parseISO } from 'date-fns';
import Meetup from '../models/Meetup';
import User from '../models/User';

class MeetupController {
  async index(req, res) {
    const { date, page = 1 } = req.query;

    const searchDate = setSeconds(setHours(parseISO(date), 0), 0);

    if (!date) {
      return res.status(400).json({ error: 'Invalid or missing date' });
    }

    const meetups = await Meetup.findAll({
      where: {
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
      order: ['date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['name', 'email'],
        },
      ],
    });

    return res.json(meetups);
  }
}

export default new MeetupController();
