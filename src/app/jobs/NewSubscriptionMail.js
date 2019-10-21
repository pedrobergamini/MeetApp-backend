import { parseISO, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class NewSubscriptionMail {
  get key() {
    return 'NewSubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, subscriber } = data;

    await Mail.sendMail({
      to: `${meetup.organizer.name}, <${meetup.organizer.email}>`,
      subject: 'Novo Inscrito em seu Meetup!',
      template: 'newsubscription',
      context: {
        meetup: meetup.title,
        organizer: meetup.organizer,
        subsNumber: meetup.subscribers.length + 1,
        date: format(parseISO(meetup.date), "dd 'de' MMMM', às' H:mm'h'", {
          locale: pt,
        }),
        subscriber: subscriber.name,
        subscriberEmail: subscriber.email,
      },
    });
  }
}

export default new NewSubscriptionMail();
