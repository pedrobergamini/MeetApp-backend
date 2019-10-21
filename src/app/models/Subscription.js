import Sequelize, { Model } from 'sequelize';

class Subscription extends Model {
  static init(sequelize) {
    super.init(
      {
        subscriber_id: Sequelize.INTEGER,
        meetup_id: Sequelize.INTEGER,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Meetup, { foreignKey: 'meetup_id', as: 'meetup' });
    this.belongsTo(models.User, {
      foreignKey: 'subscriber_id',
      as: 'subscriber',
    });
  }
}

export default Subscription;
