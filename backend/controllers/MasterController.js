import SaleOffProduct from '../models/SaleOffProduct';
import Customer from '../models/Customer';
import DeliveryStaff from '../models/DeliveryStaff';
import SaleStaff from '../models/SaleStaff';
import SaleOffStock from '../models/SaleOffStock';
import SaleOffOrder from '../models/SaleOffOrder';
import { error, success } from './common/http';
import moment from 'moment';
const { Op } = require("sequelize");

const MasterController = {
    index: async (req, res) => {
        try {
            const products = await SaleOffProduct.findAll({
                order: [['ProductCode', 'asc']]
            });

            const customers = await Customer.findAll({
                order: [['CustomerName', 'asc']]
            });

            const deliveryStaffs = await DeliveryStaff.findAll({
                order: [['DeliveryStaffName', 'asc']]
            });

            const saleStaffs = await SaleStaff.findAll({
                order: [['SaleStaffName', 'asc']],
                include: [{ 'association': 'customers' }],
            });

            const stocks = await SaleOffStock.findAll({
                order: [['ProductCode', 'asc']],
                include: [{ association: 'saleOffProduct' }],
            });

            const order_count = await SaleOffOrder.count({
                where: {
                    'OrderDate': moment().format('YYYY-MM-DD')
                }
            });

            return res.json(success({
                products      : products,
                customers     : customers,
                deliveryStaffs: deliveryStaffs,
                saleStaffs    : saleStaffs,
                stocks        : stocks,
                order_count   : order_count,
            }));
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },
};

export default MasterController;
