import { API_BASE_URL } from '../config/constant'
import axios from 'axios';

const REST_API_BASE_URL = API_BASE_URL + 'typeEvents';

export const getAllTypeEvents = () => axios.get(REST_API_BASE_URL);

export const createTypeEvent = (typeEvent) => axios.post(REST_API_BASE_URL, typeEvent);

export const getTypeEventById = (typeEventId) => axios.get(REST_API_BASE_URL + '/' + typeEventId);

export const updateTypeEvent = (typeEventId, typeEvent) => axios.put(REST_API_BASE_URL + '/' + typeEventId, typeEvent);

export const deleteTypeEvent = (typeEventId) => axios.delete(REST_API_BASE_URL + '/' + typeEventId);