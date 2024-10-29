import asyncHandler from 'express-async-handler'
import TaskModel from '../models/tasks/taskModel.js'

export const createTask = asyncHandler(async (req, res) => {
    try {
        const { title, description, dueDate, priority, status } = req.body
        if (!title || title.trim === "") {
            res.status(400).send({ success: false, message: "title is required" })
        }
        if (!description || description.trim === "") {
            res.status(400).send({ success: false, message: "description is required" })
        }
        const task = new TaskModel({
            title,
            description,
            dueDate,
            priority,
            status,
            user: req.user._id,
        })
        await task.save()
        res.status(201).json(task);
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: "internal server error" })


    }
})


export const getTasks = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        if (!userId) {
            res.status(400).send({ success: false, message: "user not found" })
        }

        const tasks = await TaskModel.find({ user: userId })

        res.status(200).send({ length: tasks.length, tasks, });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: "internal server error" })

    }
})



export const getTask = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        if (!id) {
            res.status(400).send({ message: "provide task is" })
        }

        const task = await TaskModel.findById(id)
        if (!task) {
            res.status(400).send({ message: "task not found" })
        }
        if (!task.user.equals(userId)) {
            res.status(401).send({ message: "not authorized to view task" })
        }
        res.status(200).send(task)
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: "internal server error" })

    }
})


export const updateTask = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const { title, description, dueDate, priority, status, completed } = req.body;

        if (!id) {
            res.status(400).send({ success: false, message: "provide task id" })
        }
        const task = await TaskModel.findById(id);
        if (!task) {
            res.status(404).send({ message: "task not found" })
        }

        if (!task.user.equals(userId)) {
            res.status(401).send({ message: "not authorized " })
        }

        task.title = title || task.title;
        task.description = description || task.description;
        task.dueDate = dueDate || task.dueDate;
        task.priority = priority || task.priority;
        task.status = status || task.status;
        task.completed = completed || task.completed;

        await task.save();
        res.status(200).send(task)


    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: "internal server error" })

    }
})


export const deleteTask = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const task = await TaskModel.findById(id);

        if (!task) {
            res.status(200).send({ message: "task not found" })
        }

        if (!task.user.equals(userId)) {
            res.status(401).send({ message: "not authorized " })
        }
        await TaskModel.findByIdAndDelete(id);

        return res.status(200).send({ message: "task deleted " })

    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: "internal server error" })

    }
})