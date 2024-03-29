
import { Op } from "sequelize";
import {CommentsModel} from "../models/init-models.js";

export const getComments = async (req, res) => {
    try {
        const commentList = await CommentsModel.findAll({
            where: {
                post_id: req.params.postid
            }, 
            order: [ ['creation_date', 'DESC'] ]
        });
        res.json(commentList);
    } catch (error) {
        res.json({ message: error.message });
    }
}


export const createComment = async (req, res) => {
    try {
        req.body.creation_date = new Date();
        req.body.id = await CommentsModel.max("id") + 1;
        req.body.score = 0;
        req.body.content_license = "CC BY-SA 3.0";
        await CommentsModel.create( req.body );
        res.json({
            message: "Comment Created"
        });
    }
    catch (error) {
        res.json({ message: error.message });
    }
}

export const deleteComment = async (req, res) => {
    try {
        await CommentsModel.destroy( {
            where: {id: req.params.id}
        });
        res.json({
            message: "Comment Deleted"
        });
    }
    catch (error) {
        res.json({ message: error.message });
    }
}
