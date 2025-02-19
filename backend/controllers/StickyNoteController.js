import StickyNote from '../models/StickyNote';
import { error, success } from './common/http';
import { t } from '../../src/renderer/i18n'
import { helper } from '../../src/renderer/helper'
import sequelize from '../models/index';
const xlsx = require('xlsx');
const { Op } = require("sequelize");
const Joi = require('joi');

const StickyNoteController = {

    index: async (req, res) => {
        try {
            console.log(req.query)

            /**
             * set condition
             */
            const where = {}

            /**
             * order
             */

            /**
             * call select action
             */

            let notes = []
            notes = await StickyNote.findAll({
                order: [['createdAt', 'desc']],
            });

            return res.json(success(notes));
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },

    store: async function (req, res) {
        const transaction = await sequelize.transaction();
        try {
            const { title, text, x, y, width, height, color, zIndex } = req.body;

            /**
             * validation
             */
            // StickyNote
            const stickyNoteSchema = Joi.object({
                title : Joi.string().required().max(200),
                text  : Joi.string().allow(null, ''),
                x     : Joi.number().required().min(0),
                y     : Joi.number().required().min(0),
                width : Joi.number().required().min(0),
                height: Joi.number().required().min(0),
                color : Joi.string().required().max(200),
                zIndex: Joi.number().required().min(1),
            }).unknown()

            let validation = stickyNoteSchema.validate({
                title : title,
                text  : text,
                x     : x,
                y     : y,
                width : width,
                height: height,
                color : color,
                zIndex: zIndex,
            });
            if (validation.error) {
                throw new Error(validation.error.details[0].message);
            }

            /**
             * call create action
             */
            await StickyNote.create({
                title : title,
                text  : text,
                x     : x,
                y     : y,
                width : width,
                height: height,
                color : color,
                zIndex: zIndex,
            }, {transaction: transaction})

            await transaction.commit();
            return res.json(success());
        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },

    update: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            console.log(req.body)
            const { id, title, text, x, y, width, height, color, zIndex } = req.body;

            /**
             * validation
             */
            // StickyNote
            const stickyNoteSchema = Joi.object({
                title : Joi.string().required().max(200),
                text  : Joi.string().allow(null, ''),
                x     : Joi.number().required().min(0),
                y     : Joi.number().required().min(0),
                width : Joi.number().required().min(0),
                height: Joi.number().required().min(0),
                color : Joi.string().required().max(200),
                zIndex: Joi.number().required().min(1),
            }).unknown()

            let validation = stickyNoteSchema.validate({
                title : title,
                text  : text,
                x     : x,
                y     : y,
                width : width,
                height: height,
                color : color,
                zIndex: zIndex,
            });
            if (validation.error) {
                throw new Error(validation.error.details[0].message);
            }

            /**
             * check exists code
             */
            const existsStickyNote = await StickyNote.findOne({
                where: {
                    id: id
                },
            }, { transaction: transaction })
            if (!existsStickyNote) {
                throw new Error('Note không tồn tại.')
            }

            

            /**
             * call create action
             */
            existsStickyNote.title  = title
            existsStickyNote.text   = text
            existsStickyNote.x      = x
            existsStickyNote.y      = y
            existsStickyNote.width  = width
            existsStickyNote.height = height
            existsStickyNote.color  = color
            existsStickyNote.zIndex = zIndex
            
            await existsStickyNote.save({ transaction: transaction })

            await transaction.commit();
            return res.json(success(existsStickyNote));
        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },

    async: async (req, res) => {
        console.log("Sync ticky notes.")
        const transaction = await sequelize.transaction();
        try {
            const { notes } = req.body;
            console.log(notes)

            for (const i in notes) {
                let note = notes[i]

                const schema = Joi.object({
                    id    : Joi.string().required().max(200),
                    title : Joi.string().required().max(200),
                    text  : Joi.string().allow(null, ''),
                    x     : Joi.number().required().min(0),
                    y     : Joi.number().required().min(0),
                    width : Joi.number().required().min(0),
                    height: Joi.number().required().min(0),
                    color : Joi.string().required().max(200),
                    zIndex: Joi.number().required().min(1),
                }).unknown()

                let validation = schema.validate({
                    id    : note.title,
                    title : note.title,
                    text  : note.text,
                    x     : note.x,
                    y     : note.y,
                    width : note.width,
                    height: note.height,
                    color : note.color,
                    zIndex: note.zIndex,
                });
                if (validation.error) {
                    continue;
                }

                await StickyNote.upsert({
                    id    : note.id,
                    title : note.title,
                    text  : note.text,
                    x     : note.x,
                    y     : note.y,
                    width : note.width,
                    height: note.height,
                    color : note.color,
                    zIndex: note.zIndex,
                }, {
                    transaction: transaction,
                    conflictFields: ['id']
                });
            }
            await transaction.commit();

            let data = []
            data = await StickyNote.findAll({
                order: [['createdAt', 'desc']],
            });

            return res.json(success(data));

        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    }
};

export default StickyNoteController;
