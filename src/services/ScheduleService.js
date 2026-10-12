import { API_BASE_URL } from '../config/constant'
import axios from 'axios';

const REST_API_BASE_URL = API_BASE_URL + 'schedules';

export const getAllSchedules = () => axios.get(REST_API_BASE_URL);

export const createSchedule = (schedule) => axios.post(REST_API_BASE_URL, schedule);

export const getScheduleById = (scheduleId) => axios.get(REST_API_BASE_URL + '/' + scheduleId);

export const updateSchedule = (scheduleId, schedule) => axios.put(REST_API_BASE_URL + '/' + scheduleId, schedule);

export const deleteSchedule = (scheduleId) => axios.delete(REST_API_BASE_URL + '/' + scheduleId);