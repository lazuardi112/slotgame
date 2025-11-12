const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: '/tmp/database.sqlite'
});

const User = sequelize.define('User', {
  deviceId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  credits: {
    type: DataTypes.INTEGER,
    defaultValue: 10000
  },
  rtp_percentage: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

const GlobalSettings = sequelize.define('GlobalSettings', {
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = {
  sequelize,
  User,
  GlobalSettings
};
