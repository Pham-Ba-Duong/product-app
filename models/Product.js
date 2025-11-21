const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');


class Product extends Model { }


Product.init({
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    description: { type: DataTypes.TEXT, allowNull: true }
}, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
    indexes: [
        { name: 'idx_product_name', fields: ['name'] }
    ]
});


module.exports = Product;